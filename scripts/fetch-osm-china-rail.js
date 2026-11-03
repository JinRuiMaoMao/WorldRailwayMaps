/**
 * 按 OpenRailwayMap 关系 ID / 精确路名拉取 1865–1910 干线 OSM 线位
 * 用法: node scripts/fetch-osm-china-rail.js
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const UA = 'chinasubwayplan/1.0 (railway history demo)';
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const BATCHES = [
  { key: '京哈线', id: 198494, aliases: ['京奉铁路'] },
  { key: '津山线', id: 3006633, aliases: ['唐胥铁路', '唐芦铁路', '唐津铁路', '津榆铁路'] },
  { key: '沈山线', name: '沈山线', aliases: ['关内外铁路', '新奉铁路'] },
  { key: '京沪线', id: 163022, aliases: ['沪宁铁路', '津浦铁路'] },
  { key: '京广线', id: 193064, aliases: ['京汉铁路'] },
  { key: '胶济线', id: 356828, aliases: ['胶济铁路'] },
  { key: '京包线', id: 11543971, aliases: ['京张铁路'] },
  { key: '滨洲线', id: 538674, aliases: ['东省铁路西'] },
  { key: '滨绥线', id: 1656856, aliases: ['东省铁路东'] },
  { key: '哈大线', name: '哈大线', aliases: ['南满支线', '南满铁路'] },
  { key: '沈大线', name: '沈大线', aliases: ['南满支线'] },
  { key: '沈丹线', name: '沈丹线', aliases: ['安奉铁路'] },
  { key: '广茂线', name: '广茂线', aliases: ['广三铁路'] },
  { key: '沪昆线', id: 14031196, aliases: ['沪杭铁路', '株萍铁路'] },
  { key: '石太线', id: 1953505, aliases: ['正太铁路'] },
  { key: '陇海线', name: '陇海线', aliases: ['汴洛铁路'] },
  { key: '新月线', name: '新月线', aliases: ['道清铁路'] },
  { key: '新焦线', name: '新焦线', aliases: ['道清铁路'] },
  { key: '昆河铁路', name: '昆河铁路', aliases: ['滇越铁路'] },
  { key: '京九线', id: 162982, aliases: ['南浔铁路'] },
  { key: '南浔铁路', name: '南浔铁路', aliases: ['南浔铁路'] },
  { key: '纵贯线', name: '縱貫線', aliases: ['台湾铁路', '纵贯铁路'] },
  { key: '武九线', name: '武九线', aliases: ['大冶铁路'] },
  { key: '淞沪铁路', name: '淞沪铁路', aliases: ['吴淞铁路', '淞沪铁路', '淞沪支线'], ways: true },
  { key: '高易铁路', name: '高易铁路', aliases: ['西陵铁路'], ways: true },
  { key: '潮汕铁路', name: '潮汕铁路', aliases: ['潮汕铁路'], ways: true },
  { key: '新宁铁路', name: '新宁铁路', aliases: ['新宁铁路'], ways: true },
  { key: '漳厦铁路', name: '漳厦铁路', aliases: ['漳厦铁路'], ways: true },
  { key: '平齐线', id: 1565503, aliases: ['齐昂铁路'] },
  { key: '旅顺线', name: '旅顺线', aliases: ['南满支线'] },
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
        const near = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 4e-4;
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

function thin(coords, minM = 80) {
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

function pathFromRelation(rel) {
  const parts = [];
  for (const m of rel.members || []) {
    if (m.type !== 'way' || !m.geometry?.length) continue;
    if (m.role && !['', 'forward', 'backward', 'route'].includes(m.role)) continue;
    const coords = m.geometry.map((g) => [g.lat, g.lon]);
    if (coords.length < 2) continue;
    if (m.role === 'backward') coords.reverse();
    parts.push(coords);
  }
  return thin(stitch(parts), 80);
}

function pathFromWays(elements) {
  const parts = [];
  for (const el of elements || []) {
    if (el.type !== 'way' || !el.geometry?.length) continue;
    const coords = el.geometry.map((g) => [g.lat, g.lon]);
    if (coords.length >= 2) parts.push(coords);
  }
  return thin(stitch(parts), 40);
}

function queryFor(batch) {
  if (batch.id) {
    return `[out:json][timeout:90];
relation(${batch.id});
out geom;`;
  }
  const name = batch.name;
  const ways = batch.ways
    ? `
  way["railway"~"rail|abandoned|disused|narrow_gauge"]["name"="${name}"];
  way["railway"~"rail|abandoned|disused|narrow_gauge"]["name:zh"="${name}"];`
    : '';
  return `[out:json][timeout:90];
(
  relation["route"="railway"]["name"="${name}"];
  relation["route"="train"]["name"="${name}"];
  relation["name"="${name}"]["type"="route"];${ways}
);
out geom;`;
}

async function overpass(query) {
  let lastErr;
  for (const ep of ENDPOINTS) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 95000);
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: ac.signal,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      console.warn('  fail', ep.split('/')[2], e.message);
      await sleep(1500);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr || new Error('overpass failed');
}

async function fetchBatch(batch) {
  console.log('rail', batch.key, batch.id ? `#${batch.id}` : batch.name);
  const json = await overpass(queryFor(batch));
  const rels = (json.elements || []).filter((el) => el.type === 'relation');
  let best = null;
  for (const rel of rels) {
    const path = pathFromRelation(rel);
    if (path.length < 2) continue;
    if (!best || path.length > best.path.length) {
      best = {
        routeName: rel.tags?.name || batch.key,
        routeId: rel.id,
        color: rel.tags?.colour || rel.tags?.color || '',
        path,
      };
    }
  }
  if ((!best || best.path.length < 8) && batch.ways) {
    const wayPath = pathFromWays(json.elements);
    if (wayPath.length > (best?.path.length || 0)) {
      best = { routeName: batch.key, routeId: null, color: '', path: wayPath };
    }
  }
  if (!best?.path?.length) {
    console.warn('  EMPTY');
    return null;
  }
  console.log('  ok', best.routeName, 'pts', best.path.length);
  return {
    key: batch.key,
    name: batch.key,
    routeName: best.routeName,
    routeId: best.routeId,
    color: best.color,
    source: 'OpenStreetMap',
    aliases: batch.aliases,
    path: best.path,
  };
}

async function main() {
  mkdirSync('public/geo', { recursive: true });
  const dest = 'public/geo/china-rail-osm-lines.json';
  let lines = {};
  if (existsSync(dest)) {
    try {
      lines = JSON.parse(readFileSync(dest, 'utf8')).lines || {};
      console.log('resume', Object.keys(lines).length, 'existing');
    } catch {
      lines = {};
    }
  }
  for (const batch of BATCHES) {
    if (lines[batch.key]?.path?.length >= 2 && process.argv[2] !== 'force') {
      console.log('skip', batch.key, lines[batch.key].path.length);
      continue;
    }
    try {
      const line = await fetchBatch(batch);
      if (line) {
        lines[batch.key] = line;
        writeFileSync(
          dest,
          JSON.stringify({
            generatedAt: new Date().toISOString(),
            attribution: '© OpenStreetMap contributors',
            lines,
          })
        );
      }
    } catch (e) {
      console.error('FAIL', batch.key, e.message);
    }
    await sleep(2500);
  }
  console.log('done', Object.keys(lines).length, '/', BATCHES.length);
  for (const [k, v] of Object.entries(lines)) {
    console.log(' ', k, v.path.length, v.routeName);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
