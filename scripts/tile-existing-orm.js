/**
 * 将已有单文件 orm-rails（schema1/2 flat）切成 schema2 分块目录
 *   node scripts/tile-existing-orm.js us jp gb
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { WORLD_COUNTRIES } from '../src/data/worldCatalog.js';

const HUGE = new Set(['us', 'ru', 'ca', 'br', 'au', 'id', 'cn']);
const TILED = new Set([
  'us', 'ru', 'ca', 'br', 'au', 'in', 'id', 'mx', 'ar', 'kz', 'cn',
  'de', 'fr', 'gb', 'es', 'it', 'pl', 'ua', 'tr', 'jp',
]);

function pathBBox(path) {
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
  return [w, s, e, n];
}

function spanOf(id) {
  if (HUGE.has(id)) return 4;
  if (TILED.has(id)) return 2;
  return 8;
}

function tileCountry(id) {
  const country = WORLD_COUNTRIES.find((c) => c.id === id);
  if (!country?.bbox) {
    console.warn('unknown', id);
    return;
  }
  const srcPath = `public/geo/world/${id}-orm-rails.json`;
  if (!existsSync(srcPath)) {
    console.warn('missing', srcPath);
    return;
  }
  const src = JSON.parse(readFileSync(srcPath, 'utf8'));
  if (src.tiled && src.schema >= 2 && existsSync(`public/geo/world/orm/${id}/index.json`)) {
    console.log('already tiled', id);
    return;
  }
  const segments = src.segments || [];
  const stations = src.stations || [];
  const routes = src.routes || [];
  if (!segments.length && !stations.length && !routes.length) {
    console.warn('empty', id);
    return;
  }
  const span = spanOf(id);
  const [bw, bs, be, bn] = country.bbox;
  const tiles = [];
  let iy = 0;
  for (let y = bs; y < bn - 1e-9; y += span, iy++) {
    let ix = 0;
    for (let x = bw; x < be - 1e-9; x += span, ix++) {
      tiles.push({
        key: `${iy}_${ix}`,
        south: y,
        west: x,
        north: Math.min(bn, y + span),
        east: Math.min(be, x + span),
      });
    }
  }
  const dir = `public/geo/world/orm/${id}`;
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(`${dir}/t`, { recursive: true });
  const buckets = new Map(tiles.map((t) => [t.key, { segments: [], stations: [], routes: [] }]));
  const place = (item, bbox, kind) => {
    const cx = (bbox[0] + bbox[2]) / 2;
    const cy = (bbox[1] + bbox[3]) / 2;
    for (const t of tiles) {
      if (cx >= t.west && cx < t.east && cy >= t.south && cy < t.north) {
        buckets.get(t.key)[kind].push(item);
        return;
      }
    }
    buckets.get(tiles[0].key)[kind].push(item);
  };
  for (const s of segments) if (s.path?.length) place(s, pathBBox(s.path), 'segments');
  for (const s of stations) place(s, [s.lng, s.lat, s.lng, s.lat], 'stations');
  for (const r of routes) if (r.path?.length) place(r, pathBBox(r.path), 'routes');

  const indexTiles = [];
  let segN = 0;
  let stN = 0;
  let rtN = 0;
  for (const t of tiles) {
    const b = buckets.get(t.key);
    if (!b.segments.length && !b.stations.length && !b.routes.length) continue;
    writeFileSync(
      `${dir}/t/${t.key}.json`,
      JSON.stringify({
        schema: 2,
        country: id,
        key: t.key,
        bbox: [t.west, t.south, t.east, t.north],
        ...b,
      })
    );
    indexTiles.push({
      key: t.key,
      bbox: [t.west, t.south, t.east, t.north],
      segments: b.segments.length,
      stations: b.stations.length,
      routes: b.routes.length,
    });
    segN += b.segments.length;
    stN += b.stations.length;
    rtN += b.routes.length;
  }
  const index = {
    generatedAt: new Date().toISOString(),
    schema: 2,
    country: id,
    tiled: true,
    attribution: '© OpenStreetMap contributors',
    bbox: country.bbox,
    span,
    count: { segments: segN, stations: stN, routes: rtN },
    tiles: indexTiles,
    note: 'tiled from existing flat extract; re-fetch force for stations/routes enrich',
  };
  writeFileSync(`${dir}/index.json`, JSON.stringify(index));
  writeFileSync(
    srcPath,
    JSON.stringify({
      generatedAt: index.generatedAt,
      schema: 2,
      country: id,
      tiled: true,
      index: `orm/${id}/index.json`,
      attribution: index.attribution,
      count: segN,
      segments: [],
      stations: [],
      routes: [],
    })
  );
  console.log('tiled', id, 'segs', segN, 'st', stN, 'rt', rtN, 'tiles', indexTiles.length);
}

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('usage: node scripts/tile-existing-orm.js us jp gb');
  process.exit(1);
}
for (const id of ids) tileCountry(id);
