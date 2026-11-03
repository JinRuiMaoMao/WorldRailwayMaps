/**
 * 暂停时手动编辑的覆盖数据（localStorage）
 * 参考 Rail Map Painter：可拖站点 / 改线位，并持久化
 */
import DEFAULT_EDITS from './defaultMapEdits.json' with { type: 'json' };

const KEY = 'chinasubwayplan.mapEdits.v1';
const VER_KEY = 'chinasubwayplan.mapEdits.ver';
const DEFAULT_VER = DEFAULT_EDITS.version || '1';

function empty() {
  return { stations: {}, paths: {}, extraStations: {}, extraLines: {}, updatedAt: null };
}

const SIMPLIFY_VER = `${DEFAULT_VER}-as-is`;

/** 抽稀折线：仅一期灰线总路径使用。OSM / 港铁场景线不抽稀。 */
export function simplifyPath(path, stations = [], maxPts = 64) {
  if (!path?.length || path.length <= maxPts) return path.map((p) => [p[0], p[1]]);
  const must = new Set([0, path.length - 1]);
  for (const st of stations) {
    if (st?.lat == null || st?.lng == null) continue;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < path.length; i++) {
      const d = Math.hypot(path[i][0] - st.lat, path[i][1] - st.lng);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    must.add(best);
  }
  const step = Math.ceil(path.length / maxPts);
  for (let i = 0; i < path.length; i += step) must.add(i);
  must.add(path.length - 1);
  return [...must]
    .sort((a, b) => a - b)
    .map((i) => [path[i][0], path[i][1]]);
}

function stationListFromEdits(data) {
  return Object.entries(data.stations || {}).map(([name, o]) => ({
    name,
    lat: o.lat,
    lng: o.lng,
  }));
}

function sparsifyPayload(payload) {
  const sts = stationListFromEdits(payload);
  const paths = {};
  for (const [id, path] of Object.entries(payload.paths || {})) {
    paths[id] = simplifyPath(path, sts, 64);
  }
  return { ...payload, paths };
}

/** 写入内置默认（如用户导出的成稿）；版本变化时覆盖旧缓存，并抽稀密点 */
export function seedDefaultEdits({ force = false } = {}) {
  try {
    const cur = localStorage.getItem(VER_KEY);
    if (!force && cur === SIMPLIFY_VER && localStorage.getItem(KEY)) return loadEditsRaw();
    const payload = {
      stations: DEFAULT_EDITS.stations || {},
      paths: DEFAULT_EDITS.paths || {},
      extraStations: DEFAULT_EDITS.extraStations || {},
      extraLines: DEFAULT_EDITS.extraLines || {},
      updatedAt: DEFAULT_EDITS.updatedAt || new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
    localStorage.setItem(VER_KEY, SIMPLIFY_VER);
    return payload;
  } catch {
    return empty();
  }
}

function loadEditsRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    return {
      stations: data.stations || {},
      paths: data.paths || {},
      extraStations: data.extraStations || {},
      extraLines: data.extraLines || {},
      updatedAt: data.updatedAt || null,
    };
  } catch {
    return empty();
  }
}

export function loadEdits() {
  try {
    if (!localStorage.getItem(KEY) || localStorage.getItem(VER_KEY) !== SIMPLIFY_VER) {
      return seedDefaultEdits({ force: true });
    }
    return loadEditsRaw();
  } catch {
    return empty();
  }
}

