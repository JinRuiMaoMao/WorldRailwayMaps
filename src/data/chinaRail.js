/**
 * 中国干线铁路（1865—1911，非地铁 / 非高铁）
 * 做到 1910-10-01 九广英段通车前已开通的干支线；1911 津浦分段仍保留。
 * 日期按地方志、国铁史料核对（沪宁 1908、京汉 1906、京张 1909-09-24、滇越 1910-04-01）。
 * 长干线用枢纽站串联，走向贴近既有走廊，非工务测绘。
 */
import { PLACES } from './network.js';

const C = {
  exhibit: '#8A8070',
  wusong: '#6B4E31',
  songhu: '#7A5330',
  jingfeng: '#C45C26',
  taiwan: '#2E6B4F',
  daye: '#7A3E2A',
  jiaoji: '#1F6AA5',
  huning: '#3D6B4F',
  jinghan: '#B33B3B',
  jingzhang: '#4A6FA5',
  jinpu: '#6B3D7A',
  cer: '#2B4C7E',
  mantetsu: '#8B1E1E',
  anfeng: '#9A3B2F',
  xiling: '#6B5A3E',
  guangsan: '#C45C6A',
  zhuping: '#B8860B',
  chaoshan: '#C73E3A',
  xinning: '#2E7D4F',
  zhengtai: '#5B4B8A',
  daoqing: '#8B5A2B',
  huhang: '#1A6B5C',
  bianluo: '#A33B4A',
  dianyue: '#3D6B8A',
  zhangxia: '#4A6B5C',
  nanxun: '#6B3D3D',
  qiang: '#3A5A4A',
};

function S(name, lng, lat) {
  return { name, lng, lat };
}

function P(id, name) {
  const p = PLACES[id];
  return { name: name || p.name, lng: p.lng, lat: p.lat };
}

const PLACE_BY_CITY = {
  xuanwu: '北京',
  shanghai: '上海',
  jingfeng: '河北',
  taiwan: '台湾',
  daye: '湖北',
  jiaoji: '山东',
  yuehan: '湖南',
  cer: '黑龙江',
  guangsan: '广东',
  xiling: '河北',
  zhuping: '江西',
  anfeng: '辽宁',
  chaoshan: '广东',
  daoqing: '河南',
  zhengtai: '山西',
  xinning: '广东',
  huhang: '浙江',
  nanxun: '江西',
  qiang: '黑龙江',
  bianluo: '河南',
  dianyue: '云南',
  zhangxia: '福建',
  jinghan: '河南',
  jingzhang: '北京',
  huning: '江苏',
  jinpu: '山东',
};

function scene(partial) {
  return {
    kind: 'rail',
    eraLabel: partial.eraLabel || '铁路',
    focusPad: partial.focusPad ?? 0.22,
    ...partial,
    placeName: partial.placeName || partial.cityDot?.name || PLACE_BY_CITY[partial.cityId] || '',
    focusStations: partial.focusStations || partial.segments?.[0]?.stations,
  };
}

function grow(id, line, color, stations, extra = {}) {
  return { id, line, color, stations, ...extra };
}

function ext(id, line, color, from, to, extra = {}) {
  return grow(id, line, color, [{ ...from, silent: true }, ...to], extra);
}

function rename(fromLine, lineName, color) {
  return { fromLine, lineName, color };
}

/** 宣武门 */
const XUANWU = S('宣武门', 116.3742, 39.8994);
const EXHIBIT_PATH = [
  [39.8994, 116.372],
  [39.8994, 116.3766],
];

/** 吴淞 */
const ST_SHANGHAI = S('上海', 121.4825, 31.2477);
const ST_JIANGWAN = S('江湾', 121.47986, 31.30218);
const ST_WUSONG = S('吴淞', 121.5014, 31.37518);
const PATH_SH_JW = [
  [31.2477, 121.4825],
  [31.2532, 121.4814],
  [31.2588, 121.4804],
  [31.2654, 121.4796],
  [31.2728, 121.4791],
  [31.2806, 121.4788],
  [31.2884, 121.479],
  [31.2956, 121.4794],
  [31.30218, 121.47986],
];
const PATH_JW_WS = [
  [31.30218, 121.47986],
  [31.3104, 121.4812],
  [31.3188, 121.4834],
  [31.3276, 121.4862],
  [31.3368, 121.4892],
  [31.346, 121.4922],
  [31.3552, 121.4954],
  [31.3644, 121.4982],
  [31.37518, 121.5014],
];

/** 唐胥 / 关内外 / 京奉 */
const ST_TANGSHAN = S('唐山', 118.194, 39.6305);
const ST_XUGEZHUANG = S('胥各庄', 118.112, 39.565);
const ST_LUTAI = S('芦台', 117.738, 39.329);
const ST_TIANJIN = P('tianjin', '天津');
const ST_LUANXIAN = S('滦县', 118.704, 39.745);
const ST_SHANHAIGUAN = S('山海关', 119.776, 40.009);
const ST_SUIZHONG = S('中后所', 120.344, 40.325);
const ST_JINZHOU = P('jinzhou', '锦州');
const ST_XINMIN = S('新民', 122.829, 41.997);
const TANGSHAN_DOT = { id: 'tangshan', name: '唐山', lng: 118.194, lat: 39.6305 };

