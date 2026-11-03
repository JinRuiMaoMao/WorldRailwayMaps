import './style.css';
import { CHAPTERS } from './data/scenes.js';
import { PLACES } from './data/network.js';
import { createLeafletView } from './leafletView.js';
import { loadAllCityOsm, loadChinaRailOsm, bindOsmToScenes, bindOsmToRailScenes } from './data/osmUtil.js';
import { CHINA_RAIL_SCENES } from './data/chinaRail.js';
import { bindOsmToBeijingScenes } from './data/beijingMetro.js';
import {
  ensureCityBuses,
  loadBusManifest,
  loadAllCityBuses,
  allBoundCityBusSegments,
} from './data/cityBuses.js';
import { DETAILED_CITIES } from './data/scenes.js';
import {
  WORLD_CITIES,
  WORLD_COUNTRIES,
  worldCityById,
  worldCountryById,
} from './data/worldCatalog.js';
import {
  loadWorldMetroForCountry,
  loadWorldRailForCountry,
  allBoundWorldSegments,
  ensureWorldMetro,
  ensureWorldRailNetwork,
  ensureWorldOrmRails,
  ensureWorldOrmUrban,
  loadAllWorldMetros,
  loadAllWorldOrmRails,
  countriesIntersectingView,
  citiesNearView,
  worldCityIds,
} from './data/worldTransit.js';
import {
  ensureChinaRailNetwork,
  chinaRailNetworkReady,
  chinaRailNetworkSegments,
  chinaRailNetworkHas,
} from './data/chinaRailNetwork.js';
import { classifyTransitMode } from './data/transitMode.js';
import { seedDefaultEdits } from './data/mapEdits.js';
import { resolveSceneSegments } from './data/hongkongRail.js';
import { recolorSpecs } from './data/metroShared.js';
import {
  canExportVideo,
  startOfflineExport,
  downloadBlob,
  growDurationSec,
  dwellSec,
  resolveExportPreset,
  applyExportViewport,
  clearExportViewport,
} from './exportVideo.js';

const state = {
  chapter: 'china',
  sceneIndex: -1,
  playing: false,
  speed: 0.75,
  revealed: new Set(),
  retired: new Set(),
  cityLit: new Set(),
  timer: null,
  growTimer: null,
  view: null,
  started: false,
  advancing: false,
  editing: false,
  exporting: false,
  exportSession: null,
  exportWake: null,
  exportView: null,
  exportStartedAt: 0,
  exportProgressTimer: null,
  /** 进度条拖动：合并多次 seek，避免每帧全量重建 */
  scrubTimer: null,
  scrubIndex: null,
  seekGen: 0,
  hudCityId: null,
  exportFromYear: null,
  exportToYear: null,
  exportCity: '',
  exportKind: 'both',
  exportFps: 30,
  exportSize: '1080p',
  hudLineKey: '',
  hudMiniAt: 0,
  toastFadeTimer: null,
  atlasCityId: '',
  atlasCountryId: '',
  pickerLevel: 'world',
  atlasNavGen: 0,
  atlasReady: false,
  /** 可叠加图层 */
  modeFilters: new Set(['metro']),
  /** 全量按钮聚焦的图层（最近点亮的） */
  modeFilter: 'metro',
  focusLine: '',
  busCities: ['beijing'],
  /** 当前图层是否已点过全量：metro | hsr | bus */
  layerFullLoad: { metro: false, hsr: false, bus: false },
  layerFullLoading: false,
};

function modeOn(mode) {
  return state.modeFilters.has(mode);
}

function scenes() {
  return CHAPTERS[state.chapter].scenes;
}

function sleep(ms) {
  return new Promise((resolve) => {
    state.growTimer = setTimeout(resolve, ms);
  });
}

function clearGrow() {
  clearTimeout(state.growTimer);
  state.growTimer = null;
  clearTimeout(state.toastFadeTimer);
  state.toastFadeTimer = null;
  state.view?.cancelGrow?.();
}

async function boot() {
  seedDefaultEdits();
  buildApp();
  ensureMap();
  setAtlasLoading(true, '正在套线位…');
  try {
    const [osmMap, railOsm, busCities] = await Promise.all([
      loadAllCityOsm(),
      loadChinaRailOsm(),
      loadBusManifest(),
    ]);
    state.busCities = busCities;
    if (osmMap.beijing) bindOsmToBeijingScenes(osmMap.beijing);
    for (const { id, scenes: cityScenes } of DETAILED_CITIES) {
      if (id === 'beijing') continue;
      if (osmMap[id]) bindOsmToScenes(cityScenes, osmMap[id]);
    }
    if (railOsm) bindOsmToRailScenes(CHINA_RAIL_SCENES, railOsm);
  } catch (e) {
    console.warn('OSM 线位加载失败，回退站序折线', e);
  }
  setAtlasLoading(true, '正在铺全国铁路…');
  try {
    const rails = await ensureChinaRailNetwork();
    state.view?.registerRails?.(rails);
  } catch (e) {
    console.warn('全国铁路加载失败', e);
  }
  await openAtlas();
}

function chinaAtlasCities() {
  return DETAILED_CITIES.map(({ id }) => ({
    id,
    country: 'cn',
    name: PLACES[id]?.name || id,
    year: PLACES[id]?.metro || 0,
    lat: PLACES[id]?.lat,
    lng: PLACES[id]?.lng,
    radius: 38000,
  })).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

function atlasCities() {
  return [
    ...chinaAtlasCities(),
    ...WORLD_CITIES.map((c) => ({
      id: c.id,
      country: c.country,
      name: c.nameZh,
      year: 0,
      lat: c.lat,
      lng: c.lng,
      radius: c.radius,
    })),
  ];
}

function atlasCountries() {
  return WORLD_COUNTRIES.slice().sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh-CN'));
}

function cityDisplayName(id) {
  return PLACES[id]?.name || worldCityById(id)?.nameZh || id;
}

function countryDisplayName(id) {
  return worldCountryById(id)?.nameZh || id;
}

function scopeLabel() {
  if (state.atlasCityId) return cityDisplayName(state.atlasCityId);
  if (state.atlasCountryId) return countryDisplayName(state.atlasCountryId);
  return '世界';
}

function chinaCityIds() {
  return new Set(DETAILED_CITIES.map((c) => c.id));
}

function buildApp() {
  document.getElementById('app').innerHTML = `
    <div class="demo atlas" id="demo">
      <header class="hud-top">
        <div class="brand-mini" id="brand-mini">World Railway Maps</div>
        <button type="button" class="city-picker-toggle" id="city-picker-toggle">国家</button>
        <div class="mode-filter" id="mode-filter">
          <button type="button" data-mode="metro" class="active">地铁</button>
          <button type="button" data-mode="hsr">高铁</button>
          <button type="button" data-mode="bus">公交</button>
          <button type="button" class="bus-full-btn" id="layer-full-btn" title="开启后切换地铁/高铁/公交都会全量加载">全量</button>
        </div>
        <div class="atlas-count" id="atlas-count"></div>
      </header>

      <div class="atlas-confirm" id="layer-full-confirm" hidden>
        <div class="atlas-confirm-card" role="dialog" aria-labelledby="layer-full-title">
          <h3 id="layer-full-title">全量加载？</h3>
          <p id="layer-full-text">
            会把已下载缓存一次挂上。数据量大，可能明显卡顿、发热、耗电；OSM 本身不全，全量也不会变成官方总里程。
          </p>
          <div class="atlas-confirm-actions">
            <button type="button" class="atlas-confirm-cancel" id="layer-full-cancel">取消</button>
            <button type="button" class="atlas-confirm-ok" id="layer-full-ok">仍然加载</button>
          </div>
        </div>
      </div>

      <section class="map-stage">
        <aside class="city-picker" id="city-picker">
          <input type="search" id="city-search" class="city-search" placeholder="查找国家 / 城市" autocomplete="off" />
          <input type="search" id="line-search" class="city-search" placeholder="查找线路" autocomplete="off" />
          <div id="line-search-results" class="line-search-results" hidden></div>
          <div class="city-picker-list" id="city-picker-list"></div>
        </aside>

        <div class="year-hero atlas-stat" id="year-hero">
          <div class="city-stat-stack" id="city-km-wrap">
            <div class="city-place" id="city-place">世界</div>
            <div class="city-stat">
              <span class="city-stat-num" id="city-km">—</span>
              <span class="city-stat-lab">公里</span>
            </div>
          </div>
          <div class="city-stat" id="city-st-wrap" hidden>
            <span class="city-stat-num" id="city-st">—</span>
            <span class="city-stat-lab">站</span>
          </div>
        </div>

        <div class="city-minimap" id="city-minimap" hidden>
          <svg id="city-minimap-svg" viewBox="0 0 168 128" preserveAspectRatio="xMidYMid meet"></svg>
        </div>

        <div class="city-lines" id="city-lines" hidden></div>
        <div class="guideway-legend" id="guideway-legend" hidden>
          <b>图例</b>
          <span><i class="gw gw-elev"></i>有轨</span>
          <span><i class="gw gw-hsr"></i>高铁</span>
          <span><i class="gw gw-rail"></i>普铁</span>
          <span><i class="gw gw-bus"></i>公交</span>
          <span><i class="gw gw-plan"></i>规划</span>
        </div>

        <div class="atlas-loading" id="atlas-loading">
          <span id="atlas-loading-text">正在铺线网…</span>
        </div>

        <div id="leaflet-map" class="leaflet-host"></div>
      </section>
    </div>
  `;

  bindEvents();
  renderAtlasPicker();
}

function ensureMap() {
  if (state.view) {
    state.view.invalidate();
    return;
  }
  state.view = createLeafletView(document.getElementById('leaflet-map'));
  state.view.onEditChange((info) => {
    updateEditDetail(info);
    if (info?.tool) {
      document.querySelectorAll('.edit-tools button').forEach((b) => {
        b.classList.toggle('active', b.dataset.editTool === info.tool);
      });
    }
  });
  state.view.onHudTick(() => {
    refreshAtlasHud({ live: true });
  });
  state.view.onLinePick?.((info) => {
    if (info?.clear) {
      clearLineFocus();
      return;
    }
    focusAtlasMapLine(info);
  });
  setTimeout(() => state.view.invalidate(), 50);
  state.view.onViewportChange?.(() => {
    if (!state.atlasReady) return;
    clearTimeout(state.busViewTimer);
    state.busViewTimer = setTimeout(() => {
      void loadActiveModeLayers();
    }, 280);
  });
}

function updateEditDetail(info) {
  const el = document.getElementById('edit-detail');
  if (!el) return;
  const sel = info?.selected;
  if (!sel) {
    el.textContent =
      info?.tool === 'add-station'
        ? '加站：点地图输入站名，落在点击位置，不贴线'
        : info?.tool === 'draw'
          ? '连线：先点一个站点或线点，再点另一个，两点之间连一段'
          : info?.tool === 'new-line'
            ? '新线：点第一下起点，再点一下生成支线'
            : '未选中 · 拖站点改位置，拖白点改线位';
    return;
  }
  if (sel.type === 'pending-line') {
    el.textContent = '新线起点已定 · 再点一下生成支线';
    return;
  }
  if (sel.type === 'pending-connect') {
    el.textContent = sel.name
      ? `已选「${sel.name}」· 再点另一个站点或线点连线`
      : '已选线点 · 再点另一个站点或线点连线';
    return;
  }
  if (sel.type === 'station') {
    const st = loadEditsSnap(sel.name);
    el.textContent = st
      ? `站点「${sel.name}」  ${st.lng.toFixed(5)}, ${st.lat.toFixed(5)}`
      : `站点「${sel.name}」`;
    return;
  }
  if (sel.type === 'vertex') {
    el.textContent = `线位点 #${sel.index} · 段 ${sel.segId} · Delete 可删`;
  }
}

function loadEditsSnap(name) {
  try {
    const raw = localStorage.getItem('chinasubwayplan.mapEdits.v1');
    if (!raw) return null;
    return JSON.parse(raw).stations?.[name] || null;
  } catch {
    return null;
  }
}

function setEditUi(on) {
  state.editing = on;
  const panel = document.getElementById('edit-panel');
  const toggle = document.getElementById('edit-toggle');
  if (panel) panel.hidden = !on;
  if (toggle) {
    toggle.hidden = state.playing;
    toggle.classList.toggle('active', on);
    toggle.textContent = on ? '退出编辑' : '编辑';
  }
  if (!state.view) return;
  if (on) state.view.enableEdit('select');
  else state.view.disableEdit();
}

function bindEvents() {
  document.getElementById('city-picker-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.nav === 'world') {
      selectAtlasWorld();
      return;
    }
    if (btn.dataset.city) {
      selectAtlasCity(btn.dataset.city, btn.dataset.country);
      document.getElementById('city-picker')?.classList.remove('open');
      return;
    }
    if (btn.dataset.country) {
      selectAtlasCountry(btn.dataset.country);
      if (btn.dataset.countryAll) document.getElementById('city-picker')?.classList.remove('open');
    }
  });

  document.getElementById('city-search')?.addEventListener('input', (e) => {
    clearLineSearchResults();
    filterAtlasCities(e.target.value);
  });

  document.getElementById('line-search')?.addEventListener('input', (e) => {
    filterAtlasLines(e.target.value);
  });

  document.getElementById('line-search')?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const hit = document.querySelector('#line-search-results .line-search-hit');
    if (hit) {
      e.preventDefault();
      openSearchedLine(hit);
    }
  });

  document.getElementById('line-search-results')?.addEventListener('click', (e) => {
    const hit = e.target.closest('.line-search-hit');
    if (hit) openSearchedLine(hit);
  });

  document.getElementById('city-picker-toggle')?.addEventListener('click', () => {
    document.getElementById('city-picker')?.classList.toggle('open');
  });

  document.getElementById('city-lines')?.addEventListener('click', (e) => {
    const badge = e.target.closest('.city-line-badge');
    if (!badge || !state.atlasCityId) return;
    flyAtlasLine(badge);
  });

  document.getElementById('mode-filter')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-mode]');
    if (!btn) return;
    void toggleAtlasMode(btn.dataset.mode);
  });

  document.getElementById('layer-full-btn')?.addEventListener('click', () => {
    const modes = activeModes();
    if (!modes.length) return;
    if (modes.every((m) => state.layerFullLoad[m])) {
      setLayersFullLoad(modes, false);
      return;
    }
    openLayerFullConfirm(modes);
  });
  document.getElementById('layer-full-cancel')?.addEventListener('click', closeLayerFullConfirm);
  document.getElementById('layer-full-ok')?.addEventListener('click', () => {
    const raw = document.getElementById('layer-full-confirm')?.dataset.modes || '';
    const modes = raw.split(',').filter((m) => m === 'metro' || m === 'hsr' || m === 'bus');
    closeLayerFullConfirm();
    void enableLayersFullLoad(modes.length ? modes : activeModes());
  });
  document.getElementById('layer-full-confirm')?.addEventListener('click', (e) => {
    if (e.target?.id === 'layer-full-confirm') closeLayerFullConfirm();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const confirm = document.getElementById('layer-full-confirm');
      if (confirm && !confirm.hidden) {
        closeLayerFullConfirm();
        return;
      }
      const lineBox = document.getElementById('line-search');
      if (lineBox?.value) {
        lineBox.value = '';
        clearLineSearchResults();
        return;
      }
      document.getElementById('city-picker')?.classList.remove('open');
      if (state.atlasCityId) selectAtlasCountry(state.atlasCountryId || 'cn');
      else if (state.atlasCountryId) selectAtlasWorld();
    }
  });
}

