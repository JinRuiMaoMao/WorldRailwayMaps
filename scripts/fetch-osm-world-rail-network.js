/**
 * 各国全铁路 OSM（route=railway + 命名轨）→ public/geo/world/{id}-rail-network.json
 *   node scripts/fetch-osm-world-rail-network.js de fr jp
 *   node scripts/fetch-osm-world-rail-network.js all
 *   node scripts/fetch-osm-world-rail-network.js force de
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { WORLD_COUNTRIES } from '../src/data/worldCatalog.js';

const UA = 'chinasubwayplan/1.0 (world rail network; OSM)';
const SCHEMA = 1;
const OVERPASS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const SKIP_NAME =
  /地铁|地鐵|轻轨|輕軌|有轨电车|有軌電車|导轨|subway|light.?rail|\btram\b|monorail|观光|矿山|industrial|heritage/i;
const KEEP_IF_RAIL = /高铁|高速|铁路|鐵路|rail|railway|line$|線$|线$/i;
const HSR_NAME = /高铁|高速铁路|客运专线|high.?speed|shinkansen|新幹線|tgv|lgv|ice|ave|ktx|hsr|maglev/i;

const BIG = new Set(['us', 'ru', 'ca', 'br', 'au', 'in', 'id', 'mx', 'ar', 'kz', 'dz', 'cd', 'sd', 'de', 'fr', 'gb', 'es', 'it', 'pl', 'ua', 'tr', 'jp']);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hypotM(a, b) {
  return Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 85000);
}

function pathLen(path) {
  let m = 0;
  for (let i = 1; i < path.length; i++) m += hypotM(path[i - 1], path[i]);
  return m;
}

function simplify(coords, minM = 40) {
  if (coords.length < 3) return coords;
  const out = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    const p = out[out.length - 1];
    const c = coords[i];
    if (hypotM(p, c) >= minM) out.push(c);
  }
  out.push(coords[coords.length - 1]);
  return out;
}

function douglasPeucker(coords, tolM = 64) {
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
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const x = ax + dx * t - px;
    const y = ay + dy * t - py;
    return x * x + y * y;
  };
  const tol2 = tolM * tolM;
  while (stack.length) {
    const [i, j] = stack.pop();
    let maxD = 0;
    let maxK = i;
    const a = coords[i];
    const b = coords[j];
    for (let k = i + 1; k < j; k++) {
      const d = dist2(a, b, coords[k]);
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

function stitchChains(parts, nearM = 180) {
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
        const a0 = chain[0];
        const a1 = chain[chain.length - 1];
        const b0 = p[0];
        const b1 = p[p.length - 1];
        if (hypotM(a1, b0) < nearM) {
          chain = chain.concat(p.slice(1));
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (hypotM(a1, b1) < nearM) {
          chain = chain.concat(p.slice(0, -1).reverse());
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (hypotM(a0, b1) < nearM) {
          chain = p.slice(0, -1).concat(chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (hypotM(a0, b0) < nearM) {
          chain = p.slice(1).reverse().concat(chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
      }
    }
    chains.push(chain);
  }
  return chains;
}

function roundPath(path) {
  return path.map((p) => [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]);
}

function displayName(tags = {}, fallback = '') {
  const raw =
    tags['name:zh-Hans'] || tags['name:zh'] || tags['name:en'] || tags.name || tags.ref || fallback;
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function blobOf(tags = {}) {
  return `${tags.name || ''} ${tags['name:zh'] || ''} ${tags['name:en'] || ''} ${tags.ref || ''} ${tags.route || ''}`;
}

function isHsr(tags = {}, name = '') {
  if (tags.highspeed === 'yes' || tags.highspeed === '1') return true;
  if (tags.construction === 'highspeed' || tags.proposed === 'highspeed') return true;
  return HSR_NAME.test(`${name} ${blobOf(tags)}`);
}

function statusOf(tags = {}) {
  const st = String(tags.state || tags.status || '').toLowerCase();
  if (/proposed|planned|规划/.test(st) || tags.railway === 'proposed') return 'planned';
  if (/construction|在建/.test(st) || tags.railway === 'construction') return 'construction';
  return 'open';
}

function skipRelation(tags = {}) {
  if (!tags) return true;
  const blob = blobOf(tags);
  if (SKIP_NAME.test(blob) && !KEEP_IF_RAIL.test(blob)) return true;
  if (/subway|light_rail|tram|monorail/.test(String(tags.route || ''))) return true;
  if (tags.usage === 'tourism' || tags.usage === 'military' || tags.usage === 'industrial') return true;
  if (tags.service === 'yard' || tags.service === 'siding' || tags.service === 'spur') return true;
  return false;
}

function partsFromRel(el) {
  const parts = [];
  const skipRole = /^(stop|platform|station|facility|entry_only|exit_only)$/i;
  for (const m of el.members || []) {
    if (m.type !== 'way' || !m.geometry || m.geometry.length < 2) continue;
    if (m.role && skipRole.test(m.role)) continue;
    const coords = [];
    for (const g of m.geometry) {
      if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
      coords.push([g.lat, g.lon]);
    }
    if (coords.length < 2) continue;
    if (m.role === 'backward') coords.reverse();
    parts.push(coords);
  }
  return parts;
}

function refineChains(parts, highspeed) {
  const chains = stitchChains(parts, 180)
    .map((c) => simplify(douglasPeucker(c, highspeed ? 40 : 72), highspeed ? 24 : 48))
    .map(roundPath)
    .filter((c) => c.length >= 4);
  chains.sort((a, b) => pathLen(b) - pathLen(a) || b.length - a.length);
  const keep = chains.filter((c) => pathLen(c) >= (highspeed ? 800 : 1500) || c.length >= 8);
  return (keep.length ? keep : chains.slice(0, 2)).filter((c) => c.length >= 4);
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
        await sleep(500 + round * 900);
      } finally {
        clearTimeout(t);
      }
    }
  }
  throw last || new Error('overpass failed');
}

/** bbox: [west, south, east, north] → Overpass south,west,north,east */
function tilesFor(country) {
  const [w, s, e, n] = country.bbox;
  const maxSpan = BIG.has(country.id) ? 6 : 14;
  const tiles = [];
  for (let y = s; y < n; y += maxSpan) {
    for (let x = w; x < e; x += maxSpan) {
      tiles.push({
        south: y,
        west: x,
        north: Math.min(n, y + maxSpan),
        east: Math.min(e, x + maxSpan),
      });
    }
  }
  return tiles.length ? tiles : [{ south: s, west: w, north: n, east: e }];
}