/** 台湾铁路（刘铭传） */
const ST_KEELUNG = S('基隆', 121.7393, 25.1283);
const ST_TAIPEI = P('taipei', '台北');
const ST_HSINCHU = S('新竹', 120.9675, 24.8039);
const TW_KT = [ST_KEELUNG, S('汐止', 121.661, 25.068), ST_TAIPEI];
const TW_TH = [S('桃园', 121.3, 24.989), S('中坜', 121.221, 24.954), S('竹北', 121.013, 24.84), ST_HSINCHU];

/** 大冶运矿 */
const ST_TIESHAN = S('铁山', 114.943, 30.083);
const ST_SHIHUIYAO = S('石灰窑', 115.077, 30.206);

/** 胶济 */
const ST_QINGDAO = P('qingdao', '青岛');
const ST_JIAOZHOU = S('胶州', 120.033, 36.265);
const ST_WEIXIAN = P('weifang', '潍县');
const ST_QINGZHOU = S('青州', 118.48, 36.685);
const ST_ZHOUCUN = S('周村', 117.87, 36.804);
const ST_JINAN = P('jinan', '济南');

/** 京汉（卢汉，1906 改京汉） */
const JINGHAN = [
  S('卢沟桥', 116.213, 39.849),
  S('保定', 115.465, 38.874),
  P('shijiazhuang', '石家庄'),
  P('handan', '邯郸'),
  P('anyang', '安阳'),
  P('xinxiang', '新乡'),
  P('zhengzhou', '郑州'),
  P('xuchang', '许昌'),
  P('luohe', '漯河'),
  P('zhumadian', '驻马店'),
  P('xinyang', '信阳'),
  P('xiaogan', '孝感'),
  S('汉口', 114.298, 30.619),
];

/** 沪宁 */
const HUNING = [
  P('shanghai', '上海'),
  P('suzhou', '苏州'),
  P('wuxi', '无锡'),
  P('changzhou', '常州'),
  P('zhenjiang', '镇江'),
  P('nanjing', '南京'),
];

/** 京张：丰台柳村 — 张家口，南口至青龙桥示意关沟 */
const JINGZHANG = [
  S('丰台柳村', 116.279, 39.849),
  S('清河', 116.314, 40.041),
  S('南口', 116.122, 40.237),
  S('青龙桥', 115.989, 40.354),
  S('康庄', 115.893, 40.378),
  S('怀来', 115.517, 40.415),
  S('宣化', 115.033, 40.609),
  S('张家口', 114.884, 40.811),
];

/** 津浦 1911 分段（黄河大桥 1912 才合龙，不称全线） */
const JINPU = [
  ST_TIANJIN,
  P('cangzhou', '沧州'),
  P('dezhou', '德州'),
  ST_JINAN,
  P('taian', '泰安'),
  S('兖州', 116.784, 35.553),
  P('xuzhou', '徐州'),
  P('suzhouah', '宿州'),
  P('bengbu', '蚌埠'),
  P('chuzhou', '滁州'),
  S('浦口', 118.728, 32.143),
];

const ST_PAOTAIWAN = S('炮台湾', 121.508, 31.394);
const PATH_WS_PT = [
  [31.37518, 121.5014],
  [31.3842, 121.5046],
  [31.394, 121.508],
];
const SONGHU = [
  ST_SHANGHAI,
  ST_JIANGWAN,
  S('张华浜', 121.498, 31.363),
  S('蕰藻浜', 121.5004, 31.372),
  ST_PAOTAIWAN,
];
const PATH_SONGHU = [...PATH_SH_JW, ...PATH_JW_WS.slice(1), ...PATH_WS_PT.slice(1)];

/** 东省铁路 T 字：满洲里—绥芬河 + 哈尔滨—旅顺 */
const ST_MANZHOULI = S('满洲里', 117.3789, 49.5978);
const ST_HARBIN = P('harbin', '哈尔滨');
const ST_SUIFENHE = S('绥芬河', 131.1526, 44.4124);
const ST_LUSHUN = S('旅顺', 121.237, 38.851);
const CER_WEST = [
  ST_MANZHOULI,
  S('海拉尔', 119.764, 49.213),
  S('牙克石', 120.729, 49.287),
  S('博克图', 121.92, 48.77),
  S('扎兰屯', 122.737, 48.013),
  S('昂昂溪', 123.813, 47.156),
  S('大庆', 125.104, 46.589),
  ST_HARBIN,
];
const CER_EAST = [
  S('阿城', 126.958, 45.545),
  S('尚志', 127.962, 45.214),
  S('牡丹江', 129.633, 44.552),
  ST_SUIFENHE,
];
const CER_SOUTH = [
  P('changchun', '宽城子'),
  P('siping', '四平'),
  S('开原', 124.038, 42.546),
  P('shenyang', '奉天'),
  S('辽阳', 123.172, 41.27),
  P('anshanProxy', '鞍山'),
  S('大石桥', 122.509, 40.646),
  S('瓦房店', 121.98, 39.627),
  P('dalian', '大连'),
  ST_LUSHUN,
];

const ST_GAOBEIDIAN = S('高碑店', 115.874, 39.327);
const ST_LIANGGEZHUANG = S('梁各庄', 115.397, 39.388);

