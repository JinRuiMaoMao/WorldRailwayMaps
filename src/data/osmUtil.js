import { assetUrl } from '../assetUrl.js';
/** OpenStreetMap 线位工具：切段、找站、挂到各城分镜 */
import { mapKindToPath } from './guideway.js';

let cache = null;
const cityCache = new Map();
let railCache = null;

/** 1865–1910 历史路名 → OSM 现代干线 key */
export const RAIL_OSM_KEY = {
  唐胥铁路: '津山线',
  唐芦铁路: '津山线',
  唐津铁路: '津山线',
  津榆铁路: '津山线',
  关内外铁路: '沈山线',
  京奉铁路: '京哈线',
  新奉铁路: '沈山线',
  沪宁铁路: '京沪线',
  津浦铁路: '京沪线',
  京汉铁路: '京广线',
  胶济铁路: '胶济线',
  京张铁路: '京包线',
  南满支线: '哈大线',
  南满铁路: '哈大线',
  安奉铁路: '沈丹线',
  广三铁路: '广茂线',
  沪杭铁路: '沪昆线',
  株萍铁路: '沪昆线',
  正太铁路: '石太线',
  汴洛铁路: '陇海线',
  道清铁路: '新月线',
  滇越铁路: '昆河铁路',
  南浔铁路: '京九线',
  齐昂铁路: '平齐线',
  台湾铁路: '纵贯线',
  纵贯铁路: '纵贯线',
  大冶铁路: '武九线',
  吴淞铁路: '淞沪铁路',
  淞沪铁路: '淞沪铁路',
  淞沪支线: '淞沪铁路',
  西陵铁路: '高易铁路',
  潮汕铁路: '潮汕铁路',
  新宁铁路: '新宁铁路',
  漳厦铁路: '漳厦铁路',
  齐昂铁路: '齐昂铁路',
};

export const OSM_CITY_IDS = [
  'beijing',
  'shanghai',
  'tianjin',
  'chongqing',
  'guangzhou',
  'shenzhen',
  'nanjing',
  'wuhan',
  'chengdu',
  'hangzhou',
  'xian',
  'suzhou',
  'qingdao',
  'zhengzhou',
  'changsha',
  'hefei',
  'nanchang',
  'nanning',
  'jinan',
  'shijiazhuang',
  'kunming',
  'fuzhou',
  'ningbo',
  'wuxi',
  'dongguan',
  'hongkong',
  'changchun',
  'dalian',
  'shenyang',
  'foshan',
  'taipei',
  'kaohsiung',
  'harbin',
  'xiamen',
  'guiyang',
  'urumqi',
  'wenzhou',
  'lanzhou',
  'xuzhou',
  'changzhou',
  'hohhot',
  'taiyuan',
  'luoyang',
  'shaoxing',
  'wuhu',
  'nantong',
  'jinhua',
  'taizhouzj',
  'macau',
  'taichung',
  'taoyuan',
  'chuzhou',
  'xuchang',
  'ziyang',
  'haining',
  'maanshan',
];

export async function loadBeijingOsm() {
  if (cache) return cache;
  const res = await fetch(assetUrl('geo/beijing-osm-lines.json'));
  cache = await res.json();
  return cache;
}

export async function loadCityOsm(cityId) {
  if (cityCache.has(cityId)) return cityCache.get(cityId);
  if (cityId === 'beijing') {
    const data = await loadBeijingOsm();
    cityCache.set(cityId, data);
    return data;
  }
  try {
    const res = await fetch(assetUrl(`geo/${cityId}-osm-lines.json`));
    if (!res.ok) {
      cityCache.set(cityId, null);
      return null;
    }
    const data = await res.json();
    cityCache.set(cityId, data);
    return data;
  } catch {
    cityCache.set(cityId, null);
    return null;
  }
}

export async function loadChinaRailOsm() {
  if (railCache) return railCache;
  try {
    const res = await fetch(assetUrl('geo/china-rail-osm-lines.json'));
    if (!res.ok) {
      railCache = null;
      return null;
    }
    railCache = await res.json();
    return railCache;
  } catch {
    railCache = null;
    return null;
  }
}

export async function loadAllCityOsm() {
  const out = {};
  await Promise.all(
    OSM_CITY_IDS.map(async (id) => {
      const data = await loadCityOsm(id);
      if (data?.lines) out[id] = data;
    })
  );
  return out;
}

