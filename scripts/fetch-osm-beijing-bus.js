/**
 * 拉取北京公共汽电车（1路起全部有 ref 的线路）
 * 用法: node scripts/fetch-osm-beijing-bus.js
 */
import { writeFileSync, mkdirSync } from 'fs';

const UA = 'chinasubwayplan/1.0 (railway history demo; contact: local)';
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const SKIP = /快速公交|^BRT|西郊|亦庄有轨|有轨电车/i;
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

function displayName(ref, name) {
  const r = String(ref || '').trim();
  if (/^\d+$/.test(r)) return `${r}路`;
  if (/路$/.test(r)) return r;
  if (r) return /路|线/.test(r) ? r : `${r}路`;
  return String(name || '').replace(/^北京(公交|巴士)?/, '') || r;
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
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: `data=${encodeURIComponent(query)}`,
      });
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

async function main() {
  console.log('query Beijing bus routes…');
  const q = `
[out:json][timeout:240];
area["name"="北京市"]["admin_level"="4"]->.a;
rel(area.a)["type"="route"]["route"~"^(bus|trolleybus)$"]["ref"];
out geom;
`;
  const json = await overpass(q);
  const routes = (json.elements || []).filter((el) => el.type === 'relation' && el.tags?.ref);
  console.log('raw routes', routes.length);

  const best = new Map();
  for (const el of routes) {
    const ref = String(el.tags.ref).trim();
    const name = displayName(ref, el.tags.name || el.tags.ref);
    if (!ref || SKIP.test(ref) || SKIP.test(name) || SKIP.test(el.tags.name || '')) continue;
    if (/区间|大站|快车|临时/.test(el.tags.name || '')) continue;
    const path = pathFromRel(el);
    if (path.length < 8) continue;
    const prev = best.get(ref);
    if (prev && prev.path.length >= path.length) continue;
    best.set(ref, {
      id: el.id,
      ref,
      name,
      color: colorFor(ref, el.tags.colour || el.tags.color),
      path,
      stations: endsFromRel(el),
    });
  }

  const lines = [...best.values()].sort(refSort);
  mkdirSync('public/geo', { recursive: true });
  const out = {
    generatedAt: new Date().toISOString(),
    city: 'beijing',
    attribution: '© OpenStreetMap contributors',
    count: lines.length,
    lines,
  };
  writeFileSync('public/geo/beijing-bus-lines.json', JSON.stringify(out));
  console.log(
    'wrote',
    lines.length,
    'lines',
    lines[0]?.name,
    '→',
    lines[lines.length - 1]?.name,
    '→ public/geo/beijing-bus-lines.json'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