const ST_SHIWEITANG = S('石围塘', 113.232, 23.116);
const ST_SANSHUI = S('三水', 112.897, 23.166);

const ST_PINGXIANG = P('pingxiang', '萍乡');
const ST_LILING = S('醴陵', 113.497, 27.646);
const ST_ZHUZHOU = P('zhuzhou', '株洲');

const ST_ANTONG = S('安东', 124.383, 40.124);
const ST_SUJIATUN = S('苏家屯', 123.344, 41.667);

const ST_SHENYANG = P('shenyang', '奉天');

const ST_SHANTOU = P('shantouProxy', '汕头');
const ST_CHAOZHOU = P('chaozhouProxy', '潮州');

const ST_GONGYI = S('公益', 112.834, 22.478);
const ST_NINGCHENG = S('宁城', 112.794, 22.252);
const ST_DOUSHAN = S('斗山', 112.884, 22.104);

const ZHENGTAI = [
  P('shijiazhuang', '石家庄'),
  S('井陉', 114.145, 38.032),
  S('阳泉', 113.5804, 37.8567),
  S('寿阳', 113.176, 37.895),
  S('榆次', 112.708, 37.698),
  P('taiyuan', '太原'),
];

const DAOQING = [
  S('道口', 114.548, 35.575),
  S('汲县', 114.065, 35.398),
  P('xinxiang', '新乡'),
  S('修武', 113.448, 35.222),
  P('jiaozuoProxy', '焦作'),
  S('清化', 113.064, 35.252),
];

const TW_TRUNK = [
  S('竹南', 120.881, 24.683),
  S('苗栗', 120.819, 24.56),
  P('taichung', '台中'),
  S('彰化', 120.542, 24.076),
  S('嘉义', 120.449, 23.48),
  S('台南', 120.213, 22.999),
  P('kaohsiung', '高雄'),
];

const ST_SUZHOU = P('suzhou', '苏州');
const HUHANG = [
  S('上海南站', 121.43, 31.154),
  S('松江', 121.227, 31.032),
  P('jiaxingProxy', '嘉兴'),
  S('杭州闸口', 120.143, 30.208),
];

const BIANLUO = [
  P('kaifengProxy', '开封'),
  P('zhengzhou', '郑州'),
  S('巩县', 113.022, 34.752),
  P('luoyang', '洛阳'),
];

const DIANYUE = [
  S('河口', 103.939, 22.507),
  S('腊哈地', 103.88, 22.78),
  S('人字桥', 103.68, 23.21),
  S('碧色寨', 103.396, 23.365),
  S('开远', 103.267, 23.71),
  S('盘溪', 103.05, 24.18),
  S('宜良', 103.146, 24.92),
  P('kunming', '昆明'),
];

