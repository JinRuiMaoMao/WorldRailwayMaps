/** 底图瓦片：浏览器 Cache Storage，刷新/下次导出不用再向 OSM 拉 */

const CACHE_NAME = 'china-railway-osm-tiles-v1';

let cachePromise = null;

export function openTileCache() {
  if (!cachePromise) {
    cachePromise =
      typeof caches !== 'undefined'
        ? caches.open(CACHE_NAME).catch(() => null)
        : Promise.resolve(null);
  }
  return cachePromise;
}

export async function getCachedTileBlob(url) {
  const cache = await openTileCache();
  if (cache) {
    try {
      const hit = await cache.match(url);
      if (hit?.ok) {
        const blob = await hit.blob();
        if (blob.size > 80) return blob;
      }
    } catch {
      /* quota / private mode */
    }
  }
  const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error(`tile ${res.status}`);
  if (cache) {
    try {
      await cache.put(url, res.clone());
    } catch {
      /* quota */
    }
  }
  return res.blob();
}

export async function warmupTile(url) {
  try {
    const blob = await getCachedTileBlob(url);
    return blob.size > 80;
  } catch {
    return false;
  }
}
