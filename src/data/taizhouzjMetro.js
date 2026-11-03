/**
 * 台州轨道交通 · 简办发展史 + 高德站位（taizhouzj）
 */
import AMAP from './taizhouzjStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "tzzj-2022-x0",
    "year": 2022,
    "date": "2022-12-28",
    "title": "S1线开通",
    "detail": "12月28日 · 台州火车站 — 城南",
    "line": "轨道交通S1线",
    "color": "#01A2E2",
    "stations": [
      {
        "name": "台州火车站",
        "lng": 121.369183,
        "lat": 28.655846
      },
      {
        "name": "学院路",
        "lng": 121.398324,
        "lat": 28.640938
      },
      {
        "name": "国博中心",
        "lng": 121.395183,
        "lat": 28.624096
      },
      {
        "name": "汇丰路",
        "lng": 121.384591,
        "lat": 28.613727
      },
      {
        "name": "锦泰",
        "lng": 121.364421,
        "lat": 28.601516
      },
      {
        "name": "恩泽医院",
        "lng": 121.33281,
        "lat": 28.590123
      },
      {
        "name": "台州汽车南站",
        "lng": 121.324327,
        "lat": 28.570802
      },
      {
        "name": "泽国",
        "lng": 121.333297,
        "lat": 28.499238
      },
      {
        "name": "温岭火车站",
        "lng": 121.322234,
        "lat": 28.481999
      },
      {
        "name": "汇川王",
        "lng": 121.328862,
        "lat": 28.436543
      },
      {
        "name": "温岭第一人民医院",
        "lng": 121.339111,
        "lat": 28.407443
      },
      {
        "name": "九龙大道",
        "lng": 121.355644,
        "lat": 28.395901
      },
      {
        "name": "万昌路",
        "lng": 121.372137,
        "lat": 28.380469
      },
      {
        "name": "南屏",
        "lng": 121.381778,
        "lat": 28.366876
      },
      {
        "name": "城南",
        "lng": 121.410551,
        "lat": 28.318505
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const TAIZHOUZJ_SCENES = buildCityScenes({
  prefix: 'tzzj',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '台州轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":121.42,"lat":28.66},
});

export const TAIZHOUZJ_META = {
  id: 'taizhouzj',
  label: '台州轨道交通',
  blurb: '简办3.0 · 2022 起逐段开通',
};
