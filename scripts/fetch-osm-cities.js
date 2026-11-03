/**
 * 从 Overpass 拉取各城地铁 / 轻轨 / 单轨真实线位，写入 public/geo/{city}-osm-lines.json
 * 用法:
 *   node scripts/fetch-osm-cities.js [cityId|all]
 *   node scripts/fetch-osm-cities.js planned [cityId|all]   只拉规划/在建并并入已有文件
 *   node scripts/fetch-osm-cities.js force [cityId]         强制重拉运营线
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { stitchTyped, wayKind, mapKindToPath } from '../src/data/guideway.js';

const UA = 'chinasubwayplan/1.0 (railway history demo)';
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const CITIES = [
  { id: 'beijing', area: '北京市', lat: 39.90, lng: 116.40, radius: 80000 },
  { id: 'shanghai', area: '上海市', lat: 31.23, lng: 121.47, radius: 70000, tram: true },
  { id: 'tianjin', area: '天津市', lat: 39.13, lng: 117.2 },
  { id: 'chongqing', area: '重庆市', lat: 29.56, lng: 106.55 },
  { id: 'guangzhou', area: '广州市', lat: 23.13, lng: 113.26 },
  { id: 'shenzhen', area: '深圳市', lat: 22.55, lng: 114.06 },
  { id: 'nanjing', area: '南京市', lat: 32.06, lng: 118.8 },
  { id: 'wuhan', area: '武汉市', lat: 30.59, lng: 114.3 },
  { id: 'chengdu', area: '成都市', lat: 30.67, lng: 104.07 },
  { id: 'hangzhou', area: '杭州市', lat: 30.27, lng: 120.16 },
  { id: 'xian', area: '西安市', lat: 34.26, lng: 108.94 },
  { id: 'suzhou', area: '苏州市', lat: 31.3, lng: 120.62 },
  { id: 'qingdao', area: '青岛市', lat: 36.07, lng: 120.38 },
  { id: 'zhengzhou', area: '郑州市', lat: 34.75, lng: 113.66 },
  { id: 'changsha', area: '长沙市', lat: 28.23, lng: 112.94 },
  { id: 'hefei', area: '合肥市', lat: 31.82, lng: 117.23 },
  { id: 'nanchang', area: '南昌市', lat: 28.68, lng: 115.86 },
  { id: 'nanning', area: '南宁市', lat: 22.82, lng: 108.37 },
  { id: 'jinan', area: '济南市', lat: 36.65, lng: 117.12 },
  { id: 'shijiazhuang', area: '石家庄市', lat: 38.04, lng: 114.51 },
  { id: 'kunming', area: '昆明市', lat: 25.04, lng: 102.71 },
  { id: 'fuzhou', area: '福州市', lat: 26.08, lng: 119.3 },
  { id: 'ningbo', area: '宁波市', lat: 29.87, lng: 121.54 },
  { id: 'wuxi', area: '无锡市', lat: 31.57, lng: 120.3 },
  { id: 'dongguan', area: '东莞市', lat: 23.02, lng: 113.75 },
  { id: 'hongkong', area: '香港', lat: 22.32, lng: 114.17 },
  { id: 'changchun', area: '长春市', lat: 43.82, lng: 125.32, radius: 50000 },
  { id: 'dalian', area: '大连市', lat: 38.91, lng: 121.61, radius: 70000 },
  { id: 'shenyang', area: '沈阳市', lat: 41.81, lng: 123.43, radius: 50000 },
  { id: 'foshan', area: '佛山市', lat: 23.02, lng: 113.12, radius: 40000, tram: true },
  { id: 'taipei', area: '台北', lat: 25.03, lng: 121.57, radius: 40000 },
  { id: 'kaohsiung', area: '高雄', lat: 22.63, lng: 120.30, radius: 40000, tram: true },
  { id: 'harbin', area: '哈尔滨市', lat: 45.80, lng: 126.53, radius: 45000 },
  { id: 'xiamen', area: '厦门市', lat: 24.48, lng: 118.09, radius: 55000 },
  { id: 'guiyang', area: '贵阳市', lat: 26.65, lng: 106.63, radius: 55000 },
  { id: 'urumqi', area: '乌鲁木齐市', lat: 43.83, lng: 87.62, radius: 45000 },
  { id: 'wenzhou', area: '温州市', lat: 27.99, lng: 120.70, radius: 85000 },
  { id: 'lanzhou', area: '兰州市', lat: 36.06, lng: 103.83, radius: 45000 },
  { id: 'xuzhou', area: '徐州市', lat: 34.20, lng: 117.28, radius: 40000 },
  { id: 'changzhou', area: '常州市', lat: 31.81, lng: 119.97, radius: 35000 },
  { id: 'hohhot', area: '呼和浩特市', lat: 40.84, lng: 111.75, radius: 40000 },
  { id: 'macau', area: '澳门', lat: 22.20, lng: 113.54, radius: 18000, tram: true },
  { id: 'taiyuan', area: '太原市', lat: 37.87, lng: 112.55, radius: 40000 },
  { id: 'luoyang', area: '洛阳市', lat: 34.62, lng: 112.45, radius: 35000 },
  { id: 'taichung', area: '台中', lat: 24.15, lng: 120.67, radius: 30000 },
  { id: 'shaoxing', area: '绍兴市', lat: 30.05, lng: 120.58, radius: 55000 },
  { id: 'wuhu', area: '芜湖市', lat: 31.33, lng: 118.38, radius: 35000 },
  { id: 'jinhua', area: '金华市', lat: 29.08, lng: 119.65, radius: 65000 },
  { id: 'nantong', area: '南通市', lat: 32.02, lng: 120.86, radius: 40000 },
  { id: 'taizhouzj', area: '台州市', lat: 28.66, lng: 121.42, radius: 55000 },
  { id: 'chuzhou', area: '滁州市', lat: 32.30, lng: 118.32, radius: 55000 },
  { id: 'xuchang', area: '许昌市', lat: 34.02, lng: 113.83, radius: 60000 },
  { id: 'ziyang', area: '资阳市', lat: 30.12, lng: 104.64, radius: 55000 },
  { id: 'taoyuan', area: '桃园', lat: 24.99, lng: 121.30, radius: 45000 },
  { id: 'haining', area: '海宁市', lat: 30.51, lng: 120.68, radius: 45000 },
  { id: 'maanshan', area: '马鞍山市', lat: 31.67, lng: 118.51, radius: 45000 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalizeLineName(name) {
  if (!name) return '';
  let s = String(name)
    .replace(/（.*?）|\(.*?\)/g, '')
    .replace(
      /^(北京|上海|天津|重庆|广州|深圳|南京|武汉|成都|杭州|西安|苏州|青岛|郑州|长沙|合肥|南昌|南宁|济南|石家庄|昆明|福州|宁波|无锡|东莞|香港|沈阳|大连|长春|佛山|台北|臺北|高雄|哈尔滨|厦门|贵阳|乌鲁木齐|温州|兰州|徐州|常州|呼和浩特|澳门|澳門|太原|洛阳|台中|臺中|绍兴|芜湖|金华|南通|台州|滁州|许昌|资阳|桃园|桃園|海宁|马鞍山)?(地铁|地鐵|轨道交通|軌道交通|轨交|港铁|捷运|捷運|轻轨|輕軌|市域铁路|机场捷运|MTR)?/i,
      ''
    )
    .replace(/^地铁|^轨道交通/, '')
    .trim();
  const numbered = s.match(/(\d+\s*号线)/);
  if (numbered) return numbered[1].replace(/\s+/g, '');
  const en = s.match(/line\s*(\d+)/i);
  if (en) return `${en[1]}号线`;
  return s;
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

/** 仅去掉极近重复点，尽量保留 OSM 走向 */
function thin(coords, minM = 8) {
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

function pathFromRelation(rel, wayTags = new Map()) {
  const parts = [];
  const fallback = rel.tags?.route === 'monorail' || rel.tags?.route === 'tram' ? 'elevated' : 'tunnel';
  for (const m of rel.members || []) {
    if (m.type !== 'way' || !m.geometry?.length) continue;
    if (m.role && !['', 'forward', 'backward', 'route'].includes(m.role)) continue;
    const coords = m.geometry.map((g) => [g.lat, g.lon]);
    if (coords.length < 2) continue;
    if (m.role === 'backward') coords.reverse();
    const tags = wayTags.get(m.ref) || m.tags || {};
    parts.push({ coords, kind: wayKind(tags, { defaultKind: fallback }) });
  }
  const raw = stitchTyped(parts);
  const path = thin(raw.path);
  return { path, kind: mapKindToPath(raw.path, raw.kind, path) };
}

function aroundOrArea(city, tagClause) {
  if (city.lat != null && city.lng != null) {
    const r = city.radius || 45000;
    return `  relation${tagClause}(around:${r},${city.lat},${city.lng});`;
  }
  return `  relation${tagClause}(area.a);`;
}

function queryFor(city, withStops = true, mode = 'open') {
  const tram = city.tram ? aroundOrArea(city, '["route"="tram"]') : '';
  const extras =
    city.id === 'shanghai'
      ? aroundOrArea(city, '["route"~"^(train|light_rail)$"]["name"~"金山铁路|金山线|市域机场线|机场联络线"]')
      : '';
  const open = [
    aroundOrArea(city, '["route"="subway"]'),
    aroundOrArea(city, '["route"="light_rail"]'),
    aroundOrArea(city, '["route"="monorail"]'),
    tram,
    extras,
  ]
    .filter(Boolean)
    .join('\n');
  const wayAround =
    city.lat != null && city.lng != null
      ? (tag) => `  way${tag}(around:${city.radius || 45000},${city.lat},${city.lng});`
      : (tag) => `  way${tag}(area.a);`;
  const planned = [
    aroundOrArea(city, '["route"="proposed"]["proposed"~"subway|light_rail|monorail|tram"]'),
    aroundOrArea(city, '["route"="construction"]["construction"~"subway|light_rail|monorail|tram"]'),
    aroundOrArea(city, '["type"="route"]["proposed"~"subway|light_rail|monorail|tram"]'),
    aroundOrArea(city, '["type"="route"]["construction"~"subway|light_rail|monorail|tram"]'),
    aroundOrArea(city, '["route"="subway"]["state"~"proposed|construction"]'),
    aroundOrArea(city, '["route"="light_rail"]["state"~"proposed|construction"]'),
    wayAround('["railway"="construction"]["construction"~"subway|light_rail|monorail"]'),
    wayAround('["railway"="proposed"]["proposed"~"subway|light_rail|monorail"]'),
  ].join('\n');
  const body = mode === 'planned' ? planned : mode === 'all' ? `${open}\n${planned}` : open;
  const header =
    city.lat != null && city.lng != null
      ? `[out:json][timeout:120];`
      : `[out:json][timeout:90];\narea["name"="${city.area}"]->.a;`;
  const stops = withStops ? `\nnode(r:"stop");\nout body;` : '';
  return `${header}
(
${body}
);
out geom;
way(r);
out tags;${stops}`;
}

async function overpass(query) {
  let lastErr;
  for (const ep of ENDPOINTS) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 90000);
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
      lastErr = e;
      console.warn('  overpass fail', ep, e.message);
      await sleep(1500);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr || new Error('overpass failed');
}