function setAtlasLoading(on, text) {
  const el = document.getElementById('atlas-loading');
  const label = document.getElementById('atlas-loading-text');
  if (label && text) label.textContent = text;
  if (el) el.hidden = !on;
}

function filterAtlasCities() {
  const list = document.getElementById('city-picker-list');
  if (list) list.hidden = false;
  renderAtlasPicker();
}

function renderAtlasPicker() {
  const list = document.getElementById('city-picker-list');
  if (!list) return;
  const q = String(document.getElementById('city-search')?.value || '')
    .trim()
    .toLowerCase();
  const bits = [];
  if (q) {
    bits.push(`<button type="button" class="city-picker-btn" data-nav="world"><span>世界</span></button>`);
    for (const co of atlasCountries()) {
      if (!co.nameZh.toLowerCase().includes(q) && !co.id.toLowerCase().includes(q)) continue;
      bits.push(
        `<button type="button" class="city-picker-btn" data-country="${co.id}"><span>${co.nameZh}</span><em>国家</em></button>`
      );
    }
    for (const c of atlasCities()) {
      if (!c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) continue;
      bits.push(
        `<button type="button" class="city-picker-btn" data-city="${c.id}" data-country="${c.country}"><span>${c.name}</span><em>${countryDisplayName(c.country)}</em></button>`
      );
    }
  } else if (state.pickerLevel === 'country' && state.atlasCountryId) {
    bits.push(
      `<button type="button" class="city-picker-btn city-picker-back" data-nav="world"><span>← 国家</span></button>`
    );
    bits.push(
      `<button type="button" class="city-picker-btn${!state.atlasCityId ? ' active' : ''}" data-country="${state.atlasCountryId}" data-country-all="1"><span>${countryDisplayName(state.atlasCountryId)}</span><em>全境</em></button>`
    );
    for (const c of atlasCities().filter((x) => x.country === state.atlasCountryId)) {
      bits.push(
        `<button type="button" class="city-picker-btn${state.atlasCityId === c.id ? ' active' : ''}" data-city="${c.id}" data-country="${c.country}"><span>${c.name}</span>${
          c.year ? `<em>${c.year}</em>` : ''
        }</button>`
      );
    }
  } else {
    bits.push(
      `<button type="button" class="city-picker-btn${!state.atlasCountryId && !state.atlasCityId ? ' active' : ''}" data-nav="world"><span>世界</span></button>`
    );
    for (const co of atlasCountries()) {
      bits.push(
        `<button type="button" class="city-picker-btn${state.atlasCountryId === co.id && !state.atlasCityId ? ' active' : ''}" data-country="${co.id}"><span>${co.nameZh}</span></button>`
      );
    }
  }
  list.innerHTML = bits.join('');
  const count = document.getElementById('atlas-count');
  if (count) {
    count.textContent = `中国 ${chinaAtlasCities().length} 城 · 世界 ${WORLD_CITIES.length} 城`;
  }
}

const MODE_LABEL = { metro: '地铁', hsr: '高铁', bus: '公交' };

function normLineQuery(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/地铁|地鐵/g, '')
    .replace(/号线|號線/g, '号线')
    .replace(/线|線/g, '');
}

function catalogAtlasLines() {
  const raw = state.view?.listLines?.() || [];
  const merged = new Map();
  for (const ln of raw) {
    const display = displayLineName(ln.line, 2026);
    const key = `${ln.cityId}::${display}`;
    let row = merged.get(key);
    if (!row) {
      row = { ...ln, display, aliases: [ln.line, display] };
      merged.set(key, row);
    } else if (!row.aliases.includes(ln.line)) {
      row.aliases.push(ln.line);
    }
  }
  return [...merged.values()];
}

function scoreLineHit(ln, q, ql, nq) {
  const display = String(ln.display || '');
  const badge = lineBadgeLabel(display);
  const aliases = (ln.aliases || []).map((a) => String(a));
      const city = cityDisplayName(ln.cityId);
  const pack = [display, badge, city, ...aliases];
  if (pack.some((x) => x === q || x.toLowerCase() === ql)) return 0;
  if (
    display.startsWith(q) ||
    badge === q ||
    badge.toLowerCase() === ql ||
    `${badge}路` === q ||
    `${badge}号线` === q
  )
    return 1;
  const nd = normLineQuery(display);
  const nb = normLineQuery(badge);
  if (nd === nq || nb === nq) return 2;
  if (pack.some((x) => x.toLowerCase().includes(ql)) || nd.includes(nq) || nb.includes(nq)) return 3;
  return -1;
}

function searchAtlasLines(query) {
  const q = String(query || '').trim();
  if (!q) return [];
  const ql = q.toLowerCase().replace(/\s+/g, '');
  const nq = normLineQuery(q);
  let preferCity = state.atlasCityId || '';
  for (const c of atlasCities()) {
    const name = String(c.name || '').toLowerCase();
    if (name && ql.startsWith(name)) preferCity = c.id;
  }
  const hits = [];
  for (const ln of catalogAtlasLines()) {
    const s = scoreLineHit(ln, q, ql, nq);
    if (s < 0) continue;
    hits.push({ ...ln, _s: s + (ln.cityId === preferCity ? 0 : 8) });
  }
  hits.sort((a, b) => a._s - b._s || compareLineNames(a.display, b.display));
  return hits.slice(0, 80);
}

function escHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

function clearLineSearchResults() {
  const box = document.getElementById('line-search-results');
  const list = document.getElementById('city-picker-list');
  if (box) {
    box.hidden = true;
    box.innerHTML = '';
  }
  if (list) list.hidden = false;
}

function filterAtlasLines(query) {
  const q = String(query || '').trim();
  const box = document.getElementById('line-search-results');
  const list = document.getElementById('city-picker-list');
  if (!box) return;
  if (!q) {
    clearLineSearchResults();
    return;
  }
  if (list) list.hidden = true;
  const hits = searchAtlasLines(q);
  box.hidden = false;
  if (!hits.length) {
    box.innerHTML = `<div class="line-search-empty">没有匹配线路</div>`;
    return;
  }
  box.innerHTML = hits
    .map((ln) => {
      const city = cityDisplayName(ln.cityId);
      const mode = MODE_LABEL[ln.mode] || '';
      const meta = [city, mode].filter(Boolean).join(' · ');
      return `<button type="button" class="line-search-hit" data-city="${ln.cityId || ''}" data-line="${encodeURIComponent(
        ln.line
      )}" data-display="${encodeURIComponent(ln.display)}" data-mode="${ln.mode || ''}" data-aliases="${encodeURIComponent(
        (ln.aliases || []).join('|')
      )}"><i style="background:${ln.color || '#888'}"></i><span>${escHtml(ln.display)}</span><em>${escHtml(meta)}</em></button>`;
    })
    .join('');
}

async function openSearchedLine(hit) {
  const cityId = hit.dataset.city || '';
  const mode = hit.dataset.mode || '';
  const display = decodeURIComponent(hit.dataset.display || '');
  const raw = decodeURIComponent(hit.dataset.line || '');
  const aliases = decodeURIComponent(hit.dataset.aliases || '')
    .split('|')
    .filter(Boolean);
  document.getElementById('city-picker')?.classList.remove('open');
  if (cityId && cityId !== state.atlasCityId) await selectAtlasCity(cityId);
  if (mode && !modeOn(mode)) await toggleAtlasMode(mode, { forceOn: true });
  const badge = {
    dataset: {
      name: display || raw,
      rawName: aliases.join('|') || raw,
    },
  };
  flyAtlasLine(badge, { toggle: false });
  const input = document.getElementById('line-search');
  if (input) input.value = display || raw;
  clearLineSearchResults();
}

function updateModeLegend() {
  const legend = document.getElementById('guideway-legend');
  if (!legend) return;
  const tram = legend.querySelector('.gw-elev')?.parentElement;
  const hsr = legend.querySelector('.gw-hsr')?.parentElement;
  const rail = legend.querySelector('.gw-rail')?.parentElement;
  const bus = legend.querySelector('.gw-bus')?.parentElement;
  const plan = legend.querySelector('.gw-plan')?.parentElement;
  if (tram) tram.hidden = !modeOn('metro');
  if (hsr) hsr.hidden = !modeOn('hsr');
  if (rail) rail.hidden = !modeOn('hsr');
  if (bus) bus.hidden = !modeOn('bus');
  if (plan) plan.hidden = modeOn('bus') && !modeOn('metro') && !modeOn('hsr');
}

function syncModeFilterUi() {
  document.querySelectorAll('#mode-filter [data-mode]').forEach((b) => {
    b.classList.toggle('active', modeOn(b.dataset.mode));
  });
  syncLayerFullBtn();
  updateModeLegend();
}

async function loadActiveModeLayers() {
  const jobs = [];
  if (modeOn('metro')) jobs.push(loadViewportMetros());
  if (modeOn('hsr')) {
    if (chinaRailNetworkReady()) state.view?.registerRails?.(chinaRailNetworkSegments());
    jobs.push(loadViewportWorldRails());
  }
  if (modeOn('bus')) jobs.push(loadViewportBuses());
  await Promise.all(jobs);
}

function paintWorldSegs(segs) {
  if (!state.view || !segs?.length) return;
  for (const seg of segs) {
    state.revealed.add(seg.id);
    state.view.addSegmentStatic(seg, { deferLabels: true });
  }
}

async function loadCountryTransit(countryId, preferCity) {
  if (!countryId || countryId === 'cn') return;
  const skip = chinaCityIds();
  if (preferCity && !skip.has(preferCity)) {
    paintWorldSegs(await ensureWorldMetro(preferCity));
    state.view?.setModeFilter?.([...state.modeFilters]);
  }
  const metro = await loadWorldMetroForCountry(countryId, skip);
  const rail = await loadWorldRailForCountry(countryId);
  const netRails = rail.filter((s) => s.networkRail);
  const other = rail.filter((s) => !s.networkRail);
  paintWorldSegs([...metro, ...other]);
  if (netRails.length) {
    state.view?.registerRails?.(netRails);
    state.view?.syncViewportRails?.();
  }
  state.view?.setModeFilter?.([...state.modeFilters]);
}

