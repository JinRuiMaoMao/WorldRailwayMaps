/**
 * 中国铁路 OSM 真线位（已开通 + 在建/规划）→ public/geo/china-rail-network.json
 *   node scripts/fetch-osm-china-network.js
 *   node scripts/fetch-osm-china-network.js force
 *   node scripts/fetch-osm-china-network.js probe
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const UA = 'chinasubwayplan/1.0 (china rail network; OSM)';
const SCHEMA = 1;
const DEST = 'public/geo/china-rail-network.json';
const CACHE = 'public/geo/_china-rail-fetch.json';
const OVERPASS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const TILES = [
  { id: 'dongbei', s: 38.6, w: 118.4, n: 53.7, e: 135.1 },
  { id: 'huabei', s: 34.0, w: 109.2, n: 43.8, e: 120.6 },
  { id: 'huadong', s: 26.8, w: 115.4, n: 36.3, e: 123.3 },
  { id: 'huazhong', s: 24.6, w: 107.8, n: 34.9, e: 117.6 },
  { id: 'huanan', s: 17.9, w: 107.4, n: 26.3, e: 117.9 },
  { id: 'xinan', s: 21.0, w: 97.0, n: 35.1, e: 110.6 },
  { id: 'xibei', s: 31.4, w: 89.0, n: 43.2, e: 112.2 },
  { id: 'xinjiang', s: 34.0, w: 73.4, n: 49.4, e: 96.6 },
  { id: 'xizang', s: 26.8, w: 78.0, n: 37.0, e: 99.6 },
  { id: 'taiwan', s: 21.8, w: 119.2, n: 25.45, e: 122.15 },
];

const SKIP_NAME =
  /地铁|地鐵|轻轨|輕軌|有轨电车|有軌電車|导轨|雲巴|云巴|subway|light.?rail|\btram\b|monorail|观光小火车|矿山铁路/;
const KEEP_IF_RAIL = /高铁|高速铁路|客运专线|城际|鐵路|铁路|铁路局|线$|線$/;
const HSR_NAME = /高铁|高速铁路|客运专线|客专|城际铁路|城际|磁浮|maglev|high.?speed/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hypotM(a, b) {
  return Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 85000);
}

function pathLen(path) {
  let m = 0;
  for (let i = 1; i < path.length; i++) m += hypotM(path[i - 1], path[i]);
  return m;
}

function simplify(coords, minM = 28) {
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

function douglasPeucker(coords, tolM = 48) {
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

function stitchChains(parts, nearM = 160) {
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

function cleanName(s) {
  return String(s || '')
    .replace(/[（(]\s*(上行|下行|方向|出库|入库|往返|inner|outer|inbound|outbound)\s*[)）]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function displayName(tags = {}, fallback = '') {
  const raw =
    tags['name:zh-Hans'] ||
    tags['name:zh'] ||
    tags['name:zh-Hant'] ||
    tags.name ||
    tags.ref ||
    fallback;
  return cleanName(raw) || fallback;
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
  if (tags.construction && tags.construction !== 'no' && tags.railway === 'construction') return 'construction';
  if (tags.proposed && tags.proposed !== 'no' && tags.railway === 'proposed') return 'planned';
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

function skipWay(tags = {}) {
  if (!tags) return true;
  const blob = blobOf(tags);
  if (!tags.name && !tags.ref && !tags['name:zh']) return true;
  if (SKIP_NAME.test(blob) && !KEEP_IF_RAIL.test(blob)) return true;
  const kind = `${tags.railway || ''} ${tags.construction || ''} ${tags.proposed || ''}`;
  if (/subway|light_rail|tram|monorail/.test(kind) && !/rail|highspeed/.test(kind)) return true;
  if (tags.usage === 'tourism' || tags.usage === 'military') return true;
  return false;
}

function lineKey(tags, id, status) {
  const name = displayName(tags, '');
  const ref = String(tags.ref || '').trim();
  const hs = isHsr(tags, name) ? 'hsr' : 'rail';
  if (name) return `${hs}|${status}|name:${name}`;
  if (ref) return `${hs}|${status}|ref:${ref}`;
  return `${hs}|${status}|id:${id}`;
}

function partsFromRel(el) {
  const parts = [];
  for (const m of el.members || []) {
    if (m.type !== 'way' || !m.geometry || m.geometry.length < 2) continue;
    if (m.role && m.role !== '' && m.role !== 'forward' && m.role !== 'backward' && m.role !== 'route') continue;
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

function partsFromWays(els) {
  const parts = [];
  for (const el of els) {
    if (el.type !== 'way' || !el.geometry || el.geometry.length < 2) continue;
    const coords = [];
    for (const g of el.geometry) {
      if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
      coords.push([g.lat, g.lon]);
    }
    if (coords.length >= 2) parts.push(coords);
  }
  return parts;
}

function refineChains(parts, highspeed) {
  const chains = stitchChains(parts, 160)
    .map((c) => simplify(douglasPeucker(c, highspeed ? 36 : 64), highspeed ? 22 : 40))
    .map(roundPath)
    .filter((c) => c.length >= 4);
  chains.sort((a, b) => pathLen(b) - pathLen(a) || b.length - a.length);
  const keep = chains.filter((c) => pathLen(c) >= (highspeed ? 1200 : 2500) || c.length >= 10);
  return (keep.length ? keep : chains.slice(0, 1)).filter((c) => c.length >= 4);
}

async function overpass(query, timeoutMs = 90000) {
  let last;
  for (let round = 0; round < 3; round++) {
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
        await sleep(900 + round * 1600);
      } finally {
        clearTimeout(t);
      }
    }
  }
  throw last || new Error('overpass failed');
}

function loadCache() {
  try {
    if (!existsSync(CACHE)) return { schema: SCHEMA, rels: {}, ways: {}, relIds: [], wayGroups: [] };
    const j = JSON.parse(readFileSync(CACHE, 'utf8'));
    return {
      schema: SCHEMA,
      rels: j.rels || {},
      ways: j.ways || {},
      relIds: j.relIds || [],
      wayGroups: j.wayGroups || [],
    };
  } catch {
    return { schema: SCHEMA, rels: {}, ways: {}, relIds: [], wayGroups: [] };
  }
}

function saveCache(cache) {
  mkdirSync('public/geo', { recursive: true });
  writeFileSync(CACHE, JSON.stringify(cache));
}

async function collectRelationTags() {
  const byId = new Map();
  for (const tile of TILES) {
    const bbox = `${tile.s},${tile.w},${tile.n},${tile.e}`;
    console.log('tags rel', tile.id);
    try {
      const json = await overpass(
        `[out:json][timeout:90];
rel["type"="route"]["route"="railway"](${bbox});
out tags;`,
        85000
      );
      let n = 0;
      for (const el of json.elements || []) {
        if (el.type !== 'relation' || !el.id || !el.tags) continue;
        if (skipRelation(el.tags)) continue;
        if (!byId.has(el.id)) {
          byId.set(el.id, { id: el.id, tags: el.tags });
          n += 1;
        }
      }
      console.log('  keep', n, 'total', byId.size);
    } catch (e) {
      console.warn('  fail', tile.id, e.message || e);
    }
    await sleep(700);
  }
  return byId;
}

async function collectNamedWayTags() {
  const byId = new Map();
  for (const tile of TILES) {
    const bbox = `${tile.s},${tile.w},${tile.n},${tile.e}`;
    console.log('tags way', tile.id);
    try {
      const json = await overpass(
        `[out:json][timeout:90];
(
  way["railway"="construction"]["name"](${bbox});
  way["railway"="proposed"]["name"](${bbox});
);
out tags;`,
        85000
      );
      let n = 0;
      for (const el of json.elements || []) {
        if (el.type !== 'way' || !el.id || !el.tags) continue;
        if (skipWay(el.tags)) continue;
        if (!byId.has(el.id)) {
          byId.set(el.id, { id: el.id, tags: el.tags });
          n += 1;
        }
      }
      console.log('  keep', n, 'total', byId.size);
    } catch (e) {
      console.warn('  fail', tile.id, e.message || e);
    }
    await sleep(700);
  }
  return byId;
}

async function fetchRelGeom(ids, cache) {
  const chunk = 8;
  for (let i = 0; i < ids.length; i += chunk) {
    const part = ids.slice(i, i + chunk).filter((id) => !cache.rels[id]);
    if (!part.length) {
      if ((i / chunk) % 8 === 0) console.log('  geom rel', Math.min(i + chunk, ids.length), '/', ids.length, '(cache)');
      continue;
    }
    try {
      const json = await overpass(`[out:json][timeout:120]; rel(id:${part.join(',')}); out geom;`, 110000);
      for (const el of json.elements || []) {
        if (el.type !== 'relation' || !el.id) continue;
        const tags = el.tags || {};
        const name = displayName(tags, `铁路 ${el.id}`);
        const highspeed = isHsr(tags, name);
        const status = statusOf(tags);
        const chains = refineChains(partsFromRel(el), highspeed);
        if (!chains.length) continue;
        cache.rels[el.id] = {
          id: el.id,
          name,
          ref: tags.ref || '',
          highspeed,
          status,
          paths: chains,
        };
      }
      for (const id of part) {
        if (!cache.rels[id]) cache.rels[id] = { id, skip: true };
      }
      console.log('  geom rel', Math.min(i + chunk, ids.length), '/', ids.length);
      if (i % 24 === 0) saveCache(cache);
    } catch (e) {
      console.warn('  chunk fail', part.join(','), e.message || e);
    }
    await sleep(420);
  }
  saveCache(cache);
}

async function fetchWayGeom(groups, cache) {
  let done = 0;
  for (const g of groups) {
    const need = g.ids.filter((id) => !cache.ways[id]);
    const elements = [];
    const chunk = 40;
    for (let i = 0; i < need.length; i += chunk) {
      const part = need.slice(i, i + chunk);
      try {
        const json = await overpass(`[out:json][timeout:90]; way(id:${part.join(',')}); out geom;`, 85000);
        elements.push(...(json.elements || []));
      } catch (e) {
        console.warn('  way chunk fail', e.message || e);
      }
      await sleep(400);
    }
    for (const el of elements) {
      if (el?.id) cache.ways[el.id] = { id: el.id, tags: el.tags || {}, geometry: el.geometry || [] };
    }
    for (const id of need) {
      if (!cache.ways[id]) cache.ways[id] = { id, skip: true };
    }
    done += 1;
    if (done % 15 === 0) {
      console.log('  geom way groups', done, '/', groups.length);
      saveCache(cache);
    }
  }
  saveCache(cache);
}

function assemble(cache, relMeta, wayGroups) {
  const best = new Map();
  const put = (row) => {
    if (!row?.paths?.length) return;
    const key = lineKey(
      { name: row.name, ref: row.ref, highspeed: row.highspeed ? 'yes' : undefined },
      row.id,
      row.status
    );
    const prev = best.get(key);
    const score = row.paths.reduce((s, p) => s + pathLen(p), 0);
    if (prev && prev._score >= score) return;
    best.set(key, { ...row, _score: score });
  };

  for (const row of Object.values(cache.rels)) {
    if (row.skip || !row.paths) continue;
    put(row);
  }

  const named = new Set(
    [...best.values()].map((r) => String(r.name || '').replace(/高速铁路|高铁|客运专线|铁路|鐵路/g, ''))
  );

  for (const g of wayGroups) {
    const els = g.ids.map((id) => cache.ways[id]).filter((w) => w && !w.skip && w.geometry);
    const tags = g.tags;
    const name = displayName(tags, g.name);
    const stem = name.replace(/高速铁路|高铁|客运专线|铁路|鐵路|在建|规划/g, '');
    if (stem && named.has(stem)) continue;
    const highspeed = isHsr(tags, name);
    const status = statusOf(tags) === 'open' ? (tags.railway === 'construction' ? 'construction' : 'planned') : statusOf(tags);
    const chains = refineChains(partsFromWays(els), highspeed);
    if (!chains.length) continue;
    put({
      id: `way:${g.ids[0]}`,
      name,
      ref: tags.ref || '',
      highspeed,
      status,
      paths: chains,
    });
  }

  return [...best.values()]
    .map(({ _score, ...row }) => ({
      id: row.id,
      name: row.name,
      ref: row.ref || '',
      highspeed: !!row.highspeed,
      status: row.status || 'open',
      paths: row.paths,
    }))
    .sort((a, b) => Number(b.highspeed) - Number(a.highspeed) || a.name.localeCompare(b.name, 'zh-CN'));
}

async function main() {
  const force = process.argv.includes('force');
  const probe = process.argv.includes('probe');
  mkdirSync('public/geo', { recursive: true });

  if (!force && !probe && existsSync(DEST)) {
    try {
      const prev = JSON.parse(readFileSync(DEST, 'utf8'));
      if ((prev.schema || 0) >= SCHEMA && (prev.count || prev.lines?.length || 0) >= 200) {
        console.log('skip existing', prev.count || prev.lines.length);
        return;
      }
    } catch {
      /* rewrite */
    }
  }

  const rels = await collectRelationTags();
  console.log('relations', rels.size);
  if (probe) {
    const wayTags = await collectNamedWayTags();
    console.log('named construction/proposed ways', wayTags.size);
    const sample = [...rels.values()].slice(0, 12).map((r) => displayName(r.tags, r.id));
    console.log('sample', sample.join(' · '));
    return;
  }

  const cache = loadCache();
  await fetchRelGeom([...rels.keys()], cache);

  const wayTags = await collectNamedWayTags();
  const groupsMap = new Map();
  for (const w of wayTags.values()) {
    const name = displayName(w.tags, '');
    if (!name) continue;
    const key = `${statusOf(w.tags)}|${name}`;
    if (!groupsMap.has(key)) groupsMap.set(key, { name, tags: w.tags, ids: [] });
    groupsMap.get(key).ids.push(w.id);
  }
  const groups = [...groupsMap.values()].filter((g) => g.ids.length >= 1);
  console.log('way groups', groups.length);
  await fetchWayGeom(groups, cache);

  const lines = assemble(cache, rels, groups);
  const json = {
    generatedAt: new Date().toISOString(),
    schema: SCHEMA,
    attribution: '© OpenStreetMap contributors',
    count: lines.length,
    open: lines.filter((l) => l.status === 'open').length,
    construction: lines.filter((l) => l.status === 'construction').length,
    planned: lines.filter((l) => l.status === 'planned').length,
    highspeed: lines.filter((l) => l.highspeed).length,
    lines,
  };
  writeFileSync(DEST, JSON.stringify(json));
  console.log(
    'OK',
    DEST,
    'lines',
    json.count,
    'open',
    json.open,
    'build',
    json.construction,
    'plan',
    json.planned,
    'hsr',
    json.highspeed
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
