/**
 * 上海地铁 · 简办发展史 + 高德站位（shanghai）
 */
import AMAP from './shanghaiStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "sh-1993-x0",
    "year": 1993,
    "date": "1993-05-28",
    "title": "1号线南段开通",
    "detail": "5月28日 · 徐家汇 — 锦江乐园",
    "line": "1号线",
    "color": "#E4002B",
    "stations": [
      {
        "name": "锦江乐园",
        "lng": 121.4052,
        "lat": 31.1408
      },
      {
        "name": "新龙华",
        "lng": 121.425417,
        "lat": 31.156469
      },
      {
        "name": "漕宝路",
        "lng": 121.428523,
        "lat": 31.170231
      },
      {
        "name": "上海体育馆",
        "lng": 121.432809,
        "lat": 31.184699
      },
      {
        "name": "徐家汇",
        "lng": 121.431986,
        "lat": 31.197392
      }
    ],
    "planned": false,
    "segId": "sh-l1-south"
  },
  {
    "id": "sh-1995-x1",
    "year": 1995,
    "date": "1995-04-10",
    "title": "1号线全线开通",
    "detail": "4月10日 · 锦江乐园 — 上海火车站",
    "line": "1号线",
    "color": "#E4002B",
    "stations": [
      {
        "name": "徐家汇",
        "lng": 121.431986,
        "lat": 31.197392
      },
      {
        "name": "衡山路",
        "lng": 121.441826,
        "lat": 31.206418
      },
      {
        "name": "常熟路",
        "lng": 121.444549,
        "lat": 31.215415
      },
      {
        "name": "陕西南路",
        "lng": 121.454174,
        "lat": 31.217059
      },
      {
        "name": "黄陂南路",
        "lng": 121.468379,
        "lat": 31.225841
      },
      {
        "name": "人民广场",
        "lng": 121.470589,
        "lat": 31.234632
      },
      {
        "name": "新闸路",
        "lng": 121.46361,
        "lat": 31.240297
      },
      {
        "name": "汉中路",
        "lng": 121.454129,
        "lat": 31.243782
      },
      {
        "name": "上海火车站",
        "lng": 121.453367,
        "lat": 31.251526
      }
    ],
    "planned": false,
    "segId": "sh-l1-north"
  },
  {
    "id": "sh-1996-x2",
    "year": 1996,
    "date": "1996-04-01",
    "title": "锦江乐园站搬迁",
    "detail": "4月 · 搬迁至沪闵路虹漕南路临时站点",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.412,
      "lat": 31.146,
      "zoom": 15
    },
    "terminusMove": {
      "segId": "sh-l1-south",
      "station": "锦江乐园",
      "lng": 121.4178,
      "lat": 31.1506,
      "color": "#E3002A"
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-1996-x3",
    "year": 1996,
    "date": "1996-12-28",
    "title": "1号线南延段开通",
    "detail": "12月28日 · 莘庄 — 虹梅路 · 独立运营",
    "line": "1号线南延段",
    "color": "#E4002B",
    "stations": [
      {
        "name": "莘庄",
        "lng": 121.380739,
        "lat": 31.113054
      },
      {
        "name": "外环路",
        "lng": 121.38838,
        "lat": 31.122791
      },
      {
        "name": "莲花路",
        "lng": 121.398267,
        "lat": 31.132785
      },
      {
        "name": "虹梅路",
        "lng": 121.409467,
        "lat": 31.144099
      }
    ],
    "planned": false,
    "segId": "sh-l1-ext"
  },
  {
    "id": "sh-1997-x4",
    "year": 1997,
    "date": "1997-07-01",
    "title": "1号线全线贯通",
    "detail": "7月1日 · 莘庄 — 上海火车站贯通 · 临时锦江乐园废弃",
    "line": "1号线",
    "color": "#E4002B",
    "stations": [
      {
        "name": "虹梅路",
        "lng": 121.409467,
        "lat": 31.144099
      },
      {
        "name": "新龙华",
        "lng": 121.425417,
        "lat": 31.156469
      }
    ],
    "planned": false,
    "segId": "sh-l1-join",
    "recolor": {
      "fromLine": "1号线南延段",
      "lineName": "1号线",
      "color": "#E3002A"
    },
    "retireStations": [
      "锦江乐园"
    ],
    "terminusMove": {
      "segId": "sh-l1-south",
      "station": "新龙华",
      "lng": 121.425417,
      "lat": 31.156469,
      "color": "#E3002A",
      "dropNames": [
        "锦江乐园"
      ]
    }
  },
  {
    "id": "sh-1999-x5",
    "year": 1999,
    "date": "1999-12-28",
    "title": "新龙华站更名",
    "detail": "12月28日 · 1号线新龙华改称上海南站",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "新龙华",
      "to": "上海南站",
      "lng": 121.425417,
      "lat": 31.156469,
      "color": "#E3002A",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2000-x6",
    "year": 2000,
    "date": "2000-06-11",
    "title": "2号线一期开通",
    "detail": "6月11日 · 中山公园 — 龙阳路",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "龙阳路",
        "lng": 121.553386,
        "lat": 31.205755
      },
      {
        "name": "世纪公园",
        "lng": 121.546644,
        "lat": 31.211585
      },
      {
        "name": "杨高南路",
        "lng": 121.540157,
        "lat": 31.220966
      },
      {
        "name": "东方路",
        "lng": 121.522877,
        "lat": 31.230781
      },
      {
        "name": "浦东南路(原东昌路)",
        "lng": 121.51118,
        "lat": 31.235334
      },
      {
        "name": "陆家嘴",
        "lng": 121.497705,
        "lat": 31.240281
      },
      {
        "name": "河南中路",
        "lng": 121.480141,
        "lat": 31.240071
      },
      {
        "name": "人民公园",
        "lng": 121.470589,
        "lat": 31.234632
      },
      {
        "name": "石门一路",
        "lng": 121.455406,
        "lat": 31.23176
      },
      {
        "name": "静安寺",
        "lng": 121.441934,
        "lat": 31.225113
      },
      {
        "name": "江苏路",
        "lng": 121.426013,
        "lat": 31.222269
      },
      {
        "name": "中山公园",
        "lng": 121.411128,
        "lat": 31.219793
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2000-x7",
    "year": 2000,
    "date": "2000-08-10",
    "title": "人民公园站更名",
    "detail": "8月10日 · 2号线人民公园改称人民广场 · 与 1 号线换乘",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "人民公园",
      "to": "人民广场",
      "lng": 121.470589,
      "lat": 31.234632,
      "color": "#86B81C",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2000-x10",
    "year": 2000,
    "date": "2000-12-26",
    "title": "明珠线通至宜山路",
    "detail": "12月26日 · 石龙路 — 宜山路",
    "line": "明珠线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      },
      {
        "name": "漕溪路",
        "lng": 121.433798,
        "lat": 31.178636
      },
      {
        "name": "龙漕路",
        "lng": 121.439784,
        "lat": 31.171362
      },
      {
        "name": "石龙路",
        "lng": 121.438604,
        "lat": 31.159857
      }
    ],
    "planned": false,
    "segId": "sh-l3-b"
  },
  {
    "id": "sh-2000-x11",
    "year": 2000,
    "date": "2000-12-26",
    "title": "明珠线通至中山公园",
    "detail": "12月26日 · 宜山路 — 中山公园",
    "line": "明珠线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "中山公园",
        "lng": 121.411128,
        "lat": 31.219793
      },
      {
        "name": "延安西路",
        "lng": 121.412418,
        "lat": 31.211466
      },
      {
        "name": "虹桥路",
        "lng": 121.416175,
        "lat": 31.199382
      },
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      }
    ],
    "planned": false,
    "segId": "sh-l3-c1"
  },
  {
    "id": "sh-2000-x12",
    "year": 2000,
    "date": "2000-12-26",
    "title": "明珠线通至江湾镇",
    "detail": "12月26日 · 中山公园 — 江湾镇",
    "line": "明珠线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "江湾镇",
        "lng": 121.480573,
        "lat": 31.307508
      },
      {
        "name": "汶水东路",
        "lng": 121.47872,
        "lat": 31.291376
      },
      {
        "name": "赤峰路",
        "lng": 121.477931,
        "lat": 31.283191
      },
      {
        "name": "虹口足球场",
        "lng": 121.474646,
        "lat": 31.273331
      },
      {
        "name": "东宝兴路",
        "lng": 121.475698,
        "lat": 31.261833
      },
      {
        "name": "宝山路",
        "lng": 121.471782,
        "lat": 31.253463
      },
      {
        "name": "上海火车站",
        "lng": 121.453367,
        "lat": 31.251526
      },
      {
        "name": "中潭路",
        "lng": 121.436387,
        "lat": 31.256425
      },
      {
        "name": "镇坪路",
        "lng": 121.425147,
        "lat": 31.248214
      },
      {
        "name": "曹杨路",
        "lng": 121.413055,
        "lat": 31.241138
      },
      {
        "name": "金沙江路",
        "lng": 121.408553,
        "lat": 31.233984
      },
      {
        "name": "中山公园",
        "lng": 121.411128,
        "lat": 31.219793
      }
    ],
    "planned": false,
    "segId": "sh-l3-c2"
  },
  {
    "id": "sh-2000-x8",
    "year": 2000,
    "date": "2000-12-26",
    "title": "2号线东延开通",
    "detail": "12月26日 · 龙阳路 — 张江高科",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "张江高科",
        "lng": 121.583286,
        "lat": 31.204086
      },
      {
        "name": "龙阳路",
        "lng": 121.553386,
        "lat": 31.205755
      }
    ],
    "planned": false,
    "segId": "sh-l2-e"
  },
  {
    "id": "sh-2000-x9",
    "year": 2000,
    "date": "2000-12-26",
    "title": "明珠线一期开通",
    "detail": "12月26日 · 上海南站 — 石龙路 · 今 3 号线配色与走向",
    "line": "明珠线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "石龙路",
        "lng": 121.438604,
        "lat": 31.159857
      },
      {
        "name": "上海南站",
        "lng": 121.425417,
        "lat": 31.156469
      }
    ],
    "planned": false,
    "segId": "sh-l3-a"
  },
  {
    "id": "sh-2001-x13",
    "year": 2001,
    "date": "2001-05-01",
    "title": "虹梅路站更名",
    "detail": "5月1日 · 1号线虹梅路改称锦江乐园",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "虹梅路",
      "to": "锦江乐园",
      "lng": 121.409467,
      "lat": 31.144099,
      "color": "#E3002A",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2002-x14",
    "year": 2002,
    "date": "2002-08-08",
    "title": "明珠线更名3号线",
    "detail": "8月8日 · 明珠线改称 3 号线",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "recolor": {
      "fromLine": "明珠线",
      "lineName": "3号线",
      "color": "#FCD600"
    },
    "highlightFromLine": "明珠线",
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2002-x15",
    "year": 2002,
    "date": "2002-12-12",
    "title": "杨高南路站更名",
    "detail": "12月12日 · 2号线杨高南路改称上海科技馆",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "杨高南路",
      "to": "上海科技馆",
      "lng": 121.540157,
      "lat": 31.220966,
      "color": "#86B81C",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2002-x16",
    "year": 2002,
    "date": "2002-12-31",
    "title": "磁浮线通车典礼",
    "detail": "12月31日 · 龙阳路 — 浦东国际机场",
    "line": "磁浮线",
    "color": "#008187",
    "stations": [
      {
        "name": "龙阳路",
        "lng": 121.553386,
        "lat": 31.205755
      },
      {
        "name": "浦东国际机场",
        "lng": 121.801301,
        "lat": 31.153065
      }
    ],
    "planned": false,
    "segId": "sh-maglev"
  },
  {
    "id": "sh-2003-x17",
    "year": 2003,
    "date": "2003-11-25",
    "title": "5号线开通",
    "detail": "11月25日 · 莘庄 — 颛桥",
    "line": "5号线",
    "color": "#E93CAC",
    "stations": [
      {
        "name": "莘庄",
        "lng": 121.380739,
        "lat": 31.113054
      },
      {
        "name": "春申路",
        "lng": 121.381185,
        "lat": 31.100159
      },
      {
        "name": "银都路",
        "lng": 121.385628,
        "lat": 31.091256
      },
      {
        "name": "颛桥",
        "lng": 121.397231,
        "lat": 31.068934
      }
    ],
    "planned": false,
    "segId": "sh-l5-n"
  },
  {
    "id": "sh-2003-x18",
    "year": 2003,
    "date": "2003-11-25",
    "title": "5号线通至闵行开发区",
    "detail": "11月25日 · 颛桥 — 闵行开发区",
    "line": "5号线",
    "color": "#E93CAC",
    "stations": [
      {
        "name": "颛桥",
        "lng": 121.397231,
        "lat": 31.068934
      },
      {
        "name": "北桥",
        "lng": 121.40542,
        "lat": 31.047047
      },
      {
        "name": "剑川路",
        "lng": 121.411954,
        "lat": 31.028432
      },
      {
        "name": "东川路",
        "lng": 121.415276,
        "lat": 31.020153
      },
      {
        "name": "金平路",
        "lng": 121.405555,
        "lat": 31.013236
      },
      {
        "name": "华宁路",
        "lng": 121.390624,
        "lat": 31.009423
      },
      {
        "name": "文井路",
        "lng": 121.376154,
        "lat": 31.005564
      },
      {
        "name": "闵行开发区",
        "lng": 121.365106,
        "lat": 31.002608
      }
    ],
    "planned": false,
    "segId": "sh-l5-s"
  },
  {
    "id": "sh-2003-x19",
    "year": 2003,
    "date": "2003-12-31",
    "title": "上海南站停运",
    "detail": "12月31日 · 配合上海南站施工 · 3号线上海南站停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.425417,
      "lat": 31.156469,
      "zoom": 15
    },
    "retireStations": [
      "上海南站"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2004-x20",
    "year": 2004,
    "date": "2004-06-10",
    "title": "3号线高架下沉施工",
    "detail": "6月10日 · 石龙路 — 宜山路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.43,
      "lat": 31.183,
      "zoom": 14
    },
    "retireSegIds": [
      "sh-l3-a",
      "sh-l3-b"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2004-x21",
    "year": 2004,
    "date": "2004-07-24",
    "title": "3号线宜山路 — 石龙路恢复",
    "detail": "7月24日 · 石龙路 — 宜山路恢复运营",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      },
      {
        "name": "漕溪路",
        "lng": 121.433798,
        "lat": 31.178636
      },
      {
        "name": "龙漕路",
        "lng": 121.439784,
        "lat": 31.171362
      },
      {
        "name": "石龙路",
        "lng": 121.438604,
        "lat": 31.159857
      }
    ],
    "planned": false,
    "segId": "sh-l3-b"
  },
  {
    "id": "sh-2004-x22",
    "year": 2004,
    "date": "2004-12-28",
    "title": "1号线北延开通",
    "detail": "12月28日 · 上海火车站 — 共富新村",
    "line": "1号线",
    "color": "#E4002B",
    "stations": [
      {
        "name": "上海火车站",
        "lng": 121.453367,
        "lat": 31.251526
      },
      {
        "name": "中山北路",
        "lng": 121.454634,
        "lat": 31.260784
      },
      {
        "name": "延长路",
        "lng": 121.450748,
        "lat": 31.273553
      },
      {
        "name": "上海马戏城",
        "lng": 121.447432,
        "lat": 31.281763
      },
      {
        "name": "汶水路",
        "lng": 121.445655,
        "lat": 31.294415
      },
      {
        "name": "彭浦新村",
        "lng": 121.444041,
        "lat": 31.308454
      },
      {
        "name": "共康路",
        "lng": 121.442457,
        "lat": 31.320778
      },
      {
        "name": "通河新村",
        "lng": 121.436927,
        "lat": 31.332958
      },
      {
        "name": "呼兰路",
        "lng": 121.433084,
        "lat": 31.341521
      },
      {
        "name": "共富新村",
        "lng": 121.429428,
        "lat": 31.35689
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2005-x23",
    "year": 2005,
    "date": "2005-10-15",
    "title": "3号线上海南站恢复",
    "detail": "10月15日 · 石龙路 — 上海南站恢复运营",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "石龙路",
        "lng": 121.438604,
        "lat": 31.159857
      },
      {
        "name": "上海南站",
        "lng": 121.425417,
        "lat": 31.156469
      }
    ],
    "planned": false,
    "segId": "sh-l3-a"
  },
  {
    "id": "sh-2005-x24",
    "year": 2005,
    "date": "2005-10-22",
    "title": "东方路站停运",
    "detail": "10月22日 · 配合 6 号线、9 号线施工 · 2号线东方路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.522877,
      "lat": 31.230781,
      "zoom": 15
    },
    "retireStations": [
      "东方路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2005-x25",
    "year": 2005,
    "date": "2005-12-31",
    "title": "4号线开通",
    "detail": "12月31日 · 大木桥路 — 蓝村路",
    "line": "4号线",
    "color": "#5F259F",
    "stations": [
      {
        "name": "蓝村路",
        "lng": 121.523294,
        "lat": 31.21378
      },
      {
        "name": "塘桥",
        "lng": 121.514327,
        "lat": 31.211846
      },
      {
        "name": "南浦大桥",
        "lng": 121.495295,
        "lat": 31.210532
      },
      {
        "name": "西藏南路",
        "lng": 121.485089,
        "lat": 31.203968
      },
      {
        "name": "鲁班路",
        "lng": 121.470632,
        "lat": 31.201182
      },
      {
        "name": "大木桥路",
        "lng": 121.458726,
        "lat": 31.19599
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2006-x26",
    "year": 2006,
    "date": "2006-04-27",
    "title": "磁浮线投入商业运营",
    "detail": "4月27日 · 龙阳路 — 浦东国际机场正式投入商业运营",
    "line": "磁浮线",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.68,
      "lat": 31.18,
      "zoom": 12
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2006-x27",
    "year": 2006,
    "date": "2006-07-18",
    "title": "东方路站更名",
    "detail": "7月18日 · 2号线东方路改称世纪大道",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "东方路",
      "to": "世纪大道",
      "lng": 121.522877,
      "lat": 31.230781,
      "color": "#86B81C"
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2006-x28",
    "year": 2006,
    "date": "2006-10-19",
    "title": "三站更名",
    "detail": "10月19日 · 河南中路改南京东路 · 石门一路改南京西路 · 汶水东路改大柏树",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": [
      {
        "from": "河南中路",
        "to": "南京东路",
        "lng": 121.480141,
        "lat": 31.240071,
        "color": "#86B81C",
        "open": true
      },
      {
        "from": "石门一路",
        "to": "南京西路",
        "lng": 121.455406,
        "lat": 31.23176,
        "color": "#86B81C",
        "open": true
      },
      {
        "from": "汶水东路",
        "to": "大柏树",
        "lng": 121.47872,
        "lat": 31.291376,
        "color": "#FCD600",
        "open": true
      }
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2006-x29",
    "year": 2006,
    "date": "2006-10-28",
    "title": "世纪大道站恢复运营",
    "detail": "10月28日 · 2号线",
    "stations": [
      {
        "name": "世纪大道",
        "lng": 121.522877,
        "lat": 31.230781
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "addStations": [
      {
        "name": "世纪大道",
        "after": "浦东南路(原东昌路)",
        "lng": 121.522877,
        "lat": 31.230781
      }
    ],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2006-x30",
    "year": 2006,
    "date": "2006-12-18",
    "title": "3号线北延开通",
    "detail": "12月18日 · 江湾镇 — 长江南路",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "长江南路",
        "lng": 121.487011,
        "lat": 31.334013
      },
      {
        "name": "殷高西路",
        "lng": 121.480363,
        "lat": 31.321941
      },
      {
        "name": "江湾镇",
        "lng": 121.480573,
        "lat": 31.307508
      }
    ],
    "planned": false,
    "segId": "sh-l3-n0"
  },
  {
    "id": "sh-2006-x31",
    "year": 2006,
    "date": "2006-12-18",
    "title": "3号线通至水产路",
    "detail": "12月18日 · 长江南路 — 水产路",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "水产路",
        "lng": 121.483761,
        "lat": 31.383228
      },
      {
        "name": "淞滨路",
        "lng": 121.488349,
        "lat": 31.37287
      },
      {
        "name": "张华浜",
        "lng": 121.494224,
        "lat": 31.35998
      },
      {
        "name": "淞发路",
        "lng": 121.49595,
        "lat": 31.347109
      },
      {
        "name": "长江南路",
        "lng": 121.487011,
        "lat": 31.334013
      }
    ],
    "planned": false,
    "segId": "sh-l3-n3"
  },
  {
    "id": "sh-2006-x32",
    "year": 2006,
    "date": "2006-12-18",
    "title": "3号线通至江杨北路",
    "detail": "12月18日 · 水产路 — 江杨北路",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "江杨北路",
        "lng": 121.43519,
        "lat": 31.409659
      },
      {
        "name": "铁力路",
        "lng": 121.456562,
        "lat": 31.409964
      },
      {
        "name": "友谊路",
        "lng": 121.471393,
        "lat": 31.4059
      },
      {
        "name": "宝杨路",
        "lng": 121.475056,
        "lat": 31.397211
      },
      {
        "name": "水产路",
        "lng": 121.483761,
        "lat": 31.383228
      }
    ],
    "planned": false,
    "segId": "sh-l3-n2"
  },
  {
    "id": "sh-2006-x33",
    "year": 2006,
    "date": "2006-12-30",
    "title": "2号线西延开通",
    "detail": "12月30日 · 中山公园 — 淞虹路",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "中山公园",
        "lng": 121.411128,
        "lat": 31.219793
      },
      {
        "name": "娄山关路",
        "lng": 121.399408,
        "lat": 31.213002
      },
      {
        "name": "威宁路",
        "lng": 121.38264,
        "lat": 31.216717
      },
      {
        "name": "北新泾",
        "lng": 121.369367,
        "lat": 31.218253
      },
      {
        "name": "淞虹路",
        "lng": 121.354928,
        "lat": 31.220102
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2007-x34",
    "year": 2007,
    "date": "2007-12-29",
    "title": "1号线北延二期开通",
    "detail": "12月29日 · 共富新村 — 富锦路",
    "line": "1号线",
    "color": "#E4002B",
    "stations": [
      {
        "name": "共富新村",
        "lng": 121.429428,
        "lat": 31.35689
      },
      {
        "name": "宝安公路",
        "lng": 121.426272,
        "lat": 31.371354
      },
      {
        "name": "友谊西路",
        "lng": 121.423306,
        "lat": 31.383088
      },
      {
        "name": "富锦路",
        "lng": 121.420009,
        "lat": 31.394045
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2007-x35",
    "year": 2007,
    "date": "2007-12-29",
    "title": "4号线修复段开通",
    "detail": "12月29日 · 大木桥路 — 宜山路",
    "line": "4号线",
    "color": "#5F259F",
    "stations": [
      {
        "name": "大木桥路",
        "lng": 121.458726,
        "lat": 31.19599
      },
      {
        "name": "东安路",
        "lng": 121.450322,
        "lat": 31.192734
      },
      {
        "name": "上海体育场",
        "lng": 121.438927,
        "lat": 31.187499
      },
      {
        "name": "上海体育馆",
        "lng": 121.432809,
        "lat": 31.184699
      },
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      }
    ],
    "planned": false,
    "segId": "sh-l4-sw"
  },
  {
    "id": "sh-2007-x36",
    "year": 2007,
    "date": "2007-12-29",
    "title": "4号线共线段开通",
    "detail": "12月29日 · 宜山路 — 临平路",
    "line": "4号线",
    "color": "#5F259F",
    "stations": [
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      },
      {
        "name": "虹桥路",
        "lng": 121.416175,
        "lat": 31.199382
      },
      {
        "name": "延安西路",
        "lng": 121.412418,
        "lat": 31.211466
      },
      {
        "name": "中山公园",
        "lng": 121.411128,
        "lat": 31.219793
      },
      {
        "name": "金沙江路",
        "lng": 121.408553,
        "lat": 31.233984
      },
      {
        "name": "曹杨路",
        "lng": 121.413055,
        "lat": 31.241138
      },
      {
        "name": "镇坪路",
        "lng": 121.425147,
        "lat": 31.248214
      },
      {
        "name": "中潭路",
        "lng": 121.436387,
        "lat": 31.256425
      },
      {
        "name": "上海火车站",
        "lng": 121.453367,
        "lat": 31.251526
      },
      {
        "name": "宝山路",
        "lng": 121.471782,
        "lat": 31.253463
      },
      {
        "name": "海伦路",
        "lng": 121.484223,
        "lat": 31.261275
      },
      {
        "name": "临平路",
        "lng": 121.496265,
        "lat": 31.262881
      }
    ],
    "planned": false,
    "segId": "sh-l4-share"
  },
  {
    "id": "sh-2007-x37",
    "year": 2007,
    "date": "2007-12-29",
    "title": "4号线通至蓝村路",
    "detail": "12月29日 · 临平路 — 蓝村路 · 环线合龙",
    "line": "4号线",
    "color": "#5F259F",
    "stations": [
      {
        "name": "临平路",
        "lng": 121.496265,
        "lat": 31.262881
      },
      {
        "name": "大连路",
        "lng": 121.508701,
        "lat": 31.259984
      },
      {
        "name": "杨树浦路",
        "lng": 121.512838,
        "lat": 31.253995
      },
      {
        "name": "浦东大道",
        "lng": 121.514939,
        "lat": 31.242379
      },
      {
        "name": "世纪大道",
        "lng": 121.522877,
        "lat": 31.230781
      },
      {
        "name": "向城路",
        "lng": 121.527761,
        "lat": 31.2244
      },
      {
        "name": "蓝村路",
        "lng": 121.523294,
        "lat": 31.21378
      }
    ],
    "planned": false,
    "segId": "sh-l4-ne"
  },
  {
    "id": "sh-2007-x38",
    "year": 2007,
    "date": "2007-12-29",
    "title": "6号线一期开通",
    "detail": "12月29日 · 灵岩南路 — 港城路",
    "line": "6号线",
    "color": "#D9017A",
    "stations": [
      {
        "name": "灵岩南路",
        "lng": 121.490854,
        "lat": 31.15071
      },
      {
        "name": "上南路",
        "lng": 121.502046,
        "lat": 31.150899
      },
      {
        "name": "华夏西路",
        "lng": 121.510167,
        "lat": 31.15198
      },
      {
        "name": "高青路",
        "lng": 121.511418,
        "lat": 31.162007
      },
      {
        "name": "东明路",
        "lng": 121.506481,
        "lat": 31.174725
      },
      {
        "name": "高科西路",
        "lng": 121.505453,
        "lat": 31.187831
      },
      {
        "name": "临沂新村",
        "lng": 121.512327,
        "lat": 31.195288
      },
      {
        "name": "上海儿童医学中心",
        "lng": 121.519136,
        "lat": 31.205378
      },
      {
        "name": "蓝村路",
        "lng": 121.523294,
        "lat": 31.21378
      },
      {
        "name": "浦电路",
        "lng": 121.525023,
        "lat": 31.222262
      },
      {
        "name": "世纪大道",
        "lng": 121.522877,
        "lat": 31.230781
      },
      {
        "name": "源深体育中心",
        "lng": 121.53033,
        "lat": 31.23512
      },
      {
        "name": "民生路",
        "lng": 121.539241,
        "lat": 31.237987
      },
      {
        "name": "北洋泾路",
        "lng": 121.54805,
        "lat": 31.241298
      },
      {
        "name": "德平路",
        "lng": 121.559999,
        "lat": 31.247571
      },
      {
        "name": "云山路",
        "lng": 121.566926,
        "lat": 31.253147
      },
      {
        "name": "金桥路",
        "lng": 121.577604,
        "lat": 31.259269
      },
      {
        "name": "博兴路",
        "lng": 121.58248,
        "lat": 31.265705
      },
      {
        "name": "五莲路",
        "lng": 121.583657,
        "lat": 31.274207
      },
      {
        "name": "巨峰路",
        "lng": 121.584155,
        "lat": 31.282863
      },
      {
        "name": "东靖路",
        "lng": 121.584526,
        "lat": 31.292859
      },
      {
        "name": "五洲大道",
        "lng": 121.585001,
        "lat": 31.304739
      },
      {
        "name": "洲海路",
        "lng": 121.585184,
        "lat": 31.314395
      },
      {
        "name": "外高桥保税区南",
        "lng": 121.597755,
        "lat": 31.323742
      },
      {
        "name": "航津路",
        "lng": 121.589763,
        "lat": 31.33753
      },
      {
        "name": "外高桥保税区北",
        "lng": 121.58271,
        "lat": 31.349955
      },
      {
        "name": "港城路",
        "lng": 121.570788,
        "lat": 31.355365
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2007-x39",
    "year": 2007,
    "date": "2007-12-29",
    "title": "8号线一期开通",
    "detail": "12月29日 · 耀华路 — 市光路",
    "line": "8号线",
    "color": "#009FDF",
    "stations": [
      {
        "name": "耀华路",
        "lng": 121.490159,
        "lat": 31.180541
      },
      {
        "name": "周家渡",
        "lng": 121.489176,
        "lat": 31.187263
      },
      {
        "name": "西藏南路",
        "lng": 121.485089,
        "lat": 31.203968
      }
    ],
    "ghost": [
      "周家渡"
    ],
    "planned": false,
    "segId": "sh-l8-a"
  },
  {
    "id": "sh-2007-x40",
    "year": 2007,
    "date": "2007-12-29",
    "title": "8号线通至市光路",
    "detail": "12月29日 · 西藏南路 — 市光路",
    "line": "8号线",
    "color": "#009FDF",
    "stations": [
      {
        "name": "西藏南路",
        "lng": 121.485089,
        "lat": 31.203968
      },
      {
        "name": "陆家浜路",
        "lng": 121.481636,
        "lat": 31.213775
      },
      {
        "name": "老西门",
        "lng": 121.479305,
        "lat": 31.22099
      },
      {
        "name": "大世界",
        "lng": 121.474677,
        "lat": 31.229351
      },
      {
        "name": "人民广场",
        "lng": 121.470589,
        "lat": 31.234632
      },
      {
        "name": "曲阜路",
        "lng": 121.467012,
        "lat": 31.244238
      },
      {
        "name": "中兴路",
        "lng": 121.464486,
        "lat": 31.255147
      },
      {
        "name": "西藏北路",
        "lng": 121.464277,
        "lat": 31.265367
      },
      {
        "name": "虹口足球场",
        "lng": 121.474646,
        "lat": 31.273331
      },
      {
        "name": "曲阳路",
        "lng": 121.486671,
        "lat": 31.278496
      },
      {
        "name": "四平路",
        "lng": 121.497058,
        "lat": 31.276884
      },
      {
        "name": "鞍山新村",
        "lng": 121.505285,
        "lat": 31.275271
      },
      {
        "name": "江浦路",
        "lng": 121.51401,
        "lat": 31.277
      },
      {
        "name": "黄兴路",
        "lng": 121.524065,
        "lat": 31.280894
      },
      {
        "name": "延吉中路",
        "lng": 121.530625,
        "lat": 31.290636
      },
      {
        "name": "黄兴公园",
        "lng": 121.529062,
        "lat": 31.297475
      },
      {
        "name": "翔殷路",
        "lng": 121.527647,
        "lat": 31.307081
      },
      {
        "name": "嫩江路",
        "lng": 121.527627,
        "lat": 31.316879
      },
      {
        "name": "市光路",
        "lng": 121.527605,
        "lat": 31.324796
      }
    ],
    "planned": false,
    "segId": "sh-l8-b"
  },
  {
    "id": "sh-2007-x41",
    "year": 2007,
    "date": "2007-12-29",
    "title": "9号线开通",
    "detail": "12月29日 · 桂林路 — 佘山",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "桂林路",
        "lng": 121.413424,
        "lat": 31.176659
      },
      {
        "name": "漕河泾开发区",
        "lng": 121.393123,
        "lat": 31.172509
      },
      {
        "name": "合川路",
        "lng": 121.380134,
        "lat": 31.168415
      },
      {
        "name": "星中路",
        "lng": 121.364284,
        "lat": 31.160002
      },
      {
        "name": "七宝",
        "lng": 121.344638,
        "lat": 31.157212
      },
      {
        "name": "中春路",
        "lng": 121.330045,
        "lat": 31.151721
      },
      {
        "name": "九亭",
        "lng": 121.314908,
        "lat": 31.139242
      },
      {
        "name": "泗泾",
        "lng": 121.255827,
        "lat": 31.120349
      },
      {
        "name": "佘山",
        "lng": 121.225265,
        "lat": 31.106177
      }
    ],
    "planned": false,
    "segId": "sh-l9-a"
  },
  {
    "id": "sh-2007-x42",
    "year": 2007,
    "date": "2007-12-29",
    "title": "9号线通至松江新城",
    "detail": "12月29日 · 佘山 — 松江新城",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "佘山",
        "lng": 121.225265,
        "lat": 31.106177
      },
      {
        "name": "洞泾",
        "lng": 121.226054,
        "lat": 31.086583
      },
      {
        "name": "松江大学城",
        "lng": 121.228162,
        "lat": 31.056094
      },
      {
        "name": "松江新城",
        "lng": 121.226325,
        "lat": 31.032418
      }
    ],
    "planned": false,
    "segId": "sh-l9-song"
  },
  {
    "id": "sh-2008-x43",
    "year": 2008,
    "date": "2008-01-22",
    "title": "8号线区间停运",
    "detail": "1月22日 · 配合西藏南路隧道施工 · 耀华路 — 西藏南路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.49,
      "lat": 31.2,
      "zoom": 14
    },
    "retireSegIds": [
      "sh-l8-a"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2008-x44",
    "year": 2008,
    "date": "2008-02-01",
    "title": "8号线区间恢复",
    "detail": "2月1日 · 西藏南路 — 耀华路恢复运营",
    "line": "8号线",
    "color": "#009FDF",
    "stations": [
      {
        "name": "耀华路",
        "lng": 121.490159,
        "lat": 31.180541
      },
      {
        "name": "周家渡",
        "lng": 121.489176,
        "lat": 31.187263
      },
      {
        "name": "西藏南路",
        "lng": 121.485089,
        "lat": 31.203968
      }
    ],
    "ghost": [
      "周家渡"
    ],
    "planned": false,
    "segId": "sh-l8-a"
  },
  {
    "id": "sh-2008-x45",
    "year": 2008,
    "date": "2008-05-28",
    "title": "上海地铁 15 周年",
    "detail": "自 1993 年 5 月 28 日徐家汇 — 锦江乐园开通 · 十五周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.22,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2008-x46",
    "year": 2008,
    "date": "2008-12-28",
    "title": "9号线东延开通",
    "detail": "12月28日 · 桂林路 — 宜山路",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      },
      {
        "name": "桂林路",
        "lng": 121.413424,
        "lat": 31.176659
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2009-x47",
    "year": 2009,
    "date": "2009-07-05",
    "title": "8号线二期开通",
    "detail": "7月5日 · 耀华路 — 航天博物馆",
    "line": "8号线",
    "color": "#009FDF",
    "stations": [
      {
        "name": "航天博物馆",
        "lng": 121.507899,
        "lat": 31.063571
      },
      {
        "name": "联航路",
        "lng": 121.506214,
        "lat": 31.075699
      },
      {
        "name": "江月路",
        "lng": 121.504215,
        "lat": 31.086373
      },
      {
        "name": "浦江镇",
        "lng": 121.501875,
        "lat": 31.098697
      },
      {
        "name": "芦恒路",
        "lng": 121.493832,
        "lat": 31.12114
      },
      {
        "name": "凌兆新村",
        "lng": 121.485202,
        "lat": 31.143333
      },
      {
        "name": "济阳路",
        "lng": 121.47581,
        "lat": 31.155365
      },
      {
        "name": "杨思",
        "lng": 121.488994,
        "lat": 31.163087
      },
      {
        "name": "成山路",
        "lng": 121.49178,
        "lat": 31.172772
      },
      {
        "name": "耀华路",
        "lng": 121.490159,
        "lat": 31.180541
      }
    ],
    "ghost": [
      "济阳路"
    ],
    "planned": false
  },
  {
    "id": "sh-2009-x48",
    "year": 2009,
    "date": "2009-12-05",
    "title": "7号线首段开通",
    "detail": "12月5日 · 花木路 — 高科西路",
    "line": "7号线",
    "color": "#FF6900",
    "stations": [
      {
        "name": "花木路",
        "lng": 121.558516,
        "lat": 31.213396
      },
      {
        "name": "龙阳路",
        "lng": 121.553386,
        "lat": 31.205755
      },
      {
        "name": "芳华路",
        "lng": 121.54585,
        "lat": 31.195281
      },
      {
        "name": "锦绣路",
        "lng": 121.535749,
        "lat": 31.189743
      },
      {
        "name": "杨高南路（7号线）",
        "lng": 121.520198,
        "lat": 31.189724
      },
      {
        "name": "高科西路",
        "lng": 121.505453,
        "lat": 31.187831
      }
    ],
    "planned": false,
    "segId": "sh-l7-e"
  },
  {
    "id": "sh-2009-x49",
    "year": 2009,
    "date": "2009-12-05",
    "title": "7号线通至云台路",
    "detail": "12月5日 · 高科西路 — 云台路",
    "line": "7号线",
    "color": "#FF6900",
    "stations": [
      {
        "name": "高科西路",
        "lng": 121.505453,
        "lat": 31.187831
      },
      {
        "name": "云台路",
        "lng": 121.496013,
        "lat": 31.184255
      }
    ],
    "planned": false,
    "segId": "sh-l7-gap"
  },
  {
    "id": "sh-2009-x50",
    "year": 2009,
    "date": "2009-12-05",
    "title": "7号线通至上海大学",
    "detail": "12月5日 · 云台路 — 上海大学",
    "line": "7号线",
    "color": "#FF6900",
    "stations": [
      {
        "name": "云台路",
        "lng": 121.496013,
        "lat": 31.184255
      },
      {
        "name": "耀华路",
        "lng": 121.490159,
        "lat": 31.180541
      },
      {
        "name": "长清路",
        "lng": 121.483305,
        "lat": 31.176462
      },
      {
        "name": "后滩",
        "lng": 121.469238,
        "lat": 31.173889
      },
      {
        "name": "船厂路",
        "lng": 121.452495,
        "lat": 31.186302
      },
      {
        "name": "东安路",
        "lng": 121.450322,
        "lat": 31.192734
      },
      {
        "name": "肇嘉浜路",
        "lng": 121.445624,
        "lat": 31.201336
      },
      {
        "name": "常熟路",
        "lng": 121.444549,
        "lat": 31.215415
      },
      {
        "name": "静安寺",
        "lng": 121.441934,
        "lat": 31.225113
      },
      {
        "name": "昌平路",
        "lng": 121.438009,
        "lat": 31.235619
      },
      {
        "name": "长寿路",
        "lng": 121.433654,
        "lat": 31.242719
      },
      {
        "name": "镇坪路",
        "lng": 121.425147,
        "lat": 31.248214
      },
      {
        "name": "岚皋路",
        "lng": 121.417296,
        "lat": 31.25803
      },
      {
        "name": "新村路",
        "lng": 121.418025,
        "lat": 31.265684
      },
      {
        "name": "大华三路",
        "lng": 121.418305,
        "lat": 31.275872
      },
      {
        "name": "行知路",
        "lng": 121.417124,
        "lat": 31.286316
      },
      {
        "name": "大场镇",
        "lng": 121.411505,
        "lat": 31.295071
      },
      {
        "name": "场中路",
        "lng": 121.408804,
        "lat": 31.305489
      },
      {
        "name": "上大路",
        "lng": 121.404028,
        "lat": 31.316769
      },
      {
        "name": "南陈路",
        "lng": 121.39376,
        "lat": 31.323537
      },
      {
        "name": "上海大学",
        "lng": 121.384229,
        "lat": 31.322387
      }
    ],
    "ghost": [
      "后滩"
    ],
    "planned": false,
    "segId": "sh-l7-w"
  },
  {
    "id": "sh-2009-x51",
    "year": 2009,
    "date": "2009-12-31",
    "title": "9号线东延开通",
    "detail": "12月31日 · 宜山路 — 世纪大道",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "世纪大道",
        "lng": 121.522877,
        "lat": 31.230781
      },
      {
        "name": "商城路",
        "lng": 121.511902,
        "lat": 31.232325
      },
      {
        "name": "小南门",
        "lng": 121.493962,
        "lat": 31.218886
      },
      {
        "name": "陆家浜路",
        "lng": 121.481636,
        "lat": 31.213775
      },
      {
        "name": "马当路",
        "lng": 121.472746,
        "lat": 31.211482
      },
      {
        "name": "打浦桥",
        "lng": 121.464144,
        "lat": 31.208249
      },
      {
        "name": "嘉善路",
        "lng": 121.456143,
        "lat": 31.204742
      },
      {
        "name": "肇嘉浜路",
        "lng": 121.445624,
        "lat": 31.201336
      },
      {
        "name": "徐家汇",
        "lng": 121.431986,
        "lat": 31.197392
      },
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2009-x52",
    "year": 2009,
    "date": "2009-12-31",
    "title": "11号线一期开通",
    "detail": "12月31日 · 江苏路 — 嘉定北",
    "line": "11号线",
    "color": "#f1c6a6",
    "stations": [
      {
        "name": "江苏路",
        "lng": 121.426013,
        "lat": 31.222269
      },
      {
        "name": "隆德路",
        "lng": 121.418937,
        "lat": 31.232354
      },
      {
        "name": "曹杨路",
        "lng": 121.413055,
        "lat": 31.241138
      },
      {
        "name": "枫桥路",
        "lng": 121.406752,
        "lat": 31.243682
      },
      {
        "name": "真如",
        "lng": 121.402566,
        "lat": 31.252593
      },
      {
        "name": "上海西站",
        "lng": 121.396272,
        "lat": 31.264514
      },
      {
        "name": "李子园",
        "lng": 121.385318,
        "lat": 31.270841
      },
      {
        "name": "祁连山路",
        "lng": 121.371397,
        "lat": 31.273481
      },
      {
        "name": "武威路",
        "lng": 121.360056,
        "lat": 31.278489
      },
      {
        "name": "桃浦新村",
        "lng": 121.345028,
        "lat": 31.283468
      },
      {
        "name": "南翔",
        "lng": 121.318604,
        "lat": 31.29886
      },
      {
        "name": "陈翔公路",
        "lng": 121.302285,
        "lat": 31.308418
      },
      {
        "name": "马陆",
        "lng": 121.272454,
        "lat": 31.321646
      },
      {
        "name": "嘉定新城",
        "lng": 121.249859,
        "lat": 31.332043
      },
      {
        "name": "白银路",
        "lng": 121.240915,
        "lat": 31.347335
      },
      {
        "name": "嘉定西",
        "lng": 121.223409,
        "lat": 31.379064
      },
      {
        "name": "嘉定北",
        "lng": 121.232909,
        "lat": 31.393508
      }
    ],
    "ghost": [
      "陈翔公路"
    ],
    "planned": false
  },
  {
    "id": "sh-2009-x53",
    "year": 2009,
    "date": "2009-12-31",
    "title": "张江有轨电车开通",
    "detail": "12月31日 · 张江地铁站 — 张东路金秋路",
    "line": "张江有轨电车",
    "color": "#C73E3A",
    "stations": [
      {
        "name": "张江地铁站",
        "lng": 121.5875,
        "lat": 31.2018
      },
      {
        "name": "碧波路",
        "lng": 121.598,
        "lat": 31.203
      },
      {
        "name": "高斯路",
        "lng": 121.615,
        "lat": 31.204
      },
      {
        "name": "张东路金秋路",
        "lng": 121.638,
        "lat": 31.206
      }
    ],
    "planned": false,
    "segId": "sh-tram-zj"
  },
  {
    "id": "sh-2010-x54",
    "year": 2010,
    "date": "2010-02-14",
    "title": "2号线东延段停运改造",
    "detail": "2月14日 · 张江高科 — 龙阳路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.57,
      "lat": 31.205,
      "zoom": 14
    },
    "retireSegIds": [
      "sh-l2-e"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2010-x55",
    "year": 2010,
    "date": "2010-02-24",
    "title": "2号线东延开通",
    "detail": "2月24日 · 龙阳路 — 广兰路",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "广兰路",
        "lng": 121.616864,
        "lat": 31.21325
      },
      {
        "name": "金科路",
        "lng": 121.59779,
        "lat": 31.206428
      },
      {
        "name": "张江高科",
        "lng": 121.583286,
        "lat": 31.204086
      },
      {
        "name": "龙阳路",
        "lng": 121.553386,
        "lat": 31.205755
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2010-x56",
    "year": 2010,
    "date": "2010-03-16",
    "title": "2号线西延开通",
    "detail": "3月16日 · 淞虹路 — 徐泾东",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "淞虹路",
        "lng": 121.354928,
        "lat": 31.220102
      },
      {
        "name": "虹桥2号航站楼",
        "lng": 121.319911,
        "lat": 31.196007
      },
      {
        "name": "虹桥火车站",
        "lng": 121.314431,
        "lat": 31.195984
      },
      {
        "name": "徐泾东",
        "lng": 121.294727,
        "lat": 31.190367
      }
    ],
    "ghost": [
      "虹桥火车站"
    ],
    "planned": false,
    "segId": "sh-l2-w"
  },
  {
    "id": "sh-2010-x57",
    "year": 2010,
    "date": "2010-03-29",
    "title": "11号线支线开通",
    "detail": "3月29日 · 嘉定新城 — 安亭",
    "line": "11号线",
    "color": "#f1c6a6",
    "stations": [
      {
        "name": "嘉定新城",
        "lng": 121.249859,
        "lat": 31.332043
      },
      {
        "name": "上海赛车场",
        "lng": 121.221654,
        "lat": 31.333869
      },
      {
        "name": "昌吉东路",
        "lng": 121.19591,
        "lat": 31.295573
      },
      {
        "name": "上海汽车城",
        "lng": 121.176231,
        "lat": 31.287325
      },
      {
        "name": "安亭",
        "lng": 121.157436,
        "lat": 31.290376
      }
    ],
    "ghost": [
      "昌吉东路"
    ],
    "planned": false
  },
  {
    "id": "sh-2010-x58",
    "year": 2010,
    "date": "2010-04-07",
    "title": "9号线东延开通",
    "detail": "4月7日 · 世纪大道 — 杨高中路",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "杨高中路",
        "lng": 121.544392,
        "lat": 31.229661
      },
      {
        "name": "世纪大道",
        "lng": 121.522877,
        "lat": 31.230781
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2010-x59",
    "year": 2010,
    "date": "2010-04-08",
    "title": "2号线通至机场",
    "detail": "4月8日 · 广兰路 — 浦东国际机场",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "浦东国际机场",
        "lng": 121.801301,
        "lat": 31.153065
      },
      {
        "name": "海天三路",
        "lng": 121.792567,
        "lat": 31.170543
      },
      {
        "name": "远东大道",
        "lng": 121.750929,
        "lat": 31.201415
      },
      {
        "name": "凌空路",
        "lng": 121.719728,
        "lat": 31.194907
      },
      {
        "name": "川沙",
        "lng": 121.693875,
        "lat": 31.188825
      },
      {
        "name": "华夏东路",
        "lng": 121.676667,
        "lat": 31.198684
      },
      {
        "name": "创新中路",
        "lng": 121.669421,
        "lat": 31.215986
      },
      {
        "name": "唐镇",
        "lng": 121.65201,
        "lat": 31.216255
      },
      {
        "name": "广兰路",
        "lng": 121.616864,
        "lat": 31.21325
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2010-x60",
    "year": 2010,
    "date": "2010-04-10",
    "title": "10号线一期开通",
    "detail": "4月10日 · 航中路 — 新江湾城",
    "line": "10号线",
    "color": "#C1A7E2",
    "stations": [
      {
        "name": "航中路",
        "lng": 121.35074,
        "lat": 31.167327
      },
      {
        "name": "龙柏新村",
        "lng": 121.365857,
        "lat": 31.178764
      },
      {
        "name": "龙溪路",
        "lng": 121.375398,
        "lat": 31.196263
      },
      {
        "name": "水城路",
        "lng": 121.387613,
        "lat": 31.201334
      },
      {
        "name": "伊犁路",
        "lng": 121.39925,
        "lat": 31.20073
      },
      {
        "name": "宋园路",
        "lng": 121.407434,
        "lat": 31.198393
      },
      {
        "name": "虹桥路",
        "lng": 121.416175,
        "lat": 31.199382
      },
      {
        "name": "交通大学",
        "lng": 121.430633,
        "lat": 31.204086
      },
      {
        "name": "上海图书馆",
        "lng": 121.439761,
        "lat": 31.209845
      },
      {
        "name": "陕西南路",
        "lng": 121.454174,
        "lat": 31.217059
      },
      {
        "name": "新天地",
        "lng": 121.470665,
        "lat": 31.21832
      },
      {
        "name": "老西门",
        "lng": 121.479305,
        "lat": 31.22099
      },
      {
        "name": "豫园",
        "lng": 121.48295,
        "lat": 31.229987
      },
      {
        "name": "南京东路",
        "lng": 121.480141,
        "lat": 31.240071
      },
      {
        "name": "天潼路",
        "lng": 121.477826,
        "lat": 31.245775
      },
      {
        "name": "四川北路",
        "lng": 121.479719,
        "lat": 31.253997
      },
      {
        "name": "海伦路",
        "lng": 121.484223,
        "lat": 31.261275
      },
      {
        "name": "邮电新村",
        "lng": 121.489792,
        "lat": 31.270416
      },
      {
        "name": "四平路",
        "lng": 121.497058,
        "lat": 31.276884
      },
      {
        "name": "同济大学",
        "lng": 121.501944,
        "lat": 31.284101
      },
      {
        "name": "国权路",
        "lng": 121.505624,
        "lat": 31.291299
      },
      {
        "name": "五角场",
        "lng": 121.510248,
        "lat": 31.300076
      },
      {
        "name": "江湾体育场",
        "lng": 121.508924,
        "lat": 31.30632
      },
      {
        "name": "三门路",
        "lng": 121.503932,
        "lat": 31.315223
      },
      {
        "name": "殷高东路",
        "lng": 121.502383,
        "lat": 31.323769
      },
      {
        "name": "新江湾城",
        "lng": 121.502537,
        "lat": 31.330495
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2010-x61",
    "year": 2010,
    "date": "2010-04-20",
    "title": "世博专线开通",
    "detail": "4月20日 · 马当路 — 世博大道",
    "line": "世博专线",
    "color": "#C45C26",
    "stations": [
      {
        "name": "马当路",
        "lng": 121.472746,
        "lat": 31.211482
      },
      {
        "name": "卢浦大桥",
        "lng": 121.477098,
        "lat": 31.199552
      },
      {
        "name": "世博大道",
        "lng": 121.47983,
        "lat": 31.184784
      }
    ],
    "planned": false,
    "segId": "sh-expo"
  },
  {
    "id": "sh-2010-x62",
    "year": 2010,
    "date": "2010-04-20",
    "title": "后滩站投入使用",
    "detail": "4月20日 · 7号线",
    "stations": [
      {
        "name": "后滩",
        "lng": 121.469238,
        "lat": 31.173889
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "后滩"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2010-x63",
    "year": 2010,
    "date": "2010-07-01",
    "title": "虹桥火车站开通",
    "detail": "7月1日 · 2号线随高铁站投入使用",
    "stations": [
      {
        "name": "虹桥火车站",
        "lng": 121.314431,
        "lat": 31.195984
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "虹桥火车站"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2010-x64",
    "year": 2010,
    "date": "2010-11-02",
    "title": "世博专线停运",
    "detail": "11月2日 · 世博会闭园 · 马当路 — 世博大道退出运营",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.48,
      "lat": 31.19,
      "zoom": 14
    },
    "retireSegIds": [
      "sh-expo"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2010-x65",
    "year": 2010,
    "date": "2010-11-28",
    "title": "10号线通至虹桥",
    "detail": "11月28日 · 龙溪路 — 虹桥火车站",
    "line": "10号线",
    "color": "#C1A7E2",
    "stations": [
      {
        "name": "龙溪路",
        "lng": 121.375398,
        "lat": 31.196263
      },
      {
        "name": "上海动物园",
        "lng": 121.363517,
        "lat": 31.192124
      },
      {
        "name": "虹桥1号航站楼",
        "lng": 121.342789,
        "lat": 31.193273
      },
      {
        "name": "虹桥2号航站楼",
        "lng": 121.319911,
        "lat": 31.196007
      },
      {
        "name": "虹桥火车站",
        "lng": 121.314431,
        "lat": 31.195984
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2010-x66",
    "year": 2010,
    "date": "2010-12-28",
    "title": "7号线北延开通",
    "detail": "12月28日 · 上海大学 — 美兰湖",
    "line": "7号线",
    "color": "#FF6900",
    "stations": [
      {
        "name": "上海大学",
        "lng": 121.384229,
        "lat": 31.322387
      },
      {
        "name": "祁华路",
        "lng": 121.368889,
        "lat": 31.324202
      },
      {
        "name": "顾村公园",
        "lng": 121.368368,
        "lat": 31.346401
      },
      {
        "name": "刘行",
        "lng": 121.35775,
        "lat": 31.359402
      },
      {
        "name": "潘广路",
        "lng": 121.351231,
        "lat": 31.366006
      },
      {
        "name": "罗南新村",
        "lng": 121.35285,
        "lat": 31.390645
      },
      {
        "name": "美兰湖",
        "lng": 121.345288,
        "lat": 31.403712
      }
    ],
    "ghost": [
      "祁华路",
      "刘行",
      "潘广路"
    ],
    "planned": false
  },
  {
    "id": "sh-2011-x67",
    "year": 2011,
    "date": "2011-04-12",
    "title": "济阳路站开通",
    "detail": "4月12日 · 6号线、8号线一同启用",
    "line": "6号线",
    "color": "#D9017A",
    "stations": [
      {
        "name": "济阳路",
        "lng": 121.47581,
        "lat": 31.155365
      },
      {
        "name": "灵岩南路",
        "lng": 121.490854,
        "lat": 31.15071
      }
    ],
    "planned": false,
    "openStations": [
      "济阳路"
    ]
  },
  {
    "id": "sh-2011-x68",
    "year": 2011,
    "date": "2011-04-26",
    "title": "昌吉东路站开通",
    "detail": "4月26日 · 11号线",
    "stations": [
      {
        "name": "昌吉东路",
        "lng": 121.19591,
        "lat": 31.295573
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "昌吉东路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2011-x69",
    "year": 2011,
    "date": "2011-05-07",
    "title": "济阳路站更名",
    "detail": "5月7日 · 6号线、8号线济阳路改称东方体育中心",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "济阳路",
      "to": "东方体育中心",
      "lng": 121.47581,
      "lat": 31.155365,
      "color": "#F0087D",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2011-x70",
    "year": 2011,
    "date": "2011-06-30",
    "title": "7号线两站启用",
    "detail": "6月30日 · 潘广路、刘行投入使用",
    "stations": [
      {
        "name": "潘广路",
        "lng": 121.351231,
        "lat": 31.366006
      },
      {
        "name": "刘行",
        "lng": 121.35775,
        "lat": 31.359402
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "潘广路",
      "刘行"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2012-x71",
    "year": 2012,
    "date": "2012-01-23",
    "title": "4号线共线段停运",
    "detail": "1月23日 · 不均衡沉降大修 · 临平路 — 宜山路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.43,
      "lat": 31.24,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l4-share"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2012-x72",
    "year": 2012,
    "date": "2012-01-29",
    "title": "4号线共线段恢复",
    "detail": "1月29日 · 临平路 — 宜山路恢复运营",
    "line": "4号线",
    "color": "#5F259F",
    "stations": [
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      },
      {
        "name": "虹桥路",
        "lng": 121.416175,
        "lat": 31.199382
      },
      {
        "name": "延安西路",
        "lng": 121.412418,
        "lat": 31.211466
      },
      {
        "name": "中山公园",
        "lng": 121.411128,
        "lat": 31.219793
      },
      {
        "name": "金沙江路",
        "lng": 121.408553,
        "lat": 31.233984
      },
      {
        "name": "曹杨路",
        "lng": 121.413055,
        "lat": 31.241138
      },
      {
        "name": "镇坪路",
        "lng": 121.425147,
        "lat": 31.248214
      },
      {
        "name": "中潭路",
        "lng": 121.436387,
        "lat": 31.256425
      },
      {
        "name": "上海火车站",
        "lng": 121.453367,
        "lat": 31.251526
      },
      {
        "name": "宝山路",
        "lng": 121.471782,
        "lat": 31.253463
      },
      {
        "name": "海伦路",
        "lng": 121.484223,
        "lat": 31.261275
      },
      {
        "name": "临平路",
        "lng": 121.496265,
        "lat": 31.262881
      }
    ],
    "planned": false,
    "segId": "sh-l4-share"
  },
  {
    "id": "sh-2012-x73",
    "year": 2012,
    "date": "2012-08-07",
    "title": "9号线松江段停运",
    "detail": "8月7日 · 设备改造 · 松江新城 — 佘山停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.23,
      "lat": 31.04,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l9-song"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2012-x74",
    "year": 2012,
    "date": "2012-09-04",
    "title": "9号线松江段恢复",
    "detail": "9月4日 · 松江新城 — 佘山恢复运营",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "佘山",
        "lng": 121.225265,
        "lat": 31.106177
      },
      {
        "name": "洞泾",
        "lng": 121.226054,
        "lat": 31.086583
      },
      {
        "name": "松江大学城",
        "lng": 121.228162,
        "lat": 31.056094
      },
      {
        "name": "松江新城",
        "lng": 121.226325,
        "lat": 31.032418
      }
    ],
    "planned": false,
    "segId": "sh-l9-song"
  },
  {
    "id": "sh-2012-x75",
    "year": 2012,
    "date": "2012-09-28",
    "title": "周家渡站更名开通",
    "detail": "9月28日 · 8号线周家渡改称中华艺术宫并投入使用",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "周家渡",
      "to": "中华艺术宫",
      "lng": 121.489176,
      "lat": 31.187263,
      "color": "#01A2E2",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2012-x76",
    "year": 2012,
    "date": "2012-09-29",
    "title": "金山铁路开通",
    "detail": "9月29日 · 改造竣工 · 上海南站 — 金山卫",
    "line": "金山铁路",
    "color": "#C80068",
    "stations": [
      {
        "name": "上海南站",
        "lng": 121.425417,
        "lat": 31.156469
      },
      {
        "name": "春申",
        "lng": 121.355,
        "lat": 31.07833
      },
      {
        "name": "新桥",
        "lng": 121.319056,
        "lat": 31.061417
      },
      {
        "name": "车墩",
        "lng": 121.316039,
        "lat": 31.007277
      },
      {
        "name": "叶榭",
        "lng": 121.32491,
        "lat": 30.942094
      },
      {
        "name": "亭林",
        "lng": 121.353985,
        "lat": 30.897016
      },
      {
        "name": "金山园区",
        "lng": 121.36361,
        "lat": 30.83222
      },
      {
        "name": "金山卫",
        "lng": 121.358031,
        "lat": 30.730305
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2012-x77",
    "year": 2012,
    "date": "2012-12-24",
    "title": "船厂路站更名",
    "detail": "12月24日 · 7号线船厂路改称龙华中路",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "船厂路",
      "to": "龙华中路",
      "lng": 121.452495,
      "lat": 31.186302,
      "color": "#EE782E",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2012-x78",
    "year": 2012,
    "date": "2012-12-30",
    "title": "9号线松江段开通",
    "detail": "12月30日 · 松江新城 — 松江南站",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "松江新城",
        "lng": 121.226325,
        "lat": 31.032418
      },
      {
        "name": "松江体育中心",
        "lng": 121.226133,
        "lat": 31.018137
      },
      {
        "name": "醉白池",
        "lng": 121.224948,
        "lat": 31.003264
      },
      {
        "name": "松江南站",
        "lng": 121.226473,
        "lat": 30.986967
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2012-x79",
    "year": 2012,
    "date": "2012-12-30",
    "title": "13号线一期西段开通",
    "detail": "12月30日 · 金运路 — 金沙江路",
    "line": "13号线",
    "color": "#EF95CF",
    "stations": [
      {
        "name": "金运路",
        "lng": 121.314784,
        "lat": 31.242925
      },
      {
        "name": "金沙江西路",
        "lng": 121.330596,
        "lat": 31.243061
      },
      {
        "name": "丰庄",
        "lng": 121.350539,
        "lat": 31.244425
      },
      {
        "name": "祁连山南路",
        "lng": 121.362652,
        "lat": 31.239482
      },
      {
        "name": "真北路",
        "lng": 121.377306,
        "lat": 31.234078
      },
      {
        "name": "大渡河路",
        "lng": 121.389781,
        "lat": 31.233588
      },
      {
        "name": "金沙江路",
        "lng": 121.408553,
        "lat": 31.233984
      }
    ],
    "ghost": [
      "祁连山南路",
      "大渡河路"
    ],
    "planned": false
  },
  {
    "id": "sh-2013-x80",
    "year": 2013,
    "date": "2013-05-28",
    "title": "上海地铁 20 周年",
    "detail": "自 1993 年 5 月 28 日徐家汇 — 锦江乐园开通 · 二十周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.22,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2013-x81",
    "year": 2013,
    "date": "2013-06-15",
    "title": "祁连山南路站开通",
    "detail": "6月15日 · 13号线祁连山南站投入使用",
    "stations": [
      {
        "name": "祁连山南路",
        "lng": 121.362652,
        "lat": 31.239482
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "祁连山南路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2013-x82",
    "year": 2013,
    "date": "2013-08-31",
    "title": "航天博物馆站更名",
    "detail": "8月31日 · 8号线航天博物馆改称沈杜公路",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "航天博物馆",
      "to": "沈杜公路",
      "lng": 121.507899,
      "lat": 31.063571,
      "color": "#01A2E2",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2013-x83",
    "year": 2013,
    "date": "2013-08-31",
    "title": "11号线二期开通",
    "detail": "8月31日 · 江苏路 — 罗山路",
    "line": "11号线",
    "color": "#f1c6a6",
    "stations": [
      {
        "name": "罗山路",
        "lng": 121.588956,
        "lat": 31.155499
      },
      {
        "name": "御桥",
        "lng": 121.566695,
        "lat": 31.160353
      },
      {
        "name": "康恒路",
        "lng": 121.549446,
        "lat": 31.156426
      },
      {
        "name": "浦三路",
        "lng": 121.534713,
        "lat": 31.153029
      },
      {
        "name": "三林东",
        "lng": 121.518656,
        "lat": 31.148587
      },
      {
        "name": "三林",
        "lng": 121.507415,
        "lat": 31.145322
      },
      {
        "name": "东方体育中心",
        "lng": 121.47581,
        "lat": 31.155365
      },
      {
        "name": "龙耀路",
        "lng": 121.455142,
        "lat": 31.161661
      },
      {
        "name": "云锦路",
        "lng": 121.453955,
        "lat": 31.168423
      },
      {
        "name": "龙华",
        "lng": 121.448379,
        "lat": 31.174591
      },
      {
        "name": "上海游泳馆",
        "lng": 121.436818,
        "lat": 31.181017
      },
      {
        "name": "徐家汇",
        "lng": 121.431986,
        "lat": 31.197392
      },
      {
        "name": "交通大学",
        "lng": 121.430633,
        "lat": 31.204086
      },
      {
        "name": "江苏路",
        "lng": 121.426013,
        "lat": 31.222269
      }
    ],
    "ghost": [
      "康恒路"
    ],
    "planned": false
  },
  {
    "id": "sh-2013-x84",
    "year": 2013,
    "date": "2013-10-16",
    "title": "11号线通至花桥",
    "detail": "10月16日 · 安亭 — 花桥",
    "line": "11号线",
    "color": "#f1c6a6",
    "stations": [
      {
        "name": "安亭",
        "lng": 121.157436,
        "lat": 31.290376
      },
      {
        "name": "兆丰路",
        "lng": 121.145744,
        "lat": 31.290913
      },
      {
        "name": "光明路",
        "lng": 121.112569,
        "lat": 31.298029
      },
      {
        "name": "花桥",
        "lng": 121.099784,
        "lat": 31.300601
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2013-x85",
    "year": 2013,
    "date": "2013-12-29",
    "title": "12号线东段开通",
    "detail": "12月29日 · 天潼路 — 金海路",
    "line": "12号线",
    "color": "#007B5F",
    "stations": [
      {
        "name": "天潼路",
        "lng": 121.477826,
        "lat": 31.245775
      },
      {
        "name": "国际客运中心",
        "lng": 121.493718,
        "lat": 31.252164
      },
      {
        "name": "提篮桥",
        "lng": 121.502392,
        "lat": 31.255547
      },
      {
        "name": "大连路",
        "lng": 121.508701,
        "lat": 31.259984
      },
      {
        "name": "江浦公园",
        "lng": 121.519347,
        "lat": 31.266643
      },
      {
        "name": "宁国路",
        "lng": 121.52803,
        "lat": 31.270669
      },
      {
        "name": "隆昌路",
        "lng": 121.540406,
        "lat": 31.277334
      },
      {
        "name": "爱国路",
        "lng": 121.548389,
        "lat": 31.281924
      },
      {
        "name": "复兴岛",
        "lng": 121.557068,
        "lat": 31.28293
      },
      {
        "name": "东陆路",
        "lng": 121.574906,
        "lat": 31.284705
      },
      {
        "name": "巨峰路",
        "lng": 121.584155,
        "lat": 31.282863
      },
      {
        "name": "杨高北路",
        "lng": 121.598755,
        "lat": 31.282272
      },
      {
        "name": "金京路",
        "lng": 121.611268,
        "lat": 31.281997
      },
      {
        "name": "申江路",
        "lng": 121.622644,
        "lat": 31.282394
      },
      {
        "name": "金海路",
        "lng": 121.634396,
        "lat": 31.265296
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2013-x86",
    "year": 2013,
    "date": "2013-12-29",
    "title": "16号线开通",
    "detail": "12月29日 · 罗山路 — 滴水湖",
    "line": "16号线",
    "color": "#2CD5C4",
    "stations": [
      {
        "name": "罗山路",
        "lng": 121.588956,
        "lat": 31.155499
      },
      {
        "name": "周浦东",
        "lng": 121.602703,
        "lat": 31.1123
      },
      {
        "name": "鹤沙航城",
        "lng": 121.607049,
        "lat": 31.080075
      },
      {
        "name": "航头东",
        "lng": 121.613302,
        "lat": 31.057206
      },
      {
        "name": "新场",
        "lng": 121.644748,
        "lat": 31.047812
      },
      {
        "name": "野生动物园",
        "lng": 121.694893,
        "lat": 31.052481
      },
      {
        "name": "惠南",
        "lng": 121.757322,
        "lat": 31.055939
      },
      {
        "name": "惠南东",
        "lng": 121.789495,
        "lat": 31.028606
      },
      {
        "name": "书院",
        "lng": 121.846358,
        "lat": 30.961562
      },
      {
        "name": "临港大道",
        "lng": 121.90677,
        "lat": 30.925885
      },
      {
        "name": "滴水湖",
        "lng": 121.925493,
        "lat": 30.909605
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2014-x87",
    "year": 2014,
    "date": "2014-01-31",
    "title": "3号线北段停运",
    "detail": "1月31日 · 沉降整治 · 水产路以北 江杨北路 — 水产路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.48,
      "lat": 31.4,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l3-n2"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2014-x88",
    "year": 2014,
    "date": "2014-02-07",
    "title": "3号线北段恢复",
    "detail": "2月7日 · 江杨北路 — 水产路恢复运营",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "江杨北路",
        "lng": 121.43519,
        "lat": 31.409659
      },
      {
        "name": "铁力路",
        "lng": 121.456562,
        "lat": 31.409964
      },
      {
        "name": "友谊路",
        "lng": 121.471393,
        "lat": 31.4059
      },
      {
        "name": "宝杨路",
        "lng": 121.475056,
        "lat": 31.397211
      },
      {
        "name": "水产路",
        "lng": 121.483761,
        "lat": 31.383228
      }
    ],
    "planned": false,
    "segId": "sh-l3-n2"
  },
  {
    "id": "sh-2014-x89",
    "year": 2014,
    "date": "2014-05-10",
    "title": "12号线西延开通",
    "detail": "5月10日 · 天潼路 — 曲阜路",
    "line": "12号线",
    "color": "#007B5F",
    "stations": [
      {
        "name": "曲阜路",
        "lng": 121.467012,
        "lat": 31.244238
      },
      {
        "name": "天潼路",
        "lng": 121.477826,
        "lat": 31.245775
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2014-x90",
    "year": 2014,
    "date": "2014-07-22",
    "title": "祁华路站开通",
    "detail": "7月22日 · 7号线",
    "stations": [
      {
        "name": "祁华路",
        "lng": 121.368889,
        "lat": 31.324202
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "祁华路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2014-x91",
    "year": 2014,
    "date": "2014-09-18",
    "title": "卢浦大桥站更名",
    "detail": "9月18日 · 13号线世博专线段卢浦大桥改称世博会博物馆",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "卢浦大桥",
      "to": "世博会博物馆",
      "lng": 121.477098,
      "lat": 31.199552,
      "color": "#EB81B9",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2014-x92",
    "year": 2014,
    "date": "2014-11-01",
    "title": "大渡河路站开通",
    "detail": "11月1日 · 13号线",
    "stations": [
      {
        "name": "大渡河路",
        "lng": 121.389781,
        "lat": 31.233588
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "大渡河路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2014-x93",
    "year": 2014,
    "date": "2014-12-28",
    "title": "13号线东延开通",
    "detail": "12月28日 · 金沙江路 — 长寿路",
    "line": "13号线",
    "color": "#EF95CF",
    "stations": [
      {
        "name": "金沙江路",
        "lng": 121.408553,
        "lat": 31.233984
      },
      {
        "name": "隆德路",
        "lng": 121.418937,
        "lat": 31.232354
      },
      {
        "name": "武宁路",
        "lng": 121.425874,
        "lat": 31.236197
      },
      {
        "name": "长寿路",
        "lng": 121.433654,
        "lat": 31.242719
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2014-x94",
    "year": 2014,
    "date": "2014-12-28",
    "title": "16号线通至龙阳路",
    "detail": "12月28日 · 罗山路 — 龙阳路",
    "line": "16号线",
    "color": "#2CD5C4",
    "stations": [
      {
        "name": "龙阳路",
        "lng": 121.553386,
        "lat": 31.205755
      },
      {
        "name": "华夏中路",
        "lng": 121.578904,
        "lat": 31.177983
      },
      {
        "name": "罗山路",
        "lng": 121.588956,
        "lat": 31.155499
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2015-x95",
    "year": 2015,
    "date": "2015-02-16",
    "title": "3号线北段停运",
    "detail": "2月16日 · 基地扩容 · 水产路以北 江杨北路 — 水产路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.48,
      "lat": 31.4,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l3-n2"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2015-x96",
    "year": 2015,
    "date": "2015-03-01",
    "title": "3号线北段恢复",
    "detail": "3月1日 · 江杨北路 — 水产路恢复运营",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "江杨北路",
        "lng": 121.43519,
        "lat": 31.409659
      },
      {
        "name": "铁力路",
        "lng": 121.456562,
        "lat": 31.409964
      },
      {
        "name": "友谊路",
        "lng": 121.471393,
        "lat": 31.4059
      },
      {
        "name": "宝杨路",
        "lng": 121.475056,
        "lat": 31.397211
      },
      {
        "name": "水产路",
        "lng": 121.483761,
        "lat": 31.383228
      }
    ],
    "planned": false,
    "segId": "sh-l3-n2"
  },
  {
    "id": "sh-2015-x97",
    "year": 2015,
    "date": "2015-12-19",
    "title": "12号线西段开通",
    "detail": "12月19日 · 曲阜路 — 七莘路",
    "line": "12号线",
    "color": "#007B5F",
    "stations": [
      {
        "name": "七莘路",
        "lng": 121.357855,
        "lat": 31.13355
      },
      {
        "name": "虹莘路",
        "lng": 121.375717,
        "lat": 31.139344
      },
      {
        "name": "顾戴路",
        "lng": 121.387209,
        "lat": 31.14277
      },
      {
        "name": "东兰路",
        "lng": 121.387277,
        "lat": 31.1577
      },
      {
        "name": "虹梅路（12号线）",
        "lng": 121.392605,
        "lat": 31.16222
      },
      {
        "name": "虹漕路",
        "lng": 121.405909,
        "lat": 31.165902
      },
      {
        "name": "桂林公园",
        "lng": 121.415009,
        "lat": 31.168858
      },
      {
        "name": "漕宝路",
        "lng": 121.428523,
        "lat": 31.170231
      },
      {
        "name": "龙漕路",
        "lng": 121.439784,
        "lat": 31.171362
      },
      {
        "name": "龙华",
        "lng": 121.448379,
        "lat": 31.174591
      },
      {
        "name": "龙华中路",
        "lng": 121.452495,
        "lat": 31.186302
      },
      {
        "name": "大木桥路",
        "lng": 121.458726,
        "lat": 31.19599
      },
      {
        "name": "嘉善路",
        "lng": 121.456143,
        "lat": 31.204742
      },
      {
        "name": "陕西南路",
        "lng": 121.454174,
        "lat": 31.217059
      },
      {
        "name": "南京西路",
        "lng": 121.455406,
        "lat": 31.23176
      },
      {
        "name": "汉中路",
        "lng": 121.454129,
        "lat": 31.243782
      },
      {
        "name": "曲阜路",
        "lng": 121.467012,
        "lat": 31.244238
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2015-x98",
    "year": 2015,
    "date": "2015-12-19",
    "title": "13号线通至世博大道",
    "detail": "12月19日 · 长寿路 — 世博大道",
    "line": "13号线",
    "color": "#EF95CF",
    "stations": [
      {
        "name": "长寿路",
        "lng": 121.433654,
        "lat": 31.242719
      },
      {
        "name": "江宁路",
        "lng": 121.440225,
        "lat": 31.246151
      },
      {
        "name": "汉中路",
        "lng": 121.454129,
        "lat": 31.243782
      },
      {
        "name": "自然博物馆",
        "lng": 121.457807,
        "lat": 31.238361
      },
      {
        "name": "南京西路",
        "lng": 121.455406,
        "lat": 31.23176
      },
      {
        "name": "淮海中路",
        "lng": 121.459812,
        "lat": 31.221979
      },
      {
        "name": "新天地",
        "lng": 121.470665,
        "lat": 31.21832
      },
      {
        "name": "马当路",
        "lng": 121.472746,
        "lat": 31.211482
      },
      {
        "name": "世博会博物馆",
        "lng": 121.477098,
        "lat": 31.199552
      },
      {
        "name": "世博大道",
        "lng": 121.47983,
        "lat": 31.184784
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2015-x99",
    "year": 2015,
    "date": "2015-12-19",
    "title": "11号线通至康新公路",
    "detail": "12月19日 · 罗山路 — 康新公路",
    "line": "11号线",
    "color": "#f1c6a6",
    "stations": [
      {
        "name": "康新公路",
        "lng": 121.613001,
        "lat": 31.132684
      },
      {
        "name": "秀沿路",
        "lng": 121.594196,
        "lat": 31.140377
      },
      {
        "name": "罗山路",
        "lng": 121.588956,
        "lat": 31.155499
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2016-x100",
    "year": 2016,
    "date": "2016-01-30",
    "title": "漕河泾开发区封站",
    "detail": "1月30日 · 9号线封站改造",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.393123,
      "lat": 31.172509,
      "zoom": 15
    },
    "retireStations": [
      "漕河泾开发区"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2016-x101",
    "year": 2016,
    "date": "2016-02-22",
    "title": "漕河泾开发区恢复",
    "detail": "2月22日 · 9号线改造完成启用",
    "stations": [
      {
        "name": "漕河泾开发区",
        "lng": 121.393123,
        "lat": 31.172509
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "addStations": [
      {
        "name": "漕河泾开发区",
        "after": "桂林路",
        "lng": 121.393123,
        "lat": 31.172509
      }
    ],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2016-x102",
    "year": 2016,
    "date": "2016-04-26",
    "title": "11号线三期开通",
    "detail": "4月26日 · 康新公路 — 迪士尼",
    "line": "11号线",
    "color": "#f1c6a6",
    "stations": [
      {
        "name": "迪士尼",
        "lng": 121.663684,
        "lat": 31.143426
      },
      {
        "name": "康新公路",
        "lng": 121.613001,
        "lat": 31.132684
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2017-x103",
    "year": 2017,
    "date": "2017-01-17",
    "title": "人民广场停运改造",
    "detail": "1月17日 · 补短板 · 1号线、8号线人民广场封站",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.470589,
      "lat": 31.234632,
      "zoom": 15
    },
    "retireStations": [
      "人民广场"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2017-x104",
    "year": 2017,
    "date": "2017-01-21",
    "title": "张江高科停运改造",
    "detail": "1月21日 · 补短板 · 2号线张江高科封站",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.583286,
      "lat": 31.204086,
      "zoom": 15
    },
    "retireStations": [
      "张江高科"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2017-x105",
    "year": 2017,
    "date": "2017-01-25",
    "title": "沈杜公路停运改造",
    "detail": "1月25日 · 补短板 · 8号线沈杜公路封站",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.507899,
      "lat": 31.063571,
      "zoom": 15
    },
    "retireStations": [
      "沈杜公路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2017-x106",
    "year": 2017,
    "date": "2017-02-09",
    "title": "沈杜公路恢复",
    "detail": "2月9日 · 8号线",
    "stations": [
      {
        "name": "沈杜公路",
        "lng": 121.507899,
        "lat": 31.063571
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "addStations": [
      {
        "name": "沈杜公路",
        "lng": 121.507899,
        "lat": 31.063571
      }
    ],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2017-x107",
    "year": 2017,
    "date": "2017-02-11",
    "title": "两站恢复运营",
    "detail": "2月11日 · 人民广场、张江高科恢复",
    "stations": [
      {
        "name": "人民广场",
        "lng": 121.470589,
        "lat": 31.234632
      },
      {
        "name": "人民广场",
        "lng": 121.470589,
        "lat": 31.234632
      },
      {
        "name": "张江高科",
        "lng": 121.583286,
        "lat": 31.204086
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "addStations": [
      {
        "name": "人民广场",
        "after": "黄陂南路",
        "lng": 121.470589,
        "lat": 31.234632
      },
      {
        "name": "人民广场",
        "after": "大世界",
        "lng": 121.470589,
        "lat": 31.234632
      },
      {
        "name": "张江高科",
        "after": "金科路",
        "lng": 121.583286,
        "lat": 31.204086
      }
    ],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2017-x108",
    "year": 2017,
    "date": "2017-12-30",
    "title": "9号线三期开通",
    "detail": "12月30日 · 杨高中路 — 曹路",
    "line": "9号线",
    "color": "#71C5E8",
    "stations": [
      {
        "name": "曹路",
        "lng": 121.678838,
        "lat": 31.273368
      },
      {
        "name": "民雷路",
        "lng": 121.663839,
        "lat": 31.270436
      },
      {
        "name": "顾唐路",
        "lng": 121.652202,
        "lat": 31.268198
      },
      {
        "name": "金海路",
        "lng": 121.634396,
        "lat": 31.265296
      },
      {
        "name": "金吉路",
        "lng": 121.624521,
        "lat": 31.266472
      },
      {
        "name": "金桥",
        "lng": 121.60713,
        "lat": 31.263035
      },
      {
        "name": "台儿庄路",
        "lng": 121.593255,
        "lat": 31.255017
      },
      {
        "name": "蓝天路",
        "lng": 121.573779,
        "lat": 31.243217
      },
      {
        "name": "芳甸路",
        "lng": 121.554182,
        "lat": 31.234013
      },
      {
        "name": "杨高中路",
        "lng": 121.544392,
        "lat": 31.229661
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2017-x109",
    "year": 2017,
    "date": "2017-12-30",
    "title": "17号线开通",
    "detail": "12月30日 · 虹桥火车站 — 东方绿舟",
    "line": "17号线",
    "color": "#C09C83",
    "stations": [
      {
        "name": "虹桥火车站",
        "lng": 121.314431,
        "lat": 31.195984
      },
      {
        "name": "国家会展中心(17号线)",
        "lng": 121.288574,
        "lat": 31.193685
      },
      {
        "name": "蟠龙路",
        "lng": 121.274202,
        "lat": 31.188356
      },
      {
        "name": "徐盈路",
        "lng": 121.249554,
        "lat": 31.180149
      },
      {
        "name": "徐泾北城",
        "lng": 121.237246,
        "lat": 31.177566
      },
      {
        "name": "嘉松中路",
        "lng": 121.219485,
        "lat": 31.166142
      },
      {
        "name": "赵巷",
        "lng": 121.187801,
        "lat": 31.163248
      },
      {
        "name": "汇金路",
        "lng": 121.147107,
        "lat": 31.163147
      },
      {
        "name": "青浦新城",
        "lng": 121.121073,
        "lat": 31.160815
      },
      {
        "name": "漕盈路",
        "lng": 121.092279,
        "lat": 31.162341
      },
      {
        "name": "淀山湖大道",
        "lng": 121.077535,
        "lat": 31.136354
      },
      {
        "name": "朱家角",
        "lng": 121.044454,
        "lat": 31.102554
      },
      {
        "name": "东方绿舟",
        "lng": 121.015091,
        "lat": 31.10058
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2018-x110",
    "year": 2018,
    "date": "2018-03-31",
    "title": "浦江线开通",
    "detail": "3月31日 · 沈杜公路 — 汇臻路",
    "line": "浦江线",
    "color": "#999999",
    "stations": [
      {
        "name": "沈杜公路",
        "lng": 121.507899,
        "lat": 31.063571
      },
      {
        "name": "三鲁公路",
        "lng": 121.523068,
        "lat": 31.058298
      },
      {
        "name": "闵瑞路",
        "lng": 121.526013,
        "lat": 31.050159
      },
      {
        "name": "浦航路",
        "lng": 121.526282,
        "lat": 31.0432
      },
      {
        "name": "东城一路",
        "lng": 121.52779,
        "lat": 31.032608
      },
      {
        "name": "汇臻路",
        "lng": 121.520231,
        "lat": 31.027445
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2018-x111",
    "year": 2018,
    "date": "2018-12-26",
    "title": "松江有轨一期开通",
    "detail": "12月26日 · 仓华路 — 中辰路",
    "line": "松江有轨T2",
    "color": "#F5A623",
    "stations": [
      {
        "name": "仓华路",
        "lng": 121.205,
        "lat": 31.025
      },
      {
        "name": "三新北路",
        "lng": 121.21,
        "lat": 31.028
      },
      {
        "name": "泰晤士小镇北",
        "lng": 121.218,
        "lat": 31.048
      },
      {
        "name": "松江大学城",
        "lng": 121.228162,
        "lat": 31.056094
      },
      {
        "name": "中辰路",
        "lng": 121.252,
        "lat": 31.074
      }
    ],
    "planned": false,
    "segId": "sh-sj-t2a"
  },
  {
    "id": "sh-2018-x112",
    "year": 2018,
    "date": "2018-12-30",
    "title": "5号线南延伸开通",
    "detail": "12月30日 · 东川路 — 奉贤新城",
    "line": "5号线",
    "color": "#E93CAC",
    "stations": [
      {
        "name": "东川路",
        "lng": 121.415276,
        "lat": 31.020153
      },
      {
        "name": "江川路",
        "lng": 121.418854,
        "lat": 31.007394
      },
      {
        "name": "西渡",
        "lng": 121.427835,
        "lat": 30.991336
      },
      {
        "name": "萧塘",
        "lng": 121.43727,
        "lat": 30.967903
      },
      {
        "name": "奉浦大道",
        "lng": 121.444415,
        "lat": 30.944097
      },
      {
        "name": "环城东路",
        "lng": 121.458674,
        "lat": 30.933248
      },
      {
        "name": "望园路",
        "lng": 121.479116,
        "lat": 30.934075
      },
      {
        "name": "金海湖",
        "lng": 121.488073,
        "lat": 30.930968
      },
      {
        "name": "奉贤新城",
        "lng": 121.491872,
        "lat": 30.916099
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2018-x113",
    "year": 2018,
    "date": "2018-12-30",
    "title": "13号线二、三期开通",
    "detail": "12月30日 · 世博大道 — 张江路",
    "line": "13号线",
    "color": "#EF95CF",
    "stations": [
      {
        "name": "世博大道",
        "lng": 121.47983,
        "lat": 31.184784
      },
      {
        "name": "长清路",
        "lng": 121.483305,
        "lat": 31.176462
      },
      {
        "name": "成山路",
        "lng": 121.49178,
        "lat": 31.172772
      },
      {
        "name": "东明路",
        "lng": 121.506481,
        "lat": 31.174725
      },
      {
        "name": "华鹏路",
        "lng": 121.522234,
        "lat": 31.178398
      },
      {
        "name": "下南路",
        "lng": 121.535898,
        "lat": 31.181451
      },
      {
        "name": "北蔡",
        "lng": 121.547758,
        "lat": 31.182312
      },
      {
        "name": "陈春路",
        "lng": 121.553949,
        "lat": 31.17729
      },
      {
        "name": "莲溪路",
        "lng": 121.562186,
        "lat": 31.171321
      },
      {
        "name": "华夏中路",
        "lng": 121.578904,
        "lat": 31.177983
      },
      {
        "name": "中科路",
        "lng": 121.598268,
        "lat": 31.181089
      },
      {
        "name": "学林路",
        "lng": 121.610162,
        "lat": 31.185695
      },
      {
        "name": "张江路",
        "lng": 121.624968,
        "lat": 31.191332
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2019-x114",
    "year": 2019,
    "date": "2019-08-10",
    "title": "松江有轨T1开通",
    "detail": "8月10日 · 仓华路 — 新庙三路",
    "line": "松江有轨T1",
    "color": "#E31C23",
    "stations": [
      {
        "name": "仓华路",
        "lng": 121.205,
        "lat": 31.025
      },
      {
        "name": "松江体育中心",
        "lng": 121.226133,
        "lat": 31.018137
      },
      {
        "name": "松东路",
        "lng": 121.248,
        "lat": 31.03
      },
      {
        "name": "新庙三路",
        "lng": 121.285,
        "lat": 31.052
      }
    ],
    "planned": false,
    "segId": "sh-sj-t1a"
  },
  {
    "id": "sh-2019-x115",
    "year": 2019,
    "date": "2019-08-10",
    "title": "松江有轨T2环线开通",
    "detail": "8月10日 · 中辰路 — 松江体育中心",
    "line": "松江有轨T2",
    "color": "#F5A623",
    "stations": [
      {
        "name": "中辰路",
        "lng": 121.252,
        "lat": 31.074
      },
      {
        "name": "锦昔路",
        "lng": 121.268,
        "lat": 31.055
      },
      {
        "name": "松江体育中心",
        "lng": 121.226133,
        "lat": 31.018137
      }
    ],
    "planned": false,
    "segId": "sh-sj-t2b"
  },
  {
    "id": "sh-2019-x116",
    "year": 2019,
    "date": "2019-12-30",
    "title": "松江有轨T1东延",
    "detail": "12月30日 · 新庙三路 — 新桥火车站",
    "line": "松江有轨T1",
    "color": "#E31C23",
    "stations": [
      {
        "name": "新庙三路",
        "lng": 121.285,
        "lat": 31.052
      },
      {
        "name": "新桥火车站",
        "lng": 121.319056,
        "lat": 31.061417
      }
    ],
    "planned": false,
    "segId": "sh-sj-t1b"
  },
  {
    "id": "sh-2020-x117",
    "year": 2020,
    "date": "2020-01-23",
    "title": "2号线西段停运",
    "detail": "1月23日 · 隧道整体施工 · 淞虹路 — 徐泾东停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.33,
      "lat": 31.2,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l2-w"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2020-x118",
    "year": 2020,
    "date": "2020-02-02",
    "title": "2号线西段恢复",
    "detail": "2月2日 · 淞虹路 — 徐泾东恢复运营",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "淞虹路",
        "lng": 121.354928,
        "lat": 31.220102
      },
      {
        "name": "虹桥2号航站楼",
        "lng": 121.319911,
        "lat": 31.196007
      },
      {
        "name": "虹桥火车站",
        "lng": 121.314431,
        "lat": 31.195984
      },
      {
        "name": "徐泾东",
        "lng": 121.294727,
        "lat": 31.190367
      }
    ],
    "planned": false,
    "segId": "sh-l2-w"
  },
  {
    "id": "sh-2020-x119",
    "year": 2020,
    "date": "2020-08-25",
    "title": "陈翔公路站开通",
    "detail": "8月25日 · 11号线",
    "stations": [
      {
        "name": "陈翔公路",
        "lng": 121.302285,
        "lat": 31.308418
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "陈翔公路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2020-x120",
    "year": 2020,
    "date": "2020-09-12",
    "title": "3号线更换枕木",
    "detail": "9月12日 — 19日 · 上海南站 — 中山公园停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.43,
      "lat": 31.2,
      "zoom": 12
    },
    "retireSegIds": [
      "sh-l3-a",
      "sh-l3-b",
      "sh-l3-c1"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2020-x121",
    "year": 2020,
    "date": "2020-09-21",
    "title": "3号线南段恢复",
    "detail": "9月14日 — 21日 · 上海南站 — 中山公园恢复运营",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "石龙路",
        "lng": 121.438604,
        "lat": 31.159857
      },
      {
        "name": "上海南站",
        "lng": 121.425417,
        "lat": 31.156469
      }
    ],
    "planned": false,
    "segId": "sh-l3-a"
  },
  {
    "id": "sh-2020-x122",
    "year": 2020,
    "date": "2020-09-21",
    "title": "3号线石龙路 — 宜山路恢复",
    "detail": "9月21日 · 石龙路 — 宜山路",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      },
      {
        "name": "漕溪路",
        "lng": 121.433798,
        "lat": 31.178636
      },
      {
        "name": "龙漕路",
        "lng": 121.439784,
        "lat": 31.171362
      },
      {
        "name": "石龙路",
        "lng": 121.438604,
        "lat": 31.159857
      }
    ],
    "planned": false,
    "segId": "sh-l3-b"
  },
  {
    "id": "sh-2020-x123",
    "year": 2020,
    "date": "2020-09-21",
    "title": "3号线宜山路 — 中山公园恢复",
    "detail": "9月21日 · 宜山路 — 中山公园",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "中山公园",
        "lng": 121.411128,
        "lat": 31.219793
      },
      {
        "name": "延安西路",
        "lng": 121.412418,
        "lat": 31.211466
      },
      {
        "name": "虹桥路",
        "lng": 121.416175,
        "lat": 31.199382
      },
      {
        "name": "宜山路",
        "lng": 121.422563,
        "lat": 31.188587
      }
    ],
    "planned": false,
    "segId": "sh-l3-c1"
  },
  {
    "id": "sh-2020-x124",
    "year": 2020,
    "date": "2020-12-26",
    "title": "10号线二期开通",
    "detail": "12月26日 · 新江湾城 — 基隆路",
    "line": "10号线",
    "color": "#C1A7E2",
    "stations": [
      {
        "name": "基隆路",
        "lng": 121.586197,
        "lat": 31.353464
      },
      {
        "name": "港城路",
        "lng": 121.570788,
        "lat": 31.355365
      },
      {
        "name": "高桥",
        "lng": 121.558722,
        "lat": 31.354749
      },
      {
        "name": "高桥西",
        "lng": 121.544999,
        "lat": 31.353591
      },
      {
        "name": "双江路",
        "lng": 121.535117,
        "lat": 31.355681
      },
      {
        "name": "国帆路",
        "lng": 121.508775,
        "lat": 31.341562
      },
      {
        "name": "新江湾城",
        "lng": 121.502537,
        "lat": 31.330495
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2020-x125",
    "year": 2020,
    "date": "2020-12-26",
    "title": "18号线南段开通",
    "detail": "12月26日 · 御桥 — 航头",
    "line": "18号线",
    "color": "#d6a461",
    "stations": [
      {
        "name": "御桥",
        "lng": 121.566695,
        "lat": 31.160353
      },
      {
        "name": "康桥",
        "lng": 121.563083,
        "lat": 31.136469
      },
      {
        "name": "周浦",
        "lng": 121.563392,
        "lat": 31.116371
      },
      {
        "name": "繁荣路",
        "lng": 121.566332,
        "lat": 31.104806
      },
      {
        "name": "沈梅路",
        "lng": 121.576388,
        "lat": 31.093383
      },
      {
        "name": "鹤涛路",
        "lng": 121.581766,
        "lat": 31.074142
      },
      {
        "name": "下沙",
        "lng": 121.584797,
        "lat": 31.05669
      },
      {
        "name": "航头",
        "lng": 121.591897,
        "lat": 31.03961
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2021-x126",
    "year": 2021,
    "date": "2021-01-23",
    "title": "15号线开通",
    "detail": "1月23日 · 顾村公园 — 紫竹高新区",
    "line": "15号线",
    "color": "#BBA786",
    "stations": [
      {
        "name": "顾村公园",
        "lng": 121.368368,
        "lat": 31.346401
      },
      {
        "name": "锦秋路",
        "lng": 121.377116,
        "lat": 31.321991
      },
      {
        "name": "丰翔路",
        "lng": 121.376225,
        "lat": 31.31003
      },
      {
        "name": "南大路",
        "lng": 121.3757,
        "lat": 31.301079
      },
      {
        "name": "祁安路",
        "lng": 121.380164,
        "lat": 31.293373
      },
      {
        "name": "古浪路",
        "lng": 121.387563,
        "lat": 31.286323
      },
      {
        "name": "武威东路",
        "lng": 121.387441,
        "lat": 31.277465
      },
      {
        "name": "上海西站",
        "lng": 121.396272,
        "lat": 31.264514
      },
      {
        "name": "铜川路",
        "lng": 121.392383,
        "lat": 31.25256
      },
      {
        "name": "梅岭北路",
        "lng": 121.392345,
        "lat": 31.245131
      },
      {
        "name": "大渡河路",
        "lng": 121.389781,
        "lat": 31.233588
      },
      {
        "name": "长风公园",
        "lng": 121.39167,
        "lat": 31.227092
      },
      {
        "name": "娄山关路",
        "lng": 121.399408,
        "lat": 31.213002
      },
      {
        "name": "红宝石路",
        "lng": 121.393724,
        "lat": 31.200714
      },
      {
        "name": "姚虹路",
        "lng": 121.401757,
        "lat": 31.193404
      },
      {
        "name": "吴中路",
        "lng": 121.409261,
        "lat": 31.186205
      },
      {
        "name": "桂林路",
        "lng": 121.413424,
        "lat": 31.176659
      },
      {
        "name": "桂林公园",
        "lng": 121.415009,
        "lat": 31.168858
      },
      {
        "name": "上海南站",
        "lng": 121.425417,
        "lat": 31.156469
      },
      {
        "name": "华东理工大学",
        "lng": 121.424365,
        "lat": 31.146151
      },
      {
        "name": "罗秀路",
        "lng": 121.431193,
        "lat": 31.133462
      },
      {
        "name": "朱梅路",
        "lng": 121.433196,
        "lat": 31.126281
      },
      {
        "name": "景洪路",
        "lng": 121.439716,
        "lat": 31.111753
      },
      {
        "name": "虹梅南路",
        "lng": 121.428444,
        "lat": 31.10576
      },
      {
        "name": "景西路",
        "lng": 121.414127,
        "lat": 31.101635
      },
      {
        "name": "曙建路",
        "lng": 121.413264,
        "lat": 31.092538
      },
      {
        "name": "双柏路",
        "lng": 121.417122,
        "lat": 31.085134
      },
      {
        "name": "元江路",
        "lng": 121.427288,
        "lat": 31.064758
      },
      {
        "name": "永德路",
        "lng": 121.438613,
        "lat": 31.041121
      },
      {
        "name": "紫竹高新区",
        "lng": 121.446651,
        "lat": 31.025189
      }
    ],
    "ghost": [
      "桂林路"
    ],
    "planned": false
  },
  {
    "id": "sh-2021-x127",
    "year": 2021,
    "date": "2021-02-12",
    "title": "7号线区间停运",
    "detail": "2月12日 · 隧道修整 · 云台路 — 高科西路停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.18,
      "zoom": 14
    },
    "retireSegIds": [
      "sh-l7-gap"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2021-x128",
    "year": 2021,
    "date": "2021-02-18",
    "title": "7号线区间恢复",
    "detail": "2月18日 · 云台路 — 高科西路恢复运营",
    "line": "7号线",
    "color": "#FF6900",
    "stations": [
      {
        "name": "高科西路",
        "lng": 121.505453,
        "lat": 31.187831
      },
      {
        "name": "云台路",
        "lng": 121.496013,
        "lat": 31.184255
      }
    ],
    "planned": false,
    "segId": "sh-l7-gap"
  },
  {
    "id": "sh-2021-x129",
    "year": 2021,
    "date": "2021-06-20",
    "title": "两站更名",
    "detail": "6月20日 · 新天地改一大会址·新天地 · 黄陂南路改一大会址·黄陂南路",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": [
      {
        "from": "新天地",
        "to": "一大会址·新天地",
        "lng": 121.470665,
        "lat": 31.21832,
        "color": "#C6AFD4",
        "open": true
      },
      {
        "from": "黄陂南路",
        "to": "一大会址·黄陂南路",
        "lng": 121.468379,
        "lat": 31.225841,
        "color": "#E3002A",
        "open": true
      }
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2021-x130",
    "year": 2021,
    "date": "2021-06-27",
    "title": "15号线桂林路开通",
    "detail": "6月27日 · 15号线",
    "stations": [
      {
        "name": "桂林路",
        "lng": 121.413424,
        "lat": 31.176659
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "桂林路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2021-x131",
    "year": 2021,
    "date": "2021-06-30",
    "title": "临港捷运1号线开通",
    "detail": "6月30日 · 滴水湖 — 鸿音广场",
    "line": "临港捷运1号线",
    "color": "#2BB3B1",
    "stations": [
      {
        "name": "滴水湖",
        "lng": 121.925493,
        "lat": 30.909605
      },
      {
        "name": "环湖西三路",
        "lng": 121.918,
        "lat": 30.905
      },
      {
        "name": "水华路",
        "lng": 121.905,
        "lat": 30.898
      },
      {
        "name": "港辉路",
        "lng": 121.89,
        "lat": 30.93
      },
      {
        "name": "鸿音广场",
        "lng": 121.868,
        "lat": 30.968
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2021-x132",
    "year": 2021,
    "date": "2021-12-30",
    "title": "14号线开通",
    "detail": "12月30日 · 封浜 — 桂桥路",
    "line": "14号线",
    "color": "#827a04",
    "stations": [
      {
        "name": "封浜",
        "lng": 121.292527,
        "lat": 31.269454
      },
      {
        "name": "乐秀路",
        "lng": 121.309589,
        "lat": 31.267301
      },
      {
        "name": "临洮路",
        "lng": 121.326308,
        "lat": 31.264966
      },
      {
        "name": "嘉怡路",
        "lng": 121.341112,
        "lat": 31.261076
      },
      {
        "name": "定边路",
        "lng": 121.357779,
        "lat": 31.258247
      },
      {
        "name": "真新新村",
        "lng": 121.367317,
        "lat": 31.257409
      },
      {
        "name": "真光路",
        "lng": 121.379517,
        "lat": 31.25511
      },
      {
        "name": "铜川路",
        "lng": 121.392383,
        "lat": 31.25256
      },
      {
        "name": "真如",
        "lng": 121.402566,
        "lat": 31.252593
      },
      {
        "name": "中宁路",
        "lng": 121.409892,
        "lat": 31.246891
      },
      {
        "name": "曹杨路",
        "lng": 121.413055,
        "lat": 31.241138
      },
      {
        "name": "武宁路",
        "lng": 121.425874,
        "lat": 31.236197
      },
      {
        "name": "武定路",
        "lng": 121.431537,
        "lat": 31.229165
      },
      {
        "name": "静安寺",
        "lng": 121.441934,
        "lat": 31.225113
      },
      {
        "name": "一大会址·黄陂南路",
        "lng": 121.468379,
        "lat": 31.225841
      },
      {
        "name": "大世界",
        "lng": 121.474677,
        "lat": 31.229351
      },
      {
        "name": "豫园",
        "lng": 121.48295,
        "lat": 31.229987
      },
      {
        "name": "陆家嘴",
        "lng": 121.497705,
        "lat": 31.240281
      },
      {
        "name": "浦东南路",
        "lng": 121.508025,
        "lat": 31.240584
      },
      {
        "name": "浦东大道",
        "lng": 121.514939,
        "lat": 31.242379
      },
      {
        "name": "源深路",
        "lng": 121.526692,
        "lat": 31.243421
      },
      {
        "name": "昌邑路",
        "lng": 121.535807,
        "lat": 31.246065
      },
      {
        "name": "歇浦路",
        "lng": 121.547239,
        "lat": 31.252874
      },
      {
        "name": "云山路",
        "lng": 121.566926,
        "lat": 31.253147
      },
      {
        "name": "蓝天路",
        "lng": 121.573779,
        "lat": 31.243217
      },
      {
        "name": "黄杨路",
        "lng": 121.58681,
        "lat": 31.236198
      },
      {
        "name": "云顺路",
        "lng": 121.596135,
        "lat": 31.239263
      },
      {
        "name": "浦东足球场",
        "lng": 121.611224,
        "lat": 31.243836
      },
      {
        "name": "金粤路",
        "lng": 121.624797,
        "lat": 31.244269
      },
      {
        "name": "桂桥路",
        "lng": 121.63086,
        "lat": 31.251585
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2021-x133",
    "year": 2021,
    "date": "2021-12-30",
    "title": "18号线北段开通",
    "detail": "12月30日 · 御桥 — 长江南路",
    "line": "18号线",
    "color": "#d6a461",
    "stations": [
      {
        "name": "御桥",
        "lng": 121.566695,
        "lat": 31.160353
      },
      {
        "name": "莲溪路",
        "lng": 121.562186,
        "lat": 31.171321
      },
      {
        "name": "北中路",
        "lng": 121.557116,
        "lat": 31.184958
      },
      {
        "name": "芳芯路",
        "lng": 121.554982,
        "lat": 31.193347
      },
      {
        "name": "龙阳路",
        "lng": 121.553386,
        "lat": 31.205755
      },
      {
        "name": "迎春路",
        "lng": 121.546733,
        "lat": 31.223161
      },
      {
        "name": "杨高中路",
        "lng": 121.544392,
        "lat": 31.229661
      },
      {
        "name": "民生路",
        "lng": 121.539241,
        "lat": 31.237987
      },
      {
        "name": "昌邑路",
        "lng": 121.535807,
        "lat": 31.246065
      },
      {
        "name": "丹阳路",
        "lng": 121.526835,
        "lat": 31.255913
      },
      {
        "name": "平凉路",
        "lng": 121.522361,
        "lat": 31.261122
      },
      {
        "name": "江浦公园",
        "lng": 121.519347,
        "lat": 31.266643
      },
      {
        "name": "江浦路",
        "lng": 121.51401,
        "lat": 31.277
      },
      {
        "name": "抚顺路",
        "lng": 121.511414,
        "lat": 31.285707
      },
      {
        "name": "国权路",
        "lng": 121.505624,
        "lat": 31.291299
      },
      {
        "name": "复旦大学",
        "lng": 121.49509,
        "lat": 31.298338
      },
      {
        "name": "上海财经大学",
        "lng": 121.491881,
        "lat": 31.309647
      },
      {
        "name": "殷高路",
        "lng": 121.491105,
        "lat": 31.323672
      },
      {
        "name": "长江南路",
        "lng": 121.487011,
        "lat": 31.334013
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2022-x134",
    "year": 2022,
    "date": "2022-02-01",
    "title": "5号线北段停运",
    "detail": "2月1日 · 集中整治 · 莘庄 — 颛桥停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.39,
      "lat": 31.1,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l5-n"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x135",
    "year": 2022,
    "date": "2022-02-07",
    "title": "5号线北段恢复",
    "detail": "2月7日 · 莘庄 — 颛桥恢复运营",
    "line": "5号线",
    "color": "#E93CAC",
    "stations": [
      {
        "name": "莘庄",
        "lng": 121.380739,
        "lat": 31.113054
      },
      {
        "name": "春申路",
        "lng": 121.381185,
        "lat": 31.100159
      },
      {
        "name": "银都路",
        "lng": 121.385628,
        "lat": 31.091256
      },
      {
        "name": "颛桥",
        "lng": 121.397231,
        "lat": 31.068934
      }
    ],
    "planned": false,
    "segId": "sh-l5-n"
  },
  {
    "id": "sh-2022-x136",
    "year": 2022,
    "date": "2022-03-28",
    "title": "浦东分区封控",
    "detail": "3月28日 · 以黄浦江为界分区封控 · 浦东、浦南等区域地铁站封站 · 公交等大范围调整",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.55,
      "lat": 31.18,
      "zoom": 10
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x137",
    "year": 2022,
    "date": "2022-04-01",
    "title": "浦西封控筛查",
    "detail": "4月1日 · 浦西开始封控筛查 · 浦西地铁、公交等公共交通大范围停运",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.43,
      "lat": 31.23,
      "zoom": 10
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x138",
    "year": 2022,
    "date": "2022-04-02",
    "title": "轨交大部停运",
    "detail": "4月2日 — 5月10日 · 上海地铁大部分区域停运 · 部分线路曾有限恢复",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.22,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x139",
    "year": 2022,
    "date": "2022-05-10",
    "title": "6、16号线亦暂停",
    "detail": "5月10日 13 时起 · 6号线、16号线也全线暂停运营",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.58,
      "lat": 31.16,
      "zoom": 10
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x140",
    "year": 2022,
    "date": "2022-05-22",
    "title": "四线恢复运营",
    "detail": "5月22日 · 3、6、10、16号线恢复 · 运营时间 7:00—20:00 · 其他线路仍暂停",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.22,
      "zoom": 10
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x141",
    "year": 2022,
    "date": "2022-06-01",
    "title": "全网基本恢复",
    "detail": "6月1日 · 上海地铁全网络恢复基本运行 · 除部分车站外其他线路恢复运营",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.22,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x142",
    "year": 2022,
    "date": "2022-07-04",
    "title": "全网车站恢复",
    "detail": "7月4日 · 此前关闭的车站恢复 · 上海地铁全网其他车站恢复正常运营服务",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.22,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2022-x143",
    "year": 2022,
    "date": "2022-10-28",
    "title": "临港捷运2号线开通",
    "detail": "10月28日 · 滴水湖 — 水华路",
    "line": "临港捷运2号线",
    "color": "#5B8DEF",
    "stations": [
      {
        "name": "滴水湖",
        "lng": 121.925493,
        "lat": 30.909605
      },
      {
        "name": "环湖西三路",
        "lng": 121.918,
        "lat": 30.905
      },
      {
        "name": "水华路",
        "lng": 121.905,
        "lat": 30.898
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2023-x144",
    "year": 2023,
    "date": "2023-01-21",
    "title": "3号线北段停运",
    "detail": "1月21日 · 江杨北路 — 长江南路临时停运施工",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.48,
      "lat": 31.38,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l3-n2",
      "sh-l3-n3"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2023-x145",
    "year": 2023,
    "date": "2023-01-22",
    "title": "2号线西段停运",
    "detail": "1月22日 · 淞虹路 — 徐泾东临时施工停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.33,
      "lat": 31.2,
      "zoom": 13
    },
    "retireSegIds": [
      "sh-l2-w"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2023-x146",
    "year": 2023,
    "date": "2023-01-27",
    "title": "2号线西段恢复",
    "detail": "1月27日 · 淞虹路 — 徐泾东恢复运营",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "淞虹路",
        "lng": 121.354928,
        "lat": 31.220102
      },
      {
        "name": "虹桥2号航站楼",
        "lng": 121.319911,
        "lat": 31.196007
      },
      {
        "name": "虹桥火车站",
        "lng": 121.314431,
        "lat": 31.195984
      },
      {
        "name": "徐泾东",
        "lng": 121.294727,
        "lat": 31.190367
      }
    ],
    "planned": false,
    "segId": "sh-l2-w"
  },
  {
    "id": "sh-2023-x147",
    "year": 2023,
    "date": "2023-01-28",
    "title": "3号线北段恢复",
    "detail": "1月28日 · 长江南路 — 水产路恢复运营",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "水产路",
        "lng": 121.483761,
        "lat": 31.383228
      },
      {
        "name": "淞滨路",
        "lng": 121.488349,
        "lat": 31.37287
      },
      {
        "name": "张华浜",
        "lng": 121.494224,
        "lat": 31.35998
      },
      {
        "name": "淞发路",
        "lng": 121.49595,
        "lat": 31.347109
      },
      {
        "name": "长江南路",
        "lng": 121.487011,
        "lat": 31.334013
      }
    ],
    "planned": false,
    "segId": "sh-l3-n3"
  },
  {
    "id": "sh-2023-x148",
    "year": 2023,
    "date": "2023-01-28",
    "title": "3号线通至江杨北路恢复",
    "detail": "1月28日 · 水产路 — 江杨北路恢复运营",
    "line": "3号线",
    "color": "#F57B00",
    "stations": [
      {
        "name": "江杨北路",
        "lng": 121.43519,
        "lat": 31.409659
      },
      {
        "name": "铁力路",
        "lng": 121.456562,
        "lat": 31.409964
      },
      {
        "name": "友谊路",
        "lng": 121.471393,
        "lat": 31.4059
      },
      {
        "name": "宝杨路",
        "lng": 121.475056,
        "lat": 31.397211
      },
      {
        "name": "水产路",
        "lng": 121.483761,
        "lat": 31.383228
      }
    ],
    "planned": false,
    "segId": "sh-l3-n2"
  },
  {
    "id": "sh-2023-x149",
    "year": 2023,
    "date": "2023-05-28",
    "title": "上海地铁 30 周年",
    "detail": "自 1993 年 5 月 28 日徐家汇 — 锦江乐园开通 · 三十周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.5,
      "lat": 31.22,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2023-x150",
    "year": 2023,
    "date": "2023-06-01",
    "title": "张江有轨电车停运",
    "detail": "6月1日 · 张江有轨电车1路退出运营",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.61,
      "lat": 31.204,
      "zoom": 14
    },
    "retireSegIds": [
      "sh-tram-zj"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2023-x151",
    "year": 2023,
    "date": "2023-06-24",
    "title": "沪苏11号线跨城衔接",
    "detail": "6月24日 · 上海11号线与苏州11号线在花桥衔接",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.1,
      "lat": 31.3,
      "zoom": 13
    },
    "highlightFromLine": "11号线",
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2024-x152",
    "year": 2024,
    "date": "2024-04-30",
    "title": "松江有轨退出运营",
    "detail": "4月30日 · 松江有轨电车 T1、T2 退出运营",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.23,
      "lat": 31.04,
      "zoom": 12
    },
    "retireSegIds": [
      "sh-sj-t1a",
      "sh-sj-t1b",
      "sh-sj-t2a",
      "sh-sj-t2b"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2024-x153",
    "year": 2024,
    "date": "2024-09-28",
    "title": "康恒路站开通",
    "detail": "9月28日 · 11号线",
    "stations": [
      {
        "name": "康恒路",
        "lng": 121.549446,
        "lat": 31.156426
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "康恒路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2024-x154",
    "year": 2024,
    "date": "2024-11-30",
    "title": "西岑站开通",
    "detail": "11月30日 · 17号线东方绿舟 — 西岑",
    "line": "17号线",
    "color": "#C09C83",
    "stations": [
      {
        "name": "东方绿舟",
        "lng": 121.015091,
        "lat": 31.10058
      },
      {
        "name": "西岑",
        "lng": 120.959917,
        "lat": 31.072738
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2024-x155",
    "year": 2024,
    "date": "2024-12-27",
    "title": "市域机场线开通",
    "detail": "12月27日 · 虹桥2号航站楼 — 浦东1号2号航站楼",
    "line": "市域机场线",
    "color": "#99ADAC",
    "stations": [
      {
        "name": "虹桥2号航站楼",
        "lng": 121.319911,
        "lat": 31.196007
      },
      {
        "name": "中春路",
        "lng": 121.330045,
        "lat": 31.151721
      },
      {
        "name": "景洪路",
        "lng": 121.439716,
        "lat": 31.111753
      },
      {
        "name": "三林南",
        "lng": 121.482385,
        "lat": 31.128071
      },
      {
        "name": "康桥东",
        "lng": 121.610696,
        "lat": 31.149046
      },
      {
        "name": "上海国际旅游度假区",
        "lng": 121.675431,
        "lat": 31.158314
      },
      {
        "name": "浦东1号2号航站楼",
        "lng": 121.801301,
        "lat": 31.153065
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2025-x156",
    "year": 2025,
    "date": "2025-11-01",
    "title": "蟠祥路站开通",
    "detail": "11月1日 · 2号线徐泾东 — 蟠祥路",
    "line": "2号线",
    "color": "#E60000",
    "stations": [
      {
        "name": "徐泾东",
        "lng": 121.294727,
        "lat": 31.190367
      },
      {
        "name": "蟠祥路",
        "lng": 121.28169,
        "lat": 31.18341
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2025-x157",
    "year": 2025,
    "date": "2025-12-27",
    "title": "18号线二期开通",
    "detail": "12月27日 · 长江南路 — 康文路",
    "line": "18号线",
    "color": "#d6a461",
    "stations": [
      {
        "name": "康文路",
        "lng": 121.414675,
        "lat": 31.337118
      },
      {
        "name": "呼兰路",
        "lng": 121.433084,
        "lat": 31.341521
      },
      {
        "name": "爱辉路",
        "lng": 121.444728,
        "lat": 31.34599
      },
      {
        "name": "长江西路",
        "lng": 121.470735,
        "lat": 31.347671
      },
      {
        "name": "通南路",
        "lng": 121.475124,
        "lat": 31.339592
      },
      {
        "name": "长江南路",
        "lng": 121.487011,
        "lat": 31.334013
      }
    ],
    "planned": false
  },
  {
    "id": "sh-2026-x158",
    "year": 2026,
    "date": "2026-04-21",
    "title": "22号线轨道贯通",
    "detail": "4月21日 · 崇明线全线轨道贯通 · 尚未开通",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.7,
      "lat": 31.45,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2026-x159",
    "year": 2026,
    "date": "2026-06-25",
    "title": "22号线北段上线测试",
    "detail": "6月25日 · 崇明线北段列车上线测试完成 · 尚未开通",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.7,
      "lat": 31.5,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "sh-2028-osm161",
    "year": 2028,
    "title": "22号线在建开通",
    "detail": "在建 · 22号线起点 — 22号线终点 · 公开日期未定时按 2028 示意",
    "line": "22号线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "22号线起点",
        "lng": 121.858021,
        "lat": 31.5265028
      },
      {
        "name": "22号线终点",
        "lng": 121.858335,
        "lat": 31.5264821
      }
    ],
    "planned": true
  },
  {
    "id": "sh-2028-osm162",
    "year": 2028,
    "title": "21号线在建开通",
    "detail": "在建 · 21号线起点 — 21号线终点 · 公开日期未定时按 2028 示意",
    "line": "21号线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "21号线起点",
        "lng": 121.585316,
        "lat": 31.2938604
      },
      {
        "name": "21号线终点",
        "lng": 121.585319,
        "lat": 31.2937168
      }
    ],
    "planned": true
  },
  {
    "id": "sh-2028-osm163",
    "year": 2028,
    "title": "19号线在建开通",
    "detail": "在建 · 19号线起点 — 19号线终点 · 公开日期未定时按 2028 示意",
    "line": "19号线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "19号线起点",
        "lng": 121.4419455,
        "lat": 31.4049482
      },
      {
        "name": "19号线终点",
        "lng": 121.4402282,
        "lat": 31.0842277
      }
    ],
    "planned": true
  },
  {
    "id": "sh-2028-osm164",
    "year": 2028,
    "title": "20号线在建开通",
    "detail": "在建 · 20号线起点 — 20号线终点 · 公开日期未定时按 2028 示意",
    "line": "20号线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "20号线起点",
        "lng": 121.4463297,
        "lat": 31.2805287
      },
      {
        "name": "20号线终点",
        "lng": 121.4463297,
        "lat": 31.2805287
      }
    ],
    "planned": true
  },
  {
    "id": "sh-2028-osm165",
    "year": 2028,
    "title": "23号线在建开通",
    "detail": "在建 · 23号线起点 — 23号线终点 · 公开日期未定时按 2028 示意",
    "line": "23号线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "23号线起点",
        "lng": 121.3571352,
        "lat": 31.0003508
      },
      {
        "name": "23号线终点",
        "lng": 121.3570855,
        "lat": 31.0004454
      }
    ],
    "planned": true
  },
  {
    "id": "sh-2030-x160",
    "year": 2030,
    "title": "13号线西延伸（规划）",
    "detail": "十五五建成 · 金运路以西",
    "line": "13号线",
    "color": "#EF95CF",
    "stations": [
      {
        "name": "金运路",
        "lng": 121.314784,
        "lat": 31.242925
      },
      {
        "name": "国家会展中心",
        "lng": 121.296487,
        "lat": 31.191228
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const SHANGHAI_SCENES = buildCityScenes({
  prefix: 'sh',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '上海地铁线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":121.47,"lat":31.23},
});

export const SHANGHAI_META = {
  id: 'shanghai',
  label: '上海地铁',
  blurb: '1993–2026 · 手校完成（不含规划）',
};
