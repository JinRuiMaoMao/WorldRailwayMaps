import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { officialLineColor } from './data/officialLineColors.js';
import {
  applyStationCoords,
  SAME_PLATFORM_DEG,
  setStationOverride,
  setPathOverride,
  clearStationOverride,
  clearPathOverride,
  clearAllEdits,
  loadEdits,
  exportEditsJson,
  resolveSegPath,
  simplifyPath,
  PHASE1_CHILD_IDS,
  PHASE1_MASTER_ID,
  extraStationsFor,
  addExtraStation,
  removeExtraStation,
  extraLinesList,
  upsertExtraLine,
  removeExtraLine,
  getPathOverride,
} from './data/mapEdits.js';
import { growDurationSec } from './exportVideo.js';
import { warmupTile } from './tileCache.js';
import { thinPath } from './data/osmUtil.js';
import { spansFromKind, kindFromNamedSpans, mapKindToPath } from './data/guideway.js';
import { classifyTransitMode, classifyTransitBucket, TRANSIT_BUCKET_LABEL } from './data/transitMode.js';
import { PLACES } from './data/network.js';
import { worldCityById } from './data/worldCatalog.js';

/**
 * Leaflet 街道底图 + 线路/站名图层
 * 暂停时可编辑站点/线位点（交互参考 Rail Map Painter：选中、拖拽、详情）
 */
