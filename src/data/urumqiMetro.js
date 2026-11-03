/**
 * 乌鲁木齐地铁 · 简办发展史 + 高德站位（urumqi）
 */
import AMAP from './urumqiStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "urq-2018-x0",
    "year": 2018,
    "date": "2018-10-25",
    "title": "1号线北段开通",
    "detail": "10月25日 · 国际机场 — 八楼",
    "line": "轨道交通1号线",
    "color": "#2249A3",
    "stations": [
      {
        "name": "国际机场",
        "lng": 87.471315,
        "lat": 43.899581
      },
      {
        "name": "大地窝堡",
        "lng": 87.493429,
        "lat": 43.895218
      },
      {
        "name": "宣仁墩",
        "lng": 87.519446,
        "lat": 43.913404
      },
      {
        "name": "三工",
        "lng": 87.532013,
        "lat": 43.908897
      },
      {
        "name": "迎宾路口",
        "lng": 87.538905,
        "lat": 43.898889
      },
      {
        "name": "植物园",
        "lng": 87.545216,
        "lat": 43.889651
      },
      {
        "name": "体育中心",
        "lng": 87.552261,
        "lat": 43.879295
      },
      {
        "name": "铁路局",
        "lng": 87.559349,
        "lat": 43.868969
      },
      {
        "name": "小西沟",
        "lng": 87.56338,
        "lat": 43.85905
      },
      {
        "name": "中营工",
        "lng": 87.568771,
        "lat": 43.846557
      },
      {
        "name": "新疆图书馆",
        "lng": 87.571769,
        "lat": 43.839478
      },
      {
        "name": "八楼",
        "lng": 87.581669,
        "lat": 43.8335
      }
    ],
    "planned": false
  },
  {
    "id": "urq-2019-x1",
    "year": 2019,
    "date": "2019-06-28",
    "title": "1号线南段开通",
    "detail": "6月28日 · 八楼 — 三屯碑",
    "line": "轨道交通1号线",
    "color": "#2249A3",
    "stations": [
      {
        "name": "八楼",
        "lng": 87.581669,
        "lat": 43.8335
      },
      {
        "name": "王家梁",
        "lng": 87.600354,
        "lat": 43.835809
      },
      {
        "name": "南湖北路",
        "lng": 87.609631,
        "lat": 43.83163
      },
      {
        "name": "南湖广场",
        "lng": 87.610624,
        "lat": 43.820723
      },
      {
        "name": "新兴街",
        "lng": 87.612147,
        "lat": 43.81241
      },
      {
        "name": "北门",
        "lng": 87.619134,
        "lat": 43.800248
      },
      {
        "name": "南门",
        "lng": 87.616689,
        "lat": 43.78962
      },
      {
        "name": "二道桥",
        "lng": 87.614144,
        "lat": 43.779401
      },
      {
        "name": "新疆大学",
        "lng": 87.611219,
        "lat": 43.768269
      },
      {
        "name": "三屯碑",
        "lng": 87.607908,
        "lat": 43.760212
      }
    ],
    "planned": false
  },
  {
    "id": "urq-2025-x2",
    "year": 2025,
    "date": "2025-04-17",
    "title": "机场捷运开通",
    "detail": "4月17日 · 国际机场 — 国际机场北",
    "line": "机场捷运",
    "color": "#FFA500",
    "stations": [
      {
        "name": "国际机场",
        "lng": 87.471315,
        "lat": 43.899581
      },
      {
        "name": "国际机场北",
        "lng": 87.479645,
        "lat": 43.916712
      }
    ],
    "planned": false
  },
  {
    "id": "urq-2035-x3",
    "year": 2035,
    "title": "乌鲁木齐轨网远期（规划）",
    "detail": "2035 展望",
    "line": "轨道交通1号线",
    "color": "#2249A3",
    "stations": [
      {
        "name": "国际机场",
        "lng": 87.471315,
        "lat": 43.899581
      },
      {
        "name": "大地窝堡",
        "lng": 87.493429,
        "lat": 43.895218
      },
      {
        "name": "宣仁墩",
        "lng": 87.519446,
        "lat": 43.913404
      },
      {
        "name": "三工",
        "lng": 87.532013,
        "lat": 43.908897
      },
      {
        "name": "迎宾路口",
        "lng": 87.538905,
        "lat": 43.898889
      },
      {
        "name": "植物园",
        "lng": 87.545216,
        "lat": 43.889651
      },
      {
        "name": "体育中心",
        "lng": 87.552261,
        "lat": 43.879295
      },
      {
        "name": "铁路局",
        "lng": 87.559349,
        "lat": 43.868969
      },
      {
        "name": "小西沟",
        "lng": 87.56338,
        "lat": 43.85905
      },
      {
        "name": "中营工",
        "lng": 87.568771,
        "lat": 43.846557
      },
      {
        "name": "新疆图书馆",
        "lng": 87.571769,
        "lat": 43.839478
      },
      {
        "name": "八楼",
        "lng": 87.581669,
        "lat": 43.8335
      },
      {
        "name": "王家梁",
        "lng": 87.600354,
        "lat": 43.835809
      },
      {
        "name": "南湖北路",
        "lng": 87.609631,
        "lat": 43.83163
      },
      {
        "name": "南湖广场",
        "lng": 87.610624,
        "lat": 43.820723
      },
      {
        "name": "新兴街",
        "lng": 87.612147,
        "lat": 43.81241
      },
      {
        "name": "北门",
        "lng": 87.619134,
        "lat": 43.800248
      },
      {
        "name": "南门",
        "lng": 87.616689,
        "lat": 43.78962
      },
      {
        "name": "二道桥",
        "lng": 87.614144,
        "lat": 43.779401
      },
      {
        "name": "新疆大学",
        "lng": 87.611219,
        "lat": 43.768269
      },
      {
        "name": "三屯碑",
        "lng": 87.607908,
        "lat": 43.760212
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const URUMQI_SCENES = buildCityScenes({
  prefix: 'urq',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '乌鲁木齐地铁线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":87.62,"lat":43.83},
});

export const URUMQI_META = {
  id: 'urumqi',
  label: '乌鲁木齐地铁',
  blurb: '简办3.0 · 2018 起逐段开通',
};