function collectStations(elements) {
  const stations = {};
  const lines = {};
  const nodes = new Map();
  for (const el of elements || []) {
    if (el.type === 'node' && el.lat != null && el.lon != null) {
      nodes.set(el.id, el);
    }
  }
  for (const el of elements || []) {
    if (el.type !== 'relation' || !el.tags) continue;
    const rawName = el.tags['name:zh'] || el.tags['name:zh-Hans'] || el.tags['name:zh-Hant'] || el.tags.name || '';
    const key = normalizeLineName(rawName) || rawName;
    if (!key) continue;
    const order = [];
    for (const m of el.members || []) {
      if (m.type !== 'node') continue;
      if (m.role && !['stop', 'station', ''].includes(m.role)) continue;
      const node = nodes.get(m.ref) || (m.lat != null ? m : null);
      if (!node || node.lat == null) continue;
      const tags = node.tags || {};
      const raw = tags['name:zh'] || tags['name:zh-Hans'] || tags['name:zh-Hant'] || tags.name;
      if (!raw) continue;
      const name = String(raw).replace(/站$/, '').replace(/車站$/, '').trim();
      if (!name) continue;
      if (!stations[name]) stations[name] = [+Number(node.lon).toFixed(6), +Number(node.lat).toFixed(6)];
      if (!order.includes(name)) order.push(name);
    }
    if (order.length) {
      const prev = lines[key];
      if (!prev || order.length > prev.stations.length) {
        lines[key] = { color: el.tags.colour || el.tags.color || '', stations: order };
      }
    }
  }
  return { stations, lines };
}