function persist(data) {
  data.updatedAt = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

/** 把折线最近点拉到站点（拖站后线跟着走） */
export function alignPathToStations(path, stations) {
  if (!path?.length || !stations?.length) return path;
  const out = path.map((p) => [p[0], p[1]]);
  const used = new Set();
  for (const st of stations) {
    if (!st?.name || st.lat == null || st.lng == null) continue;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < out.length; i++) {
      if (used.has(i)) continue;
      const d = Math.hypot(out[i][0] - st.lat, out[i][1] - st.lng);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    // 约 2.5km 内才吸附，避免误拉远处顶点
    if (best >= 0 && bestD < 0.025) {
      out[best] = [st.lat, st.lng];
      used.add(best);
    }
  }
  return out;
}

/** 同名不同站（九铁旺角 vs 地铁旺角）约 200 m 以上视为另一处 */
export const HOMONYM_DEG = 0.002;
/** 约 11m 内视为同一站台；更远的同名站（换乘）各留在自己的线上，不挤到一点 */
export const SAME_PLATFORM_DEG = 0.0001;

export function stationEditKey(name, segId) {
  return segId ? `${segId}::${name}` : name;
}

export function setStationOverride(name, lng, lat, segId, { keyedOnly = false } = {}) {
  if (!name) return loadEdits();
  const data = loadEdits();
  const pt = { lng: +lng, lat: +lat };
  if (segId) data.stations[stationEditKey(name, segId)] = pt;
  if (!keyedOnly) {
    const cur = data.stations[name];
    // 裸名覆盖只给「同一处」；远处同名不互相覆盖
    if (!cur || Math.hypot(cur.lat - pt.lat, cur.lng - pt.lng) <= HOMONYM_DEG) {
      data.stations[name] = pt;
    }
  }
  return persist(data);
}

export function clearStationOverride(name, segId) {
  const data = loadEdits();
  if (segId) delete data.stations[stationEditKey(name, segId)];
  else delete data.stations[name];
  return persist(data);
}

/** 一期运营段 id：线位必须与灰线 bj-l1-1969 重合，禁止单独存一份 */
export const PHASE1_MASTER_ID = 'bj-l1-1969';
export const PHASE1_CHILD_IDS = new Set([
  'bj-l1-1971-01',
  'bj-l1-1971-08',
  'bj-l1-1971-11',
  'bj-l1-1973',
  'bj-l1-1978',
]);

function nearestIdx(path, lat, lng) {
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

/** 把子段写回总灰线对应区间，保持几何唯一 */
function spliceIntoMaster(master, segment) {
  if (!master?.length || !segment?.length) return master;
  const a = nearestIdx(master, segment[0][0], segment[0][1]);
  const b = nearestIdx(master, segment[segment.length - 1][0], segment[segment.length - 1][1]);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  let ordered = segment.map((p) => [p[0], p[1]]);
  if (a > b) ordered = ordered.reverse();
  return [...master.slice(0, lo), ...ordered, ...master.slice(hi + 1)];
}

export function slicePathByStations(path, startSt, endSt) {
  if (!path?.length || !startSt || !endSt) return path;
  const a = nearestIdx(path, startSt.lat, startSt.lng);
  const b = nearestIdx(path, endSt.lat, endSt.lng);
  let out = path.slice(Math.min(a, b), Math.max(a, b) + 1).map((p) => [p[0], p[1]]);
  const d0 = Math.hypot(out[0][0] - startSt.lat, out[0][1] - startSt.lng);
  const d1 = Math.hypot(out[out.length - 1][0] - startSt.lat, out[out.length - 1][1] - startSt.lng);
  if (d0 > d1) out = out.reverse();
  return out;
}

export function setPathOverride(segId, path) {
  const data = loadEdits();
  const pts = path.map((p) => (Array.isArray(p) ? [+p[0], +p[1]] : [+p.lat, +p.lng]));
  if (PHASE1_CHILD_IDS.has(segId)) {
    // 运营段改线 → 写回灰线总路径，删掉子段独立覆盖
    const master = data.paths[PHASE1_MASTER_ID];
    if (master?.length) data.paths[PHASE1_MASTER_ID] = spliceIntoMaster(master, pts);
    delete data.paths[segId];
  } else {
    data.paths[segId] = pts;
  }
  return persist(data);
}

export function clearPathOverride(segId) {
  const data = loadEdits();
  delete data.paths[segId];
  return persist(data);
}

export function clearAllEdits() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(VER_KEY);
  return empty();
}

export function applyStationCoords(st, segId) {
  if (!st?.name || st.keepCoords) return st;
  const edits = loadEdits().stations;
  const sid = segId || st.segId;
  const keyed = sid ? edits[stationEditKey(st.name, sid)] : null;
  if (keyed) return { ...st, lng: keyed.lng, lat: keyed.lat };
  const o = edits[st.name];
  if (!o) return st;
  if (st.lat != null && st.lng != null) {
    const d = Math.hypot(st.lat - o.lat, st.lng - o.lng);
    // 裸名坐标只合并同一站台；换乘站（另一条线的同名点）不拉过去
    if (d > SAME_PLATFORM_DEG) return st;
  }
  return { ...st, lng: o.lng, lat: o.lat };
}

export function getPathOverride(segId) {
  return loadEdits().paths[segId] || null;
}

/** 取线位（覆盖优先）；一期运营段从灰线总路径裁切并抽稀，其余 OSM 场景线原样保留 */
export function resolveSegPath(segId, basePath, stations) {
  const edits = loadEdits();
  const sts = (stations || []).map((s) => applyStationCoords(s, segId));

  // 运营段：只从一期灰线总路径裁，保证与不开放灰线重合（含长礼联络线）
  if (PHASE1_CHILD_IDS.has(segId) && sts.length >= 2) {
    const master =
      (edits.paths[PHASE1_MASTER_ID]?.length >= 2 && edits.paths[PHASE1_MASTER_ID]) ||
      (DEFAULT_EDITS.paths?.[PHASE1_MASTER_ID]?.length >= 2 && DEFAULT_EDITS.paths[PHASE1_MASTER_ID]) ||
      null;
    if (master) {
      return slicePathByStations(master, sts[0], sts[sts.length - 1]);
    }
  }

  let path = edits.paths[segId]?.length >= 2 ? edits.paths[segId] : basePath;
  if (!path?.length) return path;
  // OSM / 场景线位与手改线位都原样用，不把轨道拽到换乘站的共用坐标
  return path.map((p) => [p[0], p[1]]);
}

export function extraStationsFor(segId) {
  return loadEdits().extraStations?.[segId] || [];
}

export function extraLinesList() {
  return Object.values(loadEdits().extraLines || {});
}

export function upsertExtraLine(line) {
  if (!line?.id) return loadEdits();
  const data = loadEdits();
  if (!data.extraLines) data.extraLines = {};
  data.extraLines[line.id] = { ...data.extraLines[line.id], ...line };
  return persist(data);
}

export function removeExtraLine(id) {
  const data = loadEdits();
  if (data.extraLines) delete data.extraLines[id];
  delete data.paths[id];
  if (data.extraStations) delete data.extraStations[id];
  return persist(data);
}

export function addExtraStation(segId, name, lng, lat) {
  if (!segId || !name) return loadEdits();
  const data = loadEdits();
  if (!data.extraStations) data.extraStations = {};
  if (!data.extraStations[segId]) data.extraStations[segId] = [];
  const list = data.extraStations[segId];
  const rec = { name, lng: +lng, lat: +lat };
  const i = list.findIndex((s) => s.name === name);
  if (i >= 0) list[i] = rec;
  else list.push(rec);
  persist(data);
  return setStationOverride(name, lng, lat, segId, { keyedOnly: true });
}

export function removeExtraStation(segId, name) {
  const data = loadEdits();
  if (data.extraStations?.[segId]) {
    data.extraStations[segId] = data.extraStations[segId].filter((s) => s.name !== name);
  }
  if (segId) delete data.stations[stationEditKey(name, segId)];
  return persist(data);
}

export function exportEditsJson() {
  return JSON.stringify(loadEdits(), null, 2);
}

export function importEditsJson(text) {
  const data = JSON.parse(text);
  const next = {
    stations: data.stations || {},
    paths: data.paths || {},
    extraStations: data.extraStations || {},
    extraLines: data.extraLines || {},
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
