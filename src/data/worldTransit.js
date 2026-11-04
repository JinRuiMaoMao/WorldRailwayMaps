/** 世界城轨 / 铁路 OSM 现势层：按国/城懒加载，不进中国时间轴 */

import { assetUrl } from '../assetUrl.js';
import { WORLD_CITIES, WORLD_COUNTRIES, WORLD_RAIL_REGIONS, citiesOfCountry } from './worldCatalog.js';

const metroBound = new Set();
const railBound = new Set();
const networkBound = new Set();
const ormBound = new Set();
const ormIndexBound = new Map(); // countryId -> index|flat meta
const ormTileBound = new Set(); // `${cc}:${tileKey}`
const metroSegs = new Map();
const railSegs = new Map();
const networkSegs = new Map();
const ormRailSegs = new Map();
const ormUrbanSegs = new Map();
const inflight = new Map();

const PALETTE = ['#003399', '#CC0000', '#009933', '#FF6600', '#660099', '#0099CC', '#222222', '#C4A35A'];
const HSR_PALETTE = ['#C0392B', '#1A5276', '#117A65', '#6C3483', '#B9770E', '#922B21'];
const RAIL_COLOR = '#5D6D7E';
const HSR_PLAN = '#5DADE2';
const RAIL_PLAN = '#8E9AAF';
const URBAN_RAIL = new Set(['subway', 'light_rail', 'tram', 'monorail', 'funicular', 'metro']);
const ORM_RAIL_COLOR = {
  rail: '#5D6D7E',
  narrow_gauge: '#7D6B5D',
  subway: '#2E86C1',
  light_rail: '#1ABC9C',
  tram: '#E67E22',
  monorail: '#8E44AD',
  funicular: '#A569BD',
  highspeed: '#C0392B',
};

