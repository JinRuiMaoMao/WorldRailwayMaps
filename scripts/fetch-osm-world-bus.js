/**
 * 世界公交 OSM → public/geo/world/{id}-bus.json
 *   node scripts/fetch-osm-world-bus.js tokyo london nyc
 *   node scripts/fetch-osm-world-bus.js all
 *   node scripts/fetch-osm-world-bus.js auckland force
 *   node scripts/fetch-osm-world-bus.js probe auckland WX1 70
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { WORLD_CITIES } from '../src/data/worldCatalog.js';

const UA = 'chinasubwayplan/1.0 (world bus; OSM)';
const SCHEMA = 3;
const OVERPASS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];
const SKIP = /快速公交|^BRT|tram/i;
const SKIP_NAME = /express extra|temporary|区间|加班|临时|school bus/i;
const WAY_ROLES = new Set(['', 'forward', 'backward', 'hail_and_ride']);
const PALETTE = ['#E85D04', '#2A9D8F', '#E9C46A', '#264653', '#E76F51', '#1D3557', '#457B9D', '#D62828'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function colorFor(ref, tagged) {
  if (tagged && /^#?[0-9A-Fa-f]{6}$/.test(tagged)) return tagged.startsWith('#') ? tagged : `#${tagged}`;
  let h = 0;
  for (const ch of String(ref)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function displayName(ref, name, tags = {}) {
  const r = String(ref || '').trim();
  const n = String(name || '').trim();
  const from = String(tags.from || '').trim();
  const to = String(tags.to || '').trim();
  const head = /^\d+$/.test(r) ? r : r || n;
  if (head && from && to && from !== to) return `${head} ${from} — ${to}`;
  if (/路$|线$|線$/.test(r)) return r;
  if (/^\d+$/.test(r)) return r;
  return n || r;
}

function hypotM(a, b) {
  return Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 85000);
}

function pathLen(path) {
  let m = 0;
  for (let i = 1; i < path.length; i++) m += hypotM(path[i - 1], path[i]);
  return m;
}

function bboxDiag(path) {
  let s = Infinity;
  let n = -Infinity;
  let w = Infinity;
  let e = -Infinity;
  for (const p of path) {
    if (p[0] < s) s = p[0];
    if (p[0] > n) n = p[0];
    if (p[1] < w) w = p[1];
    if (p[1] > e) e = p[1];
  }
  return hypotM([s, w], [n, e]);
}

function capEdges(orig, dp, maxM) {
  if (!dp?.length || !orig?.length) return dp || [];
  if (maxEdge(dp) <= maxM) return dp;
  const find = (pt, from) => {
    for (let i = from; i < orig.length; i++) {
      if (orig[i][0] === pt[0] && orig[i][1] === pt[1]) return i;
    }
    return from;
  };
  const out = [dp[0]];
  let oi = find(dp[0], 0);
  for (let k = 1; k < dp.length; k++) {
    const oj = find(dp[k], oi);
    if (hypotM(out[out.length - 1], dp[k]) > maxM && oj > oi) {
      for (let t = oi + 1; t < oj; t++) {
        if (hypotM(out[out.length - 1], orig[t]) >= maxM * 0.65) out.push(orig[t]);
      }
    }
    out.push(dp[k]);
    oi = Math.max(oi, oj);
  }
  return out;
}

function douglasPeucker(coords, tolM = 8) {
  if (coords.length < 3) return coords;
  const keep = new Uint8Array(coords.length);
  keep[0] = 1;
  keep[coords.length - 1] = 1;
  const stack = [[0, coords.length - 1]];
  const dist2 = (a, b, p) => {
    const ax = a[1] * 85000;
    const ay = a[0] * 111000;
    const bx = b[1] * 85000;
    const by = b[0] * 111000;
    const px = p[1] * 85000;
    const py = p[0] * 111000;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const x = ax + dx * t - px;
    const y = ay + dy * t - py;
    return x * x + y * y;
  };
  const tol2 = tolM * tolM;
  while (stack.length) {
    const [i, j] = stack.pop();
    let maxD = 0;
    let maxK = i;
    const a = coords[i];
    const b = coords[j];
    for (let k = i + 1; k < j; k++) {
      const d = dist2(a, b, coords[k]);
      if (d > maxD) {
        maxD = d;
        maxK = k;
      }
    }
    if (maxD > tol2) {
      keep[maxK] = 1;
      stack.push([i, maxK], [maxK, j]);
    }
  }
  return coords.filter((_, i) => keep[i]);
}

function concatJoin(chain, part) {
  if (!part?.length) return chain;
  if (!chain.length) return part.slice();
  const a1 = chain[chain.length - 1];
  const d0 = hypotM(a1, part[0]);
  const d1 = hypotM(a1, part[part.length - 1]);
  const use = d1 + 1 < d0 ? part.slice().reverse() : part;
  const skip = hypotM(a1, use[0]) < 8;
  return chain.concat(skip ? use.slice(1) : use);
}

/** 只沿路拼接：空隙超过 maxGapM 就断开，避免穿街区飞线 */
function sequentialStitch(parts, maxGapM = 180) {
  let chain = [];
  const chains = [];
  for (const p of parts) {
    if (!p?.length) continue;
    if (!chain.length) {
      chain = p.slice();
      continue;
    }
    const a1 = chain[chain.length - 1];
    const d = Math.min(hypotM(a1, p[0]), hypotM(a1, p[p.length - 1]));
    if (d <= maxGapM) chain = concatJoin(chain, p);
    else {
      chains.push(chain);
      chain = p.slice();
    }
  }
  if (chain.length) chains.push(chain);
  chains.sort((a, b) => pathLen(b) - pathLen(a));
  return chains[0] || [];
}

