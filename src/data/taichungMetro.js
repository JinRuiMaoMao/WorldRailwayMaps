/**
 * 台中捷运 · 简办发展史 + 高德站位（taichung）
 */
import AMAP from './taichungStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "tc-2021-x0",
    "year": 2021,
    "date": "2021-04-25",
    "title": "绿线开通",
    "detail": "4月25日 · 北屯總 — 高鐵臺中",
    "line": "綠線",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "北屯總",
        "lng": 120.708722,
        "lat": 24.189161
      },
      {
        "name": "舊社",
        "lng": 120.707314,
        "lat": 24.182354
      },
      {
        "name": "松竹",
        "lng": 120.701364,
        "lat": 24.180727
      },
      {
        "name": "四維國小",
        "lng": 120.693252,
        "lat": 24.171279
      },
      {
        "name": "文心崇德",
        "lng": 120.685002,
        "lat": 24.172212
      },
      {
        "name": "文心中清",
        "lng": 120.670586,
        "lat": 24.173727
      },
      {
        "name": "文華高中",
        "lng": 120.660648,
        "lat": 24.17153
      },
      {
        "name": "文心櫻花",
        "lng": 120.653874,
        "lat": 24.167796
      },
      {
        "name": "市政府",
        "lng": 120.649192,
        "lat": 24.162119
      },
      {
        "name": "水安宮",
        "lng": 120.64675,
        "lat": 24.153243
      },
      {
        "name": "文心森林公園",
        "lng": 120.646687,
        "lat": 24.145446
      },
      {
        "name": "南屯",
        "lng": 120.646653,
        "lat": 24.140549
      },
      {
        "name": "豐樂公園",
        "lng": 120.646412,
        "lat": 24.132339
      },
      {
        "name": "大慶",
        "lng": 120.647507,
        "lat": 24.119069
      },
      {
        "name": "九張犁",
        "lng": 120.639941,
        "lat": 24.114413
      },
      {
        "name": "九德",
        "lng": 120.634331,
        "lat": 24.110957
      },
      {
        "name": "烏日",
        "lng": 120.624866,
        "lat": 24.108896
      },
      {
        "name": "高鐵臺中",
        "lng": 120.614112,
        "lat": 24.110118
      }
    ],
    "planned": false
  },
  {
    "id": "tc-2035-x1",
    "year": 2035,
    "title": "台中捷运远期（规划）",
    "detail": "2035 展望",
    "line": "綠線",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "北屯總",
        "lng": 120.708722,
        "lat": 24.189161
      },
      {
        "name": "舊社",
        "lng": 120.707314,
        "lat": 24.182354
      },
      {
        "name": "松竹",
        "lng": 120.701364,
        "lat": 24.180727
      },
      {
        "name": "四維國小",
        "lng": 120.693252,
        "lat": 24.171279
      },
      {
        "name": "文心崇德",
        "lng": 120.685002,
        "lat": 24.172212
      },
      {
        "name": "文心中清",
        "lng": 120.670586,
        "lat": 24.173727
      },
      {
        "name": "文華高中",
        "lng": 120.660648,
        "lat": 24.17153
      },
      {
        "name": "文心櫻花",
        "lng": 120.653874,
        "lat": 24.167796
      },
      {
        "name": "市政府",
        "lng": 120.649192,
        "lat": 24.162119
      },
      {
        "name": "水安宮",
        "lng": 120.64675,
        "lat": 24.153243
      },
      {
        "name": "文心森林公園",
        "lng": 120.646687,
        "lat": 24.145446
      },
      {
        "name": "南屯",
        "lng": 120.646653,
        "lat": 24.140549
      },
      {
        "name": "豐樂公園",
        "lng": 120.646412,
        "lat": 24.132339
      },
      {
        "name": "大慶",
        "lng": 120.647507,
        "lat": 24.119069
      },
      {
        "name": "九張犁",
        "lng": 120.639941,
        "lat": 24.114413
      },
      {
        "name": "九德",
        "lng": 120.634331,
        "lat": 24.110957
      },
      {
        "name": "烏日",
        "lng": 120.624866,
        "lat": 24.108896
      },
      {
        "name": "高鐵臺中",
        "lng": 120.614112,
        "lat": 24.110118
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const TAICHUNG_SCENES = buildCityScenes({
  prefix: 'tc',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '台中捷运线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":120.67,"lat":24.15},
});

export const TAICHUNG_META = {
  id: 'taichung',
  label: '台中捷运',
  blurb: '简办3.0 · 2021 起逐段开通',
};
