/**
 * 拉取各城公共汽电车（有 ref 的线路），写入 public/geo/{city}-bus-lines.json
 * 用法:
 *   node scripts/fetch-osm-city-bus.js [cityId|all]
 *   node scripts/fetch-osm-city-bus.js force [cityId|all]
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const UA = 'chinasubwayplan/1.0 (railway history demo; contact: local)';
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];
const SKIP = /快速公交|^BRT|有轨电车|有軌電車|tram/i;
const SKIP_NAME = /区间|大站快车|临时|區間|加班/;
const PALETTE = [
  '#E85D04',
  '#2A9D8F',
  '#E9C46A',
  '#264653',
  '#E76F51',
  '#1D3557',
  '#457B9D',
  '#D62828',
  '#6A994E',
  '#BC4749',
  '#3D5A80',
  '#F4A261',
  '#2B2D42',
  '#8D99AE',
  '#588157',
];

const CITIES = [
  { id: 'beijing', area: '北京市', lat: 39.9, lng: 116.4, radius: 80000 },
  { id: 'shanghai', area: '上海市', lat: 31.23, lng: 121.47, radius: 70000 },
  { id: 'tianjin', area: '天津市', lat: 39.13, lng: 117.2, radius: 55000 },
  { id: 'chongqing', area: '重庆市', lat: 29.56, lng: 106.55, radius: 80000 },
  { id: 'guangzhou', area: '广州市', lat: 23.13, lng: 113.26, radius: 55000 },
  { id: 'shenzhen', area: '深圳市', lat: 22.55, lng: 114.06, radius: 50000 },
  { id: 'nanjing', area: '南京市', lat: 32.06, lng: 118.8, radius: 50000 },
  { id: 'wuhan', area: '武汉市', lat: 30.59, lng: 114.3, radius: 55000 },
  { id: 'chengdu', area: '成都市', lat: 30.67, lng: 104.07, radius: 55000 },
  { id: 'hangzhou', area: '杭州市', lat: 30.27, lng: 120.16, radius: 55000 },
  { id: 'xian', area: '西安市', lat: 34.26, lng: 108.94, radius: 50000 },
  { id: 'suzhou', area: '苏州市', lat: 31.3, lng: 120.62, radius: 55000 },
  { id: 'qingdao', area: '青岛市', lat: 36.07, lng: 120.38, radius: 55000 },
  { id: 'zhengzhou', area: '郑州市', lat: 34.75, lng: 113.66, radius: 45000 },
  { id: 'changsha', area: '长沙市', lat: 28.23, lng: 112.94, radius: 45000 },
  { id: 'hefei', area: '合肥市', lat: 31.82, lng: 117.23, radius: 40000 },
  { id: 'nanchang', area: '南昌市', lat: 28.68, lng: 115.86, radius: 40000 },
  { id: 'nanning', area: '南宁市', lat: 22.82, lng: 108.37, radius: 40000 },
  { id: 'jinan', area: '济南市', lat: 36.65, lng: 117.12, radius: 45000 },
  { id: 'shijiazhuang', area: '石家庄市', lat: 38.04, lng: 114.51, radius: 40000 },
  { id: 'kunming', area: '昆明市', lat: 25.04, lng: 102.71, radius: 45000 },
  { id: 'fuzhou', area: '福州市', lat: 26.08, lng: 119.3, radius: 40000 },
  { id: 'ningbo', area: '宁波市', lat: 29.87, lng: 121.54, radius: 45000 },
  { id: 'wuxi', area: '无锡市', lat: 31.57, lng: 120.3, radius: 40000 },
  { id: 'dongguan', area: '东莞市', lat: 23.02, lng: 113.75, radius: 45000 },
  { id: 'hongkong', area: '香港', lat: 22.32, lng: 114.17, radius: 50000, minibus: true },
  { id: 'changchun', area: '长春市', lat: 43.82, lng: 125.32, radius: 45000 },
  { id: 'dalian', area: '大连市', lat: 38.91, lng: 121.61, radius: 55000 },
  { id: 'shenyang', area: '沈阳市', lat: 41.81, lng: 123.43, radius: 45000 },
  { id: 'foshan', area: '佛山市', lat: 23.02, lng: 113.12, radius: 40000 },
  { id: 'taipei', area: '台北', lat: 25.03, lng: 121.57, radius: 35000 },
  { id: 'kaohsiung', area: '高雄', lat: 22.63, lng: 120.3, radius: 35000 },
  { id: 'harbin', area: '哈尔滨市', lat: 45.8, lng: 126.53, radius: 40000 },
  { id: 'xiamen', area: '厦门市', lat: 24.48, lng: 118.09, radius: 40000 },
  { id: 'guiyang', area: '贵阳市', lat: 26.65, lng: 106.63, radius: 40000 },
  { id: 'urumqi', area: '乌鲁木齐市', lat: 43.83, lng: 87.62, radius: 40000 },
  { id: 'wenzhou', area: '温州市', lat: 27.99, lng: 120.7, radius: 55000 },
  { id: 'lanzhou', area: '兰州市', lat: 36.06, lng: 103.83, radius: 40000 },
  { id: 'xuzhou', area: '徐州市', lat: 34.2, lng: 117.28, radius: 35000 },
  { id: 'changzhou', area: '常州市', lat: 31.81, lng: 119.97, radius: 35000 },
  { id: 'hohhot', area: '呼和浩特市', lat: 40.84, lng: 111.75, radius: 35000 },
  { id: 'macau', area: '澳门', lat: 22.2, lng: 113.54, radius: 18000 },
  { id: 'taiyuan', area: '太原市', lat: 37.87, lng: 112.55, radius: 35000 },
  { id: 'luoyang', area: '洛阳市', lat: 34.62, lng: 112.45, radius: 35000 },
  { id: 'taichung', area: '台中', lat: 24.15, lng: 120.67, radius: 30000 },
  { id: 'shaoxing', area: '绍兴市', lat: 30.05, lng: 120.58, radius: 40000 },
  { id: 'wuhu', area: '芜湖市', lat: 31.33, lng: 118.38, radius: 35000 },
  { id: 'jinhua', area: '金华市', lat: 29.08, lng: 119.65, radius: 45000 },
  { id: 'nantong', area: '南通市', lat: 32.02, lng: 120.86, radius: 40000 },
  { id: 'taizhouzj', area: '台州市', lat: 28.66, lng: 121.42, radius: 40000 },
  { id: 'chuzhou', area: '滁州市', lat: 32.3, lng: 118.32, radius: 40000 },
  { id: 'xuchang', area: '许昌市', lat: 34.02, lng: 113.83, radius: 35000 },
  { id: 'ziyang', area: '资阳市', lat: 30.12, lng: 104.64, radius: 40000 },
  { id: 'taoyuan', area: '桃园', lat: 24.99, lng: 121.3, radius: 35000 },
  { id: 'haining', area: '海宁市', lat: 30.51, lng: 120.68, radius: 30000 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function colorFor(ref, tagged) {
  if (tagged && /^#?[0-9A-Fa-f]{6}$/.test(tagged)) {
    return tagged.startsWith('#') ? tagged : `#${tagged}`;
  }
  const n = parseInt(String(ref), 10);
  if (Number.isFinite(n)) return PALETTE[n % PALETTE.length];
  let h = 0;
  for (const ch of String(ref)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function displayName(ref, name, cityArea) {
  const r = String(ref || '').trim();
  const city = String(cityArea || '').replace(/[省市]$/, '');
  let n = String(name || '')
    .replace(new RegExp(`^${city}(市)?(公交|巴士|公共汽电车)?`), '')
    .replace(/^(公交|巴士)/, '')
    .trim();
  if (/路$/.test(r) || /线$/.test(r) || /線$/.test(r) || /號$/.test(r)) return r;
  if (/[A-Za-z]/.test(r) || /号|號/.test(r)) return r;
  if (/^\d+$/.test(r)) return `${r}路`;
  if (r && /路|线|線|號|号/.test(n)) return n || r;
  if (r) return /路|线|線/.test(r) ? r : `${r}路`;
  return n || r;
}

function refSort(a, b) {
  const ka = String(a.ref || '');
  const kb = String(b.ref || '');
  const na = parseInt(ka, 10);
  const nb = parseInt(kb, 10);
  const aNum = Number.isFinite(na) && /^\d/.test(ka);
  const bNum = Number.isFinite(nb) && /^\d/.test(kb);
  if (aNum && bNum && na !== nb) return na - nb;
  if (aNum !== bNum) return aNum ? -1 : 1;
  return ka.localeCompare(kb, 'zh-CN', { numeric: true });
}

function simplify(coords, minM = 28) {
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
        const near = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 3e-4;
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

function pathFromRel(el) {
  const parts = [];
  for (const m of el.members || []) {
    if (m.type !== 'way' || !m.geometry || m.geometry.length < 2) continue;
    if (m.role && m.role !== '' && m.role !== 'forward' && m.role !== 'backward') continue;
    const coords = m.geometry.map((g) => [g.lat, g.lon]);
    if (m.role === 'backward') coords.reverse();
    parts.push(coords);
  }
  return simplify(stitch(parts), 70);
}

function endsFromRel(el) {
  const stops = [];
  for (const m of el.members || []) {
    if (!/stop|platform/i.test(m.role || '')) continue;
    const name = m.tags?.name || m.tags?.['name:zh'];
    const lat = m.lat ?? m.geometry?.[0]?.lat;
    const lon = m.lon ?? m.geometry?.[0]?.lon;
    if (!name || lat == null || lon == null) continue;
    const short = String(name).replace(/站$/, '');
    if (stops.length && stops[stops.length - 1].name === short) continue;
    stops.push({ name: short, lat, lng: lon, silent: true });
  }
  if (stops.length < 2) return [];
  return [stops[0], stops[stops.length - 1]];
}

async function overpass(query) {
  let last;
  for (const url of OVERPASS) {
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 90000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: `data=${encodeURIComponent(query)}`,
        signal: ac.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        last = new Error(`${url} ${res.status}`);
        continue;
      }
      return await res.json();
    } catch (e) {
      last = e;
    }
  }
  throw last || new Error('overpass failed');
}

function collectLines(json, city) {
  const routes = (json.elements || []).filter((el) => el.type === 'relation' && el.tags);
  const best = new Map();
  for (const el of routes) {
    const rawName = el.tags.name || el.tags.ref || el.tags['name:zh'] || '';
    const ref = String(el.tags.ref || rawName).trim();
    if (!ref) continue;
    const name = displayName(el.tags.ref || ref, rawName, city.area);
    if (SKIP.test(ref) || SKIP.test(name) || SKIP.test(rawName)) continue;
    if (SKIP_NAME.test(rawName) || SKIP_NAME.test(name)) continue;
    const path = pathFromRel(el);
    if (path.length < 4) continue;
    const key = el.tags.ref ? String(el.tags.ref).trim() : `name:${name}`;
    const prev = best.get(key);
    if (prev && prev.path.length >= path.length) continue;
    best.set(key, {
      id: el.id,
      ref: el.tags.ref ? String(el.tags.ref).trim() : name,
      name,
      color: colorFor(el.tags.ref || name, el.tags.colour || el.tags.color),
      path,
      stations: endsFromRel(el),
    });
  }
  return [...best.values()].sort(refSort);
}

function writeManifest() {
  const cities = CITIES.map((c) => c.id).filter((id) => existsSync(`public/geo/${id}-bus-lines.json`));
  writeFileSync(
    'public/geo/bus-cities.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), cities })
  );
}

function routeClause(city) {
  return city.minibus ? '^(bus|trolleybus|minibus)$' : '^(bus|trolleybus)$';
}

async function fetchCity(city) {
  console.log(`query ${city.id} bus routes…`);
  const r = city.radius || 45000;
  const route = routeClause(city);
  let oneshot = [];
  try {
    const json = await overpass(`
[out:json][timeout:180];
rel["type"="route"]["route"~"${route}"](around:${r},${city.lat},${city.lng});
out geom;
`);
    oneshot = collectLines(json, city);
    if (oneshot.length >= 30) {
      writeCityFile(city, oneshot);
      return oneshot.length;
    }
    console.log(city.id, 'oneshot', oneshot.length, 'lines → chunked');
  } catch (e) {
    console.warn(city.id, 'oneshot failed', e.message || e);
  }
  let ids = [];
  try {
    const idJson = await overpass(`
[out:json][timeout:120];
rel["type"="route"]["route"~"${route}"](around:${r},${city.lat},${city.lng});
out ids;
`);
    ids = (idJson.elements || []).filter((el) => el.type === 'relation' && el.id).map((el) => el.id);
  } catch (e) {
    console.warn(city.id, 'id query failed', e.message || e);
  }
  console.log(city.id, 'relation ids', ids.length);
  const elements = [];
  const chunk = 25;
  for (let i = 0; i < ids.length; i += chunk) {
    const part = ids.slice(i, i + chunk);
    const n = Math.floor(i / chunk) + 1;
    const total = Math.ceil(ids.length / chunk);
    let got = false;
    for (let t = 0; t < 3 && !got; t++) {
      try {
        const json = await overpass(`[out:json][timeout:90]; rel(id:${part.join(',')}); out geom;`);
        elements.push(...(json.elements || []));
        got = true;
      } catch (e) {
        console.warn(city.id, `chunk ${n}/${total} fail ${t + 1}`, e.message || e);
        await sleep(2500 * (t + 1));
      }
    }
    if (!got) console.warn(city.id, `chunk ${n}/${total} skipped`);
    else console.log(city.id, `chunk ${n}/${total}`, elements.length);
    if (i + chunk < ids.length) await sleep(300);
  }
  const chunked = collectLines({ elements }, city);
  const lines = chunked.length >= oneshot.length ? chunked : oneshot;
  writeCityFile(city, lines);
  return lines.length;
}

function writeCityFile(city, lines) {
  mkdirSync('public/geo', { recursive: true });
  writeFileSync(
    `public/geo/${city.id}-bus-lines.json`,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      city: city.id,
      attribution: '© OpenStreetMap contributors',
      count: lines.length,
      lines,
    })
  );
  console.log(
    'wrote',
    city.id,
    lines.length,
    'lines',
    lines[0]?.name || '-',
    '→',
    lines[lines.length - 1]?.name || '-',
    `→ public/geo/${city.id}-bus-lines.json`
  );
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean);
  const force = args.includes('force');
  const ids = args.filter((a) => a !== 'force' && a !== 'all');
  const list = args.includes('all') || !ids.length ? CITIES : CITIES.filter((c) => ids.includes(c.id));
  if (!list.length) {
    console.error('unknown city', ids.join(', '));
    process.exit(1);
  }
  mkdirSync('public/geo', { recursive: true });
  for (const city of list) {
    const dest = `public/geo/${city.id}-bus-lines.json`;
    if (!force && existsSync(dest)) {
      try {
        const prev = JSON.parse(readFileSync(dest, 'utf8'));
        if (prev?.count > 80) {
          console.log('skip', city.id, `(${prev.count} lines)`);
          continue;
        }
      } catch {
        /* rewrite */
      }
    }
    let tries = 0;
    while (tries < 3) {
      try {
        await fetchCity(city);
        break;
      } catch (e) {
        tries += 1;
        console.warn(city.id, 'failed', tries, e.message || e);
        if (tries >= 3) console.error('give up', city.id);
        else await sleep(8000 * tries);
      }
    }
    await sleep(1500);
  }
  writeManifest();
  console.log('done. manifest → public/geo/bus-cities.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
