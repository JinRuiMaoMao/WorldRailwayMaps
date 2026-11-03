/**
 * 拉取高德地铁图站位（多城）。Usage:
 *   node scripts/fetch-amap-city-stations.js shanghai
 *   node scripts/fetch-amap-city-stations.js all
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** 高德地铁图城市码 */
export const AMAP_CITY = {
  beijing: '1100',
  shanghai: '3100',
  guangzhou: '4401',
  shenzhen: '4403',
  tianjin: '1200',
  nanjing: '3201',
  wuhan: '4201',
  chengdu: '5101',
  hangzhou: '3301',
  chongqing: '5000',
  xian: '6101',
  suzhou: '3205',
  qingdao: '3702',
  zhengzhou: '4101',
  changsha: '4301',
  hefei: '3401',
  nanchang: '3601',
  nanning: '4501',
  shenyang: '2101',
  dalian: '2102',
  changchun: '2201',
  harbin: '2301',
  kunming: '5301',
  fuzhou: '3501',
  ningbo: '3302',
  wuxi: '3202',
  dongguan: '4419',
  foshan: '4406',
  jinan: '3701',
  shijiazhuang: '1301',
  xiamen: '3502',
  guiyang: '5201',
  urumqi: '6501',
  wenzhou: '3303',
  lanzhou: '6201',
  xuzhou: '3203',
  changzhou: '3204',
  hohhot: '1501',
  taiyuan: '1401',
  luoyang: '4103',
  shaoxing: '3306',
  wuhu: '3402',
  nantong: '3206',
  jinhua: '3307',
  taizhouzj: '3310',
};

function outOfChina(lng, lat) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}
function transformLat(lng, lat) {
  let ret = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(lat * Math.PI) + 40 * Math.sin((lat / 3) * Math.PI)) * 2) / 3;
  ret += ((160 * Math.sin((lat / 12) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30)) * 2) / 3;
  return ret;
}
function transformLng(lng, lat) {
  let ret = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(lng * Math.PI) + 40 * Math.sin((lng / 3) * Math.PI)) * 2) / 3;
  ret += ((150 * Math.sin((lng / 12) * Math.PI) + 300 * Math.sin((lng / 30) * Math.PI)) * 2) / 3;
  return ret;
}
function gcj2wgs(lng, lat) {
  if (outOfChina(lng, lat)) return [lng, lat];
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  const radlat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dlng = (dlng * 180.0) / ((a / sqrtMagic) * Math.cos(radlat) * Math.PI);
  return [lng * 2 - (lng + dlng), lat * 2 - (lat + dlat)];
}

async function fetchCity(cityId) {
  const code = AMAP_CITY[cityId];
  if (!code) throw new Error(`unknown city ${cityId}`);
  const url = `https://map.amap.com/service/subway?_v=1.0&srhdata=${code}_drw_${cityId === 'xian' ? 'xian' : cityId}.json`;
  // AMap uses english city slug in filename — try common variants
  const slugs = {
    beijing: 'beijing',
    shanghai: 'shanghai',
    guangzhou: 'guangzhou',
    shenzhen: 'shenzhen',
    tianjin: 'tianjin',
    nanjing: 'nanjing',
    wuhan: 'wuhan',
    chengdu: 'chengdu',
    hangzhou: 'hangzhou',
    chongqing: 'chongqing',
    xian: 'xian',
    suzhou: 'suzhou',
    qingdao: 'qingdao',
    zhengzhou: 'zhengzhou',
    changsha: 'changsha',
    hefei: 'hefei',
    nanchang: 'nanchang',
    nanning: 'nanning',
    shenyang: 'shenyang',
    dalian: 'dalian',
    changchun: 'changchun',
    harbin: 'haerbin',
    kunming: 'kunming',
    fuzhou: 'fuzhou',
    ningbo: 'ningbo',
    wuxi: 'wuxi',
    dongguan: 'dongguan',
    foshan: 'foshan',
    jinan: 'jinan',
    shijiazhuang: 'shijiazhuang',
    xiamen: 'xiamen',
    guiyang: 'guiyang',
    urumqi: 'wulumuqi',
    wenzhou: 'wenzhou',
    lanzhou: 'lanzhou',
    xuzhou: 'xuzhou',
    changzhou: 'changzhou',
    hohhot: 'huhehaote',
    taiyuan: 'taiyuan',
    luoyang: 'luoyang',
    shaoxing: 'shaoxing',
    wuhu: 'wuhu',
    nantong: 'nantong',
    jinhua: 'jinhua',
    taizhouzj: 'taizhou',
  };
  const slug = slugs[cityId] || cityId;
  const altSlugs = {
    urumqi: ['wulumuqi', 'urumqi'],
    hohhot: ['huhehaote', 'hohhot'],
    harbin: ['haerbin', 'harbin'],
    taizhouzj: ['taizhou', 'taizhouzj'],
  };
  const slugTries = [slug, ...(altSlugs[cityId] || [])].filter((s, i, a) => a.indexOf(s) === i);
  const tryUrls = slugTries.map(
    (s) => `https://map.amap.com/service/subway?_v=1.0&srhdata=${code}_drw_${s}.json`
  );
  let drw = null;
  let used = null;
  for (const u of tryUrls) {
    const res = await fetch(u, { headers: { 'User-Agent': 'chinasubwayplan/1.0' } });
    if (!res.ok) {
      console.warn(`${cityId} fail ${res.status} ${u}`);
      continue;
    }
    drw = await res.json();
    used = u;
    break;
  }
  if (!drw?.l) throw new Error(`no data for ${cityId}`);

  const stations = {};
  const lines = {};
  for (const line of drw.l || []) {
    const lineName = line.kn || line.ln || line.ls || '';
    const color = line.cl ? `#${line.cl}` : '#888';
    const stList = [];
    for (const st of line.st || []) {
      if (!st.sl || !st.n) continue;
      const [lng0, lat0] = st.sl.split(',').map(Number);
      if (!Number.isFinite(lng0) || !Number.isFinite(lat0)) continue;
      const [lng, lat] = gcj2wgs(lng0, lat0);
      const coord = [+lng.toFixed(6), +lat.toFixed(6)];
      if (!stations[st.n]) stations[st.n] = coord;
      stList.push(st.n);
    }
    if (lineName && stList.length) {
      lines[lineName] = { color, stations: stList };
    }
  }

  const payload = {
    city: cityId,
    source: used,
    generatedAt: new Date().toISOString(),
    stations,
    lines,
  };
  const out = path.join(root, 'src/data', `${cityId}StationsAmap.json`);
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(`${cityId}: ${Object.keys(stations).length} stations, ${Object.keys(lines).length} lines → ${out}`);
  return payload;
}

const arg = process.argv[2] || 'shanghai';
const list = arg === 'all' ? Object.keys(AMAP_CITY) : [arg];
for (const id of list) {
  try {
    await fetchCity(id);
  } catch (e) {
    console.error(id, e.message);
  }
}
