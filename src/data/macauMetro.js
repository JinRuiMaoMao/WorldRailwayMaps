/**
 * 澳门轻轨 · 简办发展史 + 高德站位（macau）
 */
import AMAP from './macauStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "mo-2019-x0",
    "year": 2019,
    "date": "2019-12-10",
    "title": "氹仔线开通",
    "detail": "12月10日 · 氹仔碼頭 — 海洋",
    "line": "氹仔線",
    "color": "#96C93C",
    "stations": [
      {
        "name": "氹仔碼頭",
        "lng": 113.57412,
        "lat": 22.163002
      },
      {
        "name": "機場",
        "lng": 113.574662,
        "lat": 22.159293
      },
      {
        "name": "科大",
        "lng": 113.57081,
        "lat": 22.152876
      },
      {
        "name": "路氹東",
        "lng": 113.569177,
        "lat": 22.148061
      },
      {
        "name": "東亞運",
        "lng": 113.568626,
        "lat": 22.142169
      },
      {
        "name": "協和醫院",
        "lng": 113.56305,
        "lat": 22.138746
      },
      {
        "name": "蓮花",
        "lng": 113.559656,
        "lat": 22.139658
      },
      {
        "name": "路氹西",
        "lng": 113.557832,
        "lat": 22.145319
      },
      {
        "name": "排角",
        "lng": 113.554308,
        "lat": 22.150933
      },
      {
        "name": "運動場",
        "lng": 113.551948,
        "lat": 22.154595
      },
      {
        "name": "馬會",
        "lng": 113.546989,
        "lat": 22.157074
      },
      {
        "name": "海洋",
        "lng": 113.541162,
        "lat": 22.15806
      }
    ],
    "planned": false
  },
  {
    "id": "mo-2023-x1",
    "year": 2023,
    "date": "2023-12-08",
    "title": "氹仔线通至妈阁",
    "detail": "12月8日 · 海洋 — 媽閣",
    "line": "氹仔線",
    "color": "#96C93C",
    "stations": [
      {
        "name": "海洋",
        "lng": 113.541162,
        "lat": 22.15806
      },
      {
        "name": "媽閣",
        "lng": 113.529355,
        "lat": 22.183886
      }
    ],
    "planned": false
  },
  {
    "id": "mo-2024-x2",
    "year": 2024,
    "date": "2024-11-01",
    "title": "石排湾线开通",
    "detail": "11月1日 · 協和醫院 — 石排灣",
    "line": "石排灣線",
    "color": "#8966C3",
    "stations": [
      {
        "name": "石排灣",
        "lng": 113.56185,
        "lat": 22.131455
      },
      {
        "name": "協和醫院",
        "lng": 113.56305,
        "lat": 22.138746
      }
    ],
    "planned": false
  },
  {
    "id": "mo-2024-x3",
    "year": 2024,
    "date": "2024-12-02",
    "title": "横琴线开通",
    "detail": "12月2日 · 蓮花 — 橫琴",
    "line": "橫琴線",
    "color": "#B82A3C",
    "stations": [
      {
        "name": "橫琴",
        "lng": 113.54485,
        "lat": 22.140669
      },
      {
        "name": "蓮花",
        "lng": 113.559656,
        "lat": 22.139658
      }
    ],
    "planned": false
  },
  {
    "id": "mo-2035-x4",
    "year": 2035,
    "title": "澳门轻轨远期（规划）",
    "detail": "2035 展望",
    "line": "氹仔線",
    "color": "#96C93C",
    "stations": [
      {
        "name": "氹仔碼頭",
        "lng": 113.57412,
        "lat": 22.163002
      },
      {
        "name": "機場",
        "lng": 113.574662,
        "lat": 22.159293
      },
      {
        "name": "科大",
        "lng": 113.57081,
        "lat": 22.152876
      },
      {
        "name": "路氹東",
        "lng": 113.569177,
        "lat": 22.148061
      },
      {
        "name": "東亞運",
        "lng": 113.568626,
        "lat": 22.142169
      },
      {
        "name": "協和醫院",
        "lng": 113.56305,
        "lat": 22.138746
      },
      {
        "name": "蓮花",
        "lng": 113.559656,
        "lat": 22.139658
      },
      {
        "name": "路氹西",
        "lng": 113.557832,
        "lat": 22.145319
      },
      {
        "name": "排角",
        "lng": 113.554308,
        "lat": 22.150933
      },
      {
        "name": "運動場",
        "lng": 113.551948,
        "lat": 22.154595
      },
      {
        "name": "馬會",
        "lng": 113.546989,
        "lat": 22.157074
      },
      {
        "name": "海洋",
        "lng": 113.541162,
        "lat": 22.15806
      },
      {
        "name": "媽閣",
        "lng": 113.529355,
        "lat": 22.183886
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const MACAU_SCENES = buildCityScenes({
  prefix: 'mo',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '澳门轻轨线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":113.54,"lat":22.2},
});

export const MACAU_META = {
  id: 'macau',
  label: '澳门轻轨',
  blurb: '简办3.0 · 2019 起逐段开通',
};
