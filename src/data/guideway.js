/** 轨道区间：地下 / 地面 / 高架 */

export function mergeKind(a, b) {
  if (a === 'elevated' || b === 'elevated') return 'elevated';
  if (a === 'ground' || b === 'ground') return 'ground';
  return a || b || 'tunnel';
}

export function wayKind(tags = {}, { defaultKind = 'tunnel' } = {}) {
  const loc = String(tags.location || '').toLowerCase();
  const layer = Number(tags.layer);
  if (tags.tunnel && tags.tunnel !== 'no') return 'tunnel';
  if (loc === 'underground' || loc === 'indoor') return 'tunnel';
  if (Number.isFinite(layer) && layer < 0) return 'tunnel';
  if (tags.bridge && tags.bridge !== 'no') return 'elevated';
  if (loc === 'bridge' || loc === 'viaduct' || loc === 'overground') return 'elevated';
  if (Number.isFinite(layer) && layer > 0) return 'elevated';
  if (loc === 'surface' || loc === 'ground') return 'ground';
  if (tags.cutting && tags.cutting !== 'no') return 'ground';
  if (tags.embankment && tags.embankment !== 'no') return 'ground';
  if (tags.railway === 'monorail') return 'elevated';
  if (tags.railway === 'tram') return 'ground';
  if (tags.railway === 'light_rail') return defaultKind === 'tunnel' ? 'ground' : defaultKind;
  return defaultKind;
}

function near(u, v) {
  return Math.hypot(u[0] - v[0], u[1] - v[1]) < 2e-4;
}

function chainOf(part) {
  const path = part.coords;
  const kind = path.slice(0, -1).map(() => part.kind);
  return { path, kind };
}

function reverseChain(c) {
  return { path: c.path.slice().reverse(), kind: c.kind.slice().reverse() };
}

function concatChains(a, b) {
  return {
    path: a.path.concat(b.path.slice(1)),
    kind: a.kind.concat(b.kind),
  };
}

/** parts: [{ coords:[[lat,lng]], kind:'tunnel'|'ground'|'elevated' }] */
export function stitchTyped(parts) {
  if (!parts.length) return { path: [], kind: [] };
  const unused = parts.map(chainOf);
  const chains = [];
  while (unused.length) {
    let chain = unused.shift();
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < unused.length; i++) {
        const p = unused[i];
        const a0 = chain.path[0];
        const a1 = chain.path[chain.path.length - 1];
        const b0 = p.path[0];
        const b1 = p.path[p.path.length - 1];
        if (near(a1, b0)) {
          chain = concatChains(chain, p);
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (near(a1, b1)) {
          chain = concatChains(chain, reverseChain(p));
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (near(a0, b1)) {
          chain = concatChains(p, chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
        if (near(a0, b0)) {
          chain = concatChains(reverseChain(p), chain);
          unused.splice(i, 1);
          grew = true;
          break;
        }
      }
    }
    chains.push(chain);
  }
  chains.sort((a, b) => b.path.length - a.path.length);
  return chains[0] || { path: [], kind: [] };
}

function distPointToSeg(lat, lng, a, b) {
  const abx = b[1] - a[1];
  const aby = b[0] - a[0];
  const apx = lng - a[1];
  const apy = lat - a[0];
  const ab2 = abx * abx + aby * aby || 1e-12;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
  return Math.hypot(lat - (a[0] + aby * t), lng - (a[1] + abx * t));
}

/** 把源折线的区间类型投到目标折线的每条边上 */
export function mapKindToPath(srcPath, srcKind, destPath) {
  if (!destPath || destPath.length < 2) return [];
  if (!srcPath || srcPath.length < 2 || !srcKind?.length) {
    return new Array(destPath.length - 1).fill('tunnel');
  }
  const out = [];
  for (let i = 0; i < destPath.length - 1; i++) {
    const lat = (destPath[i][0] + destPath[i + 1][0]) / 2;
    const lng = (destPath[i][1] + destPath[i + 1][1]) / 2;
    let best = 0;
    let bestD = Infinity;
    const n = Math.min(srcKind.length, srcPath.length - 1);
    for (let j = 0; j < n; j++) {
      const d = distPointToSeg(lat, lng, srcPath[j], srcPath[j + 1]);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    out.push(srcKind[best] || 'tunnel');
  }
  return out;
}

export function spansFromKind(kind) {
  if (!kind?.length) return [];
  const spans = [];
  let i = 0;
  while (i < kind.length) {
    const type = kind[i] || 'tunnel';
    let j = i + 1;
    while (j < kind.length && (kind[j] || 'tunnel') === type) j++;
    spans.push({ type, i0: i, i1: j });
    i = j;
  }
  return spans;
}

function nearestOnPath(path, lat, lng) {
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

/** 仅有站名区间时的兜底（OSM 未带 kind） */
export function kindFromNamedSpans(path, stations, { elevatedSpans = [], groundSpans = [] } = {}) {
  if (!path || path.length < 2) return [];
  const kind = new Array(path.length - 1).fill('tunnel');
  const byName = new Map((stations || []).map((s) => [s.name, s]));
  const paint = (spans, type) => {
    for (const sp of spans || []) {
      const a = byName.get(sp.from);
      const b = byName.get(sp.to);
      if (a?.lat == null || b?.lat == null) continue;
      const i0 = nearestOnPath(path, a.lat, a.lng);
      const i1 = nearestOnPath(path, b.lat, b.lng);
      const lo = Math.min(i0, i1);
      const hi = Math.max(i0, i1);
      for (let i = lo; i < hi; i++) kind[i] = type;
    }
  };
  paint(groundSpans, 'ground');
  paint(elevatedSpans, 'elevated');
  return kind;
}