export function getOsmLine(key) {
  return cache?.lines?.[key] || null;
}

export function nearestIndex(path, lat, lng) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - lat, path[i][1] - lng);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function distToSeg2(p, a, b) {
  const dx = b[1] - a[1];
  const dy = b[0] - a[0];
  const len2 = dx * dx + dy * dy;
  let t = 0;
  if (len2 > 1e-20) t = Math.max(0, Math.min(1, ((p[1] - a[1]) * dx + (p[0] - a[0]) * dy) / len2));
  const qx = a[1] + t * dx;
  const qy = a[0] + t * dy;
  return (p[1] - qx) * (p[1] - qx) + (p[0] - qy) * (p[0] - qy);
}

function keepStationIndices(path, stations) {
  const keep = new Set([0, path.length - 1]);
  for (const st of stations || []) {
    if (st?.lat == null || st?.lng == null) continue;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < path.length; i++) {
      const d = Math.hypot(path[i][0] - st.lat, path[i][1] - st.lng);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    keep.add(best);
  }
  return keep;
}

function dpKeep(path, tol2, must, lo, hi, out) {
  if (hi <= lo + 1) return;
  for (let i = lo + 1; i < hi; i++) {
    if (!must.has(i)) continue;
    dpKeep(path, tol2, must, lo, i, out);
    out.add(i);
    dpKeep(path, tol2, must, i, hi, out);
    return;
  }
  let maxD = 0;
  let maxI = lo;
  const a = path[lo];
  const b = path[hi];
  for (let i = lo + 1; i < hi; i++) {
    const d = distToSeg2(path[i], a, b);
    if (d > maxD) {
      maxD = d;
      maxI = i;
    }
  }
  if (maxD > tol2) {
    dpKeep(path, tol2, must, lo, maxI, out);
    out.add(maxI);
    dpKeep(path, tol2, must, maxI, hi, out);
  }
}

/**
 * 抽稀 OSM 折线：保留端点与近站顶点，其余按 Douglas–Peucker。
 * 约 15–25m 容差，线形在城市缩放下几乎看不出差，点数可降一个数量级。
 */
export function thinPath(path, stations = [], opts = {}) {
  if (!path?.length) return [];
  if (path.length <= 3) return path.map((p) => [p[0], p[1]]);
  const toleranceDeg = opts.toleranceDeg ?? 0.00016;
  const maxPts = opts.maxPts ?? 110;
  const minStepDeg = opts.minStepDeg ?? 0.00007;
  const depth = opts.depth ?? 0;

  const collapsed = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = collapsed[collapsed.length - 1];
    if (Math.hypot(path[i][0] - prev[0], path[i][1] - prev[1]) >= minStepDeg) {
      collapsed.push(path[i]);
    }
  }
  collapsed.push(path[path.length - 1]);
  if (collapsed.length <= 3) return collapsed.map((p) => [p[0], p[1]]);

  const must = keepStationIndices(collapsed, stations);
  const keep = new Set(must);
  dpKeep(collapsed, toleranceDeg * toleranceDeg, must, 0, collapsed.length - 1, keep);
  let pts = [...keep]
    .sort((a, b) => a - b)
    .map((i) => [collapsed[i][0], collapsed[i][1]]);

  if (pts.length > maxPts && depth < 4) {
    return thinPath(pts, stations, {
      toleranceDeg: toleranceDeg * 1.7,
      maxPts,
      minStepDeg: minStepDeg * 1.35,
      depth: depth + 1,
    });
  }
  if (pts.length > maxPts) {
    const must2 = keepStationIndices(pts, stations);
    const step = Math.ceil(pts.length / maxPts);
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      if (must2.has(i) || i % step === 0) out.push(pts[i]);
    }
    const last = pts[pts.length - 1];
    if (out[out.length - 1] !== last) out.push(last);
    return out;
  }
  return pts;
}

function isClosed(path) {
  if (path.length < 3) return false;
  const a = path[0];
  const b = path[path.length - 1];
  return Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-5;
}

/** 沿闭环正方向 a→b */
function walkClosed(path, a, b) {
  const n = isClosed(path) ? path.length - 1 : path.length;
  const out = [];
  let i = ((a % n) + n) % n;
  const end = ((b % n) + n) % n;
  out.push(path[i]);
  if (i === end) return out;
  do {
    i = (i + 1) % n;
    out.push(path[i]);
  } while (i !== end);
  return out;
}

