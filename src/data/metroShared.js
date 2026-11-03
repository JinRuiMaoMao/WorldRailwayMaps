import { resolveSceneSegments } from './hongkongRail.js';

/** 多城地铁场景共用工具 */

export function makeStationResolver(amapStations) {
  const table = amapStations?.stations || amapStations || {};
  return (name, lng, lat) => {
    const a = table[name];
    if (a) return { name, lng: a[0], lat: a[1] };
    if (lng != null && lat != null) return { name, lng, lat };
    return { name, lng: undefined, lat: undefined };
  };
}

export function mid(stations) {
  const usable = stations.filter((s) => s && Number.isFinite(s.lng) && Number.isFinite(s.lat));
  const list = usable.length ? usable : stations;
  const m = list[Math.floor(list.length / 2)] || list[0];
  return { lng: m?.lng, lat: m?.lat };
}

/** 过滤无效站，缺坐标站若夹在有效站之间则丢弃以免拉断线 */
export function cleanStations(stations) {
  return stations.filter((s) => s?.name && Number.isFinite(s.lng) && Number.isFinite(s.lat));
}

/**
 * @param {object} opts
 * @param {string} opts.prefix 场景 id 前缀 e.g. 'sh'
 * @param {Array} opts.openings
 *   { id?, year, title, detail, line, color, stations: [{name,lng,lat}], defer?: string[] }
 */
export function buildCityScenes({ prefix, openings, finaleYear = 2024, finaleTitle = '线网成型', finaleDetail = '城市轨网覆盖成型', center }) {
  const scenes = openings.map((op, i) => {
    let stations = [...(op.stations || [])];
    if (op.defer?.length) {
      const skip = new Set(op.defer);
      stations = stations.map((s) => (skip.has(s.name) ? { ...s, silent: true } : s));
    }
    if (op.ghost?.length) {
      const grey = new Set(op.ghost);
      stations = stations.map((s) => (grey.has(s.name) ? { ...s, style: 'ghost' } : s));
    }
    stations = cleanStations(stations);
    const shared = {
      overview: !!op.overview,
      fitNetwork: !!op.fitNetwork,
      retireSegIds: op.retireSegIds,
      retireHoldCam: op.retireHoldCam,
      recolor: op.recolor,
      openStations: op.openStations,
      retireStations: op.retireStations,
      stationRename: op.stationRename,
      addStations: op.addStations,
      terminusMove: op.terminusMove,
      highlightFromLine: op.highlightFromLine,
      milestone: !!op.milestone,
    };
    // allowEmpty：复运/更名等辅镜，站名只用来对焦，不另画一条线（否则会把「人民广场」列两次当成线段）
    if (op.allowEmpty || ((op.overview || op.retireSegIds?.length || op.stationRename || op.retireStations || op.addStations || op.recolor || op.highlightFromLine || (op.openStations && stations.length < 2)) && stations.length < 2)) {
      const m = stations.length ? mid(stations) : null;
      return {
        id: op.id || `${prefix}-${op.year}-${i}`,
        year: op.year,
        date: op.date,
        title: op.title,
        detail: op.detail,
        kind: 'metro',
        planned: !!op.planned,
        focusStations: stations.length ? stations : undefined,
        focus: op.focus || (Number.isFinite(m?.lng) ? { lng: m.lng, lat: m.lat, zoom: 15 } : undefined),
        focusPad: op.focusPad,
        focusZoom: op.focusZoom,
        segments: [],
        ...shared,
      };
    }
    if (stations.length < 2 && !op.allowSingle) {
      // 仍保留单站启用场景
      if (stations.length === 1) {
        return {
          id: op.id || `${prefix}-${op.year}-${i}`,
          year: op.year,
          date: op.date,
          title: op.title,
          detail: op.detail,
          kind: 'metro',
          focusStations: stations,
          segments: [
            {
              id: op.segId || `${prefix}-seg-${i}`,
              line: op.line,
              color: op.color,
              stations,
            },
          ],
        };
      }
      return null;
    }
    const focusStations = stations;
    const m = mid(focusStations);
    return {
      id: op.id || `${prefix}-${op.year}-${i}`,
      year: op.year,
      date: op.date,
      title: op.title,
      detail: op.detail,
      kind: 'metro',
      planned: !!op.planned,
      focusStations,
      focus: Number.isFinite(m.lng) ? { lng: m.lng, lat: m.lat, zoom: 13 } : undefined,
      segments: [
        {
          id: op.segId || `${prefix}-seg-${i}`,
          line: op.line,
          color: op.color,
          style: op.planned ? 'planned' : op.style,
          osmKey: op.osmKey,
          stations,
        },
      ],
      ...shared,
    };
  }).filter(Boolean);

  scenes.push({
    id: `${prefix}-finale`,
    year: finaleYear,
    title: finaleTitle,
    detail: finaleDetail,
    kind: 'metro',
    focus: center ? { ...center, zoom: center.zoom || 11 } : undefined,
    fitNetwork: true,
    focusPad: 56,
    focusZoom: 10.5,
    segments: [],
    overview: true,
  });

  return scenes;
}

