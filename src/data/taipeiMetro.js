/**
 * 台北捷运 · 简办发展史 + 高德站位（taipei）
 */
import AMAP from './taipeiStationsOsm.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "tp-1996-x0",
    "year": 1996,
    "date": "1996-03-28",
    "title": "木栅线开通",
    "detail": "3月28日 · 中山國中 — 動物園",
    "line": "木栅线",
    "color": "#c48c31",
    "stations": [
      {
        "name": "中山國中",
        "lng": 121.544202,
        "lat": 25.060687
      },
      {
        "name": "南京東路",
        "lng": 121.543965,
        "lat": 25.051836
      },
      {
        "name": "忠孝復興",
        "lng": 121.543748,
        "lat": 25.041572
      },
      {
        "name": "大安",
        "lng": 121.543555,
        "lat": 25.033329
      },
      {
        "name": "科技大樓",
        "lng": 121.54346,
        "lat": 25.026101
      },
      {
        "name": "六張犁",
        "lng": 121.553121,
        "lat": 25.023818
      },
      {
        "name": "麟光",
        "lng": 121.558905,
        "lat": 25.018439
      },
      {
        "name": "辛亥",
        "lng": 121.55706,
        "lat": 25.005481
      },
      {
        "name": "萬芳醫院",
        "lng": 121.558138,
        "lat": 24.999431
      },
      {
        "name": "萬芳社區",
        "lng": 121.568123,
        "lat": 24.998609
      },
      {
        "name": "木柵",
        "lng": 121.573183,
        "lat": 24.998246
      },
      {
        "name": "動物園",
        "lng": 121.579448,
        "lat": 24.998317
      }
    ],
    "planned": false,
    "segId": "tp-muzha"
  },
  {
    "id": "tp-1997-x1",
    "year": 1997,
    "date": "1997-03-28",
    "title": "淡水线开通",
    "detail": "3月28日 · 中山 — 淡水",
    "line": "淡水线",
    "color": "#e3002c",
    "stations": [
      {
        "name": "淡水",
        "lng": 121.445526,
        "lat": 25.167713
      },
      {
        "name": "紅樹林",
        "lng": 121.458832,
        "lat": 25.154409
      },
      {
        "name": "竹圍",
        "lng": 121.45951,
        "lat": 25.136973
      },
      {
        "name": "關渡",
        "lng": 121.467142,
        "lat": 25.125701
      },
      {
        "name": "忠義",
        "lng": 121.473374,
        "lat": 25.130951
      },
      {
        "name": "復興崗",
        "lng": 121.485498,
        "lat": 25.13749
      },
      {
        "name": "北投",
        "lng": 121.498593,
        "lat": 25.131931
      },
      {
        "name": "奇岩",
        "lng": 121.501137,
        "lat": 25.125603
      },
      {
        "name": "唭哩岸",
        "lng": 121.50613,
        "lat": 25.120905
      },
      {
        "name": "石牌",
        "lng": 121.515523,
        "lat": 25.114607
      },
      {
        "name": "明德",
        "lng": 121.518769,
        "lat": 25.109859
      },
      {
        "name": "芝山",
        "lng": 121.52252,
        "lat": 25.103003
      },
      {
        "name": "士林",
        "lng": 121.526247,
        "lat": 25.093495
      },
      {
        "name": "劍潭",
        "lng": 121.524981,
        "lat": 25.084291
      },
      {
        "name": "圓山",
        "lng": 121.520069,
        "lat": 25.071426
      },
      {
        "name": "民權西路",
        "lng": 121.519403,
        "lat": 25.062851
      },
      {
        "name": "雙連",
        "lng": 121.520699,
        "lat": 25.057632
      },
      {
        "name": "中山",
        "lng": 121.520391,
        "lat": 25.052626
      }
    ],
    "planned": false,
    "segId": "tp-tamsui-a"
  },
  {
    "id": "tp-1997-x2",
    "year": 1997,
    "date": "1997-03-28",
    "title": "新北投支线开通",
    "detail": "3月28日 · 北投 — 新北投",
    "line": "新北投支线",
    "color": "#e3002c",
    "stations": [
      {
        "name": "北投",
        "lng": 121.498593,
        "lat": 25.131931
      },
      {
        "name": "新北投",
        "lng": 121.503169,
        "lat": 25.136964
      }
    ],
    "planned": false,
    "segId": "tp-xinbeitou"
  },
  {
    "id": "tp-1997-x3",
    "year": 1997,
    "date": "1997-12-25",
    "title": "淡水线延伸台北车站",
    "detail": "12月25日 · 中山 — 台北車站",
    "line": "淡水线",
    "color": "#e3002c",
    "stations": [
      {
        "name": "中山",
        "lng": 121.520391,
        "lat": 25.052626
      },
      {
        "name": "台北車",
        "lng": 121.517475,
        "lat": 25.046243
      }
    ],
    "planned": false,
    "segId": "tp-tamsui-b"
  },
  {
    "id": "tp-1997-x4",
    "year": 1997,
    "date": "1997-12-26",
    "title": "台北车站 — 忠孝复兴公交接驳",
    "detail": "12月26日 · 台北車站 — 忠孝復興采用公交接驳",
    "line": "公交接驳",
    "color": "#C45C26",
    "stations": [
      {
        "name": "台北車",
        "lng": 121.517475,
        "lat": 25.046243
      },
      {
        "name": "善導寺",
        "lng": 121.523423,
        "lat": 25.044762
      },
      {
        "name": "忠孝新生",
        "lng": 121.532838,
        "lat": 25.04229
      },
      {
        "name": "忠孝復興",
        "lng": 121.543748,
        "lat": 25.041572
      }
    ],
    "planned": false,
    "style": "shuttle",
    "segId": "tp-bus-1997"
  },
  {
    "id": "tp-1998-x5",
    "year": 1998,
    "date": "1998-05-05",
    "title": "公交接驳停运",
    "detail": "5月5日 · 经费原因 · 台北車站 — 忠孝復興公交接驳停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.53,
      "lat": 25.044,
      "zoom": 14
    },
    "retireSegIds": [
      "tp-bus-1997"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-1998-x6",
    "year": 1998,
    "date": "1998-11-01",
    "title": "新北投支线改三节车厢",
    "detail": "11月1日 · 因噪音问题改用三节车厢运行",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.503,
      "lat": 25.137,
      "zoom": 15
    },
    "highlightFromLine": "新北投支线",
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-1998-x7",
    "year": 1998,
    "date": "1998-12-24",
    "title": "淡水线通至中正纪念堂",
    "detail": "12月24日 · 台北車站 — 中正紀念堂",
    "line": "淡水线",
    "color": "#e3002c",
    "stations": [
      {
        "name": "台北車",
        "lng": 121.517475,
        "lat": 25.046243
      },
      {
        "name": "台大醫院",
        "lng": 121.516181,
        "lat": 25.041646
      },
      {
        "name": "中正紀念堂",
        "lng": 121.517545,
        "lat": 25.033696
      }
    ],
    "planned": false,
    "segId": "tp-tamsui-c"
  },
  {
    "id": "tp-1998-x8",
    "year": 1998,
    "date": "1998-12-24",
    "title": "新店线中正纪念堂 — 古亭",
    "detail": "12月24日 · 与淡水线、中和线贯通运营至南勢角",
    "line": "新店线",
    "color": "#008659",
    "stations": [
      {
        "name": "古亭",
        "lng": 121.522722,
        "lat": 25.026715
      },
      {
        "name": "中正紀念堂",
        "lng": 121.517545,
        "lat": 25.033696
      }
    ],
    "planned": false,
    "segId": "tp-xindian-a"
  },
  {
    "id": "tp-1998-x9",
    "year": 1998,
    "date": "1998-12-24",
    "title": "中和线开通",
    "detail": "12月24日 · 古亭 — 南勢角 · 贯通运营淡水 — 南勢角",
    "line": "中和线",
    "color": "#f5a01f",
    "stations": [
      {
        "name": "南勢角",
        "lng": 121.508852,
        "lat": 24.990026
      },
      {
        "name": "景安",
        "lng": 121.505708,
        "lat": 24.993416
      },
      {
        "name": "永安市場",
        "lng": 121.5109,
        "lat": 25.00241
      },
      {
        "name": "頂溪",
        "lng": 121.515472,
        "lat": 25.013601
      },
      {
        "name": "古亭",
        "lng": 121.522722,
        "lat": 25.026715
      }
    ],
    "planned": false,
    "segId": "tp-zhonghe"
  },
  {
    "id": "tp-1999-x10",
    "year": 1999,
    "date": "1999-11-11",
    "title": "新店线通至新店",
    "detail": "11月11日 · 古亭 — 新店 · 取消淡水 — 南勢角贯通 · 改开淡水 — 新店、北投 — 南勢角",
    "line": "新店线",
    "color": "#008659",
    "stations": [
      {
        "name": "新店",
        "lng": 121.537631,
        "lat": 24.958067
      },
      {
        "name": "新店區公所",
        "lng": 121.541351,
        "lat": 24.967386
      },
      {
        "name": "七張",
        "lng": 121.54292,
        "lat": 24.975022
      },
      {
        "name": "大坪林",
        "lng": 121.541643,
        "lat": 24.982923
      },
      {
        "name": "景美",
        "lng": 121.540706,
        "lat": 24.992712
      },
      {
        "name": "萬隆",
        "lng": 121.539023,
        "lat": 25.001903
      },
      {
        "name": "公館",
        "lng": 121.534393,
        "lat": 25.014775
      },
      {
        "name": "台電大樓",
        "lng": 121.528208,
        "lat": 25.020669
      },
      {
        "name": "古亭",
        "lng": 121.522722,
        "lat": 25.026715
      }
    ],
    "planned": false,
    "segId": "tp-xindian-b"
  },
  {
    "id": "tp-1999-x11",
    "year": 1999,
    "date": "1999-12-24",
    "title": "南港线开通",
    "detail": "12月24日 · 市政府 — 龍山寺",
    "line": "南港线",
    "color": "#0070bd",
    "stations": [
      {
        "name": "龍山寺",
        "lng": 121.499581,
        "lat": 25.035284
      },
      {
        "name": "西門",
        "lng": 121.508608,
        "lat": 25.042713
      },
      {
        "name": "台北車",
        "lng": 121.517475,
        "lat": 25.046243
      },
      {
        "name": "善導寺",
        "lng": 121.523423,
        "lat": 25.044762
      },
      {
        "name": "忠孝新生",
        "lng": 121.532838,
        "lat": 25.04229
      },
      {
        "name": "忠孝復興",
        "lng": 121.543748,
        "lat": 25.041572
      },
      {
        "name": "忠孝敦化",
        "lng": 121.549479,
        "lat": 25.041509
      },
      {
        "name": "國父紀念館",
        "lng": 121.557392,
        "lat": 25.041342
      },
      {
        "name": "市政府",
        "lng": 121.5661,
        "lat": 25.041128
      }
    ],
    "planned": false,
    "segId": "tp-nangang"
  },
  {
    "id": "tp-2000-x12",
    "year": 2000,
    "date": "2000-08-31",
    "title": "南港线更名板南线 · 西延新埔",
    "detail": "8月31日 · 龍山寺 — 新埔",
    "line": "板南线",
    "color": "#0070bd",
    "stations": [
      {
        "name": "新埔",
        "lng": 121.468306,
        "lat": 25.02346
      },
      {
        "name": "江子翠",
        "lng": 121.472778,
        "lat": 25.030424
      },
      {
        "name": "龍山寺",
        "lng": 121.499581,
        "lat": 25.035284
      }
    ],
    "planned": false,
    "segId": "tp-bannan-w",
    "recolor": {
      "fromLine": "南港线",
      "lineName": "板南线",
      "color": "#0070bd"
    }
  },
  {
    "id": "tp-2000-x13",
    "year": 2000,
    "date": "2000-08-31",
    "title": "小南门线开通",
    "detail": "8月31日 · 西門 — 中正紀念堂",
    "line": "小南门线",
    "color": "#008659",
    "stations": [
      {
        "name": "中正紀念堂",
        "lng": 121.517545,
        "lat": 25.033696
      },
      {
        "name": "小南門",
        "lng": 121.510806,
        "lat": 25.035901
      },
      {
        "name": "西門",
        "lng": 121.508608,
        "lat": 25.042713
      }
    ],
    "planned": false,
    "segId": "tp-xiaonanmen"
  },
  {
    "id": "tp-2000-x14",
    "year": 2000,
    "date": "2000-12-30",
    "title": "板南线东延昆阳",
    "detail": "12月30日 · 市政府 — 昆陽",
    "line": "板南线",
    "color": "#0070bd",
    "stations": [
      {
        "name": "市政府",
        "lng": 121.5661,
        "lat": 25.041128
      },
      {
        "name": "永春",
        "lng": 121.575705,
        "lat": 25.040876
      },
      {
        "name": "後山埤",
        "lng": 121.582322,
        "lat": 25.044741
      },
      {
        "name": "昆陽",
        "lng": 121.593316,
        "lat": 25.05049
      }
    ],
    "planned": false,
    "segId": "tp-bannan-e"
  },
  {
    "id": "tp-2004-x15",
    "year": 2004,
    "date": "2004-09-29",
    "title": "小碧潭支线开通",
    "detail": "9月29日 · 七張 — 小碧潭",
    "line": "小碧潭支线",
    "color": "#008659",
    "stations": [
      {
        "name": "小碧潭",
        "lng": 121.530598,
        "lat": 24.971759
      },
      {
        "name": "七張",
        "lng": 121.54292,
        "lat": 24.975022
      }
    ],
    "planned": false,
    "segId": "tp-xiaobitan"
  },
  {
    "id": "tp-2006-x16",
    "year": 2006,
    "date": "2006-05-31",
    "title": "板南线西延永宁",
    "detail": "5月31日 · 新埔 — 永寧",
    "line": "板南线",
    "color": "#0070bd",
    "stations": [
      {
        "name": "永寧",
        "lng": 121.43627,
        "lat": 24.966872
      },
      {
        "name": "土城",
        "lng": 121.444391,
        "lat": 24.973182
      },
      {
        "name": "海山",
        "lng": 121.448786,
        "lat": 24.985318
      },
      {
        "name": "亞東醫院",
        "lng": 121.452363,
        "lat": 24.997522
      },
      {
        "name": "府中",
        "lng": 121.45928,
        "lat": 25.00877
      },
      {
        "name": "板橋",
        "lng": 121.463064,
        "lat": 25.014457
      },
      {
        "name": "新埔",
        "lng": 121.468306,
        "lat": 25.02346
      }
    ],
    "planned": false,
    "segId": "tp-bannan-tucheng"
  },
  {
    "id": "tp-2007-x17",
    "year": 2007,
    "date": "2007-07-04",
    "title": "猫空缆车开通",
    "detail": "7月4日 · 動物園 — 貓空",
    "line": "猫空缆车",
    "color": "#b85c38",
    "stations": [
      {
        "name": "動物園",
        "lng": 121.579448,
        "lat": 24.998317
      },
      {
        "name": "動物園內",
        "lng": 121.5829,
        "lat": 24.9936
      },
      {
        "name": "指南宮",
        "lng": 121.5878,
        "lat": 24.9798
      },
      {
        "name": "貓空",
        "lng": 121.5909,
        "lat": 24.9682
      }
    ],
    "planned": false,
    "segId": "tp-maokong"
  },
  {
    "id": "tp-2008-x18",
    "year": 2008,
    "date": "2008-10-01",
    "title": "猫空缆车停运",
    "detail": "10月1日 · 受台风影响停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.585,
      "lat": 24.983,
      "zoom": 14
    },
    "retireSegIds": [
      "tp-maokong"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2008-x19",
    "year": 2008,
    "date": "2008-12-10",
    "title": "小碧潭支线停运",
    "detail": "12月10日 · 配合新店车辆段联合开发",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.53,
      "lat": 24.975,
      "zoom": 15
    },
    "retireSegIds": [
      "tp-xiaobitan"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2008-x20",
    "year": 2008,
    "date": "2008-12-25",
    "title": "板南线延伸南港",
    "detail": "12月25日 · 昆陽 — 南港",
    "line": "板南线",
    "color": "#0070bd",
    "stations": [
      {
        "name": "昆陽",
        "lng": 121.593316,
        "lat": 25.05049
      },
      {
        "name": "南港",
        "lng": 121.607192,
        "lat": 25.05209
      }
    ],
    "planned": false,
    "segId": "tp-bannan-nangang"
  },
  {
    "id": "tp-2009-x21",
    "year": 2009,
    "date": "2009-06-10",
    "title": "小碧潭支线恢复",
    "detail": "6月10日 · 七張 — 小碧潭恢复运营",
    "line": "小碧潭支线",
    "color": "#008659",
    "stations": [
      {
        "name": "小碧潭",
        "lng": 121.530598,
        "lat": 24.971759
      },
      {
        "name": "七張",
        "lng": 121.54292,
        "lat": 24.975022
      }
    ],
    "planned": false,
    "segId": "tp-xiaobitan"
  },
  {
    "id": "tp-2009-x22",
    "year": 2009,
    "date": "2009-07-04",
    "title": "内湖线开通 · 改名栅湖线",
    "detail": "7月4日 · 木栅线改称栅湖线 · 中山國中 — 南港展覽館",
    "line": "栅湖线",
    "color": "#c48c31",
    "stations": [
      {
        "name": "南港展覽館",
        "lng": 121.6168,
        "lat": 25.0554
      },
      {
        "name": "南港軟體園區",
        "lng": 121.615897,
        "lat": 25.059946
      },
      {
        "name": "東湖",
        "lng": 121.61161,
        "lat": 25.06742
      },
      {
        "name": "葫洲",
        "lng": 121.607363,
        "lat": 25.072639
      },
      {
        "name": "大湖公園",
        "lng": 121.602341,
        "lat": 25.083761
      },
      {
        "name": "內湖",
        "lng": 121.594189,
        "lat": 25.083497
      },
      {
        "name": "文德",
        "lng": 121.584942,
        "lat": 25.078556
      },
      {
        "name": "港墘",
        "lng": 121.575203,
        "lat": 25.080073
      },
      {
        "name": "西湖",
        "lng": 121.567316,
        "lat": 25.082192
      },
      {
        "name": "劍南路",
        "lng": 121.555653,
        "lat": 25.084849
      },
      {
        "name": "大直",
        "lng": 121.54744,
        "lat": 25.079865
      },
      {
        "name": "松山機場",
        "lng": 121.551614,
        "lat": 25.063086
      },
      {
        "name": "中山國中",
        "lng": 121.544202,
        "lat": 25.060687
      }
    ],
    "planned": false,
    "segId": "tp-neihu",
    "recolor": {
      "fromLine": "木栅线",
      "lineName": "栅湖线",
      "color": "#c48c31"
    }
  },
  {
    "id": "tp-2009-x23",
    "year": 2009,
    "date": "2009-07-04",
    "title": "南港展览馆公交接驳",
    "detail": "7月4日 · 免费公交接驳至南港站",
    "line": "公交接驳",
    "color": "#C45C26",
    "stations": [
      {
        "name": "南港",
        "lng": 121.607192,
        "lat": 25.05209
      },
      {
        "name": "南港展覽館",
        "lng": 121.6168,
        "lat": 25.0554
      }
    ],
    "planned": false,
    "style": "shuttle",
    "segId": "tp-bus-2009"
  },
  {
    "id": "tp-2009-x24",
    "year": 2009,
    "date": "2009-10-08",
    "title": "栅湖线更名文湖线",
    "detail": "10月8日 · 栅湖谐音似炸湖 · 改称文湖线",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "recolor": {
      "fromLine": "栅湖线",
      "lineName": "文湖线",
      "color": "#c48c31"
    },
    "highlightFromLine": "栅湖线",
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2010-x25",
    "year": 2010,
    "date": "2010-03-30",
    "title": "猫空缆车恢复",
    "detail": "3月30日 · 動物園 — 貓空恢复运营",
    "line": "猫空缆车",
    "color": "#b85c38",
    "stations": [
      {
        "name": "動物園",
        "lng": 121.579448,
        "lat": 24.998317
      },
      {
        "name": "動物園內",
        "lng": 121.5829,
        "lat": 24.9936
      },
      {
        "name": "指南宮",
        "lng": 121.5878,
        "lat": 24.9798
      },
      {
        "name": "貓空",
        "lng": 121.5909,
        "lat": 24.9682
      }
    ],
    "planned": false,
    "segId": "tp-maokong"
  },
  {
    "id": "tp-2010-x26",
    "year": 2010,
    "date": "2010-11-03",
    "title": "芦洲线开通",
    "detail": "11月3日 · 忠孝新生 — 大橋頭",
    "line": "芦洲线",
    "color": "#f5a01f",
    "stations": [
      {
        "name": "忠孝新生",
        "lng": 121.532838,
        "lat": 25.04229
      },
      {
        "name": "松江南京",
        "lng": 121.533036,
        "lat": 25.052014
      },
      {
        "name": "行天宮",
        "lng": 121.533162,
        "lat": 25.059413
      },
      {
        "name": "中山國小",
        "lng": 121.526598,
        "lat": 25.062674
      },
      {
        "name": "民權西路",
        "lng": 121.519403,
        "lat": 25.062851
      },
      {
        "name": "大橋頭",
        "lng": 121.512694,
        "lat": 25.063198
      }
    ],
    "planned": false,
    "segId": "tp-luzhou-a"
  },
  {
    "id": "tp-2010-x27",
    "year": 2010,
    "date": "2010-11-03",
    "title": "芦洲线通至芦洲",
    "detail": "11月3日 · 大橋頭 — 蘆洲",
    "line": "芦洲线",
    "color": "#f5a01f",
    "stations": [
      {
        "name": "蘆洲",
        "lng": 121.465104,
        "lat": 25.091278
      },
      {
        "name": "三民高中",
        "lng": 121.473299,
        "lat": 25.085505
      },
      {
        "name": "徐匯中學",
        "lng": 121.480227,
        "lat": 25.080336
      },
      {
        "name": "三和國中",
        "lng": 121.486378,
        "lat": 25.076814
      },
      {
        "name": "三重國小",
        "lng": 121.4973,
        "lat": 25.070003
      },
      {
        "name": "大橋頭",
        "lng": 121.512694,
        "lat": 25.063198
      }
    ],
    "planned": false,
    "segId": "tp-luzhou-b"
  },
  {
    "id": "tp-2011-x28",
    "year": 2011,
    "date": "2011-02-27",
    "title": "板南线延伸南港展览馆",
    "detail": "2月27日 · 南港 — 南港展覽館 · 免费公交接驳取消",
    "line": "板南线",
    "color": "#0070bd",
    "stations": [
      {
        "name": "南港",
        "lng": 121.607192,
        "lat": 25.05209
      },
      {
        "name": "南港展覽館",
        "lng": 121.6168,
        "lat": 25.0554
      }
    ],
    "planned": false,
    "segId": "tp-bannan-nex",
    "retireSegIds": [
      "tp-bus-2009"
    ]
  },
  {
    "id": "tp-2011-x29",
    "year": 2011,
    "date": "2011-06-01",
    "title": "淡水站英文名恢复 Tamsui",
    "detail": "6月1日 · 淡水线淡水站英文名恢复为 Tamsui",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.445,
      "lat": 25.168,
      "zoom": 15
    },
    "highlightFromLine": "淡水线",
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2012-x30",
    "year": 2012,
    "date": "2012-01-05",
    "title": "芦洲线改名新芦线 · 通至辅大",
    "detail": "1月5日 · 大橋頭 — 輔大",
    "line": "新芦线",
    "color": "#f5a01f",
    "stations": [
      {
        "name": "大橋頭",
        "lng": 121.512694,
        "lat": 25.063198
      },
      {
        "name": "台北橋",
        "lng": 121.500551,
        "lat": 25.063178
      },
      {
        "name": "菜寮",
        "lng": 121.492105,
        "lat": 25.060268
      },
      {
        "name": "三重",
        "lng": 121.482905,
        "lat": 25.054699
      },
      {
        "name": "先嗇宮",
        "lng": 121.471681,
        "lat": 25.046428
      },
      {
        "name": "頭前庄",
        "lng": 121.460336,
        "lat": 25.039901
      },
      {
        "name": "新莊",
        "lng": 121.453359,
        "lat": 25.036333
      },
      {
        "name": "輔大",
        "lng": 121.435275,
        "lat": 25.032722
      }
    ],
    "planned": false,
    "segId": "tp-xinzhuang-fujen",
    "recolor": {
      "fromLine": "芦洲线",
      "lineName": "新芦线",
      "color": "#f5a01f"
    }
  },
  {
    "id": "tp-2012-x31",
    "year": 2012,
    "date": "2012-09-30",
    "title": "中和线与新芦线合并",
    "detail": "9月30日 · 忠孝新生 — 古亭 · 改称中和新芦线 · 取消北投 — 南勢角直通 · 增开北投 — 台電大樓",
    "line": "中和新芦线",
    "color": "#f5a01f",
    "stations": [
      {
        "name": "古亭",
        "lng": 121.522722,
        "lat": 25.026715
      },
      {
        "name": "東門",
        "lng": 121.529258,
        "lat": 25.033842
      },
      {
        "name": "忠孝新生",
        "lng": 121.532838,
        "lat": 25.04229
      }
    ],
    "planned": false,
    "segId": "tp-dongmen",
    "recolor": [
      {
        "fromLine": "中和线",
        "lineName": "中和新芦线",
        "color": "#f5a01f"
      },
      {
        "fromLine": "新芦线",
        "lineName": "中和新芦线",
        "color": "#f5a01f"
      }
    ]
  },
  {
    "id": "tp-2013-x32",
    "year": 2013,
    "date": "2013-06-29",
    "title": "中和新芦线通至回龙",
    "detail": "6月29日 · 輔大 — 迴龍",
    "line": "中和新芦线",
    "color": "#f5a01f",
    "stations": [
      {
        "name": "輔大",
        "lng": 121.435275,
        "lat": 25.032722
      },
      {
        "name": "丹鳳",
        "lng": 121.422657,
        "lat": 25.028926
      },
      {
        "name": "迴龍",
        "lng": 121.411902,
        "lat": 25.022079
      }
    ],
    "planned": false,
    "segId": "tp-huilong"
  },
  {
    "id": "tp-2013-x33",
    "year": 2013,
    "date": "2013-11-24",
    "title": "信义线开通",
    "detail": "11月24日 · 中正紀念堂 — 象山 · 增开北投 — 象山 · 小南门线运行延至台電大樓",
    "line": "信义线",
    "color": "#e3002c",
    "stations": [
      {
        "name": "中正紀念堂",
        "lng": 121.517545,
        "lat": 25.033696
      },
      {
        "name": "東門",
        "lng": 121.529258,
        "lat": 25.033842
      },
      {
        "name": "大安森林公園",
        "lng": 121.535279,
        "lat": 25.033562
      },
      {
        "name": "大安",
        "lng": 121.543555,
        "lat": 25.033329
      },
      {
        "name": "信義安和",
        "lng": 121.552667,
        "lat": 25.033074
      },
      {
        "name": "台北101/世貿",
        "lng": 121.562443,
        "lat": 25.032862
      },
      {
        "name": "象山",
        "lng": 121.569749,
        "lat": 25.032761
      }
    ],
    "planned": false,
    "segId": "tp-xinyi"
  },
  {
    "id": "tp-2014-x34",
    "year": 2014,
    "date": "2014-11-15",
    "title": "松山新店线通至松山 · 取消小南门线",
    "detail": "11月15日 · 松山 — 西門 · 文湖线南京東路改称南京復興 · 淡水线与信义线合并名称 · 新店线改称松山新店线",
    "line": "松山新店线",
    "color": "#008659",
    "stations": [
      {
        "name": "西門",
        "lng": 121.508608,
        "lat": 25.042713
      },
      {
        "name": "北門",
        "lng": 121.510329,
        "lat": 25.049399
      },
      {
        "name": "中山",
        "lng": 121.520391,
        "lat": 25.052626
      },
      {
        "name": "松江南京",
        "lng": 121.533036,
        "lat": 25.052014
      },
      {
        "name": "南京復興",
        "lng": 121.543965,
        "lat": 25.051836
      },
      {
        "name": "台北小巨蛋",
        "lng": 121.551499,
        "lat": 25.051686
      },
      {
        "name": "南京三民",
        "lng": 121.564306,
        "lat": 25.051428
      },
      {
        "name": "松山",
        "lng": 121.577474,
        "lat": 25.050071
      }
    ],
    "planned": false,
    "segId": "tp-songshan",
    "recolor": [
      {
        "fromLine": "新店线",
        "lineName": "松山新店线",
        "color": "#008659"
      },
      {
        "fromLine": "淡水线",
        "lineName": "淡水信义线",
        "color": "#e3002c"
      },
      {
        "fromLine": "信义线",
        "lineName": "淡水信义线",
        "color": "#e3002c"
      }
    ],
    "retireSegIds": [
      "tp-xiaonanmen"
    ],
    "stationRename": {
      "from": "南京東路",
      "to": "南京復興",
      "lng": 121.543965,
      "lat": 25.051836,
      "color": "#c48c31",
      "open": true
    }
  },
  {
    "id": "tp-2014-x35",
    "year": 2014,
    "date": "2014-11-15",
    "title": "线路改为数字编号",
    "detail": "1号线（文湖线）· 2号线（淡水信义线）· 3号线（松山新店线）· 4号线（中和新芦线）· 5号线（板南线）",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "recolor": [
      {
        "fromLine": "文湖线",
        "lineName": "1号线",
        "color": "#c48c31"
      },
      {
        "fromLine": "淡水信义线",
        "lineName": "2号线",
        "color": "#e3002c"
      },
      {
        "fromLine": "松山新店线",
        "lineName": "3号线",
        "color": "#008659"
      },
      {
        "fromLine": "中和新芦线",
        "lineName": "4号线",
        "color": "#f5a01f"
      },
      {
        "fromLine": "板南线",
        "lineName": "5号线",
        "color": "#0070bd"
      }
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2015-x36",
    "year": 2015,
    "date": "2015-07-06",
    "title": "5号线通至顶埔",
    "detail": "7月6日 · 永寧 — 頂埔",
    "line": "5号线",
    "color": "#0070bd",
    "stations": [
      {
        "name": "頂埔",
        "lng": 121.419477,
        "lat": 24.9597
      },
      {
        "name": "永寧",
        "lng": 121.43627,
        "lat": 24.966872
      }
    ],
    "planned": false,
    "osmKey": "南港-板橋-土城線",
    "segId": "tp-dingpu"
  },
  {
    "id": "tp-2015-x37",
    "year": 2015,
    "date": "2015-10-26",
    "title": "动物园内站更名",
    "detail": "10月26日 · 猫空缆车动物园内改称动物园南站",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "動物園內",
      "to": "動物園南",
      "lng": 121.5829,
      "lat": 24.9936,
      "color": "#b85c38",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2016-x38",
    "year": 2016,
    "date": "2016-10-11",
    "title": "线路改为颜色字首编号",
    "detail": "BR线（文湖线）· R线（淡水信义线）· G线（松山新店线）· O线（中和新芦线）· BL线（板南线）",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "recolor": [
      {
        "fromLine": "1号线",
        "lineName": "BR线",
        "color": "#c48c31"
      },
      {
        "fromLine": "2号线",
        "lineName": "R线",
        "color": "#e3002c"
      },
      {
        "fromLine": "3号线",
        "lineName": "G线",
        "color": "#008659"
      },
      {
        "fromLine": "4号线",
        "lineName": "O线",
        "color": "#f5a01f"
      },
      {
        "fromLine": "5号线",
        "lineName": "BL线",
        "color": "#0070bd"
      }
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2017-x39",
    "year": 2017,
    "date": "2017-03-02",
    "title": "A线开通",
    "detail": "3月2日 · 桃园机场线 台北車站 — 環北",
    "line": "A线",
    "color": "#7B2D8E",
    "stations": [
      {
        "name": "台北車",
        "lng": 121.517475,
        "lat": 25.046243
      },
      {
        "name": "三重",
        "lng": 121.482905,
        "lat": 25.054699
      },
      {
        "name": "新北產業園區",
        "lng": 121.458936,
        "lat": 25.06172
      },
      {
        "name": "新莊副都心",
        "lng": 121.445777,
        "lat": 25.059227
      },
      {
        "name": "泰山",
        "lng": 121.439538,
        "lat": 25.053275
      },
      {
        "name": "泰山貴和",
        "lng": 121.422956,
        "lat": 25.033359
      },
      {
        "name": "體育大學",
        "lng": 121.385439,
        "lat": 25.041324
      },
      {
        "name": "長庚醫院",
        "lng": 121.370822,
        "lat": 25.060509
      },
      {
        "name": "林口",
        "lng": 121.361243,
        "lat": 25.065789
      },
      {
        "name": "山鼻",
        "lng": 121.285191,
        "lat": 25.080821
      },
      {
        "name": "坑口",
        "lng": 121.266478,
        "lat": 25.086455
      },
      {
        "name": "機場第一航廈",
        "lng": 121.238341,
        "lat": 25.080555
      },
      {
        "name": "機場第二航廈",
        "lng": 121.2322,
        "lat": 25.077284
      },
      {
        "name": "機場旅館",
        "lng": 121.220512,
        "lat": 25.069184
      },
      {
        "name": "大園",
        "lng": 121.210611,
        "lat": 25.055805
      },
      {
        "name": "橫山",
        "lng": 121.215761,
        "lat": 25.036469
      },
      {
        "name": "領航",
        "lng": 121.221078,
        "lat": 25.024085
      },
      {
        "name": "高鐵桃園",
        "lng": 121.21409,
        "lat": 25.01372
      },
      {
        "name": "桃園體育園區",
        "lng": 121.203292,
        "lat": 25.001776
      },
      {
        "name": "興南",
        "lng": 121.216399,
        "lat": 24.98
      },
      {
        "name": "環北",
        "lng": 121.220668,
        "lat": 24.967175
      }
    ],
    "planned": false,
    "osmKey": "桃園機場捷運 普通車 台北車站 → 老街溪",
    "segId": "tp-airport"
  },
  {
    "id": "tp-2018-x40",
    "year": 2018,
    "date": "2018-03-01",
    "title": "A线开行部分直通车",
    "detail": "3月1日 · 桃园机场线部分直通车运行至環北",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 121.35,
      "lat": 25.06,
      "zoom": 11
    },
    "highlightFromLine": "A线",
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2018-x41",
    "year": 2018,
    "date": "2018-12-24",
    "title": "淡海轻轨绿山线开通",
    "detail": "12月24日 · 紅樹林 — 崁頂",
    "line": "淡海轻轨绿山线",
    "color": "#FEBEB5",
    "stations": [
      {
        "name": "紅樹林",
        "lng": 121.458832,
        "lat": 25.154409
      },
      {
        "name": "竿蓁林",
        "lng": 121.456259,
        "lat": 25.162185
      },
      {
        "name": "淡金鄧公",
        "lng": 121.460826,
        "lat": 25.169304
      },
      {
        "name": "淡江大學",
        "lng": 121.455977,
        "lat": 25.177076
      },
      {
        "name": "淡金北新",
        "lng": 121.452165,
        "lat": 25.181214
      },
      {
        "name": "新市一路",
        "lng": 121.448123,
        "lat": 25.183898
      },
      {
        "name": "淡水行政中心",
        "lng": 121.444504,
        "lat": 25.188953
      },
      {
        "name": "濱海義山",
        "lng": 121.437372,
        "lat": 25.189718
      },
      {
        "name": "濱海沙崙",
        "lng": 121.431635,
        "lat": 25.190465
      },
      {
        "name": "淡海新市鎮",
        "lng": 121.432475,
        "lat": 25.195655
      },
      {
        "name": "崁頂",
        "lng": 121.43466,
        "lat": 25.200935
      }
    ],
    "planned": false,
    "segId": "tp-danhai-g"
  },
  {
    "id": "tp-2020-x42",
    "year": 2020,
    "date": "2020-01-31",
    "title": "Y线开通",
    "detail": "1月31日 · 环状线 新北產業園區 — 大坪林",
    "line": "Y线",
    "color": "#ffdb00",
    "stations": [
      {
        "name": "大坪林",
        "lng": 121.541643,
        "lat": 24.982923
      },
      {
        "name": "十四張",
        "lng": 121.5276,
        "lat": 24.984483
      },
      {
        "name": "秀朗橋",
        "lng": 121.525028,
        "lat": 24.990336
      },
      {
        "name": "景平",
        "lng": 121.516278,
        "lat": 24.992144
      },
      {
        "name": "景安",
        "lng": 121.505708,
        "lat": 24.993416
      },
      {
        "name": "中和",
        "lng": 121.496212,
        "lat": 25.002358
      },
      {
        "name": "橋和",
        "lng": 121.49025,
        "lat": 25.004607
      },
      {
        "name": "中原",
        "lng": 121.484277,
        "lat": 25.008174
      },
      {
        "name": "板新",
        "lng": 121.472432,
        "lat": 25.014536
      },
      {
        "name": "板橋",
        "lng": 121.463064,
        "lat": 25.014457
      },
      {
        "name": "新埔民生",
        "lng": 121.466666,
        "lat": 25.026177
      },
      {
        "name": "頭前庄",
        "lng": 121.460336,
        "lat": 25.039901
      },
      {
        "name": "幸福",
        "lng": 121.459993,
        "lat": 25.05003
      },
      {
        "name": "新北產業園區",
        "lng": 121.458936,
        "lat": 25.06172
      }
    ],
    "planned": false,
    "segId": "tp-circular"
  },
  {
    "id": "tp-2020-x43",
    "year": 2020,
    "date": "2020-11-15",
    "title": "淡海轻轨蓝海线开通",
    "detail": "11月15日 · 濱海沙崙 — 淡水漁人碼頭",
    "line": "淡海轻轨蓝海线",
    "color": "#7EC8E3",
    "stations": [
      {
        "name": "淡水漁人碼頭",
        "lng": 121.4365,
        "lat": 25.1828
      },
      {
        "name": "沙崙",
        "lng": 121.434,
        "lat": 25.1868
      },
      {
        "name": "濱海沙崙",
        "lng": 121.431635,
        "lat": 25.190465
      }
    ],
    "planned": false,
    "segId": "tp-danhai-b"
  },
  {
    "id": "tp-2023-x44",
    "year": 2023,
    "date": "2023-02-10",
    "title": "安坑轻轨开通",
    "detail": "2月10日 · 十四張 — 雙城",
    "line": "安坑轻轨",
    "color": "#c3b091",
    "stations": [
      {
        "name": "雙城",
        "lng": 121.489682,
        "lat": 24.946319
      },
      {
        "name": "玫瑰中國城",
        "lng": 121.493738,
        "lat": 24.950583
      },
      {
        "name": "台北小城",
        "lng": 121.499373,
        "lat": 24.953683
      },
      {
        "name": "耕莘安康院區",
        "lng": 121.505117,
        "lat": 24.954476
      },
      {
        "name": "景文科大",
        "lng": 121.510425,
        "lat": 24.955546
      },
      {
        "name": "安康",
        "lng": 121.51736,
        "lat": 24.965144
      },
      {
        "name": "陽光運動公園",
        "lng": 121.519538,
        "lat": 24.972304
      },
      {
        "name": "新和國小",
        "lng": 121.518591,
        "lat": 24.983421
      },
      {
        "name": "十四張",
        "lng": 121.5276,
        "lat": 24.984483
      }
    ],
    "planned": false,
    "segId": "tp-ankeng"
  },
  {
    "id": "tp-2023-x45",
    "year": 2023,
    "date": "2023-05-23",
    "title": "Y线交还新北捷运",
    "detail": "5月23日 · 环状线经营权交还新北捷运公司（契约 1 月 30 日到期后完成权责移交）",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "recolor": {
      "fromLine": "Y线",
      "lineName": "Y线（新北捷运）",
      "color": "#ffdb00"
    },
    "highlightFromLine": "Y线",
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2023-x46",
    "year": 2023,
    "date": "2023-07-31",
    "title": "A线延伸老街溪",
    "detail": "7月31日 · 環北 — 老街溪",
    "line": "A线",
    "color": "#7B2D8E",
    "stations": [
      {
        "name": "環北",
        "lng": 121.220668,
        "lat": 24.967175
      },
      {
        "name": "老街溪",
        "lng": 121.219326,
        "lat": 24.95859
      }
    ],
    "planned": false,
    "osmKey": "桃園機場捷運 普通車 台北車站 → 老街溪",
    "segId": "tp-airport-e"
  },
  {
    "id": "tp-2024-x47",
    "year": 2024,
    "date": "2024-04-03",
    "title": "Y线全线停运",
    "detail": "4月3日 · 花莲地震 · 高架桥梁受损 · 环状线暂停营运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 121.47,
      "lat": 25,
      "zoom": 12
    },
    "retireSegIds": [
      "tp-circular"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tp-2024-x48",
    "year": 2024,
    "date": "2024-04-03",
    "title": "Y线北段恢复",
    "detail": "4月3日 17:00 · 板橋 — 新北產業園區分阶段恢复",
    "line": "Y线（新北捷运）",
    "color": "#ffdb00",
    "stations": [
      {
        "name": "板橋",
        "lng": 121.463064,
        "lat": 25.014457
      },
      {
        "name": "新埔民生",
        "lng": 121.466666,
        "lat": 25.026177
      },
      {
        "name": "頭前庄",
        "lng": 121.460336,
        "lat": 25.039901
      },
      {
        "name": "幸福",
        "lng": 121.459993,
        "lat": 25.05003
      },
      {
        "name": "新北產業園區",
        "lng": 121.458936,
        "lat": 25.06172
      }
    ],
    "planned": false,
    "segId": "tp-circular-n"
  },
  {
    "id": "tp-2024-x49",
    "year": 2024,
    "date": "2024-04-07",
    "title": "Y线南段恢复",
    "detail": "4月7日 11:00 · 中和 — 大坪林恢复营运",
    "line": "Y线（新北捷运）",
    "color": "#ffdb00",
    "stations": [
      {
        "name": "大坪林",
        "lng": 121.541643,
        "lat": 24.982923
      },
      {
        "name": "十四張",
        "lng": 121.5276,
        "lat": 24.984483
      },
      {
        "name": "秀朗橋",
        "lng": 121.525028,
        "lat": 24.990336
      },
      {
        "name": "景平",
        "lng": 121.516278,
        "lat": 24.992144
      },
      {
        "name": "景安",
        "lng": 121.505708,
        "lat": 24.993416
      },
      {
        "name": "中和",
        "lng": 121.496212,
        "lat": 25.002358
      }
    ],
    "planned": false,
    "segId": "tp-circular-s"
  },
  {
    "id": "tp-2024-x50",
    "year": 2024,
    "date": "2024-12-12",
    "title": "Y线全线恢复",
    "detail": "12月12日 · 板橋 — 中和修复完成 · 环状线恢复全线通车",
    "line": "Y线（新北捷运）",
    "color": "#ffdb00",
    "stations": [
      {
        "name": "中和",
        "lng": 121.496212,
        "lat": 25.002358
      },
      {
        "name": "橋和",
        "lng": 121.49025,
        "lat": 25.004607
      },
      {
        "name": "中原",
        "lng": 121.484277,
        "lat": 25.008174
      },
      {
        "name": "板新",
        "lng": 121.472432,
        "lat": 25.014536
      },
      {
        "name": "板橋",
        "lng": 121.463064,
        "lat": 25.014457
      }
    ],
    "planned": false,
    "segId": "tp-circular-m"
  },
  {
    "id": "tp-2026-x51",
    "year": 2026,
    "date": "2026-06-30",
    "title": "三莺线开通",
    "detail": "6月30日 · 頂埔 — 鶯歌 · 连接土城、三峡、莺歌",
    "line": "三莺线",
    "color": "#6DB7D0",
    "stations": [
      {
        "name": "鶯歌車",
        "lng": 121.356504,
        "lat": 24.95316
      },
      {
        "name": "臺北大學",
        "lng": 121.367186,
        "lat": 24.938974
      },
      {
        "name": "三峽",
        "lng": 121.376477,
        "lat": 24.93893
      },
      {
        "name": "龍埔",
        "lng": 121.384679,
        "lat": 24.939844
      },
      {
        "name": "橫溪",
        "lng": 121.391294,
        "lat": 24.937409
      },
      {
        "name": "長壽山",
        "lng": 121.402614,
        "lat": 24.944161
      },
      {
        "name": "媽祖田",
        "lng": 121.412132,
        "lat": 24.953421
      },
      {
        "name": "頂埔",
        "lng": 121.419477,
        "lat": 24.9597
      }
    ],
    "planned": false,
    "segId": "tp-sanying"
  },
  {
    "id": "tp-2026-x52",
    "year": 2026,
    "date": "2026-08-30",
    "title": "R线东延广慈／奉天宫",
    "detail": "8月30日 · 象山 — 廣慈/奉天宮",
    "line": "R线",
    "color": "#e3002c",
    "stations": [
      {
        "name": "象山",
        "lng": 121.569749,
        "lat": 25.032761
      },
      {
        "name": "廣慈/奉天宮",
        "lng": 121.582215,
        "lat": 25.037352
      }
    ],
    "planned": false,
    "osmKey": "淡水線-信義線",
    "segId": "tp-xinyi-e"
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const TAIPEI_SCENES = buildCityScenes({
  prefix: 'tp',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '台北捷运线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":121.57,"lat":25.03},
});

export const TAIPEI_META = {
  id: 'taipei',
  label: '台北捷运',
  blurb: '1996–2026 · 手校完成（不含规划）',
};
