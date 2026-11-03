/**
 * 芜湖轨道交通 · 简办发展史 + 高德站位（wuhu）
 */
import AMAP from './wuhuStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "whu-2021-x0",
    "year": 2021,
    "date": "2021-11-03",
    "title": "1号线开通",
    "detail": "11月3日 · 保顺路 — 白马山",
    "line": "轨道交通1号线",
    "color": "#CC0000",
    "stations": [
      {
        "name": "保顺路",
        "lng": 118.406674,
        "lat": 31.48162
      },
      {
        "name": "华山路",
        "lng": 118.398435,
        "lat": 31.4728
      },
      {
        "name": "泰山路",
        "lng": 118.395485,
        "lat": 31.461899
      },
      {
        "name": "衡山路",
        "lng": 118.388349,
        "lat": 31.453506
      },
      {
        "name": "龙山路",
        "lng": 118.376039,
        "lat": 31.441918
      },
      {
        "name": "鞍山路",
        "lng": 118.377565,
        "lat": 31.433584
      },
      {
        "name": "港湾路",
        "lng": 118.375557,
        "lat": 31.418672
      },
      {
        "name": "裕安路",
        "lng": 118.369767,
        "lat": 31.411681
      },
      {
        "name": "武夷山路",
        "lng": 118.368488,
        "lat": 31.401178
      },
      {
        "name": "港一路",
        "lng": 118.367495,
        "lat": 31.39334
      },
      {
        "name": "天柱山路",
        "lng": 118.367848,
        "lat": 31.380293
      },
      {
        "name": "天门山路",
        "lng": 118.368334,
        "lat": 31.371854
      },
      {
        "name": "赤铸山路",
        "lng": 118.36884,
        "lat": 31.363836
      },
      {
        "name": "赭山路",
        "lng": 118.369568,
        "lat": 31.353036
      },
      {
        "name": "赭山公园",
        "lng": 118.367384,
        "lat": 31.347002
      },
      {
        "name": "中山北路",
        "lng": 118.363277,
        "lat": 31.341611
      },
      {
        "name": "鸠兹广场",
        "lng": 118.366359,
        "lat": 31.334423
      },
      {
        "name": "环城北路",
        "lng": 118.375337,
        "lat": 31.326621
      },
      {
        "name": "奥体中心",
        "lng": 118.373477,
        "lat": 31.313237
      },
      {
        "name": "红花山路",
        "lng": 118.374469,
        "lat": 31.303526
      },
      {
        "name": "博览中心",
        "lng": 118.375492,
        "lat": 31.29594
      },
      {
        "name": "文津东路",
        "lng": 118.378637,
        "lat": 31.285163
      },
      {
        "name": "珩琅山路",
        "lng": 118.383625,
        "lat": 31.267059
      },
      {
        "name": "芜湖南站",
        "lng": 118.373216,
        "lat": 31.252599
      },
      {
        "name": "白马山",
        "lng": 118.366983,
        "lat": 31.247149
      }
    ],
    "planned": false
  },
  {
    "id": "whu-2021-x1",
    "year": 2021,
    "date": "2021-12-28",
    "title": "2号线开通",
    "detail": "12月28日 · 鸠兹广场 — 万春湖路",
    "line": "轨道交通2号线",
    "color": "#01A2E2",
    "stations": [
      {
        "name": "鸠兹广场",
        "lng": 118.366359,
        "lat": 31.334423
      },
      {
        "name": "文化路",
        "lng": 118.378397,
        "lat": 31.337331
      },
      {
        "name": "神山口",
        "lng": 118.391705,
        "lat": 31.340138
      },
      {
        "name": "芜湖火车站",
        "lng": 118.389331,
        "lat": 31.349893
      },
      {
        "name": "神山公园",
        "lng": 118.404573,
        "lat": 31.359094
      },
      {
        "name": "云从路",
        "lng": 118.41647,
        "lat": 31.359206
      },
      {
        "name": "政务中心",
        "lng": 118.425263,
        "lat": 31.35927
      },
      {
        "name": "海晏路",
        "lng": 118.435391,
        "lat": 31.356761
      },
      {
        "name": "方特·徽州路",
        "lng": 118.454442,
        "lat": 31.358046
      },
      {
        "name": "梦溪路",
        "lng": 118.476127,
        "lat": 31.353505
      },
      {
        "name": "万春湖路",
        "lng": 118.490949,
        "lat": 31.364525
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const WUHU_SCENES = buildCityScenes({
  prefix: 'whu',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '芜湖轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":118.38,"lat":31.33},
});

export const WUHU_META = {
  id: 'wuhu',
  label: '芜湖轨道交通',
  blurb: '简办3.0 · 2021 起逐段开通',
};
