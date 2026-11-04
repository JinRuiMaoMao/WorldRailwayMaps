/**
 * 从 OSM 补中国城市有轨/轻轨（不叠 ORM 瓦片）
 *   node scripts/fetch-osm-china-trams.js
 *   node scripts/fetch-osm-china-trams.js wuhan qingdao chengdu
 *   node scripts/fetch-osm-china-trams.js force all
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';

const UA = 'chinasubwayplan/1.0 (china trams; OSM)';
const SCHEMA = 1;
const OVERPASS = [
  'https://z.overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

/** 运营有轨/现代有轨城市（已在图库或可并入 {id}-osm-lines.json） */
const TRAM_CITIES = [
  { id: 'beijing', lat: 39.9, lng: 116.4, radius: 50000 },
  { id: 'shanghai', lat: 31.23, lng: 121.47, radius: 70000 },
  { id: 'guangzhou', lat: 23.13, lng: 113.26, radius: 45000 },
  { id: 'shenzhen', lat: 22.55, lng: 114.06, radius: 40000 },
  { id: 'wuhan', lat: 30.59, lng: 114.3, radius: 55000 },
  { id: 'nanjing', lat: 32.06, lng: 118.8, radius: 45000 },
  { id: 'shenyang', lat: 41.81, lng: 123.43, radius: 40000 },
  { id: 'changchun', lat: 43.82, lng: 125.32, radius: 35000 },
  { id: 'dalian', lat: 38.91, lng: 121.61, radius: 40000 },
  { id: 'chengdu', lat: 30.67, lng: 104.07, radius: 55000 },
  { id: 'suzhou', lat: 31.32, lng: 120.55, radius: 55000 },
  { id: 'foshan', lat: 23.02, lng: 113.12, radius: 40000 },
  { id: 'qingdao', lat: 36.2, lng: 120.4, radius: 45000 },
  { id: 'hongkong', lat: 22.32, lng: 114.17, radius: 28000 },
  { id: 'kaohsiung', lat: 22.63, lng: 120.3, radius: 35000 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hypotM(a, b) {
  return Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 85000);
}

function thin(coords, minM = 28) {
  if (coords.length < 3) return coords;
  const out = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    if (hypotM(out[out.length - 1], coords[i]) >= minM) out.push(coords[i]);
  }
  out.push(coords[coords.length - 1]);
  return out;
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
          chain = p.slice().reverse().slice(0, -1).concat(chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
      }
    }
    chains.push(chain);
  }
  chains.sort((a, b) => b.length - a.length);
  return thin(chains[0] || []);
}

function pathFromRelation(rel) {
  const parts = [];
  for (const m of rel.members || []) {
    if (m.type !== 'way' || !m.geometry?.length) continue;
    parts.push(m.geometry.map((g) => [g.lat, g.lon]));
  }
  return stitch(parts);
}

function pathLen(path) {
  let m = 0;
  for (let i = 1; i < path.length; i++) m += hypotM(path[i - 1], path[i]);
  return m;
}

/** 避免与地铁同号线合并 */
function tramLineKey(rawName, ref, relId) {
  const raw = String(rawName || ref || '').trim();
  if (!raw) return `有轨电车·${relId}`;
  let t = raw.replace(/（.*?）|\(.*?\)/g, '').trim();
  // 传统有轨：201路 / 54路
  const busLike = t.match(/^(\d{2,3})\s*路/);
  if (busLike) return `有轨电车${busLike[1]}路`;
  // L1 / T1 / THZ1
  const code = t.match(/\b(THZ?\d+|L\d+|T\d+|M-?TR)\b/i);
  if (code && /有轨|tram|光谷|车都|城阳|浑南|西郊|亦庄|高明|南海|麒麟|河西|黄埔|蓉|都江堰/i.test(t)) {
    return `有轨电车${code[1].toUpperCase()}`;
  }
  if (/有轨|tram|导轨|轻轨|西郊|浑南|光谷|城阳|黄埔|蓉2|都江堰|麒麟|河西/i.test(t)) {
    t = t.replace(
      /^(苏州|上海|天津|北京|南京|珠海|武汉|成都|青岛|深圳|淮安|佛山|沈阳|大连|长春|广州|高明|南海|高新|浑南|光谷|车都)?(有轨电车|有軌電車|现代有轨电车|导轨电车)?/i,
      ''
    );
    const numbered = t.match(/(\d+)\s*号线/);
    if (numbered) return `有轨电车${numbered[1]}号线`;
    const tref = t.match(/\bT\s*(\d+)\b/i);
    if (tref) return `有轨电车T${tref[1]}`;
    const cleaned = t.trim() || raw;
    if (!/有轨|tram/i.test(cleaned)) return `有轨电车${cleaned}`;
    return cleaned;
  }
  if (ref) return `有轨电车${ref}`;
  return `有轨电车·${relId}`;
}

function inCityBBox(path, city) {
  if (!path?.length) return false;
  let lat = 0;
  let lng = 0;
  for (const p of path) {
    lat += p[0];
    lng += p[1];
  }
  lat /= path.length;
  lng /= path.length;
  const r = (city.radius || 45000) / 111000;
  return Math.hypot(lat - city.lat, (lng - city.lng) * 0.85) <= r * 1.15;
}

async function overpass(query) {
  let last;
  for (const ep of OVERPASS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 100000);
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        return await res.json();
      } catch (e) {
        last = e;
        console.warn('  overpass fail', ep, e.message);
        await sleep(1800 * (attempt + 1));
      } finally {
        clearTimeout(timer);
      }
    }
  }
  throw last || new Error('overpass failed');
}

