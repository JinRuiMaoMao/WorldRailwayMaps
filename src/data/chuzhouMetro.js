/**
 * 滁州轨道交通 · 简办发展史 + 高德站位（chuzhou）
 */
import AMAP from './chuzhouStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "chz-2023-x0",
    "year": 2023,
    "date": "2023-06-28",
    "title": "滁宁城际开通",
    "detail": "6月28日 · 花博园 — 汊河新城",
    "line": "寧滁線: 滁州高鐵站→汊河",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "花博园",
        "lng": 118.297852,
        "lat": 32.238492
      },
      {
        "name": "琅琊山",
        "lng": 118.303014,
        "lat": 32.255739
      },
      {
        "name": "滁州政务中心",
        "lng": 118.330735,
        "lat": 32.25572
      },
      {
        "name": "苏滁商务中心",
        "lng": 118.38164,
        "lat": 32.283452
      },
      {
        "name": "大王郢",
        "lng": 118.385864,
        "lat": 32.309722
      },
      {
        "name": "林楼",
        "lng": 118.405326,
        "lat": 32.313686
      },
      {
        "name": "十二里半",
        "lng": 118.503686,
        "lat": 32.291555
      },
      {
        "name": "汊河新城",
        "lng": 118.579351,
        "lat": 32.239738
      }
    ],
    "planned": false
  },
  {
    "id": "chz-2035-x1",
    "year": 2035,
    "title": "滁宁线延伸（规划）",
    "detail": "2035 展望",
    "line": "寧滁線: 滁州高鐵站→汊河",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "花博园",
        "lng": 118.297852,
        "lat": 32.238492
      },
      {
        "name": "琅琊山",
        "lng": 118.303014,
        "lat": 32.255739
      },
      {
        "name": "滁州政务中心",
        "lng": 118.330735,
        "lat": 32.25572
      },
      {
        "name": "苏滁商务中心",
        "lng": 118.38164,
        "lat": 32.283452
      },
      {
        "name": "大王郢",
        "lng": 118.385864,
        "lat": 32.309722
      },
      {
        "name": "林楼",
        "lng": 118.405326,
        "lat": 32.313686
      },
      {
        "name": "十二里半",
        "lng": 118.503686,
        "lat": 32.291555
      },
      {
        "name": "汊河新城",
        "lng": 118.579351,
        "lat": 32.239738
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const CHUZHOU_SCENES = buildCityScenes({
  prefix: 'chz',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '滁州轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":118.32,"lat":32.3},
});

export const CHUZHOU_META = {
  id: 'chuzhou',
  label: '滁州轨道交通',
  blurb: '简办3.0 · 2023 起逐段开通',
};