async function collectIds(country) {
  const byId = new Map();
  for (const tile of tilesFor(country)) {
    const bbox = `${tile.south},${tile.west},${tile.north},${tile.east}`;
    try {
      const json = await overpass(
        `[out:json][timeout:75];
rel["type"="route"]["route"="railway"](${bbox});
out tags;`,
        70000
      );
      let add = 0;
      for (const el of json.elements || []) {
        if (el.type !== 'relation' || !el.id || !el.tags) continue;
        if (skipRelation(el.tags)) continue;
        // 必须有名称或编号，否则几何海量且难辨识
        if (!el.tags.name && !el.tags.ref && !el.tags['name:en'] && !el.tags['name:zh']) continue;
        if (!byId.has(el.id)) {
          byId.set(el.id, el.tags);
          add += 1;
        }
      }
      console.log('  tags', country.id, `+${add}`, 'total', byId.size);
    } catch (e) {
      console.warn('  tags fail', country.id, e.message || e);
    }
    await sleep(500);
  }
  return byId;
}

function lineKey(tags, id, status) {
  const name = displayName(tags, '');
  const ref = String(tags.ref || '').trim();
  const hs = isHsr(tags, name) ? 'hsr' : 'rail';
  if (name) return `${hs}|${status}|name:${name}`;
  if (ref) return `${hs}|${status}|ref:${ref}`;
  return `${hs}|${status}|id:${id}`;
}

async function collectTrainFallback(country, byId) {
  if (byId.size >= 40) return byId;
  for (const tile of tilesFor(country).slice(0, 8)) {
    const bbox = `${tile.south},${tile.west},${tile.north},${tile.east}`;
    try {
      const json = await overpass(
        `[out:json][timeout:60];
rel["type"="route"]["route"="train"]["name"](${bbox});
out tags;`,
        55000
      );
      for (const el of json.elements || []) {
        if (el.type !== 'relation' || !el.id || !el.tags) continue;
        if (skipRelation(el.tags)) continue;
        if (/subway|metro|underground|light.?rail|tram/i.test(blobOf(el.tags))) continue;
        if (!byId.has(el.id)) byId.set(el.id, el.tags);
      }
    } catch {
      /* ignore */
    }
    await sleep(400);
  }
  return byId;
}

