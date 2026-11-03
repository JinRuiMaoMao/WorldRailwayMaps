/**
 * 海宁轨道交通 · 简办发展史 + 高德站位（haining）
 */
import AMAP from './hainingStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "hn-2021-x0",
    "year": 2021,
    "date": "2021-06-28",
    "title": "杭海城际开通",
    "detail": "6月28日 · 临平南高铁 — 浙大国际校区",
    "line": "杭海城际铁路：临平南高铁站 -> 浙大国际校区",
    "color": "#0077c8",
    "stations": [
      {
        "name": "临平南高铁",
        "lng": 120.293244,
        "lat": 30.384514
      },
      {
        "name": "许村",
        "lng": 120.350944,
        "lat": 30.41283
      },
      {
        "name": "海宁高铁西",
        "lng": 120.386269,
        "lat": 30.441835
      },
      {
        "name": "长安(东方学院)",
        "lng": 120.43366,
        "lat": 30.437279
      },
      {
        "name": "长安东",
        "lng": 120.455425,
        "lat": 30.445662
      },
      {
        "name": "周王庙",
        "lng": 120.500715,
        "lat": 30.451937
      },
      {
        "name": "盐官",
        "lng": 120.536136,
        "lat": 30.465534
      },
      {
        "name": "桐九公路",
        "lng": 120.583182,
        "lat": 30.486088
      },
      {
        "name": "斜桥",
        "lng": 120.612985,
        "lat": 30.490408
      },
      {
        "name": "皮革城",
        "lng": 120.659886,
        "lat": 30.508692
      },
      {
        "name": "海昌路",
        "lng": 120.687568,
        "lat": 30.51372
      },
      {
        "name": "浙大国际校区",
        "lng": 120.712305,
        "lat": 30.515068
      }
    ],
    "planned": false
  },
  {
    "id": "hn-2035-x1",
    "year": 2035,
    "title": "杭海城际延伸（规划）",
    "detail": "2035 展望",
    "line": "杭海城际铁路：临平南高铁站 -> 浙大国际校区",
    "color": "#0077c8",
    "stations": [
      {
        "name": "临平南高铁",
        "lng": 120.293244,
        "lat": 30.384514
      },
      {
        "name": "许村",
        "lng": 120.350944,
        "lat": 30.41283
      },
      {
        "name": "海宁高铁西",
        "lng": 120.386269,
        "lat": 30.441835
      },
      {
        "name": "长安(东方学院)",
        "lng": 120.43366,
        "lat": 30.437279
      },
      {
        "name": "长安东",
        "lng": 120.455425,
        "lat": 30.445662
      },
      {
        "name": "周王庙",
        "lng": 120.500715,
        "lat": 30.451937
      },
      {
        "name": "盐官",
        "lng": 120.536136,
        "lat": 30.465534
      },
      {
        "name": "桐九公路",
        "lng": 120.583182,
        "lat": 30.486088
      },
      {
        "name": "斜桥",
        "lng": 120.612985,
        "lat": 30.490408
      },
      {
        "name": "皮革城",
        "lng": 120.659886,
        "lat": 30.508692
      },
      {
        "name": "海昌路",
        "lng": 120.687568,
        "lat": 30.51372
      },
      {
        "name": "浙大国际校区",
        "lng": 120.712305,
        "lat": 30.515068
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const HAINING_SCENES = buildCityScenes({
  prefix: 'hn',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '海宁轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":120.68,"lat":30.51},
});

export const HAINING_META = {
  id: 'haining',
  label: '海宁轨道交通',
  blurb: '简办3.0 · 2021 起逐段开通',
};