const CITY_LINE_HINT = {
  foshan: /佛山|广佛|南海|高明/,
  dalian: /大连/,
  shenyang: /沈阳/,
  changchun: /长春/,
  taipei: /台北|臺北|新北/,
  kaohsiung: /高雄/,
  harbin: /哈尔滨/,
  xiamen: /厦门/,
  guiyang: /贵阳/,
  urumqi: /乌鲁木齐/,
  wenzhou: /温州/,
  lanzhou: /兰州/,
  xuzhou: /徐州/,
  changzhou: /常州/,
  hohhot: /呼和浩特/,
  macau: /澳门|澳門/,
  taiyuan: /太原/,
  luoyang: /洛阳/,
  taichung: /台中|臺中/,
  shaoxing: /绍兴/,
  wuhu: /芜湖/,
  jinhua: /金华|金义东|义乌|东阳/,
  nantong: /南通/,
  taizhouzj: /台州/,
  chuzhou: /滁州|滁宁/,
  xuchang: /许昌|郑许/,
  ziyang: /资阳/,
  taoyuan: /桃园|桃園|机场/,
  haining: /海宁|杭海/,
  maanshan: /马鞍山|宁马/,
};

function preferLine(cityId, prev, next) {
  if (prev.status === 'open' && next.status && next.status !== 'open') return false;
  if (next.status === 'open' && prev.status && prev.status !== 'open') return true;
  const hint = CITY_LINE_HINT[cityId];
  if (hint) {
    const a = hint.test(prev.routeName) ? 1 : 0;
    const b = hint.test(next.routeName) ? 1 : 0;
    if (b !== a) return b > a;
  }
  return next.path.length > prev.path.length;
}