export const CHINA_RAIL_SCENES = [
  scene({
    id: 'cn-exhibit-1865',
    year: 1865,
    title: '北京展览铁路',
    detail: '秋 · 宣武门外 · 约 500 米 · 英商杜兰德演示 · 并非营业铁路',
    eraLabel: '展览铁路',
    cityId: 'xuanwu',
    cityDot: PLACES.beijing,
    segments: [
      grow('cn-exhibit-a', '展览铁路', C.exhibit, [XUANWU, S('宣武门外', 116.3766, 39.8994)], {
        path: EXHIBIT_PATH,
      }),
    ],
  }),
  scene({
    id: 'cn-exhibit-1865-close',
    year: 1865,
    title: '展览铁路拆除',
    detail: '步军统领衙门饬令拆卸 · 京师展示铁路夭折',
    eraLabel: '展览铁路',
    cityId: 'xuanwu',
    milestone: true,
    retireHoldCam: true,
    retireSegIds: ['cn-exhibit-a'],
    focusStations: [XUANWU],
    segments: [],
  }),

  scene({
    id: 'cn-wusong-1876-jw',
    year: 1876,
    date: '1876-07-03',
    title: '吴淞铁路通车',
    detail: '7月3日 · 上海 — 江湾 · 中国第一条营业铁路 · 762 mm 窄轨 · 英商怡和洋行擅筑',
    eraLabel: '吴淞铁路',
    cityId: 'shanghai',
    cityDot: PLACES.shanghai,
    segments: [grow('cn-wusong-a', '吴淞铁路', C.wusong, [ST_SHANGHAI, ST_JIANGWAN], { path: PATH_SH_JW })],
  }),
  scene({
    id: 'cn-wusong-1876-full',
    year: 1876,
    date: '1876-12-01',
    title: '吴淞铁路全线通车',
    detail: '12月1日 · 江湾 — 吴淞 · 上海至吴淞 14.5 km · 全程约 30 分钟',
    eraLabel: '吴淞铁路',
    cityId: 'shanghai',
    segments: [
      ext('cn-wusong-b', '吴淞铁路', C.wusong, ST_JIANGWAN, [ST_WUSONG], { path: PATH_JW_WS }),
    ],
  }),
  scene({
    id: 'cn-wusong-1877-close',
    year: 1877,
    date: '1877-10-20',
    title: '吴淞铁路收回拆除',
    detail: '10月20日 · 赎银交讫后末班车 · 移交中国并下令拆除 · 12月18日路轨拆尽',
    eraLabel: '吴淞铁路',
    cityId: 'shanghai',
    milestone: true,
    retireHoldCam: true,
    retireSegIds: ['cn-wusong-a', 'cn-wusong-b'],
    focusStations: [ST_SHANGHAI, ST_JIANGWAN, ST_WUSONG],
    segments: [],
  }),

  scene({
    id: 'cn-tangxu-1881',
    year: 1881,
    date: '1881-11-08',
    title: '唐胥铁路通车',
    detail: '11月8日 · 唐山 — 胥各庄 · 约 9.3 km · 中国自建首条准轨运煤铁路 · 初期骡马牵引',
    eraLabel: '唐胥铁路',
    cityId: 'jingfeng',
    cityDot: TANGSHAN_DOT,
    segments: [grow('cn-tangxu-a', '唐胥铁路', C.jingfeng, [ST_TANGSHAN, ST_XUGEZHUANG], { osmKey: '津山线' })],
  }),
  scene({
    id: 'cn-tanglu-1887',
    year: 1887,
    title: '唐芦铁路延伸',
    detail: '胥各庄 — 芦台 · 唐胥西延 · 开平铁路公司展筑',
    eraLabel: '唐芦铁路',
    cityId: 'jingfeng',
    recolor: rename('唐胥铁路', '唐芦铁路', C.jingfeng),
    segments: [ext('cn-tangxu-b', '唐芦铁路', C.jingfeng, ST_XUGEZHUANG, [ST_LUTAI], { osmKey: '津山线' })],
  }),
  scene({
    id: 'cn-tangjin-1888',
    year: 1888,
    title: '唐津铁路通车',
    detail: '光绪十四年九月 · 芦台 — 天津 · 全线约 130 km · 改称唐津 / 津沽铁路',
    eraLabel: '唐津铁路',
    cityId: 'jingfeng',
    recolor: rename(['唐胥铁路', '唐芦铁路'], '唐津铁路', C.jingfeng),
    segments: [ext('cn-tangxu-c', '唐津铁路', C.jingfeng, ST_LUTAI, [ST_TIANJIN], { osmKey: '津山线' })],
  }),

  scene({
    id: 'cn-taiwan-1891',
    year: 1891,
    title: '台湾铁路基隆—台北通车',
    detail: '光绪十七年 · 基隆 — 台北 · 28.6 km · 刘铭传主持',
    eraLabel: '台湾铁路',
    cityId: 'taiwan',
    cityDot: PLACES.taipei,
    segments: [grow('cn-taiwan-a', '台湾铁路', C.taiwan, TW_KT)],
  }),
  scene({
    id: 'cn-taiwan-1893',
    year: 1893,
    title: '台湾铁路延伸至新竹',
    detail: '光绪十九年 · 台北 — 新竹 · 78.1 km · 基隆至新竹共 106.7 km',
    eraLabel: '台湾铁路',
    cityId: 'taiwan',
    segments: [ext('cn-taiwan-b', '台湾铁路', C.taiwan, ST_TAIPEI, TW_TH)],
  }),

  scene({
    id: 'cn-jinyu-1893',
    year: 1893,
    title: '津榆铁路通至山海关',
    detail: '唐山以东展筑 · 滦县 — 山海关 · 津榆铁路连通海口',
    eraLabel: '津榆铁路',
    cityId: 'jingfeng',
    recolor: rename(['唐津铁路', '唐芦铁路', '唐胥铁路'], '津榆铁路', C.jingfeng),
    segments: [ext('cn-tangxu-d', '津榆铁路', C.jingfeng, ST_TANGSHAN, [ST_LUANXIAN, ST_SHANHAIGUAN], { osmKey: '津山线' })],
  }),
  scene({
    id: 'cn-jinyu-1894',
    year: 1894,
    title: '关东铁路出关',
    detail: '山海关 — 中后所（今绥中） · 甲午战争前关内外铁路向东北延伸',
    eraLabel: '关东铁路',
    cityId: 'jingfeng',
    segments: [ext('cn-tangxu-e', '津榆铁路', C.jingfeng, ST_SHANHAIGUAN, [ST_SUIZHONG], { osmKey: '沈山线' })],
  }),
  scene({
    id: 'cn-daye-1894',
    year: 1894,
    title: '大冶铁路建成',
    detail: '铁山 — 石灰窑 · 约 28 km · 汉阳铁厂运矿铁路',
    eraLabel: '大冶铁路',
    cityId: 'daye',
    segments: [grow('cn-daye-a', '大冶铁路', C.daye, [ST_TIESHAN, ST_SHIHUIYAO])],
  }),

  scene({
    id: 'cn-jinlu-1897',
    year: 1897,
    title: '津芦铁路通车',
    detail: '天津 — 马家堡 · 京师接入唐津 / 津榆系统',
    eraLabel: '津芦铁路',
    cityId: 'jingfeng',
    segments: [
      ext(
        'cn-tangxu-jinlu',
        '津榆铁路',
        C.jingfeng,
        ST_TIANJIN,
        [S('杨村', 117.05, 39.38), S('廊坊', 116.704, 39.523), S('黄村', 116.338, 39.729), S('马家堡', 116.366, 39.856)],
        { osmKey: '京沪线' }
      ),
    ],
  }),
  scene({
    id: 'cn-guanneiwai-1897',
    year: 1897,
    title: '关内外铁路定名',
    detail: '津芦并入津榆 · 改称关内外铁路 · 华北与关外连成一气',
    eraLabel: '关内外铁路',
    cityId: 'jingfeng',
    milestone: true,
    recolor: rename(['津榆铁路', '唐津铁路'], '关内外铁路', C.jingfeng),
    highlightFromLine: '津榆铁路',
    focusStations: [ST_TIANJIN, ST_TANGSHAN, ST_SHANHAIGUAN],
    segments: [],
  }),

  scene({
    id: 'cn-jiaoji-1898',
    year: 1898,
    title: '胶济铁路筹建',
    detail: '《胶澳租界条约》后取得路权 · 翌年 9 月 23 日自青岛动工',
    eraLabel: '胶济铁路',
    cityId: 'jiaoji',
    milestone: true,
    cityDot: PLACES.qingdao,
    focusStations: [ST_QINGDAO, ST_JINAN],
    segments: [],
  }),
  scene({
    id: 'cn-cer-1898',
    year: 1898,
    title: '东省铁路开工',
    detail: '夏 · 满洲里 — 哈尔滨 — 绥芬河干线与哈尔滨 — 旅顺南满支线同时动工 · 俄轨 1524 mm',
    eraLabel: '东省铁路',
    cityId: 'cer',
    milestone: true,
    cityDot: PLACES.harbin,
    focusStations: [ST_MANZHOULI, ST_SUIFENHE, ST_LUSHUN],
    focusPad: 0.35,
    segments: [],
  }),
  scene({
    id: 'cn-songhu-1898',
    year: 1898,
    date: '1898-09-01',
    title: '淞沪铁路通车',
    detail: '9月1日 · 上海 — 江湾 — 炮台湾 · 16.09 km · 循吴淞旧路基重建 · 准轨营业',
    eraLabel: '淞沪铁路',
    cityId: 'shanghai',
    cityDot: PLACES.shanghai,
    segments: [grow('cn-songhu-a', '淞沪铁路', C.songhu, SONGHU, { path: PATH_SONGHU })],
  }),
  scene({
    id: 'cn-yuehan-1898',
    year: 1898,
    title: '粤汉铁路筹建',
    detail: '南北干线规划推进 · 本期内未建成（全线 1936）',
    eraLabel: '粤汉铁路',
    cityId: 'yuehan',
    milestone: true,
    focus: { lng: 113.2, lat: 26.8, zoom: 5.8 },
    segments: [],
  }),

  scene({
    id: 'cn-jiaoji-1902',
    year: 1902,
    date: '1902-06-01',
    title: '胶济铁路通车至潍县',
    detail: '6月1日 · 青岛 — 胶州 — 潍县 · 分段投入运输',
    eraLabel: '胶济铁路',
    cityId: 'jiaoji',
    segments: [grow('cn-jiaoji-a', '胶济铁路', C.jiaoji, [ST_QINGDAO, ST_JIAOZHOU, ST_WEIXIAN])],
  }),

  scene({
    id: 'cn-xiling-1903',
    year: 1903,
    date: '1903-04-01',
    title: '西陵铁路通车',
    detail: '高碑店 — 易县梁各庄 · 约 42 km · 谒西陵专用铁路',
    eraLabel: '西陵铁路',
    cityId: 'xiling',
    cityDot: { id: 'gaobeidian', name: '高碑店', lng: 115.874, lat: 39.327 },
    segments: [grow('cn-xiling-a', '西陵铁路', C.xiling, [ST_GAOBEIDIAN, S('易县', 115.501, 39.353), ST_LIANGGEZHUANG])],
  }),
  scene({
    id: 'cn-zhuping-1903',
    year: 1903,
    date: '1903-07-01',
    title: '株萍铁路萍醴段通车',
    detail: '7月1日 · 萍乡 — 醴陵 · 安源煤运 · 后展至株洲接粤汉',
    eraLabel: '株萍铁路',
    cityId: 'zhuping',
    cityDot: ST_PINGXIANG,
    segments: [grow('cn-zhuping-a', '株萍铁路', C.zhuping, [ST_PINGXIANG, ST_LILING])],
  }),
  scene({
    id: 'cn-cer-1903',
    year: 1903,
    date: '1903-07-14',
    title: '东省铁路全线通车',
    detail: '7月14日 · 满洲里 — 哈尔滨 — 绥芬河 · 哈尔滨 — 旅顺南满支线 · T 字形约 2500 km',
    eraLabel: '东省铁路',
    cityId: 'cer',
    cityDot: PLACES.harbin,
    focusPad: 0.32,
    focusStations: [ST_MANZHOULI, ST_SUIFENHE, ST_LUSHUN],
    segments: [
      grow('cn-cer-w', '东省铁路', C.cer, CER_WEST, { osmKey: '滨洲线' }),
      ext('cn-cer-e', '东省铁路', C.cer, ST_HARBIN, CER_EAST, { osmKey: '滨绥线' }),
      ext('cn-cer-s', '南满支线', C.cer, ST_HARBIN, CER_SOUTH, { osmKey: '哈大线' }),
    ],
  }),
  scene({
    id: 'cn-guangsan-1903',
    year: 1903,
    date: '1903-10-05',
    title: '广三铁路通车',
    detail: '10月5日 · 广州石围塘 — 佛山 — 三水 · 48.9 km · 粤汉支线先成',
    eraLabel: '广三铁路',
    cityId: 'guangsan',
    cityDot: PLACES.guangzhou,
    segments: [grow('cn-guangsan-a', '广三铁路', C.guangsan, [ST_SHIWEITANG, P('foshan', '佛山'), ST_SANSHUI])],
  }),
  scene({
    id: 'cn-jingfeng-1903',
    year: 1903,
    title: '关内外铁路通至新民',
    detail: '中后所以东展筑 · 锦州 — 新民 · 逼近奉天',
    eraLabel: '关内外铁路',
    cityId: 'jingfeng',
    segments: [ext('cn-tangxu-f', '关内外铁路', C.jingfeng, ST_SUIZHONG, [ST_JINZHOU, ST_XINMIN], { osmKey: '沈山线' })],
  }),
  scene({
    id: 'cn-jiaoji-1904',
    year: 1904,
    date: '1904-06-01',
    title: '胶济铁路全线通车',
    detail: '6月1日 · 潍县 — 青州 — 周村 — 济南 · 干线及张博等支线竣工',
    eraLabel: '胶济铁路',
    cityId: 'jiaoji',
    segments: [ext('cn-jiaoji-b', '胶济铁路', C.jiaoji, ST_WEIXIAN, [ST_QINGZHOU, ST_ZHOUCUN, ST_JINAN])],
  }),
  scene({
    id: 'cn-songhu-1904',
    year: 1904,
    title: '淞沪铁路改称支线',
    detail: '并入沪宁铁路管理 · 改称淞沪支线',
    eraLabel: '淞沪支线',
    cityId: 'shanghai',
    milestone: true,
    recolor: rename('淞沪铁路', '淞沪支线', C.huning),
    highlightFromLine: '淞沪铁路',
    focusStations: [ST_SHANGHAI, ST_PAOTAIWAN],
    segments: [],
  }),

  scene({
    id: 'cn-huning-1905',
    year: 1905,
    date: '1905-04-25',
    title: '沪宁铁路开工',
    detail: '4月25日 · 上海 — 南京 · 英国借款修建',
    eraLabel: '沪宁铁路',
    cityId: 'huning',
    milestone: true,
    cityDot: PLACES.shanghai,
    focusStations: HUNING,
    segments: [],
  }),
  scene({
    id: 'cn-anfeng-1905',
    year: 1905,
    title: '安奉铁路通车',
    detail: '安东 — 苏家屯 · 约 261 km · 日俄战争期间日军强筑轻便铁路',
    eraLabel: '安奉铁路',
    cityId: 'anfeng',
    cityDot: { id: 'andong', name: '安东', lng: 124.383, lat: 40.124 },
    segments: [
      grow('cn-anfeng-a', '安奉铁路', C.anfeng, [
        ST_ANTONG,
        S('凤凰城', 124.067, 40.452),
        S('本溪', 123.685, 41.297),
        ST_SUJIATUN,
      ]),
    ],
  }),
  scene({
    id: 'cn-xinfeng-1905',
    year: 1905,
    title: '新奉铁路通车',
    detail: '新民 — 奉天 · 日军军用轻便铁路 · 后由清政府收回改准轨',
    eraLabel: '新奉铁路',
    cityId: 'jingfeng',
    segments: [grow('cn-xinfeng-a', '新奉铁路', C.jingfeng, [ST_XINMIN, ST_SHENYANG], { osmKey: '沈山线' })],
  }),
  scene({
    id: 'cn-jingzhang-1905',
    year: 1905,
    date: '1905-10-02',
    title: '京张铁路开工',
    detail: '10月2日 · 丰台柳村开工 · 詹天佑主持勘测设计',
    eraLabel: '京张铁路',
    cityId: 'jingzhang',
    milestone: true,
    cityDot: PLACES.beijing,
    focusStations: [JINGZHANG[0], JINGZHANG[JINGZHANG.length - 1]],
    segments: [],
  }),
  scene({
    id: 'cn-zhuping-1905',
    year: 1905,
    title: '株萍铁路通至株洲',
    detail: '醴陵 — 株洲 · 安源至株洲运煤走廊接通',
    eraLabel: '株萍铁路',
    cityId: 'zhuping',
    segments: [ext('cn-zhuping-b', '株萍铁路', C.zhuping, ST_LILING, [ST_ZHUZHOU])],
  }),

  scene({
    id: 'cn-jinghan-1906',
    year: 1906,
    date: '1906-04-01',
    title: '京汉铁路全线通车',
    detail: '4月1日 · 卢沟桥 — 汉口 · 芦汉改称京汉 · 南北干线贯通',
    eraLabel: '京汉铁路',
    cityId: 'jinghan',
    cityDot: PLACES.beijing,
    segments: [grow('cn-jinghan-a', '京汉铁路', C.jinghan, JINGHAN)],
  }),
  scene({
    id: 'cn-huning-1906',
    year: 1906,
    date: '1906-05-01',
    title: '沪宁铁路沪苏段通车',
    detail: '五月 · 上海 — 苏州 · 沪宁分段先行营业',
    eraLabel: '沪宁铁路',
    cityId: 'huning',
    segments: [grow('cn-huning-a', '沪宁铁路', C.huning, [P('shanghai', '上海'), ST_SUZHOU])],
  }),
  scene({
    id: 'cn-mantetsu-1906',
    year: 1906,
    date: '1906-11-26',
    title: '南满铁路定名',
    detail: '日俄战后日本接收长春以南 · 南满洲铁道株式会社成立 · 南满支线改称南满铁路',
    eraLabel: '南满铁路',
    cityId: 'cer',
    milestone: true,
    recolor: rename('南满支线', '南满铁路', C.mantetsu),
    highlightFromLine: '南满支线',
    focusStations: [P('changchun', '宽城子'), P('dalian', '大连'), ST_LUSHUN],
    segments: [],
  }),
  scene({
    id: 'cn-chaoshan-1906',
    year: 1906,
    date: '1906-11-16',
    title: '潮汕铁路通车',
    detail: '11月16日 · 汕头 — 潮州 · 39 km · 中国第一条商办铁路',
    eraLabel: '潮汕铁路',
    cityId: 'chaoshan',
    cityDot: ST_SHANTOU,
    segments: [grow('cn-chaoshan-a', '潮汕铁路', C.chaoshan, [ST_SHANTOU, S('庵埠', 116.65, 23.46), ST_CHAOZHOU])],
  }),

  scene({
    id: 'cn-daoqing-1907',
    year: 1907,
    date: '1907-03-03',
    title: '道清铁路通车',
    detail: '3月3日 · 道口 — 新乡 — 焦作 — 清化 · 约 150 km · 福公司运煤铁路',
    eraLabel: '道清铁路',
    cityId: 'daoqing',
    cityDot: P('jiaozuoProxy', '焦作'),
    segments: [grow('cn-daoqing-a', '道清铁路', C.daoqing, DAOQING)],
  }),
  scene({
    id: 'cn-jingfeng-1907',
    year: 1907,
    title: '京奉铁路定名',
    detail: '接收新奉铁路并改准轨 · 关内外铁路正式定名京奉铁路 · 通至奉天',
    eraLabel: '京奉铁路',
    cityId: 'jingfeng',
    milestone: true,
    recolor: rename(['关内外铁路', '津榆铁路', '新奉铁路'], '京奉铁路', C.jingfeng),
    highlightFromLine: '关内外铁路',
    focusStations: [P('beijing', '北京'), ST_TIANJIN, ST_SHANHAIGUAN, ST_SHENYANG],
    segments: [],
  }),
  scene({
    id: 'cn-zhengtai-1907',
    year: 1907,
    date: '1907-10-15',
    title: '正太铁路通车',
    detail: '10月15日 · 石家庄 — 阳泉 — 太原 · 约 243 km · 米轨',
    eraLabel: '正太铁路',
    cityId: 'zhengtai',
    cityDot: PLACES.taiyuan,
    segments: [grow('cn-zhengtai-a', '正太铁路', C.zhengtai, ZHENGTAI)],
  }),

  scene({
    id: 'cn-xinning-1908',
    year: 1908,
    date: '1908-01-06',
    title: '新宁铁路通车',
    detail: '1月6日 · 宁城 — 公益 · 华侨陈宜禧商办 · 中国第二条商办铁路',
    eraLabel: '新宁铁路',
    cityId: 'xinning',
    cityDot: { id: 'taicheng', name: '宁城', lng: 112.794, lat: 22.252 },
    segments: [grow('cn-xinning-a', '新宁铁路', C.xinning, [ST_NINGCHENG, S('水步', 112.81, 22.35), ST_GONGYI])],
  }),
  scene({
    id: 'cn-huning-1908',
    year: 1908,
    date: '1908-04-01',
    title: '沪宁铁路全线通车',
    detail: '4月1日 · 苏州 — 无锡 — 常州 — 镇江 — 南京 · 沪宁干线 311 km 全线（总表 1906 年不确）',
    eraLabel: '沪宁铁路',
    cityId: 'huning',
    segments: [
      ext('cn-huning-b', '沪宁铁路', C.huning, ST_SUZHOU, [
        P('wuxi', '无锡'),
        P('changzhou', '常州'),
        P('zhenjiang', '镇江'),
        P('nanjing', '南京'),
      ]),
    ],
  }),
  scene({
    id: 'cn-jinpu-1908',
    year: 1908,
    date: '1908-07-01',
    title: '津浦铁路北段开工',
    detail: '7月 · 天津举行开工典礼 · 北段德办 · 南段英办',
    eraLabel: '津浦铁路',
    cityId: 'jinpu',
    milestone: true,
    cityDot: PLACES.tianjin,
    focusStations: [ST_TIANJIN, S('浦口', 118.728, 32.143)],
    segments: [],
  }),
  scene({
    id: 'cn-taiwan-1908',
    year: 1908,
    date: '1908-10-24',
    title: '台湾纵贯线通车',
    detail: '10月24日 · 新竹 — 台中 — 嘉义 — 台南 — 高雄 · 基隆至高雄纵贯全线',
    eraLabel: '纵贯铁路',
    cityId: 'taiwan',
    recolor: rename('台湾铁路', '纵贯铁路', C.taiwan),
    segments: [ext('cn-taiwan-c', '纵贯铁路', C.taiwan, ST_HSINCHU, TW_TRUNK)],
  }),

  scene({
    id: 'cn-jinpu-1909',
    year: 1909,
    date: '1909-01-01',
    title: '津浦铁路南段开工',
    detail: '1月 · 浦口开工 · 本年内分段施工，全线 1912 年黄河大桥合龙后才贯通',
    eraLabel: '津浦铁路',
    cityId: 'jinpu',
    milestone: true,
    focusStations: [S('浦口', 118.728, 32.143), P('bengbu', '蚌埠')],
    segments: [],
  }),
  scene({
    id: 'cn-xinning-1909',
    year: 1909,
    date: '1909-03-22',
    title: '新宁铁路延伸至斗山',
    detail: '3月22日 · 宁城 — 斗山 · 公益至斗山第一期完工',
    eraLabel: '新宁铁路',
    cityId: 'xinning',
    segments: [ext('cn-xinning-b', '新宁铁路', C.xinning, ST_NINGCHENG, [ST_DOUSHAN])],
  }),
  scene({
    id: 'cn-huhang-1909',
    year: 1909,
    date: '1909-08-13',
    title: '沪杭铁路通车',
    detail: '8月13日 · 上海南站 — 嘉兴 — 杭州闸口 · 苏浙商办接轨',
    eraLabel: '沪杭铁路',
    cityId: 'huhang',
    cityDot: PLACES.hangzhou,
    segments: [grow('cn-huhang-a', '沪杭铁路', C.huhang, HUHANG)],
  }),
  scene({
    id: 'cn-jingzhang-1909',
    year: 1909,
    date: '1909-09-24',
    title: '京张铁路通车',
    detail: '9月24日 · 丰台柳村 — 张家口 · 中国人自主设计施工的第一条干线',
    eraLabel: '京张铁路',
    cityId: 'jingzhang',
    segments: [grow('cn-jingzhang-a', '京张铁路', C.jingzhang, JINGZHANG)],
  }),
  scene({
    id: 'cn-nanxun-1909',
    year: 1909,
    title: '南浔铁路通至德安',
    detail: '九江 — 德安 · 约 50 km · 商办江西铁路先通此段 · 全线 1916 年至南昌',
    eraLabel: '南浔铁路',
    cityId: 'nanxun',
    cityDot: P('jiujiangProxy', '九江'),
    segments: [grow('cn-nanxun-a', '南浔铁路', C.nanxun, [P('jiujiangProxy', '九江'), S('德安', 115.756, 29.316)])],
  }),
  scene({
    id: 'cn-qiang-1909',
    year: 1909,
    title: '齐昂铁路通车',
    detail: '齐齐哈尔 — 昂昂溪 · 约 22 km · 黑龙江商办窄轨 · 接东省铁路',
    eraLabel: '齐昂铁路',
    cityId: 'qiang',
    cityDot: { id: 'qiqihar', name: '齐齐哈尔', lng: 123.918, lat: 47.354 },
    segments: [grow('cn-qiang-a', '齐昂铁路', C.qiang, [S('齐齐哈尔', 123.918, 47.354), S('昂昂溪', 123.813, 47.156)])],
  }),
  scene({
    id: 'cn-bianluo-1909',
    year: 1909,
    date: '1909-12-01',
    title: '汴洛铁路竣工',
    detail: '12月 · 开封 — 郑州 — 洛阳 · 京汉支路 · 比国借款',
    eraLabel: '汴洛铁路',
    cityId: 'bianluo',
    cityDot: PLACES.zhengzhou,
    segments: [grow('cn-bianluo-a', '汴洛铁路', C.bianluo, BIANLUO)],
  }),

  scene({
    id: 'cn-dianyue-1910',
    year: 1910,
    date: '1910-04-01',
    title: '滇越铁路通车',
    detail: '4月1日 · 河口 — 碧色寨 — 开远 — 昆明 · 滇段 465 km · 海防至昆明全线营业',
    eraLabel: '滇越铁路',
    cityId: 'dianyue',
    cityDot: PLACES.kunming,
    segments: [grow('cn-dianyue-a', '滇越铁路', C.dianyue, DIANYUE)],
  }),
  scene({
    id: 'cn-zhangxia-1910',
    year: 1910,
    date: '1910-05-01',
    title: '漳厦铁路通至江东桥',
    detail: '5月 · 嵩屿 — 江东桥 · 28 km · 商办未竟至漳州',
    eraLabel: '漳厦铁路',
    cityId: 'zhangxia',
    cityDot: PLACES.xiamen,
    segments: [
      grow('cn-zhangxia-a', '漳厦铁路', C.zhangxia, [
        S('嵩屿', 118.033, 24.458),
        S('江东桥', 117.748, 24.518),
      ]),
    ],
  }),

  scene({
    id: 'cn-jinpu-1911',
    year: 1911,
    title: '津浦铁路分段通车',
    detail: '秋 · 南北段铺轨在韩庄接轨 · 黄河大桥未完 · 尚非全线运营',
    eraLabel: '津浦铁路',
    cityId: 'jinpu',
    segments: [grow('cn-jinpu-a', '津浦铁路', C.jinpu, JINPU)],
  }),
];
