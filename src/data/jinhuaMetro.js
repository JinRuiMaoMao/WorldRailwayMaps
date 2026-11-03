/**
 * 金华轨道交通 · 简办发展史 + 高德站位（jinhua）
 */
import AMAP from './jinhuaStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "jh-2022-x0",
    "year": 2022,
    "date": "2022-08-30",
    "title": "金义东线金义段开通",
    "detail": "8月30日 · 金华站 — 秦塘",
    "line": "金义东线金义段",
    "color": "#EE3F42",
    "stations": [
      {
        "name": "金华站",
        "lng": 119.631631,
        "lat": 29.110338
      },
      {
        "name": "双溪西路",
        "lng": 119.639042,
        "lat": 29.090983
      },
      {
        "name": "八一南街",
        "lng": 119.650028,
        "lat": 29.084572
      },
      {
        "name": "万达广场",
        "lng": 119.67097,
        "lat": 29.09137
      },
      {
        "name": "大堰河街",
        "lng": 119.698027,
        "lat": 29.100351
      },
      {
        "name": "轨道大厦",
        "lng": 119.716451,
        "lat": 29.100368
      },
      {
        "name": "金华南站",
        "lng": 119.73225,
        "lat": 29.117129
      },
      {
        "name": "塘雅",
        "lng": 119.801589,
        "lat": 29.170018
      },
      {
        "name": "综保区",
        "lng": 119.848739,
        "lat": 29.185498
      },
      {
        "name": "新区",
        "lng": 119.869136,
        "lat": 29.195725
      },
      {
        "name": "东华街",
        "lng": 119.889555,
        "lat": 29.201545
      },
      {
        "name": "义亭",
        "lng": 119.96827,
        "lat": 29.239548
      },
      {
        "name": "官塘",
        "lng": 120.014643,
        "lat": 29.272135
      },
      {
        "name": "稠江",
        "lng": 120.032349,
        "lat": 29.28321
      },
      {
        "name": "绣湖",
        "lng": 120.058261,
        "lat": 29.308134
      },
      {
        "name": "秦塘",
        "lng": 120.083515,
        "lat": 29.331922
      }
    ],
    "planned": false
  },
  {
    "id": "jh-2022-x1",
    "year": 2022,
    "date": "2022-12-28",
    "title": "金义东线义东段开通",
    "detail": "12月28日 · 秦塘 — 明清宫",
    "line": "金义东线义东段",
    "color": "#EE3F42",
    "stations": [
      {
        "name": "秦塘",
        "lng": 120.083515,
        "lat": 29.331922
      },
      {
        "name": "国际商贸城",
        "lng": 120.097874,
        "lat": 29.333912
      },
      {
        "name": "浙医四院",
        "lng": 120.118034,
        "lat": 29.332702
      },
      {
        "name": "江东",
        "lng": 120.141867,
        "lat": 29.324504
      },
      {
        "name": "木雕城",
        "lng": 120.181368,
        "lat": 29.300048
      },
      {
        "name": "歌山路",
        "lng": 120.209516,
        "lat": 29.28404
      },
      {
        "name": "人民路",
        "lng": 120.234857,
        "lat": 29.28011
      },
      {
        "name": "会展中心",
        "lng": 120.255127,
        "lat": 29.273929
      },
      {
        "name": "体育馆",
        "lng": 120.275498,
        "lat": 29.269292
      },
      {
        "name": "横店高铁站",
        "lng": 120.259903,
        "lat": 29.217189
      },
      {
        "name": "明清宫",
        "lng": 120.302664,
        "lat": 29.177831
      }
    ],
    "planned": false
  },
  {
    "id": "jh-2022-x2",
    "year": 2022,
    "date": "2022-12-28",
    "title": "义乌高铁站支线开通",
    "detail": "12月28日 · 义乌高铁站 — 秦塘",
    "line": "金义东线义东段",
    "color": "#EE3F42",
    "stations": [
      {
        "name": "义乌高铁站",
        "lng": 120.040884,
        "lat": 29.379717
      },
      {
        "name": "凌云",
        "lng": 120.052723,
        "lat": 29.353761
      },
      {
        "name": "春晗",
        "lng": 120.065323,
        "lat": 29.339534
      },
      {
        "name": "秦塘",
        "lng": 120.083515,
        "lat": 29.331922
      }
    ],
    "planned": false
  },
  {
    "id": "jh-2035-x3",
    "year": 2035,
    "title": "金义东延伸（规划）",
    "detail": "2035 展望",
    "line": "金义东线金义段",
    "color": "#EE3F42",
    "stations": [
      {
        "name": "金华站",
        "lng": 119.631631,
        "lat": 29.110338
      },
      {
        "name": "双溪西路",
        "lng": 119.639042,
        "lat": 29.090983
      },
      {
        "name": "八一南街",
        "lng": 119.650028,
        "lat": 29.084572
      },
      {
        "name": "万达广场",
        "lng": 119.67097,
        "lat": 29.09137
      },
      {
        "name": "大堰河街",
        "lng": 119.698027,
        "lat": 29.100351
      },
      {
        "name": "轨道大厦",
        "lng": 119.716451,
        "lat": 29.100368
      },
      {
        "name": "金华南站",
        "lng": 119.73225,
        "lat": 29.117129
      },
      {
        "name": "塘雅",
        "lng": 119.801589,
        "lat": 29.170018
      },
      {
        "name": "综保区",
        "lng": 119.848739,
        "lat": 29.185498
      },
      {
        "name": "新区",
        "lng": 119.869136,
        "lat": 29.195725
      },
      {
        "name": "东华街",
        "lng": 119.889555,
        "lat": 29.201545
      },
      {
        "name": "义亭",
        "lng": 119.96827,
        "lat": 29.239548
      },
      {
        "name": "官塘",
        "lng": 120.014643,
        "lat": 29.272135
      },
      {
        "name": "稠江",
        "lng": 120.032349,
        "lat": 29.28321
      },
      {
        "name": "绣湖",
        "lng": 120.058261,
        "lat": 29.308134
      },
      {
        "name": "秦塘",
        "lng": 120.083515,
        "lat": 29.331922
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const JINHUA_SCENES = buildCityScenes({
  prefix: 'jh',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '金华轨道交通线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":119.65,"lat":29.08},
});

export const JINHUA_META = {
  id: 'jinhua',
  label: '金华轨道交通',
  blurb: '简办3.0 · 2022 起逐段开通',
};
