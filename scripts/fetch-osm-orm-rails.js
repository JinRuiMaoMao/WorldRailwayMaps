/**
 * OpenRailwayMap 风格 schema2：轨位 + 车站 + 命名 route
 *   node scripts/fetch-osm-orm-rails.js de fr jp
 *   node scripts/fetch-osm-orm-rails.js all
 *   node scripts/fetch-osm-orm-rails.js force cn nl
 *
 * 大国写出 public/geo/world/orm/{cc}/index.json + t/{iy}_{ix}.json
 * 小国写出 public/geo/world/{cc}-orm-rails.json
 */
import {
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  rmSync,
} from 'fs';
import { WORLD_COUNTRIES } from '../src/data/worldCatalog.js';

const UA = 'chinasubwayplan/1.0 (orm rails v2; OSM)';
const SCHEMA = 2;
const OVERPASS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const RAIL_RE = '^(rail|subway|light_rail|tram|narrow_gauge|monorail|funicular|highspeed)$';
const TRACK_KINDS = new Set([
  'rail',
  'subway',
  'light_rail',
  'tram',
  'narrow_gauge',
  'monorail',
  'funicular',
  'highspeed',
]);
const STATION_RE = '^(station|halt|tram_stop|stop)$';
const URBAN_ROUTES = new Set(['subway', 'metro', 'light_rail', 'tram', 'monorail', 'funicular']);
const SKIP_SERVICE = /^(yard|siding|spur|crossover|crossing|traverser|turntable)$/i;

/** 走分块目录的国家 */
const TILED = new Set([
  'us',
  'ru',
  'ca',
  'br',
  'au',
  'in',
  'id',
  'mx',
  'ar',
  'kz',
  'cn',
  'de',
  'fr',
  'gb',
  'es',
  'it',
  'pl',
  'ua',
  'tr',
  'jp',
]);
const HUGE = new Set(['us', 'ru', 'ca', 'br', 'au', 'id', 'cn']);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hypotM(a, b) {
  return Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 85000);
}

function simplify(coords, minM = 55) {
  if (coords.length < 3) return coords;
  const out = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    if (hypotM(out[out.length - 1], coords[i]) >= minM) out.push(coords[i]);
  }
  out.push(coords[coords.length - 1]);
  return out;
}

function douglasPeucker(coords, tolM = 80) {
  if (coords.length < 3) return coords;
  const keep = new Uint8Array(coords.length);
  keep[0] = 1;
  keep[coords.length - 1] = 1;
  const stack = [[0, coords.length - 1]];
  const dist2 = (a, b, p) => {
    const ax = a[1] * 85000;
    const ay = a[0] * 111000;
    const bx = b[1] * 85000;
    const by = b[0] * 111000;
    const px = p[1] * 85000;
    const py = p[0] * 111000;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    let t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    const x = ax + dx * t - px;
    const y = ay + dy * t - py;
    return x * x + y * y;
  };
  const tol2 = tolM * tolM;
  while (stack.length) {
    const [i, j] = stack.pop();
    let maxD = 0;
    let maxK = i;
    for (let k = i + 1; k < j; k++) {
      const d = dist2(coords[i], coords[j], coords[k]);
      if (d > maxD) {
        maxD = d;
        maxK = k;
      }
    }
    if (maxD > tol2) {
      keep[maxK] = 1;
      stack.push([i, maxK], [maxK, j]);
    }
  }
  return coords.filter((_, i) => keep[i]);
}

function roundPath(path) {
  return path.map((p) => [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]);
}

function pathLen(path) {
  let m = 0;
  for (let i = 1; i < path.length; i++) m += hypotM(path[i - 1], path[i]);
  return m;
}

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

async function overpass(query, timeoutMs = 100000) {
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
        await sleep(700 + round * 1400);
      } finally {
        clearTimeout(t);
      }
    }
  }
  throw last || new Error('overpass failed');
}

/** country.bbox = [west, south, east, north] */
function tileSpan(countryId) {
  if (HUGE.has(countryId)) return 4;
  if (TILED.has(countryId)) return 2;
  return 8;
}