/** 低缩放世界总览时先挂的一批大城市，避免「只有灰底图」 */
const OVERVIEW_METRO_CITIES = [
  'beijing',
  'shanghai',
  'guangzhou',
  'shenzhen',
  'tokyo',
  'osaka',
  'seoul',
  'singapore',
  'hongkong',
  'delhi',
  'mumbai',
  'bangkok',
  'jakarta',
  'manila',
  'moscow',
  'london',
  'paris',
  'berlin',
  'madrid',
  'nyc',
  'chicago',
  'mexico_city',
  'sao_paulo',
  'cairo',
  'istanbul',
  'tehran',
  'sydney',
  'melbourne',
];

async function loadViewportMetros() {
  if (!state.atlasReady || !state.view || !modeOn('metro')) return;
  if (state.layerFullLoad.metro) {
    paintWorldSegs(allBoundWorldSegments());
    state.view?.setModeFilter?.([...state.modeFilters]);
    refreshAtlasHud({ live: true });
    return;
  }
  const z = state.view.getZoom?.() ?? 0;
  const center = state.view.getCenter?.();
  if (!center) return;
  const ids = new Set();
  if (z < 6.5) {
    for (const id of OVERVIEW_METRO_CITIES) ids.add(id);
  } else {
    for (const id of citiesNearView(center, z)) ids.add(id);
  }
  if (state.atlasCityId) ids.add(state.atlasCityId);
  if (state.atlasCountryId && state.atlasCountryId !== 'cn') {
    for (const c of atlasCities().filter((x) => x.country === state.atlasCountryId)) ids.add(c.id);
  }
  const chunks = await Promise.all([...ids].map((id) => ensureWorldMetro(id)));
  paintWorldSegs(chunks.flat());
  // 视口国家 ORM 城轨轨位（地铁/轻轨/有轨）
  const bounds = state.view.getBounds?.();
  if (bounds && z >= 7.2) {
    let cids = countriesIntersectingView(bounds, { pad: 0.6 });
    if (state.atlasCountryId && state.atlasCountryId !== 'cn') {
      cids = [state.atlasCountryId, ...cids.filter((x) => x !== state.atlasCountryId)];
    }
    if (cids.length > 8) cids = cids.slice(0, 8);
    const urban = await Promise.all(cids.map((id) => ensureWorldOrmUrban(id)));
    paintWorldSegs(urban.flat());
  }
  state.view?.setModeFilter?.([...state.modeFilters]);
}

async function loadViewportWorldRails() {
  if (!state.atlasReady || !state.view || !modeOn('hsr')) {
    state.view?.syncViewportRails?.();
    return;
  }
  if (state.layerFullLoad.hsr) {
    if (chinaRailNetworkReady()) state.view?.registerRails?.(chinaRailNetworkSegments());
    state.view?.syncViewportRails?.();
    refreshAtlasHud({ live: true });
    return;
  }
  const z = state.view.getZoom?.() ?? 0;
  if (z < 4.2) {
    state.view?.syncViewportRails?.();
    return;
  }
  const bounds = state.view.getBounds?.();
  if (!bounds) return;
  let ids = countriesIntersectingView(bounds, { pad: z >= 6 ? 0.8 : 1.5 });
  if (state.atlasCountryId && state.atlasCountryId !== 'cn') ids = [state.atlasCountryId, ...ids.filter((x) => x !== state.atlasCountryId)];
  // 视口国家过多时优先当前国 + 面积较小者，避免一次打爆
  if (ids.length > 12) ids = ids.slice(0, 12);
  const segs = (
    await Promise.all(
      ids.map(async (id) => {
        const orm = await ensureWorldOrmRails(id);
        if (orm.length) return orm;
        return ensureWorldRailNetwork(id);
      })
    )
  ).flat();
  if (segs.length) state.view?.registerRails?.(segs);
  // 中国全网始终可叠
  if (chinaRailNetworkReady()) state.view?.registerRails?.(chinaRailNetworkSegments());
  state.view?.syncViewportRails?.();
}

function busCityIds() {
  const ids = new Set(state.busCities || []);
  for (const c of atlasCities()) ids.add(c.id);
  return [...ids];
}

function activeModes() {
  return ['metro', 'hsr', 'bus'].filter((m) => modeOn(m));
}

function modesLabel(modes) {
  return (modes || activeModes()).map((m) => MODE_LABEL[m]).join('+');
}

function syncLayerFullBtn() {
  const btn = document.getElementById('layer-full-btn');
  if (!btn) return;
  const modes = activeModes();
  btn.hidden = !modes.length;
  const on = modes.length > 0 && modes.every((m) => state.layerFullLoad[m]);
  btn.classList.toggle('active', on);
  btn.disabled = !!state.layerFullLoading;
  const tag = modesLabel(modes);
  btn.textContent = state.layerFullLoading ? '加载中…' : on ? '已全量' : '全量';
  btn.title = on
    ? `关闭 ${tag} 全量，恢复视口懒加载`
    : `全量加载当前叠加图层：${tag}`;
}

function openLayerFullConfirm(modes) {
  const list = (modes?.length ? modes : activeModes()).filter(
    (m) => m === 'metro' || m === 'hsr' || m === 'bus'
  );
  const el = document.getElementById('layer-full-confirm');
  const title = document.getElementById('layer-full-title');
  const text = document.getElementById('layer-full-text');
  if (!el || !list.length) return;
  el.dataset.modes = list.join(',');
  const label = modesLabel(list);
  if (title) title.textContent = `全量加载${label}？`;
  if (text) {
    text.textContent = `会把当前已叠加的「${label}」已缓存数据一次挂上。数据量大，可能明显卡顿、发热、耗电；OSM 本身不全，全量也不会变成官方总里程。`;
  }
  el.hidden = false;
}

function closeLayerFullConfirm() {
  const el = document.getElementById('layer-full-confirm');
  if (el) el.hidden = true;
}

function setLayersFullLoad(modes, on) {
  const list = (modes?.length ? modes : activeModes()).filter(
    (m) => m === 'metro' || m === 'hsr' || m === 'bus'
  );
  for (const mode of list) state.layerFullLoad[mode] = !!on;
  if (list.includes('bus')) state.view?.setBusFullLoad?.(!!on);
  if (list.includes('hsr')) state.view?.setRailFullLoad?.(!!on);
  syncLayerFullBtn();
  if (!on) {
    void loadActiveModeLayers();
    refreshAtlasHud({ live: true });
  }
}

async function enableLayersFullLoad(modes) {
  if (state.layerFullLoading) return;
  const list = (modes?.length ? modes : activeModes()).filter(
    (m) => m === 'metro' || m === 'hsr' || m === 'bus'
  );
  if (!list.length) return;
  state.layerFullLoading = true;
  syncLayerFullBtn();
  const label = modesLabel(list);
  setAtlasLoading(true, `正在全量加载${label}…`);
  try {
    if (list.includes('metro')) {
      setAtlasLoading(true, `全量地铁…`);
      const segs = await loadAllWorldMetros(worldCityIds(), (done, total) => {
        setAtlasLoading(true, `全量地铁 ${done}/${total}`);
      });
      paintWorldSegs(segs);
      paintWorldSegs(allBoundWorldSegments());
      state.layerFullLoad.metro = true;
    }
    if (list.includes('hsr')) {
      setAtlasLoading(true, `全量铁路…`);
      if (chinaRailNetworkReady()) state.view?.registerRails?.(chinaRailNetworkSegments());
      const segs = await loadAllWorldOrmRails(null, (done, total) => {
        setAtlasLoading(true, `全量铁路 ${done}/${total}`);
      });
      if (segs.length) state.view?.registerRails?.(segs);
      state.view?.setRailFullLoad?.(true);
      state.view?.syncViewportRails?.();
      state.layerFullLoad.hsr = true;
    }
    if (list.includes('bus')) {
      setAtlasLoading(true, `全量公交…`);
      await loadAllCityBuses(busCityIds(), (done, total) => {
        setAtlasLoading(true, `全量公交 ${done}/${total}`);
      });
      state.view?.registerBuses?.(allBoundCityBusSegments());
      state.view?.setBusFullLoad?.(true);
      state.view?.syncViewportBuses?.();
      state.layerFullLoad.bus = true;
    }
    state.view?.setModeFilter?.([...state.modeFilters]);
    refreshAtlasHud({ live: true });
  } finally {
    state.layerFullLoading = false;
    setAtlasLoading(false);
    syncLayerFullBtn();
  }
}

async function loadViewportBuses() {
  if (!state.atlasReady || !state.view || !modeOn('bus')) {
    state.view?.syncViewportBuses?.();
    return;
  }
  if (state.layerFullLoad.bus) {
    state.view?.registerBuses?.(allBoundCityBusSegments());
    state.view?.syncViewportBuses?.();
    refreshAtlasHud({ live: true });
    return;
  }
  const z = state.view.getZoom?.() ?? 0;
  // 公交线极密：全球/大洲视口不拉全量；选中国家可略早加载
  const minZ = state.atlasCityId ? 8 : state.atlasCountryId ? 7.5 : 9;
  if (z < minZ) {
    state.view.syncViewportBuses?.();
    refreshAtlasHud({ live: true });
    return;
  }
  const center = state.view.getCenter?.();
  if (!center) return;
  const ids = new Set();
  if (state.atlasCityId) ids.add(state.atlasCityId);
  const deg = z >= 12 ? 0.35 : z >= 10 ? 0.7 : state.atlasCountryId ? 1.8 : 1.2;
  const lngScale = Math.max(0.4, Math.cos((center.lat * Math.PI) / 180));
  const pool =
    state.atlasCountryId && !state.atlasCityId
      ? atlasCities().filter((c) => c.country === state.atlasCountryId)
      : atlasCities();
  for (const c of pool) {
    if (c.lat == null || c.lng == null) continue;
    if (Math.abs(c.lat - center.lat) <= deg && Math.abs(c.lng - center.lng) <= deg / lngScale) {
      ids.add(c.id);
    }
  }
  // 国家全境：视口内无点时仍拉本国前几城，避免公里数一直为 0
  if (!ids.size && state.atlasCountryId && !state.atlasCityId) {
    for (const c of pool.slice(0, 6)) ids.add(c.id);
  }
  for (const id of ids) {
    const segs = await ensureCityBuses(id);
    state.view.registerBuses?.(segs);
  }
  state.view.syncViewportBuses?.();
  refreshAtlasHud({ live: true });
}

async function loadCityBusesOntoMap(cityId) {
  if (!cityId) {
    await loadViewportBuses();
    return;
  }
  const segs = await ensureCityBuses(cityId);
  state.view?.registerBuses?.(segs);
  state.view?.syncViewportBuses?.();
}

/** 切换图层：可叠加；至少保留一个 */
async function toggleAtlasMode(mode, { forceOn = false } = {}) {
  const next = mode === 'metro' || mode === 'hsr' || mode === 'bus' ? mode : '';
  if (!next) return;
  if (forceOn) {
    state.modeFilters.add(next);
    state.modeFilter = next;
  } else if (state.modeFilters.has(next)) {
    if (state.modeFilters.size <= 1) return;
    state.modeFilters.delete(next);
    if (state.modeFilter === next) {
      state.modeFilter = [...state.modeFilters][0];
    }
  } else {
    state.modeFilters.add(next);
    state.modeFilter = next;
  }
  clearLineFocus();
  state.view?.setModeFilter?.([...state.modeFilters]);
  state.hudLineKey = '';
  syncModeFilterUi();
  await loadActiveModeLayers();
  refreshAtlasHud();
  state.view?.relayoutAllLabels?.();
}

/** 兼容：单选切到某一模式（搜索定位等） */
async function setAtlasMode(mode) {
  const next = mode === 'metro' || mode === 'hsr' || mode === 'bus' ? mode : 'metro';
  state.modeFilters = new Set([next]);
  state.modeFilter = next;
  clearLineFocus();
  state.view?.setModeFilter?.([next]);
  state.hudLineKey = '';
  syncModeFilterUi();
  await loadActiveModeLayers();
  refreshAtlasHud();
}

function markAtlasCity() {
  renderAtlasPicker();
}

function beginAtlasNav() {
  state.atlasNavGen += 1;
  return state.atlasNavGen;
}

function atlasNavAlive(gen) {
  return gen === state.atlasNavGen;
}

