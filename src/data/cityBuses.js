/** 各城公交 OSM 线位：挂到分镜，并按城懒加载 */

const SKIP = /快速公交|^BRT|西郊|亦庄有轨|有轨电车|有軌電車/i;
const bound = new Set();
const inflight = new Map();

export const CITY_BUS_SCENES = {};

export function attachCityBusScenes(cities) {
  for (const { id, scenes } of cities) {
    if (!scenes) continue;
    let sc = scenes.find((s) => /(?:^|-)buses$/.test(s.id || ''));
    if (!sc) {
      sc = {
        id: `${id}-buses`,
        year: 2026,
        title: '公交线网',
        detail: '公共汽电车 · OSM 线位',
        kind: 'metro',
        instantSegments: true,
        atlasOnly: true,
        segments: [],
      };
      scenes.push(sc);
    } else {
      sc.instantSegments = true;
      sc.atlasOnly = true;
    }
    CITY_BUS_SCENES[id] = sc;
  }
}

export function cityBusSegments(data, cityId) {
  if (!data?.lines?.length) return [];
  return data.lines
    .filter((l) => l.path?.length >= 2 && !SKIP.test(l.name || l.ref || ''))
    .map((l) => ({
      id: `${cityId}-bus-${l.id || l.ref}`,
      line: l.name,
      color: l.color,
      style: 'bus',
      osmFull: true,
      path: l.path,
      skipLabels: true,
      cityId,
      stations: l.stations || [],
    }));
}

export function bindCityBuses(cityId, data) {
  const sc = CITY_BUS_SCENES[cityId];
  if (!sc) return [];
  const segs = cityBusSegments(data, cityId);
  sc.segments.length = 0;
  for (const seg of segs) sc.segments.push(seg);
  bound.add(cityId);
  return segs;
}

export function cityBusesBound(cityId) {
  return bound.has(cityId);
}

export async function loadBusManifest() {
  try {
    const res = await fetch('/geo/bus-cities.json');
    if (!res.ok) return ['beijing'];
    const json = await res.json();
    return Array.isArray(json?.cities) ? json.cities : ['beijing'];
  } catch {
    return ['beijing'];
  }
}

const worldBusSegs = new Map();

export function bindWorldBuses(cityId, data) {
  const segs = cityBusSegments(data, cityId);
  worldBusSegs.set(cityId, segs);
  bound.add(cityId);
  return segs;
}

export async function fetchCityBusData(cityId) {
  if (!cityId) return null;
  for (const url of [`/geo/${cityId}-bus-lines.json`, `/geo/world/${cityId}-bus.json`]) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      return await res.json();
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function ensureCityBuses(cityId) {
  if (!cityId) return [];
  if (bound.has(cityId)) {
    return CITY_BUS_SCENES[cityId]?.segments || worldBusSegs.get(cityId) || [];
  }
  if (inflight.has(cityId)) return inflight.get(cityId);
  const job = (async () => {
    const data = await fetchCityBusData(cityId);
    if (!data?.lines?.length) {
      bound.add(cityId);
      if (CITY_BUS_SCENES[cityId]) {
        CITY_BUS_SCENES[cityId].segments.length = 0;
        return [];
      }
      worldBusSegs.set(cityId, []);
      return [];
    }
    if (CITY_BUS_SCENES[cityId]) return bindCityBuses(cityId, data);
    return bindWorldBuses(cityId, data);
  })();
  inflight.set(cityId, job);
  try {
    return await job;
  } finally {
    inflight.delete(cityId);
  }
}

export function allBoundCityBusSegments() {
  const out = [];
  for (const sc of Object.values(CITY_BUS_SCENES)) {
    const segs = sc?.segments;
    if (!segs?.length) continue;
    for (const seg of segs) out.push(seg);
  }
  for (const segs of worldBusSegs.values()) {
    for (const seg of segs) out.push(seg);
  }
  return out;
}

/** 启动时把已有公交 JSON 全部挂上，图上一次铺开 */
export async function loadAllCityBuses(cityIds, onProgress) {
  const ids = cityIds?.length ? cityIds : Object.keys(CITY_BUS_SCENES);
  const BATCH = 4;
  let done = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    await Promise.allSettled(chunk.map((id) => ensureCityBuses(id)));
    done += chunk.length;
    onProgress?.(done, ids.length);
  }
}
