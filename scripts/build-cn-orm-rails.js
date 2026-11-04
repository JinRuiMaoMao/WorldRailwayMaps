/**
 * 生成 public/geo/world/cn-orm-rails.json
 * - 干线：复用已有 china-rail-network.json
 * - 城轨/有轨：按城市小框 Overpass（避免全国 40 瓦片超时）
 *
 *   node scripts/build-cn-orm-rails.js
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const UA = 'chinasubwayplan/1.0 (cn orm rails; OSM)';
const SCHEMA = 1;
const OVERPASS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

const URBAN_RE = '^(subway|light_rail|tram|monorail|funicular)$';
const TRACK_KINDS = new Set(['subway', 'light_rail', 'tram', 'monorail', 'funicular']);

/** 中国主要城轨城市（小框拉取） */
const URBAN_CITIES = [
  { id: 'beijing', lat: 39.9, lng: 116.4, r: 0.7 },
  { id: 'tianjin', lat: 39.13, lng: 117.2, r: 0.45 },
  { id: 'shanghai', lat: 31.23, lng: 121.47, r: 0.7 },
  { id: 'guangzhou', lat: 23.13, lng: 113.26, r: 0.55 },
  { id: 'shenzhen', lat: 22.55, lng: 114.06, r: 0.45 },
  { id: 'hongkong', lat: 22.32, lng: 114.17, r: 0.28 },
  { id: 'dongguan', lat: 23.02, lng: 113.75, r: 0.4 },
  { id: 'foshan', lat: 23.02, lng: 113.12, r: 0.4 },
  { id: 'wuhan', lat: 30.59, lng: 114.3, r: 0.55 },
  { id: 'chengdu', lat: 30.67, lng: 104.07, r: 0.55 },
  { id: 'chongqing', lat: 29.56, lng: 106.55, r: 0.55 },
  { id: 'nanjing', lat: 32.06, lng: 118.8, r: 0.5 },
  { id: 'hangzhou', lat: 30.27, lng: 120.15, r: 0.5 },
  { id: 'suzhou', lat: 31.32, lng: 120.55, r: 0.5 },
  { id: 'wuxi', lat: 31.57, lng: 120.3, r: 0.35 },
  { id: 'ningbo', lat: 29.87, lng: 121.55, r: 0.4 },
  { id: 'hefei', lat: 31.82, lng: 117.23, r: 0.4 },
  { id: 'zhengzhou', lat: 34.75, lng: 113.65, r: 0.45 },
  { id: 'xian', lat: 34.26, lng: 108.94, r: 0.45 },
  { id: 'qingdao', lat: 36.07, lng: 120.38, r: 0.45 },
  { id: 'jinan', lat: 36.67, lng: 117.0, r: 0.4 },
  { id: 'dalian', lat: 38.91, lng: 121.61, r: 0.4 },
  { id: 'shenyang', lat: 41.81, lng: 123.43, r: 0.4 },
  { id: 'changchun', lat: 43.82, lng: 125.32, r: 0.4 },
  { id: 'harbin', lat: 45.75, lng: 126.65, r: 0.4 },
  { id: 'kunming', lat: 25.04, lng: 102.71, r: 0.4 },
  { id: 'nanning', lat: 22.82, lng: 108.37, r: 0.4 },
  { id: 'xiamen', lat: 24.48, lng: 118.09, r: 0.35 },
  { id: 'fuzhou', lat: 26.08, lng: 119.3, r: 0.35 },
  { id: 'nanchang', lat: 28.68, lng: 115.86, r: 0.35 },
  { id: 'changsha', lat: 28.23, lng: 112.94, r: 0.4 },
  { id: 'guiyang', lat: 26.65, lng: 106.63, r: 0.35 },
  { id: 'taiyuan', lat: 37.87, lng: 112.55, r: 0.35 },
  { id: 'shijiazhuang', lat: 38.04, lng: 114.51, r: 0.35 },
  { id: 'lanzhou', lat: 36.06, lng: 103.83, r: 0.35 },
  { id: 'urumqi', lat: 43.83, lng: 87.62, r: 0.35 },
  { id: 'taipei', lat: 25.05, lng: 121.53, r: 0.35 },
  { id: 'kaohsiung', lat: 22.63, lng: 120.3, r: 0.3 },
  { id: 'macau', lat: 22.2, lng: 113.55, r: 0.15 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hypotM(a, b) {
  return Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 85000);
}

function simplify(coords, minM = 40) {
  if (coords.length < 3) return coords;
  const out = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    if (hypotM(out[out.length - 1], coords[i]) >= minM) out.push(coords[i]);
  }
  out.push(coords[coords.length - 1]);
  return out;
}

function roundPath(path) {
  return path.map((p) => [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]);
}

function pathLen(path) {
  let m = 0;
  for (let i = 1; i < path.length; i++) m += hypotM(path[i - 1], path[i]);
  return m;
}

async function overpass(query, timeoutMs = 90000) {
  let last;
  for (let round = 0; round < 2; round++) {
    for (const ep of OVERPASS) {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), timeoutMs);
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`${ep} ${res.status}`);
        return await res.json();
      } catch (e) {
        last = e;
        await sleep(500 + round * 1000);
      } finally {
        clearTimeout(t);
      }
    }
  }
  throw last || new Error('overpass failed');
}

