/**
 * 常州地铁 · 简办发展史 + 高德站位（changzhou）
 */
import AMAP from './changzhouStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "cz-2019-x0",
    "year": 2019,
    "date": "2019-09-21",
    "title": "1号线开通",
    "detail": "9月21日 · 森林公园 — 南夏墅",
    "line": "地铁1号线",
    "color": "#CC0000",
    "stations": [
      {
        "name": "森林公园",
        "lng": 119.960424,
        "lat": 31.902337
      },
      {
        "name": "新龙",
        "lng": 119.956459,
        "lat": 31.889517
      },
      {
        "name": "旅游学校",
        "lng": 119.952906,
        "lat": 31.876235
      },
      {
        "name": "新桥",
        "lng": 119.949746,
        "lat": 31.865166
      },
      {
        "name": "常州北站",
        "lng": 119.951086,
        "lat": 31.857002
      },
      {
        "name": "北郊中学",
        "lng": 119.962864,
        "lat": 31.856136
      },
      {
        "name": "外国语学校",
        "lng": 119.972269,
        "lat": 31.853358
      },
      {
        "name": "环球港",
        "lng": 119.975931,
        "lat": 31.841498
      },
      {
        "name": "新区公园",
        "lng": 119.981902,
        "lat": 31.83027
      },
      {
        "name": "河海",
        "lng": 119.980624,
        "lat": 31.822288
      },
      {
        "name": "奥体中心",
        "lng": 119.976871,
        "lat": 31.813158
      },
      {
        "name": "市民广场",
        "lng": 119.970346,
        "lat": 31.804871
      },
      {
        "name": "翠竹",
        "lng": 119.971633,
        "lat": 31.795152
      },
      {
        "name": "常州火车站",
        "lng": 119.9695,
        "lat": 31.788944
      },
      {
        "name": "博爱路",
        "lng": 119.963607,
        "lat": 31.784435
      },
      {
        "name": "文化宫",
        "lng": 119.960077,
        "lat": 31.778301
      },
      {
        "name": "同济桥",
        "lng": 119.957055,
        "lat": 31.770521
      },
      {
        "name": "清凉寺",
        "lng": 119.955429,
        "lat": 31.762809
      },
      {
        "name": "茶山",
        "lng": 119.952489,
        "lat": 31.752064
      },
      {
        "name": "聚湖路",
        "lng": 119.944262,
        "lat": 31.736613
      },
      {
        "name": "湖塘",
        "lng": 119.944289,
        "lat": 31.72448
      },
      {
        "name": "新天地公园",
        "lng": 119.944048,
        "lat": 31.714465
      },
      {
        "name": "长虹路",
        "lng": 119.943833,
        "lat": 31.707848
      },
      {
        "name": "延政大道",
        "lng": 119.943562,
        "lat": 31.699938
      },
      {
        "name": "科教城北",
        "lng": 119.943173,
        "lat": 31.690147
      },
      {
        "name": "科教城南",
        "lng": 119.942786,
        "lat": 31.676457
      },
      {
        "name": "武进沿江城际",
        "lng": 119.943947,
        "lat": 31.661706
      },
      {
        "name": "阳湖路",
        "lng": 119.946257,
        "lat": 31.647623
      },
      {
        "name": "南夏墅",
        "lng": 119.947373,
        "lat": 31.63436
      }
    ],
    "planned": false
  },
  {
    "id": "cz-2021-x1",
    "year": 2021,
    "date": "2021-06-28",
    "title": "2号线开通",
    "detail": "6月28日 · 青枫公园 — 五一路",
    "line": "地铁2号线",
    "color": "#3080B7",
    "stations": [
      {
        "name": "青枫公园",
        "lng": 119.894914,
        "lat": 31.804448
      },
      {
        "name": "海棠路",
        "lng": 119.90387,
        "lat": 31.800354
      },
      {
        "name": "五星",
        "lng": 119.913395,
        "lat": 31.794757
      },
      {
        "name": "勤业",
        "lng": 119.923924,
        "lat": 31.78846
      },
      {
        "name": "怀德",
        "lng": 119.937788,
        "lat": 31.782381
      },
      {
        "name": "南大街",
        "lng": 119.948473,
        "lat": 31.781951
      },
      {
        "name": "文化宫",
        "lng": 119.960077,
        "lat": 31.778301
      },
      {
        "name": "红梅公园",
        "lng": 119.968171,
        "lat": 31.772416
      },
      {
        "name": "五角场",
        "lng": 119.980744,
        "lat": 31.771497
      },
      {
        "name": "三角场",
        "lng": 119.987861,
        "lat": 31.779438
      },
      {
        "name": "紫云",
        "lng": 120.00078,
        "lat": 31.771077
      },
      {
        "name": "青洋路",
        "lng": 120.012147,
        "lat": 31.761938
      },
      {
        "name": "丁堰",
        "lng": 120.02336,
        "lat": 31.755163
      },
      {
        "name": "潞城",
        "lng": 120.045197,
        "lat": 31.757365
      },
      {
        "name": "五一路",
        "lng": 120.058786,
        "lat": 31.759783
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const CHANGZHOU_SCENES = buildCityScenes({
  prefix: 'cz',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '常州地铁线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":119.97,"lat":31.81},
});

export const CHANGZHOU_META = {
  id: 'changzhou',
  label: '常州地铁',
  blurb: '简办3.0 · 2019 起逐段开通',
};