function tilesFor(country) {
  const [w, s, e, n] = country.bbox;
  const span = tileSpan(country.id);
  const tiles = [];
  let iy = 0;
  for (let y = s; y < n - 1e-9; y += span, iy++) {
    let ix = 0;
    for (let x = w; x < e - 1e-9; x += span, ix++) {
      tiles.push({
        iy,
        ix,
        key: `${iy}_${ix}`,
        south: y,
        west: x,
        north: Math.min(n, y + span),
        east: Math.min(e, x + span),
        span,
      });
    }
  }
  return tiles.length
    ? tiles
    : [{ iy: 0, ix: 0, key: '0_0', south: s, west: w, north: n, east: e, span: n - s }];
}

function keepWay(tags) {
  if (!tags?.railway) return false;
  if (SKIP_SERVICE.test(String(tags.service || ''))) return false;
  if (tags.usage === 'military' || tags.usage === 'tourism') return false;
  const rw = String(tags.railway);
  if (rw === 'construction' || rw === 'proposed') {
    return TRACK_KINDS.has(String(tags.construction || tags.proposed || 'rail'));
  }
  return TRACK_KINDS.has(rw);
}

function statusOf(tags) {
  const rw = String(tags.railway || '');
  if (rw === 'proposed') return 'planned';
  if (rw === 'construction') return 'construction';
  return 'open';
}

function kindOf(tags) {
  const rw = String(tags.railway || '');
  if (rw === 'construction' || rw === 'proposed') {
    const k = String(tags.construction || tags.proposed || 'rail');
    return TRACK_KINDS.has(k) ? k : 'rail';
  }
  return rw;
}

function wayToSeg(el) {
  if (el.type !== 'way' || !el.id || !el.geometry?.length) return null;
  const tags = el.tags || {};
  if (!keepWay(tags)) return null;
  const coords = [];
  for (const g of el.geometry) {
    if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
    coords.push([g.lat, g.lon]);
  }
  if (coords.length < 2) return null;
  const railway = kindOf(tags);
  const highspeed = tags.highspeed === 'yes' || tags.highspeed === '1' || railway === 'highspeed';
  const tol = highspeed ? 45 : railway === 'subway' || railway === 'tram' ? 35 : 80;
  const path = roundPath(simplify(douglasPeucker(coords, tol), tol * 0.7));
  if (path.length < 2) return null;
  if (pathLen(path) < 80 && path.length < 4) return null;
  return {
    id: el.id,
    railway,
    highspeed: !!highspeed,
    status: statusOf(tags),
    name: tags.name || tags.ref || '',
    path,
  };
}