async function selectAtlasWorld() {
  const gen = beginAtlasNav();
  state.atlasCityId = '';
  state.atlasCountryId = '';
  state.pickerLevel = 'world';
  renderAtlasPicker();
  clearLineFocus();
  if (!state.view) return;
  state.view.setStampCity?.('');
  // 以欧亚为中心的世界总览（旧坐标 10,22 落在大西洋，手机上看起来像「没地图」）
  await state.view.flyTo?.(95, 28, 3.2);
  if (!atlasNavAlive(gen)) return;
  await loadActiveModeLayers();
  if (!atlasNavAlive(gen)) return;
  state.view.relayoutAllLabels?.();
  refreshAtlasHud();
  // 移动端首屏布局晚于 Leaflet 初始化，补一次尺寸
  requestAnimationFrame(() => {
    state.view?.invalidate?.();
    setTimeout(() => state.view?.invalidate?.(), 280);
  });
}

async function selectAtlasCountry(id) {
  if (!id) return selectAtlasWorld();
  const gen = beginAtlasNav();
  state.atlasCountryId = id;
  state.atlasCityId = '';
  state.pickerLevel = 'country';
  renderAtlasPicker();
  clearLineFocus();
  if (!state.view) return;
  state.view.setStampCity?.('');
  await loadCountryTransit(id);
  if (!atlasNavAlive(gen)) return;
  const co = worldCountryById(id);
  if (co?.bbox) await state.view.flyToBBox?.(co.bbox, { maxZoom: 6.4 });
  else await state.view.flyChina?.();
  if (!atlasNavAlive(gen)) return;
  await loadActiveModeLayers();
  if (!atlasNavAlive(gen)) return;
  state.view.relayoutAllLabels?.();
  refreshAtlasHud();
}

async function selectAtlasCity(cityId, countryHint) {
  if (!cityId) {
    if (state.atlasCountryId) return selectAtlasCountry(state.atlasCountryId);
    return selectAtlasWorld();
  }
  const gen = beginAtlasNav();
  const hit = atlasCities().find((c) => c.id === cityId);
  state.atlasCityId = cityId;
  state.atlasCountryId = countryHint || hit?.country || 'cn';
  state.pickerLevel = 'country';
  renderAtlasPicker();
  clearLineFocus();
  if (!state.view) return;
  await loadCountryTransit(state.atlasCountryId, cityId);
  if (!atlasNavAlive(gen)) return;
  state.view.setStampCity?.(cityId);
  const layersP = loadActiveModeLayers();
  const flew = await state.view.flyToCityNetwork?.(cityId, {
    maxZoom: modeOn('bus') && !modeOn('metro') ? 12.4 : 12.2,
  });
  if (!atlasNavAlive(gen)) return;
  if (!flew) {
    const place = PLACES[cityId] || worldCityById(cityId);
    if (place) await state.view.flyTo(place.lng, place.lat, 11.2);
  }
  if (!atlasNavAlive(gen)) return;
  await layersP;
  if (!atlasNavAlive(gen)) return;
  state.view.relayoutAllLabels?.();
  refreshAtlasHud();
}

function syncLineBadgeFocus() {
  const linesEl = document.getElementById('city-lines');
  if (!linesEl) return;
  const focus = state.focusLine;
  linesEl.classList.toggle('is-focus', !!focus);
  linesEl.querySelectorAll('.city-line-badge').forEach((el) => {
    const raw = el.dataset.rawName || el.dataset.name;
    el.classList.toggle('on', !!(focus && (raw === focus || el.dataset.name === focus)));
  });
}

function clearLineFocus() {
  if (!state.focusLine && !state.view?.getFocusLine?.()) return;
  state.focusLine = '';
  state.view?.setFocusLine?.('');
  syncLineBadgeFocus();
}

function badgeLineAliases(badge) {
  const names = new Set();
  const display = badge?.dataset?.name || '';
  if (display) names.add(display);
  for (const part of String(badge?.dataset?.rawName || '').split('|')) {
    if (part) names.add(part);
  }
  for (const rule of LINE_DISPLAY_ALIASES) {
    if (rule.to === display) for (const from of rule.from) names.add(from);
  }
  return [...names];
}

async function focusAtlasMapLine(info) {
  if (!info?.line || state.editing || state.exporting || !state.view) return;
  if (info.cityId && info.cityId !== state.atlasCityId) await selectAtlasCity(info.cityId);
  if (info.mode && !modeOn(info.mode)) await toggleAtlasMode(info.mode, { forceOn: true });
  const display = displayLineName(info.line, 2026);
  const aliases = new Set([info.line, display]);
  const badge = [...document.querySelectorAll('.city-line-badge')].find(
    (el) => el.dataset.name === display || el.dataset.name === info.line
  );
  if (badge) {
    for (const name of badgeLineAliases(badge)) aliases.add(name);
    badge.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }
  state.focusLine = display;
  state.view.setFocusLine?.([...aliases]);
  syncLineBadgeFocus();
}

function flyAtlasLine(badge, { toggle = true } = {}) {
  if (!badge || !state.view) return;
  const key = badge.dataset.name || badge.dataset.rawName || '';
  if (!key) return;
  const next = !toggle ? key : state.focusLine === key ? '' : key;
  const aliases = next ? badgeLineAliases(badge) : [];
  state.focusLine = next;
  state.view.setFocusLine?.(aliases);
  syncLineBadgeFocus();
  if (next) {
    state.view.flyToCityNetwork?.(state.atlasCityId, {
      lineName: aliases.join('|'),
      maxZoom: 13.4,
    });
  }
}

function refreshAtlasHud({ live = false } = {}) {
  const cityId = state.atlasCityId || null;
  const kmWrap = document.getElementById('city-km-wrap');
  const stWrap = document.getElementById('city-st-wrap');
  const linesEl = document.getElementById('city-lines');
  const placeEl = document.getElementById('city-place');
  if (!kmWrap || !stWrap || !linesEl) return;

  if (!cityId) {
    const scopeCities =
      state.atlasCountryId === 'cn'
        ? chinaAtlasCities().map((c) => c.id)
        : state.atlasCountryId
          ? atlasCities().filter((c) => c.country === state.atlasCountryId).map((c) => c.id)
          : null;
    const nation =
      state.view?.nationHud?.({
        countryId: state.atlasCountryId || '',
        cityIds: scopeCities,
      }) || {
        km: 0,
        lines: 0,
        metroKm: 0,
        busKm: 0,
        hsKm: 0,
        railKm: 0,
      };
    if (placeEl) {
      placeEl.textContent = scopeLabel();
      placeEl.hidden = false;
    }
    kmWrap.hidden = false;
    // 目标口径：全球运营公共交通线路总长（相加、不去重）；主数字=当前可见已加载合计
    const onlyHsr = modeOn('hsr') && !modeOn('metro') && !modeOn('bus');
    const showKm = onlyHsr && nation.hsKm > 0 ? nation.hsKm : nation.km;
    document.getElementById('city-km').textContent = formatCityKm(showKm);
    const kmLab = kmWrap.querySelector('.city-stat-lab');
    if (kmLab) {
      const order = [
        'subway',
        'light_rail',
        'tram',
        'monorail',
        'hsr',
        'commuter',
        'rail',
        'brt',
        'trolleybus',
        'bus',
        'ferry',
        'funicular',
      ];
      const labels = nation.bucketLabels || {};
      const buckets = nation.buckets || {};
      const parts = [];
      for (const key of order) {
        const b = buckets[key];
        if (!b?.km) continue;
        parts.push(`${labels[key] || key} ${formatCityKm(b.km)}`);
      }
      const n = nation.lines || 0;
      const head = '运营线路公里·未去重·已加载';
      kmLab.textContent = parts.length
        ? `${head} · ${parts.join(' · ')}${n ? ` · ${n.toLocaleString('zh-CN')} 条` : ''}`
        : head;
      kmLab.title =
        '目标：全球实际运营公共交通线路总长（公交/BRT/无轨/地铁/轻轨/有轨/单轨/高铁/普铁/通勤城际/渡轮等），线路里程相加、共用段不去重。此数为当前图上已加载部分。';
    }
    state.hudCityId = null;
    state.hudLineKey = '';
    stWrap.hidden = true;
    linesEl.classList.remove('in');
    linesEl.hidden = true;
    linesEl.innerHTML = '';
    const legendOff = document.getElementById('guideway-legend');
    if (legendOff) legendOff.hidden = true;
    renderCityMinimap([]);
    return;
  }

  const stats = state.view?.cityHud?.(cityId, { includePlanned: true }) || {
    km: 0,
    stations: 0,
    lines: [],
    paths: [],
  };
  if (placeEl) {
    placeEl.textContent = cityDisplayName(cityId);
    placeEl.hidden = false;
  }
  kmWrap.hidden = false;
  document.getElementById('city-km').textContent = formatCityKm(stats.km);
  const kmLabCity = kmWrap.querySelector('.city-stat-lab');
  if (kmLabCity) kmLabCity.textContent = '公里';
  document.getElementById('city-st').textContent = String(stats.stations);
  stWrap.hidden = false;
  const legendOn = document.getElementById('guideway-legend');
  if (legendOn) {
    legendOn.hidden = false;
    updateModeLegend();
  }

  if (state.hudCityId !== cityId) {
    state.hudCityId = cityId;
    state.hudLineKey = '';
    linesEl.innerHTML = '';
    linesEl.classList.remove('in');
  }

  const merged = new Map();
  const rawsByDisplay = new Map();
  const linesRaw = [...stats.lines].sort((a, b) => compareLineNames(a.name, b.name));
  const lines = modeOn('bus') || modeOn('hsr') ? linesRaw.slice(0, 80) : linesRaw;
  for (const ln of lines) {
    const name = displayLineName(ln.name, 2026);
    if (!merged.has(name)) merged.set(name, ln.color);
    if (!rawsByDisplay.has(name)) rawsByDisplay.set(name, new Set());
    rawsByDisplay.get(name).add(ln.name);
    rawsByDisplay.get(name).add(name);
  }
  const lineKey = [...merged.keys()].join('|');
  if (lineKey !== state.hudLineKey) {
    state.hudLineKey = lineKey;
    if (!merged.size) {
      linesEl.classList.remove('in');
      linesEl.hidden = true;
      linesEl.innerHTML = '';
    } else {
      linesEl.hidden = false;
      reconcileLineBadges(linesEl, merged, { animate: live });
      linesEl.querySelectorAll('.city-line-badge').forEach((el) => {
        const raws = rawsByDisplay.get(el.dataset.name);
        el.dataset.rawName = raws?.size ? [...raws].join('|') : el.dataset.name;
      });
      syncLineBadgeFocus();
      if (live) requestAnimationFrame(() => linesEl.classList.add('in'));
      else linesEl.classList.add('in');
    }
  }

  const now = performance.now();
  if (!live || now - state.hudMiniAt > 180) {
    state.hudMiniAt = now;
    renderCityMinimap(stats.paths);
  }
}

async function openAtlas() {
  ensureMap();
  state.started = true;
  state.playing = false;
  setAtlasLoading(true, '正在铺线网…');
  const list = scenes();
  await rebuildStaticUpTo(list.length - 1);
  state.view?.applyOfficialLineColors?.();
  state.sceneIndex = list.length - 1;
  state.atlasReady = true;
  paintWorldSegs(allBoundWorldSegments());
  setAtlasLoading(false);
  state.view?.setModeFilter?.([...state.modeFilters]);
  syncModeFilterUi();
  if (state.atlasCityId) await selectAtlasCity(state.atlasCityId, state.atlasCountryId);
  else if (state.atlasCountryId) await selectAtlasCountry(state.atlasCountryId);
  else await selectAtlasWorld();
}

function startDemo() {
  openAtlas();
}

function switchChapter(id) {
  state.chapter = id;
  openAtlas();
}

function updateChapterChrome() {
  const brand = document.getElementById('brand-mini');
  if (brand) brand.textContent = 'World Railway Maps';
}

function resetLayers(bag) {
  if (!bag) {
    clearGrow();
    state.revealed.clear();
    state.retired.clear();
    state.cityLit.clear();
    state.view?.clearAll();
    state.hudCityId = null;
    state.hudLineKey = '';
    return;
  }
  bag.revealed.clear();
  bag.retired.clear();
  bag.cityLit.clear();
  bag.view?.clearAll();
}

function resetAndPlay() {
  ensureMap();
  resetLayers();
  state.sceneIndex = -1;
  play();
}

function play() {
  hideEnd();
  if (state.sceneIndex >= scenes().length - 1 && state.sceneIndex >= 0) {
    resetLayers();
    state.sceneIndex = -1;
  }
  setEditUi(false);
  state.playing = true;
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  if (iconPlay) iconPlay.hidden = true;
  if (iconPause) iconPause.hidden = false;
  const toggle = document.getElementById('edit-toggle');
  if (toggle) toggle.hidden = true;
  runLoop();
}