/** 场景改色：单组或多组 */
export function recolorSpecs(sc) {
  const r = sc?.recolor;
  if (!r) return [];
  const list = Array.isArray(r) ? r : [r];
  return list.filter((spec) => spec && (spec.segIds?.length || spec.fromLine));
}

/** 从站名列表解析坐标 */
export function resolveNames(S, names) {
  return names.map((n) => (typeof n === 'string' ? S(n) : n)).filter((s) => s?.name);
}

/**
 * 回放城市章节后的最终线网（含更名改色、退役、一线转环线等）
 * 供「全国一张图」一次性铺开。
 */
export function collectFinalNetwork(scenes) {
  const segs = new Map();
  for (const sc of scenes || []) {
    for (const seg of resolveSceneSegments(sc)) {
      if (!seg?.id) continue;
      segs.set(seg.id, {
        ...seg,
        stations: (seg.stations || []).map((s) => ({ ...s })),
        path: seg.path ? seg.path.map((p) => (Array.isArray(p) ? [...p] : { ...p })) : seg.path,
      });
    }
    if (sc.lineHandoff?.segment) {
      const h = sc.lineHandoff.segment;
      segs.set(h.id, {
        ...h,
        stations: (h.stations || []).map((s) => ({ ...s })),
        path: h.path ? h.path.map((p) => (Array.isArray(p) ? [...p] : { ...p })) : h.path,
      });
      if (sc.lineHandoff.alsoGrow) {
        const a = sc.lineHandoff.alsoGrow;
        segs.set(a.id, {
          ...a,
          stations: (a.stations || []).map((s) => ({ ...s })),
          path: a.path ? a.path.map((p) => (Array.isArray(p) ? [...p] : { ...p })) : a.path,
        });
      }
      const trimId = sc.lineHandoff.trimSegId;
      const keepName = sc.lineHandoff.trimEndName;
      const cut = segs.get(trimId);
      if (cut && keepName) {
        const ki = (cut.stations || []).findIndex((s) => s.name === keepName);
        if (ki >= 0) cut.stations = cut.stations.slice(0, ki + 1);
      }
      for (const id of sc.lineHandoff.fadeSegIds || []) segs.delete(id);
    }
    if (sc.retireSegIds?.length) {
      for (const id of sc.retireSegIds) segs.delete(id);
    }
    for (const spec of recolorSpecs(sc)) {
      const ids = new Set(spec.segIds || []);
      const lines = spec.fromLine
        ? new Set(Array.isArray(spec.fromLine) ? spec.fromLine : [spec.fromLine])
        : null;
      const cityId = sc.cityId;
      for (const s of segs.values()) {
        if (cityId && s.cityId && s.cityId !== cityId) continue;
        if (ids.has(s.id) || lines?.has(s.line)) {
          if (spec.color) s.color = spec.color;
          if (spec.lineName) s.line = spec.lineName;
        }
      }
    }
  }
  return [...segs.values()].filter(
    (s) => (s.stations?.length >= 1) || (s.path?.length >= 2) || (s.stations?.length === 1 && s.allowSingle)
  );
}