function nodeToStation(el) {
  if (el.type !== 'node' || !el.id) return null;
  const tags = el.tags || {};
  const rw = String(tags.railway || '');
  if (!/^(station|halt|tram_stop|stop)$/.test(rw)) return null;
  if (!Number.isFinite(el.lat) || !Number.isFinite(el.lon)) return null;
  const name = tags['name:zh'] || tags['name:en'] || tags.name || tags.ref || '';
  if (!name) return null;
  return {
    id: el.id,
    name,
    lat: Math.round(el.lat * 1e5) / 1e5,
    lng: Math.round(el.lon * 1e5) / 1e5,
    railway: rw,
  };
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

function pathFromRelation(rel) {
  const parts = [];
  for (const m of rel.members || []) {
    if (m.type !== 'way' || !m.geometry?.length) continue;
    if (m.role && !['', 'forward', 'backward', 'route'].includes(m.role)) continue;
    const coords = [];
    for (const g of m.geometry) {
      if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
      coords.push([g.lat, g.lon]);
    }
    if (coords.length < 2) continue;
    if (m.role === 'backward') coords.reverse();
    parts.push(coords);
  }
  return roundPath(simplify(douglasPeucker(stitch(parts), 40), 28));
}

function stationsFromRelation(rel, stationById) {
  const out = [];
  const seen = new Set();
  for (const m of rel.members || []) {
    if (m.type !== 'node') continue;
    if (m.role && !/stop|station|platform|halt/i.test(String(m.role)) && m.role !== '') continue;
    const id = m.ref || m.id;
    const fromPool = id != null ? stationById.get(id) : null;
    if (fromPool) {
      if (seen.has(fromPool.name)) continue;
      seen.add(fromPool.name);
      out.push({ ...fromPool });
      continue;
    }
    const lat = m.lat ?? m.geometry?.lat;
    const lon = m.lon ?? m.geometry?.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const tags = m.tags || {};
    const name = tags['name:zh'] || tags['name:en'] || tags.name || tags.ref || '';
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({
      id,
      name,
      lat: Math.round(lat * 1e5) / 1e5,
      lng: Math.round(lon * 1e5) / 1e5,
      railway: tags.railway || 'station',
    });
  }
  return out;
}

function relationToRoute(el, stationById) {
  if (el.type !== 'relation' || !el.id || !el.tags) return null;
  let route = String(el.tags.route || '');
  if (route === 'metro') route = 'subway';
  const highspeed = el.tags.highspeed === 'yes' || el.tags.highspeed === '1';
  if (URBAN_ROUTES.has(route)) {
    /* ok */
  } else if (route === 'train' && (highspeed || el.tags.name || el.tags.ref)) {
    /* 干线命名 train，避免无名车次 */
  } else {
    return null;
  }
  const path = pathFromRelation(el);
  if (path.length < 4 || pathLen(path) < 400) return null;
  const name =
    el.tags['name:zh'] || el.tags['name:en'] || el.tags.name || el.tags.ref || `rel-${el.id}`;
  const colour = el.tags.colour || el.tags.color || '';
  let stations = stationsFromRelation(el, stationById);
  // 成员未标站时：按路径邻近挂车站池
  if (!stations.length && stationById.size) {
    const pool = [...stationById.values()];
    const max2 = 2.2 * 2.2;
    const seen = new Set();
    for (const st of pool) {
      let best = Infinity;
      for (const p of path) {
        const dlat = (p[0] - st.lat) * 111;
        const dlng = (p[1] - st.lng) * 85;
        const d = dlat * dlat + dlng * dlng;
        if (d < best) best = d;
      }
      if (best > max2 || seen.has(st.name)) continue;
      seen.add(st.name);
      stations.push(st);
      if (stations.length >= 60) break;
    }
  }
  return {
    id: el.id,
    name,
    colour,
    routeKind: route === 'train' ? (highspeed ? 'highspeed' : 'rail') : route,
    highspeed: !!highspeed || route === 'highspeed',
    path,
    stations,
  };
}

async function fetchTileBundle(tile) {
  const bbox = `${tile.south},${tile.west},${tile.north},${tile.east}`;
  const json = await overpass(
    `[out:json][timeout:100][maxsize:67108864];
(
  way["railway"~"${RAIL_RE}"](${bbox});
  way["railway"="construction"](${bbox});
  way["railway"="proposed"](${bbox});
  node["railway"~"${STATION_RE}"](${bbox});
  relation["type"="route"]["route"~"^(subway|metro|light_rail|tram|monorail|funicular)$"](${bbox});
  relation["type"="route"]["route"="train"]["highspeed"="yes"](${bbox});
);
out geom;`,
    105000
  );
  const segments = [];
  const stations = [];
  const routes = [];
  const seenSeg = new Set();
  const seenSt = new Set();
  const seenRt = new Set();
  const stationById = new Map();
  const rels = [];
  for (const el of json.elements || []) {
    if (el.type === 'way') {
      const seg = wayToSeg(el);
      if (seg && !seenSeg.has(seg.id)) {
        seenSeg.add(seg.id);
        segments.push(seg);
      }
    } else if (el.type === 'node') {
      const st = nodeToStation(el);
      if (st && !seenSt.has(st.id)) {
        seenSt.add(st.id);
        stations.push(st);
        stationById.set(st.id, st);
      }
    } else if (el.type === 'relation') {
      rels.push(el);
    }
  }
  for (const el of rels) {
    const rt = relationToRoute(el, stationById);
    if (rt && !seenRt.has(rt.id)) {
      seenRt.add(rt.id);
      routes.push(rt);
    }
  }
  return { segments, stations, routes };
}

function injectChinaNetwork(segments) {
  const src = 'public/geo/china-rail-network.json';
  if (!existsSync(src)) return segments;
  const data = JSON.parse(readFileSync(src, 'utf8'));
  const byId = new Map(segments.map((s) => [String(s.id), s]));
  for (const line of Object.values(data.lines || {})) {
    const paths = line.paths || (line.path ? [line.path] : []);
    const highspeed = !!line.highspeed;
    const status = line.status === 'planned' || line.status === 'construction' ? line.status : 'open';
    paths.forEach((path, i) => {
      if (!path || path.length < 2) return;
      const p = roundPath(simplify(path, highspeed ? 55 : 80));
      if (p.length < 2 || pathLen(p) < 120) return;
      const id = `cn-net-${line.id}-${i}`;
      if (byId.has(id)) return;
      byId.set(id, {
        id,
        railway: highspeed ? 'highspeed' : 'rail',
        highspeed,
        status,
        name: line.name || line.ref || '',
        path: p,
      });
    });
  }
  return [...byId.values()];
}

function assignToTiles(items, tiles, getBBox) {
  const buckets = new Map(tiles.map((t) => [t.key, []]));
  for (const item of items) {
    const [w, s, e, n] = getBBox(item);
    if (![w, s, e, n].every(Number.isFinite)) continue;
    const cx = (w + e) / 2;
    const cy = (s + n) / 2;
    let placed = false;
    for (const t of tiles) {
      if (cx >= t.west && cx < t.east && cy >= t.south && cy < t.north) {
        buckets.get(t.key).push(item);
        placed = true;
        break;
      }
    }
    if (!placed && tiles[0]) buckets.get(tiles[0].key).push(item);
  }
  return buckets;
}

function writeTiledCountry(country, tiles, segments, stations, routes) {
  const dir = `public/geo/world/orm/${country.id}`;
  const tileDir = `${dir}/t`;
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(tileDir, { recursive: true });

  const segBuckets = assignToTiles(segments, tiles, (s) => pathBBox(s.path));
  const stBuckets = assignToTiles(stations, tiles, (s) => [s.lng, s.lat, s.lng, s.lat]);
  const rtBuckets = assignToTiles(routes, tiles, (r) => pathBBox(r.path));

  const indexTiles = [];
  let segN = 0;
  let stN = 0;
  let rtN = 0;
  for (const t of tiles) {
    const segs = segBuckets.get(t.key) || [];
    const sts = stBuckets.get(t.key) || [];
    const rts = rtBuckets.get(t.key) || [];
    if (!segs.length && !sts.length && !rts.length) continue;
    const body = {
      schema: SCHEMA,
      country: country.id,
      key: t.key,
      bbox: [t.west, t.south, t.east, t.north],
      segments: segs,
      stations: sts,
      routes: rts,
    };
    writeFileSync(`${tileDir}/${t.key}.json`, JSON.stringify(body));
    indexTiles.push({
      key: t.key,
      bbox: [t.west, t.south, t.east, t.north],
      segments: segs.length,
      stations: sts.length,
      routes: rts.length,
    });
    segN += segs.length;
    stN += sts.length;
    rtN += rts.length;
  }

  const index = {
    generatedAt: new Date().toISOString(),
    schema: SCHEMA,
    country: country.id,
    tiled: true,
    attribution: '© OpenStreetMap contributors',
    bbox: country.bbox,
    span: tileSpan(country.id),
    count: { segments: segN, stations: stN, routes: rtN },
    tiles: indexTiles,
  };
  writeFileSync(`${dir}/index.json`, JSON.stringify(index));
  // 兼容入口：指向分块索引
  writeFileSync(
    `public/geo/world/${country.id}-orm-rails.json`,
    JSON.stringify({
      generatedAt: index.generatedAt,
      schema: SCHEMA,
      country: country.id,
      tiled: true,
      index: `orm/${country.id}/index.json`,
      attribution: index.attribution,
      count: segN,
      segments: [],
      stations: [],
      routes: [],
    })
  );
  console.log('OK tiled', country.id, 'segs', segN, 'st', stN, 'rt', rtN, 'tiles', indexTiles.length);
}

function writeFlatCountry(country, segments, stations, routes) {
  const dest = `public/geo/world/${country.id}-orm-rails.json`;
  const json = {
    generatedAt: new Date().toISOString(),
    schema: SCHEMA,
    country: country.id,
    tiled: false,
    attribution: '© OpenStreetMap contributors',
    count: segments.length,
    segments,
    stations,
    routes,
  };
  writeFileSync(dest, JSON.stringify(json));
  console.log('OK', dest, 'segs', segments.length, 'st', stations.length, 'rt', routes.length);
}

async function fetchCountry(country) {
  console.log('orm', country.id, country.nameZh);
  const tiles = tilesFor(country);
  console.log('  tiles', tiles.length, 'span', tileSpan(country.id));
  const segBy = new Map();
  const stBy = new Map();
  const rtBy = new Map();
  let fails = 0;

  for (let i = 0; i < tiles.length; i++) {
    try {
      const bundle = await fetchTileBundle(tiles[i]);
      for (const s of bundle.segments) if (!segBy.has(s.id)) segBy.set(s.id, s);
      for (const s of bundle.stations) if (!stBy.has(s.id)) stBy.set(s.id, s);
      for (const r of bundle.routes) if (!rtBy.has(r.id)) rtBy.set(r.id, r);
      fails = 0;
      console.log(
        '  tile',
        i + 1,
        '/',
        tiles.length,
        'segs',
        segBy.size,
        'st',
        stBy.size,
        'rt',
        rtBy.size
      );
    } catch (e) {
      fails += 1;
      console.warn('  tile fail', i + 1, e.message || e);
      if (fails >= 8) {
        console.warn('  too many fails, stop early');
        break;
      }
      await sleep(2000 * fails);
    }
    if (i + 1 < tiles.length) await sleep(TILED.has(country.id) ? 800 : 450);
  }

  let segments = [...segBy.values()];
  if (country.id === 'cn') segments = injectChinaNetwork(segments);
  const stations = [...stBy.values()];
  const routes = [...rtBy.values()];
  return { segments, stations, routes, tiles };
}

function alreadySchema2(country) {
  const dest = `public/geo/world/${country.id}-orm-rails.json`;
  if (!existsSync(dest)) return false;
  try {
    const prev = JSON.parse(readFileSync(dest, 'utf8'));
    if ((prev.schema || 0) < SCHEMA) return false;
    if (prev.tiled) {
      const idx = `public/geo/world/orm/${country.id}/index.json`;
      if (!existsSync(idx)) return false;
      const index = JSON.parse(readFileSync(idx, 'utf8'));
      return (index.count?.segments || 0) > 0 || (index.tiles?.length || 0) > 0;
    }
    return (prev.count || prev.segments?.length || 0) >= 1 || prev.empty;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== 'force');
  const force = process.argv.includes('force');
  const ids = args.filter((a) => a !== 'all');
  const list =
    args.includes('all') || !ids.length
      ? WORLD_COUNTRIES
      : WORLD_COUNTRIES.filter((c) => ids.includes(c.id));
  if (!list.length) {
    console.error('unknown country', ids.join(','));
    process.exit(1);
  }
  mkdirSync('public/geo/world', { recursive: true });
  const priority = ['cn', 'de', 'fr', 'jp', 'gb', 'us', 'kr', 'nl', 'be', 'at', 'ch', 'es', 'it'];
  list.sort((a, b) => {
    const ia = priority.indexOf(a.id);
    const ib = priority.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });

  for (const country of list) {
    if (!force && alreadySchema2(country)) {
      console.log('skip', country.id, 'schema2');
      continue;
    }
    try {
      const { segments, stations, routes, tiles } = await fetchCountry(country);
      if (!segments.length && !stations.length && !routes.length) {
        writeFlatCountry(country, [], [], []);
        const dest = `public/geo/world/${country.id}-orm-rails.json`;
        const empty = JSON.parse(readFileSync(dest, 'utf8'));
        empty.empty = true;
        empty.count = 0;
        writeFileSync(dest, JSON.stringify(empty));
        console.warn('empty', country.id);
        continue;
      }
      if (TILED.has(country.id)) writeTiledCountry(country, tiles, segments, stations, routes);
      else writeFlatCountry(country, segments, stations, routes);
    } catch (e) {
      console.error('FAIL', country.id, e.message || e);
    }
    await sleep(2000);
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
