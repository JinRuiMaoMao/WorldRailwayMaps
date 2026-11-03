/**
 * 东莞轨交 · 简办发展史 + 高德站位（dongguan）
 */
import AMAP from './dongguanStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "dg-2016-x0",
    "year": 2016,
    "title": "2号线开通",
    "detail": "5月27日 · 东莞火车站 — 虎门火车站",
    "line": "2号线",
    "color": "#FC0601",
    "stations": [
      {
        "name": "东莞火车站",
        "lng": 113.855034,
        "lat": 23.091443
      },
      {
        "name": "茶山",
        "lng": 113.838995,
        "lat": 23.082321
      },
      {
        "name": "榴花公园",
        "lng": 113.808914,
        "lat": 23.083064
      },
      {
        "name": "下桥",
        "lng": 113.782854,
        "lat": 23.06553
      },
      {
        "name": "天宝",
        "lng": 113.773838,
        "lat": 23.050026
      },
      {
        "name": "东城",
        "lng": 113.770834,
        "lat": 23.03543
      },
      {
        "name": "旗峰公园",
        "lng": 113.762823,
        "lat": 23.022729
      },
      {
        "name": "市民中心",
        "lng": 113.75398,
        "lat": 23.013103
      },
      {
        "name": "西平",
        "lng": 113.741806,
        "lat": 22.996634
      },
      {
        "name": "蛤地",
        "lng": 113.723806,
        "lat": 22.980849
      },
      {
        "name": "陈屋",
        "lng": 113.684843,
        "lat": 22.960511
      },
      {
        "name": "寮厦",
        "lng": 113.668868,
        "lat": 22.943848
      },
      {
        "name": "珊美",
        "lng": 113.658884,
        "lat": 22.929073
      },
      {
        "name": "展览中心",
        "lng": 113.656889,
        "lat": 22.905287
      },
      {
        "name": "虎门火车站",
        "lng": 113.666876,
        "lat": 22.862185
      }
    ],
    "planned": false
  },
  {
    "id": "dg-2025-x1",
    "year": 2025,
    "date": "2025-11-28",
    "title": "1号线开通",
    "detail": "11月 · 东莞西站 — 梅塘",
    "line": "1号线",
    "color": "#3080B7",
    "stations": [
      {
        "name": "东莞西站",
        "lng": 113.622245,
        "lat": 23.012509
      },
      {
        "name": "厚德",
        "lng": 113.65632,
        "lat": 23.012343
      },
      {
        "name": "昌平",
        "lng": 113.682515,
        "lat": 23.019645
      },
      {
        "name": "人民医院",
        "lng": 113.693711,
        "lat": 23.029165
      },
      {
        "name": "曲海",
        "lng": 113.712102,
        "lat": 23.034658
      },
      {
        "name": "坝头",
        "lng": 113.721297,
        "lat": 23.025162
      },
      {
        "name": "元美",
        "lng": 113.735543,
        "lat": 23.019624
      },
      {
        "name": "中心广场",
        "lng": 113.747798,
        "lat": 23.017077
      },
      {
        "name": "市民中心",
        "lng": 113.75398,
        "lat": 23.013103
      },
      {
        "name": "立新",
        "lng": 113.767697,
        "lat": 23.006529
      },
      {
        "name": "东城南站",
        "lng": 113.770244,
        "lat": 22.989602
      },
      {
        "name": "同沙公园",
        "lng": 113.769721,
        "lat": 22.973576
      },
      {
        "name": "牛山",
        "lng": 113.770384,
        "lat": 22.962886
      },
      {
        "name": "连平",
        "lng": 113.800876,
        "lat": 22.932005
      },
      {
        "name": "大岭山",
        "lng": 113.828028,
        "lat": 22.916655
      },
      {
        "name": "金桔",
        "lng": 113.847051,
        "lat": 22.914084
      },
      {
        "name": "广东医大",
        "lng": 113.862173,
        "lat": 22.924096
      },
      {
        "name": "松山湖",
        "lng": 113.868844,
        "lat": 22.93183
      },
      {
        "name": "松佛",
        "lng": 113.896403,
        "lat": 22.935893
      },
      {
        "name": "大朗",
        "lng": 113.921933,
        "lat": 22.930939
      },
      {
        "name": "荔香公园",
        "lng": 113.946405,
        "lat": 22.920711
      },
      {
        "name": "凤山",
        "lng": 113.966146,
        "lat": 22.911786
      },
      {
        "name": "黄江",
        "lng": 113.993335,
        "lat": 22.896563
      },
      {
        "name": "黄牛埔",
        "lng": 113.99165,
        "lat": 22.875599
      },
      {
        "name": "梅塘",
        "lng": 113.980109,
        "lat": 22.845963
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const DONGGUAN_SCENES = buildCityScenes({
  prefix: 'dg',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '东莞轨交线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":113.75,"lat":23.02},
});

export const DONGGUAN_META = {
  id: 'dongguan',
  label: '东莞轨交',
  blurb: '简办3.0 · 2016 起逐段开通',
};
