/**
 * 列出各城高德线名，对照 extras 已用线路
 * 用法: node scripts/list-amap-lines.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NEW_CITY_META } from './city-metro-extras.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function usedLines(meta) {
  return new Set((meta.extra || []).map((e) => e.line));
}

for (const file of fs.readdirSync(path.join(root, 'src/data'))) {
  const m = file.match(/^(\w+)Stations(Amap|Osm)\.json$/);
  if (!m) continue;
  const city = m[1];
  const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data', file), 'utf8'));
  const lines = Object.keys(data.lines || {});
  if (!lines.length) continue;
  const used = usedLines(NEW_CITY_META[city] || {});
  console.log('\n==', city, file, lines.length, '==');
  for (const name of lines) {
    const n = data.lines[name].stations?.length || 0;
    const ends = data.lines[name].stations || [];
    const mark = [...used].some((u) => name.includes(u.replace(/地铁|轨道交通/g, '')) || u.includes(name.replace(/地铁|轨道交通/g, '')))
      ? 'used'
      : 'NEW';
    console.log(`  ${mark.padEnd(4)} ${name} (${n}) ${ends[0] || ''} — ${ends[ends.length - 1] || ''}`);
  }
}
