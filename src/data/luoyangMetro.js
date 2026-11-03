/**
 * 洛阳轨道交通 · 简办发展史 + 高德站位（luoyang）
 */
import AMAP from './luoyangStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "ly-2021-x0",
    "year": 2021,
    "date": "2021-03-28",
    "title": "1号线开通",
    "detail": "3月28日 · 红山 — 杨湾",
    "line": "地铁1号线",
    "color": "#B97CAF",
    "stations": [
      {
        "name": "红山",
        "lng": 112.317848,
        "lat": 34.702954
      },
      {
        "name": "谷水",
        "lng": 112.328542,
        "lat": 34.6825
      },
      {
        "name": "秦岭路",
        "lng": 112.348898,
        "lat": 34.678303
      },
      {
        "name": "武汉路",
        "lng": 112.361174,
        "lat": 34.670363
      },
      {
        "name": "长安路",
        "lng": 112.370308,
        "lat": 34.663441
      },
      {
        "name": "上海市场",
        "lng": 112.379109,
        "lat": 34.660902
      },
      {
        "name": "牡丹广场",
        "lng": 112.391523,
        "lat": 34.657481
      },
      {
        "name": "七里河",
        "lng": 112.404832,
        "lat": 34.660677
      },
      {
        "name": "王城公园",
        "lng": 112.420404,
        "lat": 34.667294
      },
      {
        "name": "解放路",
        "lng": 112.428725,
        "lat": 34.67045
      },
      {
        "name": "周王城广场",
        "lng": 112.437589,
        "lat": 34.673782
      },
      {
        "name": "应天门",
        "lng": 112.451794,
        "lat": 34.679162
      },
      {
        "name": "丽景门",
        "lng": 112.462229,
        "lat": 34.683033
      },
      {
        "name": "洛邑古城",
        "lng": 112.476079,
        "lat": 34.685333
      },
      {
        "name": "夹马营",
        "lng": 112.486279,
        "lat": 34.686591
      },
      {
        "name": "启明南路·河南省洛阳正骨医院",
        "lng": 112.498646,
        "lat": 34.689013
      },
      {
        "name": "塔湾",
        "lng": 112.511564,
        "lat": 34.691126
      },
      {
        "name": "史家湾",
        "lng": 112.526441,
        "lat": 34.693561
      },
      {
        "name": "杨湾",
        "lng": 112.546911,
        "lat": 34.697075
      }
    ],
    "planned": false
  },
  {
    "id": "ly-2021-x1",
    "year": 2021,
    "date": "2021-12-26",
    "title": "2号线开通",
    "detail": "12月26日 · 二乔路 — 八里堂",
    "line": "地铁2号线",
    "color": "#86B81C",
    "stations": [
      {
        "name": "二乔路",
        "lng": 112.40676,
        "lat": 34.708022
      },
      {
        "name": "邙岭",
        "lng": 112.415157,
        "lat": 34.70791
      },
      {
        "name": "国花路",
        "lng": 112.422496,
        "lat": 34.696732
      },
      {
        "name": "洛阳火车站",
        "lng": 112.427729,
        "lat": 34.685941
      },
      {
        "name": "纱厂路",
        "lng": 112.427842,
        "lat": 34.678491
      },
      {
        "name": "解放路",
        "lng": 112.428725,
        "lat": 34.67045
      },
      {
        "name": "牡丹桥",
        "lng": 112.434658,
        "lat": 34.661994
      },
      {
        "name": "文博园",
        "lng": 112.439265,
        "lat": 34.643405
      },
      {
        "name": "隋唐园",
        "lng": 112.433643,
        "lat": 34.637246
      },
      {
        "name": "体育中心",
        "lng": 112.431181,
        "lat": 34.623172
      },
      {
        "name": "市民之家",
        "lng": 112.439622,
        "lat": 34.618419
      },
      {
        "name": "开元湖",
        "lng": 112.446723,
        "lat": 34.612084
      },
      {
        "name": "兴洛湖",
        "lng": 112.447608,
        "lat": 34.605316
      },
      {
        "name": "龙门高铁站",
        "lng": 112.450875,
        "lat": 34.594834
      },
      {
        "name": "八里堂",
        "lng": 112.468557,
        "lat": 34.601199
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const LUOYANG_SCENES = buildCityScenes({
  prefix: 'ly',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '洛阳轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":112.45,"lat":34.62},
});

export const LUOYANG_META = {
  id: 'luoyang',
  label: '洛阳轨道交通',
  blurb: '简办3.0 · 2021 起逐段开通',
};