function lineStatus(tags) {
  const route = tags.route || '';
  const proposed = tags.proposed || '';
  const construction = tags.construction || '';
  if (route === 'proposed' || /subway|light_rail|monorail|tram/.test(proposed)) return 'planned';
  if (route === 'construction' || /subway|light_rail|monorail|tram/.test(construction)) return 'construction';
  return 'open';
}

function collectLines(elements, cityHint) {
  const byKey = new Map();
  const extras = [];
  const wayTags = new Map();
  for (const el of elements || []) {
    if (el.type === 'way' && el.id && el.tags) wayTags.set(el.id, el.tags);
  }
  for (const el of elements || []) {
    if (el.type !== 'relation' || !el.tags) continue;
    const route = el.tags.route;
    const status = lineStatus(el.tags);
    const isTransit =
      ['subway', 'light_rail', 'monorail', 'tram', 'train'].includes(route) ||
      ['planned', 'construction'].includes(status);
    if (!isTransit) continue;
    const rawName = el.tags['name:zh'] || el.tags['name:zh-Hans'] || el.tags.name || '';
    let key = normalizeLineName(rawName) || rawName || `rel-${el.id}`;
    if (!key) continue;
    if (status !== 'open') key = key.replace(/规划|在建/g, '') || key;
    const drawn = pathFromRelation(el, wayTags);
    const path = drawn.path;
    if (path.length < 2) continue;
    const next = {
      key,
      name: key,
      routeName: rawName,
      routeId: el.id,
      color: el.tags.colour || el.tags.color || '',
      source: 'OpenStreetMap',
      status,
      path,
      kind: drawn.kind,
    };
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, next);
    } else if (preferLine(cityHint, prev, next)) {
      extras.push(prev);
      byKey.set(key, next);
    } else {
      extras.push(next);
    }
  }
  const out = Object.fromEntries(byKey);
  for (const line of extras) {
    const ek = `${line.key}·${line.routeId}`;
    if (!out[ek]) out[ek] = { ...line, key: ek };
  }
  return out;
}

function collectWayLines(elements) {
  const groups = new Map();
  for (const el of elements || []) {
    if (el.type !== 'way' || !el.geometry?.length) continue;
    const t = el.tags || {};
    if (!['construction', 'proposed'].includes(t.railway)) continue;
    const raw = t['name:zh'] || t.name || t.ref;
    if (!raw) continue;
    const key = normalizeLineName(raw) || raw;
    if (!groups.has(key)) {
      groups.set(key, {
        raw,
        status: t.railway === 'proposed' ? 'planned' : 'construction',
        color: t.colour || t.color || '',
        parts: [],
      });
    }
    groups.get(key).parts.push(el.geometry.map((g) => [g.lat, g.lon]));
  }
  const out = {};
  for (const [key, g] of groups) {
    const path = thin(stitch(g.parts));
    if (path.length < 8) continue;
    out[key] = {
      key,
      name: key,
      routeName: g.raw,
      color: g.color,
      source: 'OpenStreetMap',
      status: g.status,
      path,
    };
  }
  return out;
}