function queryTram(city) {
  const r = city.radius || 45000;
  return `[out:json][timeout:120];
(
  relation["route"="tram"](around:${r},${city.lat},${city.lng});
  relation["route"="light_rail"]["name"~"有轨|光谷|浑南|西郊|城阳|黄埔|THZ|蓉2|都江堰"](around:${r},${city.lat},${city.lng});
);
out geom;`;
}

function collectTramLines(elements, city) {
  const byKey = new Map();
  for (const el of elements || []) {
    if (el.type !== 'relation' || !el.tags) continue;
    const route = el.tags.route;
    if (route !== 'tram' && route !== 'light_rail') continue;
    const rawName = el.tags['name:zh'] || el.tags['name:zh-Hans'] || el.tags.name || '';
    const path = pathFromRelation(el);
    if (path.length < 2 || pathLen(path) < 400) continue;
    if (!inCityBBox(path, city)) continue;
    const key = tramLineKey(rawName, el.tags.ref, el.id);
    const next = {
      key,
      name: key,
      routeName: rawName || key,
      routeId: el.id,
      color: el.tags.colour || el.tags.color || '',
      source: 'OpenStreetMap',
      status: 'open',
      route: 'tram',
      routeKind: 'tram',
      path,
    };
    const prev = byKey.get(key);
    if (!prev || pathLen(next.path) > pathLen(prev.path)) byKey.set(key, next);
  }
  return [...byKey.values()];
}

function mergeIntoCityFile(cityId, tramLines) {
  const dest = `public/geo/${cityId}-osm-lines.json`;
  let prev = { city: cityId, lines: {}, attribution: '© OpenStreetMap contributors' };
  if (existsSync(dest)) {
    try {
      prev = JSON.parse(readFileSync(dest, 'utf8'));
    } catch {
      /* keep empty */
    }
  }
  const lines = { ...(prev.lines || {}) };
  let added = 0;
  let updated = 0;
  for (const line of tramLines) {
    const old = lines[line.key];
    if (!old?.path?.length) {
      lines[line.key] = line;
      added += 1;
      continue;
    }
    // 勿覆盖地铁同名；仅覆盖已有有轨或带 route=tram 的
    const oldTram =
      old.route === 'tram' ||
      old.routeKind === 'tram' ||
      /有轨|tram|导轨|西郊|浑南|光谷|城阳|黄埔/i.test(`${old.key} ${old.routeName || ''}`);
    if (!oldTram && !/^有轨/.test(line.key)) {
      const ek = `${line.key}·${line.routeId}`;
      if (!lines[ek]) {
        lines[ek] = { ...line, key: ek, name: ek };
        added += 1;
      }
      continue;
    }
    if (pathLen(line.path) > pathLen(old.path) * 0.92) {
      lines[line.key] = { ...old, ...line, color: line.color || old.color };
      updated += 1;
    }
  }
  const out = {
    ...prev,
    generatedAt: new Date().toISOString(),
    tramSchema: SCHEMA,
    attribution: '© OpenStreetMap contributors',
    lines,
  };
  writeFileSync(dest, JSON.stringify(out));
  return { dest, added, updated, total: Object.keys(lines).length, tram: tramLines.length };
}

async function fetchCity(city) {
  console.log('tram', city.id);
  const json = await overpass(queryTram(city));
  const tramLines = collectTramLines(json.elements, city);
  console.log(
    '  got',
    tramLines.length,
    tramLines.map((l) => `${l.key}(${Math.round(pathLen(l.path) / 1000)}km)`).join('、') || '(none)'
  );
  if (!tramLines.length) return { city: city.id, skipped: true };
  const merged = mergeIntoCityFile(city.id, tramLines);
  console.log('  merge', merged.dest, '+', merged.added, '~', merged.updated, 'lines', merged.total);
  return { city: city.id, ...merged };
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('force');
  const ids = args.filter((a) => a !== 'force' && a !== 'all');
  const list =
    args.includes('all') || !ids.length
      ? TRAM_CITIES
      : TRAM_CITIES.filter((c) => ids.includes(c.id));
  if (!list.length) {
    console.error('unknown city', ids.join(','));
    process.exit(1);
  }
  mkdirSync('public/geo', { recursive: true });
  const summary = [];
  for (const city of list) {
    const dest = `public/geo/${city.id}-osm-lines.json`;
    if (!force && existsSync(dest)) {
      try {
        const prev = JSON.parse(readFileSync(dest, 'utf8'));
        const tramN = Object.values(prev.lines || {}).filter((l) => {
          if (l?.route === 'tram' || l?.routeKind === 'tram') return true;
          const blob = `${l.key || ''} ${l.name || ''} ${l.routeName || ''}`;
          // 仅认「线名」含有轨，避免地铁线 routeName 里偶发地名误伤
          return /有轨|tram|西郊线|浑南|光谷有轨|城阳|THZ|蓉2|都江堰M/i.test(l.key || l.name || '') ||
            (/有轨电车|现代有轨|导轨电车/i.test(blob) && !/地铁/.test(blob));
        }).length;
        // 苏州等已手工补过的仍允许 force；默认对「已有≥1条有轨」跳过时可加 --only-missing
        if (args.includes('missing') && tramN >= 1) {
          console.log('skip', city.id, 'already', tramN, 'tram lines');
          continue;
        }
      } catch {
        /* fetch */
      }
    }
    try {
      summary.push(await fetchCity(city));
    } catch (e) {
      console.warn('FAIL', city.id, e.message || e);
      summary.push({ city: city.id, error: String(e.message || e) });
    }
    await sleep(1200);
  }
  console.log('done', JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
