/**
 * 绍兴轨道交通 · 简办发展史 + 高德站位（shaoxing）
 */
import AMAP from './shaoxingStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "sx-2021-x0",
    "year": 2021,
    "date": "2021-06-28",
    "title": "1号线柯桥段开通",
    "detail": "6月28日 · 姑娘桥 — 中国轻纺城",
    "line": "轨道交通1号线(柯桥段)",
    "color": "#E3002A",
    "stations": [
      {
        "name": "姑娘桥",
        "lng": 120.325787,
        "lat": 30.178361
      },
      {
        "name": "衙前",
        "lng": 120.355413,
        "lat": 30.165494
      },
      {
        "name": "杨汛桥",
        "lng": 120.360815,
        "lat": 30.146713
      },
      {
        "name": "前梅",
        "lng": 120.389532,
        "lat": 30.126251
      },
      {
        "name": "钱清",
        "lng": 120.406737,
        "lat": 30.124364
      },
      {
        "name": "西沙路",
        "lng": 120.421801,
        "lat": 30.11977
      },
      {
        "name": "临杭大道",
        "lng": 120.4363,
        "lat": 30.11262
      },
      {
        "name": "鉴水路",
        "lng": 120.452594,
        "lat": 30.100977
      },
      {
        "name": "越州大道",
        "lng": 120.475913,
        "lat": 30.089467
      },
      {
        "name": "中国轻纺城",
        "lng": 120.484936,
        "lat": 30.084353
      }
    ],
    "planned": false
  },
  {
    "id": "sx-2022-x1",
    "year": 2022,
    "date": "2022-04-29",
    "title": "1号线主线开通",
    "detail": "4月29日 · 中国轻纺城 — 芳泉",
    "line": "轨道交通1号线(柯桥段)",
    "color": "#E3002A",
    "stations": [
      {
        "name": "中国轻纺城",
        "lng": 120.484936,
        "lat": 30.084353
      },
      {
        "name": "明珠广场",
        "lng": 120.491623,
        "lat": 30.081804
      },
      {
        "name": "瓜渚湖",
        "lng": 120.504764,
        "lat": 30.076784
      },
      {
        "name": "镜水路",
        "lng": 120.51742,
        "lat": 30.071092
      },
      {
        "name": "黄酒小镇",
        "lng": 120.535521,
        "lat": 30.060643
      },
      {
        "name": "张墅",
        "lng": 120.550236,
        "lat": 30.055757
      },
      {
        "name": "奥体中心",
        "lng": 120.565716,
        "lat": 30.058866
      },
      {
        "name": "梅山广场",
        "lng": 120.572833,
        "lat": 30.051034
      },
      {
        "name": "凤林",
        "lng": 120.577676,
        "lat": 30.039528
      },
      {
        "name": "大滩",
        "lng": 120.578586,
        "lat": 30.026304
      },
      {
        "name": "火车站",
        "lng": 120.577158,
        "lat": 30.015783
      },
      {
        "name": "城市广场",
        "lng": 120.5772,
        "lat": 30.006373
      },
      {
        "name": "鲁迅故里",
        "lng": 120.576474,
        "lat": 29.994119
      },
      {
        "name": "城南大道",
        "lng": 120.576334,
        "lat": 29.978496
      },
      {
        "name": "凤凰山",
        "lng": 120.573708,
        "lat": 29.965159
      },
      {
        "name": "劳家葑",
        "lng": 120.572945,
        "lat": 29.954395
      },
      {
        "name": "南池",
        "lng": 120.571714,
        "lat": 29.941715
      },
      {
        "name": "栖湖",
        "lng": 120.57131,
        "lat": 29.931485
      },
      {
        "name": "芳泉",
        "lng": 120.566865,
        "lat": 29.920875
      }
    ],
    "planned": false
  },
  {
    "id": "sx-2023-x2",
    "year": 2023,
    "date": "2023-07-26",
    "title": "2号线开通",
    "detail": "7月26日 · 人民医院总院 — 檀渎",
    "line": "轨道交通2号线",
    "color": "#2249A3",
    "stations": [
      {
        "name": "人民医院总院",
        "lng": 120.554674,
        "lat": 30.046874
      },
      {
        "name": "梅山广场",
        "lng": 120.572833,
        "lat": 30.051034
      },
      {
        "name": "后墅路",
        "lng": 120.585686,
        "lat": 30.052303
      },
      {
        "name": "袍谷",
        "lng": 120.597474,
        "lat": 30.052108
      },
      {
        "name": "袍中路",
        "lng": 120.608254,
        "lat": 30.051982
      },
      {
        "name": "洋泾湖",
        "lng": 120.623645,
        "lat": 30.052176
      },
      {
        "name": "恂南",
        "lng": 120.633795,
        "lat": 30.052101
      },
      {
        "name": "豆姜",
        "lng": 120.646296,
        "lat": 30.050306
      },
      {
        "name": "檀渎",
        "lng": 120.657964,
        "lat": 30.046997
      }
    ],
    "planned": false
  },
  {
    "id": "sx-2024-x3",
    "year": 2024,
    "date": "2024-04-01",
    "title": "1号线支线开通",
    "detail": "4月1日 · 黄酒小镇 — 大庆寺",
    "line": "轨道交通1号线",
    "color": "#E3002A",
    "stations": [
      {
        "name": "黄酒小镇",
        "lng": 120.535521,
        "lat": 30.060643
      },
      {
        "name": "绍兴一中",
        "lng": 120.533831,
        "lat": 30.069811
      },
      {
        "name": "湖西",
        "lng": 120.533854,
        "lat": 30.081091
      },
      {
        "name": "大庆寺",
        "lng": 120.534008,
        "lat": 30.090649
      }
    ],
    "planned": false
  },
  {
    "id": "sx-2025-x4",
    "year": 2025,
    "date": "2025-06-30",
    "title": "1号线支线北延",
    "detail": "6月30日 · 绍兴北站 — 会展中心",
    "line": "轨道交通1号线",
    "color": "#E3002A",
    "stations": [
      {
        "name": "绍兴北站",
        "lng": 120.533446,
        "lat": 30.101382
      },
      {
        "name": "会展中心",
        "lng": 120.512939,
        "lat": 30.103459
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const SHAOXING_SCENES = buildCityScenes({
  prefix: 'sx',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '绍兴轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":120.58,"lat":30.05},
});

export const SHAOXING_META = {
  id: 'shaoxing',
  label: '绍兴轨道交通',
  blurb: '简办3.0 · 2021 起逐段开通',
};