function colorOf(name, tagged) {
  if (tagged && /^#?[0-9A-Fa-f]{6}$/.test(tagged)) {
    return tagged.startsWith('#') ? tagged : `#${tagged}`;
  }
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function railColor(name, { highspeed, planned }) {
  if (planned) return highspeed ? HSR_PLAN : RAIL_PLAN;
  if (!highspeed) return RAIL_COLOR;
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HSR_PALETTE[h % HSR_PALETTE.length];
}

function metroSegments(cityId, data) {
  const lines = data?.lines;
  if (!lines) return [];
  const list = Array.isArray(lines) ? lines : Object.values(lines);
  return list
    .filter((l) => l?.path?.length >= 2 && l.status !== 'planned')
    .map((l) => {
      const routeKind = String(
        l.routeKind || (typeof l.kind === 'string' ? l.kind : '') || ''
      ).toLowerCase();
      return {
        id: `world-metro-${cityId}-${l.key || l.name || l.id}`,
        line: l.name || l.key || '地铁',
        color: colorOf(l.name || l.key, l.color),
        style: l.status && l.status !== 'open' ? 'planned' : undefined,
        osmFull: true,
        path: l.path,
        cityId,
        kind: l.kind,
        routeKind: routeKind || 'subway',
        railway: ['tram', 'light_rail', 'monorail', 'funicular'].includes(routeKind)
          ? routeKind
          : undefined,
        skipLabels: true,
        stations: [],
      };
    });
}

function hsrRailSegments(regionId, data) {
  const list = data?.lines;
  if (!list?.length) return [];
  return list
    .filter((l) => l?.path?.length >= 2)
    .map((l) => ({
      id: `world-rail-${regionId}-${l.id || l.ref || l.name}`,
      line: l.name || l.ref || '高铁',
      color: l.color || '#1B6B4A',
      style: 'hsr',
      osmFull: true,
      highspeed: true,
      path: l.path,
      cityId: regionId,
      skipLabels: true,
      stations: l.stations || [],
    }));
}

function networkRailSegments(countryId, data) {
  const list = data?.lines;
  if (!list?.length) return [];
  return list
    .filter((l) => (l.paths || (l.path ? [l.path] : [])).some((p) => p?.length >= 2))
    .map((l) => {
      const paths = (l.paths || [l.path]).filter((p) => p?.length >= 2);
      const planned = l.status === 'planned' || l.status === 'construction';
      const highspeed = !!l.highspeed;
      return {
        id: `world-net-${countryId}-${l.id}`,
        line: l.name || l.ref || (highspeed ? '高铁' : '铁路'),
        color: railColor(l.name || l.ref, { highspeed, planned }),
        style: planned ? 'planned' : highspeed ? 'hsr' : 'rail',
        osmFull: true,
        networkRail: true,
        skipLabels: true,
        highspeed,
        railStatus: l.status,
        path: paths.length === 1 ? paths[0] : paths,
        cityId: countryId,
        stations: [],
        weight: planned ? (highspeed ? 3.6 : 2.2) : highspeed ? 5.2 : 2.5,
      };
    });
}

function ormWeight(railway, { highspeed, planned }) {
  if (planned) return highspeed ? 3.2 : 2;
  if (highspeed || railway === 'highspeed') return 5;
  if (railway === 'subway' || railway === 'light_rail' || railway === 'metro') return 3.2;
  if (railway === 'tram' || railway === 'monorail' || railway === 'funicular') return 2.6;
  if (railway === 'narrow_gauge') return 2.2;
  return 2.4;
}

function dist2PointPath(lat, lng, path) {
  let best = Infinity;
  for (let i = 0; i < path.length; i++) {
    const dlat = (path[i][0] - lat) * 111;
    const dlng = (path[i][1] - lng) * 85;
    const d = dlat * dlat + dlng * dlng;
    if (d < best) best = d;
  }
  return best;
}

/** 把车站挂到路径附近（阈值约 2.5km） */
function attachStations(path, stations, maxKm = 2.5) {
  if (!path?.length || !stations?.length) return [];
  const max2 = maxKm * maxKm;
  const out = [];
  const seen = new Set();
  for (const st of stations) {
    if (!st?.name || !Number.isFinite(st.lat) || !Number.isFinite(st.lng)) continue;
    if (seen.has(st.name)) continue;
    if (dist2PointPath(st.lat, st.lng, path) > max2) continue;
    seen.add(st.name);
    out.push({ name: st.name, lat: st.lat, lng: st.lng });
    if (out.length >= 80) break;
  }
  return out;
}

function normalizeStationList(list) {
  if (!list?.length) return [];
  const out = [];
  const seen = new Set();
  for (const st of list) {
    const name = st?.name;
    const lat = st.lat ?? st[0];
    const lng = st.lng ?? st[1];
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    out.push({ name, lat, lng });
  }
  return out;
}

function mergeOrmData(parts) {
  const segments = [];
  const stations = [];
  const routes = [];
  const seenSeg = new Set();
  const seenSt = new Set();
  const seenRt = new Set();
  for (const p of parts) {
    for (const s of p?.segments || []) {
      if (!s || seenSeg.has(s.id)) continue;
      seenSeg.add(s.id);
      segments.push(s);
    }
    for (const s of p?.stations || []) {
      if (!s || seenSt.has(s.id)) continue;
      seenSt.add(s.id);
      stations.push(s);
    }
    for (const r of p?.routes || []) {
      if (!r || seenRt.has(r.id)) continue;
      seenRt.add(r.id);
      routes.push(r);
    }
  }
  return { segments, stations, routes };
}

function ormInfrastructureSegments(countryId, data, { includeStations = true } = {}) {
  const list = data?.segments || [];
  const routes = data?.routes || [];
  const pool = data?.stations || [];
  const rail = [];
  const urban = [];
  const seenRouteNames = new Set();

  for (const r of routes) {
    if (!r?.path?.length || r.path.length < 2) continue;
    const routeKind = String(r.routeKind || 'subway').toLowerCase();
    const highspeed = !!r.highspeed || routeKind === 'highspeed';
    const isUrban = URBAN_RAIL.has(routeKind) || routeKind === 'subway';
    const label = r.name || (highspeed ? '高铁' : isUrban ? routeKind : '铁路');
    const key = `${label}|${routeKind}`;
    if (seenRouteNames.has(key)) continue;
    seenRouteNames.add(key);
    const stations = includeStations
      ? normalizeStationList(r.stations?.length ? r.stations : attachStations(r.path, pool))
      : [];
    const base = {
      id: `world-orm-route-${countryId}-${r.id}`,
      line: label,
      color: colorOf(label, r.colour || r.color) || ORM_RAIL_COLOR[routeKind] || RAIL_COLOR,
      style: highspeed ? 'hsr' : isUrban ? undefined : 'rail',
      osmFull: true,
      skipLabels: stations.length === 0,
      highspeed,
      railway: routeKind === 'metro' ? 'subway' : routeKind,
      routeKind: routeKind === 'metro' ? 'subway' : routeKind,
      path: r.path,
      cityId: countryId,
      stations,
      weight: ormWeight(routeKind, { highspeed, planned: false }),
      ormRail: true,
      ormNamed: true,
    };
    if (isUrban) {
      urban.push({
        ...base,
        kind: routeKind === 'tram' ? 'tram' : routeKind === 'light_rail' ? 'light_rail' : 'subway',
        networkRail: false,
      });
      rail.push({ ...base, networkRail: true, weight: Math.min(2.8, base.weight) });
    } else {
      rail.push({ ...base, networkRail: true });
    }
  }

  for (const s of list) {
    if (!s?.path?.length || s.path.length < 2) continue;
    const railway = String(s.railway || 'rail');
    const highspeed = !!s.highspeed || railway === 'highspeed';
    const planned = s.status === 'planned' || s.status === 'construction';
    const label = s.name || (highspeed ? '高铁' : URBAN_RAIL.has(railway) ? railway : '铁路');
    // 已有同名命名 route 时，碎轨位只作底图且不挂站，减少双标
    const hasNamed = [...seenRouteNames].some((k) => k.startsWith(`${label}|`));
    const stations =
      includeStations && !hasNamed && s.name ? attachStations(s.path, pool, 1.8) : [];
    const color =
      ORM_RAIL_COLOR[railway] ||
      (highspeed ? '#C0392B' : planned ? RAIL_PLAN : RAIL_COLOR);
    const base = {
      id: `world-orm-${countryId}-${s.id}`,
      line: label,
      color,
      style: planned ? 'planned' : highspeed ? 'hsr' : URBAN_RAIL.has(railway) ? undefined : 'rail',
      osmFull: true,
      skipLabels: stations.length === 0,
      highspeed,
      railway,
      railStatus: s.status,
      path: s.path,
      cityId: countryId,
      stations,
      weight: ormWeight(railway, { highspeed, planned }),
      ormRail: true,
    };
    if (URBAN_RAIL.has(railway)) {
      urban.push({
        ...base,
        kind: railway === 'tram' ? 'tram' : railway === 'light_rail' ? 'light_rail' : 'subway',
        networkRail: false,
      });
      rail.push({ ...base, networkRail: true, weight: Math.min(2.8, base.weight) });
    } else {
      rail.push({ ...base, networkRail: true });
    }
  }
  return { rail, urban };
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function boundsOverlap(a, b) {
  // a,b = [w,s,e,n]
  return !(a[2] < b[0] || a[0] > b[2] || a[3] < b[1] || a[1] > b[3]);
}

function leafletBoundsToBox(bounds, pad = 0) {
  return [
    bounds.getWest() - pad,
    bounds.getSouth() - pad,
    bounds.getEast() + pad,
    bounds.getNorth() + pad,
  ];
}

async function loadOrmIndex(countryId) {
  if (ormIndexBound.has(countryId)) return ormIndexBound.get(countryId);
  const key = `oi:${countryId}`;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const stub = await fetchJson(assetUrl(`geo/world/${countryId}-orm-rails.json`));
    if (!stub) {
      const empty = { kind: 'empty', countryId };
      ormIndexBound.set(countryId, empty);
      return empty;
    }
    if (stub.tiled && stub.index) {
      const index = await fetchJson(assetUrl(`geo/world/${stub.index}`));
      const meta = {
        kind: 'tiled',
        countryId,
        index: index || { tiles: [] },
        stub,
      };
      ormIndexBound.set(countryId, meta);
      return meta;
    }
    // 也可能直接是 orm/{cc}/index.json 存在而 stub 指向它
    if (stub.tiled) {
      const index = await fetchJson(assetUrl(`geo/world/orm/${countryId}/index.json`));
      const meta = { kind: 'tiled', countryId, index: index || { tiles: [] }, stub };
      ormIndexBound.set(countryId, meta);
      return meta;
    }
    const meta = { kind: 'flat', countryId, data: stub };
    ormIndexBound.set(countryId, meta);
    return meta;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

function appendOrmSplit(countryId, split) {
  const prevRail = ormRailSegs.get(countryId) || [];
  const prevUrban = ormUrbanSegs.get(countryId) || [];
  const railIds = new Set(prevRail.map((s) => s.id));
  const urbanIds = new Set(prevUrban.map((s) => s.id));
  for (const s of split.rail) if (!railIds.has(s.id)) prevRail.push(s);
  for (const s of split.urban) if (!urbanIds.has(s.id)) prevUrban.push(s);
  ormRailSegs.set(countryId, prevRail);
  ormUrbanSegs.set(countryId, prevUrban);
  ormBound.add(countryId);
  return { rail: prevRail, urban: prevUrban };
}

async function loadOrmTile(countryId, tileKey) {
  const cacheKey = `${countryId}:${tileKey}`;
  if (ormTileBound.has(cacheKey)) return null;
  const key = `ot:${cacheKey}`;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const data = await fetchJson(assetUrl(`geo/world/orm/${countryId}/t/${tileKey}.json`));
    ormTileBound.add(cacheKey);
    if (!data) return null;
    return data;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

/**
 * 视口 ORM：分块国家只拉相交瓦片；小国拉整包。
 * zoom&lt;8 时不挂站名（includeStations=false）以减轻标签压力。
 */
export async function ensureWorldOrmInView(countryId, bounds, zoom = 10) {
  if (!countryId || !bounds) return { rail: [], urban: [] };
  const includeStations = zoom >= 9.5;
  const meta = await loadOrmIndex(countryId);
  if (!meta || meta.kind === 'empty') return { rail: [], urban: [] };

  if (meta.kind === 'flat') {
    if (!ormBound.has(countryId)) {
      const split = ormInfrastructureSegments(countryId, meta.data, { includeStations });
      ormRailSegs.set(countryId, split.rail);
      ormUrbanSegs.set(countryId, split.urban);
      ormBound.add(countryId);
    }
    return {
      rail: ormRailSegs.get(countryId) || [],
      urban: ormUrbanSegs.get(countryId) || [],
    };
  }

  const box = leafletBoundsToBox(bounds, zoom >= 10 ? 0.15 : 0.4);
  const tiles = (meta.index?.tiles || []).filter((t) => t?.bbox && boundsOverlap(t.bbox, box));
  // 限制单次瓦片数，避免超大视口一次打爆
  const capped = tiles.length > 24 ? tiles.slice(0, 24) : tiles;
  const parts = [];
  await Promise.all(
    capped.map(async (t) => {
      const data = await loadOrmTile(countryId, t.key);
      if (data) parts.push(data);
    })
  );
  if (!parts.length) {
    return {
      rail: ormRailSegs.get(countryId) || [],
      urban: ormUrbanSegs.get(countryId) || [],
    };
  }
  const merged = mergeOrmData(parts);
  const split = ormInfrastructureSegments(countryId, merged, { includeStations });
  return appendOrmSplit(countryId, split);
}

async function loadOrmBundle(countryId) {
  if (!countryId) return { rail: [], urban: [] };
  if (ormBound.has(countryId) && ormRailSegs.has(countryId)) {
    return {
      rail: ormRailSegs.get(countryId) || [],
      urban: ormUrbanSegs.get(countryId) || [],
    };
  }
  const key = `o:${countryId}`;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const meta = await loadOrmIndex(countryId);
    if (!meta || meta.kind === 'empty') {
      ormRailSegs.set(countryId, []);
      ormUrbanSegs.set(countryId, []);
      ormBound.add(countryId);
      return { rail: [], urban: [] };
    }
    if (meta.kind === 'flat') {
      const split = ormInfrastructureSegments(countryId, meta.data, { includeStations: true });
      ormRailSegs.set(countryId, split.rail);
      ormUrbanSegs.set(countryId, split.urban);
      ormBound.add(countryId);
      return split;
    }
    // 分块国家：整包加载过重；返回已缓存视口数据（可能为空）
    ormBound.add(countryId);
    return {
      rail: ormRailSegs.get(countryId) || [],
      urban: ormUrbanSegs.get(countryId) || [],
    };
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

/** 分块国家：拉取全部瓦片（全量按钮用；慎用于超大国） */
export async function ensureWorldOrmAllTiles(countryId, { includeStations = true, maxTiles = 80 } = {}) {
  if (!countryId) return { rail: [], urban: [] };
  const meta = await loadOrmIndex(countryId);
  if (!meta || meta.kind === 'empty') return { rail: [], urban: [] };
  if (meta.kind === 'flat') {
    const split = ormInfrastructureSegments(countryId, meta.data, { includeStations });
    ormRailSegs.set(countryId, split.rail);
    ormUrbanSegs.set(countryId, split.urban);
    ormBound.add(countryId);
    return split;
  }
  const tiles = (meta.index?.tiles || []).slice(0, maxTiles);
  const parts = [];
  for (let i = 0; i < tiles.length; i += 6) {
    const chunk = tiles.slice(i, i + 6);
    const got = await Promise.all(chunk.map((t) => loadOrmTile(countryId, t.key)));
    for (const d of got) if (d) parts.push(d);
  }
  const merged = mergeOrmData(parts);
  const split = ormInfrastructureSegments(countryId, merged, { includeStations });
  return appendOrmSplit(countryId, split);
}

/** OpenRailwayMap 风格轨位（铁路模式） */
export async function ensureWorldOrmRails(countryId) {
  const meta = await loadOrmIndex(countryId);
  if (meta?.kind === 'tiled') {
    const { rail } = await ensureWorldOrmAllTiles(countryId, {
      includeStations: false,
      maxTiles: countryId === 'us' || countryId === 'ru' || countryId === 'cn' ? 40 : 80,
    });
    return rail;
  }
  const { rail } = await loadOrmBundle(countryId);
  return rail;
}

/** 城轨/有轨等基础设施子集（地铁模式） */
export async function ensureWorldOrmUrban(countryId) {
  const meta = await loadOrmIndex(countryId);
  if (meta?.kind === 'tiled') {
    const { urban } = await ensureWorldOrmAllTiles(countryId, { includeStations: true, maxTiles: 60 });
    return urban;
  }
  const { urban } = await loadOrmBundle(countryId);
  return urban;
}

export async function loadWorldMetroForCountry(countryId, skipIds = new Set()) {
  const cities = citiesOfCountry(countryId).filter((c) => !skipIds.has(c.id));
  const chunks = await Promise.all(cities.map((c) => ensureWorldMetro(c.id)));
  const named = chunks.flat();
  const urban = await ensureWorldOrmUrban(countryId);
  return urban.length ? [...named, ...urban] : named;
}

export async function loadWorldRailForCountry(countryId) {
  const orm = await ensureWorldOrmRails(countryId);
  if (orm.length) return orm;
  const net = await ensureWorldRailNetwork(countryId);
  if (net.length) return net;
  const regions = WORLD_RAIL_REGIONS.filter((r) => r.id === countryId || r.id.startsWith(`${countryId}-`));
  const chunks = await Promise.all(regions.map((r) => ensureWorldRail(r.id)));
  return chunks.flat();
}

export async function ensureWorldMetro(cityId) {
  if (!cityId) return [];
  if (metroBound.has(cityId)) return metroSegs.get(cityId) || [];
  const key = `m:${cityId}`;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const data = await fetchJson(assetUrl(`geo/world/${cityId}-metro.json`));
    const segs = metroSegments(cityId, data);
    metroSegs.set(cityId, segs);
    metroBound.add(cityId);
    return segs;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

export async function ensureWorldRail(regionId) {
  if (!regionId) return [];
  if (railBound.has(regionId)) return railSegs.get(regionId) || [];
  const key = `r:${regionId}`;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const data = await fetchJson(assetUrl(`geo/world/${regionId}-rail.json`));
    const segs = hsrRailSegments(regionId, data);
    railSegs.set(regionId, segs);
    railBound.add(regionId);
    return segs;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

export async function ensureWorldRailNetwork(countryId) {
  if (!countryId || countryId === 'cn') return [];
  if (networkBound.has(countryId)) return networkSegs.get(countryId) || [];
  const key = `n:${countryId}`;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const data = await fetchJson(assetUrl(`geo/world/${countryId}-rail-network.json`));
    const segs = networkRailSegments(countryId, data);
    networkSegs.set(countryId, segs);
    networkBound.add(countryId);
    return segs;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

/** 视口相交的国家（按 bbox） */
export function countriesIntersectingView(bounds, { pad = 0.5 } = {}) {
  if (!bounds) return [];
  const s = bounds.getSouth() - pad;
  const n = bounds.getNorth() + pad;
  const w = bounds.getWest() - pad;
  const e = bounds.getEast() + pad;
  const out = [];
  for (const c of WORLD_COUNTRIES) {
    if (!c.bbox) continue;
    const [cw, cs, ce, cn] = c.bbox;
    if (ce < w || cw > e || cn < s || cs > n) continue;
    out.push(c.id);
  }
  return out;
}

/** 视口附近城市 */
export function citiesNearView(center, zoom, { includeChinaHint = false } = {}) {
  if (!center) return [];
  const deg = zoom >= 11 ? 0.45 : zoom >= 9 ? 0.9 : zoom >= 7 ? 1.8 : 3.2;
  const lngScale = Math.max(0.4, Math.cos((center.lat * Math.PI) / 180));
  const out = [];
  for (const c of WORLD_CITIES) {
    if (c.lat == null || c.lng == null) continue;
    if (Math.abs(c.lat - center.lat) <= deg && Math.abs(c.lng - center.lng) <= deg / lngScale) {
      out.push(c.id);
    }
  }
  return out;
}

export function worldCityIds() {
  return WORLD_CITIES.map((c) => c.id);
}

/** 批量挂世界城轨缓存（可带进度） */
export async function loadAllWorldMetros(cityIds, onProgress) {
  const ids = cityIds?.length ? cityIds : worldCityIds();
  const BATCH = 6;
  let done = 0;
  const out = [];
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const parts = await Promise.all(chunk.map((id) => ensureWorldMetro(id)));
    for (const segs of parts) out.push(...segs);
    done += chunk.length;
    onProgress?.(done, ids.length);
  }
  return out;
}

/** 批量挂各国 ORM / 路网轨位 */
export async function loadAllWorldOrmRails(countryIds, onProgress) {
  const ids = countryIds?.length ? countryIds : WORLD_COUNTRIES.map((c) => c.id);
  const BATCH = 3;
  let done = 0;
  const out = [];
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const parts = await Promise.all(
      chunk.map(async (id) => {
        const orm = await ensureWorldOrmRails(id);
        if (orm.length) return orm;
        return ensureWorldRailNetwork(id);
      })
    );
    for (const segs of parts) out.push(...segs);
    done += chunk.length;
    onProgress?.(done, ids.length);
  }
  return out;
}

export function allBoundWorldSegments() {
  const out = [];
  for (const segs of metroSegs.values()) for (const s of segs) out.push(s);
  for (const segs of railSegs.values()) for (const s of segs) out.push(s);
  for (const segs of networkSegs.values()) for (const s of segs) out.push(s);
  for (const segs of ormUrbanSegs.values()) for (const s of segs) out.push(s);
  return out;
}

export function allBoundNetworkRailSegments() {
  const out = [];
  for (const segs of networkSegs.values()) for (const s of segs) out.push(s);
  for (const segs of ormRailSegs.values()) for (const s of segs) out.push(s);
  return out;
}
