/**
 * 拉取高德地铁图站位（sl），GCJ-02 → WGS84。
 * 地铁通 MetroMan 未公开坐标 API；乘客端地图站位与此同源量级，可作对照。
 *
 * Usage: node scripts/fetch-amap-stations.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

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

const url = 'https://map.amap.com/service/subway?_v=1.0&srhdata=1100_drw_beijing.json';
const res = await fetch(url, { headers: { 'User-Agent': 'chinasubwayplan/1.0' } });
if (!res.ok) throw new Error(`AMap fetch ${res.status}`);
const drw = await res.json();

const stations = {};
for (const line of drw.l || []) {
  for (const st of line.st || []) {
    if (!st.sl || !st.n) continue;
    const [lng0, lat0] = st.sl.split(',').map(Number);
    if (!Number.isFinite(lng0) || !Number.isFinite(lat0)) continue;
    const [lng, lat] = gcj2wgs(lng0, lat0);
    if (!stations[st.n]) {
      stations[st.n] = [+lng.toFixed(6), +lat.toFixed(6)];
    }
  }
}

const payload = {
  source: 'AMap subway sl (GCJ-02→WGS84)',
  note: '地铁通未公开坐标；高德地铁图站位与乘客 App 地图同源，作对照用。线位仍用 OSM。',
  generatedAt: new Date().toISOString(),
  stations,
};

fs.writeFileSync(path.join(root, 'src/data/beijingStationsAmap.json'), JSON.stringify(payload, null, 2));
fs.writeFileSync(path.join(root, 'public/geo/beijing-stations-amap.json'), JSON.stringify(payload, null, 2));
console.log(`wrote ${Object.keys(stations).length} stations`);