function pause() {
  state.playing = false;
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  if (iconPlay) iconPlay.hidden = false;
  if (iconPause) iconPause.hidden = true;
  clearTimeout(state.timer);
  state.timer = null;
  clearGrow();
  const toggle = document.getElementById('edit-toggle');
  if (toggle) toggle.hidden = false;
}

async function runLoop() {
  if (!state.playing || state.advancing) return;
  const next = state.sceneIndex + 1;
  if (next >= scenes().length) {
    pause();
    showEnd();
    return;
  }
  await goScene(next, { animateCam: true, growing: true });
  if (!state.playing) return;
  state.timer = setTimeout(() => {
    if (!state.playing) return;
    runLoop();
  }, 1100 / state.speed);
}

function previewScrubHud(index) {
  const list = scenes();
  const sc = list[index];
  if (!sc) return;
  document.getElementById('scene-slider').value = String(index);
  document.getElementById('scene-pos').textContent = String(index + 1);
  setYearHud(sc);
  fillToast(sc);
}

async function goScene(index, { animateCam = true, growing = false, instant = false } = {}) {
  const list = scenes();
  if (index < 0 || index >= list.length) return;
  ensureMap();

  const seekId = ++state.seekGen;
  state.advancing = true;
  clearGrow();

  const prev = state.sceneIndex;
  const forwardOne = index === prev + 1;
  // instant：导出用，瞬间落图，不播伸展/镜头动画
  const wantGrow = !instant && (growing || forwardOne);

  if (forwardOne) {
    if (prev >= 0) state.view.demoteActive();
  } else if (index > prev && prev >= 0) {
    await applyScenesStatic(prev + 1, index - 1);
    if (seekId !== state.seekGen) return;
  } else {
    await rebuildStaticUpTo(index - 1);
    if (seekId !== state.seekGen) return;
  }

  state.sceneIndex = index;
  const sc = list[index];
  state.view.setStampCity?.(hudCityId(sc));

  document.getElementById('scene-slider').value = String(index);
  document.getElementById('scene-pos').textContent = String(index + 1);
  setYearHud(sc);
  document.getElementById('year-hero').classList.add('event');

  showToast(sc, { instant: instant || !animateCam });
  updateCityHud(sc);

  const pendingSegs = resolveSceneSegments(sc).filter((s) => !state.revealed.has(s.id));
  const willGrow = wantGrow && pendingSegs.length > 0 && !sc.instantSegments;

  // 有线路伸展且跟拍时交给 grow；followCam:false 时仍先落到 focus（如华段伸入罗湖）
  if (animateCam && !instant && (!willGrow || sc.followCam === false)) {
    if (sc.camSweep && willGrow) {
      // growAlongCam 会从 camStart 匀速推到 camEnd
    } else if (sc.camSweep && sc.camEnd) {
      await state.view.flyTo(
        sc.camEnd.lng,
        sc.camEnd.lat,
        sc.camStart?.zoom ?? sc.camEnd.zoom ?? 15,
        0.7
      );
    } else if (sc.camStart) {
      await state.view.flyTo(sc.camStart.lng, sc.camStart.lat, sc.camStart.zoom ?? 15, 0.7);
    } else if (sc.nationalMap || sc.overview) {
      if (sc.fitNetwork && state.revealed.size > 0) {
        await state.view.flyToNetwork({
          pad: sc.focusPad ?? 48,
          maxZoom: sc.focusZoom ?? 5.5,
          duration: 1.0 / Math.max(0.5, state.speed),
        });
      } else if (sc.focus) {
        await state.view.flyTo(sc.focus.lng, sc.focus.lat, sc.focus.zoom ?? 4.2);
      } else {
        await state.view.flyChina();
      }
    } else if (sc.fitNetwork) {
      await state.view.flyToNetwork({
        pad: sc.focusPad ?? 64,
        maxZoom: sc.focusZoom ?? 12,
        duration: 1.2 / Math.max(0.5, state.speed),
      });
    } else if (sc.focusStations?.length) {
      const railLook = state.view.longRailLook?.(sc);
      if (railLook) await state.view.flyTo(railLook.lng, railLook.lat, railLook.zoom);
      else await state.view.flyToStations(sc.focusStations, sc.focusPad ?? 0.18);
    } else if (sc.focus) {
      const z = sc.focus.zoom ?? 14;
      await state.view.flyTo(
        sc.focus.lng,
        sc.focus.lat,
        z < 10 ? z : Math.min(17, Math.max(12, z))
      );
    }
    if (seekId !== state.seekGen) return;
  }

  const followCam = !instant && sc.followCam !== false && wantGrow;
  const railLook = state.view.longRailLook?.(sc) || null;

  // 导出快进 / 拖进度条：瞬间落到该镜，不飞行动画
  if ((instant || !animateCam) && state.view?.snapCamera) {
    state.view.snapCamera(sc);
  }

  if (sc.camSweep && wantGrow && !instant && pendingSegs.length) {
    for (const seg of pendingSegs) {
      state.retired.delete(seg.id);
      state.revealed.add(seg.id);
    }
    await state.view.growAlongCam(pendingSegs, {
      duration: sc.camDuration ?? 10,
      from: sc.camStart,
      to: sc.camEnd,
      path: sc.camPath,
      zoom: sc.camStart?.zoom ?? 15,
      speed: state.speed,
    });
    if (seekId !== state.seekGen) return;
  } else if (sc.parallelGrow && wantGrow && !instant && pendingSegs.length) {
    for (const seg of pendingSegs) {
      state.retired.delete(seg.id);
      state.revealed.add(seg.id);
    }
    await state.view.growParallel(pendingSegs, {
      speed: state.speed,
      focus: sc.focus,
    });
    if (seekId !== state.seekGen) return;
  } else if (sc.instantSegments || instant) {
    for (const seg of pendingSegs) {
      state.retired.delete(seg.id);
      state.revealed.add(seg.id);
      state.view.addSegmentStatic(seg, { deferLabels: true });
    }
    // 导出时跳过站名排版（leafletView.exportFast）；普通 instant 仍排一次
    if (pendingSegs.length && !state.exporting) state.view.relayoutAllLabels();
  } else {
    for (const seg of resolveSceneSegments(sc)) {
      if (state.revealed.has(seg.id)) continue;
      state.retired.delete(seg.id); // 允许战时撤线后复运（如同 id 英段）
      state.revealed.add(seg.id);
      await state.view.growSegment(seg, {
        animate: wantGrow,
        speed: state.speed,
        followCam,
        railLook: state.view.longRailLookForSeg?.(seg, sc) || railLook,
      });
      if (seekId !== state.seekGen) return;
    }
  }

  // 站名更名 / 旗站升格开通（如立新→公主坟、大埔墟旗站→大埔墟）
  if (sc.stationRename) {
    if (!instant && (wantGrow || animateCam)) {
      await state.view.playStationRename(sc.stationRename, { speed: state.speed });
    } else {
      state.view.applyStationRename(sc.stationRename, stationOpOpts(sc));
    }
  }

  // 线路更名等：框住已有线路后短暂高亮
  if (!instant && (sc.highlightSegIds?.length || sc.highlightFromLine) && (wantGrow || animateCam)) {
    await state.view.highlightSegments(sc.highlightSegIds, {
      ms: 1400 / state.speed,
      fromLine: sc.highlightFromLine,
    });
  }

  // 一线消散 → 环线接力
  if (sc.lineHandoff) {
    const anim = !instant && wantGrow;
    await state.view.playLineHandoff(sc.lineHandoff, {
      animate: anim,
      speed: state.speed,
      followCam: anim,
    });
    state.revealed.add(sc.lineHandoff.segment.id);
    if (sc.lineHandoff.alsoGrow) state.revealed.add(sc.lineHandoff.alsoGrow.id);
    for (const id of sc.lineHandoff.fadeSegIds || []) {
      state.revealed.delete(id);
      state.retired.add(id);
    }
  }

  // 通勤停运等：线段消散并从图上撤下
  if (sc.retireSegIds?.length) {
    const anim = !instant && wantGrow;
    await state.view.retireSegments(sc.retireSegIds, {
      animate: anim,
      speed: state.speed,
      holdCam: !!sc.retireHoldCam,
    });
    for (const id of sc.retireSegIds) {
      state.revealed.delete(id);
      state.retired.add(id);
    }
  }

  // 临时站拆除等：站名从图上撤下（线位可保留）
  if (sc.retireStations?.length) {
    state.view.retireStations(sc.retireStations, stationOpOpts(sc));
  }

  if (sc.trimSegStart) {
    state.view.trimSegStart(sc.trimSegStart);
  }

  if (sc.terminusMove) {
    if (!instant && (wantGrow || animateCam)) {
      await state.view.playTerminusMove(sc.terminusMove, { speed: state.speed });
    } else {
      state.view.applyTerminusMove(sc.terminusMove);
    }
  }

  // 既有线上增设车站（如上水）
  if (sc.addStations?.length) {
    state.view.addStations(sc.addStations, stationOpOpts(sc));
  }

  if (sc.openStations?.length) {
    state.view.openStations(sc.openStations, stationOpOpts(sc));
  }

  // 城铁并入等：改规范标识色
  const animRecolor = !instant && (wantGrow || animateCam);
  for (const spec of recolorSpecs(sc)) {
    await state.view.recolorSegments(spec.segIds, spec.color, {
      animate: animRecolor,
      speed: state.speed,
      lineName: spec.lineName,
      fromLine: spec.fromLine,
      cityId: hudCityId(sc) || sc.cityId || '',
    });
  }

  if (sc.cityDot && !state.cityLit.has(sc.cityDot.id)) {
    state.cityLit.add(sc.cityDot.id);
    state.view.addCityMarker(sc.cityDot);
  }

  state.view.syncExtraLines?.(sc.year, { date: sc.date });
  updateCityHud(sc);
  if (!instant && animateCam) {
    clearTimeout(state.toastFadeTimer);
    state.toastFadeTimer = setTimeout(() => fadeToastOut(), 380 / Math.max(state.speed, 0.35));
  }

  if (seekId === state.seekGen) state.advancing = false;
}

function yieldToPaint() {
  return new Promise((r) => setTimeout(r, 0));
}

async function applyScenesStatic(from, to, bag, want) {
  const view = bag?.view || state.view;
  const revealed = bag?.revealed || state.revealed;
  const retired = bag?.retired || state.retired;
  const cityLit = bag?.cityLit || state.cityLit;
  if (to < from || !view) return;
  const list = scenes();
  const end = Math.min(to, list.length - 1);
  // 批量静默绘制：禁止每段都 relayout（否则拖进度条 O(n²) 卡死）
  for (let i = from; i <= end; i++) {
    const sc = list[i];
    if (want && !want(sc, i)) continue;
    view.setStampCity?.(hudCityId(sc));
    for (const seg of resolveSceneSegments(sc)) {
      if (seg.style === 'bus') continue;
      if (!bag && chinaRailNetworkReady() && classifyTransitMode(seg) === 'hsr') {
        if (seg.style !== 'planned' || chinaRailNetworkHas(seg.line)) continue;
      }
      if (revealed.has(seg.id)) continue;
      retired.delete(seg.id);
      revealed.add(seg.id);
      view.addSegmentStatic(seg, { deferLabels: true });
    }
    if (sc.lineHandoff?.segment && !revealed.has(sc.lineHandoff.segment.id)) {
      view.applyLineHandoffStatic(sc.lineHandoff, { deferLabels: true });
      revealed.add(sc.lineHandoff.segment.id);
      if (sc.lineHandoff.alsoGrow) revealed.add(sc.lineHandoff.alsoGrow.id);
      for (const id of sc.lineHandoff.fadeSegIds || []) {
        revealed.delete(id);
        retired.add(id);
      }
    }
    if (sc.retireSegIds?.length) {
      for (const id of sc.retireSegIds) {
        view.removeSegment(id, { deferLabels: true });
        revealed.delete(id);
        retired.add(id);
      }
    }
    if (sc.retireStations?.length) view.retireStations(sc.retireStations, stationOpOpts(sc, { deferLabels: true }));
    if (sc.stationRename) view.applyStationRename(sc.stationRename, stationOpOpts(sc, { deferLabels: true }));
    if (sc.trimSegStart) view.trimSegStart(sc.trimSegStart, { deferLabels: true });
    if (sc.terminusMove) view.applyTerminusMove(sc.terminusMove, { deferLabels: true });
    if (sc.addStations?.length) view.addStations(sc.addStations, stationOpOpts(sc, { deferLabels: true }));
    if (sc.openStations?.length) view.openStations(sc.openStations, stationOpOpts(sc, { deferLabels: true }));
    for (const spec of recolorSpecs(sc)) {
      view.recolorSegments(spec.segIds, spec.color, {
        animate: false,
        lineName: spec.lineName,
        fromLine: spec.fromLine,
        deferLabels: true,
        cityId: hudCityId(sc) || sc.cityId || '',
      });
    }
    if (sc.cityDot && !cityLit.has(sc.cityDot.id)) {
      cityLit.add(sc.cityDot.id);
      view.addCityMarker(sc.cityDot);
    }
    if ((i & 31) === 31) await yieldToPaint();
  }
  view.relayoutAllLabels(true);
  const cur = end >= 0 ? list[end] : null;
  view.syncExtraLines?.(cur?.year ?? 0, { date: cur?.date });
  if (!bag) updateCityHud(cur);
}

