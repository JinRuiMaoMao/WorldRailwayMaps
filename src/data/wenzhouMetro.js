/**
 * 温州轨道交通 · 简办发展史 + 高德站位（wenzhou）
 */
import AMAP from './wenzhouStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "wz-2019-x0",
    "year": 2019,
    "date": "2019-01-23",
    "title": "S1线西段开通",
    "detail": "1月23日 · 桐岭 — 奥体中心",
    "line": "轨道交通S1线",
    "color": "#027CFF",
    "stations": [
      {
        "name": "桐岭",
        "lng": 120.564865,
        "lat": 27.92426
      },
      {
        "name": "潘桥",
        "lng": 120.569913,
        "lat": 27.944096
      },
      {
        "name": "动车南站",
        "lng": 120.579953,
        "lat": 27.970425
      },
      {
        "name": "新桥",
        "lng": 120.623651,
        "lat": 27.980803
      },
      {
        "name": "德政",
        "lng": 120.645989,
        "lat": 27.9792
      },
      {
        "name": "龙霞路",
        "lng": 120.665738,
        "lat": 27.982558
      },
      {
        "name": "惠民路",
        "lng": 120.692849,
        "lat": 27.982821
      },
      {
        "name": "三垟湿地",
        "lng": 120.709847,
        "lat": 27.976226
      },
      {
        "name": "龙腾路",
        "lng": 120.758769,
        "lat": 27.961843
      },
      {
        "name": "科技城",
        "lng": 120.780297,
        "lat": 27.957885
      },
      {
        "name": "瑶溪",
        "lng": 120.778981,
        "lat": 27.933704
      },
      {
        "name": "奥体中心",
        "lng": 120.806889,
        "lat": 27.918807
      }
    ],
    "planned": false
  },
  {
    "id": "wz-2019-x1",
    "year": 2019,
    "date": "2019-09-28",
    "title": "S1线东段开通",
    "detail": "9月28日 · 奥体中心 — 双瓯大道",
    "line": "轨道交通S1线",
    "color": "#027CFF",
    "stations": [
      {
        "name": "奥体中心",
        "lng": 120.806889,
        "lat": 27.918807
      },
      {
        "name": "永中",
        "lng": 120.823984,
        "lat": 27.911721
      },
      {
        "name": "机场",
        "lng": 120.842851,
        "lat": 27.909213
      },
      {
        "name": "灵昆",
        "lng": 120.888139,
        "lat": 27.956542
      },
      {
        "name": "瓯江口",
        "lng": 120.915991,
        "lat": 27.943773
      },
      {
        "name": "瓯华",
        "lng": 120.930949,
        "lat": 27.933902
      },
      {
        "name": "双瓯大道",
        "lng": 120.946892,
        "lat": 27.923219
      }
    ],
    "planned": false
  },
  {
    "id": "wz-2023-x2",
    "year": 2023,
    "date": "2023-08-26",
    "title": "S2线开通",
    "detail": "8月26日 · 清东路 — 东山",
    "line": "轨道交通S2线",
    "color": "#E3002A",
    "stations": [
      {
        "name": "清东路",
        "lng": 120.998817,
        "lat": 28.132416
      },
      {
        "name": "旭阳路",
        "lng": 120.982178,
        "lat": 28.111771
      },
      {
        "name": "万岙",
        "lng": 120.963891,
        "lat": 28.09119
      },
      {
        "name": "盐盆",
        "lng": 120.970062,
        "lat": 28.067344
      },
      {
        "name": "新望",
        "lng": 120.974625,
        "lat": 28.042136
      },
      {
        "name": "翁垟",
        "lng": 120.975567,
        "lat": 28.022468
      },
      {
        "name": "柳市东",
        "lng": 120.951206,
        "lat": 27.995426
      },
      {
        "name": "灵昆",
        "lng": 120.888139,
        "lat": 27.956542
      },
      {
        "name": "机场",
        "lng": 120.842851,
        "lat": 27.909213
      },
      {
        "name": "永兴",
        "lng": 120.819162,
        "lat": 27.890598
      },
      {
        "name": "沙城",
        "lng": 120.803287,
        "lat": 27.874303
      },
      {
        "name": "天河",
        "lng": 120.78798,
        "lat": 27.851406
      },
      {
        "name": "海城",
        "lng": 120.774346,
        "lat": 27.829666
      },
      {
        "name": "鲍田",
        "lng": 120.731313,
        "lat": 27.812235
      },
      {
        "name": "大典下",
        "lng": 120.715314,
        "lat": 27.795257
      },
      {
        "name": "汀田",
        "lng": 120.705519,
        "lat": 27.786201
      },
      {
        "name": "莘塍",
        "lng": 120.691273,
        "lat": 27.772363
      },
      {
        "name": "上望",
        "lng": 120.679407,
        "lat": 27.760786
      },
      {
        "name": "上东路",
        "lng": 120.667882,
        "lat": 27.758431
      },
      {
        "name": "东山",
        "lng": 120.650999,
        "lat": 27.756457
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const WENZHOU_SCENES = buildCityScenes({
  prefix: 'wz',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '温州轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":120.7,"lat":27.99},
});

export const WENZHOU_META = {
  id: 'wenzhou',
  label: '温州轨道交通',
  blurb: '简办3.0 · 2019 起逐段开通',
};
