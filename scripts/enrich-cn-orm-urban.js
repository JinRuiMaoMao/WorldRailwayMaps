/**
 * 为中国 ORM 分块补车站 + 城轨命名 route（城市小框）
 *   node scripts/enrich-cn-orm-urban.js
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const UA = 'chinasubwayplan/1.0 (cn orm enrich; OSM)';
const OVERPASS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

const CITIES = [
  { id: 'beijing', lat: 39.9, lng: 116.4, r: 0.7 },
  { id: 'shanghai', lat: 31.23, lng: 121.47, r: 0.7 },
  { id: 'guangzhou', lat: 23.13, lng: 113.26, r: 0.5 },
  { id: 'shenzhen', lat: 22.55, lng: 114.06, r: 0.45 },
  { id: 'chengdu', lat: 30.67, lng: 104.07, r: 0.5 },
  { id: 'wuhan', lat: 30.59, lng: 114.3, r: 0.5 },
  { id: 'nanjing', lat: 32.06, lng: 118.8, r: 0.45 },
  { id: 'hangzhou', lat: 30.27, lng: 120.15, r: 0.45 },
  { id: 'chongqing', lat: 29.56, lng: 106.55, r: 0.5 },
  { id: 'xian', lat: 34.26, lng: 108.94, r: 0.4 },
  { id: 'suzhou', lat: 31.32, lng: 120.55, r: 0.45 },
  { id: 'tianjin', lat: 39.13, lng: 117.2, r: 0.4 },
  { id: 'hongkong', lat: 22.32, lng: 114.17, r: 0.28 },
  { id: 'shenyang', lat: 41.81, lng: 123.43, r: 0.4 },
  { id: 'dalian', lat: 38.91, lng: 121.61, r: 0.4 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pathBBox(path) {
  let s = Infinity;
  let n = -Infinity;
  let w = Infinity;
  let e = -Infinity;
  for (const p of path) {
    if (p[0] < s) s = p[0];
    if (p[0] > n) n = p[0];
    if (p[1] < w) w = p[1];
    if (p[1] > e) e = p[1];
  }
  return [w, s, e, n];
}

function stitch(parts) {
  if (!parts.length) return [];
  const unused = parts.map((p) => p.slice());
  const chains = [];
  while (unused.length) {
    let chain = unused.shift();
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < unused.length; i++) {
        const p = unused[i];
        const near = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 2.5e-4;
        const a0 = chain[0];
        const a1 = chain[chain.length - 1];
        const b0 = p[0];
        const b1 = p[p.length - 1];
        if (near(a1, b0)) {
          chain = chain.concat(p.slice(1));
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (near(a1, b1)) {
          chain = chain.concat(p.slice(0, -1).reverse());
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (near(a0, b1)) {
          chain = p.slice(0, -1).concat(chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (near(a0, b0)) {
          chain = p.slice(1).reverse().concat(chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
      }
    }
    chains.push(chain);
  }
  chains.sort((a, b) => b.length - a.length);
  return chains[0] || [];
}

async function overpass(query) {
  let last;
  for (const ep of OVERPASS) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 85000);
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
      await sleep(900);
    } finally {
      clearTimeout(t);
    }
  }
  throw last || new Error('overpass failed');
}

async function main() {
  const idxPath = 'public/geo/world/orm/cn/index.json';
  if (!existsSync(idxPath)) {
    console.error('missing cn index; run fetch/tile first');
    process.exit(1);
  }
  const stations = [];
  const routes = [];
  const seenSt = new Set();
  const seenRt = new Set();

  for (const city of CITIES) {
    const bbox = `${city.lat - city.r},${city.lng - city.r},${city.lat + city.r},${city.lng + city.r}`;
    try {
      const json = await overpass(
        `[out:json][timeout:75];
(
  node["railway"~"^(station|halt|tram_stop)$"](${bbox});
  relation["type"="route"]["route"~"^(subway|metro|light_rail|tram|monorail)$"](${bbox});
);
out geom;`
      );
      for (const el of json.elements || []) {
        if (el.type === 'node' && el.tags?.name && !seenSt.has(el.id)) {
          seenSt.add(el.id);
          stations.push({
            id: el.id,
            name: el.tags['name:zh'] || el.tags.name,
            lat: Math.round(el.lat * 1e5) / 1e5,
            lng: Math.round(el.lon * 1e5) / 1e5,
            railway: el.tags.railway,
          });
        }
        if (el.type === 'relation' && el.tags && !seenRt.has(el.id)) {
          const parts = [];
          for (const m of el.members || []) {
            if (m.type !== 'way' || !m.geometry?.length) continue;
            if (m.role && !['', 'forward', 'backward', 'route'].includes(m.role)) continue;
            const coords = [];
            for (const g of m.geometry) {
              if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
              coords.push([Math.round(g.lat * 1e5) / 1e5, Math.round(g.lon * 1e5) / 1e5]);
            }
            if (coords.length >= 2) {
              if (m.role === 'backward') coords.reverse();
              parts.push(coords);
            }
          }
          const path = stitch(parts);
          if (path.length < 4) continue;
          seenRt.add(el.id);
          const route = el.tags.route === 'metro' ? 'subway' : el.tags.route;
          routes.push({
            id: el.id,
            name: el.tags['name:zh'] || el.tags.name || el.tags.ref || `rel-${el.id}`,
            colour: el.tags.colour || el.tags.color || '',
            routeKind: route,
            highspeed: false,
            path,
            stations: [],
          });
        }
      }
      console.log(city.id, 'st', stations.length, 'rt', routes.length);
    } catch (e) {
      console.warn('fail', city.id, e.message || e);
    }
    await sleep(600);
  }

  const idx = JSON.parse(readFileSync(idxPath, 'utf8'));
  const findTile = (lat, lng) => {
    for (const t of idx.tiles) {
      const [w, s, e, n] = t.bbox;
      if (lng >= w && lng < e && lat >= s && lat < n) return t.key;
    }
    return idx.tiles[0]?.key;
  };
  const addSt = new Map();
  const addRt = new Map();
  for (const st of stations) {
    const k = findTile(st.lat, st.lng);
    if (!addSt.has(k)) addSt.set(k, []);
    addSt.get(k).push(st);
  }
  for (const rt of routes) {
    const bb = pathBBox(rt.path);
    const k = findTile((bb[1] + bb[3]) / 2, (bb[0] + bb[2]) / 2);
    if (!addRt.has(k)) addRt.set(k, []);
    addRt.get(k).push(rt);
  }

  let stN = idx.count.stations || 0;
  let rtN = idx.count.routes || 0;
  for (const t of idx.tiles) {
    const path = `public/geo/world/orm/cn/t/${t.key}.json`;
    const body = JSON.parse(readFileSync(path, 'utf8'));
    const seen = new Set((body.stations || []).map((s) => s.id));
    for (const st of addSt.get(t.key) || []) {
      if (seen.has(st.id)) continue;
      body.stations.push(st);
      seen.add(st.id);
      stN += 1;
    }
    const seenR = new Set((body.routes || []).map((r) => r.id));
    for (const rt of addRt.get(t.key) || []) {
      if (seenR.has(rt.id)) continue;
      body.routes.push(rt);
      seenR.add(rt.id);
      rtN += 1;
    }
    t.stations = body.stations.length;
    t.routes = body.routes.length;
    writeFileSync(path, JSON.stringify(body));
  }
  idx.count.stations = stN;
  idx.count.routes = rtN;
  idx.generatedAt = new Date().toISOString();
  writeFileSync(idxPath, JSON.stringify(idx));
  console.log('cn enriched', idx.count);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
