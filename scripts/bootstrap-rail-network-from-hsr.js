/**
 * 用已有 *-rail.json（高速层）引导生成 *-rail-network.json，便于 Overpass 恢复前先能画铁路。
 * 之后可用 fetch-osm-world-rail-network.js force 覆盖成真全网。
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { WORLD_COUNTRIES } from '../src/data/worldCatalog.js';

const root = 'public/geo/world';
let n = 0;

for (const c of WORLD_COUNTRIES) {
  if (c.id === 'cn') continue;
  const net = `${root}/${c.id}-rail-network.json`;
  if (existsSync(net)) {
    try {
      const prev = JSON.parse(readFileSync(net, 'utf8'));
      if ((prev.count || 0) > 0 && prev.source !== 'bootstrap-from-hsr') continue;
      if ((prev.count || 0) > 0 && prev.source === 'bootstrap-from-hsr') {
        /* allow refresh */
      } else if ((prev.count || 0) > 0) continue;
    } catch {
      /* rewrite */
    }
  }

  const files = readdirSync(root).filter(
    (f) =>
      (f === `${c.id}-rail.json` || f.startsWith(`${c.id}-`) && f.endsWith('-rail.json')) &&
      !f.includes('network')
  );
  if (c.id === 'us') {
    for (const f of ['us-ne-rail.json', 'us-fl-rail.json', 'us-ca-rail.json']) {
      if (existsSync(`${root}/${f}`) && !files.includes(f)) files.push(f);
    }
  }

  const lines = [];
  const seen = new Set();
  for (const f of files) {
    let j;
    try {
      j = JSON.parse(readFileSync(`${root}/${f}`, 'utf8'));
    } catch {
      continue;
    }
    for (const l of j.lines || []) {
      if (!l.path || l.path.length < 2) continue;
      const id = String(l.id || `${f}-${lines.length}`);
      if (seen.has(id)) continue;
      seen.add(id);
      lines.push({
        id,
        name: l.name || l.ref || '铁路',
        ref: l.ref || '',
        highspeed: true,
        status: 'open',
        paths: [l.path],
      });
    }
  }

  writeFileSync(
    net,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      schema: 1,
      country: c.id,
      attribution: '© OpenStreetMap contributors',
      source: 'bootstrap-from-hsr',
      count: lines.length,
      open: lines.length,
      construction: 0,
      planned: 0,
      highspeed: lines.length,
      lines,
    })
  );
  if (lines.length) {
    n += 1;
    console.log('boot', c.id, lines.length);
  } else {
    console.log('empty', c.id);
  }
}

console.log('bootstrapped nonempty', n);
