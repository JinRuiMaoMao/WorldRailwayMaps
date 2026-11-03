/**
 * 从 OpenStreetMap 官方 API 拉取北京地铁真实线位
 * Wiki: https://wiki.openstreetmap.org/wiki/Zh-hans:北京地铁
 *
 * 注意：Wiki 表格里的 relation 多为 route_master，需展开子 route。
 * 用法: node scripts/fetch-osm-beijing.js
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { stitchTyped, wayKind, mapKindToPath } from '../src/data/guideway.js';

const UA = 'chinasubwayplan/1.0 (railway history demo; contact: local)';

/** route_master IDs from OSM Wiki */
const LINES = [
  { key: 'l1', name: '1号线', master: 415571, color: '#A01D1D' },
  { key: 'l2', name: '2号线', master: 414866, color: '#004B87', preferName: '外环' },
  { key: 'l3', name: '3号线', master: 18420551, color: '#DE82CE', preferName: '东四十条' },
  { key: 'l4', name: '4号线', master: 420838, color: '#008C8C' },
  { key: 'l5', name: '5号线', master: 420836, color: '#A6217C' },
  { key: 'l6', name: '6号线', master: 4625142, color: '#B58500' },
  { key: 'l7', name: '7号线', master: 4624900, color: '#FFC56E' },
  { key: 'l8', name: '8号线', master: 420837, color: '#009B6B' },
  { key: 'l9', name: '9号线', master: 2674584, color: '#86B81C' },
  { key: 'l10', name: '10号线', master: 420835, color: '#0092BC', preferName: '内环' },
  { key: 'l11', name: '11号线', master: 13623628, color: '#EE797A' },
  { key: 'l12', name: '12号线', master: 18444658, color: '#8C570B' },
  { key: 'l13', name: '13号线', master: 417951, color: '#F9E700' },
  { key: 'l14', name: '14号线', master: 4624915, color: '#D4A5A5' },
  { key: 'l15', name: '15号线', master: 2688949, color: '#653EB0' },
  { key: 'l16', name: '16号线', master: 8324250, color: '#6BA539' },
  { key: 'l17', name: '17号线', master: 13625147, color: '#00A9A5' },
  { key: 'l18', name: '18号线', master: 20010806, color: '#C4A36A' },
  { key: 'l19', name: '19号线', master: 13625329, color: '#D6A461' },
  { key: 'airport', name: '首都机场线', master: 1354082, color: '#A292B0', mergeAll: true },
  { key: 'changping', name: '昌平线', master: 1350622, color: '#D986BA' },
  { key: 'fangshan', name: '房山线', master: 1350671, color: '#D86018' },
  { key: 'yanfang', name: '燕房线', master: 8469061, color: '#D86018' },
  { key: 's1', name: 'S1线', master: 8008813, color: '#B35A20' },
  { key: 'daxingAirport', name: '大兴机场线', master: 10136967, color: '#004A99' },
  { key: 'yizhuang', name: '亦庄线', master: 1350576, color: '#D0006F' },
  { key: 'xijiao', name: '西郊线', master: 8303696, color: '#FC0601' },
  { key: 'yizhuangT1', name: '亦庄有轨电车T1', master: 12567203, color: '#C41E3A' },
  { key: 'brt1', name: '快速公交1', master: 3213842, color: '#FF5C00', bus: true },
  { key: 'brt2', name: '快速公交2', master: 2271134, color: '#F4A261', bus: true },
  { key: 'brt3', name: '快速公交3', master: 1923573, color: '#E76F51', bus: true },
  { key: 'brt4', name: '快速公交4', master: 2684203, color: '#E9C46A', bus: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchXml(path) {
  const url = `https://api.openstreetmap.org/api/0.6/${path}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.text();
}

function parseOsm(xml) {
  const nodes = new Map();
  const ways = new Map();
  const relations = [];

  for (const m of xml.matchAll(
    /<node id="(\d+)"[^>]*\blat="([^"]+)"[^>]*\blon="([^"]+)"[^>]*\/?>/g
  )) {
    nodes.set(Number(m[1]), { id: Number(m[1]), lat: Number(m[2]), lon: Number(m[3]), tags: {} });
  }
  // lon before lat variant
  for (const m of xml.matchAll(
    /<node id="(\d+)"[^>]*\blon="([^"]+)"[^>]*\blat="([^"]+)"[^>]*\/?>/g
  )) {
    const id = Number(m[1]);
    if (!nodes.has(id)) nodes.set(id, { id, lat: Number(m[3]), lon: Number(m[2]), tags: {} });
  }

  for (const m of xml.matchAll(/<node id="(\d+)"[^>]*>([\s\S]*?)<\/node>/g)) {
    const n = nodes.get(Number(m[1]));
    if (!n) continue;
    for (const t of m[2].matchAll(/<tag k="([^"]+)" v="([^"]*)"\s*\/>/g)) {
      n.tags[t[1]] = decode(t[2]);
    }
  }

  for (const m of xml.matchAll(/<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)) {
    const id = Number(m[1]);
    const nds = [...m[2].matchAll(/<nd ref="(\d+)"\s*\/>/g)].map((x) => Number(x[1]));
    const tags = {};
    for (const t of m[2].matchAll(/<tag k="([^"]+)" v="([^"]*)"\s*\/>/g)) tags[t[1]] = decode(t[2]);
    ways.set(id, { id, nodes: nds, tags });
  }

  for (const m of xml.matchAll(/<relation id="(\d+)"[^>]*>([\s\S]*?)<\/relation>/g)) {
    const id = Number(m[1]);
    const members = [...m[2].matchAll(/<member type="([^"]+)" ref="(\d+)" role="([^"]*)"\s*\/>/g)].map(
      (x) => ({ type: x[1], ref: Number(x[2]), role: x[3] })
    );
    const tags = {};
    for (const t of m[2].matchAll(/<tag k="([^"]+)" v="([^"]*)"\s*\/>/g)) tags[t[1]] = decode(t[2]);
    relations.push({ id, members, tags });
  }

  return { nodes, ways, relations };
}

function decode(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function childRouteIds(masterRel) {
  return masterRel.members.filter((m) => m.type === 'relation').map((m) => m.ref);
}

function extractStops(rel, nodes) {
  const stops = [];
  for (const m of rel.members) {
    if (m.type !== 'node') continue;
    if (m.role && !m.role.includes('stop') && m.role !== 'station') continue;
    const n = nodes.get(m.ref);
    if (!n) continue;
    const name = n.tags.name || n.tags['name:zh'] || '';
    if (!name) continue;
    const short = name
      .replace(/^北京地铁/, '')
      .replace(/^首都机场/, '')
      .replace(/站$/, '');
    if (stops.length && stops[stops.length - 1].name === short) continue;
    stops.push({ name: short, lat: n.lat, lng: n.lon });
  }
  return stops;
}

function extractPath(rel, nodes, ways) {
  const parts = [];
  const rt = rel.tags.route || rel.tags.route_master || '';
  const fallback =
    rt === 'monorail'
      ? 'elevated'
      : rt === 'tram' || rt === 'light_rail' || rt === 'bus' || rt === 'trolleybus'
        ? 'ground'
        : 'tunnel';
  for (const m of rel.members) {
    if (m.type !== 'way') continue;
    if (m.role && m.role !== '' && m.role !== 'forward' && m.role !== 'backward') continue;
    const w = ways.get(m.ref);
    if (!w) continue;
    if (
      w.tags.railway &&
      !['subway', 'light_rail', 'rail', 'monorail', 'maglev', 'tram'].includes(w.tags.railway)
    ) {
      continue;
    }
    const coords = w.nodes
      .map((id) => nodes.get(id))
      .filter(Boolean)
      .map((n) => [n.lat, n.lon]);
    if (coords.length < 2) continue;
    if (m.role === 'backward') coords.reverse();
    parts.push({ coords, kind: wayKind(w.tags, { defaultKind: fallback }) });
  }
  return stitchTyped(parts);
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

function simplify(coords, minM) {
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

function nearestIndex(path, lat, lng) {
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

function pickRoute(routes, line) {
  if (!routes.length) return null;
  if (line.preferName) {
    const hit = routes.find((r) => (r.tags.name || '').includes(line.preferName));
    if (hit) return hit;
  }
  // 优先 roundtrip / 站更多 / 路径更长
  return [...routes].sort((a, b) => {
    const sa = a.stations.length;
    const sb = b.stations.length;
    if (sb !== sa) return sb - sa;
    return b.path.length - a.path.length;
  })[0];
}

async function loadRouteFull(routeId) {
  const xml = await fetchXml(`relation/${routeId}/full`);
  const { nodes, ways, relations } = parseOsm(xml);
  const rel = relations.find((r) => r.id === routeId) || relations.find((r) => r.tags.type === 'route');
  if (!rel) throw new Error(`route ${routeId} missing`);
  const stations = extractStops(rel, nodes);
  const raw = extractPath(rel, nodes, ways);
  const path = simplify(raw.path, 12);
  const kind = mapKindToPath(raw.path, raw.kind, path);
  return {
    id: routeId,
    tags: rel.tags,
    stations,
    path,
    kind,
  };
}

async function fetchLine(line) {
  console.log('master', line.name, line.master);
  const masterXml = await fetchXml(`relation/${line.master}`);
  const { relations } = parseOsm(masterXml);
  const master = relations.find((r) => r.id === line.master);
  if (!master) throw new Error('master missing');

  let routeIds = [];
  if (master.tags.type === 'route_master' || master.tags.route_master) {
    routeIds = childRouteIds(master);
  } else if (master.tags.type === 'route') {
    routeIds = [line.master];
  } else {
    routeIds = childRouteIds(master);
    if (!routeIds.length) routeIds = [line.master];
  }

  const routes = [];
  for (const rid of routeIds) {
    await sleep(800);
    try {
      const r = await loadRouteFull(rid);
      console.log('  route', rid, r.tags.name || '', 'path', r.path.length, 'stops', r.stations.length);
      if (r.path.length >= 2) routes.push(r);
    } catch (e) {
      console.warn('  skip', rid, e.message);
    }
  }

  if (line.mergeAll && routes.length > 1) {
    // 机场线：合并各支路 path（按最长主轴 + 支线）
    const main = pickRoute(routes, line);
    const path = main.path.slice();
    const stations = [];
    const seen = new Set();
    for (const r of routes) {
      for (const s of r.stations) {
        if (seen.has(s.name)) continue;
        seen.add(s.name);
        stations.push({ ...s, pathIndex: nearestIndex(path, s.lat, s.lng) });
      }
      // 把其它支线点并入（简单拼接离主轴最近端）
      if (r !== main && r.path.length) {
        path.push(...r.path);
      }
    }
    // 重新简化合并后的 path 不合理——改为：主 path + 各支线单独 segments
    return {
      key: line.key,
      name: line.name,
      master: line.master,
      color: line.color,
      source: 'OpenStreetMap',
      routes: routes.map((r) => ({
        id: r.id,
        name: r.tags.name || '',
        stations: r.stations.map((s) => ({
          ...s,
          pathIndex: nearestIndex(r.path, s.lat, s.lng),
        })),
        path: r.path,
        kind: r.kind || [],
      })),
      // 默认画最长那条；演示里机场线会画全部 routes
      stations: main.stations.map((s) => ({
        ...s,
        pathIndex: nearestIndex(main.path, s.lat, s.lng),
      })),
      path: main.path,
      kind: main.kind || [],
    };
  }

  const best = pickRoute(routes, line);
  if (!best) throw new Error('no usable route geometry');

  return {
    key: line.key,
    name: line.name,
    master: line.master,
    color: line.color,
    source: 'OpenStreetMap',
    routeId: best.id,
    routeName: best.tags.name || '',
    stations: best.stations.map((s) => ({
      ...s,
      pathIndex: nearestIndex(best.path, s.lat, s.lng),
    })),
    path: best.path,
    kind: best.kind || [],
  };
}

async function main() {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.slice(7).split(',').filter(Boolean) : null;
  const outPath = 'public/geo/beijing-osm-lines.json';
  let out = {
    generatedAt: new Date().toISOString(),
    attribution: '© OpenStreetMap contributors',
    wiki: 'https://wiki.openstreetmap.org/wiki/Zh-hans:北京地铁',
    lines: {},
  };
  try {
    const prev = JSON.parse(readFileSync(outPath, 'utf8'));
    if (prev?.lines) out = { ...prev, generatedAt: out.generatedAt, lines: { ...prev.lines } };
  } catch {
    /* first run */
  }

  const jobs = only ? LINES.filter((l) => only.includes(l.key)) : LINES;
  for (const line of jobs) {
    try {
      const data = await fetchLine(line);
      out.lines[line.key] = data;
      console.log('OK', line.name, 'path', data.path.length, 'stops', data.stations.map((s) => s.name).join('→'));
      await sleep(1000);
    } catch (e) {
      console.error('FAIL', line.name, e.message);
      await sleep(1500);
    }
  }

  mkdirSync('public/geo', { recursive: true });
  writeFileSync(outPath, JSON.stringify(out));
  console.log('wrote', Object.keys(out.lines).length, 'lines →', outPath);
  if (!Object.keys(out.lines).length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