export function createLeafletView(container) {
  const map = L.map(container, {
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
    fadeAnimation: false,
    zoomAnimation: false,
    markerZoomAnimation: false,
  });

  // 线路共用一块 Canvas：缩放时可整体冻结重绘；站标另用 markerPane
  let dotRenderer = null;
  let lineRenderer = null;
  let mapZoomFrozen = false;
  let zoomThawTimer = 0;

  function getDotRenderer() {
    if (!dotRenderer) {
      dotRenderer = L.canvas({ padding: 0.12, tolerance: 0, pane: 'markerPane' });
    }
    return dotRenderer;
  }

  function getLineRenderer() {
    if (!lineRenderer) {
      lineRenderer = L.canvas({ padding: 0.45, pane: 'overlayPane' });
      const rawUpdate = lineRenderer._update.bind(lineRenderer);
      lineRenderer._update = function updateLineCanvas() {
        if (mapZoomFrozen) return;
        return rawUpdate();
      };
    }
    return lineRenderer;
  }

  function lineStyle(extra = {}) {
    const { renderer: _r, ...rest } = extra;
    return {
      interactive: false,
      bubblingMouseEvents: false,
      lineCap: rest.lineCap || 'round',
      lineJoin: 'round',
      ...rest,
      renderer: getLineRenderer(),
    };
  }

  function thinLatLngs(ll, minM) {
    if (!minM || !ll?.length || ll.length < 3) return ll;
    if (Array.isArray(ll[0]?.[0])) return ll.map((ring) => thinLatLngs(ring, minM));
    const out = [ll[0]];
    for (let i = 1; i < ll.length - 1; i++) {
      const p = out[out.length - 1];
      const c = ll[i];
      if (Math.hypot((c[0] - p[0]) * 111000, (c[1] - p[1]) * 85000) >= minM) out.push(c);
    }
    out.push(ll[ll.length - 1]);
    return out.length >= 2 ? out : ll;
  }

  function drawLatLngsFor(rec, { bus = false } = {}) {
    const src = rec.drawLatLngs || rec.latlngs;
    if (!busFullLoad && !railFullLoad) return src;
    const z = map.getZoom();
    const minM = z < 6 ? 420 : z < 8 ? 220 : z < 10 ? 110 : bus ? 55 : 40;
    return thinLatLngs(src, minM);
  }

  // 同源 OSM 代理：浏览和导出都能画进 canvas；外网回退 Esri 浅色底
  const localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  let baseLayer = L.tileLayer(
    localHost
      ? `${location.origin}/export-tiles/{z}/{x}/{y}.png`
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 19,
      maxNativeZoom: 19,
      crossOrigin: true,
      subdomains: 'abcd',
      keepBuffer: 8,
      updateWhenIdle: false,
      updateWhenZooming: false,
      updateInterval: 0,
      attribution: localHost
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
    }
  ).addTo(map);

  /** 离线导出：用可画进 canvas 的同源 OSM 代理；无代理时用 Esri 浅色底（不走 Carto，避免 API key 缺失） */
  let exportFast = false;
  let persistTiles = false;
  let exportFrameDt = 1 / 30;
  let lastTileWaitKey = '';
  const pruneTiles = baseLayer._pruneTiles.bind(baseLayer);
  const removeTilesAtZoom = baseLayer._removeTilesAtZoom.bind(baseLayer);
  baseLayer._pruneTiles = function () {
    if (persistTiles) return;
    return pruneTiles();
  };
  baseLayer._removeTilesAtZoom = function (zoom) {
    if (persistTiles) return;
    return removeTilesAtZoom(zoom);
  };
  baseLayer._fadeAnimated = false;

  function setExportFrameRate(fps) {
    exportFrameDt = 1 / Math.max(1, Number(fps) || 30);
  }

  function exportTick() {
    // 切后台时 rAF 会停；用定时器才能继续编
    return new Promise((r) => setTimeout(r, 0));
  }

  async function waitExportFrame() {
    await exportTick();
    if (persistTiles) {
      const c = map.getCenter();
      const z = map.getZoom();
      const key = `${c.lat.toFixed(2)},${c.lng.toFixed(2)},${Math.round(z)}`;
      const moved = key !== lastTileWaitKey;
      lastTileWaitKey = key;
      if (moved) baseLayer?._update?.();
      const hidden = typeof document !== 'undefined' && document.hidden;
      await waitForTiles(moved ? (hidden ? 1200 : 8000) : hidden ? 80 : 400);
    }
    await exportTick();
  }

  function liveOsmLayer() {
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      maxNativeZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
  }

  function exportTileLayer() {
    const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const url = local
      ? `${location.origin}/export-tiles/{z}/{x}/{y}.png`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    return L.tileLayer(url, {
      maxZoom: 19,
      maxNativeZoom: 16,
      crossOrigin: true,
      keepBuffer: 14,
      updateWhenIdle: false,
      updateWhenZooming: false,
      attribution: local ? '&copy; OpenStreetMap' : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
    });
  }

  function tilesStillLoading() {
    if (!baseLayer) return false;
    if (baseLayer._loading) return true;
    const tiles = baseLayer._tiles;
    if (tiles && Object.values(tiles).some((t) => t && !t.loaded)) return true;
    const imgs = container.querySelectorAll('.leaflet-tile-pane img.leaflet-tile:not(.leaflet-tile-error)');
    for (const img of imgs) {
      if (!img.complete || !img.naturalWidth) return true;
    }
    return false;
  }

  function waitForTiles(timeoutMs = 12000) {
    return new Promise((resolve) => {
      if (!baseLayer) {
        resolve(false);
        return;
      }
      const start = performance.now();
      const tick = () => {
        if (!tilesStillLoading()) {
          resolve(true);
          return;
        }
        if (performance.now() - start >= timeoutMs) {
          resolve(false);
          return;
        }
        setTimeout(tick, 40);
      };
      tick();
    });
  }

  async function setExportBasemap(on) {
    exportFast = !!on;
    persistTiles = !!on;
    container.classList.remove('export-fast');
    map.options.fadeAnimation = false;
    map.options.zoomAnimation = false;
    if (baseLayer) {
      baseLayer._fadeAnimated = false;
      baseLayer.options.keepBuffer = on ? 80 : 2;
      baseLayer.options.updateWhenZooming = false;
      baseLayer.options.updateWhenIdle = false;
      baseLayer.options.updateInterval = 0;
    }
    map.invalidateSize({ pan: false });
    lastTileWaitKey = '';
    if (on) {
      baseLayer?._update?.();
      await waitForTiles(8000);
    } else {
      pruneTiles();
    }
  }

  function tilesForView(lat, lng, zoom, pad = 1.2) {
    const z = Math.round(Math.min(14, Math.max(3, Number(zoom) || 6)));
    const size = map.getSize();
    const center = map.project([lat, lng], z);
    const hw = (Math.max(size.x, 320) * pad) / 2;
    const hh = (Math.max(size.y, 240) * pad) / 2;
    return tilesForPixelBox(center, hw, hh, z);
  }

  function tilesForBounds(south, west, north, east, zoom) {
    const z = Math.round(Math.min(14, Math.max(3, Number(zoom) || 6)));
    const nw = map.project([north, west], z);
    const se = map.project([south, east], z);
    const pad = 256;
    const minX = Math.min(nw.x, se.x) - pad;
    const maxX = Math.max(nw.x, se.x) + pad;
    const minY = Math.min(nw.y, se.y) - pad;
    const maxY = Math.max(nw.y, se.y) + pad;
    const center = L.point((minX + maxX) / 2, (minY + maxY) / 2);
    return tilesForPixelBox(center, (maxX - minX) / 2, (maxY - minY) / 2, z);
  }

  function tilesForPixelBox(center, hw, hh, z) {
    const max = 2 ** z;
    const x0 = Math.floor((center.x - hw) / 256);
    const x1 = Math.floor((center.x + hw) / 256);
    const y0 = Math.floor((center.y - hh) / 256);
    const y1 = Math.floor((center.y + hh) / 256);
    const out = [];
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        if (y < 0 || y >= max) continue;
        const xx = ((x % max) + max) % max;
        out.push({ z, x: xx, y });
      }
    }
    return out;
  }

  function loadTileImage(url) {
    return warmupTile(url);
  }

  function clampPrefetchZoom(zoom) {
    return Math.round(Math.min(12, Math.max(4, Number(zoom) || 8)));
  }

  /** 只预载本段镜头/沿线会用到的瓦片；全国铺底和超高缩放不再拉 */
  async function prefetchExportTiles(sceneList, { onProgress, shouldAbort } = {}) {
    if (!baseLayer || !sceneList?.length) return 0;
    const keys = new Set();
    const add = (tiles) => {
      for (const t of tiles) keys.add(`${t.z}/${t.x}/${t.y}`);
    };
    add(tilesForView(35.5, 105, 4, 1.15));

    for (const sc of sceneList) {
      if (shouldAbort?.()) return 0;
      if (sc.focus) add(tilesForView(sc.focus.lat, sc.focus.lng, clampPrefetchZoom(sc.focus.zoom ?? 8)));
      if (sc.camStart) add(tilesForView(sc.camStart.lat, sc.camStart.lng, clampPrefetchZoom(sc.camStart.zoom ?? 11)));
      if (sc.camEnd) add(tilesForView(sc.camEnd.lat, sc.camEnd.lng, clampPrefetchZoom(sc.camEnd.zoom ?? sc.camStart?.zoom ?? 11)));
      const look = longRailLook(sc);
      if (look) add(tilesForView(look.lat, look.lng, clampPrefetchZoom(look.zoom)));
      const path = sceneLinePath(sc);
      if (path.length >= 2) {
        const z = clampPrefetchZoom(look?.zoom ?? sc.focus?.zoom ?? 10);
        const step = Math.max(1, Math.ceil(path.length / 8));
        for (let i = 0; i < path.length; i += step) {
          add(tilesForView(path[i][0], path[i][1], z, 1.02));
        }
      }
      if (sc.focusStations?.length >= 2) {
        let south = 90;
        let north = -90;
        let west = 180;
        let east = -180;
        for (const s of sc.focusStations) {
          if (s.lat < south) south = s.lat;
          if (s.lat > north) north = s.lat;
          if (s.lng < west) west = s.lng;
          if (s.lng > east) east = s.lng;
        }
        add(tilesForBounds(south, west, north, east, clampPrefetchZoom(sc.focusZoom ?? 10)));
      }
    }

    let list = [...keys];
    const cap = Math.min(360, 90 + sceneList.length * 24);
    if (list.length > cap) {
      list.sort((a, b) => Number(a.split('/')[0]) - Number(b.split('/')[0]));
      list = list.slice(0, cap);
    }
    const total = list.length;
    onProgress?.(0, total);
    let cursor = 0;
    let done = 0;
    const worker = async () => {
      while (cursor < list.length) {
        if (shouldAbort?.()) return;
        const idx = cursor;
        cursor += 1;
        const [z, x, y] = list[idx].split('/').map(Number);
        const url = baseLayer.getTileUrl({ x, y, z });
        await loadTileImage(url);
        done += 1;
        if (done === total || done % 32 === 0) onProgress?.(done, total);
      }
    };
    await Promise.all(Array.from({ length: 24 }, () => worker()));
    onProgress?.(total, total);
    return total;
  }

  map.setView([35.5, 105], 4);

  const root = L.layerGroup().addTo(map);
  const editRoot = L.layerGroup().addTo(map);
  const renameRoot = L.layerGroup().addTo(map);
  const segments = new Map(); // id -> { line, labelLayer, group, seg, latlngs, stations }
  const growing = new Map(); // id -> { seg, latlngs, stations } 伸展中的半成品，供 HUD 实时统计
  /** 站名文字全局去重：name → 占用该站名的 segId（多段合并时只留一个站名） */
  const labelClaims = new Map();
  /** 低于此缩放：隐藏站名，只保留站位小圆点（全国/区域总览） */
  const NAME_MIN_ZOOM = 11;
  /** 再矮一档：连圆点也不建（全国总览几千个 DOM 站标会卡死） */
  const DOT_MIN_ZOOM = 10;
  let growCancel = false;
  let renameTimer = null;
  let editEnabled = false;
  let editTool = 'select'; // select | station | vertex | add-station | draw | new-line
  let selected = null; // { type, segId, index?, name? }
  let onEditChange = null;
  let onHudTick = null;
  let editSceneYear = 1988;
  let editSceneDate = '1988-09-18';
  let stampCityId = null;
  /** 可叠加：地铁 / 高铁 / 公交 */
  let modeFilters = new Set(['metro']);
  const modeAllows = (m) => !modeFilters.size || modeFilters.has(m);
  const primaryMode = () =>
    (modeFilters.has('bus') && 'bus') ||
    (modeFilters.has('hsr') && 'hsr') ||
    (modeFilters.has('metro') && 'metro') ||
    '';
  let focusLineNames = new Set();
  let onLinePick = null;
  let onViewportChange = null;
  const BUS_MIN_ZOOM = 9;
  const BUS_LAYER_BUDGET = 1100;
  const BUS_FULL_MIN_ZOOM = 5.2;
  const BUS_FULL_LAYER_BUDGET = 9000;
  const RAIL_LAYER_BUDGET = 2800;
  const RAIL_FULL_LAYER_BUDGET = 6000;
  let busFullLoad = false;
  let railFullLoad = false;
  const busIndex = new Map();
  const busLayers = new Map();
  const busRoot = L.layerGroup().addTo(map);
  const busEndLayer = L.layerGroup();
  let busSyncTimer = null;
  let busPaintToken = 0;
  const railIndex = new Map();
  const railLayers = new Map();
  const railRoot = L.layerGroup().addTo(map);
  let railSyncTimer = null;
  let railPaintToken = 0;
  /** 合并 zoom/move 后的公交+铁路视口同步，避免滚轮连发卡顿 */
  let viewportSyncTimer = null;
  let lastViewportSyncKey = '';
  let mapZooming = false;
  let relayoutTimer = 0;
  let inspectRaf = 0;
  let inspectLastEv = null;
  let inspectHoverKey = '';
  let inspectPointer = null;
  const INSPECT_PAD_PX = 16;
  const INSPECT_DRAG_PX = 8;
  const MODE_TIP = { metro: '地铁', hsr: '高铁', bus: '公交' };
  const inspectTip = L.DomUtil.create('div', 'line-inspect-tip', container);
  inspectTip.hidden = true;
  inspectTip.setAttribute('role', 'status');
  let pendingNewLine = null;
  let pendingConnect = null;
  let suppressMapClick = false;
  let lastNamesVisible = map.getZoom() >= NAME_MIN_ZOOM;
  let lastDotsVisible = map.getZoom() >= DOT_MIN_ZOOM;
  let relayoutRaf = 0;

  function namesVisibleAtZoom() {
    return map.getZoom() >= NAME_MIN_ZOOM;
  }

  function dotsVisibleAtZoom() {
    return map.getZoom() >= DOT_MIN_ZOOM;
  }

  function scheduleRelayout() {
    if (relayoutRaf) return;
    relayoutRaf = requestAnimationFrame(() => {
      relayoutRaf = 0;
      relayoutAllLabels();
    });
  }

  function scheduleRelayoutDebounced(ms = 120) {
    if (relayoutRaf) {
      cancelAnimationFrame(relayoutRaf);
      relayoutRaf = 0;
    }
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
      relayoutTimer = 0;
      scheduleRelayout();
    }, ms);
  }

  function needsGuidewayRepaint(rec) {
    if (!rec?.seg) return false;
    if (rec.line?._guidewaySplit) return true;
    return /有轨|tram|导轨|西郊线/i.test(rec.seg.line || '');
  }

  function recCum(rec) {
    if (rec.cum?.length) return rec.cum;
    rec.cum = buildCumDist(rec.latlngs);
    return rec.cum;
  }

  /** 仅重绘缩放敏感的有轨双轨偏移；普通地铁线跳过 */
  function repaintZoomSensitiveGuideways() {
    if (!segments.size) return;
    for (const rec of segments.values()) {
      if (!needsGuidewayRepaint(rec)) continue;
      paintBridgeRails(rec.bridgeLayer, rec.seg, rec.latlngs, recCum(rec), rec.stations, {
        color: rec.line?._ghost ? '#8A8E94' : rec.seg.color,
        opacity: rec.line?._guidewayOpacity ?? (rec.line?._segActive ? 1 : 0.55),
        line: rec.line,
        weight: rec.line?.options?._baseWeight,
      });
    }
  }

  function syncZoomChrome() {
    const showNames = namesVisibleAtZoom();
    const showDots = dotsVisibleAtZoom();
    container.classList.toggle('zoom-global', !showNames);
    if (!growing.size) repaintZoomSensitiveGuideways();
    const namesChanged = showNames !== lastNamesVisible;
    const dotsChanged = showDots !== lastDotsVisible;
    lastNamesVisible = showNames;
    lastDotsVisible = showDots;
    if (!segments.size || growing.size) return;
    // 站名/圆点显隐档位变化 → 立刻重排
    if (namesChanged || dotsChanged) {
      scheduleRelayoutDebounced(40);
      return;
    }
    // 全量/海量线段：缩放后不做站名碰撞重算（圆点够用）；非全量近景才重排
    if (busFullLoad || railFullLoad || segments.size > 280) return;
    if (showNames) scheduleRelayoutDebounced(140);
  }

  function viewportSyncKey() {
    const modes = [...modeFilters].sort().join(',');
    // 全量：缩放不触发重挂，只跟索引规模/模式走
    if (busFullLoad && railFullLoad) {
      return `full|${busIndex.size}|${railIndex.size}|${modes}`;
    }
    const z = Math.round(map.getZoom() * 2) / 2;
    const b = map.getBounds();
    const r = (n) => Math.round(n * 80) / 80;
    return `${z}|${r(b.getSouth())}|${r(b.getWest())}|${r(b.getNorth())}|${r(b.getEast())}|${busFullLoad ? 1 : 0}|${railFullLoad ? 1 : 0}|${modes}`;
  }

  function scheduleViewportLayers(delay = 160) {
    if (mapZoomFrozen) return;
    clearTimeout(busSyncTimer);
    clearTimeout(railSyncTimer);
    clearTimeout(viewportSyncTimer);
    viewportSyncTimer = setTimeout(() => {
      viewportSyncTimer = null;
      if (mapZoomFrozen) return;
      const key = viewportSyncKey();
      if (key === lastViewportSyncKey) return;
      lastViewportSyncKey = key;
      syncViewportBuses();
      syncViewportRails();
    }, delay);
  }

  function invalidateViewportSync() {
    lastViewportSyncKey = '';
  }

  function freezeZoomPaint() {
    mapZooming = true;
    mapZoomFrozen = true;
    container.classList.add('map-zoom-busy');
    clearTimeout(viewportSyncTimer);
    clearTimeout(relayoutTimer);
    if (relayoutRaf) {
      cancelAnimationFrame(relayoutRaf);
      relayoutRaf = 0;
    }
    hideInspectTip();
  }

  function thawZoomPaint() {
    mapZooming = false;
    mapZoomFrozen = false;
    container.classList.remove('map-zoom-busy');
    try {
      getLineRenderer()._update();
    } catch {
      /* */
    }
    syncZoomChrome();
    // 当前开启的公交/铁路若已全量钉住，缩放不再重挂
    const needBus = !modeFilters.size || modeAllows('bus');
    const needRail = !modeFilters.size || modeAllows('hsr');
    const pinned = (!needBus || busFullLoad) && (!needRail || railFullLoad);
    if (!pinned) scheduleViewportLayers(60);
    onViewportChange?.();
  }

  map.on('zoomstart', () => {
    clearTimeout(zoomThawTimer);
    freezeZoomPaint();
  });
  map.on('zoomend', () => {
    clearTimeout(zoomThawTimer);
    // 滚轮连级：停稳后再解冻，缩放过程只动底图
    zoomThawTimer = setTimeout(thawZoomPaint, 160);
  });
  map.on('dragstart', hideInspectTip);
  map.on('mousemove', onInspectMove);
  map.on('click', onInspectClick);
  map.getContainer().addEventListener('pointerdown', (ev) => {
    if (ev.button != null && ev.button !== 0) {
      inspectPointer = null;
      return;
    }
    inspectPointer = { x: ev.clientX, y: ev.clientY };
  });
  map.getContainer().addEventListener('mouseleave', hideInspectTip);
  map.on('moveend', () => {
    if (mapZooming || mapZoomFrozen) return;
    // 全量模式平移也不反复重挂公交/铁路
    const needBusM = !modeFilters.size || modeAllows('bus');
    const needRailM = !modeFilters.size || modeAllows('hsr');
    const pinnedMove = (!needBusM || busFullLoad) && (!needRailM || railFullLoad);
    if (!pinnedMove) scheduleViewportLayers(160);
    onViewportChange?.();
    if (exportFast || growing.size) return;
    if (!dotsVisibleAtZoom()) return;
    if (namesVisibleAtZoom()) scheduleRelayoutDebounced(180);
    else if (segments.size >= 24) scheduleRelayoutDebounced(240);
  });
  container.classList.toggle('zoom-global', !namesVisibleAtZoom());

  function clearAll() {
    growCancel = true;
    disableEdit();
    clearRenameOverlay();
    hideInspectTip();
    root.clearLayers();
    segments.clear();
    growing.clear();
    labelClaims.clear();
    clearBusLayers();
    clearRailLayers();
  }

  /** 从图上移除已画线段（通勤停运等） */
  function removeSegment(segId, { deferLabels = false } = {}) {
    const rec = segments.get(segId);
    if (!rec) return;
    releaseLabelClaims(segId);
    if (rec.group) root.removeLayer(rec.group);
    segments.delete(segId);
    if (!deferLabels) relayoutAllLabels();
  }

  /** 已画线段改色（城铁并入地铁改规范色等） */
  function segmentsByLineNames(names) {
    const set = new Set(Array.isArray(names) ? names : [names]);
    return [...segments.values()].filter((rec) => set.has(rec.seg.line));
  }

  function resolveRecolorList(ids, fromLine, cityId) {
    const seen = new Set();
    const list = [];
    const add = (rec) => {
      if (!rec || seen.has(rec)) return;
      if (cityId && rec.seg?.cityId && rec.seg.cityId !== cityId) return;
      seen.add(rec);
      list.push(rec);
    };
    if (fromLine) {
      for (const rec of segmentsByLineNames(fromLine)) add(rec);
    }
    for (const id of ids || []) add(segments.get(id));
    return list;
  }

  async function recolorSegments(ids, color, { animate = true, speed = 1, lineName, fromLine, deferLabels = false, cityId = '' } = {}) {
    const list = resolveRecolorList(ids, fromLine, cityId);
    if (!list.length || !color) return;
    for (const rec of list) {
      rec.seg.color = color;
      if (lineName) rec.seg.line = lineName;
      const op = rec.line._segActive ? 1 : 0.55;
      if (animate) {
        rec.line.setStyle({ color, opacity: 1, weight: (rec.line.options._baseWeight || 7) + 3 });
      } else {
        rec.line.setStyle({ color, opacity: op });
      }
      paintBridgeRails(rec.bridgeLayer, rec.seg, rec.latlngs, buildCumDist(rec.latlngs), rec.stations, {
        color,
        opacity: animate ? 1 : op,
        line: rec.line,
      });
    }
    if (!deferLabels) relayoutAllLabels();
    if (!animate) return;
    await new Promise((r) => setTimeout(r, 1100 / Math.max(0.35, speed)));
    for (const rec of list) {
      const base = rec.line.options._baseWeight || 7;
      rec.line.setStyle({ color, opacity: 0.55, weight: Math.max(6, base - 1) });
      paintBridgeRails(rec.bridgeLayer, rec.seg, rec.latlngs, buildCumDist(rec.latlngs), rec.stations, {
        color,
        opacity: 0.55,
        line: rec.line,
      });
    }
    if (!deferLabels) relayoutAllLabels();
  }

  /**
   * 线段消散后移除
   * @param {string[]} ids
   */
  /** 拆除车站（示意临时站等）；保留线位，从运行时站表移除（不改数据源）
   *  names 可为站名，或 { name, segId } 只拆指定段
   */
  function recInCity(rec, cityId) {
    if (!cityId || !rec?.seg?.cityId) return true;
    return rec.seg.cityId === cityId;
  }

  function retireStations(specs, { deferLabels = false, cityId = '' } = {}) {
    const items = (specs || [])
      .map((s) => (typeof s === 'string' ? { name: s } : s))
      .filter((s) => s?.name);
    if (!items.length) return;
    const global = new Set(items.filter((s) => !s.segId).map((s) => s.name));
    const dropped = new Set();
    for (const [id, rec] of segments) {
      if (!recInCity(rec, cityId)) continue;
      const drop = new Set([
        ...global,
        ...items.filter((s) => s.segId === id).map((s) => s.name),
      ]);
      if (!drop.size) continue;
      if (rec.stations?.length) {
        rec.stations = rec.stations.filter((st) => !drop.has(st.name));
      }
      if (rec.seg?.stations?.length) {
        rec.seg.stations = rec.seg.stations.filter((st) => !drop.has(st.name));
      }
      for (const n of drop) dropped.add(n);
    }
    for (const name of dropped) {
      const still = [...segments.values()].some((rec) =>
        rec.stations?.some((st) => st.name === name && !st.silent)
      );
      if (!still) labelClaims.delete(name);
    }
    if (!deferLabels) relayoutAllLabels();
    if (editEnabled) refreshEditHandles();
  }

  /**
   * 既有线段上增设车站（如 1930 上水）
   * @param {{ segId?: string, name: string, lng: number, lat: number, after?: string }[]} specs
   */
  const ADD_STATION_MAX_DEG = 0.018;

  function addStations(specs, { deferLabels = false, cityId = '', line = '' } = {}) {
    if (!specs?.length) return;
    for (const spec of specs) {
      if (!spec?.name || spec.lng == null || spec.lat == null) continue;
      const wantLine = spec.line || line;
      const targets = spec.segId
        ? [[spec.segId, segments.get(spec.segId)]].filter((x) => x[1])
        : [...segments.entries()].filter(([, rec]) => {
            if (!recInCity(rec, cityId)) return false;
            if (wantLine && rec.seg?.line && rec.seg.line !== wantLine) return false;
            if (spec.after && !rec.stations?.some((s) => s.name === spec.after)) return false;
            return true;
          });
      for (const [, rec] of targets) {
        if (rec.stations.some((s) => s.name === spec.name && !s.silent)) continue;
        if (!rec.latlngs?.length) continue;
        const raw = {
          name: spec.name,
          lng: +spec.lng,
          lat: +spec.lat,
          keepCoords: !!spec.keepCoords,
          segId: spec.segId,
          style: spec.style,
        };
        const st = spec.keepCoords ? raw : applyStationCoords(raw, spec.segId);
        const snapped = snapStationsToPath([st], rec.latlngs, buildCumDist(rec.latlngs))[0];
        const far =
          !spec.keepCoords &&
          Math.hypot((snapped?.lat ?? 0) - st.lat, (snapped?.lng ?? 0) - st.lng) > ADD_STATION_MAX_DEG;
        if (far) continue;
        let insertAt = rec.stations.length;
        if (spec.atStart) {
          insertAt = 0;
        } else if (spec.after) {
          const ai = rec.stations.findIndex((s) => s.name === spec.after);
          if (ai >= 0) insertAt = ai + 1;
        } else if (snapped?.dist != null) {
          insertAt = rec.stations.findIndex((s) => (s.dist ?? 0) > snapped.dist);
          if (insertAt < 0) insertAt = rec.stations.length;
        }
        rec.stations.splice(insertAt, 0, snapped);
      }
    }
    if (!deferLabels) relayoutAllLabels();
    if (editEnabled) refreshEditHandles();
  }

  /** 灰站升格开通（去 ghost） */
  function openStations(names, { deferLabels = false, cityId = '' } = {}) {
    const set = new Set((names || []).filter(Boolean));
    if (!set.size) return;
    for (const rec of segments.values()) {
      if (!recInCity(rec, cityId)) continue;
      for (const st of rec.stations || []) {
        if (set.has(st.name)) {
          delete st.style;
          st.silent = false;
        }
      }
      for (const st of rec.seg?.stations || []) {
        if (set.has(st.name)) {
          delete st.style;
          st.silent = false;
        }
      }
    }
    if (!deferLabels) relayoutAllLabels();
    if (editEnabled) refreshEditHandles();
  }

  function pathFromDist(path, cum, dist) {
    const total = cum[cum.length - 1];
    if (dist <= 0) return path.slice();
    if (dist >= total) return [path[path.length - 1]];
    let i = 1;
    while (i < cum.length && cum[i] < dist) i++;
    const t = (dist - cum[i - 1]) / Math.max(cum[i] - cum[i - 1], 1e-6);
    const tip = [
      path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t,
      path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t,
    ];
    return [tip, ...path.slice(i)];
  }

  /** 截去线头：从指定点起算（总站北迁等） */
  function trimSegStart(spec, { deferLabels = false } = {}) {
    if (!spec?.segId || spec.lng == null || spec.lat == null) return;
    const rec = segments.get(spec.segId);
    if (!rec?.latlngs?.length) return;
    const lat = +spec.lat;
    const lng = +spec.lng;
    const cum = buildCumDist(rec.latlngs);
    const hit = projectToPath(lat, lng, rec.latlngs, cum);
    const drop = new Set([spec.station, ...(spec.dropNames || [])].filter(Boolean));
    rec.stations = rec.stations.filter((s) => {
      if (drop.has(s.name)) return false;
      const p = projectToPath(s.lat, s.lng, rec.latlngs, cum);
      return p.dist >= hit.dist - 40;
    });
    rec.latlngs = pathFromDist(rec.latlngs, cum, hit.dist).map((p) => [p[0], p[1]]);
    rec.latlngs[0] = [lat, lng];
    rec.stations = snapStationsToPath(rec.stations, rec.latlngs, buildCumDist(rec.latlngs));
    if (spec.station) {
      rec.stations = rec.stations.filter((s) => s.name !== spec.station);
      rec.stations.unshift({ name: spec.station, lng, lat, dist: 0 });
    }
    if (rec.seg?.stations) {
      rec.seg.stations = rec.seg.stations.filter((s) => !drop.has(s.name));
    }
    rebuildSegmentVisual(spec.segId, { deferLabels });
    if (editEnabled) refreshEditHandles();
  }

  function applyTerminusMove(spec, { deferLabels = false } = {}) {
    if (!spec) return;
    trimSegStart(spec, { deferLabels });
  }

  /**
   * 总站搬迁：旧段沿线收回，站标跟着挪到新址
   * @param {{ segId: string, station: string, lng: number, lat: number, color?: string }} spec
   */
  async function playTerminusMove(spec, { speed = 1 } = {}) {
    const rec = segments.get(spec?.segId);
    if (!rec?.latlngs?.length || !spec.station) {
      applyTerminusMove(spec);
      return;
    }
    const full = rec.latlngs.map((p) => [p[0], p[1]]);
    const cum = buildCumDist(full);
    const dest = projectToPath(+spec.lat, +spec.lng, full, cum);
    const st = rec.stations.find((s) => s.name === spec.station);
    const color = spec.color || rec.seg.color || '#53B7AD';
    const durationSec = 2.4 / Math.max(0.35, speed);

    if (st) st.silent = true;
    for (const name of spec.dropNames || []) {
      for (const s of rec.stations) {
        if (s.name === name) s.silent = true;
      }
    }
    relayoutAllLabels();

    const html = `<i class="st-dot" style="--c:${color}"></i><span class="st-name">${spec.station}</span>`;
    const icon = L.divIcon({
      className: 'st-label side-above is-active',
      html,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    const marker = L.marker([st?.lat ?? full[0][0], st?.lng ?? full[0][1]], {
      icon,
      interactive: false,
      keyboard: false,
    }).addTo(renameRoot);

    growCancel = false;
    const bounds = L.latLngBounds([
      [st?.lat ?? full[0][0], st?.lng ?? full[0][1]],
      [+spec.lat, +spec.lng],
    ]);
    await new Promise((resolve) => {
      map.flyToBounds(bounds, { padding: [64, 64], maxZoom: 15, duration: 0.7 });
      map.once('moveend', resolve);
      setTimeout(resolve, 850);
    });

    await new Promise((resolve) => {
      const t0 = performance.now();
      const tick = (now) => {
        if (growCancel) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - t0) / 1000 / durationSec);
        const u = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const startDist = dest.dist * u;
        const remain = pathFromDist(full, cum, startDist);
        rec.line.setLatLngs(remain);
        if (remain[0]) marker.setLatLng(remain[0]);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });

    renameRoot.clearLayers();
    if (st) st.silent = false;
    applyTerminusMove(spec);
  }

  async function retireSegments(ids, { animate = true, speed = 1, color, holdCam = false } = {}) {
    const list = (ids || []).map((id) => ({ id, rec: segments.get(id) })).filter((x) => x.rec);
    if (!list.length) return;
    if (!animate) {
      for (const { id } of list) removeSegment(id);
      return;
    }
    const fadeMs = 1200 / Math.max(0.35, speed);
    growCancel = false;
    // 镜头框住待撤线段（示意线可 holdCam，避免扯离当前焦点）
    const pts = list.flatMap(({ rec }) => rec.latlngs || []);
    if (!holdCam && pts.length >= 2) {
      await new Promise((resolve) => {
        map.flyToBounds(L.latLngBounds(pts), {
          padding: [48, 48],
          maxZoom: 14,
          duration: 0.7,
        });
        map.once('moveend', resolve);
        setTimeout(resolve, 850);
      });
    }
    for (const { id, rec } of list) {
      if (growCancel) break;
      const path = rec.latlngs;
      const c = color || rec.seg.color || '#A01D1D';
      if (path?.length >= 2) await fadePolyline(path, c, fadeMs);
      removeSegment(id);
    }
  }

  function releaseLabelClaims(segId) {
    for (const [name, owner] of [...labelClaims.entries()]) {
      if (owner === segId) labelClaims.delete(name);
    }
  }

  function cancelGrow() {
    growCancel = true;
    clearRenameOverlay();
  }

  function clearRenameOverlay() {
    if (renameTimer) {
      clearTimeout(renameTimer);
      renameTimer = null;
    }
    renameRoot.clearLayers();
  }

  /** 把图上已有站名标签 from → to；open 去 ghost；move 时改坐标并拉动线端 */
  function patchStationLabels(from, to, { open = false, lng, lat, move = false } = {}, opts = {}) {
    if (!from || !to) return;
    const cityId = opts.cityId || '';
    container.querySelectorAll('.st-label .st-name').forEach((el) => {
      if (el.textContent === from) el.textContent = to;
    });
    for (const [segId, rec] of segments) {
      if (opts.segId && segId !== opts.segId) continue;
      if (!recInCity(rec, cityId)) continue;
      if (opts.line && rec.seg?.line && rec.seg.line !== opts.line) continue;
      let movedIdx = -1;
      for (let i = 0; i < (rec.stations || []).length; i++) {
        const st = rec.stations[i];
        if (st.name !== from) continue;
        st.name = to;
        if (open) delete st.style;
        if (move && lng != null && lat != null) {
          st.lng = +lng;
          st.lat = +lat;
          movedIdx = i;
        }
      }
      if (movedIdx >= 0 && rec.latlngs?.length >= 2) {
        const n = rec.stations.length;
        const pt = [+lat, +lng];
        if (movedIdx === 0) rec.latlngs[0] = pt;
        else if (movedIdx === n - 1) rec.latlngs[rec.latlngs.length - 1] = pt;
        else {
          // 中间站：吸附到最近折线点
          let best = 0;
          let bestD = Infinity;
          for (let i = 0; i < rec.latlngs.length; i++) {
            const d = Math.hypot(rec.latlngs[i][0] - lat, rec.latlngs[i][1] - lng);
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
          if (bestD < 0.05) rec.latlngs[best] = pt;
        }
        rebuildSegmentVisual(segId, { deferLabels: true });
      }
    }
    // 占用名一并改掉，避免更名后新段再画一个「公主坟」
    if (labelClaims.has(from)) {
      const owner = labelClaims.get(from);
      labelClaims.delete(from);
      labelClaims.set(to, owner);
    }
    if (!opts?.deferLabels) relayoutAllLabels();
  }

  function renameSpecs(spec) {
    if (!spec) return [];
    return Array.isArray(spec) ? spec.filter((s) => s?.from && s?.to) : spec.from && spec.to ? [spec] : [];
  }

  function applyStationRename(spec, { deferLabels = false, cityId = '' } = {}) {
    for (const one of renameSpecs(spec)) {
      patchStationLabels(
        one.from,
        one.to,
        {
          open: !!one.open,
          move: !!one.move,
          lng: one.lng,
          lat: one.lat,
        },
        { deferLabels: true, cityId, segId: one.segId, line: one.line }
      );
    }
    if (!deferLabels) relayoutAllLabels();
  }

  /**
   * 站名更名动画：旧名划掉淡出 → 新名弹出；可一次多个站顺序播
   * @param {{ from: string, to: string, lng: number, lat: number, color?: string, open?: boolean } | object[]} spec
   */
  async function playStationRename(spec, { speed = 1 } = {}) {
    const list = renameSpecs(spec);
    for (const one of list) {
      await playOneStationRename(one, { speed });
    }
  }

  function playOneStationRename(spec, { speed = 1 } = {}) {
    clearRenameOverlay();
    if (!spec?.from || !spec?.to) return Promise.resolve();
    const st = applyStationCoords({ name: spec.to, lng: spec.lng, lat: spec.lat });
    const color = spec.color || '#A01D1D';
    const totalMs = 2200 / Math.max(0.25, speed);

    const dur = `${(2.2 / Math.max(0.25, speed)).toFixed(2)}s`;
    const html = `
      <i class="st-dot" style="--c:${color};--rename-dur:${dur}"></i>
      <div class="st-rename-stack" style="--rename-dur:${dur}">
        <span class="st-rename-from">${spec.from}</span>
        <span class="st-rename-to">${spec.to}</span>
      </div>`;

    const icon = L.divIcon({
      className: 'st-label st-rename side-above is-active',
      html,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    const marker = L.marker([st.lat, st.lng], { icon, interactive: false, keyboard: false });
    marker.addTo(renameRoot);

    map.setView([st.lat, st.lng], Math.max(map.getZoom(), 16), { animate: true });

    return new Promise((resolve) => {
      renameTimer = setTimeout(() => {
        renameTimer = null;
        patchStationLabels(spec.from, spec.to, {
          open: !!spec.open,
          move: !!spec.move,
          lng: spec.lng,
          lat: spec.lat,
        });
        renameTimer = setTimeout(() => {
          renameTimer = null;
          renameRoot.clearLayers();
          resolve();
        }, 400 / Math.max(0.25, speed));
      }, totalMs);
    });
  }

  function demoteActive() {
    for (const rec of segments.values()) {
      const layer = rec.line;
      if (!layer?._segActive) continue;
      layer._segActive = false;
      const op = layer._ghost ? 0.85 : layer._planned ? 0.72 : 0.55;
      const w = layer._ghost || layer._planned ? layer.options._baseWeight || 7 : layer.options._baseWeight || 6;
      if (layer._ghost) {
        layer.setStyle({ color: '#B0B4B8', opacity: op, weight: w });
      } else if (layer._planned) {
        layer.setStyle({ color: rec.seg.color || '#8aabb8', opacity: op, weight: w, dashArray: '14 10' });
      } else {
        layer.setStyle({ opacity: op, weight: w });
      }
      paintBridgeRails(rec.bridgeLayer, rec.seg, rec.latlngs, buildCumDist(rec.latlngs), rec.stations, {
        color: layer._ghost ? '#8A8E94' : rec.seg.color,
        opacity: op,
        line: rec.line,
      });
    }
    container.querySelectorAll('.st-label.is-active').forEach((el) => {
      el.classList.remove('is-active');
      el.classList.add('is-past');
    });
    relayoutAllLabels();
  }

  /** 对已画出的线段短暂加粗提亮（更名等无新线场景） */
  function highlightSegments(ids, { ms = 1400, fromLine } = {}) {
    const list = resolveRecolorList(ids, fromLine);
    if (!list.length) return Promise.resolve();
    for (const rec of list) {
      const base = rec.line.options._baseWeight || 7;
      rec.line.setStyle({ opacity: 1, weight: base + 4 });
      rec.line.bringToFront?.();
      rec.line._segActive = true;
      paintBridgeRails(rec.bridgeLayer, rec.seg, rec.latlngs, buildCumDist(rec.latlngs), rec.stations, {
        color: rec.seg.color,
        opacity: 1,
        line: rec.line,
      });
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        for (const rec of list) {
          const base = rec.line.options._baseWeight || 7;
          const op = rec.line._ghost ? 0.85 : rec.line._planned ? 0.72 : 0.55;
          if (rec.line._ghost) {
            rec.line.setStyle({ opacity: op, weight: base });
          } else if (rec.line._planned) {
            rec.line.setStyle({ opacity: op, weight: base, dashArray: '14 10' });
          } else {
            rec.line.setStyle({ opacity: op, weight: Math.max(6, base - 1) });
          }
          rec.line._segActive = false;
          paintBridgeRails(rec.bridgeLayer, rec.seg, rec.latlngs, buildCumDist(rec.latlngs), rec.stations, {
            color: rec.line._ghost ? '#8A8E94' : rec.seg.color,
            opacity: op,
            line: rec.line,
          });
        }
        resolve();
      }, ms);
    });
  }

  function nearestPathIdx(path, lat, lng) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < path.length; i++) {
      const d = Math.hypot(path[i][0] - lat, path[i][1] - lng);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  /**
   * 从已画线段裁掉 start→end 区间（含 start，保留 end 点），用于一线南段拆出
   */
  function trimSegmentRange(segId, startSt, endSt) {
    const rec = segments.get(segId);
    if (!rec?.latlngs?.length || !startSt || !endSt) return;
    const a = nearestPathIdx(rec.latlngs, startSt.lat, startSt.lng);
    const b = nearestPathIdx(rec.latlngs, endSt.lat, endSt.lng);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    // 路径自 start 起：丢掉 [lo, hi)，留下 end 及之后
    const keepFromStart = a <= b;
    rec.latlngs = keepFromStart ? rec.latlngs.slice(hi) : rec.latlngs.slice(0, lo + 1);
    if (rec.latlngs.length < 2) {
      // 整段被拆光则隐藏
      rec.line.setLatLngs([]);
      rec.labelLayer.clearLayers();
      return;
    }
    const endName = endSt.name;
    const si = rec.stations.findIndex((s) => s.name === endName || s.name === startSt.name);
    if (si >= 0) {
      const endI = rec.stations.findIndex((s) => s.name === endName);
      if (keepFromStart && endI >= 0) rec.stations = rec.stations.slice(endI);
      else if (!keepFromStart && endI >= 0) rec.stations = rec.stations.slice(0, endI + 1);
    }
    const cum = buildCumDist(rec.latlngs);
    rec.stations = snapStationsToPath(rec.stations, rec.latlngs, cum);
    rebuildSegmentVisual(segId);
  }

  function handoffTrimStations(spec) {
    const pool = [
      ...(spec.fadeStations || []),
      ...(spec.fadeExtraStations || []),
      ...(spec.segment?.stations || []),
      ...(spec.alsoGrow?.stations || []),
    ];
    const byName = (name) => {
      const hit = pool.find((s) => s.name === name);
      return hit ? applyStationCoords(hit) : name ? applyStationCoords(S_fallback(name)) : null;
    };
    // S_fallback：仅用名时从已画线段站表找
    function S_fallback(name) {
      for (const rec of segments.values()) {
        const st = (rec.stations || []).find((s) => s.name === name);
        if (st) return st;
      }
      return { name, lng: 0, lat: 0 };
    }
    return {
      trimStart: byName(spec.trimStartName),
      trimEnd: byName(spec.trimEndName),
    };
  }

  /** 在路径上截取两站之间的子段（用于一线消散叠层） */
  function sliceLatLngsByStations(path, startSt, endSt) {
    if (!path?.length || !startSt || !endSt) return path;
    const a = nearestPathIdx(path, startSt.lat, startSt.lng);
    const b = nearestPathIdx(path, endSt.lat, endSt.lng);
    let out = path.slice(Math.min(a, b), Math.max(a, b) + 1);
    const d0 = Math.hypot(out[0][0] - startSt.lat, out[0][1] - startSt.lng);
    const d1 = Math.hypot(out[out.length - 1][0] - startSt.lat, out[out.length - 1][1] - startSt.lng);
    if (d0 > d1) out = out.reverse();
    return out;
  }

  async function fadePolyline(path, color, fadeMs) {
    if (!path?.length) return;
    const fadeLine = L.polyline(
      path,
      lineStyle({
        color,
        weight: 10,
        opacity: 1,
        className: 'line-handoff-fade',
      })
    ).addTo(renameRoot);
    fadeLine.bringToFront?.();
    await new Promise((resolve) => {
      const t0 = performance.now();
      const tick = (now) => {
        if (growCancel) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - t0) / fadeMs);
        fadeLine.setStyle({
          opacity: 1 - t,
          weight: 10 - 4 * t,
          dashArray: t > 0.15 ? `${12 * (1 - t) + 2} 10` : null,
        });
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    renameRoot.removeLayer(fadeLine);
  }

  /** 无动画：裁一线（含长礼）+ 环线南半环 + 一线接复兴门 */
  function applyLineHandoffStatic(spec, { deferLabels = false } = {}) {
    if (!spec?.segment) return;
    for (const id of spec.fadeSegIds || []) removeSegment(id, { deferLabels: true });
    const { trimStart, trimEnd } = handoffTrimStations(spec);
    if (spec.trimSegId && trimStart && trimEnd) {
      trimSegmentRange(spec.trimSegId, trimStart, trimEnd);
    }
    if (!segments.has(spec.segment.id)) addSegmentStatic(spec.segment, { deferLabels: true });
    if (spec.alsoGrow && !segments.has(spec.alsoGrow.id)) {
      addSegmentStatic(spec.alsoGrow, { deferLabels: true });
    }
    if (!deferLabels) relayoutAllLabels();
  }

  /**
   * 一线消散 → 环线南半环成环 + 一线改接复兴门
   * 1) 北京站—长椿街红线淡出（拆给环线）
   * 2) 长椿街—南礼士路（长礼）红线淡出撤离
   * 3) 从一线裁掉北京站→南礼士路
   * 4) 环线画南半环；一线画南礼士路—复兴门
   */
  async function playLineHandoff(spec, { animate = true, speed = 1, followCam = true } = {}) {
    if (!spec?.segment) return;
    if (!animate) {
      applyLineHandoffStatic(spec);
      return;
    }
    if (segments.has(spec.segment.id)) return;

    const seg = spec.segment;
    const full = segLatLngs(seg);
    if (!full?.length) {
      applyLineHandoffStatic(spec);
      return;
    }

    const fromColor = spec.fromColor || '#A01D1D';
    const fadeMs = 900 / Math.max(0.35, speed);
    const { trimStart, trimEnd } = handoffTrimStations(spec);

    growCancel = false;
    for (const id of spec.fadeSegIds || []) {
      if (growCancel) break;
      const rec = segments.get(id);
      if (!rec?.latlngs?.length) {
        removeSegment(id);
        continue;
      }
      await fadePolyline(rec.latlngs, spec.fromColor || rec.seg.color, fadeMs);
      removeSegment(id);
    }

    // 消散路径：优先用一线原路径（含长礼），否则从南半环上截
    const srcRec = spec.trimSegId ? segments.get(spec.trimSegId) : null;
    const srcPath = srcRec?.latlngs?.length ? srcRec.latlngs : full;

    const fadeMain = (spec.fadeStations || []).map((s) => applyStationCoords(s));
    const fadeExtra = (spec.fadeExtraStations || []).map((s) => applyStationCoords(s));
    const pathMain =
      fadeMain.length >= 2
        ? sliceLatLngsByStations(srcPath, fadeMain[0], fadeMain[fadeMain.length - 1])
        : null;
    const pathExtra =
      fadeExtra.length >= 2
        ? sliceLatLngsByStations(srcPath, fadeExtra[0], fadeExtra[fadeExtra.length - 1])
        : null;

    // 先裁一线（北京站→南礼士路，含长礼），再播消散叠层
    if (spec.trimSegId && trimStart && trimEnd) {
      trimSegmentRange(spec.trimSegId, trimStart, trimEnd);
    }

    if (pathMain?.length >= 2) await fadePolyline(pathMain, fromColor, fadeMs);
    if (!growCancel && pathExtra?.length >= 2) await fadePolyline(pathExtra, fromColor, fadeMs * 0.85);

    if (growCancel) {
      applyLineHandoffStatic(spec);
      return;
    }

    await growSegment(seg, { animate: true, speed, followCam });
    if (spec.alsoGrow && !growCancel) {
      await growSegment(spec.alsoGrow, { animate: true, speed, followCam: false });
    }

    if (spec.highlightAfterIds?.length && !growCancel) {
      await highlightSegments(spec.highlightAfterIds, { ms: 1200 / Math.max(0.35, speed) });
    }
  }

  function flyToStations(stations, pad = 0.18) {
    if (!stations?.length) return Promise.resolve();
    const latlngs = stations.map((s) => [s.lat, s.lng]);
    if (latlngs.length === 1) {
      return flyTo(latlngs[0][1], latlngs[0][0], 15, 0.85);
    }
    const bounds = L.latLngBounds(latlngs);
    const padPx = Math.round(40 + pad * 120);
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        syncCamEaseFromMap();
        resolve();
      };
      map.flyToBounds(bounds, {
        padding: [padPx, padPx],
        maxZoom: stations.length <= 6 ? 17 : stations.length <= 10 ? 16 : stations.length <= 16 ? 15 : 13.5,
        duration: 0.85,
        easeLinearity: 0.2,
      });
      map.once('moveend', finish);
      setTimeout(finish, 1000);
    });
  }

  function recModeVisible(rec) {
    if (!rec?.seg) return false;
    if (!modeFilters.size) return true;
    return modeAllows(classifyTransitMode(rec.seg));
  }

  function hasLineFocus() {
    return focusLineNames.size > 0;
  }

  function recMatchesFocus(rec) {
    if (!hasLineFocus()) return true;
    return focusLineNames.has(String(rec?.seg?.line || ''));
  }

  function recNaturalOpacity(rec) {
    if (rec?.line?._ghost || rec?.seg?.style === 'ghost') return 0.85;
    if (rec?.line?._planned || rec?.seg?.style === 'planned') return 0.72;
    return rec?.line?.options?._baseOpacity ?? rec?.seg?.opacity ?? 1;
  }

  function recFocusOpacity(rec) {
    if (!hasLineFocus() || recMatchesFocus(rec)) return recNaturalOpacity(rec);
    return modeAllows('bus') && !modeAllows('metro') && !modeAllows('hsr') ? 0.05 : 0.25;
  }

  function applyRecLineOpacity(rec) {
    if (!rec?.line) return;
    const op = recFocusOpacity(rec);
    rec.line._focusOpacity = op;
    rec.line._guidewayOpacity = op;
    if (rec.line._guidewaySplit) rec.line.setStyle({ opacity: 0 });
    else rec.line.setStyle({ opacity: op });
    rec.bridgeLayer?.eachLayer((ly) => {
      if (ly.setStyle) ly.setStyle({ opacity: op });
    });
    rec.labelLayer?.eachLayer((m) => {
      if (m.setStyle) {
        m.setStyle({ opacity: op, fillOpacity: op });
        return;
      }
      const el = m.getElement?.();
      if (el) el.style.opacity = String(op);
    });
    if (hasLineFocus() && recMatchesFocus(rec)) {
      rec.group?.bringToFront?.();
      rec.bridgeLayer?.bringToFront?.();
      rec.line.bringToFront?.();
    }
  }

  function applyLineFocus() {
    for (const rec of segments.values()) applyRecLineOpacity(rec);
    applyBusLineOpacity();
    applyRailLineOpacity();
    paintBusTermini();
  }

  function applyModeFilter() {
    for (const rec of segments.values()) {
      if (!rec.group) continue;
      const on = recModeVisible(rec);
      const has = map.hasLayer(rec.group);
      if (on && !has) rec.group.addTo(map);
      if (!on && has) map.removeLayer(rec.group);
    }
    invalidateViewportSync();
    syncViewportBuses();
    syncViewportRails();
    lastViewportSyncKey = viewportSyncKey();
    relayoutAllLabels();
  }

  function distPointToSeg2(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = 0;
    if (len2 > 1e-8) t = ((px - ax) * dx + (py - ay) * dy) / len2;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const x = ax + t * dx - px;
    const y = ay + t * dy - py;
    return x * x + y * y;
  }

  function inspectBusy() {
    return editEnabled || exportFast || growing.size > 0 || !!map.dragging?._draggable?._moving;
  }

  function pickLinesAt(layerPt) {
    if (!layerPt || inspectBusy()) return [];
    const pad = INSPECT_PAD_PX;
    const pad2 = pad * pad;
    const hits = [];
    for (const rec of segments.values()) {
      const line = rec?.line;
      const name = rec?.seg?.line;
      if (!line || !name || rec.seg.style === 'ghost') continue;
      if (!recModeVisible(rec)) continue;
      if (rec.group && !map.hasLayer(rec.group)) continue;
      const bounds = line._pxBounds;
      if (!bounds) continue;
      if (
        layerPt.x < bounds.min.x - pad ||
        layerPt.x > bounds.max.x + pad ||
        layerPt.y < bounds.min.y - pad ||
        layerPt.y > bounds.max.y + pad
      ) {
        continue;
      }
      const parts = line._parts?.length ? line._parts : line._rings;
      if (!parts?.length) continue;
      let best = Infinity;
      for (const ring of parts) {
        for (let i = 1; i < ring.length; i++) {
          const a = ring[i - 1];
          const b = ring[i];
          const d2 = distPointToSeg2(layerPt.x, layerPt.y, a.x, a.y, b.x, b.y);
          if (d2 < best) best = d2;
        }
      }
      if (best > pad2) continue;
      hits.push({
        rec,
        name,
        key: `${rec.seg.cityId || ''}::${lineIdentity(name)}`,
        dist2: best,
        focused: hasLineFocus() && recMatchesFocus(rec),
      });
    }
    if (!modeFilters.size || modeAllows('bus')) {
      for (const [id, line] of busLayers) {
        const rec = busIndex.get(id);
        const name = rec?.seg?.line;
        if (!line || !name) continue;
        const fake = { seg: rec.seg, line };
        const bounds = line._pxBounds;
        if (!bounds) continue;
        if (
          layerPt.x < bounds.min.x - pad ||
          layerPt.x > bounds.max.x + pad ||
          layerPt.y < bounds.min.y - pad ||
          layerPt.y > bounds.max.y + pad
        ) {
          continue;
        }
        const parts = line._parts?.length ? line._parts : line._rings;
        if (!parts?.length) continue;
        let best = Infinity;
        for (const ring of parts) {
          for (let i = 1; i < ring.length; i++) {
            const d2 = distPointToSeg2(layerPt.x, layerPt.y, ring[i - 1].x, ring[i - 1].y, ring[i].x, ring[i].y);
            if (d2 < best) best = d2;
          }
        }
        if (best > pad2) continue;
        hits.push({
          rec: fake,
          name,
          key: `${rec.seg.cityId || ''}::${lineIdentity(name)}`,
          dist2: best,
          focused: hasLineFocus() && recMatchesFocus(fake),
        });
      }
    }
    if (!modeFilters.size || modeAllows('hsr')) {
      for (const [id, line] of railLayers) {
        const rec = railIndex.get(id);
        const name = rec?.seg?.line;
        if (!line || !name) continue;
        const fake = { seg: rec.seg, line };
        const bounds = line._pxBounds;
        if (!bounds) continue;
        if (
          layerPt.x < bounds.min.x - pad ||
          layerPt.x > bounds.max.x + pad ||
          layerPt.y < bounds.min.y - pad ||
          layerPt.y > bounds.max.y + pad
        ) {
          continue;
        }
        const parts = line._parts?.length ? line._parts : line._rings;
        if (!parts?.length) continue;
        let best = Infinity;
        for (const ring of parts) {
          for (let i = 1; i < ring.length; i++) {
            const d2 = distPointToSeg2(layerPt.x, layerPt.y, ring[i - 1].x, ring[i - 1].y, ring[i].x, ring[i].y);
            if (d2 < best) best = d2;
          }
        }
        if (best > pad2) continue;
        hits.push({
          rec: fake,
          name,
          key: `${rec.seg.cityId || ''}::${lineIdentity(name)}`,
          dist2: best,
          focused: hasLineFocus() && recMatchesFocus(fake),
        });
      }
    }
    hits.sort((a, b) => {
      const da = Math.sqrt(a.dist2);
      const db = Math.sqrt(b.dist2);
      if (Math.abs(da - db) < 4 && a.focused !== b.focused) return a.focused ? -1 : 1;
      return a.dist2 - b.dist2;
    });
    const uniq = [];
    const seen = new Set();
    for (const hit of hits) {
      if (seen.has(hit.key)) continue;
      seen.add(hit.key);
      uniq.push(hit);
    }
    return uniq;
  }

  function hideInspectTip() {
    inspectHoverKey = '';
    inspectTip.hidden = true;
    inspectTip.innerHTML = '';
    container.classList.remove('is-line-hot');
  }

  function placeInspectTip(pt) {
    const pad = 10;
    const w = inspectTip.offsetWidth || 140;
    const h = inspectTip.offsetHeight || 40;
    const maxX = container.clientWidth - w - pad;
    const maxY = container.clientHeight - h - pad;
    let x = pt.x + 16;
    let y = pt.y + 18;
    if (x > maxX) x = pt.x - w - 12;
    if (y > maxY) y = pt.y - h - 12;
    inspectTip.style.transform = `translate(${Math.max(pad, x)}px, ${Math.max(pad, y)}px)`;
  }

  function renderInspectTip(hits) {
    const top = hits[0];
    const rec = top.rec;
    const caption = lineEndCaption(top.name);
    const color = recColor(rec);
    const mode = rec.seg?.networkRail
      ? rec.seg.highspeed || rec.seg.style === 'hsr'
        ? '高铁'
        : '铁路'
      : MODE_TIP[classifyTransitMode(rec.seg)] || '';
    const cityId = rec.seg?.cityId || '';
    const city =
      !stampCityId || stampCityId !== cityId
        ? PLACES[cityId]?.name || worldCityById(cityId)?.nameZh || ''
        : '';
    const phase =
      rec.seg?.railStatus === 'construction' ? '在建' : rec.seg?.style === 'planned' ? '规划' : '';
    const meta = [city, mode, phase].filter(Boolean).join(' · ');
    const extra = hits
      .slice(1, 4)
      .map((h) => lineEndCaption(h.name))
      .filter((n) => n && n !== caption);
    inspectTip.innerHTML = `<i style="background:${escTag(color)}"></i><div><strong>${escTag(
      caption
    )}</strong>${meta ? `<em>${escTag(meta)}</em>` : ''}${
      extra.length ? `<small>附近 ${escTag(extra.join(' · '))}</small>` : ''
    }</div>`;
  }

  function showInspectTip(hits, containerPt) {
    if (!hits.length) {
      hideInspectTip();
      return;
    }
    const key = hits
      .slice(0, 4)
      .map((h) => h.key)
      .join('|');
    if (key !== inspectHoverKey) {
      inspectHoverKey = key;
      renderInspectTip(hits);
    }
    inspectTip.hidden = false;
    container.classList.add('is-line-hot');
    placeInspectTip(containerPt);
  }

  function onInspectMove(e) {
    inspectLastEv = e;
    if (inspectRaf) return;
    inspectRaf = requestAnimationFrame(() => {
      inspectRaf = 0;
      const ev = inspectLastEv;
      inspectLastEv = null;
      if (!ev || inspectBusy()) {
        hideInspectTip();
        return;
      }
      showInspectTip(pickLinesAt(ev.layerPoint), ev.containerPoint);
    });
  }

  function inspectWasDrag(e) {
    if (map.dragging?.moved?.()) return true;
    const src = e.originalEvent;
    if (!inspectPointer || !src || src.clientX == null) return false;
    return Math.hypot(src.clientX - inspectPointer.x, src.clientY - inspectPointer.y) > INSPECT_DRAG_PX;
  }

  function onInspectClick(e) {
    if (inspectBusy()) return;
    if (inspectWasDrag(e)) return;
    const hits = pickLinesAt(e.layerPoint);
    if (!hits.length) {
      hideInspectTip();
      if (hasLineFocus()) onLinePick?.({ clear: true });
      return;
    }
    showInspectTip(hits, e.containerPoint);
    const rec = hits[0].rec;
    onLinePick?.({
      line: hits[0].name,
      color: recColor(rec),
      mode: classifyTransitMode(rec.seg),
      cityId: rec.seg?.networkRail
        ? recCityMatch(rec.seg, stampCityId)
          ? stampCityId
          : ''
        : rec.seg?.cityId || '',
    });
  }

  function recCityMatch(seg, cityId) {
    if (!cityId) return true;
    if (seg?.cityId === cityId) return true;
    return Array.isArray(seg?.cityIds) && seg.cityIds.includes(cityId);
  }

  function collectNetworkPts({ cityId = '', lineName = '' } = {}) {
    const pts = [];
    const aliases = String(lineName || '')
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    const eat = (rec) => {
      if (rec.seg?.style === 'ghost') return;
      if (!recModeVisible(rec)) return;
      if (cityId && !recCityMatch(rec.seg, cityId)) return;
      if (aliases.length && !aliases.includes(rec.seg?.line)) return;
      const rings = flattenLatLngs(rec.latlngs);
      for (const ring of rings) for (const p of ring) pts.push(p);
    };
    for (const rec of segments.values()) eat(rec);
    for (const rec of railIndex.values()) eat({ seg: rec.seg, latlngs: rec.latlngs });
    return pts;
  }

  function ptLatLng(p) {
    if (!p) return null;
    if (Array.isArray(p) && p.length >= 2) return { lat: +p[0], lng: +p[1] };
    const lat = +p.lat;
    const lng = +p.lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  /** 公交含市郊长线，取城心附近的点来框视野，避免镜头被拉到邻省 */
  function trimFlyPts(pts, cityId, km = 38) {
    if (!pts?.length || pts.length < 24) return pts;
    const place = PLACES[cityId];
    if (place) {
      const rlat = km / 111;
      const rlng = km / Math.max(40, 111 * Math.cos((place.lat * Math.PI) / 180));
      const near = pts.filter((p) => {
        const ll = ptLatLng(p);
        return ll && Math.abs(ll.lat - place.lat) <= rlat && Math.abs(ll.lng - place.lng) <= rlng;
      });
      if (near.length >= 50) return near;
    }
    const lats = [];
    const lngs = [];
    for (const p of pts) {
      const ll = ptLatLng(p);
      if (!ll) continue;
      lats.push(ll.lat);
      lngs.push(ll.lng);
    }
    if (lats.length < 24) return pts;
    lats.sort((a, b) => a - b);
    lngs.sort((a, b) => a - b);
    const lo = Math.floor(lats.length * 0.06);
    const hi = Math.min(lats.length - 1, Math.floor(lats.length * 0.94));
    const lat0 = lats[lo];
    const lat1 = lats[hi];
    const lng0 = lngs[lo];
    const lng1 = lngs[hi];
    const padLat = (lat1 - lat0) * 0.08;
    const padLng = (lng1 - lng0) * 0.08;
    const core = pts.filter((p) => {
      const ll = ptLatLng(p);
      return (
        ll &&
        ll.lat >= lat0 - padLat &&
        ll.lat <= lat1 + padLat &&
        ll.lng >= lng0 - padLng &&
        ll.lng <= lng1 + padLng
      );
    });
    return core.length >= 24 ? core : pts;
  }

  function flyToBoundsPts(pts, { pad = 56, maxZoom = 12, duration = 1.15 } = {}) {
    if (pts.length < 2) return Promise.resolve(false);
    const bounds = L.latLngBounds(pts);
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        syncCamEaseFromMap();
        resolve(true);
      };
      map.flyToBounds(bounds, {
        padding: [pad, pad],
        maxZoom,
        duration,
        easeLinearity: 0.2,
      });
      map.once('moveend', finish);
      setTimeout(finish, duration * 1000 + 200);
    });
  }

  /** 拉远框住图上已画的全部线路（周年总览等） */
  function flyToNetwork(opts = {}) {
    return flyToBoundsPts(collectNetworkPts(), opts);
  }

  /** 框住某城（或该城某条线）的线网 */
  function flyToCityNetwork(cityId, opts = {}) {
    let pts = collectNetworkPts({ cityId, lineName: opts.lineName || '' });
    if (!opts.lineName && (modeAllows('bus') || modeAllows('hsr') || opts.core === true)) {
      pts = trimFlyPts(pts, cityId, modeAllows('hsr') && !modeAllows('metro') ? 62 : 38);
    }
    const maxZoom =
      opts.maxZoom ?? (opts.lineName ? 13.2 : modeAllows('bus') && !modeAllows('metro') ? 12.4 : 12);
    return flyToBoundsPts(pts, { pad: opts.pad ?? 64, maxZoom, duration: opts.duration ?? 0.9 });
  }

  function flyTo(lng, lat, zoom, duration = 0.75) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        syncCamEaseFromMap();
        resolve();
      };
      map.flyTo([lat, lng], zoom, { duration, easeLinearity: 0.2 });
      map.once('moveend', finish);
      setTimeout(finish, duration * 1000 + 180);
    });
  }

  function camForStations(stations, pad = 0.18, maxZoom) {
    if (!stations?.length) return null;
    if (stations.length === 1) {
      return { lat: stations[0].lat, lng: stations[0].lng, zoom: maxZoom ?? 15 };
    }
    const bounds = L.latLngBounds(stations.map((s) => [s.lat, s.lng]));
    const padPx = Math.round(40 + pad * 120);
    const z = Math.min(
      maxZoom ?? (stations.length <= 6 ? 17 : stations.length <= 10 ? 16 : stations.length <= 16 ? 15 : 13.5),
      map.getBoundsZoom(bounds, false, [padPx, padPx])
    );
    const c = bounds.getCenter();
    return { lat: c.lat, lng: c.lng, zoom: z };
  }

  function camForDrawnNetwork(pad = 56, maxZoom = 12) {
    const pts = [];
    for (const rec of segments.values()) {
      const ll = rec.latlngs || [];
      if (!ll.length) continue;
      pts.push(ll[0], ll[ll.length - 1]);
      if (ll.length > 4) pts.push(ll[Math.floor(ll.length / 2)]);
    }
    if (pts.length < 2) return null;
    const bounds = L.latLngBounds(pts);
    const z = Math.min(maxZoom, map.getBoundsZoom(bounds, false, [pad, pad]));
    const c = bounds.getCenter();
    return { lat: c.lat, lng: c.lng, zoom: z };
  }

  function flyChina() {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        syncCamEaseFromMap();
        resolve();
      };
      map.flyTo([35.5, 105], 4, { duration: 0.85, easeLinearity: 0.2 });
      map.once('moveend', finish);
      setTimeout(finish, 1000);
    });
  }

  /**
   * 站名左右交替 + 屏幕碰撞检测，避免叠在一起。
   * 跨线段按站名全局去重：已被其他段占用的站只画圆点、不重复站名（解决立新等合并端点双标）。
   */
  function makeLabels(stations, color, { active, thinLabels, segId = null }) {
    if (!dotsVisibleAtZoom()) return [];
    const markers = [];
    const placed = []; // {x,y} in container pixels
    const minDist = thinLabels ? 28 : 36;
    const showNames = namesVisibleAtZoom();
    const cull = !exportFast && segments.size >= 18;
    const bounds = cull ? map.getBounds().pad(0.22) : null;
    const zoom = map.getZoom();

    const named = stations
      .map((st, i) => ({ st, i }))
      .filter(({ st }) => st.name && !st.silent);

    named.forEach(({ st, i }, ni) => {
      if (bounds && !bounds.contains([st.lat, st.lng])) return;

      const owner = labelClaims.get(st.name);
      const thisLine = segments.get(segId)?.seg?.line || '';
      const isLrt = /轻轨|轻铁|轻便|有轨|tram|导轨|西郊线|快速公交|BRT|云巴|缆车|纜車|APM|胶轮|智轨/i.test(thisLine);
      let samePlatform = false;
      // 地铁：同一条线同名站只留一个（接头站 / 高德连写两遍）
      // 轻轨轻铁除外：环线、共线站可以重复出现
      if (owner != null) {
        const otherRec = segments.get(owner);
        const otherLine = owner === segId ? thisLine : otherRec?.seg?.line || '';
        const sameLine = owner === segId || (!!otherLine && otherLine === thisLine);
        if (sameLine && !isLrt) return;
        const other = otherRec?.stations?.find((s) => s.name === st.name && !s.silent);
        samePlatform = !!(
          other &&
          Math.hypot((other.lat ?? 0) - st.lat, (other.lng ?? 0) - st.lng) <= SAME_PLATFORM_DEG
        );
        if (samePlatform && sameLine) return;
      }

      const side = ni % 2 === 0 ? 'above' : 'below';
      const pt = map.latLngToContainerPoint([st.lat, st.lng]);
      let ok = true;
      if (showNames) {
        for (const p of placed) {
          const dx = p.x - pt.x;
          const dy = p.y - pt.y;
          if (dx * dx + dy * dy < minDist * minDist) {
            ok = false;
            break;
          }
        }
      }

      // 全局：全部只留圆点；近景：端点始终显示站名，中间站碰撞则仅圆点
      const isEnd = ni === 0 || ni === named.length - 1;
      const showText = showNames && !samePlatform && (isEnd || ok);

      if (showText) {
        placed.push({ x: pt.x, y: pt.y + (side === 'above' ? -12 : 12) });
        if (segId != null) labelClaims.set(st.name, segId);
      } else if (!showNames && segId != null && !labelClaims.has(st.name)) {
        labelClaims.set(st.name, segId);
      }

      const stColor = st.style === 'ghost' || st.style === 'planned' ? '#8A8E94' : color;
      const ghostCls = st.style === 'ghost' || st.style === 'planned' ? ' is-ghost' : '';

      if (showText) {
        const icon = L.divIcon({
          className: `st-label side-${side} ${active ? 'is-active' : 'is-past'}${ghostCls}`,
          html: `<i class="st-dot" style="--c:${stColor}"></i><span class="st-name">${st.name}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        markers.push(L.marker([st.lat, st.lng], { icon, interactive: false, keyboard: false }));
        return;
      }

      const ghost = st.style === 'ghost' || st.style === 'planned';
      markers.push(
        L.circleMarker([st.lat, st.lng], {
          renderer: getDotRenderer(),
          radius: zoom < NAME_MIN_ZOOM ? 2.1 : 3.2,
          color: '#fff',
          weight: zoom < NAME_MIN_ZOOM ? 0.8 : 1.3,
          fillColor: stColor,
          fillOpacity: ghost ? 0.78 : 1,
          opacity: ghost ? 0.72 : 1,
          interactive: false,
          bubblingMouseEvents: false,
        })
      );
    });

    return markers;
  }

  function recColor(rec) {
    if (rec.seg?.style === 'ghost') return '#8A8E94';
    if (rec.seg?.style === 'planned') return '#6a8a98';
    return rec.seg?.color || '#888';
  }

  const LINE_ID_ALIASES = {
    一期: '1号线',
    一线: '1号线',
    复八线: '1号线',
    二期: '2号线',
    环线: '2号线',
    城铁西线: '13号线',
    城铁东段: '13号线',
    奥运支线: '8号线',
    大兴线: '4号线',
    '4号线大兴线': '4号线',
  };

  function lineIdentity(name) {
    const raw = String(name || '').trim();
    return LINE_ID_ALIASES[raw] || raw;
  }

  function lineEndCaption(name) {
    const id = lineIdentity(name);
    const metro = id.match(/^(?:地铁|地鐵)?(\d+)\s*号线/);
    if (metro) return `${metro[1]}号线`;
    const sl = id.match(/^S\s*(\d+)/i);
    if (sl) return `S${sl[1]}`;
    const brt = id.match(/^快速公交\s*(\d+)/) || id.match(/^快(\d+)$/);
    if (brt) return `快${brt[1]}`;
    const bus = id.match(/^(.+路)$/);
    if (bus) return bus[1];
    const tramT = id.match(/T(\d+)/i);
    if (tramT && /有轨|tram/i.test(id)) return `T${tramT[1]}`;
    return id;
  }

  function endTagInk(hex) {
    const raw = String(hex || '#888').replace('#', '');
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.padEnd(6, '8');
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.62 ? '#1a1a1a' : '#fff';
  }

  function escTag(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[c]);
  }

  function endsNear(a, b, meters = 160) {
    if (!a || !b) return false;
    return Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 85000) < meters;
  }

  function clusterEndIndex(pt, clusters, meters) {
    for (let i = 0; i < clusters.length; i++) {
      if (endsNear(pt, clusters[i].pt, meters)) return i;
    }
    clusters.push({ pt, members: [] });
    return clusters.length - 1;
  }

  function farthestPair(points) {
    if (!points.length) return [];
    if (points.length === 1) return points;
    let bestI = 0;
    let bestJ = 1;
    let bestD = -1;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = Math.hypot(
          (points[i].at[0] - points[j].at[0]) * 111000,
          (points[i].at[1] - points[j].at[1]) * 85000
        );
        if (d > bestD) {
          bestD = d;
          bestI = i;
          bestJ = j;
        }
      }
    }
    return [points[bestI], points[bestJ]];
  }

  function endAtStation(recs, pred) {
    for (const rec of recs) {
      const st = (rec.stations || []).find((s) => s.name && pred(s.name) && Number.isFinite(s.lat));
      if (!st) continue;
      const snapped = endAtLatLng(rec, st.lat, st.lng);
      if (snapped) return snapped;
    }
    return null;
  }

  function endAtLatLng(rec, lat, lng) {
    const ll = rec.latlngs;
    if (!ll || ll.length < 2) return null;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < ll.length; i++) {
      const d = Math.hypot((ll[i][0] - lat) * 111000, (ll[i][1] - lng) * 85000);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    const inwardIdx = best <= 0 ? 1 : best >= ll.length - 1 ? ll.length - 2 : best - 1;
    return { rec, at: ll[best], inward: ll[inwardIdx] };
  }

  function capitalAirportEnds(recs) {
    const t3 = endAtStation(recs, (n) => /3号航站|T\s*3/i.test(n));
    const t2 = endAtStation(recs, (n) => /2号航站|T\s*2/i.test(n));
    const hits = [t3, t2].filter(Boolean);
    if (hits.length >= 2) return hits;
    const T3 = [40.0535, 116.6155];
    const T2 = [40.0798, 116.5928];
    for (const rec of recs) {
      if (!hits.some((h) => h.rec === rec) && rec.latlngs?.length >= 2) {
        if (!t3) {
          const e = endAtLatLng(rec, T3[0], T3[1]);
          if (e && Math.hypot((e.at[0] - T3[0]) * 111000, (e.at[1] - T3[1]) * 85000) < 2500) hits.push(e);
        }
        if (!t2 && hits.length < 2) {
          const e = endAtLatLng(rec, T2[0], T2[1]);
          if (e && Math.hypot((e.at[0] - T2[0]) * 111000, (e.at[1] - T2[1]) * 85000) < 2500) hits.push(e);
        }
      }
    }
    return hits;
  }

  function unmatchedLineEnds(recs, caption = '') {
    if (/^(首都)?机场线$/.test(String(caption)) && !/大兴/.test(String(caption))) {
      const air = capitalAirportEnds(recs);
      if (air.length) return air;
    }
    const live = recs.filter((r) => (r.latlngs?.length || 0) >= 2);
    if (!live.length) return [];
    const maxM = Math.max(0, ...live.map((r) => r.meters || 0));
    const minKeep = live.length > 2 ? Math.min(900, Math.max(200, maxM * 0.12)) : 0;
    const usable = live.filter((r) => (r.meters || 0) >= minKeep);
    const pool = usable.length ? usable : live;
    const clusters = [];
    for (const rec of pool) {
      const ll = rec.latlngs;
      const a = clusterEndIndex(ll[0], clusters, 380);
      const b = clusterEndIndex(ll[ll.length - 1], clusters, 380);
      clusters[a].members.push({ rec, at: ll[0], inward: ll[1] });
      clusters[b].members.push({ rec, at: ll[ll.length - 1], inward: ll[ll.length - 2] });
    }
    const reps = clusters.map((c) => c.members[0]).filter(Boolean);
    return farthestPair(reps);
  }

  function asLatLng(pt) {
    if (!pt) return null;
    if (Array.isArray(pt) && pt.length >= 2) return L.latLng(pt[0], pt[1]);
    if (Number.isFinite(pt.lat) && Number.isFinite(pt.lng)) return L.latLng(pt.lat, pt.lng);
    return null;
  }

  function offsetEndOut(end, px = 20) {
    const at = asLatLng(end.at);
    const inward = asLatLng(end.inward) || at;
    if (!at) return null;
    const p = map.latLngToContainerPoint(at);
    const q = map.latLngToContainerPoint(inward);
    const dx = p.x - q.x;
    const dy = p.y - q.y;
    const len = Math.hypot(dx, dy) || 1;
    return map.containerPointToLatLng(L.point(p.x + (dx / len) * px, p.y + (dy / len) * px));
  }

  function paintLineEndTags() {
    if (!dotsVisibleAtZoom()) return;
    const groups = new Map();
    for (const rec of segments.values()) {
      if (!recModeVisible(rec) || !rec.labelLayer) continue;
      if (rec.seg?.style === 'ghost') continue;
      if (rec.seg?.skipLabels) continue;
      if (stampCityId && rec.seg?.cityId !== stampCityId) continue;
      if (!stampCityId) continue;
      const line = rec.seg?.line;
      if (!line) continue;
      const key = `${rec.seg?.cityId || ''}::${lineIdentity(line)}`;
      let g = groups.get(key);
      if (!g) {
        g = {
          color: recColor(rec),
          caption: lineEndCaption(line),
          planned: rec.seg?.style === 'planned',
          recs: [],
        };
        groups.set(key, g);
      } else if (!g.planned && rec.seg?.style === 'planned') {
        /* keep operating color */
      } else if (rec.seg?.style !== 'planned') {
        g.color = recColor(rec);
        g.caption = lineEndCaption(line);
      }
      g.recs.push(rec);
    }
    const placedPx = [];
    for (const g of groups.values()) {
      if (!g.caption) continue;
      const termini = unmatchedLineEnds(g.recs, g.caption);
      for (const end of termini) {
        let ll = offsetEndOut(end, 22);
        if (!ll) continue;
        let pt = map.latLngToContainerPoint(ll);
        for (let n = 0; n < 4; n++) {
          const hit = placedPx.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 26);
          if (!hit) break;
          pt = L.point(pt.x, pt.y + 14);
          ll = map.containerPointToLatLng(pt);
        }
        placedPx.push(pt);
        const ink = endTagInk(g.color);
        const icon = L.divIcon({
          className: `line-end-tag${g.planned ? ' is-plan' : ''}`,
          html: `<span style="--c:${g.color};color:${ink}">${escTag(g.caption)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        L.marker(ll, { icon, interactive: false, keyboard: false }).addTo(end.rec.labelLayer);
      }
    }
  }

  /** 按当前各段站表重排全部站名（去重） */
  function relayoutAllLabels(force = false) {
    if (exportFast && !force) return;
    labelClaims.clear();
    if (!dotsVisibleAtZoom()) {
      for (const rec of segments.values()) rec.labelLayer?.clearLayers();
      return;
    }
    const recs = [...segments.entries()].map(([id, rec]) => ({ id, rec }));
    recs.sort((a, b) => {
      const fa = hasLineFocus() && recMatchesFocus(a.rec) ? 0 : 1;
      const fb = hasLineFocus() && recMatchesFocus(b.rec) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const aa = a.rec.line?._segActive ? 0 : 1;
      const bb = b.rec.line?._segActive ? 0 : 1;
      if (aa !== bb) return aa - bb;
      const ga = a.rec.seg?.style === 'ghost' || a.rec.seg?.style === 'planned' ? 1 : 0;
      const gb = b.rec.seg?.style === 'ghost' || b.rec.seg?.style === 'planned' ? 1 : 0;
      return ga - gb; // 运营段优先于灰线/规划虚线占名
    });
    for (const { id, rec } of recs) {
      rec.labelLayer.clearLayers();
      if (!recModeVisible(rec)) continue;
      const color = recColor(rec);
      if (rec.stations?.length) {
        ensureRecSnapped(rec);
        makeLabels(rec.stations, color, {
          active: !!rec.line._segActive || !!(hasLineFocus() && recMatchesFocus(rec)),
          thinLabels: rec.stations.length > 12,
          segId: id,
        }).forEach((m) => m.addTo(rec.labelLayer));
      }
    }
    paintLineEndTags();
    paintBusTermini();
    for (const rec of segments.values()) applyRecLineOpacity(rec);
  }

  function segmentStations(seg) {
    const base = (seg.stations || [])
      .filter((s) => s.name)
      .map((s) => ({ ...applyStationCoords(s, seg.id), segId: seg.id, silent: !!s.silent }));
    const extras = extraStationsFor(seg.id);
    const names = new Set(base.map((s) => s.name));
    for (const e of extras) {
      if (!e?.name || names.has(e.name)) continue;
      names.add(e.name);
      base.push(
        applyStationCoords(
          { name: e.name, lng: e.lng, lat: e.lat, keepCoords: true, segId: seg.id },
          seg.id
        )
      );
    }
    return base;
  }

  function segLatLngs(seg) {
    const stations = segmentStations(seg);
    let base = null;
    if (seg.path?.length >= 2) {
      base = seg.path.map((p) => (Array.isArray(p) ? [p[0], p[1]] : [p.lat, p.lng]));
    } else {
      base = stations.map((s) => [s.lat, s.lng]);
    }
    const resolved = resolveSegPath(seg.id, base, stations);
    if (
      seg.osmFull ||
      seg.style === 'bus' ||
      getPathOverride(seg.id) ||
      !resolved ||
      resolved.length <= 96
    ) {
      return resolved;
    }
    return thinPath(resolved, stations);
  }

  function stationsForDraw(seg, latlngs) {
    if (seg.skipLabels) return [];
    const raw = labelStations(seg);
    if (!raw.length) return [];
    if (editEnabled || dotsVisibleAtZoom()) {
      return snapStationsToPath(raw, latlngs, buildCumDist(latlngs));
    }
    return raw;
  }

  function ensureRecSnapped(rec) {
    if (!rec || rec.snapped || rec.seg?.skipLabels) return;
    if (!rec.latlngs?.length || !rec.stations?.length) return;
    rec.stations = snapStationsToPath(rec.stations, rec.latlngs, buildCumDist(rec.latlngs));
    rec.snapped = true;
  }

  function labelStations(seg) {
    return segmentStations(seg);
  }

  /** 折线累计里程（米） */
  function buildCumDist(path) {
    const cum = [0];
    for (let i = 1; i < path.length; i++) {
      const dy = (path[i][0] - path[i - 1][0]) * 111320;
      const dx = (path[i][1] - path[i - 1][1]) * 85000;
      cum.push(cum[i - 1] + Math.hypot(dx, dy));
    }
    return cum;
  }

  /** 取路径上 0..dist 的点列（末点插值，保证匀速） */
  function pathUpToDist(path, cum, dist) {
    const total = cum[cum.length - 1];
    if (dist <= 0) return [path[0]];
    if (dist >= total) return path.slice();
    let i = 1;
    while (i < cum.length && cum[i] < dist) i++;
    const t = (dist - cum[i - 1]) / Math.max(cum[i] - cum[i - 1], 1e-6);
    const tip = [
      path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t,
      path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t,
    ];
    return path.slice(0, i).concat([tip]);
  }

  /** 投影到折线最近边，返回 [lat,lng] 与沿线里程 */
  function projectToPath(lat, lng, path, cum) {
    const table = cum || buildCumDist(path);
    let bestD = Infinity;
    let bestLat = path[0][0];
    let bestLng = path[0][1];
    let bestDist = 0;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const abx = b[1] - a[1];
      const aby = b[0] - a[0];
      const apx = lng - a[1];
      const apy = lat - a[0];
      const ab2 = abx * abx + aby * aby || 1e-12;
      const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
      const plat = a[0] + aby * t;
      const plng = a[1] + abx * t;
      const d = Math.hypot(plat - lat, plng - lng);
      if (d < bestD) {
        bestD = d;
        bestLat = plat;
        bestLng = plng;
        bestDist = table[i - 1] + t * (table[i] - table[i - 1]);
      }
    }
    return { lat: bestLat, lng: bestLng, dist: bestDist };
  }

  /** 把站吸附到本线轨道最近点；换乘站各留在自己的线上，不用裸名坐标挤到一处 */
  function snapStationsToPath(stations, path, cum) {
    if (!path?.length) return stations.map((s) => ({ ...s, pathIndex: 0, dist: 0 }));
    const table = cum || buildCumDist(path);
    const edited = loadEdits().stations;
    const snapped = stations.map((st) => {
      const p = projectToPath(st.lat, st.lng, path, table);
      if (st.keepCoords) return { ...st, dist: p.dist };
      const keyed = st.segId ? edited[`${st.segId}::${st.name}`] : null;
      if (keyed) return { ...st, lat: keyed.lat, lng: keyed.lng, dist: p.dist };
      return { ...st, lat: p.lat, lng: p.lng, dist: p.dist };
    });
    snapped.sort((a, b) => a.dist - b.dist);
    return snapped;
  }

  /** 折线左右法向平移（米），用于地上/桥梁外侧细线 */
  function offsetPathMeters(latlngs, offsetM) {
    if (!latlngs?.length) return [];
    const out = [];
    for (let i = 0; i < latlngs.length; i++) {
      const [lat, lng] = latlngs[i];
      const prev = latlngs[Math.max(0, i - 1)];
      const next = latlngs[Math.min(latlngs.length - 1, i + 1)];
      const latRad = (lat * Math.PI) / 180;
      const cos = Math.cos(latRad) || 1e-6;
      const east = (next[1] - prev[1]) * 111320 * cos;
      const north = (next[0] - prev[0]) * 111320;
      const len = Math.hypot(east, north) || 1;
      const nE = (-north / len) * offsetM;
      const nN = (east / len) * offsetM;
      out.push([lat + nN / 111320, lng + nE / (111320 * cos)]);
    }
    return out;
  }

  function pathBetweenDists(path, cum, d0, d1) {
    if (!path?.length || d1 <= d0) return [];
    const lo = Math.max(0, d0);
    const hi = Math.min(cum[cum.length - 1], d1);
    if (hi <= lo) return [];
    const toHi = pathUpToDist(path, cum, hi);
    const tip = pathUpToDist(path, cum, lo);
    const start = tip[tip.length - 1];
    let i = 0;
    while (i < cum.length && cum[i] < lo - 1e-6) i++;
    const rest = toHi.slice(Math.min(i, toHi.length));
    if (!rest.length) return [start, toHi[toHi.length - 1]].filter(Boolean);
    if (Math.hypot(rest[0][0] - start[0], rest[0][1] - start[1]) < 1e-8) return rest;
    return [start, ...rest];
  }

  /** 解析 elevatedSpans → 沿线里程区间 */
  function resolveElevatedSpans(seg, path, cum, stations) {
    const spans = seg.elevatedSpans || [];
    if (!spans.length || !path?.length) return [];
    const byName = new Map((stations || []).map((s) => [s.name, s]));
    return spans
      .map((sp) => {
        const a = byName.get(sp.from) || applyStationCoords({ name: sp.from, lng: sp.fromLng, lat: sp.fromLat });
        const b = byName.get(sp.to) || applyStationCoords({ name: sp.to, lng: sp.toLng, lat: sp.toLat });
        if (!a?.lat || !b?.lat) return null;
        const pa = projectToPath(a.lat, a.lng, path, cum);
        const pb = projectToPath(b.lat, b.lng, path, cum);
        return { d0: Math.min(pa.dist, pb.dist), d1: Math.max(pa.dist, pb.dist) };
      })
      .filter((x) => x && x.d1 - x.d0 > 20);
  }

  /**
   * 地下实线 / 地上（细中线+细边+浅底）/ 规划虚线。
   * 地面与高架同属地上；换型处中线接到地下粗细。
   */
  function densifyByMeters(path, stepM) {
    if (!path || path.length < 2) return path ? path.slice() : [];
    const cum = buildCumDist(path);
    const total = cum[cum.length - 1] || 0;
    if (total < stepM * 2) return path.slice();
    const out = [path[0]];
    for (let d = stepM; d < total - stepM * 0.4; d += stepM) {
      const pts = pathUpToDist(path, cum, d);
      out.push(pts[pts.length - 1]);
    }
    out.push(path[path.length - 1]);
    return out;
  }

  function offsetPathPxList(latlngs, pxAt) {
    if (!latlngs || latlngs.length < 2) return [];
    const pts = latlngs.map((ll) => map.latLngToLayerPoint(L.latLng(ll[0], ll[1])));
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const px = pxAt[i] || 0;
      const p = map.layerPointToLatLng(L.point(pts[i].x - (dy * px) / len, pts[i].y + (dx * px) / len));
      out.push([p.lat, p.lng]);
    }
    return out;
  }

  function smoothstep(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  }

  function resolveGuidewayKind(seg, path, stations) {
    let kind = null;
    if (Array.isArray(seg.kind) && seg.kind.length && seg.path?.length >= 2) {
      kind = mapKindToPath(seg.path, seg.kind, path);
    } else if (Array.isArray(seg.kind) && seg.kind.length === path.length - 1) {
      kind = seg.kind.slice();
    }
    const namedSrc = seg.stations?.length ? seg.stations : stations;
    if (seg.elevatedSpans?.length || seg.groundSpans?.length) {
      const named = kindFromNamedSpans(path, namedSrc, {
        elevatedSpans: seg.elevatedSpans,
        groundSpans: seg.groundSpans,
      });
      if (!kind?.length) kind = named;
      else {
        for (let i = 0; i < kind.length && i < named.length; i++) {
          if (named[i] !== 'tunnel') kind[i] = named[i];
        }
      }
    }
    return kind;
  }

  function paintBridgeRails(bridgeLayer, seg, path, cum, stations, opts = {}) {
    if (!bridgeLayer) return;
    bridgeLayer.clearLayers();
    const { color, opacity = 1, progressDist = null, line } = opts;
    const restoreSpine = () => {
      if (!line?._guidewaySplit) return;
      line._guidewaySplit = false;
      line.setStyle({
        opacity: line._guidewayOpacity ?? (opacity > 0.05 ? opacity : 1),
        weight: opts.weight || line.options?._baseWeight || 7,
      });
    };
    const isDecor =
      seg.style === 'planned' || seg.style === 'shuttle' || seg.style === 'ghost' || line?._ghost || line?._planned;
    const isTram = /有轨|tram|导轨|西郊线/i.test(seg.line || '');
    if (isDecor || !isTram || !path?.length || !cum?.length) {
      restoreSpine();
      return;
    }

    const kind = resolveGuidewayKind(seg, path, stations);
    if (!kind?.length) {
      restoreSpine();
      return;
    }
    const spans = spansFromKind(kind);
    const isSurface = (t) => t === 'elevated' || t === 'ground';
    if (!spans.length || !spans.some((s) => isSurface(s.type))) {
      restoreSpine();
      return;
    }

    const maxD = progressDist == null ? cum[cum.length - 1] : progressDist;
    const railColor = color || seg.color || '#1a242c';
    const baseW = opts.weight || line?.options?._baseWeight || 7;
    const drawOp = opacity > 0.05 ? opacity : line?._guidewayOpacity ?? 1;
    if (line) {
      if (opacity > 0.05) line._guidewayOpacity = opacity;
      line._guidewaySplit = true;
      line.setStyle({ opacity: 0, weight: 0 });
    }

    const tramW = Math.max(2.2, baseW * 0.38);
    const tramGap = Math.max(3.2, baseW * 0.46);
    const lat0 = path[0]?.[0] || 40;
    const mpp = 40075016.686 * Math.cos((lat0 * Math.PI) / 180) / (256 * 2 ** map.getZoom());
    const TAPER_M = Math.max(260, Math.min(900, mpp * 34));
    const JOIN_M = 16;

    const addRun = (pts, style) => {
      if (!pts || pts.length < 2) return;
      L.polyline(pts, lineStyle(style)).addTo(bridgeLayer);
    };

    const elevFactor = (d, total, tIn, tOut) => {
      let u = 1;
      if (tIn > 8 && d < tIn) u = Math.min(u, smoothstep(d / tIn));
      if (tOut > 8 && d > total - tOut) u = Math.min(u, smoothstep((total - d) / tOut));
      return u;
    };

    for (let si = 0; si < spans.length; si++) {
      const sp = spans[si];
      const prev = si > 0 ? spans[si - 1].type : null;
      const next = si < spans.length - 1 ? spans[si + 1].type : null;
      let d0 = cum[Math.min(sp.i0, cum.length - 1)] || 0;
      let d1 = cum[Math.min(sp.i1, cum.length - 1)] || 0;
      if (sp.type === 'tunnel') {
        if (isSurface(prev)) d0 = Math.max(0, d0 - JOIN_M);
        if (isSurface(next)) d1 += JOIN_M;
      } else {
        if (prev === 'tunnel') d0 = Math.max(0, d0 - JOIN_M);
        if (next === 'tunnel') d1 += JOIN_M;
      }
      if (maxD <= d0 + 5 || d1 <= d0) continue;
      const sub = pathBetweenDists(path, cum, d0, Math.min(maxD, d1));
      if (sub.length < 2) continue;

      if (isSurface(sp.type)) {
        const taperIn = prev === 'tunnel';
        const taperOut = next === 'tunnel';
        const dense = densifyByMeters(sub, 24);
        const dc = buildCumDist(dense);
        const total = dc[dc.length - 1] || 0;
        const cap = Math.max(0, total * 0.38);
        const tIn = taperIn ? Math.min(TAPER_M, cap) : 0;
        const tOut = taperOut ? Math.min(TAPER_M, cap) : 0;
        const gaps = dense.map((_, i) => tramGap * elevFactor(dc[i] || 0, total, tIn, tOut));
        addRun(offsetPathPxList(dense, gaps), {
          color: railColor,
          weight: tramW,
          opacity: drawOp,
          lineCap: 'butt',
          className: 'line-elev-rail',
        });
        addRun(offsetPathPxList(dense, gaps.map((g) => -g)), {
          color: railColor,
          weight: tramW,
          opacity: drawOp,
          lineCap: 'butt',
          className: 'line-elev-rail',
        });
      } else {
        addRun(sub, {
          color: railColor,
          weight: baseW,
          opacity: drawOp,
          lineCap: 'butt',
          className: 'line-tunnel-run',
        });
      }
    }
  }

  function stampSegCity(seg) {
    if (stampCityId && !seg.cityId) seg.cityId = stampCityId;
  }

  function publishGrowHud(seg, latlngs, stations) {
    stampSegCity(seg);
    const pts = latlngs || [];
    growing.set(seg.id, {
      seg,
      latlngs: pts,
      stations: stations || [],
      meters: pts.length >= 2 ? buildCumDist(pts)[pts.length - 1] : 0,
    });
    onHudTick?.();
  }

  function finishGrowHud(segId) {
    growing.delete(segId);
    onHudTick?.();
  }

  function rememberSegment(seg, { group, line, labelLayer, bridgeLayer, latlngs, stations }) {
    if (stampCityId && !seg.cityId) seg.cityId = stampCityId;
    // 一期运营段写入抽稀总路径；其余线位在 bind / segLatLngs 已抽稀
    if (seg.id === PHASE1_MASTER_ID || PHASE1_CHILD_IDS.has(seg.id)) {
      setPathOverride(seg.id, simplifyPath(latlngs, stations, 64));
    }
    const cum = buildCumDist(latlngs);
    const bridge = bridgeLayer || L.layerGroup().addTo(group);
    paintBridgeRails(bridge, seg, latlngs, cum, stations, {
      color: seg.style === 'ghost' ? '#8A8E94' : seg.color,
      opacity: line.options?.opacity ?? 1,
      line,
      weight: line.options?._baseWeight,
    });
    segments.set(seg.id, {
      group,
      line,
      labelLayer,
      bridgeLayer: bridge,
      seg,
      latlngs,
      stations,
      cum,
      meters: cum[cum.length - 1] || 0,
      snapped: !!(stations.length && stations[0].dist != null),
    });
    if (editEnabled) refreshEditHandles();
  }

  function rebuildSegmentVisual(segId, { deferLabels = false } = {}) {
    const rec = segments.get(segId);
    if (!rec) return;
    const { line, bridgeLayer, seg, latlngs, stations } = rec;
    line.setLatLngs(latlngs);
    rec.cum = buildCumDist(latlngs);
    rec.meters = rec.cum[rec.cum.length - 1] || 0;
    paintBridgeRails(bridgeLayer, seg, latlngs, rec.cum, stations, {
      color: seg.style === 'ghost' ? '#8A8E94' : seg.color,
      opacity: line.options?.opacity ?? (line._segActive ? 1 : 0.55),
      line,
    });
    if (!deferLabels) relayoutAllLabels();
  }

  function followZoomForLength(meters) {
    if (meters < 3500) return 17;
    if (meters < 8000) return 16;
    if (meters < 16000) return 15;
    if (meters < 30000) return 14;
    return 13;
  }

  const LONG_RAIL_M = 10000;

  function sceneLinePath(sc) {
    const path = [];
    for (const seg of sc?.segments || []) {
      if (!seg || seg.style === 'ghost' || seg.style === 'planned') continue;
      const ll = segLatLngs(seg);
      if (ll.length < 2) continue;
      if (!path.length) {
        path.push(...ll);
        continue;
      }
      const last = path[path.length - 1];
      const first = ll[0];
      const gap = Math.hypot((first[0] - last[0]) * 111320, (first[1] - last[1]) * 85000);
      path.push(...(gap < 1200 ? ll.slice(1) : ll));
    }
    if (path.length < 2) {
      for (const s of sc?.focusStations || []) {
        if (Number.isFinite(s?.lat) && Number.isFinite(s?.lng)) path.push([s.lat, s.lng]);
      }
    }
    return path;
  }

  function pointAlongPath(path, frac) {
    const cum = buildCumDist(path);
    const meters = cum[cum.length - 1] || 0;
    const pts = pathUpToDist(path, cum, meters * Math.min(1, Math.max(0, frac)));
    return { point: pts[pts.length - 1], meters };
  }

  /** 画面较短边大约装下 meters 这么长，用来把长线缩放到全长的 1/3 */
  function zoomToShowMeters(lat, meters) {
    const size = map.getSize();
    const px = Math.max(Math.min(size.x, size.y) * 0.92, 160);
    const cos = Math.max(Math.cos((lat * Math.PI) / 180), 0.25);
    const mpp = Math.max(meters, 800) / px;
    const z = Math.log2((156543.03392 * cos) / mpp);
    return Math.max(5.2, Math.min(15.5, z));
  }

  function lookAtStart(path) {
    if (!path || path.length < 2) return null;
    const { meters } = pointAlongPath(path, 1);
    if (meters <= LONG_RAIL_M) return null;
    const start = path[0];
    if (!start) return null;
    return {
      lat: start[0],
      lng: start[1],
      zoom: zoomToShowMeters(start[0], meters / 3),
    };
  }

  /** 铁路超过 10 km：缩放到全长约 1/3，起点在画面中央，随后跟拍 */
  function longRailLook(sc) {
    if (!sc || sc.kind !== 'rail' || sc.nationalMap || sc.overview) return null;
    return lookAtStart(sceneLinePath(sc));
  }

  function longRailLookForSeg(seg, sc) {
    if (sc && sc.kind !== 'rail') return null;
    if (seg) {
      const own = lookAtStart(segLatLngs(seg));
      if (own) return own;
    }
    return longRailLook(sc);
  }

  const camEase = { lat: null, lng: null, z: null };

  function syncCamEaseFromMap() {
    const c = map.getCenter();
    camEase.lat = c.lat;
    camEase.lng = c.lng;
    camEase.z = map.getZoom();
  }

  function snapCamTo(lat, lng, zoom) {
    camEase.lat = lat;
    camEase.lng = lng;
    camEase.z = zoom;
    map.setView([lat, lng], zoom, { animate: false });
  }

  function easeCamTo(lat, lng, zoom, dt, tau = 0.2) {
    if (camEase.lat == null) syncCamEaseFromMap();
    const a = 1 - Math.exp(-Math.max(dt, 0.008) / tau);
    camEase.lat += (lat - camEase.lat) * a;
    camEase.lng += (lng - camEase.lng) * a;
    camEase.z = zoom;
    const cur = map.getCenter();
    if (
      Math.abs(camEase.lat - cur.lat) < 2e-7 &&
      Math.abs(camEase.lng - cur.lng) < 2e-7 &&
      Math.abs(zoom - map.getZoom()) < 0.002
    ) {
      return;
    }
    map.setView([camEase.lat, camEase.lng], zoom, { animate: false });
  }

  function applyLongRailLook(look, { animate = false } = {}) {
    if (!look) return false;
    if (animate) {
      map.flyTo([look.lat, look.lng], look.zoom, { duration: 0.85, easeLinearity: 0.2 });
    } else {
      snapCamTo(look.lat, look.lng, look.zoom);
    }
    return true;
  }

  /** 线头已进入画面，并越过镜头行进方向上的 2/3 */
  function tipPastViewportTwoThirds(tip, behind) {
    if (!tip) return false;
    const size = map.getSize();
    const p = map.latLngToContainerPoint(L.latLng(tip[0], tip[1]));
    if (p.x < 0 || p.y < 0 || p.x > size.x || p.y > size.y) return false;
    let dx = 0;
    let dy = 0;
    if (behind && (behind[0] !== tip[0] || behind[1] !== tip[1])) {
      const q = map.latLngToContainerPoint(L.latLng(behind[0], behind[1]));
      dx = p.x - q.x;
      dy = p.y - q.y;
    }
    if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
      dx = p.x - size.x / 2;
      dy = p.y - size.y / 2;
    }
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? p.x >= size.x * (2 / 3) : p.x <= size.x * (1 / 3);
    }
    return dy >= 0 ? p.y >= size.y * (2 / 3) : p.y <= size.y * (1 / 3);
  }

  function lockTravelDir(dirState, tip, behind, zoom) {
    if (!dirState || !tip || !behind) return dirState?.dir || null;
    const p = map.project(L.latLng(tip[0], tip[1]), zoom);
    const q = map.project(L.latLng(behind[0], behind[1]), zoom);
    const dx = p.x - q.x;
    const dy = p.y - q.y;
    if (Math.hypot(dx, dy) < 2) return dirState.dir;
    if (!dirState.dir) {
      dirState.dir = { dx, dy };
      return dirState.dir;
    }
    const dot = dirState.dir.dx * dx + dirState.dir.dy * dy;
    if (dot > 0) {
      dirState.dir = {
        dx: dirState.dir.dx * 0.88 + dx * 0.12,
        dy: dirState.dir.dy * 0.88 + dy * 0.12,
      };
    }
    return dirState.dir;
  }

  function centerToPlaceTip(tip, dir, zoom, frac = 2 / 3) {
    const size = map.getSize();
    let fx = 0.5;
    let fy = 0.5;
    if (dir && Math.hypot(dir.dx, dir.dy) > 0.5) {
      if (Math.abs(dir.dx) >= Math.abs(dir.dy)) fx = dir.dx >= 0 ? frac : 1 - frac;
      else fy = dir.dy >= 0 ? frac : 1 - frac;
    }
    const projected = map.project(L.latLng(tip[0], tip[1]), zoom);
    const centerPt = projected
      .subtract(L.point(size.x * fx, size.y * fy))
      .add(L.point(size.x / 2, size.y / 2));
    const c = map.unproject(centerPt, zoom);
    return { lat: c.lat, lng: c.lng, zoom };
  }

  function applyRailGrowCam(park, following, tip, behind, zoom, extra = {}) {
    const { smooth = true, dt = 1 / 60, dirState = null } = extra;
    const go = (lat, lng, z, tau) => {
      if (smooth) easeCamTo(lat, lng, z, dt, tau);
      else snapCamTo(lat, lng, z);
    };
    if (park && !following && !tipPastViewportTwoThirds(tip, behind)) {
      go(park.lat, park.lng, park.zoom, 0.22);
      return false;
    }
    if (park && tip) {
      const dir = lockTravelDir(dirState, tip, behind, zoom);
      const c = centerToPlaceTip(tip, dir, zoom, 2 / 3);
      go(c.lat, c.lng, c.zoom, 0.18);
      return true;
    }
    if (tip) {
      go(tip[0], tip[1], zoom, 0.18);
      return true;
    }
    return !!following;
  }

  /**
   * 沿线进度：起步慢（不为 0）→ 加速到巡航 → 中间匀速 → 收束减速（不为 0）。
   * 返回 0..1 的里程比例。
   */
  function easeInCruiseOut(t01) {
    const t = Math.min(1, Math.max(0, t01));
    const tIn = 0.22;
    const tOut = 0.22;
    const r0 = 0.28;
    const r1 = 0.28;
    const tMid = 1 - tIn - tOut;
    const denom = (tIn * (r0 + 1)) / 2 + tMid + (tOut * (1 + r1)) / 2;
    const vCruise = 1 / denom;
    const v0 = r0 * vCruise;
    const v1 = r1 * vCruise;
    if (t <= tIn) {
      return v0 * t + ((vCruise - v0) * t * t) / (2 * tIn);
    }
    const sIn = v0 * tIn + ((vCruise - v0) * tIn) / 2;
    if (t <= tIn + tMid) {
      return sIn + vCruise * (t - tIn);
    }
    const sMid = sIn + vCruise * tMid;
    const u = t - tIn - tMid;
    return sMid + vCruise * u + ((v1 - vCruise) * u * u) / (2 * tOut);
  }

  function growDistAt(t01, totalDist, linear = false) {
    const t = Math.min(1, Math.max(0, t01));
    return (linear ? t : easeInCruiseOut(t)) * (totalDist || 1);
  }

  /** 供离线导出估算伸展时长 */
  function estimateGrowMeters(seg) {
    const full = segLatLngs(seg);
    const cum = buildCumDist(full);
    return cum[cum.length - 1] || 1;
  }

  /**
   * 离线导出：打开一段伸展（不占墙钟动画）
   * @returns {object|null} handle
   */
  function openExportGrow(seg, { followCam = true, railLook = null } = {}) {
    if (segments.has(seg.id)) return null;
    const group = L.layerGroup().addTo(root);
    const isGhost = seg.style === 'ghost';
    const isShuttle = seg.style === 'shuttle';
    const isPlanned = seg.style === 'planned';
    const isBus = seg.style === 'bus' || /快速公交|^BRT/i.test(seg.line || '');
    const weight = isBus ? 3.4 : seg.style === 'hsr' ? 7 : isShuttle || isPlanned ? 5 : isGhost ? 7 : 8;
    const full = segLatLngs(seg);
    const cum = buildCumDist(full);
    const totalDist = cum[cum.length - 1] || 1;
    const stations = seg.skipLabels
      ? []
      : snapStationsToPath(labelStations(seg), full, cum);
    const line = L.polyline(
      [],
      lineStyle({
        color: isGhost ? '#B0B4B8' : seg.color,
        weight: seg.weight ?? weight,
        opacity: isGhost ? 0.9 : isPlanned ? 0.95 : seg.opacity ?? 1,
        lineCap: isShuttle || isPlanned ? 'butt' : 'round',
        dashArray: isShuttle ? '10 8' : isPlanned ? '14 10' : null,
        smoothFactor: 0,
      })
    ).addTo(group);
    line._segActive = true;
    line._ghost = isGhost;
    line._planned = isPlanned;
    line.options._baseWeight = seg.weight ?? weight;
    const labelLayer = L.layerGroup().addTo(group);
    const bridgeLayer = L.layerGroup().addTo(group);
    const thinLabels = stations.length > 12;
    const lineColor = isGhost ? '#8A8E94' : isPlanned ? '#6a8a98' : seg.color;
    const park = railLook || null;
    const zFollow = park ? park.zoom : followZoomForLength(totalDist);
    if (followCam) {
      if (park) snapCamTo(park.lat, park.lng, park.zoom);
      else if (full[0]) snapCamTo(full[0][0], full[0][1], zFollow);
    }
    const revealed = stations.length && stations[0].dist <= 30 ? 1 : 0;
    const handle = {
      seg,
      group,
      line,
      labelLayer,
      bridgeLayer,
      full,
      cum,
      totalDist,
      stations,
      thinLabels,
      lineColor,
      isGhost,
      isPlanned,
      followCam,
      railLook: park,
      railFollowing: false,
      dirState: { dir: null },
      zFollow,
      revealed,
    };
    if (revealed) {
      releaseLabelClaims(seg.id);
      makeLabels(stations.slice(0, revealed), lineColor, {
        active: true,
        thinLabels,
        segId: seg.id,
      }).forEach((m) => m.addTo(labelLayer));
    }
    publishGrowHud(seg, [], stations.slice(0, revealed));
    return handle;
  }

  function setExportGrowProgress(handle, t01, { linear = false } = {}) {
    if (!handle) return;
    const t = Math.min(1, Math.max(0, t01));
    const dist = growDistAt(t, handle.totalDist, linear);
    handle.line.setLatLngs(pathUpToDist(handle.full, handle.cum, dist));
    paintBridgeRails(handle.bridgeLayer, handle.seg, handle.full, handle.cum, handle.stations, {
      color: handle.lineColor,
      opacity: handle.isGhost ? 0.9 : handle.isPlanned ? 0.95 : 1,
      progressDist: dist,
      line: handle.line,
    });
    if (handle.followCam) {
      const look = Math.min(handle.totalDist, dist + Math.min(220, handle.totalDist * 0.03));
      const tipPts = pathUpToDist(handle.full, handle.cum, look);
      const backPts = pathUpToDist(handle.full, handle.cum, Math.max(0, look - 400));
      const tip = tipPts[tipPts.length - 1];
      const behind = backPts[backPts.length - 1];
      handle.railFollowing = applyRailGrowCam(
        handle.railLook,
        handle.railFollowing,
        tip,
        behind,
        handle.zFollow,
        { smooth: false, dirState: handle.dirState }
      );
    }
    let revealed = handle.revealed;
    while (revealed < handle.stations.length && handle.stations[revealed].dist <= dist + 8) {
      revealed += 1;
    }
    if (revealed !== handle.revealed) {
      handle.revealed = revealed;
      releaseLabelClaims(handle.seg.id);
      handle.labelLayer.clearLayers();
      if (revealed > 0) {
        makeLabels(handle.stations.slice(0, revealed), handle.lineColor, {
          active: true,
          thinLabels: handle.thinLabels,
          segId: handle.seg.id,
        }).forEach((m) => m.addTo(handle.labelLayer));
      }
    }
    publishGrowHud(
      handle.seg,
      pathUpToDist(handle.full, handle.cum, dist),
      handle.stations.slice(0, handle.revealed)
    );
  }

  function closeExportGrow(handle) {
    if (!handle) return;
    handle.line.setLatLngs(handle.full);
    paintBridgeRails(handle.bridgeLayer, handle.seg, handle.full, handle.cum, handle.stations, {
      color: handle.lineColor,
      opacity: handle.isGhost ? 0.9 : handle.isPlanned ? 0.95 : 1,
      progressDist: handle.totalDist,
      line: handle.line,
    });
    releaseLabelClaims(handle.seg.id);
    handle.labelLayer.clearLayers();
    makeLabels(handle.stations, handle.lineColor, {
      active: true,
      thinLabels: handle.thinLabels,
      segId: handle.seg.id,
    }).forEach((m) => m.addTo(handle.labelLayer));
    if (handle.followCam && handle.railLook && !handle.railFollowing) {
      snapCamTo(handle.railLook.lat, handle.railLook.lng, handle.railLook.zoom);
    } else if (handle.followCam && handle.full.length) {
      const end = handle.full[handle.full.length - 1];
      snapCamTo(end[0], end[1], handle.zFollow);
    }
    rememberSegment(handle.seg, {
      group: handle.group,
      line: handle.line,
      labelLayer: handle.labelLayer,
      bridgeLayer: handle.bridgeLayer,
      latlngs: handle.full,
      stations: handle.stations,
    });
    finishGrowHud(handle.seg.id);
    relayoutAllLabels(true);
  }

  function camPointAlong(path, t01) {
    const pts = (path || [])
      .map((p) => ({ lat: p.lat ?? p[0], lng: p.lng ?? p[1] }))
      .filter((p) => p.lat != null && p.lng != null);
    if (!pts.length) return null;
    if (pts.length === 1 || t01 <= 0) return pts[0];
    if (t01 >= 1) return pts[pts.length - 1];
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i].lat - pts[i - 1].lat, pts[i].lng - pts[i - 1].lng));
    }
    const dist = t01 * (cum[cum.length - 1] || 1);
    let i = 1;
    while (i < cum.length && cum[i] < dist) i++;
    const a = pts[i - 1];
    const b = pts[i] || a;
    const span = Math.max(cum[i] - cum[i - 1], 1e-9);
    const u = (dist - cum[i - 1]) / span;
    return { lat: a.lat + (b.lat - a.lat) * u, lng: a.lng + (b.lng - a.lng) * u };
  }

  function applyCamSweep(tCam, tGrow, { path, zoom, handles, speed = 1, elapsedSec, smooth = false, dt = 1 / 60 } = {}) {
    const pt = camPointAlong(path, tCam);
    if (pt) {
      const z = zoom ?? map.getZoom();
      if (smooth) easeCamTo(pt.lat, pt.lng, z, dt, 0.16);
      else snapCamTo(pt.lat, pt.lng, z);
    }
    if (elapsedSec != null) {
      for (const handle of handles || []) {
        const dur = growDurationSec(handle.totalDist, speed);
        setExportGrowProgress(handle, elapsedSec / Math.max(dur, 0.01));
      }
      return;
    }
    if (tGrow != null) {
      for (const handle of handles || []) setExportGrowProgress(handle, tGrow);
    }
  }

  /** 镜头沿路径走；每条线按全长伸展（起步慢→中间匀速→收束慢） */
  async function growAlongCam(segs, { duration = 10, from, to, path, zoom, speed = 1 } = {}) {
    const pending = (segs || []).filter((s) => s && !segments.has(s.id));
    growCancel = false;
    const handles = [];
    for (const seg of pending) {
      const handle = openExportGrow(seg, { followCam: false });
      if (handle) handles.push(handle);
    }
    const waypoints = path?.length >= 2 ? path : from && to ? [from, to] : null;
    if (!waypoints) {
      for (const handle of handles) closeExportGrow(handle);
      return;
    }
    const z = zoom ?? from?.zoom ?? map.getZoom();
    const start = camPointAlong(waypoints, 0);
    if (start) snapCamTo(start.lat, start.lng, z);
    const camMs = Math.max(0.4, duration) * 1000;
    const growMs = Math.max(
      ...handles.map((h) => growDurationSec(h.totalDist, speed) * 1000),
      400
    );
    const totalMs = Math.max(camMs, growMs);
    const t0 = performance.now();
    let lastNow = t0;
    await new Promise((resolve) => {
      const tick = (now) => {
        if (growCancel) {
          resolve();
          return;
        }
        const elapsed = now - t0;
        const dt = Math.min(0.05, (now - lastNow) / 1000);
        lastNow = now;
        applyCamSweep(Math.min(1, elapsed / camMs), null, {
          path: waypoints,
          zoom: z,
          handles,
          speed,
          elapsedSec: elapsed / 1000,
          smooth: true,
          dt,
        });
        if (elapsed < totalMs) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    for (const handle of handles) closeExportGrow(handle);
  }

  /**
   * 按全线长度定总时长；起步慢→中间匀速→收束慢；镜头放大并跟随线头
   */
  async function growSegment(seg, { animate, speed = 1, followCam = true, railLook = null }) {
    if (segments.has(seg.id)) return;

    const group = L.layerGroup().addTo(root);
    const isGhost = seg.style === 'ghost';
    const isShuttle = seg.style === 'shuttle';
    const isPlanned = seg.style === 'planned';
    const isBus = seg.style === 'bus' || /快速公交|^BRT/i.test(seg.line || '');
    const weight = isBus ? 3.4 : seg.style === 'hsr' ? 7 : isShuttle || isPlanned ? 5 : isGhost ? 7 : 8;
    const full = segLatLngs(seg);
    const cum = buildCumDist(full);
    const totalDist = cum[cum.length - 1] || 1;
    const stations = seg.skipLabels
      ? []
      : snapStationsToPath(labelStations(seg), full, cum);
    const line = L.polyline(
      [],
      lineStyle({
        color: isGhost ? '#B0B4B8' : seg.color,
        weight: seg.weight ?? weight,
        opacity: isGhost ? 0.9 : isPlanned ? 0.95 : seg.opacity ?? 1,
        lineCap: isShuttle || isPlanned ? 'butt' : 'round',
        dashArray: isShuttle ? '10 8' : isPlanned ? '14 10' : null,
        smoothFactor: 0,
      })
    ).addTo(group);
    line._segActive = true;
    line._ghost = isGhost;
    line._planned = isPlanned;
    line.options._baseWeight = seg.weight ?? weight;

    const labelLayer = L.layerGroup().addTo(group);
    const bridgeLayer = L.layerGroup().addTo(group);
    const thinLabels = stations.length > 12;
    const lineColor = isGhost ? '#8A8E94' : isPlanned ? '#6a8a98' : seg.color;
    const zFollow = railLook ? railLook.zoom : followZoomForLength(totalDist);

    const paintLabels = (n) => {
      releaseLabelClaims(seg.id);
      labelLayer.clearLayers();
      if (n <= 0) return;
      makeLabels(stations.slice(0, n), lineColor, {
        active: true,
        thinLabels,
        segId: seg.id,
      }).forEach((m) => m.addTo(labelLayer));
    };

    const tipOf = (dist) => {
      const pts = pathUpToDist(full, cum, dist);
      return pts[pts.length - 1];
    };

    const paintBridges = (dist) => {
      paintBridgeRails(bridgeLayer, seg, full, cum, stations, {
        color: lineColor,
        opacity: isGhost ? 0.9 : isPlanned ? 0.95 : 1,
        progressDist: dist,
        line,
      });
    };

    if (!animate || full.length < 2) {
      line.setLatLngs(full);
      paintLabels(stations.length);
      paintBridges(totalDist);
      rememberSegment(seg, { group, line, labelLayer, bridgeLayer, latlngs: full, stations });
      finishGrowHud(seg.id);
      relayoutAllLabels();
      return;
    }

    growCancel = false;
    // 先平滑落到起点，再伸展；长铁路停在中央，线头过 2/3 后缓动跟拍
    if (followCam) {
      const dest = railLook || { lat: full[0][0], lng: full[0][1], zoom: zFollow };
      const here = map.getCenter();
      const far =
        Math.hypot((here.lat - dest.lat) * 111320, (here.lng - dest.lng) * 85000) > 700 ||
        Math.abs(map.getZoom() - dest.zoom) > 1.1;
      if (far) await flyTo(dest.lng, dest.lat, dest.zoom, railLook ? 0.55 : 0.42);
      if (growCancel) {
        rememberSegment(seg, { group, line, labelLayer, bridgeLayer, latlngs: full, stations });
        finishGrowHud(seg.id);
        return;
      }
      snapCamTo(dest.lat, dest.lng, dest.zoom);
    }

    const durationSec = growDurationSec(totalDist, speed);

    let revealed = 0;
    let railFollowing = false;
    const dirState = { dir: null };

    if (stations.length && stations[0].dist <= 30) {
      revealed = 1;
      paintLabels(1);
    }
    publishGrowHud(seg, [full[0]], stations.slice(0, revealed));

    await new Promise((resolve) => {
      const t0 = performance.now();
      let lastNow = t0;
      const tick = (now) => {
        if (growCancel) {
          line.setLatLngs(full);
          paintLabels(stations.length);
          paintBridges(totalDist);
          resolve();
          return;
        }
        const dt = Math.min(0.05, (now - lastNow) / 1000);
        lastNow = now;
        const t = Math.min(1, (now - t0) / 1000 / durationSec);
        const dist = growDistAt(t, totalDist);
        line.setLatLngs(pathUpToDist(full, cum, dist));
        paintBridges(dist);

        if (followCam) {
          const look = Math.min(totalDist, dist + Math.min(220, totalDist * 0.03));
          railFollowing = applyRailGrowCam(
            railLook,
            railFollowing,
            tipOf(look),
            tipOf(Math.max(0, look - 400)),
            zFollow,
            { smooth: true, dt, dirState }
          );
        }

        let changed = false;
        while (revealed < stations.length && stations[revealed].dist <= dist + 8) {
          revealed += 1;
          changed = true;
        }
        if (changed) paintLabels(revealed);
        publishGrowHud(seg, pathUpToDist(full, cum, dist), stations.slice(0, revealed));

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          line.setLatLngs(full);
          paintLabels(stations.length);
          paintBridges(totalDist);
          if (followCam && railLook && !railFollowing) {
            easeCamTo(railLook.lat, railLook.lng, railLook.zoom, 0.016, 0.2);
          } else if (followCam) {
            const end = full[full.length - 1];
            easeCamTo(end[0], end[1], zFollow, 0.016, 0.2);
          }
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });

    rememberSegment(seg, { group, line, labelLayer, bridgeLayer, latlngs: full, stations });
    finishGrowHud(seg.id);
    relayoutAllLabels();
  }

  /** 多段同时按各自全长伸展（起步慢→中间匀速→收束慢） */
  async function growParallel(segs, { speed = 1, focus } = {}) {
    growCancel = false;
    const handles = [];
    for (const seg of segs || []) {
      if (!seg || segments.has(seg.id)) continue;
      const handle = openExportGrow(seg, { followCam: false });
      if (handle) handles.push(handle);
    }
    if (focus) {
      await flyTo(focus.lng, focus.lat, focus.zoom ?? 16, 0.55);
    }
    const durationSec = Math.max(
      ...handles.map((h) => growDurationSec(h.totalDist, speed)),
      0.4
    );
    const t0 = performance.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        if (growCancel) {
          resolve();
          return;
        }
        const elapsed = (now - t0) / 1000;
        for (const handle of handles) {
          const dur = growDurationSec(handle.totalDist, speed);
          setExportGrowProgress(handle, elapsed / Math.max(dur, 0.01));
        }
        if (elapsed < durationSec) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    for (const handle of handles) closeExportGrow(handle);
  }

  function pointToPathDeg2(lat, lng, path) {
    let best = Infinity;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const abx = b[1] - a[1];
      const aby = b[0] - a[0];
      const apx = lng - a[1];
      const apy = lat - a[0];
      const ab2 = abx * abx + aby * aby || 1e-12;
      const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
      const dx = lng - (a[1] + abx * t);
      const dy = lat - (a[0] + aby * t);
      const d2 = dx * dx + dy * dy;
      if (d2 < best) best = d2;
    }
    return best;
  }

  function pathCoveredBy(short, long, maxDeg = 0.0004) {
    if (!short?.length || !long?.length || short.length < 2 || long.length < 2) return false;
    const max2 = maxDeg * maxDeg;
    const step = Math.max(1, Math.floor(short.length / 28));
    let n = 0;
    let hit = 0;
    for (let i = 0; i < short.length; i += step) {
      n++;
      if (pointToPathDeg2(short[i][0], short[i][1], long) <= max2) hit++;
    }
    return n > 0 && hit / n >= 0.82;
  }

  function sameDrawnLine(a, b) {
    if (!a || !b) return false;
    if ((a.style || '') !== (b.style || '')) return false;
    if (a.line && b.line && a.line !== b.line) return false;
    if (a.cityId && b.cityId && a.cityId !== b.cityId) return false;
    return true;
  }

  function namedStationCount(segOrRec) {
    const sts = segOrRec?.stations || segOrRec?.seg?.stations || [];
    return sts.filter((s) => s?.name && !s.silent).length;
  }

  function dropCoveredLineCopies(seg, latlngs) {
    if (!latlngs || latlngs.length < 2) return false;
    if (seg.keepBranch || seg.style === 'bus' || seg.osmFull) return false;
    if (/轻轨|轻铁|轻便|有轨|tram|导轨|西郊线|云巴|缆车|纜車/i.test(seg.line || '')) return false;
    const newN = namedStationCount(seg);
    for (const rec of [...segments.values()]) {
      if (!sameDrawnLine(seg, rec.seg) || rec.seg.id === seg.id) continue;
      const oldN = namedStationCount(rec);
      if (pathCoveredBy(latlngs, rec.latlngs)) {
        if (newN >= 2 && newN > oldN) continue;
        if (seg.color && seg.color !== '#4a90d9') {
          rec.seg.color = seg.color;
          rec.line.setStyle({ color: seg.color });
        }
        if (seg.line) rec.seg.line = seg.line;
        return true;
      }
      if (pathCoveredBy(rec.latlngs, latlngs) && newN >= oldN && newN >= 2) {
        removeSegment(rec.seg.id, { deferLabels: true });
      }
    }
    return false;
  }

  function flattenLatLngs(ll) {
    if (!ll?.length) return [];
    return Array.isArray(ll[0]?.[0]) ? ll : [ll];
  }

  function latlngsBBox(ll) {
    let s = 90;
    let n = -90;
    let w = 180;
    let e = -180;
    for (const p of flattenLatLngs(ll).flat()) {
      const lat = +p[0];
      const lng = +p[1];
      if (lat < s) s = lat;
      if (lat > n) n = lat;
      if (lng < w) w = lng;
      if (lng > e) e = lng;
    }
    return { s, n, w, e };
  }

  function bboxHits(bb, bounds) {
    return bb.n >= bounds.getSouth() && bb.s <= bounds.getNorth() && bb.e >= bounds.getWest() && bb.w <= bounds.getEast();
  }

  function clearBusLayers() {
    busRoot.clearLayers();
    busLayers.clear();
    busEndLayer.clearLayers();
    if (map.hasLayer(busEndLayer)) map.removeLayer(busEndLayer);
    busPaintToken = 0;
    invalidateViewportSync();
  }

  function busMinZoom() {
    return busFullLoad ? BUS_FULL_MIN_ZOOM : BUS_MIN_ZOOM;
  }

  function busLayerBudget() {
    return busFullLoad ? BUS_FULL_LAYER_BUDGET : BUS_LAYER_BUDGET;
  }

  function setBusFullLoad(on) {
    busFullLoad = !!on;
    busPaintToken = 0;
    invalidateViewportSync();
    scheduleBusSync();
    return busFullLoad;
  }

  function setRailFullLoad(on) {
    railFullLoad = !!on;
    railPaintToken = 0;
    invalidateViewportSync();
    scheduleRailSync();
    return railFullLoad;
  }

  function paintBusTermini() {
    busEndLayer.clearLayers();
    if (map.getZoom() < busMinZoom()) return;
    if (modeFilters.size && !modeAllows('bus')) return;
    if (!namesVisibleAtZoom() && !hasLineFocus()) return;
    if (!map.hasLayer(busEndLayer)) busEndLayer.addTo(map);
    const placed = [];
    const claimed = new Set();
    const items = [];
    for (const [id, line] of busLayers) {
      const rec = busIndex.get(id);
      if (!rec?.latlngs?.length) continue;
      const sts = (rec.seg.stations || []).filter((s) => s?.name);
      if (sts.length < 2) continue;
      const focused = hasLineFocus() && recMatchesFocus({ seg: rec.seg });
      if (hasLineFocus() && !focused && !namesVisibleAtZoom()) continue;
      items.push({ rec, line, focused, sts });
    }
    items.sort((a, b) => Number(b.focused) - Number(a.focused));
    let n = 0;
    for (const { rec, focused, sts } of items) {
      const ll = rec.latlngs;
      const ends = [
        { name: sts[0].name, at: ll[0] },
        { name: sts[sts.length - 1].name, at: ll[ll.length - 1] },
      ];
      for (const end of ends) {
        const key = String(end.name).toLowerCase();
        if (!focused && claimed.has(key)) continue;
        const pt = map.latLngToContainerPoint(end.at);
        if (!focused && placed.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 28)) continue;
        claimed.add(key);
        placed.push(pt);
        const color = rec.seg.color || '#E85D04';
        const icon = L.divIcon({
          className: `st-label side-above bus-end-label${focused ? ' is-active' : ' is-past'}`,
          html: `<i class="st-dot" style="--c:${color}"></i><span class="st-name">${escTag(end.name)}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        L.marker(end.at, { icon, interactive: false, keyboard: false }).addTo(busEndLayer);
        n += 1;
        if (n >= 80) {
          busEndLayer.bringToFront();
          return;
        }
      }
    }
    busEndLayer.bringToFront();
  }

  function applyBusLineOpacity() {
    for (const [id, line] of busLayers) {
      const rec = busIndex.get(id);
      if (!rec) continue;
      const op = recFocusOpacity({ seg: rec.seg, line });
      line.setStyle({ opacity: op });
      if (hasLineFocus() && recMatchesFocus({ seg: rec.seg })) line.bringToFront?.();
    }
  }

  function registerBuses(segs) {
    if (!segs?.length) return;
    for (const seg of segs) {
      if (!seg?.id || busIndex.has(seg.id)) continue;
      const latlngs = (seg.path || []).map((p) => (Array.isArray(p) ? [p[0], p[1]] : [p.lat, p.lng]));
      if (latlngs.length < 2) continue;
      const cum = buildCumDist(latlngs);
      busIndex.set(seg.id, {
        seg,
        latlngs,
        drawLatLngs: thinLatLngs(latlngs, 48),
        bbox: latlngsBBox(latlngs),
        meters: cum[cum.length - 1] || 0,
      });
    }
    busPaintToken = 0;
    scheduleBusSync();
  }

  function makeBusPolyline(rec) {
    const smooth = busFullLoad ? 2.8 : 1.4;
    const line = L.polyline(
      drawLatLngsFor(rec, { bus: true }),
      lineStyle({
        color: rec.seg.color || '#E85D04',
        weight: rec.seg.weight ?? 3.4,
        opacity: 1,
        smoothFactor: smooth,
      })
    );
    line._bus = true;
    line._busId = rec.seg.id;
    line.options._baseWeight = rec.seg.weight ?? 3.4;
    line.options._baseOpacity = 1;
    return line;
  }

  function syncViewportBuses() {
    if (modeFilters.size && !modeAllows('bus')) {
      if (busLayers.size) clearBusLayers();
      return;
    }
    if (map.getZoom() < busMinZoom()) {
      if (busLayers.size) clearBusLayers();
      return;
    }

    // 全量：按里程挂一次，缩放不再裁剪/重挂
    if (busFullLoad) {
      const token = busIndex.size;
      if (busPaintToken === token && busLayers.size) {
        applyBusLineOpacity();
        if (!mapZoomFrozen) paintBusTermini();
        return;
      }
      const scored = [];
      for (const rec of busIndex.values()) {
        scored.push({ rec, meters: rec.meters || 0 });
      }
      scored.sort((a, b) => b.meters - a.meters);
      const budget = busLayerBudget();
      const keep = new Set(scored.slice(0, budget).map((x) => x.rec.seg.id));
      for (const [id, line] of [...busLayers]) {
        if (keep.has(id)) continue;
        busRoot.removeLayer(line);
        busLayers.delete(id);
      }
      for (const { rec } of scored.slice(0, budget)) {
        const id = rec.seg.id;
        if (busLayers.has(id)) continue;
        const line = makeBusPolyline(rec);
        line.addTo(busRoot);
        busLayers.set(id, line);
      }
      busPaintToken = token;
      applyBusLineOpacity();
      if (!mapZoomFrozen) paintBusTermini();
      return;
    }

    const bounds = map.getBounds().pad(0.2);
    const c = bounds.getCenter();
    const scored = [];
    for (const rec of busIndex.values()) {
      if (!bboxHits(rec.bbox, bounds)) continue;
      const midLat = (rec.bbox.s + rec.bbox.n) / 2;
      const midLng = (rec.bbox.w + rec.bbox.e) / 2;
      scored.push({ rec, d: Math.hypot(midLat - c.lat, midLng - c.lng), meters: rec.meters || 0 });
    }
    scored.sort((a, b) => a.d - b.d);
    const keep = new Set(scored.slice(0, busLayerBudget()).map((x) => x.rec.seg.id));
    const same = keep.size === busLayers.size && [...keep].every((id) => busLayers.has(id));
    if (!same) {
      for (const [id, line] of [...busLayers]) {
        if (keep.has(id)) continue;
        busRoot.removeLayer(line);
        busLayers.delete(id);
      }
      for (const { rec } of scored) {
        const id = rec.seg.id;
        if (!keep.has(id) || busLayers.has(id)) continue;
        const line = makeBusPolyline(rec);
        line.addTo(busRoot);
        busLayers.set(id, line);
      }
    }
    applyBusLineOpacity();
    if (!mapZoomFrozen) paintBusTermini();
  }

  function scheduleBusSync() {
    invalidateViewportSync();
    scheduleViewportLayers(80);
  }

  function clearRailLayers() {
    railRoot.clearLayers();
    railLayers.clear();
    railPaintToken = 0;
    invalidateViewportSync();
  }

  function applyRailLineOpacity() {
    for (const [id, line] of railLayers) {
      const rec = railIndex.get(id);
      if (!rec) continue;
      const op = recFocusOpacity({ seg: rec.seg, line });
      line.setStyle({ opacity: op });
      if (hasLineFocus() && recMatchesFocus({ seg: rec.seg })) line.bringToFront?.();
    }
  }

  function makeRailPolyline(rec) {
    const planned = rec.seg.style === 'planned';
    const highspeed = rec.seg.highspeed || rec.seg.style === 'hsr';
    const weight = rec.seg.weight ?? (planned ? (highspeed ? 3.6 : 2.2) : highspeed ? 5.2 : 2.5);
    const line = L.polyline(
      drawLatLngsFor(rec),
      lineStyle({
        color: rec.seg.color || (highspeed ? '#C0392B' : '#5D6D7E'),
        weight,
        opacity: planned ? 0.78 : 0.92,
        dashArray: planned ? '12 9' : null,
        lineCap: planned ? 'butt' : 'round',
        smoothFactor: railFullLoad ? 2.6 : 1.5,
      })
    );
    line._rail = true;
    line._railId = rec.seg.id;
    line.options._baseWeight = weight;
    line.options._baseOpacity = planned ? 0.78 : 0.92;
    return line;
  }

  function registerRails(segs) {
    if (!segs?.length) return;
    for (const seg of segs) {
      if (!seg?.id || railIndex.has(seg.id) || busIndex.has(seg.id)) continue;
      const rings = flattenLatLngs(seg.path || []).filter((ring) => ring.length >= 2);
      if (!rings.length) continue;
      const latlngs = rings.length === 1 ? rings[0] : rings;
      const cum = buildCumDist(rings.flat());
      railIndex.set(seg.id, {
        seg,
        latlngs,
        drawLatLngs: thinLatLngs(Array.isArray(latlngs[0]?.[0]) ? latlngs : latlngs, 80),
        bbox: latlngsBBox(latlngs),
        meters: cum[cum.length - 1] || 0,
      });
    }
    railPaintToken = 0;
    scheduleRailSync();
  }

  function syncViewportRails() {
    if (modeFilters.size && !modeAllows('hsr')) {
      if (railLayers.size) clearRailLayers();
      return;
    }

    if (railFullLoad) {
      const token = railIndex.size;
      if (railPaintToken === token && railLayers.size) {
        applyRailLineOpacity();
        return;
      }
      const scored = [];
      for (const rec of railIndex.values()) {
        const hs = rec.seg.highspeed || rec.seg.style === 'hsr' ? 0 : 1;
        const plan = rec.seg.style === 'planned' ? 1 : 0;
        scored.push({ rec, hs, plan, meters: rec.meters || 0 });
      }
      scored.sort((a, b) => a.hs - b.hs || a.plan - b.plan || b.meters - a.meters);
      const budget = RAIL_FULL_LAYER_BUDGET;
      const keep = new Set(scored.slice(0, budget).map((x) => x.rec.seg.id));
      for (const [id, line] of [...railLayers]) {
        if (keep.has(id)) continue;
        railRoot.removeLayer(line);
        railLayers.delete(id);
      }
      for (const { rec } of scored.slice(0, budget)) {
        const id = rec.seg.id;
        if (railLayers.has(id)) continue;
        const line = makeRailPolyline(rec);
        line.addTo(railRoot);
        railLayers.set(id, line);
      }
      railPaintToken = token;
      applyRailLineOpacity();
      return;
    }

    const z = map.getZoom();
    const bounds = map.getBounds().pad(z >= 8 ? 0.18 : 0.04);
    const c = bounds.getCenter();
    const scored = [];
    for (const rec of railIndex.values()) {
      if (!bboxHits(rec.bbox, bounds)) continue;
      const midLat = (rec.bbox.s + rec.bbox.n) / 2;
      const midLng = (rec.bbox.w + rec.bbox.e) / 2;
      const hs = rec.seg.highspeed || rec.seg.style === 'hsr' ? 0 : 1;
      const plan = rec.seg.style === 'planned' ? 1 : 0;
      scored.push({ rec, d: Math.hypot(midLat - c.lat, midLng - c.lng), hs, plan, meters: rec.meters });
    }
    scored.sort((a, b) => a.hs - b.hs || a.plan - b.plan || b.meters - a.meters || a.d - b.d);
    const budget = z < 6 ? RAIL_LAYER_BUDGET : z < 8 ? 2200 : 1600;
    const keep = new Set(scored.slice(0, budget).map((x) => x.rec.seg.id));
    const same = keep.size === railLayers.size && [...keep].every((id) => railLayers.has(id));
    if (!same) {
      for (const [id, line] of [...railLayers]) {
        if (keep.has(id)) continue;
        railRoot.removeLayer(line);
        railLayers.delete(id);
      }
      for (const { rec } of scored) {
        const id = rec.seg.id;
        if (!keep.has(id) || railLayers.has(id)) continue;
        const line = makeRailPolyline(rec);
        line.addTo(railRoot);
        railLayers.set(id, line);
      }
    }
    applyRailLineOpacity();
  }

  function scheduleRailSync() {
    invalidateViewportSync();
    scheduleViewportLayers(80);
  }

  function addSegmentStatic(seg, { deferLabels = false } = {}) {
    if (segments.has(seg.id) || busIndex.has(seg.id) || railIndex.has(seg.id)) return;
    const isGhost = seg.style === 'ghost';
    const isShuttle = seg.style === 'shuttle';
    const isPlanned = seg.style === 'planned';
    const isBus = seg.style === 'bus' || /快速公交|^BRT/i.test(seg.line || '');
    if (isBus) {
      registerBuses([seg]);
      return;
    }
    if (seg.networkRail) {
      registerRails([seg]);
      return;
    }
    const weight =
      seg.weight ??
      (isBus ? 3.4 : seg.style === 'hsr' ? 6 : isShuttle || isPlanned ? 5 : isGhost ? 7 : 7);
    const latlngs = segLatLngs(seg);
    if (dropCoveredLineCopies(seg, latlngs)) return;
    const group = L.layerGroup().addTo(root);
    const stations = stationsForDraw(seg, latlngs);
    const lineColor = isGhost ? '#B0B4B8' : seg.color;
    const line = L.polyline(
      latlngs,
      lineStyle({
        color: lineColor,
        weight,
        opacity: isGhost ? 0.85 : isPlanned ? 0.72 : seg.opacity ?? 1,
        lineCap: isShuttle || isPlanned ? 'butt' : 'round',
        dashArray: isShuttle ? '10 8' : isPlanned ? '14 10' : null,
        smoothFactor: segments.size > 400 || busFullLoad || railFullLoad ? 2.2 : 1.35,
      })
    ).addTo(group);
    line._ghost = isGhost;
    line._planned = isPlanned;
    line.options._baseWeight = weight;
    line.options._baseOpacity = isGhost ? 0.85 : isPlanned ? 0.72 : seg.opacity ?? 1;

    const labelLayer = L.layerGroup().addTo(group);
    const bridgeLayer = L.layerGroup().addTo(group);

    rememberSegment(seg, { group, line, labelLayer, bridgeLayer, latlngs, stations });
    applyRecLineOpacity(segments.get(seg.id));
    if (modeFilters.size && !modeAllows(classifyTransitMode(seg))) {
      map.removeLayer(group);
    }
    if (!deferLabels) relayoutAllLabels();
  }

  function addCityMarker(_city) {
    /* 图上不再打城市名 */
  }

  function invalidate() {
    map.invalidateSize({ pan: false });
  }

  function bindMobileMapSize() {
    const bump = () => {
      try {
        map.invalidateSize({ pan: false });
      } catch {
        /* */
      }
    };
    window.addEventListener('resize', bump, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(bump, 200));
    window.visualViewport?.addEventListener('resize', bump, { passive: true });
    setTimeout(bump, 60);
    setTimeout(bump, 320);
  }
  bindMobileMapSize();

  function notifyEdit() {
    onEditChange?.({
      selected,
      tool: editTool,
      edits: loadEdits(),
      segmentIds: [...segments.keys()],
    });
  }

  /** 在折线最近边上插入点，返回新下标 */
  function insertVertexAt(latlngs, latlng) {
    const lat = latlng.lat;
    const lng = latlng.lng;
    let bestI = 0;
    let bestD = Infinity;
    let bestT = 0;
    for (let i = 1; i < latlngs.length; i++) {
      const a = latlngs[i - 1];
      const b = latlngs[i];
      const abx = b[1] - a[1];
      const aby = b[0] - a[0];
      const apx = lng - a[1];
      const apy = lat - a[0];
      const ab2 = abx * abx + aby * aby || 1e-12;
      const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
      const plat = a[0] + aby * t;
      const plng = a[1] + abx * t;
      const d = Math.hypot(plat - lat, plng - lng);
      if (d < bestD) {
        bestD = d;
        bestI = i;
        bestT = t;
      }
    }
    const a = latlngs[bestI - 1];
    const b = latlngs[bestI];
    const mid = [a[0] + (b[0] - a[0]) * bestT, a[1] + (b[1] - a[1]) * bestT];
    // 若点得离边很远，直接插点击位置
    const use = bestD < 0.008 ? mid : [lat, lng];
    latlngs.splice(bestI, 0, use);
    return bestI;
  }

  function nearestVertexIndex(latlngs, lat, lng) {
    let index = 0;
    let dist = Infinity;
    for (let i = 0; i < latlngs.length; i++) {
      const d = Math.hypot(latlngs[i][0] - lat, latlngs[i][1] - lng);
      if (d < dist) {
        dist = d;
        index = i;
      }
    }
    return { index, dist };
  }

  /** 把站放进折线：复用近点，否则插进最近边，绝不接到线路末端 */
  function placeStationOnPath(latlngs, lat, lng) {
    if (!latlngs.length) {
      latlngs.push([lat, lng]);
      return 0;
    }
    if (latlngs.length === 1) {
      latlngs.push([lat, lng]);
      return 1;
    }
    const nv = nearestVertexIndex(latlngs, lat, lng);
    if (nv.dist < 0.00035) {
      latlngs[nv.index] = [lat, lng];
      return nv.index;
    }
    return insertVertexAt(latlngs, { lat, lng });
  }

  /** 只有站就在折点上时才跟着拖线，自由站不插入折线 */
  function moveStationVertex(latlngs, st, lat, lng) {
    if (!latlngs?.length) return;
    const from = nearestVertexIndex(latlngs, st.lat, st.lng);
    if (from.dist >= 0.0008) return;
    latlngs[from.index] = [lat, lng];
    st.pathIndex = from.index;
  }

  function samePt(a, b) {
    return Math.hypot((a.lat ?? a[0]) - (b.lat ?? b[0]), (a.lng ?? a[1]) - (b.lng ?? b[1])) < 0.00008;
  }

  function snapToNode(latlng, maxD = 0.0025) {
    let best = null;
    let bestD = maxD;
    for (const rec of segments.values()) {
      for (const st of rec.stations || []) {
        if (st.lat == null || st.lng == null) continue;
        const d = Math.hypot(st.lat - latlng.lat, st.lng - latlng.lng);
        if (d < bestD) {
          bestD = d;
          best = {
            type: 'station',
            lat: st.lat,
            lng: st.lng,
            name: st.name,
            segId: rec.seg.id,
            dist: d,
          };
        }
      }
      for (let i = 0; i < (rec.latlngs || []).length; i++) {
        const d = Math.hypot(rec.latlngs[i][0] - latlng.lat, rec.latlngs[i][1] - latlng.lng);
        if (d < bestD) {
          bestD = d;
          best = {
            type: 'vertex',
            lat: rec.latlngs[i][0],
            lng: rec.latlngs[i][1],
            segId: rec.seg.id,
            index: i,
            dist: d,
          };
        }
      }
    }
    return best;
  }

  function alreadyConnected(a, b) {
    for (const rec of segments.values()) {
      const pts = rec.latlngs || [];
      for (let i = 1; i < pts.length; i++) {
        const p = { lat: pts[i - 1][0], lng: pts[i - 1][1] };
        const q = { lat: pts[i][0], lng: pts[i][1] };
        if ((samePt(p, a) && samePt(q, b)) || (samePt(p, b) && samePt(q, a))) return true;
      }
    }
    return false;
  }

  function createConnectSegment(a, b) {
    if (!a || !b || samePt(a, b) || alreadyConnected(a, b)) return null;
    const id = `extra-${Date.now().toString(36)}`;
    const fromRec = segments.get(a.segId) || segments.get(b.segId);
    const color = fromRec?.seg?.color || segments.get('hk-lrt')?.seg?.color || '#C8811A';
    const lineName = fromRec?.seg?.line || '轻铁';
    const path = [
      [a.lat, a.lng],
      [b.lat, b.lng],
    ];
    const stations = [];
    if (a.name) stations.push({ name: a.name, lat: a.lat, lng: a.lng, keepCoords: true });
    if (b.name && b.name !== a.name) {
      stations.push({ name: b.name, lat: b.lat, lng: b.lng, keepCoords: true });
    }
    const year = editSceneYear;
    const open = editSceneDate || `${editSceneYear}-12-31`;
    upsertExtraLine({ id, line: lineName, color, year, open, path });
    setPathOverride(id, path);
    addSegmentStatic({ id, line: lineName, color, stations, path });
    return id;
  }

  function pickConnectNode(node) {
    if (!node) return;
    if (!pendingConnect) {
      pendingConnect = node;
      selected = { type: 'pending-connect', ...node };
      refreshEditHandles();
      notifyEdit();
      return;
    }
    if (samePt(pendingConnect, node)) return;
    const id = createConnectSegment(pendingConnect, node);
    pendingConnect = null;
    selected = id ? { type: 'vertex', segId: id, index: 1 } : null;
    refreshEditHandles();
    notifyEdit();
  }

  function ensureStationHome() {
    if (selected?.segId && segments.has(selected.segId) && !String(selected.segId).startsWith('extra-')) {
      return selected.segId;
    }
    if (selected?.segId && segments.has(selected.segId)) return selected.segId;
    if (segments.has('hk-lrt')) return 'hk-lrt';
    const held = extraLinesList().find((l) => l.id === 'extra-lrt' || l.line === '轻铁');
    if (held && segments.has(held.id)) return held.id;
    const id = 'extra-lrt';
    upsertExtraLine({ id, line: '轻铁', color: '#C8811A', year: 1988, path: [] });
    if (!segments.has(id)) {
      addSegmentStatic({ id, line: '轻铁', color: '#C8811A', stations: [], path: [] });
    }
    return id;
  }

  function refreshEditHandles() {
    editRoot.clearLayers();
    if (!editEnabled) return;

    for (const [segId, rec] of segments) {
      const { latlngs, stations, seg, line } = rec;
      const color = seg.style === 'ghost' ? '#8A8E94' : seg.color;

      if (
        editTool === 'station' ||
        editTool === 'select' ||
        editTool === 'add-station' ||
        editTool === 'draw' ||
        editTool === 'new-line'
      ) {
        stations.forEach((st, si) => {
          if (!st.name) return;
          const isSel =
            (selected?.type === 'station' && selected.segId === segId && selected.index === si) ||
            (selected?.type === 'pending-connect' &&
              selected.name &&
              selected.name === st.name &&
              selected.segId === segId);
          const fill =
            isSel ? '#E8A838' : st.style === 'ghost' || st.style === 'planned' ? '#8A8E94' : color;
          const m = L.circleMarker([st.lat, st.lng], {
            radius: isSel ? 9 : 7,
            color: '#fff',
            weight: 2,
            fillColor: fill,
            fillOpacity: st.style === 'ghost' || st.style === 'planned' ? 0.75 : 1,
            className: 'edit-handle station-handle',
            bubblingMouseEvents: false,
          }).addTo(editRoot);
          m.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            if (editTool === 'draw') {
              pickConnectNode({
                type: 'station',
                lat: st.lat,
                lng: st.lng,
                name: st.name,
                segId,
              });
              return;
            }
            selected = { type: 'station', segId, name: st.name, index: si };
            refreshEditHandles();
            notifyEdit();
          });
          // CircleMarker 无原生拖拽：用 map mousemove 模拟（类似 RMP 选中后拖）
          m.on('mousedown', (e) => {
            if (editTool === 'draw') return;
            L.DomEvent.stop(e);
            suppressMapClick = true;
            selected = { type: 'station', segId, name: st.name, index: si };
            map.dragging.disable();
            const onMove = (ev) => {
              const ll = ev.latlng;
              m.setLatLng(ll);
              const rec2 = segments.get(segId);
              if (rec2) {
                moveStationVertex(rec2.latlngs, st, ll.lat, ll.lng);
                setPathOverride(segId, rec2.latlngs);
              }
              st.lat = ll.lat;
              st.lng = ll.lng;
              const extra = extraStationsFor(segId).some((s) => s.name === st.name);
              setStationOverride(st.name, ll.lng, ll.lat, segId, extra ? { keyedOnly: true } : {});
              if (extra) addExtraStation(segId, st.name, ll.lng, ll.lat);
              rebuildSegmentVisual(segId);
              notifyEdit();
            };
            const onUp = () => {
              map.dragging.enable();
              map.off('mousemove', onMove);
              map.off('mouseup', onUp);
              setTimeout(() => {
                suppressMapClick = false;
              }, 0);
              refreshEditHandles();
              notifyEdit();
            };
            map.on('mousemove', onMove);
            map.on('mouseup', onUp);
          });
        });
      }

      if (editTool === 'vertex' || editTool === 'select' || editTool === 'draw' || editTool === 'new-line') {
        // OSM / 场景折线原样出手柄，不再抽稀
        latlngs.forEach((pt, vi) => {
          const isSel =
            (selected?.type === 'vertex' && selected.segId === segId && selected.index === vi) ||
            (selected?.type === 'pending-connect' &&
              selected.segId === segId &&
              selected.index === vi);
          const m = L.circleMarker(pt, {
            radius: isSel ? 6 : 4,
            color: '#0C2430',
            weight: 1,
            fillColor: isSel ? '#E8A838' : '#F4FFFB',
            fillOpacity: 0.95,
            className: 'edit-handle vertex-handle',
            bubblingMouseEvents: false,
          }).addTo(editRoot);
          m.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            if (editTool === 'draw') {
              pickConnectNode({
                type: 'vertex',
                lat: pt[0],
                lng: pt[1],
                segId,
                index: vi,
              });
              return;
            }
            selected = { type: 'vertex', segId, index: vi };
            refreshEditHandles();
            notifyEdit();
          });
          m.on('mousedown', (e) => {
            if (editTool === 'draw') return;
            L.DomEvent.stop(e);
            suppressMapClick = true;
            selected = { type: 'vertex', segId, index: vi };
            map.dragging.disable();
            const onMove = (ev) => {
              const ll = ev.latlng;
              latlngs[vi] = [ll.lat, ll.lng];
              m.setLatLng(ll);
              setPathOverride(segId, latlngs);
              const cum = buildCumDist(latlngs);
              rec.stations = rec.stations.map((st) => {
                const p = projectToPath(st.lat, st.lng, latlngs, cum);
                return { ...st, dist: p.dist };
              });
              rebuildSegmentVisual(segId);
              notifyEdit();
            };
            const onUp = () => {
              map.dragging.enable();
              map.off('mousemove', onMove);
              map.off('mouseup', onUp);
              setTimeout(() => {
                suppressMapClick = false;
              }, 0);
              refreshEditHandles();
              notifyEdit();
            };
            map.on('mousemove', onMove);
            map.on('mouseup', onUp);
          });
        });
      }
    }
  }

  function distToPath(latlng, latlngs) {
    let best = Infinity;
    const lat = latlng.lat;
    const lng = latlng.lng;
    for (let i = 1; i < latlngs.length; i++) {
      const a = latlngs[i - 1];
      const b = latlngs[i];
      const abx = b[1] - a[1];
      const aby = b[0] - a[0];
      const apx = lng - a[1];
      const apy = lat - a[0];
      const ab2 = abx * abx + aby * aby || 1e-12;
      const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
      const d = Math.hypot(a[0] + aby * t - lat, a[1] + abx * t - lng);
      if (d < best) best = d;
    }
    return best;
  }

  function onMapDblClickAddVertex(e) {
    if (!editEnabled || (editTool !== 'vertex' && editTool !== 'select')) return;
    L.DomEvent.stop(e);
    let bestId = null;
    let bestD = Infinity;
    for (const [segId, rec] of segments) {
      const d = distToPath(e.latlng, rec.latlngs);
      if (d < bestD) {
        bestD = d;
        bestId = segId;
      }
    }
    // 约 400m 内才算点到线上
    if (!bestId || bestD > 0.004) return;
    const rec = segments.get(bestId);
    const idx = insertVertexAt(rec.latlngs, e.latlng);
    setPathOverride(bestId, rec.latlngs);
    selected = { type: 'vertex', segId: bestId, index: idx };
    rebuildSegmentVisual(bestId);
    refreshEditHandles();
    notifyEdit();
  }

  function syncEditCursor() {
    container.classList.toggle('tool-draw', editTool === 'draw');
    container.classList.toggle('tool-add-station', editTool === 'add-station');
    container.classList.toggle('tool-new-line', editTool === 'new-line');
  }

  function nearestSegment(latlng, maxD = Infinity) {
    let bestId = null;
    let bestD = Infinity;
    for (const [segId, rec] of segments) {
      let d = rec.latlngs.length >= 2 ? distToPath(latlng, rec.latlngs) : Infinity;
      for (const st of rec.stations || []) {
        d = Math.min(d, Math.hypot(st.lat - latlng.lat, st.lng - latlng.lng));
      }
      if (d < bestD) {
        bestD = d;
        bestId = segId;
      }
    }
    if (!bestId || bestD > maxD) return null;
    return { id: bestId, dist: bestD };
  }

  function snapToNearbyStation(latlng, maxD = 0.0018) {
    let best = null;
    let bestD = maxD;
    for (const rec of segments.values()) {
      for (const st of rec.stations || []) {
        if (st.lat == null || st.lng == null) continue;
        const d = Math.hypot(st.lat - latlng.lat, st.lng - latlng.lng);
        if (d < bestD) {
          bestD = d;
          best = { lat: st.lat, lng: st.lng, name: st.name, segId: rec.seg.id };
        }
      }
    }
    return best;
  }

  function resolveEditSegId(latlng, maxNear = 0.012) {
    const near = nearestSegment(latlng, maxNear);
    if (near) return near.id;
    if (selected?.segId && segments.has(selected.segId)) return selected.segId;
    if (segments.has('hk-lrt')) return 'hk-lrt';
    return null;
  }

  function commitPath(segId) {
    const rec = segments.get(segId);
    if (!rec) return;
    setPathOverride(segId, rec.latlngs);
    rebuildSegmentVisual(segId);
  }

  function insertLiveStation(rec, name, lng, lat) {
    const existing = rec.stations.find((s) => s.name === name);
    if (existing) {
      existing.lng = lng;
      existing.lat = lat;
      existing.keepCoords = true;
      existing.segId = rec.seg.id;
      return existing;
    }
    const st = { name, lng, lat, keepCoords: true, segId: rec.seg.id };
    const snapped = snapStationsToPath([st], rec.latlngs, buildCumDist(rec.latlngs))[0];
    let insertAt = rec.stations.length;
    if (snapped?.dist != null) {
      insertAt = rec.stations.findIndex((s) => (s.dist ?? Infinity) > snapped.dist);
      if (insertAt < 0) insertAt = rec.stations.length;
    }
    rec.stations.splice(insertAt, 0, snapped);
    return snapped;
  }

  function onMapClickEdit(e) {
    if (!editEnabled || suppressMapClick) return;
    if (editTool !== 'add-station' && editTool !== 'draw' && editTool !== 'new-line') return;
    L.DomEvent.stop(e);

    if (editTool === 'add-station') {
      const name = window.prompt('新站名（例如 杯渡、市中心）');
      if (!name?.trim()) return;
      const segId = ensureStationHome();
      const rec = segments.get(segId);
      if (!rec) return;
      const { lat, lng } = e.latlng;
      addExtraStation(segId, name.trim(), lng, lat);
      insertLiveStation(rec, name.trim(), lng, lat);
      rebuildSegmentVisual(segId);
      selected = {
        type: 'station',
        segId,
        name: name.trim(),
        index: rec.stations.findIndex((s) => s.name === name.trim()),
      };
      refreshEditHandles();
      notifyEdit();
      return;
    }

    if (editTool === 'draw') {
      const node = snapToNode(e.latlng, 0.0025);
      if (!node) return;
      pickConnectNode(node);
      return;
    }

    const snap = snapToNearbyStation(e.latlng, 0.002);
    const pt = snap ? [snap.lat, snap.lng] : [e.latlng.lat, e.latlng.lng];
    if (!pendingNewLine) {
      pendingNewLine = { start: pt, fromName: snap?.name };
      selected = { type: 'pending-line' };
      notifyEdit();
      return;
    }
    const id = `extra-${Date.now().toString(36)}`;
    const color = segments.get('hk-lrt')?.seg?.color || '#C8811A';
    const lineName = window.prompt('线路名称', '轻铁') || '轻铁';
    const path = [pendingNewLine.start, pt];
    const stations = [];
    if (pendingNewLine.fromName) {
      const [slat, slng] = pendingNewLine.start;
      stations.push({ name: pendingNewLine.fromName, lat: slat, lng: slng, keepCoords: true });
      addExtraStation(id, pendingNewLine.fromName, slng, slat);
    }
    if (snap?.name && snap.name !== pendingNewLine.fromName) {
      stations.push({ name: snap.name, lat: snap.lat, lng: snap.lng, keepCoords: true });
      addExtraStation(id, snap.name, snap.lng, snap.lat);
    }
    const year = editSceneYear;
    const open = editSceneDate || `${editSceneYear}-12-31`;
    upsertExtraLine({ id, line: lineName, color, year, open, path });
    setPathOverride(id, path);
    addSegmentStatic({ id, line: lineName, color, stations, path });
    pendingNewLine = null;
    selected = { type: 'vertex', segId: id, index: 1 };
    editTool = 'draw';
    syncEditCursor();
    refreshEditHandles();
    notifyEdit();
  }

  function enableEdit(tool = 'select') {
    editEnabled = true;
    editTool = tool;
    container.classList.add('is-editing');
    syncEditCursor();
    map.on('dblclick', onMapDblClickAddVertex);
    map.on('click', onMapClickEdit);
    // 避免 Leaflet 默认双击缩放抢走
    map.doubleClickZoom.disable();
    refreshEditHandles();
    notifyEdit();
  }

  function disableEdit() {
    editEnabled = false;
    selected = null;
    pendingNewLine = null;
    pendingConnect = null;
    editRoot.clearLayers();
    container.classList.remove('is-editing');
    syncEditCursor();
    map.off('dblclick', onMapDblClickAddVertex);
    map.off('click', onMapClickEdit);
    map.doubleClickZoom.enable();
    map.dragging.enable();
    notifyEdit();
  }

  function setEditTool(tool) {
    if (tool !== 'new-line') pendingNewLine = null;
    if (tool !== 'draw') pendingConnect = null;
    editTool = tool;
    syncEditCursor();
    if (editEnabled) refreshEditHandles();
    notifyEdit();
  }

  function deleteSelected() {
    if (!selected) return;
    if (selected.type === 'station') {
      const extras = extraStationsFor(selected.segId);
      const isExtra = extras.some((s) => s.name === selected.name);
      if (isExtra) {
        removeExtraStation(selected.segId, selected.name);
        const rec = segments.get(selected.segId);
        if (rec) {
          rec.stations = rec.stations.filter((s) => s.name !== selected.name);
          rebuildSegmentVisual(selected.segId);
        }
      } else {
        clearStationOverride(selected.name, selected.segId);
        const rec = segments.get(selected.segId);
        if (rec) {
          const base = labelStations(rec.seg);
          const st = base.find((s) => s.name === selected.name);
          if (st) {
            const i = rec.stations.findIndex((s) => s.name === selected.name);
            if (i >= 0) {
              const p = projectToPath(st.lat, st.lng, rec.latlngs, buildCumDist(rec.latlngs));
              rec.stations[i] = { ...rec.stations[i], lat: p.lat, lng: p.lng, dist: p.dist };
            }
          }
          rebuildSegmentVisual(selected.segId);
        }
      }
    } else if (selected.type === 'vertex') {
      const rec = segments.get(selected.segId);
      if (rec && rec.latlngs.length > 2) {
        rec.latlngs.splice(selected.index, 1);
        setPathOverride(selected.segId, rec.latlngs);
        rebuildSegmentVisual(selected.segId);
      }
    }
    selected = null;
    refreshEditHandles();
    notifyEdit();
  }

  function resetSelected() {
    if (!selected) return;
    if (selected.type === 'station') clearStationOverride(selected.name);
    if (selected.type === 'vertex' || selected.type === 'path') clearPathOverride(selected.segId);
    // 重载该段原始几何
    const rec = segments.get(selected.segId);
    if (rec) {
      if (selected.type === 'vertex') clearPathOverride(selected.segId);
      const fresh = segLatLngs(rec.seg);
      rec.latlngs = fresh;
      rec.stations = snapStationsToPath(labelStations(rec.seg), fresh, buildCumDist(fresh));
      rebuildSegmentVisual(selected.segId);
    }
    selected = null;
    refreshEditHandles();
    notifyEdit();
  }

  function resetAllMapEdits() {
    const extraIds = extraLinesList().map((l) => l.id);
    extraIds.forEach((id) => removeExtraLine(id));
    clearAllEdits();
    for (const id of extraIds) {
      if (id.startsWith('extra-')) removeSegment(id, { deferLabels: true });
    }
    for (const [id, rec] of segments) {
      rec.latlngs = segLatLngs(rec.seg);
      rec.stations = snapStationsToPath(labelStations(rec.seg), rec.latlngs, buildCumDist(rec.latlngs));
      rebuildSegmentVisual(id, { deferLabels: true });
    }
    relayoutAllLabels();
    selected = null;
    refreshEditHandles();
    notifyEdit();
  }

  function syncExtraLines(year, { date } = {}) {
    if (year != null) editSceneYear = year;
    if (date) editSceneDate = date;
    else if (year != null) editSceneDate = `${year}-12-31`;
    const until = date || (year != null ? `${year}-12-31` : '9999-12-31');
    let added = false;
    for (const extra of extraLinesList()) {
      const open = extra.open || '1988-09-18';
      if (extra.pack) continue;
      if (open > until) continue;
      if (year != null && (extra.year ?? 0) > year) continue;
      if (segments.has(extra.id)) continue;
      const sts = extraStationsFor(extra.id);
      const path = getPathOverride(extra.id) || extra.path;
      addSegmentStatic({
        id: extra.id,
        cityId: extra.cityId || 'hongkong',
        line:
          extra.line === '轻铁' || !extra.line
            ? until >= '2007-12-02'
              ? '轻铁'
              : until >= '1996-01-01'
                ? '九广轻铁'
                : '轻便铁路'
            : extra.line,
        color: extra.color || (until >= '2007-12-02' ? '#C8811A' : '#E0A020'),
        stations: (sts.length ? sts : extra.stations || []).map((s) => ({
          ...s,
          keepCoords: true,
        })),
        path: path?.length >= 2 ? path : extra.path,
        opacity: 1,
        weight: 6,
      }, { deferLabels: true });
      added = true;
    }
    if (added) relayoutAllLabels();
    if (editEnabled) refreshEditHandles();
  }

  return {
    map,
    setExportBasemap,
    setExportFrameRate,
    waitExportFrame,
    waitForTiles,
    prefetchExportTiles,
    clearAll,
    cancelGrow,
    demoteActive,
    highlightSegments,
    playStationRename,
    applyStationRename,
    playLineHandoff,
    applyLineHandoffStatic,
    retireSegments,
    retireStations,
    addStations,
    openStations,
    trimSegStart,
    applyTerminusMove,
    playTerminusMove,
    removeSegment,
    recolorSegments,
    flyToStations,
    flyToNetwork,
    flyToCityNetwork,
    flyTo,
    flyChina,
    growSegment,
    growParallel,
    growAlongCam,
    applyCamSweep,
    estimateGrowMeters,
    estimateGrowSec: (seg, speed = 1) => growDurationSec(estimateGrowMeters(seg), speed),
    openExportGrow,
    setExportGrowProgress,
    closeExportGrow,
    addSegmentStatic,
    registerBuses,
    syncViewportBuses,
    setBusFullLoad,
    setRailFullLoad,
    isBusFullLoad: () => busFullLoad,
    isRailFullLoad: () => railFullLoad,
    registerRails,
    syncViewportRails,
    onViewportChange: (fn) => {
      onViewportChange = fn;
    },
    getZoom: () => map.getZoom(),
    getCenter: () => map.getCenter(),
    getBounds: () => map.getBounds(),
    flyToBBox(bbox, opts = {}) {
      if (!bbox || bbox.length < 4) return Promise.resolve(false);
      const pts = [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ];
      return flyToBoundsPts(pts, {
        pad: opts.pad ?? 48,
        maxZoom: opts.maxZoom ?? 6.2,
        duration: opts.duration ?? 0.9,
      });
    },
    relayoutAllLabels,
    addCityMarker,
    invalidate,
    setStampCity: (id) => {
      stampCityId = id || null;
      scheduleBusSync();
    },
    setModeFilter: (mode) => {
      let next;
      if (Array.isArray(mode) || mode instanceof Set) {
        next = new Set([...mode].filter((m) => m === 'metro' || m === 'hsr' || m === 'bus'));
      } else if (mode === 'metro' || mode === 'hsr' || mode === 'bus') {
        next = new Set([mode]);
      } else {
        next = new Set();
      }
      const same =
        next.size === modeFilters.size && [...next].every((m) => modeFilters.has(m));
      if (same) return [...modeFilters];
      modeFilters = next;
      applyModeFilter();
      return [...modeFilters];
    },
    getModeFilter: () => primaryMode(),
    getModeFilters: () => [...modeFilters],
    listLines({ cityId = '', mode = '' } = {}) {
      const seen = new Map();
      const eat = (seg, color) => {
        if (!seg?.line || seg.style === 'ghost') return;
        const cid = seg.cityId || '';
        if (cityId && !recCityMatch(seg, cityId)) return;
        const m = classifyTransitMode(seg);
        if (mode && m !== mode) return;
        const key = cityId ? `${cityId}::${seg.line}` : `${seg.networkRail ? '' : cid}::${seg.line}`;
        if (seen.has(key)) return;
        seen.set(key, {
          cityId: cityId || (seg.networkRail ? '' : cid),
          line: seg.line,
          color: color || seg.color || '#888',
          mode: m,
        });
      };
      for (const rec of segments.values()) eat(rec?.seg, recColor(rec));
      for (const rec of busIndex.values()) eat(rec.seg, rec.seg.color);
      for (const rec of railIndex.values()) eat(rec.seg, rec.seg.color);
      return [...seen.values()];
    },
    setFocusLine: (lineName) => {
      const list = Array.isArray(lineName)
        ? lineName
        : String(lineName || '')
            .split('|')
            .map((s) => s.trim());
      const next = new Set(list.filter(Boolean));
      const key = [...next].sort().join('|');
      const prev = [...focusLineNames].sort().join('|');
      if (key === prev) return key;
      focusLineNames = next;
      applyLineFocus();
      relayoutAllLabels();
      return key;
    },
    getFocusLine: () => [...focusLineNames][0] || '',
    cityHud(cityId, { includePlanned = false } = {}) {
      if (!cityId) return { km: 0, stations: 0, lines: [], paths: [] };
      const names = new Set();
      const lineMap = new Map();
      const paths = [];
      let meters = 0;
      const seen = new Set();
      const eat = (rec) => {
        if (!rec?.seg || !recCityMatch(rec.seg, cityId)) return;
        if (!recModeVisible(rec)) return;
        if (rec.seg.style === 'ghost') return;
        if (rec.seg.style === 'planned' && !includePlanned) return;
        if (seen.has(rec.seg.id)) return;
        seen.add(rec.seg.id);
        const latlngs = rec.latlngs || [];
        meters += rec.meters ?? (buildCumDist(latlngs)[latlngs.length ? latlngs.length - 1 : 0] || 0);
        const shown = (rec.stations || []).filter((st) => st.name && !st.silent);
        for (const st of shown) names.add(st.name);
        if (rec.seg.line && (shown.length || rec.seg.skipLabels || rec.seg.style === 'planned')) {
          const color = officialLineColor(cityId, rec.seg.line) || rec.seg.color || '#888';
          if (!lineMap.has(rec.seg.line) || color) lineMap.set(rec.seg.line, color);
        }
        if (
          latlngs.length >= 2 &&
          !rec.seg.networkRail &&
          !(rec.seg.style === 'bus' && paths.length >= 80)
        ) {
          paths.push({ color: rec.seg.color || '#888', latlngs });
        }
      };
      for (const rec of segments.values()) eat(rec);
      for (const rec of growing.values()) eat(rec);
      for (const rec of busIndex.values()) {
        eat({
          seg: rec.seg,
          latlngs: rec.latlngs,
          meters: rec.meters,
          stations: rec.seg.stations || [],
        });
      }
      for (const rec of railIndex.values()) {
        eat({
          seg: rec.seg,
          latlngs: flattenLatLngs(rec.latlngs).flat(),
          meters: rec.meters,
          stations: rec.seg.stations || [],
        });
      }
      return {
        km: meters / 1000,
        stations: names.size,
        lines: [...lineMap.entries()].map(([name, color]) => ({ name, color })),
        paths,
      };
    },
    nationHud({
      countryId = '',
      cityIds = null,
      highspeedOnly = false,
    } = {}) {
      let meters = 0;
      let lines = 0;
      let metroMeters = 0;
      let busMeters = 0;
      let hsMeters = 0;
      let railMeters = 0;
      const byBucket = {};
      const citySet = cityIds instanceof Set ? cityIds : cityIds?.length ? new Set(cityIds) : null;
      const seen = new Set();
      const inScope = (seg) => {
        if (!countryId && !citySet) return true;
        if (seg?.networkRail || seg?.ormRail) {
          // 中国全网 id 前缀；ORM/世界网以 cityId=国码
          if (countryId === 'cn') {
            if (String(seg.id || '').startsWith('cn-rail-')) return true;
            if (seg.cityId && citySet?.has(seg.cityId)) return true;
            return false;
          }
          return seg.cityId === countryId;
        }
        if (citySet) {
          if (seg.cityId && citySet.has(seg.cityId)) return true;
          if (Array.isArray(seg.cityIds) && seg.cityIds.some((id) => citySet.has(id))) return true;
          return false;
        }
        return !countryId || seg.cityId === countryId;
      };
      const eat = (rec) => {
        if (!rec?.seg) return;
        if (!recModeVisible(rec)) return;
        if (rec.seg.style === 'planned' || rec.seg.style === 'ghost') return;
        if (!inScope(rec.seg)) return;
        if (highspeedOnly && !(rec.seg.highspeed || rec.seg.style === 'hsr')) return;
        if (seen.has(rec.seg.id)) return;
        seen.add(rec.seg.id);
        lines += 1;
        const latlngs = rec.latlngs || [];
        const m = rec.meters ?? (buildCumDist(latlngs)[latlngs.length ? latlngs.length - 1 : 0] || 0);
        meters += m;
        const mode = classifyTransitMode(rec.seg);
        if (mode === 'bus') busMeters += m;
        else if (mode === 'hsr') {
          if (rec.seg.highspeed || rec.seg.style === 'hsr') hsMeters += m;
          else railMeters += m;
        } else metroMeters += m;
        const bucket = classifyTransitBucket(rec.seg);
        if (!byBucket[bucket]) byBucket[bucket] = { km: 0, lines: 0 };
        byBucket[bucket].km += m / 1000;
        byBucket[bucket].lines += 1;
      };
      for (const rec of segments.values()) eat(rec);
      for (const rec of growing.values()) eat(rec);
      for (const rec of busIndex.values()) {
        eat({
          seg: rec.seg,
          latlngs: rec.latlngs,
          meters: rec.meters,
        });
      }
      for (const rec of railIndex.values()) {
        eat({
          seg: rec.seg,
          latlngs: flattenLatLngs(rec.latlngs).flat(),
          meters: rec.meters,
        });
      }
      return {
        km: meters / 1000,
        lines,
        metroKm: metroMeters / 1000,
        busKm: busMeters / 1000,
        hsKm: hsMeters / 1000,
        railKm: railMeters / 1000,
        buckets: byBucket,
        bucketLabels: TRANSIT_BUCKET_LABEL,
      };
    },
    snapCamera: (sc) => {
      if (!sc) return;
      if (sc.nationalMap || sc.overview) {
        map.setView([sc.focus?.lat ?? 35.5, sc.focus?.lng ?? 105], sc.focus?.zoom ?? 4.15, {
          animate: false,
        });
      } else if (applyLongRailLook(longRailLook(sc))) {
        // 长铁路先对准起点
      } else if (sc.focusStations?.length >= 2) {
        map.fitBounds(
          sc.focusStations.map((s) => [s.lat, s.lng]),
          { animate: false, padding: [48, 48], maxZoom: sc.focusZoom ?? 12 }
        );
      } else if (sc.focus) {
        map.setView([sc.focus.lat, sc.focus.lng], sc.focus.zoom ?? 11, { animate: false });
      }
    },
    camDestForScene(sc) {
      if (!sc) return null;
      if (sc.camSweep && sc.camStart) {
        return { lat: sc.camStart.lat, lng: sc.camStart.lng, zoom: sc.camStart.zoom ?? 15 };
      }
      if (sc.nationalMap || sc.overview) {
        if (sc.fitNetwork) {
          const net = camForDrawnNetwork(sc.focusPad ?? 48, sc.focusZoom ?? 5.5);
          if (net) return net;
        }
        if (sc.focus) return { lat: sc.focus.lat, lng: sc.focus.lng, zoom: sc.focus.zoom ?? 4.2 };
        return { lat: 35.5, lng: 105, zoom: 4.15 };
      }
      if (sc.fitNetwork) return camForDrawnNetwork(sc.focusPad ?? 64, sc.focusZoom ?? 12);
      const look = longRailLook(sc);
      if (look) return { lat: look.lat, lng: look.lng, zoom: look.zoom };
      if (sc.focusStations?.length === 1) {
        return { lat: sc.focusStations[0].lat, lng: sc.focusStations[0].lng, zoom: 15 };
      }
      if (sc.focusStations?.length >= 2) {
        return camForStations(sc.focusStations, sc.focusPad ?? 0.18, sc.focusZoom);
      }
      if (sc.focus) {
        const z = sc.focus.zoom ?? 14;
        return { lat: sc.focus.lat, lng: sc.focus.lng, zoom: z < 10 ? z : Math.min(17, Math.max(12, z)) };
      }
      return null;
    },
    setCamLerp(from, to, t01) {
      if (!to) return;
      const t = Math.min(1, Math.max(0, t01));
      const e = t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2;
      const lat0 = from?.lat ?? map.getCenter().lat;
      const lng0 = from?.lng ?? map.getCenter().lng;
      const z0 = from?.zoom ?? map.getZoom();
      snapCamTo(lat0 + (to.lat - lat0) * e, lng0 + (to.lng - lng0) * e, z0 + (to.zoom - z0) * e);
    },
    longRailLook,
    longRailLookForSeg,
    hasSegment: (id) => segments.has(id),
    enableEdit,
    disableEdit,
    setEditTool,
    deleteSelected,
    resetSelected,
    resetAllMapEdits,
    syncExtraLines,
    exportEditsJson,
    getEditState: () => ({ enabled: editEnabled, tool: editTool, selected, edits: loadEdits() }),
    onEditChange: (fn) => {
      onEditChange = fn;
    },
    onHudTick: (fn) => {
      onHudTick = fn;
    },
    onLinePick: (fn) => {
      onLinePick = fn;
    },
    applyOfficialLineColors() {
      for (const rec of segments.values()) {
        if (!rec?.seg || rec.seg.style === 'ghost') continue;
        const color = officialLineColor(rec.seg.cityId, rec.seg.line);
        if (!color) continue;
        rec.seg.color = color;
        rec.line?.setStyle({ color });
        paintBridgeRails(rec.bridgeLayer, rec.seg, rec.latlngs, buildCumDist(rec.latlngs), rec.stations, {
          color,
          opacity: rec.line?.options?.opacity ?? 1,
          line: rec.line,
        });
      }
    },
  };
}