function indexBetween(a, b, v, n) {
  a = ((a % n) + n) % n;
  b = ((b % n) + n) % n;
  v = ((v % n) + n) % n;
  if (a <= b) return v >= a && v <= b;
  return v >= a || v <= b;
}

/**
 * 按起终点（及可选途经站）从 OSM path 切出真实轨道
 * stations: {lat,lng,name}[]
 */
export function sliceOsmPath(path, from, to, via = null) {
  if (!path?.length) return [];
  const a = nearestIndex(path, from.lat, from.lng);
  const b = nearestIndex(path, to.lat, to.lng);
  const closed = isClosed(path);
  const n = closed ? path.length - 1 : path.length;

  if (!closed) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return path.slice(lo, hi + 1);
  }

  if (via) {
    const v = nearestIndex(path, via.lat, via.lng);
    if (indexBetween(a, b, v, n)) return walkClosed(path, a, b);
    return walkClosed(path, a, b); // try other direction
  }

  // 无 via：取较短弧
  const fwd = walkClosed(path, a, b);
  const rev = walkClosed(path, b, a);
  return fwd.length <= rev.length ? fwd : rev.reverse();
}

/** 带 via 时强制经过 via 的那一弧 */
export function sliceOsmPathVia(path, from, to, via) {
  if (!path?.length) return [];
  const a = nearestIndex(path, from.lat, from.lng);
  const b = nearestIndex(path, to.lat, to.lng);
  const v = nearestIndex(path, via.lat, via.lng);
  const closed = isClosed(path);
  if (!closed) return sliceOsmPath(path, from, to);

  const n = path.length - 1;
  if (indexBetween(a, b, v, n)) return walkClosed(path, a, b);
  // 另一方向：a 反向走到 b（即 walkClosed(b,a) 再反转语义上是 a→b 经另一弧）
  return walkClosed(path, a, b).length
    ? (() => {
        // walk from a decreasing
        const out = [];
        let i = ((a % n) + n) % n;
        const end = ((b % n) + n) % n;
        out.push(path[i]);
        while (i !== end) {
          i = (i - 1 + n) % n;
          out.push(path[i]);
        }
        return out;
      })()
    : walkClosed(path, a, b);
}

/** 修复：明确选经过 via 的方向 */
export function sliceVia(path, from, to, via) {
  const a = nearestIndex(path, from.lat, from.lng);
  const b = nearestIndex(path, to.lat, to.lng);
  const v = nearestIndex(path, via.lat, via.lng);
  const n = isClosed(path) ? path.length - 1 : path.length;

  if (!isClosed(path)) {
    return path.slice(Math.min(a, b), Math.max(a, b) + 1);
  }

  if (indexBetween(a, b, v, n)) return walkClosed(path, a, b);

  // 反向走
  const out = [];
  let i = ((a % n) + n) % n;
  const end = ((b % n) + n) % n;
  out.push(path[i]);
  while (i !== end) {
    i = (i - 1 + n) % n;
    out.push(path[i]);
  }
  return out;
}

/** 历史名 / 分段名 → OSM 现网线名 */
export const OSM_LINE_ALIAS = {
  明珠线: '3号线',
  既有线: '1号线',
  津滨快线: '9号线',
  '1号线南延段': '1号线',
  '6号线二期': '6号线',
  '4号线修复段': '4号线',
  金山铁路: '金山线',
  市域机场线: '机场联络线',
  木栅线: '文湖線',
  木柵線: '文湖線',
  栅湖线: '文湖線',
  柵湖線: '文湖線',
  文湖线: '文湖線',
  淡水线: '淡水線-信義線',
  淡水線: '淡水線-信義線',
  新北投支线: '紅線',
  新北投支線: '紅線',
  新店线: '松山新店線',
  新店線: '松山新店線',
  中和线: '中和新蘆線',
  中和線: '中和新蘆線',
  南港线: '南港-板橋-土城線',
  南港線: '南港-板橋-土城線',
  板南线: '南港-板橋-土城線',
  板南線: '南港-板橋-土城線',
  小南门线: '松山新店線',
  小南門線: '松山新店線',
  芦洲线: '蘆洲線',
  蘆洲線: '蘆洲線',
  新芦线: '中和新蘆線',
  新蘆線: '中和新蘆線',
  中和新芦线: '中和新蘆線',
  信义线: '淡水線-信義線',
  信義線: '淡水線-信義線',
  淡水信义线: '淡水線-信義線',
  松山新店线: '松山新店線',
  A线: '桃園機場捷運 普通車 台北車站 → 老街溪',
  Y线: '環狀線',
  'Y线（新北捷运）': '環狀線',
  三莺线: '三鶯線',
  三鶯線: '三鶯線',
  绿线: '綠線',
  綠線: '綠線',
  宁滁线: '宁滁线',
  寧滁線: '宁滁线',
  滁宁城际: '宁滁线',
};

