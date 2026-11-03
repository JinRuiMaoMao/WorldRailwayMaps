/** 中国铁路 OSM 现势层：已开通 + 在建/规划，不进时间轴骨架 */

import { PLACES } from './network.js';

const HSR_PALETTE = ['#C0392B', '#1A5276', '#117A65', '#6C3483', '#B9770E', '#922B21', '#1B4F72', '#196F3D'];
const RAIL_COLOR = '#5D6D7E';
const HSR_PLAN = '#5DADE2';
const RAIL_PLAN = '#8E9AAF';

let bound = [];
let ready = false;
let inflight = null;

function colorOf(name, { highspeed, planned }) {
  if (planned) return highspeed ? HSR_PLAN : RAIL_PLAN;
  if (!highspeed) return RAIL_COLOR;
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HSR_PALETTE[h % HSR_PALETTE.length];
}

function chinaCities() {
  return Object.values(PLACES).filter((p) => p?.metro || p?.id === 'lhasaProxy' || p?.id === 'haikouProxy');
}

function pathNearCity(paths, city, deg = 0.42) {
  const rlat = deg;
  const rlng = deg / Math.max(0.4, Math.cos((city.lat * Math.PI) / 180));
  for (const path of paths) {
    const step = Math.max(1, Math.floor(path.length / 24));
    for (let i = 0; i < path.length; i += step) {
      const p = path[i];
      if (Math.abs(p[0] - city.lat) <= rlat && Math.abs(p[1] - city.lng) <= rlng) return true;
    }
  }
  return false;
}

function cityIdsFor(paths) {
  const ids = [];
  for (const c of chinaCities()) {
    if (pathNearCity(paths, c)) ids.push(c.id === 'lhasaProxy' ? 'lhasaProxy' : c.id);
  }
  return ids;
}

export function chinaRailNetworkReady() {
  return ready && bound.length > 0;
}

export function chinaRailNetworkSegments() {
  return bound;
}

function railStem(name) {
  return String(name || '').replace(/高速铁路|高铁|客运专线|客专|城际铁路|城际|铁路|鐵路|线|線/g, '');
}

export function chinaRailNetworkHas(line) {
  const stem = railStem(line);
  if (!stem) return false;
  for (const seg of bound) {
    const n = railStem(seg.line);
    if (n && (n === stem || n.includes(stem) || stem.includes(n))) return true;
  }
  return false;
}

export async function ensureChinaRailNetwork() {
  if (ready) return bound;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/geo/china-rail-network.json');
      if (!res.ok) {
        bound = [];
        ready = true;
        return bound;
      }
      const data = await res.json();
      const list = data?.lines || [];
      bound = list
        .filter((l) => (l.paths || (l.path ? [l.path] : [])).some((p) => p?.length >= 2))
        .map((l) => {
          const paths = (l.paths || [l.path]).filter((p) => p?.length >= 2);
          const planned = l.status === 'planned' || l.status === 'construction';
          const highspeed = !!l.highspeed;
          const cityIds = cityIdsFor(paths);
          return {
            id: `cn-rail-${l.id}`,
            line: l.name || l.ref || (highspeed ? '高铁' : '铁路'),
            color: colorOf(l.name || l.ref, { highspeed, planned }),
            style: planned ? 'planned' : highspeed ? 'hsr' : 'rail',
            osmFull: true,
            networkRail: true,
            skipLabels: true,
            highspeed,
            railStatus: l.status,
            path: paths.length === 1 ? paths[0] : paths,
            cityId: cityIds[0] || '',
            cityIds,
            stations: [],
            weight: planned ? (highspeed ? 3.6 : 2.2) : highspeed ? 5.2 : 2.5,
          };
        });
      ready = true;
      return bound;
    } catch {
      bound = [];
      ready = true;
      return bound;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
