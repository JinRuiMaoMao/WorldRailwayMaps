import { defineConfig } from 'vite';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const TILE_CACHE = path.resolve(process.cwd(), 'tile-cache');
const OSM_UA = 'ChinaRailwayHistory/1.0 (local video export)';

function sendFile(res, file) {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Access-Control-Allow-Origin', '*');
  fs.createReadStream(file).pipe(res);
}

function fetchOsmTile(z, x, y) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
      {
        headers: {
          'User-Agent': OSM_UA,
          Accept: 'image/png,image/*;q=0.8,*/*;q=0.5',
        },
      },
      (up) => {
        if (up.statusCode !== 200) {
          up.resume();
          reject(new Error(`OSM ${up.statusCode}`));
          return;
        }
        const chunks = [];
        up.on('data', (c) => chunks.push(c));
        up.on('end', () => resolve(Buffer.concat(chunks)));
        up.on('error', reject);
      }
    );
    req.setTimeout(4000, () => {
      req.destroy();
      reject(new Error('OSM timeout'));
    });
    req.on('error', reject);
  });
}

function osmTileCache() {
  return {
    name: 'osm-tile-cache',
    configureServer(server) {
      server.middlewares.stack.unshift({
        route: '',
        handle: handleExportTile,
      });
    },
    configurePreviewServer(server) {
      server.middlewares.stack.unshift({
        route: '',
        handle: handleExportTile,
      });
    },
  };
}

function handleExportTile(req, res, next) {
  const m = req.url?.match(/^\/export-tiles\/(\d+)\/(\d+)\/(\d+)\.png(?:\?.*)?$/);
  if (!m) return next();
  const [, z, x, y] = m;
  const file = path.join(TILE_CACHE, z, x, `${y}.png`);
  if (fs.existsSync(file) && fs.statSync(file).size > 80) {
    sendFile(res, file);
    return;
  }
  fetchOsmTile(z, x, y)
    .then((buf) => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, file);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(buf);
    })
    .catch(() => {
      if (res.headersSent) return;
      res.statusCode = 502;
      res.end();
    });
}

export default defineConfig(({ command }) => ({
  // GitHub project Pages: https://jinruimaomao.github.io/WorldRailwayMaps/
  base: command === 'serve' ? '/' : '/WorldRailwayMaps/',
  plugins: [osmTileCache()],
  server: {
    port: 5173,
    open: true,
  },
  preview: {},
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
}));
