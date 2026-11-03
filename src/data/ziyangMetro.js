/**
 * 资阳轨道交通 · 简办发展史 + 高德站位（ziyang）
 */
import AMAP from './ziyangStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "zy-2024-x0",
    "year": 2024,
    "date": "2024-09-29",
    "title": "资阳线开通",
    "detail": "9月29日 · 福田 — 资阳北站",
    "line": "S3资阳线: 福田 → 资阳北站",
    "color": "#9D9D9E",
    "stations": [
      {
        "name": "福田",
        "lng": 104.384875,
        "lat": 30.280656
      },
      {
        "name": "资阳北站",
        "lng": 104.678613,
        "lat": 30.129489
      }
    ],
    "planned": false
  },
  {
    "id": "zy-2035-x1",
    "year": 2035,
    "title": "资阳线延伸（规划）",
    "detail": "2035 展望",
    "line": "S3资阳线: 福田 → 资阳北站",
    "color": "#9D9D9E",
    "stations": [
      {
        "name": "福田",
        "lng": 104.384875,
        "lat": 30.280656
      },
      {
        "name": "资阳北站",
        "lng": 104.678613,
        "lat": 30.129489
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const ZIYANG_SCENES = buildCityScenes({
  prefix: 'zy',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '资阳轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":104.64,"lat":30.12},
});

export const ZIYANG_META = {
  id: 'ziyang',
  label: '资阳轨道交通',
  blurb: '简办3.0 · 2024 起逐段开通',
};
