/**
 * 桃园机场捷运 · 简办发展史 + 高德站位（taoyuan）
 */
import AMAP from './taoyuanStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "tyn-2017-x0",
    "year": 2017,
    "date": "2017-03-02",
    "title": "机场捷运开通",
    "detail": "3月2日 · 台北車 — 環北",
    "line": "機場捷運 普通車 台北車站 → 老街溪",
    "color": "#2C5AA5",
    "stations": [
      {
        "name": "台北車",
        "lng": 121.517475,
        "lat": 25.046243
      },
      {
        "name": "三重",
        "lng": 121.482905,
        "lat": 25.054699
      },
      {
        "name": "新北產業園區",
        "lng": 121.458936,
        "lat": 25.06172
      },
      {
        "name": "新莊副都心",
        "lng": 121.445777,
        "lat": 25.059227
      },
      {
        "name": "泰山",
        "lng": 121.439538,
        "lat": 25.053275
      },
      {
        "name": "泰山貴和",
        "lng": 121.422956,
        "lat": 25.033359
      },
      {
        "name": "體育大學",
        "lng": 121.385439,
        "lat": 25.041324
      },
      {
        "name": "長庚醫院",
        "lng": 121.370822,
        "lat": 25.060509
      },
      {
        "name": "林口",
        "lng": 121.361243,
        "lat": 25.065789
      },
      {
        "name": "山鼻",
        "lng": 121.285191,
        "lat": 25.080821
      },
      {
        "name": "坑口",
        "lng": 121.266478,
        "lat": 25.086455
      },
      {
        "name": "機場第一航廈",
        "lng": 121.238341,
        "lat": 25.080555
      },
      {
        "name": "機場第二航廈",
        "lng": 121.2322,
        "lat": 25.077284
      },
      {
        "name": "機場旅館",
        "lng": 121.220512,
        "lat": 25.069184
      },
      {
        "name": "大園",
        "lng": 121.210611,
        "lat": 25.055805
      },
      {
        "name": "橫山",
        "lng": 121.215761,
        "lat": 25.036469
      },
      {
        "name": "領航",
        "lng": 121.221078,
        "lat": 25.024085
      },
      {
        "name": "高鐵桃園",
        "lng": 121.21409,
        "lat": 25.01372
      },
      {
        "name": "桃園體育園區",
        "lng": 121.203292,
        "lat": 25.001776
      },
      {
        "name": "興南",
        "lng": 121.216399,
        "lat": 24.98
      },
      {
        "name": "環北",
        "lng": 121.220668,
        "lat": 24.967175
      }
    ],
    "planned": false
  },
  {
    "id": "tyn-2023-x1",
    "year": 2023,
    "date": "2023-07-31",
    "title": "老街溪站开通",
    "detail": "7月31日 · 環北 — 老街溪",
    "line": "機場捷運 普通車 台北車站 → 老街溪",
    "color": "#2C5AA5",
    "stations": [
      {
        "name": "環北",
        "lng": 121.220668,
        "lat": 24.967175
      },
      {
        "name": "老街溪",
        "lng": 121.219326,
        "lat": 24.95859
      }
    ],
    "planned": false
  },
  {
    "id": "tyn-2035-x2",
    "year": 2035,
    "title": "桃园捷运远期（规划）",
    "detail": "2035 展望",
    "line": "機場捷運 普通車 台北車站 → 老街溪",
    "color": "#2C5AA5",
    "stations": [
      {
        "name": "台北車",
        "lng": 121.517475,
        "lat": 25.046243
      },
      {
        "name": "三重",
        "lng": 121.482905,
        "lat": 25.054699
      },
      {
        "name": "新北產業園區",
        "lng": 121.458936,
        "lat": 25.06172
      },
      {
        "name": "新莊副都心",
        "lng": 121.445777,
        "lat": 25.059227
      },
      {
        "name": "泰山",
        "lng": 121.439538,
        "lat": 25.053275
      },
      {
        "name": "泰山貴和",
        "lng": 121.422956,
        "lat": 25.033359
      },
      {
        "name": "體育大學",
        "lng": 121.385439,
        "lat": 25.041324
      },
      {
        "name": "長庚醫院",
        "lng": 121.370822,
        "lat": 25.060509
      },
      {
        "name": "林口",
        "lng": 121.361243,
        "lat": 25.065789
      },
      {
        "name": "山鼻",
        "lng": 121.285191,
        "lat": 25.080821
      },
      {
        "name": "坑口",
        "lng": 121.266478,
        "lat": 25.086455
      },
      {
        "name": "機場第一航廈",
        "lng": 121.238341,
        "lat": 25.080555
      },
      {
        "name": "機場第二航廈",
        "lng": 121.2322,
        "lat": 25.077284
      },
      {
        "name": "機場旅館",
        "lng": 121.220512,
        "lat": 25.069184
      },
      {
        "name": "大園",
        "lng": 121.210611,
        "lat": 25.055805
      },
      {
        "name": "橫山",
        "lng": 121.215761,
        "lat": 25.036469
      },
      {
        "name": "領航",
        "lng": 121.221078,
        "lat": 25.024085
      },
      {
        "name": "高鐵桃園",
        "lng": 121.21409,
        "lat": 25.01372
      },
      {
        "name": "桃園體育園區",
        "lng": 121.203292,
        "lat": 25.001776
      },
      {
        "name": "興南",
        "lng": 121.216399,
        "lat": 24.98
      },
      {
        "name": "環北",
        "lng": 121.220668,
        "lat": 24.967175
      },
      {
        "name": "老街溪",
        "lng": 121.219326,
        "lat": 24.95859
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const TAOYUAN_SCENES = buildCityScenes({
  prefix: 'tyn',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '桃园机场捷运线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":121.3,"lat":24.99},
});

export const TAOYUAN_META = {
  id: 'taoyuan',
  label: '桃园机场捷运',
  blurb: '简办3.0 · 2017 起逐段开通',
};
