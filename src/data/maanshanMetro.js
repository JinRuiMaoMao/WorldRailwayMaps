/**
 * 马鞍山轨道交通 · 简办发展史 + 高德站位（maanshan）
 */
import AMAP from './maanshanStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const MAANSHAN_SCENES = buildCityScenes({
  prefix: 'mas',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '马鞍山轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":118.51,"lat":31.67},
});

export const MAANSHAN_META = {
  id: 'maanshan',
  label: '马鞍山轨道交通',
  blurb: '简办3.0 · 2026 起逐段开通',
};