function fromNetwork() {
  const src = 'public/geo/china-rail-network.json';
  if (!existsSync(src)) return [];
  const data = JSON.parse(readFileSync(src, 'utf8'));
  const out = [];
  for (const line of Object.values(data.lines || {})) {
    const paths = line.paths || (line.path ? [line.path] : []);
    const highspeed = !!line.highspeed;
    const status = line.status === 'planned' || line.status === 'construction' ? line.status : 'open';
    paths.forEach((path, i) => {
      if (!path || path.length < 2) return;
      const p = roundPath(simplify(path, highspeed ? 55 : 80));
      if (p.length < 2 || pathLen(p) < 120) return;
      out.push({
        id: `cn-net-${line.id}-${i}`,
        railway: highspeed ? 'highspeed' : 'rail',
        highspeed,
        status,
        name: line.name || line.ref || '',
        path: p,
      });
    });
  }
  console.log('from network', out.length);
  return out;
}

function wayToUrban(el) {
  if (el.type !== 'way' || !el.id || !el.geometry?.length) return null;
  const tags = el.tags || {};
  let railway = String(tags.railway || '');
  if (railway === 'construction' || railway === 'proposed') {
    railway = String(tags.construction || tags.proposed || '');
  }
  if (!TRACK_KINDS.has(railway)) return null;
  if (/^(yard|siding|spur|crossover)$/i.test(String(tags.service || ''))) return null;
  const coords = [];
  for (const g of el.geometry) {
    if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
    coords.push([g.lat, g.lon]);
  }
  if (coords.length < 2) return null;
  const path = roundPath(simplify(coords, 32));
  if (path.length < 2 || (pathLen(path) < 60 && path.length < 4)) return null;
  const rw0 = String(tags.railway || '');
  return {
    id: el.id,
    railway,
    highspeed: false,
    status: rw0 === 'proposed' ? 'planned' : rw0 === 'construction' ? 'construction' : 'open',
    name: tags.name || tags.ref || '',
    path,
  };
}

async function fetchUrbanCity(city) {
  const south = city.lat - city.r;
  const north = city.lat + city.r;
  const west = city.lng - city.r;
  const east = city.lng + city.r;
  const bbox = `${south},${west},${north},${east}`;
  const json = await overpass(
    `[out:json][timeout:75][maxsize:67108864];
(
  way["railway"~"${URBAN_RE}"](${bbox});
  way["railway"="construction"]["construction"~"${URBAN_RE}"](${bbox});
  way["railway"="proposed"]["proposed"~"${URBAN_RE}"](${bbox});
);
out geom;`,
    80000
  );
  const segs = [];
  for (const el of json.elements || []) {
    const s = wayToUrban(el);
    if (s) segs.push(s);
  }
  return segs;
}

async function fetchAllUrban() {
  const byId = new Map();
  for (let i = 0; i < URBAN_CITIES.length; i++) {
    const city = URBAN_CITIES[i];
    try {
      const segs = await fetchUrbanCity(city);
      for (const s of segs) if (!byId.has(s.id)) byId.set(s.id, s);
      console.log('urban', city.id, segs.length, 'total', byId.size);
    } catch (e) {
      console.warn('urban fail', city.id, e.message || e);
    }
    if (i + 1 < URBAN_CITIES.length) await sleep(450);
  }
  return [...byId.values()];
}

function stratifiedCap(items, limit) {
  if (items.length <= limit) return items;
  const buckets = { rail: [], hs: [], urban: [], tram: [], other: [] };
  for (const s of items) {
    if (s.highspeed || s.railway === 'highspeed') buckets.hs.push(s);
    else if (s.railway === 'subway' || s.railway === 'light_rail') buckets.urban.push(s);
    else if (s.railway === 'tram' || s.railway === 'monorail' || s.railway === 'funicular') buckets.tram.push(s);
    else if (s.railway === 'rail' || s.railway === 'narrow_gauge') buckets.rail.push(s);
    else buckets.other.push(s);
  }
  const byLen = (a, b) => pathLen(b.path) - pathLen(a.path);
  for (const k of Object.keys(buckets)) buckets[k].sort(byLen);
  const quotas = {
    rail: Math.floor(limit * 0.42),
    hs: Math.floor(limit * 0.16),
    urban: Math.floor(limit * 0.28),
    tram: Math.floor(limit * 0.1),
    other: Math.floor(limit * 0.04),
  };
  const picked = [];
  const leftover = [];
  for (const [k, q] of Object.entries(quotas)) {
    picked.push(...buckets[k].slice(0, q));
    leftover.push(...buckets[k].slice(q));
  }
  leftover.sort(byLen);
  if (picked.length < limit) picked.push(...leftover.slice(0, limit - picked.length));
  return picked.slice(0, limit);
}

async function main() {
  mkdirSync('public/geo/world', { recursive: true });
  const rail = fromNetwork();
  const urban = await fetchAllUrban();
  const byId = new Map();
  for (const s of rail) byId.set(String(s.id), s);
  for (const s of urban) byId.set(String(s.id), s);
  const segments = stratifiedCap([...byId.values()], 14000);
  const dest = 'public/geo/world/cn-orm-rails.json';
  const json = {
    generatedAt: new Date().toISOString(),
    schema: SCHEMA,
    country: 'cn',
    attribution: '© OpenStreetMap contributors',
    count: segments.length,
    sources: ['china-rail-network.json', 'overpass-urban-cities'],
    segments,
  };
  writeFileSync(dest, JSON.stringify(json));
  const kinds = {};
  for (const s of segments) kinds[s.railway] = (kinds[s.railway] || 0) + 1;
  console.log('OK', dest, json.count, kinds);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