async function rebuildStaticUpTo(index, bag, want) {
  resetLayers(bag);
  if (index < 0) return;
  await applyScenesStatic(0, index, bag, want);
  if (!bag) {
    paintWorldSegs(allBoundWorldSegments());
    state.view?.registerBuses?.(allBoundCityBusSegments());
    state.view?.registerRails?.(chinaRailNetworkSegments());
    await loadActiveModeLayers();
  }
}

function toastLineInfo(sc) {
  if (!sc) return null;
  const year = sc.year || 0;
  const segs = resolveSceneSegments(sc);
  const live =
    segs.find((s) => s.line && s.style !== 'ghost' && s.style !== 'planned') ||
    segs.find((s) => s.line);
  if (live?.line) {
    return { name: displayLineName(live.line, year), color: live.color || '#888' };
  }
  const spec = recolorSpecs(sc)[0];
  if (spec?.lineName) {
    return { name: displayLineName(spec.lineName, year), color: spec.color || '#888' };
  }
  const add = sc.addStations?.[0];
  if (add?.line) {
    return { name: displayLineName(add.line, year), color: add.color || '#888' };
  }
  const from = Array.isArray(sc.highlightFromLine) ? sc.highlightFromLine[0] : sc.highlightFromLine;
  if (from) return { name: displayLineName(from, year), color: '#888' };
  return null;
}

function fillToast(sc) {
  if (!sc) return;
  const line = toastLineInfo(sc);
  const chip = document.getElementById('toast-line');
  const nameEl = document.getElementById('toast-line-name');
  const dotEl = document.getElementById('toast-line-dot');
  if (chip && nameEl) {
    if (line) {
      nameEl.textContent = line.name;
      if (dotEl) dotEl.style.background = line.color;
      chip.hidden = false;
    } else {
      nameEl.textContent = '';
      chip.hidden = true;
    }
  }
  const tag = document.getElementById('toast-tag');
  if (sc.planned) {
    tag.textContent = '规划 / 在建';
    tag.dataset.k = 'planned';
  } else {
    tag.textContent =
      sc.kind === 'hsr'
        ? '高速铁路'
        : sc.kind === 'metro'
          ? '城市轨道'
          : sc.kind === 'rail'
            ? '铁路'
            : '节点';
    tag.dataset.k = sc.kind;
  }
  document.getElementById('toast-title').textContent = sc.title;
  document.getElementById('toast-text').textContent = sc.detail || '';
}

function showToast(sc, { instant = false } = {}) {
  const toast = document.getElementById('toast');
  if (!toast || !sc) return;
  fillToast(sc);
  if (instant) {
    toast.classList.add('show');
    return;
  }
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
}

function fadeToastOut() {
  document.getElementById('toast')?.classList.remove('show');
}

function showEnd() {
  document.getElementById('end-text').textContent =
    '地铁、铁路与公交线网已加载完毕。';
  document.getElementById('end-card').classList.add('show');
}

function hudCityId(sc) {
  if (!sc || sc.nationalMap || sc.overview || sc.kind === 'hsr') return null;
  return sc.cityId || null;
}

function stationOpOpts(sc, extra = {}) {
  return { cityId: sc?.cityId || '', ...extra };
}

const RAIL_PLACE = {
  xuanwu: '北京',
  shanghai: '上海',
  jingfeng: '河北',
  taiwan: '台湾',
  daye: '湖北',
  jiaoji: '山东',
  yuehan: '湖南',
  cer: '黑龙江',
  guangsan: '广东',
  xiling: '河北',
  zhuping: '江西',
  anfeng: '辽宁',
  chaoshan: '广东',
  daoqing: '河南',
  zhengtai: '山西',
  xinning: '广东',
  huhang: '浙江',
  nanxun: '江西',
  qiang: '黑龙江',
  bianluo: '河南',
  dianyue: '云南',
  zhangxia: '福建',
  jinghan: '河南',
  jingzhang: '北京',
  huning: '江苏',
  jinpu: '山东',
  hongkong: '香港',
};

function hudPlaceName(sc) {
  if (!sc || sc.nationalMap || sc.overview) return '';
  if (sc.kind === 'hsr') return '全国';
  if (sc.placeName) return sc.placeName;
  if (sc.cityDot?.name) return sc.cityDot.name;
  const place = PLACES[sc.cityId];
  if (place?.name) return place.name;
  return RAIL_PLACE[sc.cityId] || '';
}

const LINE_DISPLAY_ALIASES = [
  { year: 2002, from: ['一期', '一线', '复八线'], to: '1号线' },
  { year: 2002, from: ['二期', '环线'], to: '2号线' },
  { year: 2007, from: ['城铁西线', '城铁东段'], to: '13号线' },
  { year: 2008, from: ['奥运支线'], to: '8号线' },
  { year: 2010, from: ['大兴线', '4号线大兴线'], to: '4号线' },
  { year: 1996, from: ['九广铁路', '九广铁路华段'], to: '九广东铁' },
  { year: 2007, from: ['九广铁路', '九广铁路华段', '九广东铁', '马场支线'], to: '东铁线' },
  { year: 2007, from: ['九广西铁'], to: '西铁线' },
  { year: 2007, from: ['马鞍山铁路'], to: '马鞍山线' },
  { year: 1996, from: ['轻便铁路'], to: '九广轻铁' },
  { year: 2007, from: ['轻便铁路', '九广轻铁'], to: '轻铁' },
];

function sceneDateText(sc) {
  const d = sc?.date;
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d.slice(5);
  const m = String(sc?.detail || '').match(/(\d{1,2})月(\d{1,2})日/);
  if (!m) return '';
  return `${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

function setYearHud(sc) {
  if (!sc) return;
  document.getElementById('year-num').textContent = String(sc.year);
  const dateEl = document.getElementById('year-date');
  const text = sceneDateText(sc);
  if (dateEl) {
    dateEl.textContent = text;
    dateEl.hidden = !text;
  }
  const era = document.getElementById('era-label');
  if (era) {
    era.textContent =
      sc.eraLabel ||
      (sc.planned
        ? '规划 / 在建'
        : sc.kind === 'hsr'
          ? '高速铁路'
          : sc.kind === 'metro'
            ? '城市轨道'
            : sc.kind === 'rail'
              ? '铁路'
              : '铁路');
  }
}

function lineBadgeLabel(name) {
  const raw = String(name || '');
  const metro = raw.match(/^(?:地铁|地鐵)?(\d+)\s*号线/);
  if (metro) return metro[1];
  const sl = raw.match(/^S\s*(\d+)/i);
  if (sl) return `S${sl[1]}`;
  const letter = raw.match(/^([A-Z]{1,3})线/);
  if (letter) return letter[1];
  if (/^临\s*\d/.test(raw)) return raw.replace(/路$/, '');
  const brt = raw.match(/^快速公交\s*(\d+)/);
  if (brt) return `快${brt[1]}`;
  return raw
    .replace(/铁路$/, '')
    .replace(/线$/, '')
    .replace(/^首都/, '')
    .replace(/^广深港高铁/, '高铁');
}

function badgeInk(hex) {
  const raw = String(hex || '#888').replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.padEnd(6, '8');
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.62 ? '#1a1a1a' : '#fff';
}

function renderCityMinimap(paths) {
  const box = document.getElementById('city-minimap');
  const svg = document.getElementById('city-minimap-svg');
  if (!box || !svg) return;
  if (!paths?.length) {
    box.hidden = true;
    svg.innerHTML = '';
    return;
  }
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  for (const p of paths) {
    for (const [lat, lng] of p.latlngs || []) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }
  const w = 168;
  const h = 128;
  const inset = 10;
  const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const cos = Math.max(Math.cos(midLat), 0.2);
  const geoW = Math.max(maxLng - minLng, 1e-6) * cos;
  const geoH = Math.max(maxLat - minLat, 1e-6);
  const scale = Math.min((w - inset * 2) / geoW, (h - inset * 2) / geoH);
  const ox = (w - geoW * scale) / 2;
  const oy = (h - geoH * scale) / 2;
  const toX = (lng) => ox + (lng - minLng) * cos * scale;
  const toY = (lat) => oy + (maxLat - lat) * scale;
  svg.innerHTML = paths
    .map((p) => {
      const d = (p.latlngs || [])
        .map(([lat, lng], i) => `${i ? 'L' : 'M'}${toX(lng).toFixed(1)},${toY(lat).toFixed(1)}`)
        .join(' ');
      return `<path d="${d}" fill="none" stroke="${p.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join('');
  box.hidden = false;
}

function displayLineName(name, year) {
  if (!name) return name;
  let out = name;
  for (const rule of LINE_DISPLAY_ALIASES) {
    if ((year || 0) >= rule.year && rule.from.includes(out)) out = rule.to;
  }
  return out;
}

function formatCityKm(km) {
  if (!Number.isFinite(km) || km <= 0) return '0.0';
  return km.toFixed(1);
}

function compareLineNames(a, b) {
  const rank = (name) => {
    const s = String(name || '');
    const num = s.match(/^(?:地铁|地鐵)?(\d+)\s*号线/) || s.match(/^(\d+)$/);
    if (num) return [0, Number(num[1]), s];
    const sl = s.match(/^S\s*(\d+)/i);
    if (sl) return [1, Number(sl[1]), s];
    const letter = s.match(/^([A-Z]{1,3})线/);
    if (letter) return [2, letter[1], s];
    const bus = s.match(/^(\d+)\s*路/);
    if (bus) return [3, Number(bus[1]), s];
    const kuai = s.match(/^快(\d+)/);
    if (kuai) return [4, Number(kuai[1]), s];
    return [5, s];
  };
  const aa = rank(a);
  const bb = rank(b);
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
    const x = aa[i];
    const y = bb[i];
    if (x === y) continue;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x).localeCompare(String(y), 'zh-CN', { numeric: true });
  }
  return 0;
}

function reconcileLineBadges(linesEl, merged, { animate = true } = {}) {
  const wanted = [...merged.entries()].sort((a, b) => compareLineNames(a[0], b[0]));
  const have = new Map(
    [...linesEl.querySelectorAll('.city-line-badge')].map((el) => [el.dataset.name, el])
  );
  const wantNames = new Set(wanted.map(([name]) => name));
  for (const [name, el] of have) {
    if (!wantNames.has(name)) el.remove();
  }
  for (const [name, color] of wanted) {
    let span = have.get(name);
    if (!span) {
      span = document.createElement('span');
      span.className = animate ? 'city-line-badge enter' : 'city-line-badge';
      span.dataset.name = name;
      span.title = name;
      span.textContent = lineBadgeLabel(name);
      linesEl.appendChild(span);
    }
    span.style.background = color;
    span.style.color = badgeInk(color);
  }
  for (const [name] of wanted) {
    const el = [...linesEl.querySelectorAll('.city-line-badge')].find((n) => n.dataset.name === name);
    if (el) linesEl.appendChild(el);
  }
}

function updateCityHud(sc, { live = false } = {}) {
  const cityId = hudCityId(sc);
  const kmWrap = document.getElementById('city-km-wrap');
  const stWrap = document.getElementById('city-st-wrap');
  const linesEl = document.getElementById('city-lines');
  const placeEl = document.getElementById('city-place');
  if (!kmWrap || !stWrap || !linesEl) return;

  const nation = state.view?.nationHud?.() || { km: 0 };
  const place = hudPlaceName(sc);
  if (placeEl) {
    placeEl.textContent = place;
    placeEl.hidden = !place;
  }
  kmWrap.hidden = !(nation.km > 0 || cityId);
  if (!kmWrap.hidden) {
    document.getElementById('city-km').textContent = formatCityKm(nation.km);
  }

  if (!cityId || !state.view?.cityHud) {
    state.hudCityId = null;
    state.hudLineKey = '';
    stWrap.hidden = true;
    linesEl.classList.remove('in');
    linesEl.hidden = true;
    linesEl.innerHTML = '';
    renderCityMinimap([]);
    return;
  }

  const stats = state.view.cityHud(cityId);
  document.getElementById('city-st').textContent = String(stats.stations);
  stWrap.hidden = false;

  if (state.hudCityId !== cityId) {
    state.hudCityId = cityId;
    state.hudLineKey = '';
    linesEl.innerHTML = '';
    linesEl.classList.remove('in');
  }

  const year = sc.year || 0;
  const merged = new Map();
  for (const ln of stats.lines) {
    const name = displayLineName(ln.name, year);
    if (!merged.has(name)) merged.set(name, ln.color);
  }
  const lineKey = [...merged.keys()].join('|');
  if (lineKey !== state.hudLineKey) {
    state.hudLineKey = lineKey;
    if (!merged.size) {
      linesEl.classList.remove('in');
      linesEl.hidden = true;
      linesEl.innerHTML = '';
    } else {
      linesEl.hidden = false;
      reconcileLineBadges(linesEl, merged, { animate: live });
      if (live) requestAnimationFrame(() => linesEl.classList.add('in'));
      else linesEl.classList.add('in');
    }
  }

  const now = performance.now();
  if (!live || now - state.hudMiniAt > 180) {
    state.hudMiniAt = now;
    renderCityMinimap(stats.paths);
  }
}

