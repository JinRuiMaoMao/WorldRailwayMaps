/**
 * 兰州轨道交通 · 简办发展史 + 高德站位（lanzhou）
 */
import AMAP from './lanzhouStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "lz-2019-x0",
    "year": 2019,
    "date": "2019-06-23",
    "title": "1号线开通",
    "detail": "6月23日 · 陈官营 — 东岗",
    "line": "轨道交通1号线",
    "color": "#0065B3",
    "stations": [
      {
        "name": "陈官营",
        "lng": 103.659949,
        "lat": 36.087271
      },
      {
        "name": "奥体中心",
        "lng": 103.675659,
        "lat": 36.09085
      },
      {
        "name": "兰州城市学院(省科技馆)",
        "lng": 103.69869,
        "lat": 36.099157
      },
      {
        "name": "兰州海关",
        "lng": 103.707019,
        "lat": 36.094759
      },
      {
        "name": "马滩",
        "lng": 103.724804,
        "lat": 36.083135
      },
      {
        "name": "土门墩",
        "lng": 103.740665,
        "lat": 36.073281
      },
      {
        "name": "兰州西站北广场",
        "lng": 103.750167,
        "lat": 36.07168
      },
      {
        "name": "西站什字",
        "lng": 103.767008,
        "lat": 36.068728
      },
      {
        "name": "七里河",
        "lng": 103.778769,
        "lat": 36.066649
      },
      {
        "name": "小西湖",
        "lng": 103.793811,
        "lat": 36.063781
      },
      {
        "name": "文化宫",
        "lng": 103.802722,
        "lat": 36.061406
      },
      {
        "name": "西关",
        "lng": 103.814496,
        "lat": 36.059668
      },
      {
        "name": "省政府",
        "lng": 103.824195,
        "lat": 36.059456
      },
      {
        "name": "东方红广场",
        "lng": 103.840038,
        "lat": 36.053535
      },
      {
        "name": "兰州大学",
        "lng": 103.854229,
        "lat": 36.050325
      },
      {
        "name": "五里铺",
        "lng": 103.869136,
        "lat": 36.04688
      },
      {
        "name": "省气象局",
        "lng": 103.881142,
        "lat": 36.041989
      },
      {
        "name": "拱星墩",
        "lng": 103.893088,
        "lat": 36.039519
      },
      {
        "name": "焦家湾",
        "lng": 103.905432,
        "lat": 36.03872
      },
      {
        "name": "东岗",
        "lng": 103.915457,
        "lat": 36.040873
      }
    ],
    "planned": false
  },
  {
    "id": "lz-2023-x1",
    "year": 2023,
    "date": "2023-06-29",
    "title": "2号线开通",
    "detail": "6月29日 · 雁白大桥 — 东方红广场",
    "line": "轨道交通2号线",
    "color": "#DF5914",
    "stations": [
      {
        "name": "雁白大桥",
        "lng": 103.88171,
        "lat": 36.068746
      },
      {
        "name": "均家滩",
        "lng": 103.878979,
        "lat": 36.061097
      },
      {
        "name": "张苏滩",
        "lng": 103.874889,
        "lat": 36.056293
      },
      {
        "name": "五里铺",
        "lng": 103.869136,
        "lat": 36.04688
      },
      {
        "name": "团结新村",
        "lng": 103.866524,
        "lat": 36.038676
      },
      {
        "name": "红星巷",
        "lng": 103.858871,
        "lat": 36.034408
      },
      {
        "name": "兰州火车站",
        "lng": 103.850782,
        "lat": 36.036247
      },
      {
        "name": "邮电大楼",
        "lng": 103.846441,
        "lat": 36.042209
      },
      {
        "name": "东方红广场",
        "lng": 103.840038,
        "lat": 36.053535
      }
    ],
    "planned": false
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const LANZHOU_SCENES = buildCityScenes({
  prefix: 'lz',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '兰州轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":103.83,"lat":36.06},
});

export const LANZHOU_META = {
  id: 'lanzhou',
  label: '兰州轨道交通',
  blurb: '简办3.0 · 2019 起逐段开通',
};
