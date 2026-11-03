/** 世界城轨 / 铁路 OSM 现势层：按国/城懒加载，不进中国时间轴 */

import { WORLD_CITIES, WORLD_COUNTRIES, WORLD_RAIL_REGIONS, citiesOfCountry } from './worldCatalog.js';

const metroBound = new Set();
const railBound = new Set();
const networkBound = new Set();
const metroSegs = new Map();
const railSegs = new Map();
const networkSegs = new Map();
const inflight = new Map();

const PALETTE = ['#003399', '#CC0000', '#009933', '#FF6600', '#660099', '#0099CC', '#222222', '#C4A35A'];
const HSR_PALETTE = ['#C0392B', '#1A5276', '#117A65', '#6C3483', '#B9770E', '#922B21'];
const RAIL_COLOR = '#5D6D7E';
const HSR_PLAN = '#5DADE2';
const RAIL_PLAN = '#8E9AAF';

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
    .map((l) => ({
      id: `world-metro-${cityId}-${l.key || l.name || l.id}`,
      line: l.name || l.key || '地铁',
      color: colorOf(l.name || l.key, l.color),
      style: l.status && l.status !== 'open' ? 'planned' : undefined,
      osmFull: true,
      path: l.path,
      cityId,
      kind: l.kind,
      skipLabels: true,
      stations: [],
    }));
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

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function ensureWorldMetro(cityId) {
  if (!cityId) return [];
  if (metroBound.has(cityId)) return metroSegs.get(cityId) || [];
  const key = `m:${cityId}`;
  if (inflight.has(key)) return inflight.get(key);
  const job = (async () => {
    const data = await fetchJson(`/geo/world/${cityId}-metro.json`);
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
    const data = await fetchJson(`/geo/world/${regionId}-rail.json`);
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
    const data = await fetchJson(`/geo/world/${countryId}-rail-network.json`);
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

export async function loadWorldMetroForCountry(countryId, skipIds = new Set()) {
  const cities = citiesOfCountry(countryId).filter((c) => !skipIds.has(c.id));
  const chunks = await Promise.all(cities.map((c) => ensureWorldMetro(c.id)));
  return chunks.flat();
}

export async function loadWorldRailForCountry(countryId) {
  const net = await ensureWorldRailNetwork(countryId);
  if (net.length) return net;
  const regions = WORLD_RAIL_REGIONS.filter((r) => r.id === countryId || r.id.startsWith(`${countryId}-`));
  const chunks = await Promise.all(regions.map((r) => ensureWorldRail(r.id)));
  return chunks.flat();
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
    if (c.id === 'cn' || !c.bbox) continue;
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

export function allBoundWorldSegments() {
  const out = [];
  for (const segs of metroSegs.values()) for (const s of segs) out.push(s);
  for (const segs of railSegs.values()) for (const s of segs) out.push(s);
  for (const segs of networkSegs.values()) for (const s of segs) out.push(s);
  return out;
}

export function allBoundNetworkRailSegments() {
  const out = [];
  for (const segs of networkSegs.values()) for (const s of segs) out.push(s);
  return out;
}