/** 上海地铁1号线 / 二号线 / 1线 → 1号线 */
export function normalizeOsmLineName(name) {
  if (!name) return '';
  if (OSM_LINE_ALIAS[name]) return OSM_LINE_ALIAS[name];
  const cn = { 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9', 十: '10' };
  let s = String(name)
    .replace(/[0-9]\uFE0F?\u20E3/g, (m) => m[0])
    .replace(/（.*?）|\(.*?\)/g, '')
    .replace(
      /^(北京|上海|天津|重庆|广州|深圳|南京|武汉|成都|杭州|西安|苏州|青岛|郑州|长沙|合肥|南昌|南宁|济南|石家庄|昆明|福州|宁波|无锡|东莞|香港|沈阳|大连|长春|佛山|台北|臺北|高雄|哈尔滨|厦门|贵阳|乌鲁木齐|温州|兰州|徐州|常州|呼和浩特|澳门|澳門|太原|洛阳|台中|臺中|绍兴|芜湖|金华|南通|台州|滁州|许昌|资阳|桃园|桃園|海宁|马鞍山)?(地铁|地鐵|轨道交通|軌道交通|轨交|港铁|捷运|捷運|轻轨|輕軌|市域铁路|机场捷运|MTR)?/i,
      ''
    )
    .replace(/^地铁|^轨道交通/, '')
    .split(/[：:]/)[0]
    .trim();
  if (/临港|有轨|导轨|捷运|tram/i.test(String(name)) && !/地铁|地鐵/.test(String(name))) {
    let t = String(name).replace(/（.*?）|\(.*?\)/g, '').trim();
    t = t.replace(
      /^(苏州|上海|天津|北京|南京|珠海|武汉|成都|青岛|深圳|淮安|佛山|沈阳|大连|长春|高明|南海|高新)?(有轨电车|有軌電車|现代有轨电车)?/i,
      ''
    );
    const numbered = t.match(/(\d+)\s*号线/);
    if (numbered) return `有轨电车${numbered[1]}号线`;
    const tref = t.match(/\bT\s*(\d+)\b/i);
    if (tref) return `有轨电车T${tref[1]}`;
    return t.trim() || String(name).replace(/^上海|^天津|^苏州/, '').trim();
  }
  const specialName = s.match(/(S\d+线?|金义东|机场捷运|郑许线?|滁宁|杭海|宁马|氹仔|横琴|石排湾|资阳线|绿线)/i);
  if (specialName) return specialName[1].replace(/^(S\d+)$/i, (m) => `${m.toUpperCase()}线`);
  s = s.replace(/[一二三四五六七八九十]号线/g, (m) => `${cn[m[0]]}号线`);
  s = s.replace(/[寧宁]滁[線线].*/, '宁滁线');
  s = s.replace(/^(綠線|绿线|藍線|蓝线|紅線|红线|橘線|橘线).*/, '$1');
  if (!/S\d/i.test(s)) s = s.replace(/(\d+)\s*号?\s*线(?!路)/, '$1号线');
  const looseNum = s.match(/^(\d+)\s/);
  if (looseNum && !/\d+号线/.test(s)) return `${looseNum[1]}号线`;
  const numbered = s.match(/(\d+号线)/);
  if (numbered && !/S\d/i.test(s)) return numbered[1];
  const en = s.match(/line\s*(\d+)/i);
  if (en) return `${en[1]}号线`;
  return s;
}

function pathNearStation(path, st, maxDeg = 0.018) {
  if (!path?.length || st?.lat == null) return false;
  const i = nearestIndex(path, st.lat, st.lng);
  return Math.hypot(path[i][0] - st.lat, path[i][1] - st.lng) <= maxDeg;
}

function lineNames(line, key) {
  return [key, line.name, line.key, line.routeName, ...(line.aliases || [])].filter(Boolean);
}

function nameHitsLine(lineName, want, names) {
  return names.some((n) => {
    if (n === lineName || n === want) return true;
    const nn = normalizeOsmLineName(n);
    if (nn && nn === want) return true;
    const base = String(n).split(/[·#：:]/)[0];
    return base === lineName || base === want || normalizeOsmLineName(base) === want;
  });
}

/** 所有候选 OSM 线（含同号线支线变体） */
export function collectOsmCandidates(osmData, lineName) {
  const lines = osmData?.lines;
  if (!lines || !lineName) return [];
  const want = normalizeOsmLineName(lineName);
  const out = [];
  for (const [k, line] of Object.entries(lines)) {
    if (!line?.path?.length) continue;
    if (nameHitsLine(lineName, want, lineNames(line, k))) out.push(line);
  }
  return out;
}

function matchOsmLine(osmData, lineName) {
  return collectOsmCandidates(osmData, lineName)[0] || null;
}

function stationPathDist(path, st) {
  if (!path?.length || st?.lat == null) return Infinity;
  const i = nearestIndex(path, st.lat, st.lng);
  return Math.hypot(path[i][0] - st.lat, path[i][1] - st.lng);
}

const osmPickMemo = new WeakMap();

function osmLineRank(line) {
  const key = String(line?.key || line?.name || '');
  let n = 0;
  if (!line?.status || line.status === 'open') n += 100;
  if (!key.includes('·')) n += 25;
  n += Math.min(8, (line.path?.length || 0) / 8000);
  return n;
}

export function pickOsmLine(osmData, lineName, from, to) {
  const cands = collectOsmCandidates(osmData, lineName);
  if (!cands.length) return null;
  const want = normalizeOsmLineName(lineName);
  let memo = osmPickMemo.get(osmData);
  if (!memo) {
    memo = new Map();
    osmPickMemo.set(osmData, memo);
  }
  const prev = memo.get(want);
  if (prev?.path?.length && from && to) {
    const reused = Math.max(stationPathDist(prev.path, from), stationPathDist(prev.path, to));
    if (reused <= 0.022) return prev;
  }
  if (!from || !to) {
    const fallback = [...cands].sort((a, b) => osmLineRank(b) - osmLineRank(a))[0] || null;
    if (fallback) memo.set(want, fallback);
    return fallback;
  }
  let best = null;
  let bestScore = Infinity;
  let bestRank = -1;
  for (const line of cands) {
    const score = Math.max(stationPathDist(line.path, from), stationPathDist(line.path, to));
    const rank = osmLineRank(line);
    if (score + 1e-6 < bestScore || (Math.abs(score - bestScore) <= 0.001 && rank > bestRank)) {
      best = line;
      bestScore = score;
      bestRank = rank;
    }
  }
  if (bestScore > 0.022) return null;
  memo.set(want, best);
  return best;
}

/** 简办分镜未收录、但 OSM 有的线（如有轨）→ 独立线段，避免图上缺线 */
export function orphanOsmSegments(cityId, osmData, scenes) {
  const lines = osmData?.lines;
  if (!lines || !cityId) return [];
  const used = new Set();
  const eat = (name) => {
    if (!name) return;
    used.add(String(name));
    const n = normalizeOsmLineName(name);
    if (n) used.add(n);
  };
  for (const sc of scenes || []) {
    for (const seg of sc.segments || []) {
      eat(seg.line);
      eat(seg.osmKey);
    }
    eat(sc.lineHandoff?.segment?.line);
    eat(sc.lineHandoff?.alsoGrow?.line);
  }
  const out = [];
  for (const [key, line] of Object.entries(lines)) {
    if (!line?.path?.length || line.path.length < 2) continue;
    if (line.status && line.status !== 'open') continue;
    const blob = `${key} ${line.name || ''} ${line.routeName || ''}`;
    const isTram =
      line.route === 'tram' ||
      line.routeKind === 'tram' ||
      /有轨|tram|导轨|云巴|APM|西郊|浑南|光谷|城阳|黄埔|THZ|蓉2|都江堰|麒麟|河西|亦庄/i.test(blob);
    if (!isTram) continue;
    const name = normalizeOsmLineName(line.name || line.routeName || key) || key;
    if (used.has(name) || used.has(key) || used.has(line.name) || used.has(line.routeName)) continue;
    out.push({
      id: `cn-osm-extra-${cityId}-${key}`,
      line: name,
      color: line.color || '',
      osmFull: true,
      path: line.path,
      cityId,
      routeKind: 'tram',
      railway: 'tram',
      stations: [],
      skipLabels: true,
    });
  }
  return out;
}

/**
 * 把 OSM 真实轨道挂到分镜。
 * 有可靠 OSM 匹配时覆盖简办折线；匹配失败才保留已有 path（港铁手画等）。
 */
export function bindOsmToScenes(scenes, osmData) {
  if (!osmData?.lines || !scenes?.length) return scenes;
  for (const sc of scenes) {
    const segs = [...(sc.segments || [])];
    if (sc.lineHandoff?.segment) segs.push(sc.lineHandoff.segment);
    if (sc.lineHandoff?.alsoGrow) segs.push(sc.lineHandoff.alsoGrow);
    for (const seg of segs) {
      if (seg.keepHandPath) continue;
      const st = (seg.stations || []).filter((s) => s?.name && !s.silent && s.lat != null);
      const from = st[0];
      const to = st[st.length - 1];
      const line = pickOsmLine(osmData, seg.osmKey || seg.line, from, to) || matchOsmLine(osmData, seg.osmKey || seg.line);
      if (!line?.path?.length) continue;
      if (st.length < 2) {
        seg.path = thinPath(line.path, st);
        seg.osmFull = true;
        if (line.kind) seg.kind = mapKindToPath(line.path, line.kind, seg.path);
        continue;
      }
      if (!pathNearStation(line.path, from, 0.022) || !pathNearStation(line.path, to, 0.022)) continue;
      const via = seg.osmVia || (st.length >= 3 ? st[Math.floor(st.length / 2)] : st[1]);
      const sliced = via ? sliceVia(line.path, from, to, via) : sliceOsmPath(line.path, from, to);
      if (sliced?.length >= 2) {
        seg.path = thinPath(sliced, st);
        seg.osmFull = true;
        if (line.kind) seg.kind = mapKindToPath(line.path, line.kind, seg.path);
      }
    }
  }
  return scenes;
}

/**
 * 干线铁路：用 OSM 真实轨道覆盖示意折线（展览铁路等找不到的保留手画）
 */
export function bindOsmToRailScenes(scenes, osmData) {
  if (!osmData?.lines || !scenes?.length) return scenes;
  for (const sc of scenes) {
    const segs = [...(sc.segments || [])];
    if (sc.lineHandoff?.segment) segs.push(sc.lineHandoff.segment);
    if (sc.lineHandoff?.alsoGrow) segs.push(sc.lineHandoff.alsoGrow);
    for (const seg of segs) {
      const key = seg.osmKey || RAIL_OSM_KEY[seg.line] || seg.line;
      if (!key) continue;
      const line = matchOsmLine(osmData, key);
      if (!line?.path?.length) continue;
      const st = (seg.stations || []).filter((s) => s?.name && s.lat != null);
      const railThin = { toleranceDeg: 0.00004, maxPts: 720, minStepDeg: 0.00002 };
      if (st.length < 2) {
        seg.path = thinPath(line.path, st, railThin);
        seg.osmFull = true;
        continue;
      }
      const from = st.find((s) => !s.silent) || st[0];
      const to = [...st].reverse().find((s) => !s.silent) || st[st.length - 1];
      if (!pathNearStation(line.path, from, 0.12) || !pathNearStation(line.path, to, 0.12)) continue;
      const via =
        seg.osmVia ||
        st.filter((s) => !s.silent && s !== from && s !== to)[Math.floor(st.length / 2)] ||
        (st.length >= 3 ? st[Math.floor(st.length / 2)] : st[1]);
      const sliced = via ? sliceVia(line.path, from, to, via) : sliceOsmPath(line.path, from, to);
      if (sliced?.length >= 2) {
        seg.path = thinPath(sliced, st, railThin);
        seg.osmFull = true;
      }
    }
  }
  return scenes;
}
