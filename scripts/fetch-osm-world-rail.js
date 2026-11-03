/**
 * 世界高铁 OSM 真轨道 → public/geo/world/{id}-rail.json
 *   node scripts/fetch-osm-world-rail.js jp fr
 *   node scripts/fetch-osm-world-rail.js all
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { WORLD_RAIL_REGIONS } from '../src/data/worldCatalog.js';

const UA = 'chinasubwayplan/1.0 (world hsr; OSM)';
const ENDPOINTS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];
const HSR_NAME =
  'Shinkansen|新幹線|LGV|TGV|ICE|AVE|Italo|Eurostar|Thalys|KTX|高铁|고속|Acela|Brightline|HS1|HS2|Haramain|Whoosh|KCIC|Afrosiyob|YHT|Railjet|X2000|SJ Snabbtåg|Snabbtåg|Pendolino|Al Boraq|Ouigo|Frecciarossa|Avant|Alvia|SRT|Tren Maya|vande.?bharat|Sapsan|Сапсан|Gautrain|Etihad|Flytoget|Follobanen|Alfa Pendular|ETS|KLIA|Intercity.?Express|high.?speed|高速|高铁|高速鉄道';
const PALETTE = ['#1B6B4A', '#C0392B', '#1A5276', '#7D3C98', '#B9770E', '#117A65'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function colorFor(ref) {
  let h = 0;
  for (const ch of String(ref || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function simplify(coords, minM = 20) {
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

function douglasPeucker(coords, tolM = 32) {
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
        const near = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 2e-3;
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
  if (!chains.length) return [];
  const leftovers = chains.map((c) => c.slice());
  let merged = leftovers.shift();
  let linked = true;
  const join = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 0.02;
  while (linked) {
    linked = false;
    for (let i = 0; i < leftovers.length; i++) {
      const p = leftovers[i];
      const a0 = merged[0];
      const a1 = merged[merged.length - 1];
      const b0 = p[0];
      const b1 = p[p.length - 1];
      if (join(a1, b0)) {
        merged = merged.concat(p.slice(1));
        leftovers.splice(i, 1);
        linked = true;
        break;
      }
      if (join(a1, b1)) {
        merged = merged.concat(p.slice(0, -1).reverse());
        leftovers.splice(i, 1);
        linked = true;
        break;
      }
      if (join(a0, b1)) {
        merged = p.slice(0, -1).concat(merged);
        leftovers.splice(i, 1);
        linked = true;
        break;
      }
      if (join(a0, b0)) {
        merged = p.slice(1).reverse().concat(merged);
        leftovers.splice(i, 1);
        linked = true;
        break;
      }
    }
  }
  return merged;
}

function pathFromRel(el) {
  const parts = [];
  const skipRole = /^(stop|platform|station|facility|guidepost|entry_only|exit_only|hail_and_ride)$/i;
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
  if (!parts.length) return [];
  return simplify(douglasPeucker(stitch(parts), 32), 20);
}

async function overpass(query, timeoutMs = 90000) {
  let last;
  for (let round = 0; round < 3; round++) {
    for (const ep of ENDPOINTS) {
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
        await sleep(800 + round * 1600);
      } finally {
        clearTimeout(t);
      }
    }
  }
  throw last || new Error('overpass failed');
}

function lineKey(tags, id) {
  const ref = String(tags.ref || '').trim();
  if (ref) return `ref:${ref}`;
  const name = String(tags['name:en'] || tags.name || '')
    .replace(/[（(]?\s*(上り|下り|inbound|outbound|aller|retour|northbound|southbound)\s*[)）]?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return name ? `name:${name}` : `id:${id}`;
}

function displayName(tags, key) {
  return (
    tags['name:zh'] ||
    tags['name:zh-Hans'] ||
    tags['name:en'] ||
    String(tags.name || key)
      .replace(/[（(]?\s*(上り|下り|inbound|outbound)\s*[)）]?/gi, '')
      .trim() ||
    key
  );
}

function tagBlob(tags) {
  return `${tags.name || ''} ${tags.ref || ''} ${tags['name:en'] || ''} ${tags['name:zh'] || ''}`;
}

function regionKeep(region, tags) {
  if (!tags) return false;
  const blob = tagBlob(tags);
  const hs =
    tags.highspeed === 'yes' ||
    tags.highspeed === '1' ||
    tags.service === 'high_speed' ||
    tags.service === 'highspeed';
  const named = new RegExp(HSR_NAME, 'i').test(blob);
  const keepHit = region.keep ? region.keep.test(blob) : false;
  // highspeed 标签、全球高速名、或区域 keep 任一命中即可（此前误要求必须 hs|named，导致 Flytoget/X2000 等被丢）
  if (!(hs || named || keepHit)) return false;
  if (/siding|yard|connector|raccordement/i.test(blob) && !hs && !keepHit) return false;
  return true;
}

function centroidInRegion(path, region) {
  if (!path?.length) return false;
  let lat = 0;
  let lng = 0;
  for (const p of path) {
    lat += p[0];
    lng += p[1];
  }
  lat /= path.length;
  lng /= path.length;
  return lat >= region.south && lat <= region.north && lng >= region.west && lng <= region.east;
}

function collectLines(json, region) {
  const best = new Map();
  for (const el of json.elements || []) {
    if (el.type !== 'relation' || !el.tags) continue;
    if (!regionKeep(region, el.tags)) continue;
    const key = lineKey(el.tags, el.id);
    let path = [];
    try {
      path = pathFromRel(el);
    } catch {
      continue;
    }
    if (path.length < 2) continue;
    // 跨境高铁允许质心略出界
    if (!centroidInRegion(path, region)) {
      const pad = {
        south: region.south - 2.5,
        west: region.west - 2.5,
        north: region.north + 2.5,
        east: region.east + 2.5,
      };
      if (!centroidInRegion(path, pad)) continue;
    }
    const prev = best.get(key);
    if (prev && prev.path.length >= path.length) continue;
    best.set(key, {
      id: el.id,
      ref: el.tags.ref || key,
      name: displayName(el.tags, key),
      color: colorFor(el.tags.ref || key),
      path,
    });
  }
  return [...best.values()];
}

async function fetchRegion(region) {
  console.log('rail', region.id, region.nameZh);
  const { south, west, north, east } = region;
  const bbox = `${south},${west},${north},${east}`;
  const tagJson = await overpass(
    `[out:json][timeout:90];
(
  rel["type"="route"]["route"="train"]["highspeed"="yes"](${bbox});
  rel["type"="route"]["route"="railway"]["highspeed"="yes"](${bbox});
  rel["type"="route"]["route"="train"]["service"="high_speed"](${bbox});
  rel["type"="route"]["route"="railway"]["service"="high_speed"](${bbox});
  rel["type"="route"]["route"="train"]["name"~"${HSR_NAME}",i](${bbox});
  rel["type"="route"]["route"="railway"]["name"~"${HSR_NAME}",i](${bbox});
  rel["type"="route"]["route"="train"]["ref"~"${HSR_NAME}",i](${bbox});
);
out tags;`,
    70000
  );
  const pick = new Map();
  for (const el of tagJson.elements || []) {
    if (el.type !== 'relation' || !el.id || !regionKeep(region, el.tags)) continue;
    const key = lineKey(el.tags, el.id);
    // railway 关系优先，但 train 高速服务一并收
    if (el.tags.route === 'railway' || !pick.has(key)) pick.set(key, el.id);
  }
  const ids = [...pick.values()];
  console.log('  unique', ids.length, '/', (tagJson.elements || []).length);
  const elements = [];
  const chunk = 6;
  for (let i = 0; i < ids.length; i += chunk) {
    const part = ids.slice(i, i + chunk);
    try {
      const json = await overpass(`[out:json][timeout:90]; rel(id:${part.join(',')}); out geom;`, 80000);
      elements.push(...(json.elements || []));
      console.log('  geom', Math.min(i + chunk, ids.length), '/', ids.length);
    } catch (e) {
      console.warn('  chunk fail', e.message || e);
    }
    if (i + chunk < ids.length) await sleep(600);
  }
  const lines = collectLines({ elements }, region);
  console.log('  lines', lines.length);
  return {
    generatedAt: new Date().toISOString(),
    region: region.id,
    attribution: '© OpenStreetMap contributors',
    count: lines.length,
    lines,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== 'force');
  const force = process.argv.includes('force');
  const ids = args.filter((a) => a !== 'all');
  const list =
    args.includes('all') || !ids.length
      ? WORLD_RAIL_REGIONS
      : WORLD_RAIL_REGIONS.filter((r) => ids.includes(r.id));
  if (!list.length) {
    console.error('unknown region', ids.join(','));
    process.exit(1);
  }
  mkdirSync('public/geo/world', { recursive: true });
  for (const region of list) {
    if (region.id === 'cn' || region.id.startsWith('cn-')) {
      console.log('skip china rail', region.id);
      continue;
    }
    const dest = `public/geo/world/${region.id}-rail.json`;
    if (!force && existsSync(dest)) {
      try {
        const prev = JSON.parse(readFileSync(dest, 'utf8'));
        const n = prev.count || prev.lines?.length || 0;
        if (n >= 1) {
          console.log('skip', region.id, n);
          continue;
        }
        console.log('retry empty', region.id);
      } catch {
        /* rewrite */
      }
    }
    try {
      const data = await fetchRegion(region);
      writeFileSync(dest, JSON.stringify(data));
      console.log('OK', dest, data.count);
    } catch (e) {
      console.error('FAIL', region.id, e.message || e);
    }
    await sleep(3000);
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