async function fetchCountry(country) {
  console.log('rail-network', country.id, country.nameZh);
  let tagsById = await collectIds(country);
  tagsById = await collectTrainFallback(country, tagsById);
  // 优先高铁 / 有 ref 的干线，大国封顶避免 Overpass 拖死
  const ranked = [...tagsById.entries()].sort((a, b) => {
    const sa = (isHsr(a[1], displayName(a[1])) ? 4 : 0) + (a[1].ref ? 2 : 0) + (a[1].name ? 1 : 0);
    const sb = (isHsr(b[1], displayName(b[1])) ? 4 : 0) + (b[1].ref ? 2 : 0) + (b[1].name ? 1 : 0);
    return sb - sa;
  });
  // 真全网需要更多关系；分片抓取，大国仍封顶以免拖死
  const cap = BIG.has(country.id) ? 400 : 500;
  const ids = ranked.slice(0, cap).map(([id]) => id);
  console.log('  unique', tagsById.size, 'fetch', ids.length);
  const best = new Map();
  const chunk = 8;
  let fails = 0;
  for (let i = 0; i < ids.length; i += chunk) {
    const part = ids.slice(i, i + chunk);
    let got = false;
    for (let t = 0; t < 2 && !got; t++) {
      try {
        const json = await overpass(`[out:json][timeout:80]; rel(id:${part.join(',')}); out geom;`, 75000);
        for (const el of json.elements || []) {
          if (el.type !== 'relation' || !el.id) continue;
          const tags = el.tags || tagsById.get(el.id) || {};
          if (skipRelation(tags)) continue;
          const name = displayName(tags, `铁路 ${el.id}`);
          const highspeed = isHsr(tags, name);
          const status = statusOf(tags);
          const chains = refineChains(partsFromRel(el), highspeed);
          if (!chains.length) continue;
          const key = lineKey(tags, el.id, status);
          const score = chains.reduce((s, p) => s + pathLen(p), 0);
          const prev = best.get(key);
          if (prev && prev._score >= score) continue;
          best.set(key, {
            id: el.id,
            name,
            ref: tags.ref || '',
            highspeed,
            status,
            paths: chains,
            _score: score,
          });
        }
        got = true;
        fails = 0;
      } catch (e) {
        fails += 1;
        console.warn('  geom fail', Math.min(i + chunk, ids.length), e.message || e);
        await sleep(1200 * (t + 1));
      }
    }
    if (got) console.log('  geom', Math.min(i + chunk, ids.length), '/', ids.length, 'lines', best.size);
    if (fails >= 8) {
      console.warn('  too many fails, stop early with', best.size, 'lines');
      break;
    }
    if (i + chunk < ids.length) await sleep(280);
  }
  return [...best.values()]
    .map(({ _score, ...row }) => row)
    .sort((a, b) => Number(b.highspeed) - Number(a.highspeed) || a.name.localeCompare(b.name, 'en'));
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== 'force');
  const force = process.argv.includes('force');
  const ids = args.filter((a) => a !== 'all');
  const list =
    args.includes('all') || !ids.length
      ? WORLD_COUNTRIES.filter((c) => c.id !== 'cn')
      : WORLD_COUNTRIES.filter((c) => ids.includes(c.id));
  if (!list.length) {
    console.error('unknown country', ids.join(','));
    process.exit(1);
  }
  mkdirSync('public/geo/world', { recursive: true });
  // 大国优先
  const priority = ['de', 'fr', 'gb', 'jp', 'kr', 'es', 'it', 'in', 'us', 'ru', 'br', 'au', 'ca', 'pl', 'nl', 'be', 'at', 'ch', 'tr', 'ua'];
  list.sort((a, b) => {
    const ia = priority.indexOf(a.id);
    const ib = priority.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });

  for (const country of list) {
    const dest = `public/geo/world/${country.id}-rail-network.json`;
    if (!force && existsSync(dest)) {
      try {
        const prev = JSON.parse(readFileSync(dest, 'utf8'));
        const n = prev.count || prev.lines?.length || 0;
        if (n >= 1 && (prev.schema || 0) >= SCHEMA) {
          console.log('skip', country.id, n);
          continue;
        }
        console.log('retry empty/old', country.id);
      } catch {
        /* rewrite */
      }
    }
    try {
      const lines = await fetchCountry(country);
      const json = {
        generatedAt: new Date().toISOString(),
        schema: SCHEMA,
        country: country.id,
        attribution: '© OpenStreetMap contributors',
        count: lines.length,
        open: lines.filter((l) => l.status === 'open').length,
        construction: lines.filter((l) => l.status === 'construction').length,
        planned: lines.filter((l) => l.status === 'planned').length,
        highspeed: lines.filter((l) => l.highspeed).length,
        lines,
      };
      writeFileSync(dest, JSON.stringify(json));
      console.log('OK', dest, json.count, 'hsr', json.highspeed);
    } catch (e) {
      console.error('FAIL', country.id, e.message || e);
    }
    await sleep(5000);
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
