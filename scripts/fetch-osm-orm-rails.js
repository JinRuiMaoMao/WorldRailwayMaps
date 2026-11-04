/**
 * OpenRailwayMap 风格：按国拉取 railway=* 基础设施轨位
 *   node scripts/fetch-osm-orm-rails.js de fr jp
 *   node scripts/fetch-osm-orm-rails.js all
 *   node scripts/fetch-osm-orm-rails.js force nl
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { WORLD_COUNTRIES } from '../src/data/worldCatalog.js';

const UA = 'chinasubwayplan/1.0 (orm rails; OSM)';
const SCHEMA = 1;
const OVERPASS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const RAIL_RE = '^(rail|subway|light_rail|tram|narrow_gauge|monorail|funicular|highspeed)$';
const TRACK_KINDS = new Set(['rail', 'subway', 'light_rail', 'tram', 'narrow_gauge', 'monorail', 'funicular', 'highspeed']);
const SKIP_SERVICE = /^(yard|siding|spur|crossover|crossing|traverser|turntable)$/i;
const BIG = new Set(['us', 'ru', 'ca', 'br', 'au', 'in', 'id', 'mx', 'ar', 'kz', 'cn', 'de', 'fr', 'gb', 'es', 'it', 'pl', 'ua', 'tr', 'jp']);

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
        await sleep(600 + round * 1200);
      } finally {
        clearTimeout(t);
      }
    }
  }
  throw last || new Error('overpass failed');
}

const HUGE = new Set(['us', 'ru', 'ca', 'br', 'au', 'id', 'cn']);

/** country.bbox = [west, south, east, north] */
function tilesFor(country) {
  const [w, s, e, n] = country.bbox;
  const span = HUGE.has(country.id) ? 8 : BIG.has(country.id) ? 4 : 8;
  const tiles = [];
  for (let y = s; y < n - 1e-9; y += span) {
    for (let x = w; x < e - 1e-9; x += span) {
      tiles.push({
        south: y,
        west: x,
        north: Math.min(n, y + span),
        east: Math.min(e, x + span),
      });
    }
  }
  return tiles.length ? tiles : [{ south: s, west: w, north: n, east: e }];
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

async function fetchTile(tile) {
  const bbox = `${tile.south},${tile.west},${tile.north},${tile.east}`;
  const json = await overpass(
    `[out:json][timeout:90][maxsize:67108864];
(
  way["railway"~"${RAIL_RE}"](${bbox});
  way["railway"="construction"](${bbox});
  way["railway"="proposed"](${bbox});
);
out geom;`,
    95000
  );
  const segs = [];
  for (const el of json.elements || []) {
    const seg = wayToSeg(el);
    if (seg) segs.push(seg);
  }
  return segs;
}

async function fetchCountry(country) {
  console.log('orm', country.id, country.nameZh);
  const tiles = tilesFor(country);
  console.log('  tiles', tiles.length);
  const byId = new Map();
  let fails = 0;
  const cap = BIG.has(country.id) ? 12000 : 8000;
  const softCap = Math.floor(cap * 2.2);

  const stratifiedCap = (items, limit) => {
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
      rail: Math.floor(limit * 0.48),
      hs: Math.floor(limit * 0.14),
      urban: Math.floor(limit * 0.22),
      tram: Math.floor(limit * 0.12),
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
  };

  const prune = () => {
    if (byId.size <= softCap) return;
    const kept = stratifiedCap([...byId.values()], cap);
    byId.clear();
    for (const s of kept) byId.set(s.id, s);
  };

  for (let i = 0; i < tiles.length; i++) {
    try {
      const segs = await fetchTile(tiles[i]);
      for (const s of segs) if (!byId.has(s.id)) byId.set(s.id, s);
      prune();
      fails = 0;
      console.log('  tile', i + 1, '/', tiles.length, 'segs', byId.size);
    } catch (e) {
      fails += 1;
      console.warn('  tile fail', i + 1, e.message || e);
      if (fails >= 6) {
        console.warn('  too many fails, stop early');
        break;
      }
      await sleep(2000 * fails);
    }
    if (i + 1 < tiles.length) await sleep(BIG.has(country.id) ? 900 : 500);
  }

  return stratifiedCap([...byId.values()], cap);
}

function writeCountry(country, segments) {
  const dest = `public/geo/world/${country.id}-orm-rails.json`;
  const json = {
    generatedAt: new Date().toISOString(),
    schema: SCHEMA,
    country: country.id,
    attribution: '© OpenStreetMap contributors',
    count: segments.length,
    segments,
  };
  writeFileSync(dest, JSON.stringify(json));
  console.log('OK', dest, json.count);
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
  const priority = ['de', 'fr', 'jp', 'gb', 'nl', 'be', 'at', 'ch', 'kr', 'es', 'it', 'pl', 'us', 'in', 'ru'];
  list.sort((a, b) => {
    const ia = priority.indexOf(a.id);
    const ib = priority.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });

  for (const country of list) {
    const dest = `public/geo/world/${country.id}-orm-rails.json`;
    if (!force && existsSync(dest)) {
      try {
        const prev = JSON.parse(readFileSync(dest, 'utf8'));
        if ((prev.count || prev.segments?.length || 0) >= 20 && (prev.schema || 0) >= SCHEMA) {
          console.log('skip', country.id, prev.count || prev.segments.length);
          continue;
        }
      } catch {
        /* rewrite */
      }
    }
    try {
      const segs = await fetchCountry(country);
      if (!segs.length) {
        if (existsSync(dest)) {
          try {
            const prev = JSON.parse(readFileSync(dest, 'utf8'));
            if ((prev.count || prev.segments?.length || 0) > 0) {
              console.warn('keep previous nonempty', country.id);
              continue;
            }
          } catch {
            /* rewrite empty/corrupt */
          }
        }
        console.warn('skip empty write', country.id);
        continue;
      }
      writeCountry(country, segs);
    } catch (e) {
      console.error('FAIL', country.id, e.message || e);
    }
    await sleep(2500);
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
