/**
 * 天津地铁 · 简办发展史 + 高德站位（tianjin）
 */
import AMAP from './tianjinStationsAmap.json' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = [
  {
    "id": "tj-1976-x0",
    "year": 1976,
    "date": "1976-01-10",
    "title": "既有线开通",
    "detail": "1月10日 · 新华路 — 海光寺 · 中国大陆第二条地铁",
    "line": "既有线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "海光寺",
        "lng": 117.171191,
        "lat": 39.121279
      },
      {
        "name": "鞍山道",
        "lng": 117.181011,
        "lat": 39.119304
      },
      {
        "name": "营口道",
        "lng": 117.191378,
        "lat": 39.117596
      },
      {
        "name": "新华路",
        "lng": 117.2028,
        "lat": 39.1154
      }
    ],
    "planned": false,
    "segId": "tj-old-a"
  },
  {
    "id": "tj-1980-x1",
    "year": 1980,
    "date": "1980-01-10",
    "title": "既有线西延",
    "detail": "1月10日 · 海光寺 — 西南角",
    "line": "既有线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "西南角",
        "lng": 117.16564,
        "lat": 39.136275
      },
      {
        "name": "二纬路",
        "lng": 117.168388,
        "lat": 39.129238
      },
      {
        "name": "海光寺",
        "lng": 117.171191,
        "lat": 39.121279
      }
    ],
    "planned": false,
    "segId": "tj-old-b"
  },
  {
    "id": "tj-1984-x2",
    "year": 1984,
    "date": "1984-12-28",
    "title": "更名为天津地铁1号线",
    "detail": "12月28日 · 全线新华路 — 西站开通",
    "line": "1号线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "西站",
        "lng": 117.160419,
        "lat": 39.155866
      },
      {
        "name": "西北角",
        "lng": 117.165304,
        "lat": 39.145472
      },
      {
        "name": "西南角",
        "lng": 117.16564,
        "lat": 39.136275
      }
    ],
    "planned": false,
    "segId": "tj-old-c",
    "recolor": {
      "fromLine": "既有线",
      "lineName": "1号线",
      "color": "#CC0000"
    }
  },
  {
    "id": "tj-1996-x3",
    "year": 1996,
    "date": "1996-01-10",
    "title": "天津地铁 20 周年",
    "detail": "自 1976 年 1 月 10 日新华路 — 海光寺开通 · 二十周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 117.36,
      "lat": 39.13,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2001-x4",
    "year": 2001,
    "date": "2001-01-10",
    "title": "天津地铁 25 周年",
    "detail": "自 1976 年 1 月 10 日开通 · 二十五周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 117.36,
      "lat": 39.13,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2001-x5",
    "year": 2001,
    "date": "2001-10-09",
    "title": "1号线停运改造",
    "detail": "10月9日 · 新华路 — 西站全线停运",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 117.18,
      "lat": 39.13,
      "zoom": 13
    },
    "retireSegIds": [
      "tj-old-a",
      "tj-old-b",
      "tj-old-c"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2004-x6",
    "year": 2004,
    "date": "2004-03-28",
    "title": "津滨快轨开通试运营",
    "detail": "3月28日 · 中山门 — 东海路",
    "line": "津滨快线",
    "color": "#063A91",
    "stations": [
      {
        "name": "东海路",
        "lng": 117.730983,
        "lat": 39.039625
      },
      {
        "name": "会展中心",
        "lng": 117.725397,
        "lat": 39.029053
      },
      {
        "name": "太湖路",
        "lng": 117.717112,
        "lat": 39.018974
      },
      {
        "name": "市民广场",
        "lng": 117.696795,
        "lat": 39.017288
      },
      {
        "name": "洞庭路（泰达）",
        "lng": 117.673154,
        "lat": 39.024665
      },
      {
        "name": "洋货市场",
        "lng": 117.654872,
        "lat": 39.02873
      },
      {
        "name": "胡家园",
        "lng": 117.601274,
        "lat": 39.039761
      },
      {
        "name": "钢管公司",
        "lng": 117.497572,
        "lat": 39.038841
      },
      {
        "name": "军粮城",
        "lng": 117.449617,
        "lat": 39.046981
      },
      {
        "name": "小东庄",
        "lng": 117.396786,
        "lat": 39.063256
      },
      {
        "name": "东丽开发区",
        "lng": 117.350923,
        "lat": 39.078293
      },
      {
        "name": "新立",
        "lng": 117.32956,
        "lat": 39.084796
      },
      {
        "name": "张贵庄",
        "lng": 117.301429,
        "lat": 39.09107
      },
      {
        "name": "二号桥",
        "lng": 117.286819,
        "lat": 39.094174
      },
      {
        "name": "一号桥",
        "lng": 117.276634,
        "lat": 39.095063
      },
      {
        "name": "中山门",
        "lng": 117.258043,
        "lat": 39.099905
      }
    ],
    "ghost": [
      "一号桥",
      "二号桥",
      "市民广场",
      "会展中心",
      "新立",
      "小东庄",
      "军粮城",
      "胡家园",
      "太湖路",
      "张贵庄"
    ],
    "planned": false,
    "segId": "tj-l9-a"
  },
  {
    "id": "tj-2004-x7",
    "year": 2004,
    "date": "2004-05-25",
    "title": "一号桥站投入使用",
    "detail": "5月25日 · 津滨快轨",
    "stations": [
      {
        "name": "一号桥",
        "lng": 117.276634,
        "lat": 39.095063
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "一号桥"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2004-x8",
    "year": 2004,
    "date": "2004-10-18",
    "title": "市民广场站投入使用",
    "detail": "10月18日 · 津滨快轨",
    "stations": [
      {
        "name": "市民广场",
        "lng": 117.696795,
        "lat": 39.017288
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "市民广场"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2005-x9",
    "year": 2005,
    "date": "2005-03-27",
    "title": "会展中心站开通",
    "detail": "3月27日 · 津滨快轨",
    "stations": [
      {
        "name": "会展中心",
        "lng": 117.725397,
        "lat": 39.029053
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "会展中心"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2005-x10",
    "year": 2005,
    "date": "2005-04-28",
    "title": "津滨快轨站名调整",
    "detail": "4月28日 · 洞庭路改泰达 · 洋货市场改塘沽 · 一号桥暂停 · 二号桥投入使用",
    "stations": [
      {
        "name": "二号桥",
        "lng": 117.286819,
        "lat": 39.094174
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "二号桥"
    ],
    "retireStations": [
      "一号桥"
    ],
    "stationRename": [
      {
        "from": "洞庭路（泰达）",
        "to": "泰达",
        "lng": 117.673154,
        "lat": 39.024665,
        "color": "#2249A3",
        "open": true
      },
      {
        "from": "洋货市场",
        "to": "塘沽",
        "lng": 117.654872,
        "lat": 39.02873,
        "color": "#2249A3",
        "open": true
      }
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2006-x11",
    "year": 2006,
    "date": "2006-01-10",
    "title": "天津地铁 30 周年",
    "detail": "自 1976 年 1 月 10 日开通 · 三十周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 117.36,
      "lat": 39.13,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2006-x12",
    "year": 2006,
    "date": "2006-03-01",
    "title": "津滨快轨多站开通",
    "detail": "3月1日 · 一号桥恢复 · 新立、小东庄、军粮城、胡家园投入使用",
    "stations": [
      {
        "name": "新立",
        "lng": 117.32956,
        "lat": 39.084796
      },
      {
        "name": "小东庄",
        "lng": 117.396786,
        "lat": 39.063256
      },
      {
        "name": "军粮城",
        "lng": 117.449617,
        "lat": 39.046981
      },
      {
        "name": "胡家园",
        "lng": 117.601274,
        "lat": 39.039761
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "新立",
      "小东庄",
      "军粮城",
      "胡家园"
    ],
    "addStations": [
      {
        "name": "一号桥",
        "after": "中山门",
        "lng": 117.276634,
        "lat": 39.095063
      }
    ],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2006-x13",
    "year": 2006,
    "date": "2006-06-12",
    "title": "1号线刘园 — 双林开通",
    "detail": "6月12日 · 新华路成为中国大陆第一个永久废弃的地铁站",
    "line": "1号线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "刘园",
        "lng": 117.109463,
        "lat": 39.206739
      },
      {
        "name": "西横堤",
        "lng": 117.115423,
        "lat": 39.198998
      },
      {
        "name": "果酒厂",
        "lng": 117.121727,
        "lat": 39.190781
      },
      {
        "name": "本溪路",
        "lng": 117.133046,
        "lat": 39.184257
      },
      {
        "name": "勤俭道",
        "lng": 117.147281,
        "lat": 39.177195
      },
      {
        "name": "洪湖里",
        "lng": 117.155533,
        "lat": 39.169761
      },
      {
        "name": "西站",
        "lng": 117.160419,
        "lat": 39.155866
      },
      {
        "name": "西北角",
        "lng": 117.165304,
        "lat": 39.145472
      },
      {
        "name": "西南角",
        "lng": 117.16564,
        "lat": 39.136275
      },
      {
        "name": "二纬路",
        "lng": 117.168388,
        "lat": 39.129238
      },
      {
        "name": "海光寺",
        "lng": 117.171191,
        "lat": 39.121279
      },
      {
        "name": "鞍山道",
        "lng": 117.181011,
        "lat": 39.119304
      },
      {
        "name": "营口道",
        "lng": 117.191378,
        "lat": 39.117596
      },
      {
        "name": "新华路",
        "lng": 117.2028,
        "lat": 39.1154
      },
      {
        "name": "小白楼",
        "lng": 117.209123,
        "lat": 39.113906
      },
      {
        "name": "下瓦房",
        "lng": 117.216618,
        "lat": 39.104209
      },
      {
        "name": "南楼",
        "lng": 117.217604,
        "lat": 39.095014
      },
      {
        "name": "土城",
        "lng": 117.226015,
        "lat": 39.088243
      },
      {
        "name": "陈塘庄",
        "lng": 117.242222,
        "lat": 39.082533
      },
      {
        "name": "复兴门",
        "lng": 117.253908,
        "lat": 39.076242
      },
      {
        "name": "华山里",
        "lng": 117.25562,
        "lat": 39.065203
      },
      {
        "name": "财经大学",
        "lng": 117.270624,
        "lat": 39.062972
      }
    ],
    "ghost": [
      "新华路"
    ],
    "planned": false,
    "segId": "tj-l1-2006"
  },
  {
    "id": "tj-2006-x14",
    "year": 2006,
    "date": "2006-06-12",
    "title": "1号线通至双林",
    "detail": "6月12日 · 财经大学 — 双林",
    "line": "1号线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "财经大学",
        "lng": 117.270624,
        "lat": 39.062972
      },
      {
        "name": "双林",
        "lng": 117.285819,
        "lat": 39.056384
      }
    ],
    "planned": false,
    "segId": "tj-l1-shuanglin"
  },
  {
    "id": "tj-2007-x15",
    "year": 2007,
    "date": "2007-05-10",
    "title": "开发区导轨电车开通",
    "detail": "5月10日 · 泰达 — 学院区北 · 全国首条导轨电车",
    "line": "导轨电车",
    "color": "#8BC34A",
    "stations": [
      {
        "name": "泰达",
        "lng": 117.673154,
        "lat": 39.024665
      },
      {
        "name": "第一大街",
        "lng": 117.6862,
        "lat": 39.0322
      },
      {
        "name": "第二大街",
        "lng": 117.6884,
        "lat": 39.0378
      },
      {
        "name": "第三大街",
        "lng": 117.6905,
        "lat": 39.0432
      },
      {
        "name": "第四大街",
        "lng": 117.6926,
        "lat": 39.0484
      },
      {
        "name": "第五大街",
        "lng": 117.6946,
        "lat": 39.0535
      },
      {
        "name": "第六大街",
        "lng": 117.6965,
        "lat": 39.0585
      },
      {
        "name": "第七大街",
        "lng": 117.6983,
        "lat": 39.0634
      },
      {
        "name": "第九大街",
        "lng": 117.7001,
        "lat": 39.0692
      },
      {
        "name": "第十大街",
        "lng": 117.7014,
        "lat": 39.074
      },
      {
        "name": "第十一大街",
        "lng": 117.7025,
        "lat": 39.0784
      },
      {
        "name": "学院区南",
        "lng": 117.7034,
        "lat": 39.0822
      },
      {
        "name": "学院区",
        "lng": 117.7042,
        "lat": 39.0854
      },
      {
        "name": "学院区北",
        "lng": 117.705,
        "lat": 39.0886
      }
    ],
    "planned": false,
    "segId": "tj-tram"
  },
  {
    "id": "tj-2009-x16",
    "year": 2009,
    "date": "2009-05-28",
    "title": "西站停运",
    "detail": "5月28日 · 配合京沪高铁施工 · 西站停运约两年",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 117.160419,
      "lat": 39.155866,
      "zoom": 14
    },
    "retireStations": [
      "西站"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2011-x17",
    "year": 2011,
    "date": "2011-01-10",
    "title": "天津地铁 35 周年",
    "detail": "自 1976 年 1 月 10 日开通 · 三十五周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 117.36,
      "lat": 39.13,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2011-x18",
    "year": 2011,
    "date": "2011-05-01",
    "title": "9号线开通",
    "detail": "5月1日 · 津滨快线更名为 9 号线 · 中山门 — 十一经路",
    "line": "9号线",
    "color": "#063A91",
    "stations": [
      {
        "name": "中山门",
        "lng": 117.258043,
        "lat": 39.099905
      },
      {
        "name": "东兴路",
        "lng": 117.236302,
        "lat": 39.102445
      },
      {
        "name": "直沽",
        "lng": 117.227655,
        "lat": 39.110026
      },
      {
        "name": "十一经路",
        "lng": 117.217675,
        "lat": 39.120377
      }
    ],
    "planned": false,
    "segId": "tj-l9-b",
    "recolor": {
      "fromLine": "津滨快线",
      "lineName": "9号线",
      "color": "#2249A3"
    }
  },
  {
    "id": "tj-2011-x19",
    "year": 2011,
    "date": "2011-06-29",
    "title": "西站恢复运营",
    "detail": "6月29日 · 京沪高铁开通前西站恢复",
    "stations": [
      {
        "name": "西站",
        "lng": 117.160419,
        "lat": 39.155866
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "addStations": [
      {
        "name": "西站",
        "after": "洪湖里",
        "lng": 117.160419,
        "lat": 39.155866
      }
    ],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2011-x20",
    "year": 2011,
    "date": "2011-08-25",
    "title": "学院区南站更名",
    "detail": "8月25日 · 导轨电车学院区南改称联合研究院",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "学院区南",
      "to": "联合研究院",
      "lng": 117.7034,
      "lat": 39.0822,
      "color": "#8BC34A",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2011-x21",
    "year": 2011,
    "date": "2011-09-22",
    "title": "1号线扩编",
    "detail": "9月22日 · 4 编组扩为 6 编组",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 117.17,
      "lat": 39.14,
      "zoom": 12
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2012-x22",
    "year": 2012,
    "date": "2012-07-01",
    "title": "2号线西段开通",
    "detail": "7月1日 · 曹庄 — 东南角 · 东西分段运营",
    "line": "2号线",
    "color": "#ECE114",
    "stations": [
      {
        "name": "东南角",
        "lng": 117.183971,
        "lat": 39.135825
      },
      {
        "name": "鼓楼",
        "lng": 117.17489,
        "lat": 39.136055
      },
      {
        "name": "西南角",
        "lng": 117.16564,
        "lat": 39.136275
      },
      {
        "name": "广开四马路",
        "lng": 117.155626,
        "lat": 39.136592
      },
      {
        "name": "长虹公园",
        "lng": 117.143048,
        "lat": 39.136675
      },
      {
        "name": "咸阳路",
        "lng": 117.128583,
        "lat": 39.136647
      },
      {
        "name": "芥园西道",
        "lng": 117.113569,
        "lat": 39.141528
      },
      {
        "name": "卞兴",
        "lng": 117.102566,
        "lat": 39.145018
      },
      {
        "name": "曹庄",
        "lng": 117.084529,
        "lat": 39.144517
      }
    ],
    "ghost": [
      "芥园西道"
    ],
    "planned": false
  },
  {
    "id": "tj-2012-x23",
    "year": 2012,
    "date": "2012-07-01",
    "title": "2号线东段开通",
    "detail": "7月1日 · 天津站 — 空港经济区 · 建国道区间未通",
    "line": "2号线",
    "color": "#ECE114",
    "stations": [
      {
        "name": "空港经济区",
        "lng": 117.32855,
        "lat": 39.156582
      },
      {
        "name": "国山路",
        "lng": 117.30362,
        "lat": 39.153031
      },
      {
        "name": "登州路",
        "lng": 117.289656,
        "lat": 39.149456
      },
      {
        "name": "屿东城",
        "lng": 117.27353,
        "lat": 39.146194
      },
      {
        "name": "翠阜新村",
        "lng": 117.251719,
        "lat": 39.142997
      },
      {
        "name": "靖江路",
        "lng": 117.23797,
        "lat": 39.141519
      },
      {
        "name": "顺驰桥",
        "lng": 117.227726,
        "lat": 39.140396
      },
      {
        "name": "远洋国际中心",
        "lng": 117.21472,
        "lat": 39.135488
      },
      {
        "name": "天津站",
        "lng": 117.205403,
        "lat": 39.13676
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2012-x24",
    "year": 2012,
    "date": "2012-10-01",
    "title": "3号线一期开通",
    "detail": "10月1日 · 高新区 — 小淀",
    "line": "3号线",
    "color": "#128BBE",
    "stations": [
      {
        "name": "小淀",
        "lng": 117.25135,
        "lat": 39.238128
      },
      {
        "name": "丰产河",
        "lng": 117.229735,
        "lat": 39.237101
      },
      {
        "name": "华北集团",
        "lng": 117.221713,
        "lat": 39.226542
      },
      {
        "name": "天士力",
        "lng": 117.208705,
        "lat": 39.204841
      },
      {
        "name": "宜兴埠",
        "lng": 117.21271,
        "lat": 39.19655
      },
      {
        "name": "张兴庄",
        "lng": 117.208527,
        "lat": 39.190877
      },
      {
        "name": "铁东路",
        "lng": 117.200699,
        "lat": 39.178845
      },
      {
        "name": "北站",
        "lng": 117.201139,
        "lat": 39.165602
      },
      {
        "name": "中山路",
        "lng": 117.1997,
        "lat": 39.160755
      },
      {
        "name": "金狮桥",
        "lng": 117.201704,
        "lat": 39.150064
      },
      {
        "name": "天津站",
        "lng": 117.205403,
        "lat": 39.13676
      },
      {
        "name": "津湾广场",
        "lng": 117.201706,
        "lat": 39.130975
      },
      {
        "name": "和平路",
        "lng": 117.198356,
        "lat": 39.12587
      },
      {
        "name": "营口道",
        "lng": 117.191378,
        "lat": 39.117596
      },
      {
        "name": "西康路",
        "lng": 117.181677,
        "lat": 39.111155
      },
      {
        "name": "吴家窑",
        "lng": 117.17982,
        "lat": 39.098741
      },
      {
        "name": "天塔",
        "lng": 117.17142,
        "lat": 39.094722
      },
      {
        "name": "周邓纪念馆",
        "lng": 117.157635,
        "lat": 39.091623
      },
      {
        "name": "红旗南路",
        "lng": 117.141757,
        "lat": 39.091652
      },
      {
        "name": "王顶堤",
        "lng": 117.132594,
        "lat": 39.090981
      },
      {
        "name": "华苑",
        "lng": 117.122583,
        "lat": 39.086071
      },
      {
        "name": "大学城",
        "lng": 117.105575,
        "lat": 39.071265
      },
      {
        "name": "高新区",
        "lng": 117.092578,
        "lat": 39.070761
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2012-x25",
    "year": 2012,
    "date": "2012-10-15",
    "title": "9号线通至天津站",
    "detail": "10月15日 · 十一经路 — 天津站",
    "line": "9号线",
    "color": "#063A91",
    "stations": [
      {
        "name": "十一经路",
        "lng": 117.217675,
        "lat": 39.120377
      },
      {
        "name": "大王庄",
        "lng": 117.21219,
        "lat": 39.126216
      },
      {
        "name": "天津站",
        "lng": 117.205403,
        "lat": 39.13676
      }
    ],
    "planned": false,
    "segId": "tj-l9-c"
  },
  {
    "id": "tj-2012-x26",
    "year": 2012,
    "date": "2012-11-18",
    "title": "芥园西道站投入使用",
    "detail": "11月18日 · 2 号线",
    "stations": [
      {
        "name": "芥园西道",
        "lng": 117.113569,
        "lat": 39.141528
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "芥园西道"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2013-x27",
    "year": 2013,
    "date": "2013-08-28",
    "title": "2号线全线贯通",
    "detail": "8月28日 · 东南角 — 天津站贯通 · 新设建国道站",
    "line": "2号线",
    "color": "#ECE114",
    "stations": [
      {
        "name": "天津站",
        "lng": 117.205403,
        "lat": 39.13676
      },
      {
        "name": "建国道",
        "lng": 117.194584,
        "lat": 39.137969
      },
      {
        "name": "东南角",
        "lng": 117.183971,
        "lat": 39.135825
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2013-x28",
    "year": 2013,
    "date": "2013-12-28",
    "title": "3号线西南延伸开通",
    "detail": "12月28日 · 高新区 — 南站",
    "line": "3号线",
    "color": "#128BBE",
    "stations": [
      {
        "name": "高新区",
        "lng": 117.092578,
        "lat": 39.070761
      },
      {
        "name": "学府工业区",
        "lng": 117.0726,
        "lat": 39.07077
      },
      {
        "name": "杨伍庄",
        "lng": 117.063618,
        "lat": 39.067181
      },
      {
        "name": "南站",
        "lng": 117.05574,
        "lat": 39.055938
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2014-x29",
    "year": 2014,
    "date": "2014-08-28",
    "title": "2号线通至机场",
    "detail": "8月28日 · 空港经济区 — 滨海国际机场",
    "line": "2号线",
    "color": "#ECE114",
    "stations": [
      {
        "name": "滨海国际机场",
        "lng": 117.356112,
        "lat": 39.130965
      },
      {
        "name": "空港经济区",
        "lng": 117.32855,
        "lat": 39.156582
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2015-x30",
    "year": 2015,
    "date": "2015-01-10",
    "title": "天津地铁 39 周年",
    "detail": "自 1976 年 1 月 10 日开通 · 三十九周年",
    "stations": [],
    "overview": true,
    "fitNetwork": false,
    "focus": {
      "lng": 117.36,
      "lat": 39.13,
      "zoom": 9
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2015-x31",
    "year": 2015,
    "date": "2015-08-13",
    "title": "9号线全线停运",
    "detail": "8月13日 · 受 8·12 事故影响全线暂停运营",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 117.45,
      "lat": 39.06,
      "zoom": 10
    },
    "retireSegIds": [
      "tj-l9-a",
      "tj-l9-b",
      "tj-l9-c"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2015-x32",
    "year": 2015,
    "date": "2015-09-14",
    "title": "东海路站拆除重建",
    "detail": "9月14日 · 不具备修复条件 · 拆除重建",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 117.730983,
      "lat": 39.039625,
      "zoom": 14
    },
    "retireStations": [
      "东海路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2015-x33",
    "year": 2015,
    "date": "2015-12-16",
    "title": "9号线部分恢复",
    "detail": "12月16日 · 天津站 — 钢管公司恢复运营",
    "line": "9号线",
    "color": "#063A91",
    "stations": [
      {
        "name": "钢管公司",
        "lng": 117.497572,
        "lat": 39.038841
      },
      {
        "name": "军粮城",
        "lng": 117.449617,
        "lat": 39.046981
      },
      {
        "name": "小东庄",
        "lng": 117.396786,
        "lat": 39.063256
      },
      {
        "name": "东丽开发区",
        "lng": 117.350923,
        "lat": 39.078293
      },
      {
        "name": "新立",
        "lng": 117.32956,
        "lat": 39.084796
      },
      {
        "name": "张贵庄",
        "lng": 117.301429,
        "lat": 39.09107
      },
      {
        "name": "二号桥",
        "lng": 117.286819,
        "lat": 39.094174
      },
      {
        "name": "一号桥",
        "lng": 117.276634,
        "lat": 39.095063
      },
      {
        "name": "中山门",
        "lng": 117.258043,
        "lat": 39.099905
      },
      {
        "name": "东兴路",
        "lng": 117.236302,
        "lat": 39.102445
      },
      {
        "name": "直沽",
        "lng": 117.227655,
        "lat": 39.110026
      },
      {
        "name": "十一经路",
        "lng": 117.217675,
        "lat": 39.120377
      },
      {
        "name": "大王庄",
        "lng": 117.21219,
        "lat": 39.126216
      },
      {
        "name": "天津站",
        "lng": 117.205403,
        "lat": 39.13676
      }
    ],
    "ghost": [
      "张贵庄"
    ],
    "planned": false,
    "segId": "tj-l9-r1"
  },
  {
    "id": "tj-2016-x34",
    "year": 2016,
    "date": "2016-06-26",
    "title": "9号线再恢复一段",
    "detail": "6月26日 · 钢管公司 — 市民广场恢复运营",
    "line": "9号线",
    "color": "#063A91",
    "stations": [
      {
        "name": "市民广场",
        "lng": 117.696795,
        "lat": 39.017288
      },
      {
        "name": "洞庭路（泰达）",
        "lng": 117.673154,
        "lat": 39.024665
      },
      {
        "name": "洋货市场",
        "lng": 117.654872,
        "lat": 39.02873
      },
      {
        "name": "胡家园",
        "lng": 117.601274,
        "lat": 39.039761
      },
      {
        "name": "钢管公司",
        "lng": 117.497572,
        "lat": 39.038841
      }
    ],
    "planned": false,
    "segId": "tj-l9-r2"
  },
  {
    "id": "tj-2016-x35",
    "year": 2016,
    "date": "2016-08-06",
    "title": "6号线首开段开通",
    "detail": "8月6日 · 长虹公园 — 南翠屏",
    "line": "6号线",
    "color": "#9F216F",
    "stations": [
      {
        "name": "长虹公园",
        "lng": 117.143048,
        "lat": 39.136675
      },
      {
        "name": "宜宾道",
        "lng": 117.142926,
        "lat": 39.125293
      },
      {
        "name": "鞍山西道",
        "lng": 117.142971,
        "lat": 39.115412
      },
      {
        "name": "天拖",
        "lng": 117.143046,
        "lat": 39.108111
      },
      {
        "name": "一中心医院",
        "lng": 117.143062,
        "lat": 39.102036
      },
      {
        "name": "红旗南路",
        "lng": 117.141757,
        "lat": 39.091652
      },
      {
        "name": "迎风道",
        "lng": 117.143078,
        "lat": 39.085054
      },
      {
        "name": "南翠屏",
        "lng": 117.152267,
        "lat": 39.078885
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2016-x36",
    "year": 2016,
    "date": "2016-12-28",
    "title": "双林站拆除",
    "detail": "12月28日 · 配合 1 号线东延工程拆除双林",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 117.253,
      "lat": 39.066,
      "zoom": 14
    },
    "retireSegIds": [
      "tj-l1-shuanglin"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2016-x37",
    "year": 2016,
    "date": "2016-12-31",
    "title": "9号线全线恢复",
    "detail": "12月31日 · 剩余段恢复 · 重建东海路及预留太湖路、张贵庄投入使用",
    "line": "9号线",
    "color": "#063A91",
    "stations": [
      {
        "name": "东海路",
        "lng": 117.730983,
        "lat": 39.039625
      },
      {
        "name": "会展中心",
        "lng": 117.725397,
        "lat": 39.029053
      },
      {
        "name": "太湖路",
        "lng": 117.717112,
        "lat": 39.018974
      },
      {
        "name": "市民广场",
        "lng": 117.696795,
        "lat": 39.017288
      }
    ],
    "planned": false,
    "segId": "tj-l9-r3",
    "openStations": [
      "太湖路",
      "张贵庄",
      "东海路"
    ]
  },
  {
    "id": "tj-2016-x38",
    "year": 2016,
    "date": "2016-12-31",
    "title": "6号线一期北段开通",
    "detail": "12月31日 · 长虹公园 — 南孙庄",
    "line": "6号线",
    "color": "#9F216F",
    "stations": [
      {
        "name": "南孙庄",
        "lng": 117.311942,
        "lat": 39.205413
      },
      {
        "name": "南何庄",
        "lng": 117.284676,
        "lat": 39.205283
      },
      {
        "name": "大毕庄",
        "lng": 117.272828,
        "lat": 39.201946
      },
      {
        "name": "金钟街",
        "lng": 117.259805,
        "lat": 39.198841
      },
      {
        "name": "徐庄子",
        "lng": 117.24787,
        "lat": 39.189895
      },
      {
        "name": "金钟河大街",
        "lng": 117.235615,
        "lat": 39.171116
      },
      {
        "name": "民权门",
        "lng": 117.227105,
        "lat": 39.167637
      },
      {
        "name": "北宁公园",
        "lng": 117.216877,
        "lat": 39.165247
      },
      {
        "name": "北站",
        "lng": 117.201139,
        "lat": 39.165602
      },
      {
        "name": "新开河",
        "lng": 117.196541,
        "lat": 39.167823
      },
      {
        "name": "外院附中",
        "lng": 117.185506,
        "lat": 39.170193
      },
      {
        "name": "天泰路",
        "lng": 117.176979,
        "lat": 39.167132
      },
      {
        "name": "北运河",
        "lng": 117.171884,
        "lat": 39.163316
      },
      {
        "name": "北竹林",
        "lng": 117.166352,
        "lat": 39.159113
      },
      {
        "name": "西站",
        "lng": 117.160419,
        "lat": 39.155866
      },
      {
        "name": "复兴路",
        "lng": 117.151468,
        "lat": 39.15503
      },
      {
        "name": "人民医院",
        "lng": 117.143315,
        "lat": 39.146257
      },
      {
        "name": "长虹公园",
        "lng": 117.143048,
        "lat": 39.136675
      }
    ],
    "defer": [
      "北运河"
    ],
    "planned": false
  },
  {
    "id": "tj-2018-x39",
    "year": 2018,
    "date": "2018-04-26",
    "title": "6号线一期南段开通",
    "detail": "4月26日 · 南翠屏 — 梅林路",
    "line": "6号线",
    "color": "#9F216F",
    "stations": [
      {
        "name": "南翠屏",
        "lng": 117.152267,
        "lat": 39.078885
      },
      {
        "name": "水上公园东路",
        "lng": 117.166787,
        "lat": 39.078457
      },
      {
        "name": "肿瘤医院",
        "lng": 117.175714,
        "lat": 39.079078
      },
      {
        "name": "天津宾馆",
        "lng": 117.192246,
        "lat": 39.08432
      },
      {
        "name": "文化中心",
        "lng": 117.200565,
        "lat": 39.085144
      },
      {
        "name": "乐园道",
        "lng": 117.211226,
        "lat": 39.090264
      },
      {
        "name": "尖山路",
        "lng": 117.217728,
        "lat": 39.086257
      },
      {
        "name": "黑牛城道",
        "lng": 117.216663,
        "lat": 39.080399
      },
      {
        "name": "梅江道",
        "lng": 117.219341,
        "lat": 39.067844
      },
      {
        "name": "左江道",
        "lng": 117.211467,
        "lat": 39.059042
      },
      {
        "name": "梅江公园",
        "lng": 117.211285,
        "lat": 39.051367
      },
      {
        "name": "梅江会展中心",
        "lng": 117.211454,
        "lat": 39.043353
      },
      {
        "name": "解放南路",
        "lng": 117.227754,
        "lat": 39.039807
      },
      {
        "name": "洞庭路",
        "lng": 117.239616,
        "lat": 39.04265
      },
      {
        "name": "梅林路",
        "lng": 117.248514,
        "lat": 39.043879
      }
    ],
    "ghost": [
      "梅林路"
    ],
    "planned": false
  },
  {
    "id": "tj-2018-x40",
    "year": 2018,
    "date": "2018-07-31",
    "title": "1号线两站更名",
    "detail": "7月31日 · 西横堤改瑞景新苑 · 果酒厂改佳园里",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": [
      {
        "from": "西横堤",
        "to": "瑞景新苑",
        "lng": 117.115423,
        "lat": 39.198998,
        "color": "#CC0000",
        "open": true
      },
      {
        "from": "果酒厂",
        "to": "佳园里",
        "lng": 117.121727,
        "lat": 39.190781,
        "color": "#CC0000",
        "open": true
      }
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2018-x41",
    "year": 2018,
    "date": "2018-10-22",
    "title": "5号线一期开通",
    "detail": "10月22日 · 丹河北道 — 中医一附院",
    "line": "5号线",
    "color": "#FB6F14",
    "stations": [
      {
        "name": "中医一附院",
        "lng": 117.178421,
        "lat": 39.045863
      },
      {
        "name": "昌凌路",
        "lng": 117.178373,
        "lat": 39.055706
      },
      {
        "name": "凌宾路",
        "lng": 117.165663,
        "lat": 39.06701
      },
      {
        "name": "体育中心",
        "lng": 117.166111,
        "lat": 39.073682
      },
      {
        "name": "肿瘤医院",
        "lng": 117.175714,
        "lat": 39.079078
      },
      {
        "name": "天津宾馆",
        "lng": 117.192246,
        "lat": 39.08432
      },
      {
        "name": "文化中心",
        "lng": 117.200565,
        "lat": 39.085144
      },
      {
        "name": "西南楼",
        "lng": 117.20978,
        "lat": 39.094438
      },
      {
        "name": "下瓦房",
        "lng": 117.216618,
        "lat": 39.104209
      },
      {
        "name": "直沽",
        "lng": 117.227655,
        "lat": 39.110026
      },
      {
        "name": "津塘路",
        "lng": 117.235126,
        "lat": 39.115547
      },
      {
        "name": "成林道",
        "lng": 117.239354,
        "lat": 39.129307
      },
      {
        "name": "靖江路",
        "lng": 117.23797,
        "lat": 39.141519
      },
      {
        "name": "幸福公园",
        "lng": 117.237915,
        "lat": 39.153116
      },
      {
        "name": "月牙河",
        "lng": 117.239511,
        "lat": 39.163779
      },
      {
        "name": "金钟河大街",
        "lng": 117.235615,
        "lat": 39.171116
      },
      {
        "name": "建昌道",
        "lng": 117.228366,
        "lat": 39.178602
      },
      {
        "name": "思源路",
        "lng": 117.221181,
        "lat": 39.182354
      },
      {
        "name": "志成路",
        "lng": 117.212844,
        "lat": 39.186072
      },
      {
        "name": "张兴庄",
        "lng": 117.208527,
        "lat": 39.190877
      },
      {
        "name": "宜兴埠北",
        "lng": 117.199119,
        "lat": 39.201968
      },
      {
        "name": "辽河北道",
        "lng": 117.193685,
        "lat": 39.208669
      },
      {
        "name": "淮河道",
        "lng": 117.186156,
        "lat": 39.217478
      },
      {
        "name": "职业大学",
        "lng": 117.175623,
        "lat": 39.229909
      },
      {
        "name": "北辰道",
        "lng": 117.16729,
        "lat": 39.239495
      },
      {
        "name": "丹河北道",
        "lng": 117.157265,
        "lat": 39.25126
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2018-x42",
    "year": 2018,
    "date": "2018-12-03",
    "title": "1号线东延开通",
    "detail": "12月3日 · 财经大学 — 李楼 · 双林重建开通",
    "line": "1号线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "财经大学",
        "lng": 117.270624,
        "lat": 39.062972
      },
      {
        "name": "双林",
        "lng": 117.285819,
        "lat": 39.056384
      },
      {
        "name": "李楼",
        "lng": 117.310784,
        "lat": 39.053427
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2019-x43",
    "year": 2019,
    "date": "2019-01-31",
    "title": "5号线北端开通",
    "detail": "1月31日 · 丹河北道 — 北辰科技园北",
    "line": "5号线",
    "color": "#FB6F14",
    "stations": [
      {
        "name": "丹河北道",
        "lng": 117.157265,
        "lat": 39.25126
      },
      {
        "name": "北辰科技园北",
        "lng": 117.143477,
        "lat": 39.266672
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2019-x44",
    "year": 2019,
    "date": "2019-12-28",
    "title": "1号线通至东沽路",
    "detail": "12月28日 · 李楼 — 东沽路",
    "line": "1号线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "李楼",
        "lng": 117.310784,
        "lat": 39.053427
      },
      {
        "name": "洪泥河东",
        "lng": 117.338427,
        "lat": 39.046539
      },
      {
        "name": "高庄子",
        "lng": 117.354296,
        "lat": 39.042007
      },
      {
        "name": "北洋村",
        "lng": 117.377448,
        "lat": 39.027863
      },
      {
        "name": "国展路",
        "lng": 117.384201,
        "lat": 39.020821
      },
      {
        "name": "东沽路",
        "lng": 117.401846,
        "lat": 39.011301
      }
    ],
    "defer": [
      "洪泥河东"
    ],
    "planned": false
  },
  {
    "id": "tj-2021-x45",
    "year": 2021,
    "date": "2021-05-12",
    "title": "1号线两站更名",
    "detail": "5月12日 · 北洋村改国际会展中心 · 国展路改国瑞路",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": [
      {
        "from": "北洋村",
        "to": "国际会展中心",
        "lng": 117.377448,
        "lat": 39.027863,
        "color": "#CC0000",
        "open": true
      },
      {
        "from": "国展路",
        "to": "国瑞路",
        "lng": 117.384201,
        "lat": 39.020821,
        "color": "#CC0000",
        "open": true
      }
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2021-x46",
    "year": 2021,
    "date": "2021-12-07",
    "title": "李七庄站投入使用",
    "detail": "12月7日 · 5号线中医一附院 — 李七庄南",
    "line": "5号线",
    "color": "#FB6F14",
    "stations": [
      {
        "name": "李七庄南",
        "lng": 117.164316,
        "lat": 39.035404
      },
      {
        "name": "中医一附院",
        "lng": 117.178421,
        "lat": 39.045863
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2021-x47",
    "year": 2021,
    "date": "2021-12-22",
    "title": "黑牛城道站更名",
    "detail": "12月22日 · 6号线黑牛城道改称医大二院",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "stationRename": {
      "from": "黑牛城道",
      "to": "医大二院",
      "lng": 117.216663,
      "lat": 39.080399,
      "color": "#A61D7F",
      "open": true
    },
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2021-x48",
    "year": 2021,
    "date": "2021-12-28",
    "title": "梅林路站投入使用",
    "detail": "12月28日 · 6号线",
    "stations": [
      {
        "name": "梅林路",
        "lng": 117.248514,
        "lat": 39.043879
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "梅林路"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2021-x49",
    "year": 2021,
    "date": "2021-12-28",
    "title": "6号线二期开通",
    "detail": "12月28日 · 梅林路 — 咸水沽西",
    "line": "6号线二期",
    "color": "#9F216F",
    "stations": [
      {
        "name": "梅林路",
        "lng": 117.248514,
        "lat": 39.043879
      },
      {
        "name": "渌水道",
        "lng": 117.262751,
        "lat": 39.044384
      },
      {
        "name": "双港",
        "lng": 117.271292,
        "lat": 39.02933
      },
      {
        "name": "景荷道",
        "lng": 117.277795,
        "lat": 39.018994
      },
      {
        "name": "景荔道",
        "lng": 117.283327,
        "lat": 39.010434
      },
      {
        "name": "天津大学北洋园校区",
        "lng": 117.302218,
        "lat": 38.991699
      },
      {
        "name": "海河教育园区",
        "lng": 117.315789,
        "lat": 38.98796
      },
      {
        "name": "南开大学津南校区",
        "lng": 117.335108,
        "lat": 38.981775
      },
      {
        "name": "和慧南路",
        "lng": 117.353854,
        "lat": 38.980251
      },
      {
        "name": "咸水沽西",
        "lng": 117.367311,
        "lat": 38.97954
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2021-x50",
    "year": 2021,
    "date": "2021-12-28",
    "title": "4号线南段开通",
    "detail": "12月28日 · 东南角 — 新兴村",
    "line": "4号线",
    "color": "#1c7736",
    "stations": [
      {
        "name": "东南角",
        "lng": 117.183971,
        "lat": 39.135825
      },
      {
        "name": "金街",
        "lng": 117.185859,
        "lat": 39.130761
      },
      {
        "name": "和平路",
        "lng": 117.198356,
        "lat": 39.12587
      },
      {
        "name": "徐州道",
        "lng": 117.212217,
        "lat": 39.114442
      },
      {
        "name": "泰昌路",
        "lng": 117.250221,
        "lat": 39.121333
      },
      {
        "name": "六纬路",
        "lng": 117.221227,
        "lat": 39.114672
      },
      {
        "name": "成林道",
        "lng": 117.239354,
        "lat": 39.129307
      },
      {
        "name": "万东路",
        "lng": 117.261098,
        "lat": 39.118482
      },
      {
        "name": "登州南路",
        "lng": 117.299066,
        "lat": 39.115496
      },
      {
        "name": "跃进北路",
        "lng": 117.312413,
        "lat": 39.112954
      },
      {
        "name": "航双路",
        "lng": 117.327508,
        "lat": 39.110017
      },
      {
        "name": "民航大学",
        "lng": 117.342648,
        "lat": 39.107727
      },
      {
        "name": "新兴村",
        "lng": 117.363953,
        "lat": 39.100428
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2022-x51",
    "year": 2022,
    "date": "2022-11-18",
    "title": "10号线一期开通",
    "detail": "11月18日 · 于台 — 屿东城",
    "line": "10号线",
    "color": "#B9CF09",
    "stations": [
      {
        "name": "屿东城",
        "lng": 117.27353,
        "lat": 39.146194
      },
      {
        "name": "崂山道",
        "lng": 117.277276,
        "lat": 39.137681
      },
      {
        "name": "香山道",
        "lng": 117.280201,
        "lat": 39.130665
      },
      {
        "name": "万山道",
        "lng": 117.281305,
        "lat": 39.123739
      },
      {
        "name": "沙柳南路",
        "lng": 117.282597,
        "lat": 39.116375
      },
      {
        "name": "方山道",
        "lng": 117.283104,
        "lat": 39.10913
      },
      {
        "name": "金贸产业园",
        "lng": 117.281221,
        "lat": 39.101758
      },
      {
        "name": "龙涵道",
        "lng": 117.280745,
        "lat": 39.093462
      },
      {
        "name": "环宇道",
        "lng": 117.279528,
        "lat": 39.083317
      },
      {
        "name": "柳林路",
        "lng": 117.278469,
        "lat": 39.071193
      },
      {
        "name": "财经大学",
        "lng": 117.270624,
        "lat": 39.062972
      },
      {
        "name": "微山路",
        "lng": 117.253476,
        "lat": 39.061968
      },
      {
        "name": "玛钢厂",
        "lng": 117.246454,
        "lat": 39.061593
      },
      {
        "name": "春海路",
        "lng": 117.236794,
        "lat": 39.062007
      },
      {
        "name": "南珠桥",
        "lng": 117.221158,
        "lat": 39.062722
      },
      {
        "name": "友谊南路",
        "lng": 117.211246,
        "lat": 39.062835
      },
      {
        "name": "江湾二支路",
        "lng": 117.199574,
        "lat": 39.062813
      },
      {
        "name": "丽江道",
        "lng": 117.187864,
        "lat": 39.061761
      },
      {
        "name": "昌凌路",
        "lng": 117.178373,
        "lat": 39.055706
      },
      {
        "name": "瑶环路",
        "lng": 117.168614,
        "lat": 39.053692
      },
      {
        "name": "于台",
        "lng": 117.156201,
        "lat": 39.045446
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2023-x52",
    "year": 2023,
    "date": "2023-06-01",
    "title": "导轨电车停运拆除",
    "detail": "6月1日 · 设备检修暂停运行 · 后期拆除",
    "stations": [],
    "overview": false,
    "fitNetwork": false,
    "focus": {
      "lng": 117.689,
      "lat": 39.057,
      "zoom": 13
    },
    "retireSegIds": [
      "tj-tram"
    ],
    "retireHoldCam": true,
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2023-x53",
    "year": 2023,
    "date": "2023-07-31",
    "title": "洪泥河东站投入使用",
    "detail": "7月31日 · 1号线",
    "stations": [
      {
        "name": "洪泥河东",
        "lng": 117.338427,
        "lat": 39.046539
      }
    ],
    "overview": false,
    "fitNetwork": false,
    "openStations": [
      "洪泥河东"
    ],
    "addStations": [],
    "allowEmpty": true,
    "allowSingle": true,
    "planned": false
  },
  {
    "id": "tj-2023-x54",
    "year": 2023,
    "date": "2023-12-28",
    "title": "11号线一期东段开通",
    "detail": "12月28日 · 东丽六经路 — 东江道",
    "line": "11号线",
    "color": "#004998",
    "stations": [
      {
        "name": "东江道",
        "lng": 117.253677,
        "lat": 39.067328
      },
      {
        "name": "学苑北路",
        "lng": 117.265945,
        "lat": 39.073247
      },
      {
        "name": "海河东路",
        "lng": 117.270222,
        "lat": 39.081823
      },
      {
        "name": "环宇道",
        "lng": 117.279528,
        "lat": 39.083317
      },
      {
        "name": "雪莲南路",
        "lng": 117.293595,
        "lat": 39.081965
      },
      {
        "name": "招远路",
        "lng": 117.30436,
        "lat": 39.079903
      },
      {
        "name": "东丽文体中心",
        "lng": 117.322252,
        "lat": 39.077962
      },
      {
        "name": "驯海路",
        "lng": 117.332306,
        "lat": 39.075174
      },
      {
        "name": "东丽一经路",
        "lng": 117.343373,
        "lat": 39.07212
      },
      {
        "name": "东丽三经路",
        "lng": 117.351852,
        "lat": 39.069139
      },
      {
        "name": "东丽六经路",
        "lng": 117.367963,
        "lat": 39.064071
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2024-x55",
    "year": 2024,
    "date": "2024-07-01",
    "title": "1号线延伸段开通",
    "detail": "7月1日 · 洪泥河东方向延伸至双桥河",
    "line": "1号线",
    "color": "#BD0016",
    "stations": [
      {
        "name": "东沽路",
        "lng": 117.401846,
        "lat": 39.011301
      },
      {
        "name": "双桥河",
        "lng": 117.424766,
        "lat": 39.001714
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2024-x56",
    "year": 2024,
    "date": "2024-09-28",
    "title": "津静线首开段开通",
    "detail": "9月28日 · 京华东道 — 团泊医学园",
    "line": "津静线",
    "color": "#E4A8A3",
    "stations": [
      {
        "name": "京华东道",
        "lng": 117.15033,
        "lat": 39.030286
      },
      {
        "name": "精武",
        "lng": 117.118271,
        "lat": 39.020243
      },
      {
        "name": "团泊健康城",
        "lng": 117.080322,
        "lat": 38.973053
      },
      {
        "name": "团泊医学园",
        "lng": 117.073339,
        "lat": 38.94825
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2024-x57",
    "year": 2024,
    "date": "2024-09-28",
    "title": "京华东道站投入运营",
    "detail": "9月28日 · 5号线李七庄南 — 京华东道 · 与津静线同日开通",
    "line": "5号线",
    "color": "#FB6F14",
    "stations": [
      {
        "name": "京华东道",
        "lng": 117.15033,
        "lat": 39.030286
      },
      {
        "name": "李七庄南",
        "lng": 117.164316,
        "lat": 39.035404
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2024-x58",
    "year": 2024,
    "date": "2024-12-28",
    "title": "11号线一期西段开通",
    "detail": "12月28日 · 水上公园西路 — 东江道（不含）· 一期全线贯通",
    "line": "11号线",
    "color": "#004998",
    "stations": [
      {
        "name": "水上公园西路",
        "lng": 117.158241,
        "lat": 39.098733
      },
      {
        "name": "南开大学八里台",
        "lng": 117.172962,
        "lat": 39.101472
      },
      {
        "name": "吴家窑",
        "lng": 117.17982,
        "lat": 39.098741
      },
      {
        "name": "佟楼",
        "lng": 117.192088,
        "lat": 39.09873
      },
      {
        "name": "迎宾馆",
        "lng": 117.19681,
        "lat": 39.093194
      },
      {
        "name": "文化中心",
        "lng": 117.200565,
        "lat": 39.085144
      },
      {
        "name": "医大二院",
        "lng": 117.216663,
        "lat": 39.080399
      },
      {
        "name": "澧水道",
        "lng": 117.227251,
        "lat": 39.081652
      },
      {
        "name": "内江路",
        "lng": 117.239345,
        "lat": 39.074874
      },
      {
        "name": "陈塘",
        "lng": 117.243192,
        "lat": 39.069901
      },
      {
        "name": "东江道",
        "lng": 117.253677,
        "lat": 39.067328
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2025-x59",
    "year": 2025,
    "date": "2025-07-08",
    "title": "4号线北段开通",
    "detail": "7月8日 · 小街 — 西站 · 开通初期运营",
    "line": "4号线",
    "color": "#1c7736",
    "stations": [
      {
        "name": "小街",
        "lng": 117.091253,
        "lat": 39.304029
      },
      {
        "name": "郎园",
        "lng": 117.098335,
        "lat": 39.282662
      },
      {
        "name": "柴楼",
        "lng": 117.101373,
        "lat": 39.26993
      },
      {
        "name": "双街",
        "lng": 117.104251,
        "lat": 39.261588
      },
      {
        "name": "西赵庄",
        "lng": 117.109687,
        "lat": 39.251453
      },
      {
        "name": "延吉道",
        "lng": 117.117745,
        "lat": 39.231471
      },
      {
        "name": "北仓",
        "lng": 117.124088,
        "lat": 39.221393
      },
      {
        "name": "果园南道",
        "lng": 117.131866,
        "lat": 39.213206
      },
      {
        "name": "南仓",
        "lng": 117.137539,
        "lat": 39.206713
      },
      {
        "name": "天穆",
        "lng": 117.145122,
        "lat": 39.19761
      },
      {
        "name": "柳滩",
        "lng": 117.157866,
        "lat": 39.186896
      },
      {
        "name": "白庙",
        "lng": 117.165174,
        "lat": 39.182753
      },
      {
        "name": "北洋桥",
        "lng": 117.173292,
        "lat": 39.176615
      },
      {
        "name": "西沽公园",
        "lng": 117.164513,
        "lat": 39.171325
      },
      {
        "name": "同城商务区西于庄",
        "lng": 117.159731,
        "lat": 39.165394
      },
      {
        "name": "西站",
        "lng": 117.160419,
        "lat": 39.155866
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2025-x60",
    "year": 2025,
    "date": "2025-09-28",
    "title": "7号线南段开通",
    "detail": "9月28日 · 赛达路 — 鼓楼 · 一期南段开通初期运营",
    "line": "7号线",
    "color": "#b17833",
    "stations": [
      {
        "name": "鼓楼",
        "lng": 117.17489,
        "lat": 39.136055
      },
      {
        "name": "福安大街",
        "lng": 117.174268,
        "lat": 39.127917
      },
      {
        "name": "海光寺",
        "lng": 117.171191,
        "lat": 39.121279
      },
      {
        "name": "天津大学六里台",
        "lng": 117.173294,
        "lat": 39.11178
      },
      {
        "name": "南开大学八里台",
        "lng": 117.172962,
        "lat": 39.101472
      },
      {
        "name": "天塔",
        "lng": 117.17142,
        "lat": 39.094722
      },
      {
        "name": "肿瘤医院",
        "lng": 117.175714,
        "lat": 39.079078
      },
      {
        "name": "丽江道",
        "lng": 117.187864,
        "lat": 39.061761
      },
      {
        "name": "王兰庄",
        "lng": 117.188929,
        "lat": 39.049696
      },
      {
        "name": "梅江会展中心南",
        "lng": 117.199525,
        "lat": 39.035772
      },
      {
        "name": "张道口",
        "lng": 117.211749,
        "lat": 39.027871
      },
      {
        "name": "兴华道",
        "lng": 117.209947,
        "lat": 39.017947
      },
      {
        "name": "宏源道",
        "lng": 117.215738,
        "lat": 39.005962
      },
      {
        "name": "芦北路",
        "lng": 117.223127,
        "lat": 38.98942
      },
      {
        "name": "赛达路",
        "lng": 117.225727,
        "lat": 38.981219
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2026-x61",
    "year": 2026,
    "date": "2026-01-18",
    "title": "滨海新区Z4线一期北段开通",
    "detail": "1月18日 · 北塘 — 寨上 · 约 23.7 公里 · 10 座车站",
    "line": "Z4线",
    "color": "#B97CAF",
    "stations": [
      {
        "name": "寨上",
        "lng": 117.81163,
        "lat": 39.226301
      },
      {
        "name": "汉沽医院",
        "lng": 117.823948,
        "lat": 39.220382
      },
      {
        "name": "中心渔港",
        "lng": 117.844259,
        "lat": 39.20801
      },
      {
        "name": "玉砂道",
        "lng": 117.812201,
        "lat": 39.181971
      },
      {
        "name": "航母公园",
        "lng": 117.795772,
        "lat": 39.165639
      },
      {
        "name": "软件园",
        "lng": 117.785796,
        "lat": 39.149553
      },
      {
        "name": "绿创园",
        "lng": 117.772583,
        "lat": 39.134227
      },
      {
        "name": "和顺路",
        "lng": 117.756621,
        "lat": 39.117965
      },
      {
        "name": "中新生态城",
        "lng": 117.746174,
        "lat": 39.107344
      },
      {
        "name": "北塘",
        "lng": 117.719246,
        "lat": 39.092934
      }
    ],
    "planned": false
  },
  {
    "id": "tj-2028-osm63",
    "year": 2028,
    "title": "B1线在建开通",
    "detail": "在建 · B1线起点 — B1线终点 · 公开日期未定时按 2028 示意",
    "line": "B1线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "B1线起点",
        "lng": 117.6469013,
        "lat": 39.127759
      },
      {
        "name": "B1线终点",
        "lng": 117.6698157,
        "lat": 38.9362267
      }
    ],
    "planned": true
  },
  {
    "id": "tj-2028-osm64",
    "year": 2028,
    "title": "Z2线在建开通",
    "detail": "在建 · Z2线起点 — Z2线终点 · 公开日期未定时按 2028 示意",
    "line": "Z2线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "Z2线起点",
        "lng": 117.2363858,
        "lat": 39.1705613
      },
      {
        "name": "Z2线终点",
        "lng": 117.718856,
        "lat": 39.0927376
      }
    ],
    "planned": true
  },
  {
    "id": "tj-2028-osm65",
    "year": 2028,
    "title": "13号线在建开通",
    "detail": "在建 · 13号线起点 — 13号线终点 · 公开日期未定时按 2028 示意",
    "line": "13号线",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "13号线起点",
        "lng": 117.1565505,
        "lat": 39.1128284
      },
      {
        "name": "13号线终点",
        "lng": 117.1132474,
        "lat": 39.034551
      }
    ],
    "planned": true
  },
  {
    "id": "tj-2028-osm66",
    "year": 2028,
    "title": "津武线 通武廊市域铁路在建开通",
    "detail": "在建 · 津武线 通武廊市域铁路起点 — 津武线 通武廊市域铁路终点 · 公开日期未定时按 2028 示意",
    "line": "津武线 通武廊市域铁路",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "津武线 通武廊市域铁路起点",
        "lng": 117.1427884,
        "lat": 39.266934
      },
      {
        "name": "津武线 通武廊市域铁路终点",
        "lng": 117.0061988,
        "lat": 39.4178939
      }
    ],
    "planned": true
  },
  {
    "id": "tj-2028-osm67",
    "year": 2028,
    "title": "Z1线文化中心-天津市区段在建开通",
    "detail": "在建 · Z1线文化中心-天津市区段起点 — Z1线文化中心-天津市区段终点 · 公开日期未定时按 2028 示意",
    "line": "Z1线文化中心-天津市区段",
    "color": "#4a90d9",
    "stations": [
      {
        "name": "Z1线文化中心-天津市区段起点",
        "lng": 117.1944443,
        "lat": 39.0691735
      },
      {
        "name": "Z1线文化中心-天津市区段终点",
        "lng": 117.2838089,
        "lat": 39.0843868
      }
    ],
    "planned": true
  },
  {
    "id": "tj-2029-x62",
    "year": 2029,
    "title": "4号线中段（规划）",
    "detail": "在建 · 西站 — 东南角 · 贯通南北两段",
    "line": "4号线",
    "color": "#1c7736",
    "stations": [
      {
        "name": "西站",
        "lng": 117.160419,
        "lat": 39.155866
      },
      {
        "name": "东南角",
        "lng": 117.183971,
        "lat": 39.135825
      }
    ],
    "planned": true
  }
];

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const TIANJIN_SCENES = buildCityScenes({
  prefix: 'tj',
  openings: OPENINGS,
  finaleYear: 2035,
  finaleTitle: '天津地铁线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: {"lng":117.2,"lat":39.08},
});

export const TIANJIN_META = {
  id: 'tianjin',
  label: '天津地铁',
  blurb: '1976 起逐段开通 · 已手校',
};