/** 近端贪心成链；剩余链只接短空隙，不拉千米直线 */
function greedyThenJoin(parts, maxJoinM = 280) {
  const unused = parts.map((p) => p.slice()).filter((p) => p.length >= 2);
  const chains = [];
  const NEAR = 160;
  while (unused.length) {
    let chain = unused.shift();
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < unused.length; i++) {
        const p = unused[i];
        const a0 = chain[0];
        const a1 = chain[chain.length - 1];
        const b0 = p[0];
        const b1 = p[p.length - 1];
        if (hypotM(a1, b0) < NEAR) {
          chain = concatJoin(chain, p);
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (hypotM(a1, b1) < NEAR) {
          chain = concatJoin(chain, p.slice().reverse());
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (hypotM(a0, b1) < NEAR) {
          chain = concatJoin(p, chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (hypotM(a0, b0) < NEAR) {
          chain = concatJoin(p.slice().reverse(), chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
      }
    }
    chains.push(chain);
  }
  const cs = chains;
  while (cs.length > 1) {
    let best = null;
    for (let i = 0; i < cs.length; i++) {
      for (let j = 0; j < cs.length; j++) {
        if (i === j) continue;
        const A = cs[i];
        const B = cs[j];
        const cand = [
          { d: hypotM(A[A.length - 1], B[0]), merge: () => concatJoin(A, B) },
          { d: hypotM(A[A.length - 1], B[B.length - 1]), merge: () => concatJoin(A, B.slice().reverse()) },
        ];
        for (const c of cand) {
          if (!best || c.d < best.d) best = { i, j, ...c };
        }
      }
    }
    if (!best || best.d > maxJoinM) break;
    const merged = best.merge();
    const drop = [best.i, best.j].sort((a, b) => b - a);
    for (const idx of drop) cs.splice(idx, 1);
    cs.push(merged);
  }
  cs.sort((a, b) => pathLen(b) - pathLen(a));
  return cs[0] || [];
}

function pathScore(path) {
  if (!path || path.length < 2) return -1;
  const span = Math.max(hypotM(path[0], path[path.length - 1]), bboxDiag(path));
  const len = pathLen(path);
  const wiggle = len / Math.max(span, 200);
  return span - Math.max(0, wiggle - 1.85) * span * 0.45;
}

function goodEnough(path, el) {
  if (!path || path.length < 8) return false;
  if (isLoop(el?.tags || {})) return true;
  const span = hypotM(path[0], path[path.length - 1]);
  const len = pathLen(path);
  if (span < 600) return false;
  const wiggle = len / Math.max(span, 200);
  const jump = maxEdge(path);
  if (wiggle < 1.45 && jump < 400) return true;
  const diag = bboxDiag(path);
  return span > diag * 0.5 && wiggle < 2.05 && jump < 400;
}

function diameterIndices(path) {
  let i = 0;
  let dmax = -1;
  for (let k = 0; k < path.length; k++) {
    const d = hypotM(path[0], path[k]);
    if (d > dmax) {
      dmax = d;
      i = k;
    }
  }
  let j = 0;
  dmax = -1;
  for (let k = 0; k < path.length; k++) {
    const d = hypotM(path[i], path[k]);
    if (d > dmax) {
      dmax = d;
      j = k;
    }
  }
  return i < j ? [i, j] : [j, i];
}

function thinIdx(arr, max = 20) {
  if (arr.length <= max) return arr;
  const out = [arr[0]];
  const step = (arr.length - 1) / (max - 1);
  for (let i = 1; i < max - 1; i++) out.push(arr[Math.round(i * step)]);
  out.push(arr[arr.length - 1]);
  return [...new Set(out)];
}

function nearestIndices(path, pt, maxM = 450) {
  const hits = [];
  for (let k = 0; k < path.length; k++) {
    if (hypotM(path[k], pt) <= maxM) hits.push(k);
  }
  if (hits.length) return thinIdx(hits);
  let best = 0;
  let bestD = Infinity;
  for (let k = 0; k < path.length; k++) {
    const d = hypotM(path[k], pt);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return [best];
}

function maxEdge(path) {
  let m = 0;
  for (let i = 1; i < path.length; i++) m = Math.max(m, hypotM(path[i - 1], path[i]));
  return m;
}

function shortestSlice(path, a, b) {
  const ia = nearestIndices(path, a);
  const ib = nearestIndices(path, b);
  const cand = [];
  for (const i of ia) {
    for (const j of ib) {
      if (i === j) continue;
      const lo = Math.min(i, j);
      const hi = Math.max(i, j);
      if (hi - lo < 4) continue;
      const slice = path.slice(lo, hi + 1);
      cand.push({ slice, len: pathLen(slice), jump: maxEdge(slice), n: hi - lo });
    }
  }
  if (!cand.length) return null;
  const ok = cand.filter((c) => c.jump < 400 && c.n >= 6);
  if (!ok.length) return null;
  ok.sort((x, y) => {
    const wa = x.len / Math.max(hypotM(x.slice[0], x.slice[x.slice.length - 1]), 200);
    const wb = y.len / Math.max(hypotM(y.slice[0], y.slice[y.slice.length - 1]), 200);
    return wa - wb || x.len - y.len;
  });
  return ok[0].slice;
}

function diameterSlice(path, el) {
  if (isLoop(el?.tags || {}) || path.length < 8) return path;
  const len = pathLen(path);
  const span = hypotM(path[0], path[path.length - 1]);
  const diag = bboxDiag(path);
  const [i, j] = diameterIndices(path);
  if (j - i < 4) return path;
  const short = shortestSlice(path, path[i], path[j]);
  if (span > diag * 0.5 && len < diag * 2.15 && (!short || len <= pathLen(short) * 1.08)) return path;
  return short || path.slice(i, j + 1);
}

function stopPoints(el) {
  const out = [];
  for (const m of el.members || []) {
    if (!/stop|platform/i.test(m.role || '')) continue;
    const lat = m.lat ?? m.geometry?.[0]?.lat;
    const lon = m.lon ?? m.geometry?.[0]?.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    out.push([lat, lon]);
  }
  return out;
}

function orientPath(path, el) {
  if (path.length < 2) return path;
  const stops = stopPoints(el);
  if (!stops.length) return path;
  const first = stops[0];
  const last = stops[stops.length - 1];
  const dSame = hypotM(path[0], first) + (stops.length > 1 ? hypotM(path[path.length - 1], last) : 0);
  const dFlip = hypotM(path[path.length - 1], first) + (stops.length > 1 ? hypotM(path[0], last) : 0);
  if (dFlip + 40 < dSame) path.reverse();
  return path;
}

function isLoop(tags = {}) {
  if (/yes/i.test(tags.roundtrip || '')) return true;
  return /link|loop|环|循环|circular/i.test(`${tags.name || ''} ${tags.ref || ''}`);
}

function pathQuality(path) {
  if (!path || path.length < 2) return -1e9;
  const span = hypotM(path[0], path[path.length - 1]);
  const len = pathLen(path);
  const jump = maxEdge(path);
  const wiggle = len / Math.max(span, 200);
  return (
    span * 1.1 -
    Math.max(0, wiggle - 1.25) * span * 1.2 -
    Math.max(0, jump - 180) * 4 +
    Math.min(path.length, 120) * 6
  );
}

function firstLeg(path) {
  if (path.length < 8) return path;
  const a = path[0];
  const span = hypotM(a, path[path.length - 1]);
  if (span < 400) return path;
  let peakI = 0;
  let peakD = -1;
  for (let i = 0; i < path.length; i++) {
    const d = hypotM(a, path[i]);
    if (d > peakD) {
      peakD = d;
      peakI = i;
    }
    if (peakD > span * 0.88 && peakI > 4 && d < peakD * 0.75 && i - peakI > 4) {
      return path.slice(0, peakI + 1);
    }
  }
  return path;
}

function betterPath(a, b) {
  if (!a?.length) return b;
  if (!b?.length) return a;
  const ja = maxEdge(a);
  const jb = maxEdge(b);
  if (ja > 700 && jb <= 400 && ja > jb * 2) return b;
  if (jb > 700 && ja <= 400 && jb > ja * 2) return a;
  const sa = hypotM(a[0], a[a.length - 1]);
  const sb = hypotM(b[0], b[b.length - 1]);
  if (ja <= 400 && jb <= 400) {
    if (sa > sb * 1.12 && sa > 800) return a;
    if (sb > sa * 1.12 && sb > 800) return b;
  }
  return pathQuality(a) >= pathQuality(b) ? a : b;
}

function splitJumps(path, maxM = 400) {
  if (!path || path.length < 2) return [];
  const chains = [];
  let cur = [path[0]];
  for (let i = 1; i < path.length; i++) {
    if (hypotM(path[i - 1], path[i]) > maxM) {
      if (cur.length >= 2) chains.push(cur);
      cur = [path[i]];
    } else cur.push(path[i]);
  }
  if (cur.length >= 2) chains.push(cur);
  return chains;
}

function pickCityChain(chains, city) {
  if (!chains.length) return [];
  const origin = city ? [city.lat, city.lng] : null;
  const r = city ? (city.radius || 35000) * 1.2 : Infinity;
  const scored = chains.map((c) => {
    const mid = c[Math.floor(c.length / 2)];
    return {
      c,
      far: origin ? hypotM(mid, origin) > r : false,
      diag: bboxDiag(c),
      span: hypotM(c[0], c[c.length - 1]),
      len: pathLen(c),
    };
  });
  const pool = scored.filter((x) => !x.far);
  if (!pool.length) return [];
  pool.sort((a, b) => b.diag - a.diag || b.span - a.span || b.len - a.len);
  return pool[0].c;
}

function finishPath(path, el) {
  path = diameterSlice(path, el);
  path = orientPath(path, el);
  path = firstLeg(path);
  path = orientPath(path, el);
  return path;
}

function pathFromRel(el, city) {
  const parts = [];
  for (const m of el.members || []) {
    if (m.type !== 'way' || !m.geometry || m.geometry.length < 2) continue;
    const role = m.role || '';
    if (role && !WAY_ROLES.has(role)) continue;
    const coords = [];
    for (const g of m.geometry) {
      if (!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
      coords.push([g.lat, g.lon]);
    }
    if (coords.length < 2) continue;
    if (role === 'backward') coords.reverse();
    parts.push(coords);
  }
  if (!parts.length) return [];
  const seq = sequentialStitch(parts, 180);
  const greedy = greedyThenJoin(parts, 280);
  let path = finishPath(betterPath(seq, greedy), el);
  if (maxEdge(path) > 1500) {
    const chains = splitJumps(path, 1500);
    path = pickCityChain(chains, city);
    if (!path.length) return [];
    path = orientPath(path, el);
  } else if (city && path.length) {
    const mid = path[Math.floor(path.length / 2)];
    if (hypotM(mid, [city.lat, city.lng]) > (city.radius || 35000) * 1.25) return [];
  }
  return capEdges(path, douglasPeucker(path, 8), 280);
}

function lineKey(tags, id) {
  const ref = String(tags.ref || '').trim();
  if (ref) return `ref:${ref}`;
  const name = String(tags['name:en'] || tags.name || '')
    .replace(/[（(]?\s*(inbound|outbound|aller|retour|去程|回程|上り|下り)\s*[)）]?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return name ? `name:${name}` : `id:${id}`;
}

function lineScore(path, tags) {
  let s = pathScore(path);
  if (tags.from && tags.to) s += 800;
  if (String(tags['public_transport:version']) === '2') s += 200;
  const blob = `${tags.name || ''} ${tags.description || ''} ${tags.from || ''} ${tags.to || ''}`;
  if (/school|short trip|partial|ends at/i.test(blob)) s -= 5000;
  const iv = Number(tags.interval);
  if (iv > 0 && iv <= 15) s += 150;
  return s;
}

function terminiOf(el, path) {
  if (path.length < 2) return [];
  const from = String(el.tags?.from || '').trim();
  const to = String(el.tags?.to || '').trim();
  const a = path[0];
  const b = path[path.length - 1];
  if (from && to && from !== to) {
    return [
      { name: from, lat: a[0], lng: a[1] },
      { name: to, lat: b[0], lng: b[1] },
    ];
  }
  return [];
}

function collectLines(json, city) {
  const best = new Map();
  for (const el of json.elements || []) {
    if (el.type !== 'relation' || !el.tags) continue;
    const route = el.tags.route || '';
    if (!/^(bus|trolleybus|minibus)$/.test(route)) continue;
    const ref = String(el.tags.ref || '').trim();
    const rawName = el.tags.name || ref || `rel-${el.id}`;
    const name = displayName(ref, rawName, el.tags);
    if (SKIP.test(ref) || SKIP.test(name) || SKIP_NAME.test(rawName)) continue;
    let path = [];
    try {
      path = pathFromRel(el, city);
    } catch {
      continue;
    }
    if (path.length < 4 && pathLen(path) < 600) continue;
    const key = lineKey(el.tags, el.id);
    const score = lineScore(path, el.tags);
    const prev = best.get(key);
    if (prev && prev.score >= score) continue;
    best.set(key, {
      id: el.id,
      ref: ref || key,
      name,
      color: colorFor(ref || key, el.tags.colour || el.tags.color),
      path,
      stations: terminiOf(el, path),
      score,
    });
  }
  return [...best.values()].map(({ score, ...line }) => line);
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

function cityBBox(city) {
  const r = Math.round((city.radius || 35000) * 1.15);
  const lat = city.lat;
  const lng = city.lng;
  const dlat = r / 111000;
  const dlng = r / (111000 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  return {
    s: lat - dlat,
    w: lng - dlng,
    n: lat + dlat,
    e: lng + dlng,
    r,
  };
}

function writeCityFile(city, lines) {
  mkdirSync('public/geo/world', { recursive: true });
  writeFileSync(
    `public/geo/world/${city.id}-bus.json`,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      city: city.id,
      attribution: '© OpenStreetMap contributors',
      count: lines.length,
      complete: true,
      schema: SCHEMA,
      lines,
    })
  );
  console.log('wrote', city.id, lines.length, '→ public/geo/world/' + city.id + '-bus.json');
}

async function fetchGeomChunks(ids, label) {
  const elements = [];
  const chunk = 20;
  for (let i = 0; i < ids.length; i += chunk) {
    const part = ids.slice(i, i + chunk);
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const json = await overpass(`[out:json][timeout:90]; rel(id:${part.join(',')}); out geom;`);
        elements.push(...(json.elements || []));
        console.log('  geom', Math.min(i + chunk, ids.length), '/', ids.length);
        ok = true;
      } catch (e) {
        console.warn(label, 'chunk fail', attempt + 1, e.message || e);
        await sleep(1200 * (attempt + 1));
      }
    }
    if (i + chunk < ids.length) await sleep(400);
  }
  return elements;
}

async function fetchCity(city) {
  console.log('bus', city.id, city.nameZh);
  const bb = cityBBox(city);
  const route = '^(bus|trolleybus|minibus)$';
  const idJson = await overpass(`
[out:json][timeout:180];
rel["type"="route"]["route"~"${route}"](${bb.s},${bb.w},${bb.n},${bb.e});
out ids;
`);
  const ids = (idJson.elements || []).filter((el) => el.type === 'relation' && el.id).map((el) => el.id);
  console.log(city.id, 'ids', ids.length, 'bbox', Math.round(bb.r / 1000) + 'km');
  const elements = await fetchGeomChunks(ids, city.id);
  const lines = collectLines({ elements }, city);
  writeCityFile(city, lines);
  return lines;
}

function summarizeLine(line) {
  const a = line.path[0];
  const b = line.path[line.path.length - 1];
  const from = line.stations?.[0]?.name || '';
  const to = line.stations?.[line.stations.length - 1]?.name || '';
  return {
    ref: line.ref,
    id: line.id,
    name: line.name,
    km: +(pathLen(line.path) / 1000).toFixed(1),
    span: +(hypotM(a, b) / 1000).toFixed(1),
    jump: Math.round(maxEdge(line.path)),
    pts: line.path.length,
    from,
    to,
    start: a.map((x) => +x.toFixed(5)),
    end: b.map((x) => +x.toFixed(5)),
  };
}

async function probeCity(city, refs) {
  const want = new Set(refs.map((r) => String(r).toUpperCase()));
  if (refs.length) {
    const bb = cityBBox(city);
    const refRe = `^(${refs.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`;
    const json = await overpass(
      `[out:json][timeout:90]; rel["type"="route"]["route"~"^(bus|trolleybus|minibus)$"]["ref"~"${refRe}"](${bb.s},${bb.w},${bb.n},${bb.e}); out geom;`
    );
    const lines = collectLines(json, city);
    for (const line of lines) console.log(JSON.stringify(summarizeLine(line)));
    console.log('probe relations', (json.elements || []).length, 'kept', lines.length);
    if (want.size && !lines.length) console.warn('no matching refs', [...want].join(','));
    return;
  }
  const lines = await fetchCity(city);
  for (const line of lines.slice(0, 8)) console.log(JSON.stringify(summarizeLine(line)));
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean);
  const force = args.includes('force');
  const probe = args.includes('probe');
  const ids = args.filter((a) => a !== 'force' && a !== 'all' && a !== 'probe');
  mkdirSync('public/geo/world', { recursive: true });
  if (probe) {
    const cityId = ids[0];
    const refs = ids.slice(1);
    const city = WORLD_CITIES.find((c) => c.id === cityId);
    if (!city) {
      console.error('unknown city', cityId);
      process.exit(1);
    }
    await probeCity(city, refs);
    console.log('done');
    return;
  }
  const list = args.includes('all') || !ids.length ? WORLD_CITIES : WORLD_CITIES.filter((c) => ids.includes(c.id));
  if (!list.length) {
    console.error('unknown city', ids.join(','));
    process.exit(1);
  }
  for (const city of list) {
    if (city.country === 'cn') {
      console.log('skip china', city.id);
      continue;
    }
    const dest = `public/geo/world/${city.id}-bus.json`;
    if (!force && existsSync(dest)) {
      try {
        const prev = JSON.parse(readFileSync(dest, 'utf8'));
        const n = prev?.count || prev?.lines?.length || 0;
        if (prev?.schema >= SCHEMA && (prev?.complete || n >= 40)) {
          console.log('skip', city.id, n);
          continue;
        }
        if (n >= 80) {
          console.log('skip fat', city.id, n, 'schema', prev?.schema || 0);
          continue;
        }
      } catch {
        /* rewrite */
      }
    }
    try {
      await fetchCity(city);
    } catch (e) {
      console.error('FAIL', city.id, e.message || e);
    }
    await sleep(1500);
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