function applySceneHud(sc, index) {
  document.getElementById('scene-slider').value = String(index);
  document.getElementById('scene-pos').textContent = String(index + 1);
  setYearHud(sc);
  showToast(sc);
  updateCityHud(sc);
}

function hideEnd() {
  document.getElementById('end-card')?.classList.remove('show');
}

function setExportUi(on, text) {
  const bar = document.getElementById('export-bar');
  if (bar) bar.hidden = true;
  const exportBtn = document.getElementById('export-video-btn');
  const endBtn = document.getElementById('end-export-btn');
  const label = on ? text || '导出中…' : '导出视频';
  if (exportBtn) {
    exportBtn.textContent = label;
    exportBtn.disabled = !on && !canExportVideo();
    exportBtn.title = on ? '再次点击停止导出' : '后台导出，完成后自动下载';
  }
  if (endBtn) {
    endBtn.textContent = on ? '导出中…' : '导出视频';
    endBtn.disabled = !on && !canExportVideo();
  }
}

function ensureExportView(preset) {
  let root = document.getElementById('export-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'export-root';
    root.className = 'export-offscreen';
    root.innerHTML =
      '<section class="map-stage" id="export-map-stage"><div id="export-leaflet" class="leaflet-host"></div></section>';
    document.body.appendChild(root);
  }
  root.style.width = `${preset.width}px`;
  root.style.height = `${preset.height}px`;
  if (!state.exportView) {
    state.exportView = createLeafletView(document.getElementById('export-leaflet'));
  }
  state.exportView.invalidate();
  return document.getElementById('export-map-stage');
}

function snapshotExportHud(sc, view) {
  const line = toastLineInfo(sc);
  const nation = view?.nationHud?.() || { km: 0 };
  return {
    title: sc?.title || '',
    year: sc?.year != null ? String(sc.year) : '',
    date: sceneDateText(sc),
    place: hudPlaceName(sc),
    km: nation.km > 0 ? formatCityKm(nation.km) : '',
    color: line?.color || '#888',
  };
}