async function fetchCity(city, mode = 'open') {
  console.log('city', city.id, city.area, mode);
  let json;
  try {
    json = await overpass(queryFor(city, true, mode));
  } catch (e) {
    console.warn('  retry lines-only', e.message);
    json = await overpass(queryFor(city, false, mode));
  }
  const lines = { ...collectWayLines(json.elements), ...collectLines(json.elements, city.id) };
  const stops = collectStations(json.elements);
  const n = Object.keys(lines).length;
  console.log('  lines', n, Object.keys(lines).join('、'));
  console.log('  stations', Object.keys(stops.stations).length);
  if (!n && mode !== 'planned') throw new Error('no subway routes');
  return {
    generatedAt: new Date().toISOString(),
    city: city.id,
    area: city.area,
    attribution: '© OpenStreetMap contributors',
    lines,
    stations: stops.stations,
    stationLines: stops.lines,
  };
}

function mergeCityData(prev, next) {
  const lines = { ...(prev?.lines || {}) };
  for (const [key, line] of Object.entries(next.lines || {})) {
    const old = lines[key];
    if (!old?.path?.length) {
      lines[key] = line;
      continue;
    }
    if (old.status === 'open' && line.status && line.status !== 'open') {
      if (line.path.length > old.path.length * 1.12) {
        const pk = key.endsWith('规划') ? key : `${key.replace(/·\d+$/, '')}规划`;
        if (!lines[pk] || line.path.length > (lines[pk].path?.length || 0)) {
          lines[pk] = { ...line, key: pk, name: pk };
        }
      }
      continue;
    }
    if (line.path.length > old.path.length) lines[key] = line;
  }
  const stations = { ...(prev?.stations || {}), ...(next.stations || {}) };
  const stationLines = { ...(prev?.stationLines || {}) };
  for (const [k, v] of Object.entries(next.stationLines || {})) {
    if (!stationLines[k] || (v.stations?.length || 0) > (stationLines[k].stations?.length || 0)) {
      stationLines[k] = v;
    }
  }
  return {
    ...next,
    generatedAt: new Date().toISOString(),
    lines,
    stations,
    stationLines,
  };
}

function writeStationFile(cityId, data) {
  if (!data.stations || !Object.keys(data.stations).length) return;
  const stDest = `src/data/${cityId}StationsOsm.json`;
  writeFileSync(
    stDest,
    JSON.stringify(
      {
        city: cityId,
        source: 'OpenStreetMap',
        generatedAt: data.generatedAt,
        stations: data.stations,
        lines: data.stationLines || {},
      },
      null,
      2
    )
  );
  console.log('  stations file', stDest);
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('planned') ? 'planned' : args.includes('all-modes') ? 'all' : 'open';
  const force = args.includes('force');
  const idArg = args.find((a) => !['planned', 'all-modes', 'force', 'all'].includes(a));
  const list = !idArg || args.includes('all') || (!idArg && (mode === 'planned' || args[0] === 'all' || !args.length))
    ? CITIES
    : CITIES.filter((c) => c.id === idArg);
  if (idArg && !list.length) {
    console.error('unknown city', idArg);
    process.exit(1);
  }
  mkdirSync('public/geo', { recursive: true });
  let ok = 0;
  for (const city of list) {
    const dest = `public/geo/${city.id}-osm-lines.json`;
    if (mode === 'open' && existsSync(dest) && !force && !idArg) {
      console.log('skip existing', dest);
      ok += 1;
      continue;
    }
    try {
      const fresh = await fetchCity(city, mode);
      let data = fresh;
      if (mode === 'planned' && existsSync(dest)) {
        try {
          data = mergeCityData(JSON.parse(readFileSync(dest, 'utf8')), fresh);
        } catch {
          data = fresh;
        }
      }
      writeFileSync(dest, JSON.stringify(data));
      writeStationFile(city.id, data);
      const plannedN = Object.values(data.lines || {}).filter((l) => l.status && l.status !== 'open').length;
      console.log('OK', dest, 'lines', Object.keys(data.lines || {}).length, 'planned/construction', plannedN);
      ok += 1;
    } catch (e) {
      console.error('FAIL', city.id, e.message);
      if (!existsSync(dest)) console.error('  no existing file');
    }
    await sleep(4000);
  }
  console.log('done', ok, '/', list.length);
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
