/**
 * 从各城高德 / OSM 站表抽出官方线色，写入 src/data/officialLineColors.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/data');

function norm(name) {
  if (!name) return '';
  const cn = { 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9', 十: '10' };
  let s = String(name)
    .replace(/[0-9]\uFE0F?\u20E3/g, (m) => m[0])
    .replace(/（.*?）|\(.*?\)/g, '')
    .replace(/^(北京|上海|天津|重庆|广州|深圳|南京|武汉|成都|杭州|西安|苏州|青岛|郑州|长沙|合肥|南昌|南宁|济南|石家庄|昆明|福州|宁波|无锡|东莞|沈阳|大连|长春|佛山|台北|臺北|高雄|哈尔滨|厦门|贵阳|乌鲁木齐|温州|兰州|徐州|常州|呼和浩特|澳门|澳門|太原|洛阳|台中|臺中|绍兴|芜湖|金华|南通|台州|滁州|许昌|资阳|桃园|桃園|海宁|马鞍山)?(地铁|地鐵|轨道交通|軌道交通|轨交|港铁|捷运|捷運)?/i, '')
    .split(/[：:]/)[0]
    .trim();
  s = s.replace(/[一二三四五六七八九十]号线/g, (m) => `${cn[m[0]]}号线`);
  s = s.replace(/(\d+)\s*号?\s*线(?!路)/, '$1号线');
  const numbered = s.match(/(\d+号线)/);
  if (numbered && !/S\d/i.test(s)) return numbered[1];
  return s;
}

function canAliasToShort(rawName, shortName) {
  if (!rawName || !shortName || rawName === shortName) return true;
  const raw = String(rawName).split(/[：:]/)[0].trim();
  if (raw === shortName || raw === `地铁${shortName}` || raw === `地鐵${shortName}`) return true;
  const escaped = shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^(地铁|地鐵|轨道交通|軌道交通|轨交)?${escaped}`).test(raw);
}

const byCity = {};
const files = fs
  .readdirSync(dataDir)
  .filter((n) => /Stations(Amap|Osm)\.json$/.test(n))
  .sort((a, b) => Number(a.includes('Amap')) - Number(b.includes('Amap')));
for (const f of files) {
  const city = f.replace(/Stations(Amap|Osm)\.json$/, '');
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  if (!byCity[city]) byCity[city] = {};
  for (const [k, v] of Object.entries(data.lines || {})) {
    const color = String(v?.color || '').trim();
    if (!color || color === '#4a90d9') continue;
    byCity[city][k] = color;
    const n = norm(k);
    if (n && canAliasToShort(k, n)) byCity[city][n] = color;
  }
}

const extraAlias = {
  taipei: {
    BR线: byCity.taipei?.['文湖線'] || byCity.taipei?.文湖线 || '#c48c31',
    R线: byCity.taipei?.['淡水線-信義線'] || byCity.taipei?.['淡水信义线'] || '#e3002c',
    G线: byCity.taipei?.['松山新店線'] || '#107154',
    O线: byCity.taipei?.['中和新蘆線'] || '#f5a01f',
    BL线: byCity.taipei?.['南港-板橋-土城線'] || '#0070bd',
    A线: byCity.taipei?.['桃園機場捷運 普通車 台北車站 → 老街溪'] || byCity.taoyuan?.['機場線'] || '#8246AF',
    Y线: byCity.taipei?.['環狀線'] || '#ffdb00',
    'Y线（新北捷运）': byCity.taipei?.['環狀線'] || '#ffdb00',
  },
};

for (const [city, aliases] of Object.entries(extraAlias)) {
  byCity[city] = { ...(byCity[city] || {}), ...aliases };
}

const out = `import { normalizeOsmLineName } from './osmUtil.js';

/** 各城官方线色（高德 / OSM），供线路图一次性套色 */
export const OFFICIAL_LINE_COLORS = ${JSON.stringify(byCity, null, 2)};

export function officialLineColor(cityId, lineName) {
  const table = OFFICIAL_LINE_COLORS[cityId];
  if (!table || !lineName) return '';
  const n = normalizeOsmLineName(lineName);
  const keys = [lineName, n, n && \`地铁\${n}\`, n && \`地鐵\${n}\`].filter(Boolean);
  for (const key of keys) {
    if (table[key]) return table[key];
  }
  let fallback = '';
  for (const [k, color] of Object.entries(table)) {
    if (normalizeOsmLineName(k) !== n) continue;
    if (/^地铁|^地鐵/.test(k)) return color;
    if (!fallback) fallback = color;
  }
  return fallback;
}
`;
fs.writeFileSync(path.join(dataDir, 'officialLineColors.js'), out);
console.log('cities', Object.keys(byCity).length);