function formatEta(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '计算中';
  const sec = Math.ceil(ms / 1000);
  if (sec < 5) return '不到 5 秒';
  if (sec < 60) return `约 ${sec} 秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `约 ${m} 分 ${s} 秒` : `约 ${m} 分钟`;
}

function clearExportProgressTimer() {
  if (state.exportProgressTimer) {
    clearInterval(state.exportProgressTimer);
    state.exportProgressTimer = null;
  }
}

function sceneYearBounds() {
  let min = Infinity;
  let max = -Infinity;
  for (const sc of scenes()) {
    const y = Number(sc.year);
    if (!Number.isFinite(y)) continue;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  if (!Number.isFinite(min)) min = 1865;
  if (!Number.isFinite(max)) max = min;
  return { min, max };
}

function exportCityOptions() {
  const ids = new Set(DETAILED_CITIES.map((c) => c.id));
  for (const sc of scenes()) {
    if (sc.kind === 'metro' && sc.cityId && !sc.nationalMap && !sc.overview) ids.add(sc.cityId);
  }
  return [...ids]
    .map((id) => ({ id, name: PLACES[id]?.name || id }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

function exportKindLabel(kind) {
  if (kind === 'hsr') return '仅高铁';
  if (kind === 'metro') return '仅地铁';
  return '高铁+地铁';
}

function exportCityLabel(city) {
  return city ? PLACES[city]?.name || city : '全国';
}

function sceneTouchesCity(sc, cityId) {
  if (!cityId) return true;
  if (sc.cityId === cityId || sc.cityDot?.id === cityId) return true;
  const name = PLACES[cityId]?.name;
  if (!name) return false;
  const hit = (s) => typeof s === 'string' && s.includes(name);
  if (hit(sc.title) || hit(sc.detail) || hit(sc.placeName)) return true;
  const spots = [...(sc.focusStations || [])];
  for (const seg of sc.segments || []) {
    if (hit(seg.line)) return true;
    if (seg.stations?.length) spots.push(...seg.stations);
  }
  return spots.some((p) => p?.id === cityId || hit(p?.name) || hit(p?.id));
}

function sceneMatchesExport(sc, { city = '', kind = 'both' } = {}) {
  if (!sc) return false;
  if (sc.nationalMap && city) return false;
  if (kind === 'metro') {
    if (sc.kind !== 'metro') return false;
    if (sc.nationalMap || sc.overview) return !city;
    return !city || sceneTouchesCity(sc, city);
  }
  if (kind === 'hsr') {
    if (sc.kind !== 'hsr') return false;
    if (sc.overview && city) return false;
    return !city || sceneTouchesCity(sc, city);
  }
  if (sc.kind !== 'metro' && sc.kind !== 'hsr') return false;
  if ((sc.nationalMap || sc.overview) && city) return false;
  return !city || sceneTouchesCity(sc, city);
}

function exportSceneIndices({ from, to, city = '', kind = 'both' }) {
  const list = scenes();
  const idxs = [];
  for (let i = 0; i < list.length; i++) {
    const sc = list[i];
    const y = Number(sc.year);
    if (!Number.isFinite(y) || y < from || y > to) continue;
    if (!sceneMatchesExport(sc, { city, kind })) continue;
    idxs.push(i);
  }
  return idxs;
}

function exportFilterYearBounds({ city = '', kind = 'both' } = {}) {
  let min = Infinity;
  let max = -Infinity;
  for (const sc of scenes()) {
    if (!sceneMatchesExport(sc, { city, kind })) continue;
    const y = Number(sc.year);
    if (!Number.isFinite(y)) continue;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  if (!Number.isFinite(min)) return sceneYearBounds();
  return { min, max };
}

function fillExportCitySelect() {
  const sel = document.getElementById('export-city');
  if (!sel) return;
  const cur = state.exportCity || '';
  const opts = ['<option value="">全国</option>'];
  for (const { id, name } of exportCityOptions()) {
    opts.push(`<option value="${id}"${id === cur ? ' selected' : ''}>${name}</option>`);
  }
  sel.innerHTML = opts.join('');
  sel.value = cur;
}

function snapExportYearsToFilter() {
  const { city, kind } = readExportFilter();
  const span = exportFilterYearBounds({ city, kind });
  const fromEl = document.getElementById('export-year-from');
  const toEl = document.getElementById('export-year-to');
  if (fromEl) fromEl.value = String(span.min);
  if (toEl) toEl.value = String(span.max);
}

function readExportFilter() {
  const city = document.getElementById('export-city')?.value || state.exportCity || '';
  const kindBtn = document.querySelector('#export-kind-row button.active');
  const raw = kindBtn?.dataset.kind || state.exportKind || 'both';
  const kind = raw === 'metro' || raw === 'hsr' ? raw : 'both';
  return { city, kind };
}

function readExportYearRange() {
  const bounds = sceneYearBounds();
  const fromEl = document.getElementById('export-year-from');
  const toEl = document.getElementById('export-year-to');
  let from = Number(fromEl?.value);
  let to = Number(toEl?.value);
  if (!Number.isFinite(from)) from = bounds.min;
  if (!Number.isFinite(to)) to = bounds.max;
  from = Math.min(bounds.max, Math.max(bounds.min, Math.round(from)));
  to = Math.min(bounds.max, Math.max(bounds.min, Math.round(to)));
  if (from > to) [from, to] = [to, from];
  const fps = state.exportFps === 60 ? 60 : 30;
  const size = state.exportSize === '720p' ? '720p' : '1080p';
  const { city, kind } = readExportFilter();
  return { from, to, fps, size, city, kind };
}

function refreshExportYearHint() {
  const hint = document.getElementById('export-year-hint');
  if (!hint) return;
  const range = readExportYearRange();
  const idxs = exportSceneIndices(range);
  const preset = resolveExportPreset(state.exportSize);
  const scope = `${exportCityLabel(range.city)} · ${exportKindLabel(range.kind)}`;
  if (!idxs.length) {
    hint.textContent = `${scope} · ${range.from}–${range.to} 没有分镜`;
    return;
  }
  hint.textContent = `${scope} · ${range.from}–${range.to} · ${idxs.length} 个分镜 · ${preset.width}×${preset.height} ${range.fps}fps`;
}

let exportDlgResolve = null;

function closeExportDlg(value) {
  document.getElementById('export-dlg').hidden = true;
  const resolve = exportDlgResolve;
  exportDlgResolve = null;
  resolve?.(value);
}

function askExportRange() {
  const dlg = document.getElementById('export-dlg');
  const fromEl = document.getElementById('export-year-from');
  const toEl = document.getElementById('export-year-to');
  const note = document.getElementById('export-dlg-note');
  if (!dlg || !fromEl || !toEl) return Promise.resolve(null);

  const bounds = sceneYearBounds();
  const speedLabel = state.speed <= 0.55 ? '慢' : state.speed >= 1.1 ? '快' : '中';
  if (note) {
    note.textContent = `点「导出并下载」后在后台编码，成片自动进浏览器下载栏。尽量把这个标签页留着，不要休眠。节奏与「${speedLabel}」速一致。`;
  }
  fillExportCitySelect();
  const kind = state.exportKind === 'metro' || state.exportKind === 'hsr' ? state.exportKind : 'both';
  state.exportKind = kind;
  document.querySelectorAll('#export-kind-row button').forEach((b) => {
    b.classList.toggle('active', b.dataset.kind === kind);
  });
  fromEl.min = toEl.min = String(bounds.min);
  fromEl.max = toEl.max = String(bounds.max);
  fromEl.value = String(state.exportFromYear ?? bounds.min);
  toEl.value = String(state.exportToYear ?? bounds.max);
  const fps = state.exportFps === 60 ? 60 : 30;
  state.exportFps = fps;
  const size = state.exportSize === '720p' ? '720p' : '1080p';
  state.exportSize = size;
  document.querySelectorAll('#export-fps-row button').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.fps) === fps);
  });
  document.querySelectorAll('#export-size-row button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === size);
  });
  refreshExportYearHint();
  dlg.hidden = false;
  fromEl.focus();
  fromEl.select();

  return new Promise((resolve) => {
    exportDlgResolve = resolve;
  });
}

function showExportError(err) {
  const msg = String(err?.message || err || '导出失败');
  console.warn(err);
  try {
    sessionStorage.setItem('exportLastError', `${new Date().toISOString()} ${msg}`);
  } catch {
    /* ignore */
  }
  const exportBtn = document.getElementById('export-video-btn');
  if (exportBtn) {
    exportBtn.textContent = '导出失败';
    exportBtn.title = msg;
    exportBtn.disabled = false;
  }
}

async function encodeExportFly(session, view, dest, durationSec) {
  if (!dest || dest.lat == null || dest.lng == null) return;
  const c = view.map.getCenter();
  const from = { lat: c.lat, lng: c.lng, zoom: view.map.getZoom() };
  const to = { lat: dest.lat, lng: dest.lng, zoom: dest.zoom ?? from.zoom };
  const far =
    Math.hypot((from.lat - to.lat) * 111320, (from.lng - to.lng) * 85000) > 220 ||
    Math.abs(from.zoom - to.zoom) > 0.28;
  if (!far) {
    view.map.setView([to.lat, to.lng], to.zoom, { animate: false });
    return;
  }
  const frames = Math.max(6, Math.round(Math.max(0.35, durationSec) * session.fps));
  for (let f = 0; f <= frames; f++) {
    if (!state.exporting || state.exportSession !== session) return;
    view.setCamLerp?.(from, to, f / frames);
    await session.encodeFrame();
  }
}

/**
 * 离线快导：不跟墙钟播放，按时间戳写帧。
 * 成片时长 ≈ 浏览器用当前速度播完的时长；导出墙钟短得多。
 */
async function beginVideoExport() {
  if (state.exporting || state.exportSession || exportDlgResolve) return;
  if (!canExportVideo()) {
    showExportError('需要 Chrome / Edge（WebCodecs）');
    return;
  }

  const range = await askExportRange();
  if (!range || state.exporting || state.exportSession) return;
  state.exportFromYear = range.from;
  state.exportToYear = range.to;
  state.exportFps = range.fps;
  state.exportSize = range.size;
  state.exportCity = range.city || '';
  state.exportKind = range.kind === 'metro' || range.kind === 'hsr' ? range.kind : 'both';
  const idxs = exportSceneIndices(range);
  if (!idxs.length) {
    showExportError(`${exportCityLabel(range.city)} · ${exportKindLabel(range.kind)} · ${range.from}–${range.to} 没有分镜`);
    return;
  }
  const preset = resolveExportPreset(range.size);
  const fpsLabel = range.fps;
  const stamp0 = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const fileSlug = `${range.city || 'china'}-${range.kind === 'both' ? 'all' : range.kind}`;
  let rootEl;
  let view;
  try {
    rootEl = ensureExportView(preset);
    view = state.exportView;
    if (!rootEl || !view) throw new Error('导出画布没建起来');
  } catch (err) {
    showExportError(err);
    return;
  }
  const revealed = new Set();
  const retired = new Set();
  const cityLit = new Set();
  const bag = { view, revealed, retired, cityLit };
  let exportHud = {};
  rootEl._exportHud = () => exportHud;

  setExportUi(true, '导出中…');
  view.setExportBasemap?.(true);
  view.setExportFrameRate?.(fpsLabel);
  view.invalidate();

  let session;
  try {
    session = await startOfflineExport({
      rootEl,
      fps: fpsLabel,
      width: preset.width,
      height: preset.height,
      suggestedName: `china-railway-${fileSlug}-${range.from}-${range.to}-${preset.id}${fpsLabel}-${stamp0}.mp4`,
      pickLocation: false,
      beforePaint: () => view.waitExportFrame?.(),
    });
  } catch (err) {
    view.setExportBasemap?.(false);
    setExportUi(false);
    if (err?.name === 'AbortError') return;
    showExportError(err);
    return;
  }

  state.exporting = true;
  state.exportSession = session;
  state.exportStartedAt = performance.now();

  const list = scenes();
  const total = idxs.length;
  const speed = state.speed;
  const fps = session.fps;
  const want = (sc) => sceneMatchesExport(sc, range);

  let aborted = false;
  let exportFail = null;
  try {
    if (idxs[0] > 0) await rebuildStaticUpTo(idxs[0] - 1, bag, want);
    else resetLayers(bag);
    view.relayoutAllLabels?.(true);
    if (navigator.wakeLock?.request) {
      state.exportWake = await navigator.wakeLock.request('screen').catch(() => null);
    }
    for (let n = 0; n < idxs.length; n++) {
      const i = idxs[n];
      if (!state.exporting || state.exportSession !== session) {
        aborted = true;
        break;
      }

      const sc = list[i];
      setExportUi(true, `导出中 ${n + 1}/${total}`);
      view.setStampCity?.(hudCityId(sc));
      exportHud = snapshotExportHud(sc, view);

      const pending = resolveSceneSegments(sc).filter((s) => !revealed.has(s.id));
      const followCam = sc.followCam !== false && pending.length > 0 && !sc.nationalMap;
      const willGrow = pending.length > 0 && !sc.instantSegments;
      const flySec = (sc.fitNetwork ? 1.1 : 0.75) / Math.max(0.5, speed);
      if (sc.camSweep && willGrow && sc.camStart) {
        await encodeExportFly(session, view, {
          lat: sc.camStart.lat,
          lng: sc.camStart.lng,
          zoom: sc.camStart.zoom ?? 15,
        }, 0.7 / Math.max(0.5, speed));
      } else if (!willGrow || sc.followCam === false) {
        await encodeExportFly(session, view, view.camDestForScene?.(sc), flySec);
      } else {
        const look =
          view.longRailLookForSeg?.(pending[0], sc) ||
          view.longRailLook?.(sc) ||
          view.camDestForScene?.(sc);
        await encodeExportFly(session, view, look, 0.45 / Math.max(0.5, speed));
      }
      if (!state.exporting || state.exportSession !== session) {
        aborted = true;
        break;
      }

      if (!pending.length || sc.instantSegments) {
        for (const seg of pending) {
          retired.delete(seg.id);
          revealed.add(seg.id);
          view.addSegmentStatic(seg, { deferLabels: true });
        }
        if (sc.cityDot && !cityLit.has(sc.cityDot.id)) {
          cityLit.add(sc.cityDot.id);
          view.addCityMarker(sc.cityDot);
        }
        if (sc.lineHandoff?.segment) {
          view.applyLineHandoffStatic(sc.lineHandoff);
          revealed.add(sc.lineHandoff.segment.id);
          if (sc.lineHandoff.alsoGrow) revealed.add(sc.lineHandoff.alsoGrow.id);
          for (const id of sc.lineHandoff.fadeSegIds || []) {
            revealed.delete(id);
            retired.add(id);
          }
        }
        if (sc.retireSegIds?.length) {
          for (const id of sc.retireSegIds) {
            view.removeSegment(id);
            revealed.delete(id);
            retired.add(id);
          }
        }
        if (sc.retireStations?.length) view.retireStations(sc.retireStations, stationOpOpts(sc));
        if (sc.stationRename) view.applyStationRename(sc.stationRename, stationOpOpts(sc));
        if (sc.trimSegStart) view.trimSegStart(sc.trimSegStart);
        if (sc.terminusMove) view.applyTerminusMove(sc.terminusMove);
        if (sc.addStations?.length) view.addStations(sc.addStations, stationOpOpts(sc));
        if (sc.openStations?.length) view.openStations(sc.openStations, stationOpOpts(sc));
        for (const spec of recolorSpecs(sc)) {
          view.recolorSegments(spec.segIds, spec.color, {
            animate: false,
            lineName: spec.lineName,
            fromLine: spec.fromLine,
            cityId: hudCityId(sc) || sc.cityId || '',
          });
        }
        exportHud = snapshotExportHud(sc, view);
        await session.holdSeconds(dwellSec(speed));
      } else if (sc.parallelGrow) {
        const handles = [];
        for (const seg of pending) {
          retired.delete(seg.id);
          const handle = view.openExportGrow(seg, { followCam: false });
          if (handle) handles.push(handle);
          revealed.add(seg.id);
        }
        const dur = Math.max(...handles.map((h) => view.estimateGrowSec?.(h.seg, speed) || 2.7), 0.4);
        const frames = Math.max(2, Math.round(dur * fps));
        for (let f = 0; f <= frames; f++) {
          if (!state.exporting || state.exportSession !== session) {
            aborted = true;
            break;
          }
          const elapsed = (f / frames) * dur;
          for (const handle of handles) {
            view.setExportGrowProgress(handle, elapsed / Math.max(view.estimateGrowSec?.(handle.seg, speed) || 2.7, 0.01));
          }
          exportHud = snapshotExportHud(sc, view);
          await session.encodeFrame();
        }
        for (const handle of handles) view.closeExportGrow(handle);
        if (aborted) break;
        if (sc.cityDot && !cityLit.has(sc.cityDot.id)) {
          cityLit.add(sc.cityDot.id);
          view.addCityMarker(sc.cityDot);
        }
        exportHud = snapshotExportHud(sc, view);
        await session.holdSeconds(dwellSec(speed));
      } else if (sc.camSweep) {
        const from = sc.camStart;
        const to = sc.camEnd;
        const z = from?.zoom ?? 15;
        const path = sc.camPath?.length >= 2 ? sc.camPath : from && to ? [from, to] : [];
        const handles = [];
        for (const seg of pending) {
          retired.delete(seg.id);
          const handle = view.openExportGrow(seg, { followCam: false });
          if (handle) handles.push(handle);
          revealed.add(seg.id);
        }
        const camDur = sc.camDuration ?? 10;
        const growDur = Math.max(...handles.map((h) => view.estimateGrowSec?.(h.seg, speed) || 2.7), 0.4);
        const totalDur = Math.max(camDur, growDur);
        const frames = Math.max(2, Math.round(totalDur * fps));
        for (let f = 0; f <= frames; f++) {
          if (!state.exporting || state.exportSession !== session) {
            aborted = true;
            break;
          }
          view.applyCamSweep(Math.min(1, ((f / frames) * totalDur) / camDur), null, {
            path,
            zoom: z,
            handles,
            speed,
            elapsedSec: (f / frames) * totalDur,
            smooth: false,
          });
          exportHud = snapshotExportHud(sc, view);
          await session.encodeFrame();
        }
        for (const handle of handles) view.closeExportGrow(handle);
        if (aborted) break;
        if (sc.cityDot && !cityLit.has(sc.cityDot.id)) {
          cityLit.add(sc.cityDot.id);
          view.addCityMarker(sc.cityDot);
        }
        exportHud = snapshotExportHud(sc, view);
        await session.holdSeconds(dwellSec(speed));
      } else {
        for (const seg of pending) {
          if (!state.exporting || state.exportSession !== session) {
            aborted = true;
            break;
          }
          retired.delete(seg.id);
          const dur = view.estimateGrowSec?.(seg, speed) || growDurationSec(view.estimateGrowMeters(seg), speed);
          const frames = Math.max(2, Math.round(dur * fps));
          const handle = view.openExportGrow(seg, {
            followCam,
            railLook: view.longRailLookForSeg?.(seg, sc) || view.longRailLook?.(sc) || null,
          });
          for (let f = 0; f <= frames; f++) {
            if (!state.exporting || state.exportSession !== session) {
              aborted = true;
              break;
            }
            view.setExportGrowProgress(handle, f / frames);
            exportHud = snapshotExportHud(sc, view);
            await session.encodeFrame();
          }
          view.closeExportGrow(handle);
          revealed.add(seg.id);
        }
        if (aborted) break;
        if (sc.cityDot && !cityLit.has(sc.cityDot.id)) {
          cityLit.add(sc.cityDot.id);
          view.addCityMarker(sc.cityDot);
        }
        if (sc.retireSegIds?.length) {
          for (const id of sc.retireSegIds) {
            view.removeSegment(id);
            revealed.delete(id);
            retired.add(id);
          }
        }
        if (sc.retireStations?.length) view.retireStations(sc.retireStations, stationOpOpts(sc));
        if (sc.stationRename) view.applyStationRename(sc.stationRename, stationOpOpts(sc));
        if (sc.trimSegStart) view.trimSegStart(sc.trimSegStart);
        if (sc.terminusMove) view.applyTerminusMove(sc.terminusMove);
        if (sc.addStations?.length) view.addStations(sc.addStations, stationOpOpts(sc));
        if (sc.openStations?.length) view.openStations(sc.openStations, stationOpOpts(sc));
        exportHud = snapshotExportHud(sc, view);
        await session.holdSeconds(dwellSec(speed));
      }
    }
  } catch (e) {
    console.warn(e);
    aborted = true;
    exportFail = e;
  }

  state.exportWake?.release?.();
  state.exportWake = null;

  if (state.exportSession !== session) {
    await session.abort?.();
    setExportUi(false);
    return;
  }

  state.exporting = false;
  state.exportSession = null;
  if (exportFail) {
    await session.abort?.();
    view.setExportBasemap?.(false);
    showExportError(exportFail);
    return;
  }
  let result = null;
  try {
    result = await session.finish();
  } catch (e) {
    console.warn(e);
    await session.abort?.();
    view.setExportBasemap?.(false);
    showExportError(e);
    return;
  }
  view.setExportBasemap?.(false);
  setExportUi(false);
  if (!aborted && result?.blob?.size > 0) {
    const ok = downloadBlob(result.blob, `china-railway-${fileSlug}-${range.from}-${range.to}-${preset.id}${fps}-${stamp0}.mp4`);
    if (!ok) showExportError('成片写好了，但浏览器没弹出下载');
  } else if (!aborted && result?.savedPath) {
    /* saved via picker */
  } else if (!aborted) {
    showExportError('导出结束但没有生成文件');
  } else {
    setExportUi(false);
  }
}

async function finishVideoExport(reason) {
  if (!state.exporting && !state.exportSession) return;
  const session = state.exportSession;
  state.exporting = false;
  state.exportSession = null;
  clearExportProgressTimer();
  try {
    if (reason === 'cancel') await session?.abort?.();
    else await session?.finish?.();
  } catch (e) {
    console.warn(e);
    await session?.abort?.();
  }
  state.exportWake?.release?.();
  state.exportWake = null;
  state.exportView?.setExportBasemap?.(false);
  setExportUi(false);
}

boot();
