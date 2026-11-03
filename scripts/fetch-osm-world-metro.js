/**
 * 世界城轨 OSM 线位 → public/geo/world/{id}-metro.json
 *   node scripts/fetch-osm-world-metro.js tokyo london nyc
 *   node scripts/fetch-osm-world-metro.js all
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { WORLD_CITIES } from '../src/data/worldCatalog.js';
import { stitchTyped, wayKind, mapKindToPath } from '../src/data/guideway.js';

const UA = 'chinasubwayplan/1.0 (world metro; OSM)';
const ENDPOINTS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
        const near = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 2e-4;
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

function thin(coords, minM = 12) {
  if (coords.length < 3) return coords;
  const out = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    const p = out[out.length - 1];
    const c = coords[i];
    if (Math.hypot((c[0] - p[0]) * 111000, (c[1] - p[1]) * 85000) >= minM) out.push(c);
  }
  out.push(coords[coords.length - 1]);
  return out;
}

function pathFromRelation(rel, wayTags) {
  const parts = [];
  const fallback = rel.tags?.route === 'monorail' || rel.tags?.route === 'tram' ? 'elevated' : 'tunnel';
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
    const tags = wayTags.get(m.ref) || m.tags || {};
    parts.push({ coords, kind: wayKind(tags, { defaultKind: fallback }) });
  }
  const raw = stitchTyped(parts);
  const path = thin(raw.path.length ? raw.path : stitch(parts.map((p) => p.coords)));
  return { path, kind: mapKindToPath(raw.path, raw.kind, path) };
}

function lineName(tags) {
  return tags['name:zh'] || tags['name:en'] || tags.name || tags.ref || '';
}

function collectLines(elements) {
  const wayTags = new Map();
  for (const el of elements || []) {
    if (el.type === 'way' && el.id && el.tags) wayTags.set(el.id, el.tags);
  }
  const byKey = new Map();
  for (const el of elements || []) {
    if (el.type !== 'relation' || !el.tags) continue;
    const route = el.tags.route;
    const ok = ['subway', 'light_rail', 'monorail', 'tram'];
    if (collectLines.suburban) ok.push('train');
    if (!ok.includes(route)) continue;
    if (el.tags.highspeed === 'yes') continue;
    const name = lineName(el.tags);
    const key = name || `rel-${el.id}`;
    let drawn;
    try {
      drawn = pathFromRelation(el, wayTags);
    } catch {
      continue;
    }
    if (drawn.path.length < 4) continue;
    const next = {
      key,
      name: name || key,
      color: el.tags.colour || el.tags.color || '',
      path: drawn.path,
      kind: drawn.kind,
      status: 'open',
    };
    const prev = byKey.get(key);
    if (!prev || next.path.length > prev.path.length) byKey.set(key, next);
  }
  return Object.fromEntries(byKey);
}

async function overpass(query) {
  let last;
  for (const ep of ENDPOINTS) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 90000);
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
      await sleep(1200);
    } finally {
      clearTimeout(t);
    }
  }
  throw last || new Error('overpass failed');
}

function queryFor(city) {
  const r = city.radius || 35000;
  const tram = city.tram ? `rel["type"="route"]["route"="tram"](around:${r},${city.lat},${city.lng});` : '';
  const train = city.suburban ? `rel["type"="route"]["route"="train"](around:${r},${city.lat},${city.lng});` : '';
  return `[out:json][timeout:120];
(
  rel["type"="route"]["route"="subway"](around:${r},${city.lat},${city.lng});
  rel["type"="route"]["route"="metro"](around:${r},${city.lat},${city.lng});
  rel["type"="route"]["route"="light_rail"](around:${r},${city.lat},${city.lng});
  rel["type"="route"]["route"="monorail"](around:${r},${city.lat},${city.lng});
  rel["type"="route"]["route"="funicular"](around:${r},${city.lat},${city.lng});
  ${tram}
  ${train}
);
out geom;
way(r);
out tags;`;
}

async function fetchCity(city) {
  console.log('metro', city.id, city.nameZh);
  const json = await overpass(queryFor(city));
  collectLines.suburban = !!city.suburban;
  const lines = collectLines(json.elements);
  collectLines.suburban = false;
  const n = Object.keys(lines).length;
  console.log('  lines', n);
  return {
    generatedAt: new Date().toISOString(),
    city: city.id,
    attribution: '© OpenStreetMap contributors',
    noMetro: n === 0,
    lines,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== 'force');
  const force = process.argv.includes('force');
  const ids = args.filter((a) => a !== 'all');
  const list =
    args.includes('all') || !ids.length
      ? WORLD_CITIES
      : WORLD_CITIES.filter((c) => ids.includes(c.id));
  if (!list.length) {
    console.error('unknown city', ids.join(','));
    process.exit(1);
  }
  mkdirSync('public/geo/world', { recursive: true });
  let ok = 0;
  for (const city of list) {
    if (city.country === 'cn') {
      console.log('skip china', city.id);
      continue;
    }
    const dest = `public/geo/world/${city.id}-metro.json`;
    if (!force && existsSync(dest)) {
      try {
        const prev = JSON.parse(readFileSync(dest, 'utf8'));
        if (prev.noMetro || Object.keys(prev.lines || {}).length >= 1) {
          console.log('skip', city.id, prev.noMetro ? 'no-metro' : Object.keys(prev.lines).length);
          ok += 1;
          continue;
        }
      } catch {
        /* rewrite */
      }
    }
    try {
      const data = await fetchCity(city);
      writeFileSync(dest, JSON.stringify(data));
      console.log(data.noMetro ? 'EMPTY' : 'OK', dest, Object.keys(data.lines).length);
      ok += 1;
    } catch (e) {
      console.error('FAIL', city.id, e.message || e);
    }
    await sleep(2500);
  }
  console.log('done', ok, '/', list.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
