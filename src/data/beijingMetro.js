/**
 * 北京地铁关键线路站序与分段开通场景
 * 站位优先用高德地铁图坐标（GCJ→WGS84；地铁通未公开坐标，与此同源对照）
 * 线位仍用 OSM；未收录站（如 53号站）用手写 WGS84
 */
import AMAP_STATIONS from './beijingStationsAmap.json' with { type: 'json' };
import DEFAULT_EDITS from './defaultMapEdits.json' with { type: 'json' };
import { mapKindToPath } from './guideway.js';

const S = (name, lng, lat) => {
  const a = AMAP_STATIONS.stations[name];
  if (a) return { name, lng: a[0], lat: a[1] };
  return { name, lng, lat };
};
/** 无形站点：只矫正走向，不显示站名 */
const W = (lng, lat) => ({ name: '', lng, lat, silent: true });
const Q = (name, lng, lat) => ({ name, lng, lat, silent: true });

/** 线路主色（接近官网） */
export const BJ_LINE_COLORS = {
  l1: '#A01D1D',
  l2: '#004B87',
  l4: '#008C8C',
  l5: '#A6217C',
  l6: '#B58500',
  l8: '#009B6B',
  l9: '#86B81C',
  l10: '#0092BC',
  l13: '#F9E700',
  l14: '#D4A5A5',
  l15: '#653EB0',
  l16: '#6BA539',
  /** 7 号线 Pantone 1355C */
  l7: '#FFC56E',
  l3: '#DE82CE',
  l11: '#EE797A',
  l12: '#8C570B',
  l17: '#00A9A5',
  l18: '#C4A36A',
  l19: '#D6A461',
  l22: '#B85C38',
  l28: '#7A9E9F',
  m101: '#C45C26',
  batong: '#A01D1D',
  airport: '#A292B0',
  daxing: '#008C8C',
  /** 大兴机场线 */
  daxingAirport: '#004A99',
  /** 亦庄线 Pantone 226C · Central Go / DB11 */
  yizhuang: '#D0006F',
  fangshan: '#D86018',
  /** 昌平线 Pantone 673C · Central Go / DB11 */
  changping: '#D986BA',
  /** 燕房线 */
  yanfang: '#D86018',
  /** S1 磁浮 */
  s1: '#B35A20',
  /** 西郊线 · 高德/官网红 */
  xijiao: '#FC0601',
  /** 亦庄有轨电车T1 · 朱红 */
  yizhuangT1: '#C41E3A',
  /** 快速公交 */
  brt1: '#FF5C00',
  brt2: '#F4A261',
  brt3: '#E76F51',
  brt4: '#E9C46A',
};

/** 城铁时期黄色（2007.7.9 并入后改 13 号线标准黄 #F9E700） */
const CHENG_TIE_COLOR = '#E6C200';

/** 1号线未开放西延：53号站（高井）→福寿岭→苹果园（手调站位，见 map-edits） */
const ST53 = S('53号站', 116.14857, 39.94706);
const ST52 = S('福寿岭', 116.16494, 39.93854);

/** 1号线站序（坐标见 beijingStationsAmap.json） */
const L1 = [
  S('苹果园'),
  S('古城'),
  S('八角游乐园'),
  S('八宝山'),
  S('玉泉路'),
  S('五棵松'),
  S('万寿路'),
  S('公主坟'),
  S('军事博物馆'),
  S('木樨地'),
  S('南礼士路'),
  S('复兴门'),
  S('西单'),
  S('天安门西'),
  S('天安门东'),
  S('王府井'),
  S('东单'),
  S('建国门'),
  S('永安里'),
  S('国贸'),
  S('大望路'),
  S('四惠'),
  S('四惠东'),
];

/** 2号线：顺时针站序（西直门起绕一圈回到西直门） */
const L2_CW = [
  S('西直门'),
  S('积水潭'),
  S('鼓楼大街'),
  S('安定门'),
  S('雍和宫'),
  S('东直门'),
  S('东四十条'),
  S('朝阳门'),
  S('建国门'),
  S('北京站'),
  S('崇文门'),
  S('前门'),
  S('和平门'),
  S('宣武门'),
  S('长椿街'),
  S('复兴门'),
  S('阜成门'),
  S('车公庄'),
  S('西直门'),
];

/** 1984.9.20 二期：复兴门→建国门（西+北+东，经西直门） */
const L2_1984 = [
  S('复兴门'),
  S('阜成门'),
  S('车公庄'),
  S('西直门'),
  S('积水潭'),
  S('鼓楼大街'),
  S('安定门'),
  S('雍和宫'),
  S('东直门'),
  S('东四十条'),
  S('朝阳门'),
  S('建国门'),
];

/**
 * 一期原线南段站名：长椿街→北京站（经前门、崇文门）
 * 南礼士路↔长椿街走「长礼联络线」转弯，不进复兴门站
 */
const L2_SOUTH_P1 = [
  S('长椿街'),
  S('宣武门'),
  S('和平门'),
  S('前门'),
  S('崇文门'),
  S('北京站'),
];

/** 一线拆给环线的段：北京站 → 长椿街 */
const L2_HANDOFF_FROM_L1 = [...L2_SOUTH_P1].reverse();

/** 1987 环线南半环：复兴门 → 建国门（经长椿街、北京站） */
const L2_SOUTH_RING = [
  S('复兴门'),
  S('长椿街'),
  S('宣武门'),
  S('和平门'),
  S('前门'),
  S('崇文门'),
  S('北京站'),
  S('建国门'),
];

/**
 * 长礼联络线：南礼士路出站后向南弯，在复兴门站台以南汇入今 2 号线正线，再到长椿街。
 * （一期正线；1987 后改联络线。站台不进复兴门。）
 * 短弯用手绘，汇入后跟 OSM 2 号线，避免整段乱飘。
 */
function changLiLiaison(l2path, reverse = false) {
  const nl = S('南礼士路');
  const fx = S('复兴门');
  const cc = S('长椿街');
  if (!l2path?.length) {
    // 无 OSM 时：南礼士路 → 复兴门西南控制点 → 长椿街
    const cx = (nl.lng + fx.lng) / 2;
    const cy = fx.lat - 0.0045;
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push([
        (1 - t) * (1 - t) * nl.lat + 2 * (1 - t) * t * cy + t * t * cc.lat,
        (1 - t) * (1 - t) * nl.lng + 2 * (1 - t) * t * cx + t * t * cc.lng,
      ]);
    }
    return reverse ? pts.reverse() : pts;
  }

  const nearest = (lat, lng) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < l2path.length; i++) {
      const d = Math.hypot(l2path[i][0] - lat, l2path[i][1] - lng);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };

  // 汇合点：复兴门以南约 350m 的 2 号线正线（不进站台）
  const joinIdx = nearest(fx.lat - 0.0032, fx.lng);
  const join = l2path[joinIdx];
  const ccIdx = nearest(cc.lat, cc.lng);

  // 短弯：南礼士路 → 略偏东南 → 汇合点（贴西二环内侧转弯）
  const c1 = { lat: nl.lat - 0.0012, lng: nl.lng + 0.0015 };
  const c2 = { lat: join[0] + 0.0008, lng: join[1] - 0.0006 };
  const spur = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const u = 1 - t;
    spur.push([
      u * u * u * nl.lat + 3 * u * u * t * c1.lat + 3 * u * t * t * c2.lat + t * t * t * join[0],
      u * u * u * nl.lng + 3 * u * u * t * c1.lng + 3 * u * t * t * c2.lng + t * t * t * join[1],
    ]);
  }

  const lo = Math.min(joinIdx, ccIdx);
  const hi = Math.max(joinIdx, ccIdx);
  const along = l2path.slice(lo, hi + 1);
  const south = joinIdx <= ccIdx ? along : [...along].reverse();

  const full = spur.concat(south.slice(1));
  return reverse ? full.reverse() : full;
}

const L2 = L2_CW;

const L13 = [
  S('西直门', 116.3534, 39.9405),
  S('大钟寺', 116.345, 39.966),
  S('知春路', 116.3398, 39.9764),
  S('五道口', 116.3377, 39.9927),
  S('上地', 116.3204, 40.0326),
  S('清河站'),
  S('西二旗', 116.3078, 40.053),
  S('龙泽', 116.3194, 40.0708),
  S('回龙观', 116.3363, 40.0709),
  S('霍营', 116.3603, 40.0708),
  S('立水桥', 116.4124, 40.053),
  S('北苑', 116.4347, 40.0428),
  S('望京西', 116.4497, 39.9957),
  S('芍药居', 116.4365, 39.9776),
  S('光熙门', 116.4317, 39.9683),
  S('柳芳', 116.4328, 39.9582),
  S('东直门', 116.4338, 39.9415),
];

const BATONG = [
  S('四惠', 116.4954, 39.9087),
  S('四惠东', 116.5155, 39.9085),
  S('高碑店', 116.5314, 39.9094),
  S('传媒大学', 116.5547, 39.909),
  S('双桥', 116.5766, 39.9089),
  S('管庄', 116.599, 39.9091),
  S('八里桥', 116.6185, 39.9063),
  S('通州北苑', 116.6372, 39.9039),
  S('果园', 116.6467, 39.8934),
  S('九棵树', 116.6576, 39.8802),
  S('梨园', 116.6686, 39.8635),
  S('临河里', 116.6789, 39.8553),
  S('土桥', 116.6863, 39.8717),
  S('花庄'),
  S('环球度假区'),
];

const L5 = [
  S('宋家庄', 116.4284, 39.8457),
  S('刘家窑', 116.4216, 39.8574),
  S('蒲黄榆', 116.4216, 39.8655),
  S('天坛东门', 116.4205, 39.8826),
  S('磁器口', 116.4196, 39.8933),
  S('崇文门', 116.417, 39.9008),
  S('东单', 116.4185, 39.9083),
  S('灯市口', 116.4178, 39.9171),
  S('东四', 116.4175, 39.9244),
  S('张自忠路', 116.4172, 39.9336),
  S('北新桥', 116.417, 39.9408),
  S('雍和宫', 116.417, 39.9492),
  S('和平里北街', 116.4185, 39.9587),
  S('和平西桥', 116.418, 39.9685),
  S('惠新西街南口', 116.4175, 39.977),
  S('惠新西街北口', 116.4172, 39.9868),
  S('大屯路东', 116.4174, 39.9965),
  S('北苑路北', 116.4182, 40.0166),
  S('立水桥南', 116.4145, 40.0418),
  S('立水桥', 116.4124, 40.053),
  S('天通苑南', 116.4127, 40.0664),
  S('天通苑', 116.4129, 40.0752),
  S('天通苑北', 116.4131, 40.0834),
];

const L4 = [
  S('安河桥北', 116.2699, 40.0122),
  S('北宫门', 116.2767, 40.0025),
  S('西苑', 116.291, 39.998),
  S('圆明园', 116.303, 39.9995),
  S('北京大学东门', 116.316, 39.992),
  S('中关村', 116.3165, 39.9838),
  S('海淀黄庄', 116.3175, 39.9759),
  S('人民大学', 116.3213, 39.9669),
  S('魏公村', 116.3234, 39.9576),
  S('国家图书馆', 116.3252, 39.948),
  S('动物园', 116.3391, 39.9384),
  S('西直门', 116.3534, 39.9405),
  S('新街口', 116.3676, 39.9406),
  S('平安里', 116.3725, 39.9337),
  S('西四', 116.3734, 39.924),
  S('灵境胡同', 116.3738, 39.916),
  S('西单', 116.3743, 39.9073),
  S('宣武门', 116.3743, 39.8997),
  S('菜市口', 116.3742, 39.8893),
  S('陶然亭', 116.3744, 39.8784),
  S('北京南站', 116.3785, 39.865),
  S('马家堡', 116.3714, 39.8529),
  S('角门西', 116.3712, 39.8458),
  S('公益西桥', 116.3709, 39.836),
];

const L10A = [
  S('巴沟', 116.2937, 39.9742),
  S('苏州街', 116.3063, 39.9757),
  S('海淀黄庄', 116.3175, 39.9759),
  S('知春里', 116.3288, 39.9763),
  S('知春路', 116.3398, 39.9764),
  S('西土城', 116.3541, 39.9764),
  S('牡丹园', 116.3699, 39.9764),
  S('健德门', 116.3812, 39.9766),
  S('北土城', 116.3943, 39.9768),
  S('安贞门', 116.4059, 39.977),
  S('惠新西街南口', 116.4175, 39.977),
  S('芍药居', 116.4365, 39.9776),
  S('太阳宫', 116.4474, 39.9728),
  S('三元桥', 116.4569, 39.9613),
  S('亮马桥', 116.4628, 39.9494),
  S('农业展览馆', 116.4617, 39.9414),
  S('团结湖', 116.4617, 39.9336),
  S('呼家楼', 116.4616, 39.9233),
  S('金台夕照', 116.4616, 39.9166),
  S('国贸', 116.4618, 39.909),
  S('双井', 116.4617, 39.8975),
  S('劲松', 116.4613, 39.8843),
];

const L10B = [
  S('劲松', 116.4613, 39.8843),
  S('潘家园', 116.461, 39.8754),
  S('十里河', 116.4581, 39.8657),
  S('分钟寺', 116.454, 39.852),
  S('成寿寺', 116.448, 39.846),
  S('宋家庄', 116.4284, 39.8457),
  S('石榴庄', 116.414, 39.8458),
  S('大红门', 116.399, 39.8455),
  S('角门东', 116.385, 39.8455),
  S('角门西', 116.3712, 39.8458),
  S('草桥', 116.351, 39.8458),
  S('纪家庙', 116.333, 39.852),
  S('首经贸', 116.32, 39.862),
  S('丰台站', 116.305, 39.865),
  S('泥洼', 116.294, 39.866),
  S('西局', 116.288, 39.867),
  S('六里桥', 116.302, 39.880),
  S('莲花桥', 116.310, 39.897),
  S('公主坟', 116.30413, 39.90614),
  S('西钓鱼台', 116.298, 39.923),
  S('慈寿寺', 116.294, 39.933),
  S('车道沟', 116.293, 39.948),
  S('长春桥', 116.294, 39.958),
  S('火器营', 116.294, 39.966),
  S('巴沟', 116.2937, 39.9742),
];

const L8N = [
  S('朱辛庄', 116.325, 40.104),
  S('育知路', 116.327, 40.088),
  S('平西府', 116.338, 40.085),
  S('回龙观东大街', 116.363, 40.081),
  S('霍营', 116.3603, 40.0708),
  S('育新', 116.347, 40.060),
  S('西小口', 116.352, 40.047),
  S('永泰庄', 116.355, 40.038),
  S('林萃桥', 116.373, 40.022),
  S('森林公园南门', 116.392, 40.010),
  S('奥林匹克公园', 116.396, 40.002),
  S('奥体中心', 116.397, 39.988),
  S('北土城', 116.3943, 39.9768),
];

const L8S = [
  S('北土城', 116.3943, 39.9768),
  S('安华桥', 116.3945, 39.968),
  S('安德里北街', 116.395, 39.958),
  S('鼓楼大街', 116.3937, 39.9486),
  S('什刹海', 116.396, 39.938),
  S('南锣鼓巷', 116.403, 39.933),
  S('中国美术馆', 116.410, 39.923),
  S('金鱼胡同', 116.417, 39.915),
  S('王府井', 116.4175, 39.908),
  S('前门', 116.3979, 39.899),
  S('珠市口', 116.398, 39.891),
  S('天桥', 116.398, 39.883),
  S('永定门外', 116.399, 39.870),
  S('木樨园', 116.400, 39.860),
  S('海户屯', 116.401, 39.852),
  S('大红门南', 116.400, 39.840),
  S('和义', 116.402, 39.825),
  S('东高地', 116.410, 39.815),
  S('火箭万源', 116.418, 39.808),
  S('五福堂', 116.425, 39.800),
  S('德茂', 116.435, 39.790),
  S('瀛海', 116.450, 39.780),
];

/** 2012 南段：安德里北街 2015 才开通 */
const L8S_2012 = [S('北土城'), S('安华桥'), S('鼓楼大街')];

/** 机场线：沿机场高速走廊拐向 T3，再折向 T2（加途经点，避免直线穿城） */
const AIRPORT = [
  S('东直门', 116.434, 39.9416),
  S('三元桥', 116.4569, 39.9613),
  W(116.478, 39.985),
  W(116.505, 40.005),
  W(116.535, 40.025),
  W(116.565, 40.04),
  W(116.59, 40.048),
  S('3号航站楼', 116.6155, 40.0535),
  W(116.62, 40.065),
  W(116.61, 40.075),
  S('2号航站楼', 116.5928, 40.0798),
];

const L15 = [
  S('清华东路西口', 116.339, 40.000),
  S('六道口', 116.353, 39.999),
  S('北沙滩', 116.368, 39.998),
  S('奥林匹克公园', 116.396, 40.002),
  S('安立路', 116.408, 40.002),
  S('大屯路东', 116.4174, 39.9965),
  S('关庄', 116.434, 40.001),
  S('望京西', 116.4497, 39.9957),
  S('望京', 116.469, 39.998),
  S('望京东', 116.487, 40.003),
  S('崔各庄', 116.510, 40.010),
  S('马泉营', 116.530, 40.015),
  S('孙河', 116.550, 40.025),
  S('国展', 116.570, 40.040),
  S('花梨坎', 116.590, 40.050),
  S('后沙峪', 116.610, 40.060),
  S('南法信', 116.640, 40.070),
  S('石门', 116.660, 40.075),
  S('顺义', 116.680, 40.080),
  S('俸伯', 116.700, 40.085),
];

/** 昌平线（蓟门桥—昌平西山口） */
const CHANGPING = [
  S('蓟门桥'),
  S('西土城'),
  S('学院桥'),
  S('六道口'),
  S('学知园'),
  S('清河小营桥'),
  S('朱房北'),
  S('清河站'),
  S('西二旗'),
  S('生命科学园'),
  S('朱辛庄'),
  S('巩华城'),
  S('沙河'),
  S('沙河高教园'),
  S('南邵'),
  S('北邵洼'),
  S('昌平东关'),
  S('昌平'),
  S('十三陵景区'),
  S('昌平西山口'),
];

/** 大兴线（与 4 号线贯通，同色；运营段自公益西桥贯通至天宫院） */
const DAXING = [
  S('公益西桥'),
  S('新宫'),
  S('西红门'),
  S('高米店北'),
  S('高米店南'),
  S('枣园'),
  S('清源路'),
  S('黄村西大街'),
  S('黄村火车站'),
  S('义和庄'),
  S('生物医药基地'),
  S('天宫院'),
];

/** 房山线（含北延至东管头南） */
const FANGSHAN = [
  S('东管头南'),
  S('首经贸'),
  S('花乡东桥'),
  S('白盆窑'),
  S('郭公庄'),
  S('大葆台'),
  S('稻田'),
  S('长阳'),
  S('篱笆房'),
  S('广阳城'),
  S('良乡大学城北'),
  S('良乡大学城'),
  S('良乡大学城西'),
  S('良乡南关'),
  S('苏庄'),
  S('阎村东'),
];

/** 燕房线 */
const YANFANG = [
  S('阎村东'),
  S('紫草坞'),
  S('阎村'),
  S('星城'),
  S('大石河东'),
  S('马各庄'),
  S('饶乐府'),
  S('房山城关'),
  S('燕山'),
];

/** S1 线（磁浮） */
const S1 = [
  S('石厂'),
  S('小园'),
  S('栗园庄'),
  S('上岸'),
  S('桥户营'),
  S('四道桥'),
  S('金安桥'),
  S('苹果园'),
];

/** 大兴机场线 */
const DAXING_AIRPORT = [
  S('草桥'),
  S('大兴新城'),
  S('大兴机场'),
];

/** 亦庄线 */
const YIZHUANG = [
  S('宋家庄'),
  S('肖村'),
  S('小红门'),
  S('旧宫'),
  S('亦庄桥'),
  S('亦庄文化园'),
  S('万源街'),
  S('荣京东街'),
  S('荣昌东街'),
  S('同济南路'),
  S('经海路'),
  S('次渠南'),
  S('次渠'),
  S('亦庄火车站'),
];

/** 西郊线（现代有轨电车） */
const XIJIAO = [
  S('巴沟'),
  S('颐和园西门'),
  S('茶棚'),
  S('万安'),
  S('国家植物园'),
  S('香山'),
];

/** 亦庄有轨电车T1（老观里暂缓） */
const YIZHUANG_T1 = [
  S('屈庄'),
  S('融兴街'),
  S('瑞合庄'),
  S('太和桥北'),
  S('四海庄'),
  S('九号村'),
  S('泰河路'),
  S('鹿圈东'),
  S('亦庄同仁'),
  S('荣昌东街'),
  S('亦创会展中心'),
  S('经海一路'),
  S('定海园西'),
  S('定海园'),
];

/** 快速公交1 · 现运营 德茂庄—沙子口（2026 取消前门至永定门内） */
const BRT1 = [
  S('德茂庄', 116.42626, 39.77789),
  S('东营房', 116.41415, 39.78936),
  S('六营门', 116.41287, 39.79618),
  S('东高地', 116.411, 39.80318),
  S('和义南', 116.39609, 39.81103),
  S('久敬庄', 116.39568, 39.8199),
  S('大红门桥', 116.39516, 39.83062),
  S('南苑路果园', 116.39433, 39.84644),
  S('沙子口', 116.39358, 39.86257),
];

/** 快速公交2 · 杨闸—朝阳门 */
const BRT2 = [
  S('杨闸', 116.59184, 39.90989),
  S('杨闸环岛西', 116.58868, 39.91081),
  S('管庄'),
  S('周家井', 116.57448, 39.9133),
  S('朝阳路三间房', 116.56867, 39.91401),
  S('第二外国语学院', 116.55825, 39.91496),
  S('大黄庄桥西', 116.53336, 39.91524),
  S('甘露园', 116.50885, 39.91518),
  S('十里堡'),
  S('东八里庄', 116.49304, 39.91458),
  S('慈云寺', 116.48738, 39.91441),
  S('英家坟', 116.47778, 39.91427),
  S('红庙路口西', 116.46906, 39.91458),
  S('小庄路口西', 116.46273, 39.91545),
  S('呼家楼西', 116.45414, 39.91838),
  S('朝阳门'),
];

/** 快速公交3 · 安定门—宏福苑小区西 */
const BRT3 = [
  S('安定门'),
  S('蒋宅口', 116.40192, 39.95664),
  S('五路居', 116.40133, 39.97668),
  S('炎黄艺术馆', 116.40164, 39.99544),
  S('慧忠北里', 116.40182, 40.00237),
  S('慧忠北里北', 116.40188, 40.00659),
  S('仰山桥北', 116.40369, 40.02696),
  S('天乐园小区', 116.40468, 40.03303),
  S('立水桥南'),
  S('立水桥北', 116.40598, 40.04805),
  S('天通西苑南', 116.40746, 40.0592),
  S('天通苑南'),
  S('天通苑太平庄', 116.40664, 40.06893),
  S('天通苑'),
  S('王府温馨公寓', 116.38754, 40.10155),
  S('宏福苑小区南', 116.37154, 40.11008),
  S('宏福苑小区西', 116.36035, 40.11436),
];

/** 快速公交4 · 龙泉西—阜成门 */
const BRT4 = [
  S('龙泉西', 116.07991, 39.9411),
  S('中门寺街', 116.08407, 39.93707),
  S('门头沟教委小区', 116.08984, 39.93273),
  S('双峪', 116.10174, 39.93409),
  S('侯庄子', 116.10793, 39.93486),
  S('麻峪', 116.1268, 39.9314),
  S('石景山火车', 116.1341, 39.92689),
  S('广宁村', 116.13973, 39.92393),
  S('金安桥'),
  S('杨庄东', 116.19177, 39.92332),
  S('龚村东口', 116.2219, 39.92348),
  S('阜玉路口', 116.24683, 39.9245),
  S('阜永路口西', 116.2574, 39.92292),
  S('西钓鱼台'),
  S('展览路', 116.3413, 39.92188),
  S('阜成门'),
];

/** 临 1 路接驳：大葆台 — 新宫（解决房山线脱网） */
const LIN1_SHUTTLE = [S('大葆台'), S('新宫')];

const L9 = [
  S('国家图书馆', 116.3252, 39.948),
  S('白石桥南', 116.326, 39.933),
  S('白堆子', 116.327, 39.924),
  S('军事博物馆', 116.3234, 39.9074),
  S('北京西站', 116.322, 39.894),
  S('六里桥东', 116.315, 39.887),
  S('六里桥', 116.302, 39.880),
  S('七里庄', 116.294, 39.870),
  S('丰台东大街', 116.294, 39.860),
  S('丰台南路', 116.295, 39.850),
  S('科怡路', 116.298, 39.842),
  S('丰台科技园', 116.300, 39.835),
  S('郭公庄', 116.302, 39.825),
];

/** 14 号线（西段 2013：张郭庄—西局；东段 2014：金台路—善各庄） */
const L14 = [
  S('张郭庄'),
  S('园博园'),
  S('大瓦窑'),
  S('郭庄子'),
  S('大井'),
  S('七里庄'),
  S('西局'),
  S('东管头'),
  S('丽泽商务区'),
  S('菜户营'),
  S('西铁营'),
  S('景风门'),
  S('北京南站'),
  S('陶然桥', 116.388, 39.868),
  S('永定门外'),
  S('景泰'),
  S('蒲黄榆'),
  S('方庄'),
  S('十里河'),
  S('北工大西门'),
  S('平乐园'),
  S('九龙山'),
  S('大望路'),
  S('金台路'),
  S('朝阳公园'),
  S('枣营'),
  S('东风北桥'),
  S('将台'),
  S('高家园'),
  S('望京南'),
  S('阜通'),
  S('望京'),
  S('东湖渠'),
  S('来广营'),
  S('善各庄'),
];

/** 7 号线（北京西站—环球度假区） */
const L7 = [
  S('北京西站'),
  S('湾子'),
  S('达官营'),
  S('广安门内'),
  S('菜市口'),
  S('虎坊桥'),
  S('珠市口'),
  S('桥湾'),
  S('磁器口'),
  S('广渠门内'),
  S('广渠门外'),
  S('双井'),
  S('九龙山'),
  S('大郊亭'),
  S('百子湾'),
  S('化工'),
  S('南楼梓庄'),
  S('欢乐谷景区'),
  S('垡头'),
  S('双合'),
  S('焦化厂'),
  S('黄厂'),
  S('郎辛庄'),
  S('黑庄户'),
  S('万盛西'),
  S('万盛东'),
  S('群芳'),
  S('高楼金'),
  S('花庄'),
  S('环球度假区'),
];

/** 16 号线 */
const L16 = [
  S('北安河'),
  S('温阳路'),
  S('稻香湖路'),
  S('屯佃'),
  S('永丰'),
  S('永丰南'),
  S('西北旺'),
  S('马连洼'),
  S('农大南路'),
  S('西苑'),
  S('万泉河桥'),
  S('苏州街'),
  S('苏州桥'),
  S('万寿寺'),
  S('国家图书馆'),
  S('二里沟'),
  S('甘家口'),
  S('玉渊潭东门'),
  S('木樨地'),
  S('达官营'),
  S('红莲南路'),
  S('丽泽商务区'),
  S('东管头南'),
  S('丰台站'),
  S('丰台南路'),
  S('富丰桥'),
  S('看丹'),
  S('榆树庄'),
  S('洪泰庄'),
  S('宛平城'),
];

/** 17 号线南段 / 北段 */
const L17S = [
  S('十里河'),
  S('周家庄'),
  S('十八里店'),
  S('北神树'),
  S('次渠北'),
  S('次渠'),
  S('嘉会湖'),
];
const L17N = [
  S('未来科学城北'),
  S('未来科学城'),
  S('天通苑东'),
  S('清河营'),
  S('红军营'),
  S('望京西'),
  S('太阳宫'),
  S('西坝河'),
  S('左家庄'),
  S('工人体育场'),
];
const L17M = [
  S('工人体育场'),
  S('东大桥'),
  S('永安里'),
  S('潘家园西'),
  S('十里河'),
];
const L18 = [
  S('马连洼'),
  S('上地软件园'),
  S('东北旺'),
  S('龙泽西'),
  S('回龙观西大街'),
  S('文华路'),
  S('回龙观东大街'),
  S('霍营东'),
  S('天通苑'),
  S('太平庄'),
  S('天通苑东'),
];

/** 19 号线 */
const L19 = [
  S('牡丹园'),
  S('北太平庄'),
  S('积水潭'),
  S('平安里'),
  S('太平桥'),
  S('牛街'),
  S('景风门'),
  S('草桥'),
  S('新发地'),
  S('新宫'),
];

/** 11 号线（冬奥支线） */
const L11 = [
  S('模式口'),
  S('金安桥'),
  S('北辛安'),
  S('新首钢'),
];

/** 3 号线一期 */
const L3 = [
  S('东四十条'),
  S('工人体育场'),
  S('团结湖'),
  S('朝阳公园'),
  S('石佛营'),
  S('朝阳站'),
  S('姚家园'),
  S('东坝南'),
  S('东坝'),
  S('东坝北'),
];

/** 12 号线 */
const L12 = [
  S('四季青桥'),
  S('蓝靛厂'),
  S('长春桥'),
  S('苏州桥'),
  S('人民大学'),
  S('大钟寺'),
  S('蓟门桥'),
  S('北太平庄'),
  S('马甸桥'),
  S('安华桥'),
  S('安贞桥'),
  S('和平西桥'),
  S('光熙门'),
  S('西坝河'),
  S('三元桥'),
  S('将台西'),
  S('高家园'),
  S('驼房营'),
  S('东坝西'),
  S('东坝北'),
];

/** 机场线西延：北新桥 */
const AIRPORT_WEST = [S('北新桥'), S('东直门')];

const L6 = [
  S('金安桥', 116.161, 39.923),
  S('苹果园', 116.17193, 39.92483),
  S('杨庄', 116.200, 39.928),
  S('西黄村', 116.220, 39.929),
  S('廖公庄', 116.240, 39.930),
  S('田村', 116.255, 39.930),
  S('海淀五路居', 116.277, 39.932),
  S('慈寿寺', 116.294, 39.933),
  S('花园桥', 116.310, 39.933),
  S('白石桥南', 116.326, 39.933),
  S('二里沟', 116.340, 39.933),
  S('车公庄西', 116.348, 39.933),
  S('车公庄', 116.3558, 39.9323),
  S('平安里', 116.3725, 39.9337),
  S('北海北', 116.387, 39.933),
  S('南锣鼓巷', 116.403, 39.933),
  S('东四', 116.4175, 39.9244),
  S('朝阳门', 116.4345, 39.9237),
  S('东大桥', 116.451, 39.923),
  S('呼家楼', 116.4616, 39.9233),
  S('金台路', 116.478, 39.923),
  S('十里堡', 116.502, 39.923),
  S('青年路', 116.525, 39.923),
  S('褡裢坡', 116.550, 39.923),
  S('黄渠', 116.570, 39.923),
  S('常营', 116.590, 39.923),
  S('草房', 116.610, 39.923),
  S('物资学院路', 116.630, 39.930),
  S('通州北关', 116.650, 39.940),
  S('通运门', 116.670, 39.945),
  S('北运河西', 116.685, 39.950),
  S('北运河东', 116.700, 39.950),
  S('郝家府', 116.715, 39.948),
  S('东夏园', 116.730, 39.945),
  S('潞城', 116.745, 39.942),
];

function slice(stations, fromName, toName) {
  const a = stations.findIndex((s) => s.name === fromName);
  const b = stations.findIndex((s) => s.name === toName);
  if (a < 0 || b < 0) throw new Error(`slice miss ${fromName}-${toName}`);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return stations.slice(lo, hi + 1);
}

/** 站序保留走向，暂缓开通站不显示站名 */
function deferStations(stations, names) {
  const skip = new Set(names);
  return stations.map((s) => (skip.has(s.name) ? { ...s, silent: true } : s));
}

/** 2012 C 形：跳过暂缓开通的角门东、丰台站、泥洼（断点不连线） */
const L10_C_SOUTH = [
  ...slice(L10B, '劲松', '大红门'),
  ...slice(L10B, '角门西', '首经贸'),
];
const L10_C_WEST = slice(L10B, '西局', '巴沟');

function mid(stations) {
  const m = stations[Math.floor(stations.length / 2)];
  return { lng: m.lng, lat: m.lat };
}

function nearestOnPath(path, lat, lng) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - lat, path[i][1] - lng);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** 从一期灰线总路径裁一段（唯一几何源，保证运营段与灰线重合） */
function pathSliceFromEdited1969(startSt, endSt) {
  const p = DEFAULT_EDITS.paths?.['bj-l1-1969'];
  if (!p?.length) return null;
  const a = nearestOnPath(p, startSt.lat, startSt.lng);
  const b = nearestOnPath(p, endSt.lat, endSt.lng);
  let path = p.slice(Math.min(a, b), Math.max(a, b) + 1);
  const d0 = Math.hypot(path[0][0] - startSt.lat, path[0][1] - startSt.lng);
  const d1 = Math.hypot(path[path.length - 1][0] - startSt.lat, path[path.length - 1][1] - startSt.lng);
  if (d0 > d1) path = path.reverse();
  return path;
}

/** 1971.1.15：北京站→立新 */
function pathOpen1971FromPhase1969() {
  return pathSliceFromEdited1969(S('北京站'), S('公主坟'));
}

/** 1971.8.5：立新→玉泉路 */
function pathOpen1971_08FromPhase1969() {
  return pathSliceFromEdited1969(S('公主坟'), S('玉泉路'));
}

/** 1971.11.7：玉泉路→古城路 */
function pathOpen1971_11FromPhase1969() {
  return pathSliceFromEdited1969(S('玉泉路'), S('古城'));
}

/** 1973.4.23：古城路→苹果园 */
function pathOpen1973FromPhase1969() {
  return pathSliceFromEdited1969(S('古城'), S('苹果园'));
}

/** 1978：苹果园→高井（技校通勤，经福寿岭） */
function pathCommute1978FromPhase1969() {
  return pathSliceFromEdited1969(S('苹果园'), ST53);
}

/**
 * 把 OSM 真实轨道挂到分镜 segments 上
 * （站名仍用手写站表，线位用 OSM path）
 */
export function bindOsmToBeijingScenes(osmData) {
  if (!osmData?.lines) return BEIJING_SCENES;
  const { sliceVia } = waitOsmUtil();
  const l1path = osmData.lines.l1?.path;
  const l2path = osmData.lines.l2?.path;

  for (const sc of BEIJING_SCENES) {
    const segs = [...(sc.segments || [])];
    if (sc.lineHandoff?.segment) segs.push(sc.lineHandoff.segment);
    if (sc.lineHandoff?.alsoGrow) segs.push(sc.lineHandoff.alsoGrow);
    for (const seg of segs) {
      // 1969 一期灰线：优先用手改总路径（运营段都从此裁）
      if (seg.osmPhase1969) {
        const edited = DEFAULT_EDITS.paths?.['bj-l1-1969'];
        if (edited?.length >= 2) {
          seg.path = edited.map((pt) => [...pt]);
          continue;
        }
        if (l1path?.length && l2path?.length) {
          const pingguoyuan = S('苹果园');
          const westSpur = [
            [ST53.lat, ST53.lng],
            [ST52.lat, ST52.lng],
            [pingguoyuan.lat, pingguoyuan.lng],
          ];
          const onL1 = sliceVia(l1path, pingguoyuan, S('南礼士路'), S('公主坟'));
          const link = changLiLiaison(l2path, false);
          const onL2 = sliceVia(l2path, S('长椿街'), S('北京站'), S('前门'));
          seg.path = densifyDedup(
            westSpur
              .concat(onL1?.length ? onL1.slice(1) : [])
              .concat(link.slice(1))
              .concat(onL2?.length ? onL2.slice(1) : []),
            1
          );
        }
        continue;
      }

      // 1971.1.15 对外开放：北京站→立新，优先复用已改好的一期灰线几何
      if (seg.osmPhase1971_01) {
        const fromEdited = pathOpen1971FromPhase1969();
        if (fromEdited?.length >= 2) {
          seg.path = fromEdited;
          continue;
        }
        if (l1path?.length && l2path?.length) {
          const onL2 = sliceVia(l2path, S('北京站'), S('长椿街'), S('前门'));
          const link = changLiLiaison(l2path, true);
          const onL1 = sliceVia(l1path, S('南礼士路'), S('公主坟'), S('木樨地'));
          seg.path = densifyDedup(
            (onL2 || []).concat(link.slice(1)).concat(onL1?.length ? onL1.slice(1) : []),
            1
          );
        }
        continue;
      }

      // 1971.8.5：立新→玉泉路
      if (seg.osmPhase1971_08) {
        const fromEdited = pathOpen1971_08FromPhase1969();
        if (fromEdited?.length >= 2) {
          seg.path = fromEdited;
          continue;
        }
        if (l1path?.length) {
          seg.path = sliceVia(l1path, S('公主坟'), S('玉泉路'), S('五棵松'));
        }
        continue;
      }

      // 1971.11.7：玉泉路→古城路
      if (seg.osmPhase1971_11) {
        const fromEdited = pathOpen1971_11FromPhase1969();
        if (fromEdited?.length >= 2) {
          seg.path = fromEdited;
          continue;
        }
        if (l1path?.length) {
          seg.path = sliceVia(l1path, S('玉泉路'), S('古城'), S('八宝山'));
        }
        continue;
      }

      // 1973.4.23：古城路→苹果园
      if (seg.osmPhase1973) {
        const fromEdited = pathOpen1973FromPhase1969();
        if (fromEdited?.length >= 2) {
          seg.path = fromEdited;
          continue;
        }
        if (l1path?.length) {
          seg.path = sliceVia(l1path, S('古城'), S('苹果园'), S('古城'));
        }
        continue;
      }

      // 1978：苹果园→福寿岭→高井（技校通勤）
      if (seg.osmPhase1978) {
        const fromEdited = pathCommute1978FromPhase1969();
        if (fromEdited?.length >= 2) {
          seg.path = fromEdited;
          continue;
        }
        seg.path = [
          [S('苹果园').lat, S('苹果园').lng],
          [ST52.lat, ST52.lng],
          [ST53.lat, ST53.lng],
        ];
        continue;
      }

      // 1987 环线南半环：复兴门→建国门（经前门）；中段与一期灰线对齐
      if (seg.osmHandoff1987) {
        const mid = pathSliceFromEdited1969(S('长椿街'), S('北京站'));
        if (l2path?.length) {
          const south = sliceVia(l2path, S('复兴门'), S('建国门'), S('前门'));
          if (south?.length >= 2 && mid?.length >= 2) {
            const i0 = nearestOnPath(south, S('长椿街').lat, S('长椿街').lng);
            const i1 = nearestOnPath(south, S('北京站').lat, S('北京站').lng);
            const lo = Math.min(i0, i1);
            const hi = Math.max(i0, i1);
            const oriented =
              Math.hypot(mid[0][0] - south[lo][0], mid[0][1] - south[lo][1]) <=
              Math.hypot(mid[mid.length - 1][0] - south[lo][0], mid[mid.length - 1][1] - south[lo][1])
                ? mid
                : mid.slice().reverse();
            seg.path = densifyDedup(
              south.slice(0, lo + 1).concat(oriented.slice(1)).concat(south.slice(hi + 1)),
              1
            );
          } else {
            seg.path = south;
          }
        } else if (mid?.length >= 2) {
          seg.path = [
            [S('复兴门').lat, S('复兴门').lng],
            ...mid,
            [S('建国门').lat, S('建国门').lng],
          ];
        }
        continue;
      }

      const line = osmData.lines[seg.osmKey];
      if (!line) continue;
      let srcPath = line.path;
      let srcKind = line.kind;
      if (seg.osmRouteIncludes && Array.isArray(line.routes)) {
        const hit = line.routes.find((r) => (r.name || '').includes(seg.osmRouteIncludes));
        if (hit?.path?.length >= 2) {
          srcPath = hit.path;
          srcKind = hit.kind || srcKind;
        }
      }
      if (!srcPath?.length) continue;

      const attachKind = (dest, srcP = srcPath, srcK = srcKind) => {
        if (dest?.length >= 2 && srcK?.length) seg.kind = mapKindToPath(srcP, srcK, dest);
      };

      // 首都机场线：去程经 T3 到 T2，再接 T2→三元桥回程，画成三角环
      if (seg.id === 'bj-airport' && Array.isArray(line.routes)) {
        const outRoute =
          line.routes.find((r) => (r.name || '').includes('→ 2号航站楼')) || { path: srcPath, kind: srcKind };
        const retRoute = line.routes.find((r) => (r.name || '').includes('2号航站楼 →'));
        const out = sliceVia(outRoute.path || srcPath, S('东直门'), S('2号航站楼'), S('3号航站楼'));
        const back =
          retRoute?.path?.length >= 2
            ? sliceVia(retRoute.path, S('2号航站楼'), S('三元桥'))
            : null;
        if (out?.length >= 2 && back?.length >= 2) {
          seg.path = out.concat(back.slice(1));
          const kOut = mapKindToPath(outRoute.path || srcPath, outRoute.kind || srcKind, out);
          const kBack = mapKindToPath(retRoute.path, retRoute.kind || srcKind, back);
          seg.kind = kOut.concat(kBack);
          continue;
        }
        if (out?.length >= 2) {
          seg.path = out;
          attachKind(out, outRoute.path || srcPath, outRoute.kind || srcKind);
          continue;
        }
      }

      if (seg.osmFull) {
        seg.path = srcPath;
        attachKind(srcPath);
        continue;
      }

      const st = (seg.stations || []).filter((s) => s.name && !s.silent);
      if (st.length < 2) continue;
      const from = st[0];
      const to = st[st.length - 1];
      const via = seg.osmVia || (st.length >= 3 ? st[Math.floor(st.length / 2)] : null);
      const sliced = via ? sliceVia(srcPath, from, to, via) : sliceVia(srcPath, from, to, st[1] || via);
      if (sliced?.length >= 2) {
        seg.path = sliced;
        attachKind(sliced);
      }
    }
  }
  return BEIJING_SCENES;
}

function waitOsmUtil() {
  // 同步导入会循环依赖时用动态——这里直接内联 sliceVia 核心
  return {
    sliceVia: (path, from, to, via) => {
      const nearest = (lat, lng) => {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < path.length; i++) {
          const d = Math.hypot(path[i][0] - lat, path[i][1] - lng);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        return best;
      };
      const closed =
        path.length > 3 &&
        Math.hypot(path[0][0] - path[path.length - 1][0], path[0][1] - path[path.length - 1][1]) < 1e-5;
      const a = nearest(from.lat, from.lng);
      const b = nearest(to.lat, to.lng);
      // 非环线也要保证 from→to 方向（否则西行会被切成东行，画完再折回）
      if (!closed) {
        if (a <= b) return path.slice(a, b + 1);
        return path.slice(b, a + 1).reverse();
      }
      const n = path.length - 1;
      const v = via ? nearest(via.lat, via.lng) : -1;
      const between = (fromI, toI, x) => {
        fromI = ((fromI % n) + n) % n;
        toI = ((toI % n) + n) % n;
        x = ((x % n) + n) % n;
        return fromI <= toI ? x >= fromI && x <= toI : x >= fromI || x <= toI;
      };
      const walk = (fromI, toI, dir) => {
        const out = [];
        let i = ((fromI % n) + n) % n;
        const end = ((toI % n) + n) % n;
        out.push(path[i]);
        while (i !== end) {
          i = (i + dir + n) % n;
          out.push(path[i]);
        }
        return out;
      };
      if (v >= 0) {
        if (between(a, b, v)) return walk(a, b, 1);
        return walk(a, b, -1);
      }
      const fwd = walk(a, b, 1);
      const rev = walk(a, b, -1);
      return fwd.length <= rev.length ? fwd : rev;
    },
  };
}

function densifyDedup(path, minM) {
  if (!path?.length) return path;
  const out = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const p = out[out.length - 1];
    const c = path[i];
    if (Math.hypot((c[0] - p[0]) * 111000, (c[1] - p[1]) * 85000) >= minM) out.push(c);
  }
  return out;
}

/** 淡灰：已建成未开通 / 未运营覆盖 */
const GHOST_LINE = '#B0B4B8';

/** 八角游乐园旧称（1996 更名） */
const BAJIAO_CUN = { ...S('八角游乐园'), name: '八角村' };
/** 公主坟旧称（1980 更名）；灰线与早期运营段统一用「立新」，避免同站双名 */
const LIXIN = { ...S('公主坟'), name: '立新' };
/** 古城旧称（2008.2.1 更名） */
const GUCHENG_LU = { ...S('古城'), name: '古城路' };

/** 1969 一期建成：53号站 — 长安街至南礼士路 — 南段至北京站（无复兴门站） */
const PHASE1_1969 = [
  ST53,
  ST52,
  ...slice(L1, '苹果园', '南礼士路').map((st) => {
    if (st.name === '八角游乐园') return BAJIAO_CUN;
    if (st.name === '公主坟') return LIXIN;
    if (st.name === '古城') return GUCHENG_LU;
    return st;
  }),
  ...L2_SOUTH_P1,
];
const PHASE1_1971_01 = (() => {
  const toLixin = [...slice(L1, '公主坟', '南礼士路')].reverse();
  toLixin[toLixin.length - 1] = LIXIN;
  return [
    S('北京站'),
    S('崇文门'),
    S('前门'),
    S('和平门'),
    S('宣武门'),
    S('长椿街'),
    ...toLixin,
  ];
})();

/** 1971.8.5：立新 — 玉泉路 开通运营 */
const PHASE1_1971_08 = (() => {
  // L1 站序西→东；立新(=公主坟)往西到玉泉路
  const seg = [...slice(L1, '玉泉路', '公主坟')].reverse();
  seg[0] = LIXIN;
  return seg;
})();

/** 1971.11.7：玉泉路 — 古城路 对外开放 */
const PHASE1_1971_11 = (() => {
  const west = [...slice(L1, '古城', '玉泉路')].reverse().map((st) =>
    st.name === '八角游乐园' ? BAJIAO_CUN : st
  );
  west[west.length - 1] = GUCHENG_LU;
  return west;
})();

/** 1973.4.23：古城路 — 苹果园 */
const PHASE1_1973 = [GUCHENG_LU, S('苹果园')];

/** 高井 = 一期 53 号站（非对外运营） */
const GAOJING = { name: '高井', lng: ST53.lng, lat: ST53.lat };

/** 1978：苹果园 — 福寿岭 — 高井 · 技校通勤（后两站非运营） */
const PHASE1_1978 = [S('苹果园'), ST52, GAOJING];

/**
 * 北京地铁「简办式」分镜：每一次开通 = 镜头推进 + 画出具体区段
 */
export const BEIJING_SCENES = [
  {
    id: 'bj-l1-1969',
    year: 1969,
    title: '一期建成',
    detail: '10月1日 · 53号站 — 北京站 · 经长礼联络线转弯 · 建成但不对外开放',
    kind: 'metro',
    focusStations: [ST53, S('北京站', 116.4274, 39.9049)],
    segments: [
      {
        id: 'bj-l1-1969',
        line: '一期',
        color: GHOST_LINE,
        style: 'ghost',
        osmKey: 'l1',
        osmPhase1969: true,
        osmVia: S('木樨地'),
        stations: PHASE1_1969,
      },
    ],
  },
  {
    id: 'bj-l1-1971',
    year: 1971,
    title: '一期试运营',
    detail: '1月15日 · 北京站 — 立新 · 经长礼联络线 · 一期对外开放试运营',
    kind: 'metro',
    focusStations: [S('北京站', 116.4274, 39.9049), LIXIN],
    segments: [
      {
        id: 'bj-l1-1971-01',
        line: '一期',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        osmPhase1971_01: true,
        osmVia: S('前门'),
        stations: PHASE1_1971_01,
      },
    ],
  },
  {
    id: 'bj-l1-1971-08',
    year: 1971,
    title: '一期西延至玉泉路',
    detail: '8月15日 · 立新 — 玉泉路 · 开通运营',
    kind: 'metro',
    focusStations: [LIXIN, S('玉泉路')],
    segments: [
      {
        id: 'bj-l1-1971-08',
        line: '一期',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        osmPhase1971_08: true,
        osmVia: S('五棵松'),
        stations: PHASE1_1971_08,
      },
    ],
  },
  {
    id: 'bj-l1-1971-11',
    year: 1971,
    title: '一期西延开通',
    detail: '11月7日 · 玉泉路 — 古城路 · 对外开放运营',
    kind: 'metro',
    focusStations: [S('玉泉路'), GUCHENG_LU],
    segments: [
      {
        id: 'bj-l1-1971-11',
        line: '一期',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        osmPhase1971_11: true,
        osmVia: S('八宝山'),
        stations: PHASE1_1971_11,
      },
    ],
  },
  {
    id: 'bj-l1-1973',
    year: 1973,
    title: '一期通至苹果园',
    detail: '4月23日 · 古城路 — 苹果园 · 开通运营',
    kind: 'metro',
    focusStations: [GUCHENG_LU, S('苹果园')],
    segments: [
      {
        id: 'bj-l1-1973',
        line: '一期',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        osmPhase1973: true,
        stations: PHASE1_1973,
      },
    ],
  },
  {
    id: 'bj-l1-1978',
    year: 1978,
    title: '地铁技校通勤',
    detail: '地铁技校开办 · 每日 2 班 · 苹果园 — 福寿岭（非运营） — 高井（非运营）',
    kind: 'metro',
    focusStations: PHASE1_1978,
    segments: [
      {
        id: 'bj-l1-1978',
        line: '一期通勤',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        osmPhase1978: true,
        stations: PHASE1_1978,
      },
    ],
  },
  {
    id: 'bj-lixin-rename',
    year: 1980,
    title: '立新更名公主坟',
    detail: '立新站按地名更名为公主坟站',
    kind: 'metro',
    focusStations: [S('公主坟')],
    stationRename: {
      from: '立新',
      to: '公主坟',
      lng: S('公主坟').lng,
      lat: S('公主坟').lat,
      color: BJ_LINE_COLORS.l1,
    },
    segments: [],
  },
  {
    id: 'bj-l2-1984',
    year: 1984,
    title: '二期通车',
    detail: '9月20日 · 复兴门 — 建国门（经西直门）',
    kind: 'metro',
    focusStations: L2_1984,
    segments: [
      {
        id: 'bj-l2-a',
        line: '二期',
        color: BJ_LINE_COLORS.l2,
        osmKey: 'l2',
        osmVia: S('西直门', 116.3555, 39.9407),
        stations: L2_1984,
      },
    ],
  },
  {
    id: 'bj-1987-rename',
    year: 1987,
    title: '一期·二期更名',
    detail: '12月28日 · 一期更名一线 · 二期更名环线',
    kind: 'metro',
    focusStations: [S('苹果园'), S('北京站'), S('复兴门'), S('西直门'), S('建国门')],
    /** 已画线路高亮，不新画线 */
    highlightSegIds: [
      'bj-l1-1971-01',
      'bj-l1-1971-08',
      'bj-l1-1971-11',
      'bj-l1-1973',
      'bj-l2-a',
    ],
    segments: [],
  },
  {
    id: 'bj-1987-handoff',
    year: 1987,
    title: '环线成环',
    detail:
      '12月28日 · 一线（北京站 — 长椿街）拆给环线 · 长礼（南礼士路 — 长椿街）撤离 · 南半环复兴门 — 建国门成环 · 一线改接复兴门',
    kind: 'metro',
    focusStations: [S('南礼士路'), S('复兴门'), ...L2_SOUTH_RING],
    /** 一线南段+长礼消散 → 环线南半环 + 一线改接复兴门 */
    lineHandoff: {
      fromColor: BJ_LINE_COLORS.l1,
      trimSegId: 'bj-l1-1971-01',
      /** 从北京站一直裁到南礼士路（含长椿街与长礼），一线自南礼士路往西保留 */
      trimStartName: '北京站',
      trimEndName: '南礼士路',
      /** 叠层消散：先画给环线的段，再画长礼撤离 */
      fadeStations: L2_HANDOFF_FROM_L1,
      fadeExtraStations: [S('长椿街'), S('南礼士路')],
      highlightAfterIds: ['bj-l2-a', 'bj-l2-south', 'bj-l1-fxm'],
      segment: {
        id: 'bj-l2-south',
        line: '环线',
        color: BJ_LINE_COLORS.l2,
        osmKey: 'l2',
        osmHandoff1987: true,
        osmVia: S('前门'),
        stations: L2_SOUTH_RING,
      },
      /** 一线东端改走南礼士路 — 复兴门（不再经长礼） */
      alsoGrow: {
        id: 'bj-l1-fxm',
        line: '一线',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        stations: [S('南礼士路'), S('复兴门')],
      },
    },
    segments: [],
  },
  {
    id: 'bj-fuba-1992',
    year: 1992,
    title: '复八线开通',
    detail: '12月12日 · 复兴门 — 西单',
    kind: 'metro',
    focusStations: slice(L1, '复兴门', '西单'),
    segments: [
      {
        id: 'bj-fuba-a',
        line: '复八线',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        stations: slice(L1, '复兴门', '西单'),
      },
    ],
  },
  {
    id: 'bj-bajiao-rename',
    year: 1996,
    title: '八角村更名八角游乐园',
    detail: '八角村站更名为八角游乐园站',
    kind: 'metro',
    focusStations: [S('八角游乐园')],
    stationRename: {
      from: '八角村',
      to: '八角游乐园',
      lng: S('八角游乐园').lng,
      lat: S('八角游乐园').lat,
      color: BJ_LINE_COLORS.l1,
    },
    segments: [],
  },
  {
    id: 'bj-fuba-1999',
    year: 1999,
    title: '复八线东段开通',
    detail: '9月28日 · 天安门西 — 四惠东 · 开通试运营 · 四惠 — 四惠东为地上区间',
    kind: 'metro',
    focusStations: slice(L1, '天安门西', '四惠东'),
    segments: [
      {
        id: 'bj-fuba-b',
        line: '复八线',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        stations: [
          ...slice(L1, '天安门西', '大望路'),
          Q('四惠西出地面', 116.48694, 39.90771),
          ...slice(L1, '四惠', '四惠东'),
        ],
        groundSpans: [{ from: '四惠西出地面', to: '四惠' }],
        elevatedSpans: [{ from: '四惠', to: '四惠东' }],
      },
    ],
  },
  {
    id: 'bj-fuba-2000',
    year: 2000,
    title: '复八线贯通',
    detail: '6月28日 · 西单 — 天安门西',
    kind: 'metro',
    focusStations: slice(L1, '西单', '天安门西'),
    segments: [
      {
        id: 'bj-fuba-c',
        line: '复八线',
        color: BJ_LINE_COLORS.l1,
        osmKey: 'l1',
        stations: slice(L1, '西单', '天安门西'),
      },
    ],
  },
  {
    id: 'bj-30th-2001',
    year: 2001,
    title: '开通运营30周年',
    detail: '以1971年1月15日试运营起算 · 北京地铁开通运营30周年',
    kind: 'metro',
    fitNetwork: true,
    focusPad: 72,
    focusZoom: 11.5,
    highlightSegIds: [
      'bj-l1-1971-01',
      'bj-l1-1971-08',
      'bj-l1-1971-11',
      'bj-l1-1973',
      'bj-l1-fxm',
      'bj-l2-a',
      'bj-l2-south',
      'bj-fuba-a',
      'bj-fuba-b',
      'bj-fuba-c',
    ],
    segments: [],
  },
  {
    id: 'bj-2002-rename',
    year: 2002,
    title: '一线·环线更名',
    detail: '7月24日 · 一线（含技校铁路）更名1号线 · 环线更名2号线',
    kind: 'metro',
    fitNetwork: true,
    focusPad: 72,
    focusZoom: 11.5,
    highlightSegIds: [
      'bj-l1-1971-01',
      'bj-l1-1971-08',
      'bj-l1-1971-11',
      'bj-l1-1973',
      'bj-l1-1978',
      'bj-l1-fxm',
      'bj-fuba-a',
      'bj-fuba-b',
      'bj-fuba-c',
      'bj-l2-a',
      'bj-l2-south',
    ],
    segments: [],
  },
  {
    id: 'bj-l13-2002',
    year: 2002,
    title: '城铁西线开通',
    detail: '9月28日 · 西直门 — 霍营 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L13, '西直门', '霍营'),
    segments: [
      {
        id: 'bj-l13-a',
        line: '城铁西线',
        color: CHENG_TIE_COLOR,
        osmKey: 'l13',
        stations: slice(L13, '西直门', '霍营'),
      },
    ],
  },
  {
    id: 'bj-l13-2003',
    year: 2003,
    title: '13号线东段开通',
    detail: '1月28日 · 霍营 — 东直门 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L13, '霍营', '东直门'),
    segments: [
      {
        id: 'bj-l13-b',
        line: '城铁东段',
        color: CHENG_TIE_COLOR,
        osmKey: 'l13',
        stations: slice(L13, '霍营', '东直门'),
      },
    ],
  },
  {
    id: 'bj-batong-2003',
    year: 2003,
    title: '八通线开通',
    detail: '四惠 — 土桥，通州接入轨网',
    kind: 'metro',
    focusStations: BATONG,
    segments: [
      {
        id: 'bj-batong',
        line: '八通线',
        color: BJ_LINE_COLORS.batong,
        osmKey: 'l1',
        osmVia: S('管庄', 116.599, 39.9091),
        stations: BATONG,
      },
    ],
  },
  {
    id: 'bj-brt1-2005',
    year: 2005,
    title: '快速公交1开通',
    detail: '12月30日 · 南中轴 BRT · 现运营 德茂庄 — 沙子口',
    kind: 'metro',
    focusStations: BRT1,
    segments: [
      {
        id: 'bj-brt1',
        line: '快速公交1',
        color: BJ_LINE_COLORS.brt1,
        osmKey: 'brt1',
        osmFull: true,
        style: 'bus',
        stations: BRT1,
      },
    ],
  },
  {
    id: 'bj-commute-end-2007',
    year: 2007,
    title: '技校通勤停运',
    detail: '5月28日 · 地铁技校搬迁 · 苹果园 — 福寿岭 — 高井通勤列车不再开行',
    kind: 'metro',
    focusStations: [S('苹果园'), ST52, GAOJING],
    retireSegIds: ['bj-l1-1978'],
    segments: [],
  },
  {
    id: 'bj-l13-metro-2007',
    year: 2007,
    title: '城铁并入地铁',
    detail: '7月9日 · 城铁13号线并入地铁体系 · 启用规范标识色',
    kind: 'metro',
    focusStations: [S('西直门'), S('霍营'), S('东直门')],
    recolor: {
      segIds: ['bj-l13-a', 'bj-l13-b'],
      color: BJ_LINE_COLORS.l13,
      lineName: '13号线',
    },
    segments: [],
  },
  {
    id: 'bj-l5-2007',
    year: 2007,
    title: '5号线开通',
    detail: '10月7日 · 天通苑北 — 宋家庄 · 开通试运营',
    kind: 'metro',
    focusStations: [...L5].reverse(),
    segments: [
      {
        id: 'bj-l5',
        line: '5号线',
        color: BJ_LINE_COLORS.l5,
        osmKey: 'l5',
        stations: [...L5].reverse(),
      },
    ],
  },
  {
    id: 'bj-gucheng-rename',
    year: 2008,
    title: '古城路更名古城',
    detail: '2月1日 · 古城路站更名为古城站',
    kind: 'metro',
    focusStations: [S('古城')],
    stationRename: {
      from: '古城路',
      to: '古城',
      lng: S('古城').lng,
      lat: S('古城').lat,
      color: BJ_LINE_COLORS.l1,
    },
    segments: [],
  },
  {
    id: 'bj-l10-2008',
    year: 2008,
    title: '10号线一期开通',
    detail: '7月19日 · 巴沟 — 劲松 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L10A, '巴沟', '劲松'),
    segments: [
      {
        id: 'bj-l10-a',
        line: '10号线',
        color: BJ_LINE_COLORS.l10,
        osmKey: 'l10',
        stations: slice(L10A, '巴沟', '劲松'),
      },
    ],
  },
  {
    id: 'bj-airport-2008',
    year: 2008,
    title: '机场线开通',
    detail: '7月19日 · 东直门 — 3号航站楼 — 2号航站楼 · 开通试运营',
    kind: 'metro',
    focusStations: AIRPORT.filter((s) => !s.silent),
    segments: [
      {
        id: 'bj-airport',
        line: '机场线',
        color: BJ_LINE_COLORS.airport,
        osmKey: 'airport',
        osmRouteIncludes: '→ 2号航站楼',
        stations: AIRPORT,
      },
    ],
  },
  {
    id: 'bj-l8-2008',
    year: 2008,
    title: '奥运支线开通',
    detail: '7月28日 · 北土城 — 森林公园南门 · 开始载客',
    kind: 'metro',
    focusStations: [...slice(L8N, '北土城', '森林公园南门')].reverse(),
    segments: [
      {
        id: 'bj-l8-a',
        line: '奥运支线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: [...slice(L8N, '北土城', '森林公园南门')].reverse(),
      },
    ],
  },
  {
    id: 'bj-l8-public-2008',
    year: 2008,
    title: '8号线一期开放',
    detail: '10月9日 · 北土城 — 森林公园南门 · 正式对公众开放',
    kind: 'metro',
    focusStations: [...slice(L8N, '北土城', '森林公园南门')].reverse(),
    highlightSegIds: ['bj-l8-a'],
    recolor: {
      segIds: ['bj-l8-a'],
      color: BJ_LINE_COLORS.l8,
      lineName: '8号线',
    },
    segments: [],
  },
  {
    id: 'bj-brt2-2008',
    year: 2008,
    title: '快速公交2开通',
    detail: '7月31日 · 朝阳路 BRT · 杨闸 — 朝阳门',
    kind: 'metro',
    focusStations: BRT2,
    segments: [
      {
        id: 'bj-brt2',
        line: '快速公交2',
        color: BJ_LINE_COLORS.brt2,
        osmKey: 'brt2',
        osmFull: true,
        style: 'bus',
        stations: BRT2,
      },
    ],
  },
  {
    id: 'bj-brt3-2008',
    year: 2008,
    title: '快速公交3开通',
    detail: '7月31日 · 安立路 BRT · 安定门 — 宏福苑小区西',
    kind: 'metro',
    focusStations: BRT3,
    segments: [
      {
        id: 'bj-brt3',
        line: '快速公交3',
        color: BJ_LINE_COLORS.brt3,
        osmKey: 'brt3',
        osmFull: true,
        style: 'bus',
        stations: BRT3,
      },
    ],
  },
  {
    id: 'bj-38th-2009',
    year: 2009,
    title: '开通运营38周年',
    detail: '以1971年1月15日试运营起算 · 北京地铁开通运营38周年',
    kind: 'metro',
    fitNetwork: true,
    focusPad: 72,
    focusZoom: 11,
    highlightSegIds: [
      'bj-l1-1971-01',
      'bj-l1-1971-08',
      'bj-l1-1971-11',
      'bj-l1-1973',
      'bj-l1-fxm',
      'bj-fuba-a',
      'bj-fuba-b',
      'bj-fuba-c',
      'bj-l2-a',
      'bj-l2-south',
      'bj-l13-a',
      'bj-l13-b',
      'bj-batong',
      'bj-l5',
      'bj-l10-a',
      'bj-airport',
      'bj-l8-a',
    ],
    segments: [],
  },
  {
    id: 'bj-l4-2009',
    year: 2009,
    title: '4号线开通',
    detail: '9月28日 · 安河桥北 — 公益西桥 · 开通试运营',
    kind: 'metro',
    focusStations: L4,
    segments: [{ id: 'bj-l4', line: '4号线', color: BJ_LINE_COLORS.l4, osmKey: 'l4', stations: L4 }],
  },
  {
    id: 'bj-xierqi-2010',
    year: 2010,
    title: '西二旗新站房启用',
    detail: '12月25日 · 因无法满足换乘需求 · 西二旗新站房启用',
    kind: 'metro',
    focusStations: [S('西二旗')],
    highlightSegIds: ['bj-l13-a'],
    segments: [],
  },
  {
    id: 'bj-changping-2010',
    year: 2010,
    title: '昌平线一期开通',
    detail: '12月30日 · 西二旗 — 南邵 · 开通试运营',
    kind: 'metro',
    focusStations: slice(CHANGPING, '西二旗', '南邵'),
    segments: [
      {
        id: 'bj-changping-a',
        line: '昌平线',
        color: BJ_LINE_COLORS.changping,
        osmKey: 'changping',
        stations: slice(CHANGPING, '西二旗', '南邵'),
      },
    ],
  },
  {
    id: 'bj-l15-2010',
    year: 2010,
    title: '15号线一期开通',
    detail: '12月30日 · 望京西 — 后沙峪 · 开通运营（望京东暂缓）',
    kind: 'metro',
    focusStations: slice(L15, '望京西', '后沙峪'),
    segments: [
      {
        id: 'bj-l15-a',
        line: '15号线',
        color: BJ_LINE_COLORS.l15,
        osmKey: 'l15',
        stations: deferStations(slice(L15, '望京西', '后沙峪'), ['望京东']),
      },
    ],
  },
  {
    id: 'bj-daxing-2010',
    year: 2010,
    title: '大兴线贯通开通',
    detail: '12月30日 · 公益西桥 — 天宫院 · 与4号线贯通 · 开通试运营',
    kind: 'metro',
    focusStations: DAXING,
    segments: [
      {
        id: 'bj-daxing',
        line: '4号线',
        color: BJ_LINE_COLORS.daxing,
        osmKey: 'l4',
        stations: DAXING,
      },
    ],
  },
  {
    id: 'bj-fangshan-2010',
    year: 2010,
    title: '房山线一期开通',
    detail: '12月30日 · 大葆台 — 苏庄 · 开通运营',
    kind: 'metro',
    focusStations: slice(FANGSHAN, '大葆台', '苏庄'),
    segments: [
      {
        id: 'bj-fangshan-a',
        line: '房山线',
        color: BJ_LINE_COLORS.fangshan,
        osmKey: 'fangshan',
        stations: slice(FANGSHAN, '大葆台', '苏庄'),
      },
    ],
  },
  {
    id: 'bj-lin1-2010',
    year: 2010,
    title: '临1路接驳开通',
    detail: '12月30日 · 大葆台 — 新宫 · 解决房山线脱网运行',
    kind: 'metro',
    focusStations: LIN1_SHUTTLE,
    segments: [
      {
        id: 'bj-lin1',
        line: '临1路',
        color: '#8A6A3C',
        style: 'shuttle',
        stations: LIN1_SHUTTLE,
      },
    ],
  },
  {
    id: 'bj-yizhuang-2010',
    year: 2010,
    title: '亦庄线一期开通',
    detail: '12月30日 · 宋家庄 — 次渠 · 开通运营',
    kind: 'metro',
    focusStations: slice(YIZHUANG, '宋家庄', '次渠'),
    segments: [
      {
        id: 'bj-yizhuang-a',
        line: '亦庄线',
        color: BJ_LINE_COLORS.yizhuang,
        osmKey: 'yizhuang',
        stations: slice(YIZHUANG, '宋家庄', '次渠'),
      },
    ],
  },
  {
    id: 'bj-40th-2011',
    year: 2011,
    title: '开通运营40周年',
    detail: '以1971年1月15日试运营起算 · 北京地铁开通运营40周年',
    kind: 'metro',
    fitNetwork: true,
    focusPad: 64,
    focusZoom: 10.5,
    highlightSegIds: [
      'bj-l1-1971-01',
      'bj-l1-1971-08',
      'bj-l1-1971-11',
      'bj-l1-1973',
      'bj-l1-fxm',
      'bj-fuba-a',
      'bj-fuba-b',
      'bj-fuba-c',
      'bj-l2-a',
      'bj-l2-south',
      'bj-l13-a',
      'bj-l13-b',
      'bj-batong',
      'bj-l5',
      'bj-l10-a',
      'bj-airport',
      'bj-l8-a',
      'bj-l4',
      'bj-changping-a',
      'bj-l15-a',
      'bj-daxing',
      'bj-fangshan-a',
      'bj-lin1',
      'bj-yizhuang-a',
    ],
    segments: [],
  },
  {
    id: 'bj-l8-pause-2011',
    year: 2011,
    title: '8号线一期停运换装',
    detail: '10月15日 · 森林公园南门 — 北土城 · 信号系统换装联调（暂不演示线位）',
    kind: 'metro',
    focusStations: slice(L8N, '森林公园南门', '北土城'),
    segments: [],
  },
  {
    id: 'bj-l8n-2011',
    year: 2011,
    title: '8号线二期北段',
    detail: '12月31日 · 回龙观东大街 — 北土城 · 一期恢复 · 开通试运营',
    kind: 'metro',
    focusStations: [...slice(L8N, '回龙观东大街', '森林公园南门')].reverse(),
    segments: [
      {
        id: 'bj-l8-n',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: [...slice(L8N, '回龙观东大街', '森林公园南门')].reverse(),
      },
    ],
  },
  {
    id: 'bj-l9-2011',
    year: 2011,
    title: '9号线南段开通',
    detail: '12月31日 · 郭公庄 — 北京西站 · 开通试运营（丰台东大街暂缓）',
    kind: 'metro',
    focusStations: [...slice(L9, '郭公庄', '北京西站')].reverse(),
    segments: [
      {
        id: 'bj-l9-a',
        line: '9号线',
        color: BJ_LINE_COLORS.l9,
        osmKey: 'l9',
        stations: deferStations([...slice(L9, '郭公庄', '北京西站')].reverse(), ['丰台东大街']),
      },
    ],
  },
  {
    id: 'bj-fangshan-2011',
    year: 2011,
    title: '房山线北延',
    detail: '12月31日 · 大葆台 — 郭公庄 · 与9号线衔接',
    kind: 'metro',
    focusStations: slice(FANGSHAN, '大葆台', '郭公庄'),
    segments: [
      {
        id: 'bj-fangshan-b',
        line: '房山线',
        color: BJ_LINE_COLORS.fangshan,
        osmKey: 'fangshan',
        stations: [...slice(FANGSHAN, '大葆台', '郭公庄')].reverse(),
      },
    ],
  },
  {
    id: 'bj-l15-2011',
    year: 2011,
    title: '15号线东段开通',
    detail: '12月31日 · 后沙峪 — 俸伯 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L15, '后沙峪', '俸伯'),
    segments: [
      {
        id: 'bj-l15-b',
        line: '15号线',
        color: BJ_LINE_COLORS.l15,
        osmKey: 'l15',
        stations: slice(L15, '后沙峪', '俸伯'),
      },
    ],
  },
  {
    id: 'bj-fengtai-east-2012',
    year: 2012,
    title: '丰台东大街启用',
    detail: '10月12日 · 9号线丰台东大街站开通运营',
    kind: 'metro',
    focusStations: [S('丰台东大街')],
    segments: [
      {
        id: 'bj-l9-fengtai-east',
        line: '9号线',
        color: BJ_LINE_COLORS.l9,
        osmKey: 'l9',
        stations: [S('丰台东大街')],
      },
    ],
  },
  {
    id: 'bj-l6-2012',
    year: 2012,
    title: '6号线一期开通',
    detail: '12月30日 · 海淀五路居 — 草房 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L6, '海淀五路居', '草房'),
    segments: [
      {
        id: 'bj-l6-a',
        line: '6号线',
        color: BJ_LINE_COLORS.l6,
        osmKey: 'l6',
        stations: deferStations(slice(L6, '海淀五路居', '草房'), ['二里沟']),
      },
    ],
  },
  {
    id: 'bj-brt4-2012',
    year: 2012,
    title: '快速公交4开通',
    detail: '12月30日 · 阜石路 BRT · 龙泉西 — 阜成门',
    kind: 'metro',
    focusStations: BRT4,
    segments: [
      {
        id: 'bj-brt4',
        line: '快速公交4',
        color: BJ_LINE_COLORS.brt4,
        osmKey: 'brt4',
        osmFull: true,
        style: 'bus',
        stations: BRT4,
      },
    ],
  },
  {
    id: 'bj-l8s-2012',
    year: 2012,
    title: '8号线二期南段',
    detail: '12月30日 · 北土城 — 鼓楼大街 · 开通试运营',
    kind: 'metro',
    focusStations: L8S_2012,
    segments: [
      {
        id: 'bj-l8-b',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: L8S_2012,
      },
    ],
  },
  {
    id: 'bj-l9n-2012',
    year: 2012,
    title: '9号线北段开通',
    detail: '12月30日 · 北京西站 — 国家图书馆 · 房山线接入线网（军事博物馆暂缓）',
    kind: 'metro',
    focusStations: slice(L9, '北京西站', '国家图书馆'),
    retireSegIds: ['bj-lin1'],
    segments: [
      {
        id: 'bj-l9-b',
        line: '9号线',
        color: BJ_LINE_COLORS.l9,
        osmKey: 'l9',
        stations: deferStations(slice(L9, '北京西站', '国家图书馆'), ['军事博物馆']),
      },
    ],
  },
  {
    id: 'bj-l10-2012',
    year: 2012,
    title: '10号线二期开通',
    detail: '12月30日 · C形运营（断点：丰台、泥洼；角门东暂缓）',
    kind: 'metro',
    focusStations: [...L10_C_SOUTH, ...L10_C_WEST],
    segments: [
      {
        id: 'bj-l10-b1',
        line: '10号线',
        color: BJ_LINE_COLORS.l10,
        osmKey: 'l10',
        stations: L10_C_SOUTH,
      },
      {
        id: 'bj-l10-b2',
        line: '10号线',
        color: BJ_LINE_COLORS.l10,
        osmKey: 'l10',
        stations: L10_C_WEST,
      },
    ],
  },
  {
    id: 'bj-l10-2013',
    year: 2013,
    title: '10号线成环',
    detail: '5月5日 · 丰台、泥洼、角门东开通 · 北京第二条环线',
    kind: 'metro',
    focusStations: [S('首经贸'), S('丰台站'), S('泥洼'), S('西局'), S('角门东'), S('角门西')],
    segments: [
      {
        id: 'bj-l10-b3',
        line: '10号线',
        color: BJ_LINE_COLORS.l10,
        osmKey: 'l10',
        stations: [S('首经贸'), S('丰台站'), S('泥洼'), S('西局')],
      },
      {
        id: 'bj-l10-b4',
        line: '10号线',
        color: BJ_LINE_COLORS.l10,
        osmKey: 'l10',
        stations: [S('大红门'), S('角门东'), S('角门西')],
      },
    ],
  },
  {
    id: 'bj-l14-2013',
    year: 2013,
    title: '14号线西段开通',
    detail: '5月5日 · 张郭庄 — 西局 · 开通试运营（七里庄暂缓）',
    kind: 'metro',
    focusStations: slice(L14, '张郭庄', '西局'),
    segments: [
      {
        id: 'bj-l14-a',
        line: '14号线',
        color: BJ_LINE_COLORS.l14,
        osmKey: 'l14',
        elevatedSpans: [{ from: '张郭庄', to: '园博园' }],
        stations: deferStations(slice(L14, '张郭庄', '西局'), ['七里庄']),
      },
    ],
  },
  {
    id: 'bj-junbo-2013',
    year: 2013,
    title: '军事博物馆启用',
    detail: '12月21日 · 9号线军事博物馆站开通运营',
    kind: 'metro',
    focusStations: [S('军事博物馆')],
    segments: [
      {
        id: 'bj-l9-junbo',
        line: '9号线',
        color: BJ_LINE_COLORS.l9,
        osmKey: 'l9',
        stations: [S('军事博物馆')],
      },
    ],
  },
  {
    id: 'bj-l8s-2013',
    year: 2013,
    title: '8号线南段再延',
    detail: '12月28日 · 鼓楼大街 — 南锣鼓巷 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L8S, '鼓楼大街', '南锣鼓巷'),
    segments: [
      {
        id: 'bj-l8-c',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: slice(L8S, '鼓楼大街', '南锣鼓巷'),
      },
    ],
  },
  {
    id: 'bj-l8n-2013',
    year: 2013,
    title: '8号线北延朱辛庄',
    detail: '12月28日 · 回龙观东大街 — 朱辛庄 · 与昌平线同台换乘',
    kind: 'metro',
    focusStations: [...slice(L8N, '回龙观东大街', '朱辛庄')].reverse(),
    segments: [
      {
        id: 'bj-l8-n2',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        elevatedSpans: [{ from: '育知路', to: '朱辛庄' }],
        stations: [...slice(L8N, '回龙观东大街', '朱辛庄')].reverse(),
      },
    ],
  },
  {
    id: 'bj-l14-qilizhuang-2014',
    year: 2014,
    title: '七里庄启用',
    detail: '2月15日 · 14号线七里庄站开通运营',
    kind: 'metro',
    focusStations: [S('七里庄')],
    openStations: ['七里庄'],
    segments: [],
  },
  {
    id: 'bj-l7-2014',
    year: 2014,
    title: '7号线一期开通',
    detail: '12月28日 · 北京西站 — 焦化厂 · 开通试运营（双井、垡头暂缓）',
    kind: 'metro',
    focusStations: slice(L7, '北京西站', '焦化厂'),
    segments: [
      {
        id: 'bj-l7-a',
        line: '7号线',
        color: BJ_LINE_COLORS.l7,
        osmKey: 'l7',
        stations: deferStations(slice(L7, '北京西站', '焦化厂'), ['双井', '垡头']),
      },
    ],
  },
  {
    id: 'bj-l14e-2014',
    year: 2014,
    title: '14号线东段开通',
    detail: '12月28日 · 金台路 — 善各庄 · 开通试运营（朝阳公园、高家园暂缓）',
    kind: 'metro',
    focusStations: slice(L14, '金台路', '善各庄'),
    segments: [
      {
        id: 'bj-l14-b',
        line: '14号线',
        color: BJ_LINE_COLORS.l14,
        osmKey: 'l14',
        stations: deferStations(slice(L14, '金台路', '善各庄'), ['朝阳公园', '高家园']),
      },
    ],
  },
  {
    id: 'bj-l15w-2014',
    year: 2014,
    title: '15号线西段开通',
    detail: '12月28日 · 清华东路西口 — 望京西 · 开通试运营（大屯路东暂缓）',
    kind: 'metro',
    focusStations: [...slice(L15, '清华东路西口', '望京西')].reverse(),
    segments: [
      {
        id: 'bj-l15-c',
        line: '15号线',
        color: BJ_LINE_COLORS.l15,
        osmKey: 'l15',
        stations: deferStations([...slice(L15, '清华东路西口', '望京西')].reverse(), ['大屯路东']),
      },
    ],
  },
  {
    id: 'bj-l6-2014',
    year: 2014,
    title: '6号线东延通州',
    detail: '12月28日 · 草房 — 潞城 · 开通试运营（北运河东、通运门暂缓）',
    kind: 'metro',
    focusStations: slice(L6, '草房', '潞城'),
    segments: [
      {
        id: 'bj-l6-b',
        line: '6号线',
        color: BJ_LINE_COLORS.l6,
        osmKey: 'l6',
        stations: deferStations(slice(L6, '草房', '潞城'), ['北运河东', '通运门']),
      },
    ],
  },
  {
    id: 'bj-l14m-2015',
    year: 2015,
    title: '14号线中段开通',
    detail: '12月26日 · 金台路 — 北京南站 · 与东段贯通（陶然桥、平乐园暂缓）',
    kind: 'metro',
    focusStations: slice(L14, '金台路', '北京南站'),
    segments: [
      {
        id: 'bj-l14-c',
        line: '14号线',
        color: BJ_LINE_COLORS.l14,
        osmKey: 'l14',
        stations: deferStations(slice(L14, '金台路', '北京南站'), ['陶然桥', '平乐园']),
      },
    ],
  },
  {
    id: 'bj-changping-2015',
    year: 2015,
    title: '昌平线二期开通',
    detail: '12月26日 · 南邵 — 昌平西山口 · 开通试运营',
    kind: 'metro',
    focusStations: slice(CHANGPING, '南邵', '昌平西山口'),
    segments: [
      {
        id: 'bj-changping-b',
        line: '昌平线',
        color: BJ_LINE_COLORS.changping,
        osmKey: 'changping',
        stations: slice(CHANGPING, '南邵', '昌平西山口'),
      },
    ],
  },
  {
    id: 'bj-l8-anderi-2015',
    year: 2015,
    title: '安德里北街启用',
    detail: '12月26日 · 8号线安德里北街站开通运营',
    kind: 'metro',
    focusStations: [S('安德里北街')],
    segments: [
      {
        id: 'bj-l8-anderi',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: [S('安德里北街')],
      },
    ],
  },
  {
    id: 'bj-l15-datun-2015',
    year: 2015,
    title: '大屯路东启用',
    detail: '12月26日 · 15号线大屯路东站开通运营',
    kind: 'metro',
    focusStations: [S('大屯路东')],
    segments: [
      {
        id: 'bj-l15-datun',
        line: '15号线',
        color: BJ_LINE_COLORS.l15,
        osmKey: 'l15',
        stations: [S('大屯路东')],
      },
    ],
  },
  {
    id: 'bj-l16n-2016',
    year: 2016,
    title: '16号线北段开通',
    detail: '12月31日 · 北安河 — 西苑 · 开通试运营（农大南路暂缓）',
    kind: 'metro',
    focusStations: slice(L16, '北安河', '西苑'),
    segments: [
      {
        id: 'bj-l16-a',
        line: '16号线',
        color: BJ_LINE_COLORS.l16,
        osmKey: 'l16',
        stations: deferStations(slice(L16, '北安河', '西苑'), ['农大南路']),
      },
    ],
  },
  {
    id: 'bj-l14-chaoyang-2016',
    year: 2016,
    title: '朝阳公园启用',
    detail: '12月31日 · 14号线朝阳公园站开通运营',
    kind: 'metro',
    focusStations: [S('朝阳公园')],
    openStations: ['朝阳公园'],
    segments: [],
  },
  {
    id: 'bj-l15-wangjingdong-2016',
    year: 2016,
    title: '望京东启用',
    detail: '12月31日 · 15号线望京东站开通运营',
    kind: 'metro',
    focusStations: [S('望京东')],
    segments: [
      {
        id: 'bj-l15-wangjingdong',
        line: '15号线',
        color: BJ_LINE_COLORS.l15,
        osmKey: 'l15',
        stations: [S('望京东')],
      },
    ],
  },
  {
    id: 'bj-s1-2017',
    year: 2017,
    title: 'S1线开通',
    detail: '12月30日 · 石厂 — 金安桥 · 北京首条磁浮线路',
    kind: 'metro',
    focusStations: slice(S1, '石厂', '金安桥'),
    segments: [
      {
        id: 'bj-s1-a',
        line: 'S1线',
        color: BJ_LINE_COLORS.s1,
        osmKey: 's1',
        elevatedSpans: [{ from: '石厂', to: '金安桥' }],
        stations: slice(S1, '石厂', '金安桥'),
      },
    ],
  },
  {
    id: 'bj-yanfang-2017',
    year: 2017,
    title: '燕房线开通',
    detail: '12月30日 · 阎村东 — 燕山 · 开通试运营',
    kind: 'metro',
    focusStations: slice(YANFANG, '阎村东', '燕山'),
    segments: [
      {
        id: 'bj-yanfang-a',
        line: '燕房线',
        color: BJ_LINE_COLORS.yanfang,
        osmKey: 'yanfang',
        elevatedSpans: [{ from: '阎村东', to: '燕山' }],
        stations: slice(YANFANG, '阎村东', '燕山'),
      },
    ],
  },
  {
    id: 'bj-fangshan-2017',
    year: 2017,
    title: '房山线南延',
    detail: '12月30日 · 苏庄 — 阎村东 · 与燕房线衔接',
    kind: 'metro',
    focusStations: slice(FANGSHAN, '苏庄', '阎村东'),
    segments: [
      {
        id: 'bj-fangshan-c',
        line: '房山线',
        color: BJ_LINE_COLORS.fangshan,
        osmKey: 'fangshan',
        stations: slice(FANGSHAN, '苏庄', '阎村东'),
      },
    ],
  },
  {
    id: 'bj-xijiao-2017',
    year: 2017,
    title: '西郊线开通',
    detail: '12月30日 · 巴沟 — 香山 · 北京首条现代有轨电车',
    kind: 'metro',
    focusStations: XIJIAO,
    segments: [
      {
        id: 'bj-xijiao',
        line: '西郊线',
        color: BJ_LINE_COLORS.xijiao,
        osmKey: 'xijiao',
        groundSpans: [{ from: '巴沟', to: '香山' }],
        stations: XIJIAO,
      },
    ],
  },
  {
    id: 'bj-l16-nongda-2017',
    year: 2017,
    title: '农大南路启用',
    detail: '12月30日 · 16号线农大南路站开通运营',
    kind: 'metro',
    focusStations: [S('农大南路')],
    openStations: ['农大南路'],
    segments: [],
  },
  {
    id: 'bj-l14-pingleyuan-2017',
    year: 2017,
    title: '平乐园启用',
    detail: '12月30日 · 14号线平乐园站开通运营',
    kind: 'metro',
    focusStations: [S('平乐园')],
    openStations: ['平乐园'],
    segments: [],
  },
  {
    id: 'bj-l6w-2018',
    year: 2018,
    title: '6号线西延开通',
    detail: '12月30日 · 海淀五路居 — 金安桥 · 开通试运营（苹果园暂缓）',
    kind: 'metro',
    focusStations: [...slice(L6, '海淀五路居', '金安桥')].reverse(),
    segments: [
      {
        id: 'bj-l6-c',
        line: '6号线',
        color: BJ_LINE_COLORS.l6,
        osmKey: 'l6',
        stations: deferStations([...slice(L6, '海淀五路居', '金安桥')].reverse(), ['苹果园']),
      },
    ],
  },
  {
    id: 'bj-l6-beiyun-2018',
    year: 2018,
    title: '北运河东启用',
    detail: '12月30日 · 6号线北运河东站开通运营',
    kind: 'metro',
    focusStations: [S('北运河东')],
    openStations: ['北运河东'],
    segments: [],
  },
  {
    id: 'bj-l7-fatou-2018',
    year: 2018,
    title: '垡头启用',
    detail: '12月30日 · 7号线垡头站开通运营',
    kind: 'metro',
    focusStations: [S('垡头')],
    openStations: ['垡头'],
    segments: [],
  },
  {
    id: 'bj-l8-meishu-2018',
    year: 2018,
    title: '8号线南锣—美术馆',
    detail: '12月30日 · 南锣鼓巷 — 中国美术馆 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L8S, '南锣鼓巷', '中国美术馆'),
    segments: [
      {
        id: 'bj-l8-e',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: slice(L8S, '南锣鼓巷', '中国美术馆'),
      },
    ],
  },
  {
    id: 'bj-l8-2018',
    year: 2018,
    title: '8号线南段开通',
    detail: '12月30日 · 珠市口 — 瀛海 · 开通试运营（大红门南暂缓）',
    kind: 'metro',
    focusStations: slice(L8S, '珠市口', '瀛海'),
    segments: [
      {
        id: 'bj-l8-d',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: deferStations(slice(L8S, '珠市口', '瀛海'), ['大红门南']),
      },
    ],
  },
  {
    id: 'bj-yizhuang-2018',
    year: 2018,
    title: '亦庄线东延',
    detail: '12月30日 · 次渠 — 亦庄火车站 · 开通试运营',
    kind: 'metro',
    focusStations: slice(YIZHUANG, '次渠', '亦庄火车站'),
    segments: [
      {
        id: 'bj-yizhuang-b',
        line: '亦庄线',
        color: BJ_LINE_COLORS.yizhuang,
        stations: slice(YIZHUANG, '次渠', '亦庄火车站'),
      },
    ],
  },
  {
    id: 'bj-daxing-airport-2019',
    year: 2019,
    title: '大兴机场线开通',
    detail: '9月26日 · 草桥 — 大兴机场 · 开通运营',
    kind: 'metro',
    focusStations: DAXING_AIRPORT,
    segments: [
      {
        id: 'bj-daxing-airport',
        line: '大兴机场线',
        color: BJ_LINE_COLORS.daxingAirport,
        osmKey: 'daxingAirport',
        stations: DAXING_AIRPORT,
      },
    ],
  },
  {
    id: 'bj-l7e-2019',
    year: 2019,
    title: '7号线东延开通',
    detail: '12月28日 · 焦化厂 — 花庄 · 双井站同步启用',
    kind: 'metro',
    focusStations: [...slice(L7, '焦化厂', '花庄'), S('双井')],
    openStations: ['双井'],
    segments: [
      {
        id: 'bj-l7-b',
        line: '7号线',
        color: BJ_LINE_COLORS.l7,
        osmKey: 'l7',
        stations: slice(L7, '焦化厂', '花庄'),
      },
    ],
  },
  {
    id: 'bj-batong-2019',
    year: 2019,
    title: '八通线南延',
    detail: '12月28日 · 土桥 — 花庄 · 开通试运营',
    kind: 'metro',
    focusStations: slice(BATONG, '土桥', '花庄'),
    segments: [
      {
        id: 'bj-batong-b',
        line: '八通线',
        color: BJ_LINE_COLORS.batong,
        stations: slice(BATONG, '土桥', '花庄'),
      },
    ],
  },
  {
    id: 'bj-l13-qinghe-2019',
    year: 2019,
    title: '清河站启用',
    detail: '12月30日 · 13号线清河站开通运营',
    kind: 'metro',
    focusStations: [S('清河站')],
    segments: [
      {
        id: 'bj-l13-qinghe',
        line: '13号线',
        color: BJ_LINE_COLORS.l13,
        osmKey: 'l13',
        stations: [S('清河站')],
      },
    ],
  },
  {
    id: 'bj-l16m-2020',
    year: 2020,
    title: '16号线中段开通',
    detail: '12月31日 · 西苑 — 甘家口 · 开通试运营（苏州街、二里沟暂缓）',
    kind: 'metro',
    focusStations: slice(L16, '西苑', '甘家口'),
    segments: [
      {
        id: 'bj-l16-b',
        line: '16号线',
        color: BJ_LINE_COLORS.l16,
        osmKey: 'l16',
        stations: deferStations(slice(L16, '西苑', '甘家口'), ['苏州街', '二里沟']),
      },
    ],
  },
  {
    id: 'bj-fangshan-n-2020',
    year: 2020,
    title: '房山线北延',
    detail: '12月31日 · 郭公庄 — 东管头南 · 开通试运营',
    kind: 'metro',
    focusStations: [...slice(FANGSHAN, '郭公庄', '东管头南')].reverse(),
    segments: [
      {
        id: 'bj-fangshan-d',
        line: '房山线',
        color: BJ_LINE_COLORS.fangshan,
        osmKey: 'fangshan',
        stations: [...slice(FANGSHAN, '郭公庄', '东管头南')].reverse(),
      },
    ],
  },
  {
    id: 'bj-yizhuang-t1-2020',
    year: 2020,
    title: '亦庄有轨电车T1开通',
    detail: '12月31日 · 屈庄 — 定海园 · 老观里暂缓',
    kind: 'metro',
    focusStations: YIZHUANG_T1,
    segments: [
      {
        id: 'bj-yizhuang-t1',
        line: '亦庄有轨电车T1',
        color: BJ_LINE_COLORS.yizhuangT1,
        osmKey: 'yizhuangT1',
        groundSpans: [{ from: '屈庄', to: '定海园' }],
        stations: YIZHUANG_T1,
      },
    ],
  },
  {
    id: 'bj-universal-2021',
    year: 2021,
    title: '环球度假区开通',
    detail: '8月26日 · 7号线 / 八通线花庄 — 环球度假区',
    kind: 'metro',
    focusStations: slice(L7, '花庄', '环球度假区'),
    segments: [
      {
        id: 'bj-l7-c',
        line: '7号线',
        color: BJ_LINE_COLORS.l7,
        osmKey: 'l7',
        stations: slice(L7, '花庄', '环球度假区'),
      },
      {
        id: 'bj-batong-c',
        line: '八通线',
        color: BJ_LINE_COLORS.batong,
        stations: slice(BATONG, '花庄', '环球度假区'),
      },
    ],
  },
  {
    id: 'bj-l1-batong-2021',
    year: 2021,
    title: '1号线·八通线贯通',
    detail: '8月29日 · 苹果园 — 环球度假区贯通运营',
    kind: 'metro',
    fitNetwork: true,
    focusPad: 48,
    focusZoom: 11,
    highlightSegIds: ['bj-l1-1971-01', 'bj-fuba-c', 'bj-batong', 'bj-batong-b', 'bj-batong-c'],
    segments: [],
  },
  {
    id: 'bj-l8-mid-2021',
    year: 2021,
    title: '8号线剩余段贯通',
    detail: '12月31日 · 中国美术馆 — 珠市口 · 全线贯通',
    kind: 'metro',
    focusStations: slice(L8S, '中国美术馆', '珠市口'),
    segments: [
      {
        id: 'bj-l8-f',
        line: '8号线',
        color: BJ_LINE_COLORS.l8,
        osmKey: 'l8',
        stations: slice(L8S, '中国美术馆', '珠市口'),
      },
    ],
  },
  {
    id: 'bj-l11-2021',
    year: 2021,
    title: '11号线西段开通',
    detail: '12月31日 · 金安桥 — 新首钢 · 冬奥支线',
    kind: 'metro',
    focusStations: slice(L11, '金安桥', '新首钢'),
    segments: [
      {
        id: 'bj-l11-a',
        line: '11号线',
        color: BJ_LINE_COLORS.l11,
        stations: slice(L11, '金安桥', '新首钢'),
      },
    ],
  },
  {
    id: 'bj-l14-through-2021',
    year: 2021,
    title: '14号线剩余段贯通',
    detail: '12月31日 · 西局 — 北京南站 · 东西贯通',
    kind: 'metro',
    focusStations: slice(L14, '西局', '北京南站'),
    segments: [
      {
        id: 'bj-l14-d',
        line: '14号线',
        color: BJ_LINE_COLORS.l14,
        osmKey: 'l14',
        stations: deferStations(slice(L14, '西局', '北京南站'), ['陶然桥']),
      },
    ],
  },
  {
    id: 'bj-l17s-2021',
    year: 2021,
    title: '17号线南段开通',
    detail: '12月31日 · 十里河 — 嘉会湖 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L17S, '十里河', '嘉会湖'),
    segments: [
      {
        id: 'bj-l17-a',
        line: '17号线',
        color: BJ_LINE_COLORS.l17,
        osmKey: 'l17',
        stations: L17S,
      },
    ],
  },
  {
    id: 'bj-l19-2021',
    year: 2021,
    title: '19号线一期开通',
    detail: '12月31日 · 牡丹园 — 新宫 · 开通试运营（北太平庄、平安里、太平桥、景风门暂缓）',
    kind: 'metro',
    focusStations: L19,
    segments: [
      {
        id: 'bj-l19-a',
        line: '19号线',
        color: BJ_LINE_COLORS.l19,
        osmKey: 'l19',
        stations: deferStations(L19, ['北太平庄', '平安里', '太平桥', '景风门']),
      },
    ],
  },
  {
    id: 'bj-s1-pingguoyuan-2021',
    year: 2021,
    title: 'S1线东延苹果园',
    detail: '12月31日 · 金安桥 — 苹果园 · 6号线苹果园同步启用',
    kind: 'metro',
    focusStations: slice(S1, '金安桥', '苹果园'),
    openStations: ['苹果园'],
    segments: [
      {
        id: 'bj-s1-b',
        line: 'S1线',
        color: BJ_LINE_COLORS.s1,
        osmKey: 's1',
        elevatedSpans: [{ from: '金安桥', to: '苹果园' }],
        stations: slice(S1, '金安桥', '苹果园'),
      },
    ],
  },
  {
    id: 'bj-l16-yuyuantan-2021',
    year: 2021,
    title: '16号线中段再延',
    detail: '12月31日 · 甘家口 — 玉渊潭东门 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L16, '甘家口', '玉渊潭东门'),
    segments: [
      {
        id: 'bj-l16-yuyuantan',
        line: '16号线',
        color: BJ_LINE_COLORS.l16,
        osmKey: 'l16',
        stations: slice(L16, '甘家口', '玉渊潭东门'),
      },
    ],
  },
  {
    id: 'bj-airport-west-2021',
    year: 2021,
    title: '机场线西延',
    detail: '12月31日 · 东直门 — 北新桥 · 开通试运营',
    kind: 'metro',
    focusStations: AIRPORT_WEST,
    segments: [
      {
        id: 'bj-airport-b',
        line: '机场线',
        color: BJ_LINE_COLORS.airport,
        osmKey: 'airport',
        osmRouteIncludes: '→ 2号航站楼',
        stations: [...AIRPORT_WEST].reverse(),
      },
    ],
  },
  {
    id: 'bj-changping-qinghe-2021',
    year: 2021,
    title: '昌平线南延清河',
    detail: '12月31日 · 西二旗 — 清河站 · 开通试运营',
    kind: 'metro',
    focusStations: [...slice(CHANGPING, '西二旗', '清河站')].reverse(),
    segments: [
      {
        id: 'bj-changping-c',
        line: '昌平线',
        color: BJ_LINE_COLORS.changping,
        osmKey: 'changping',
        stations: [...slice(CHANGPING, '西二旗', '清河站')].reverse(),
      },
    ],
  },
  {
    id: 'bj-l19-stations-2022',
    year: 2022,
    title: '19号线四站启用',
    detail: '7月30日 · 北太平庄、平安里、太平桥、景风门开通运营',
    kind: 'metro',
    focusStations: [S('北太平庄'), S('平安里'), S('太平桥'), S('景风门')],
    openStations: ['北太平庄', '平安里', '太平桥', '景风门'],
    segments: [],
  },
  {
    id: 'bj-l16s-2022',
    year: 2022,
    title: '16号线南段开通',
    detail: '12月31日 · 玉渊潭东门 — 榆树庄 · 开通试运营（丽泽商务区暂缓）',
    kind: 'metro',
    focusStations: slice(L16, '玉渊潭东门', '榆树庄'),
    segments: [
      {
        id: 'bj-l16-c',
        line: '16号线',
        color: BJ_LINE_COLORS.l16,
        osmKey: 'l16',
        stations: deferStations(slice(L16, '玉渊潭东门', '榆树庄'), ['丽泽商务区']),
      },
    ],
  },
  {
    id: 'bj-changping-xitucheng-2023',
    year: 2023,
    title: '昌平线南延西土城',
    detail: '2月4日 · 清河站 — 西土城 · 开通试运营（朱房北暂缓）',
    kind: 'metro',
    focusStations: [...slice(CHANGPING, '清河站', '西土城')].reverse(),
    segments: [
      {
        id: 'bj-changping-d',
        line: '昌平线',
        color: BJ_LINE_COLORS.changping,
        osmKey: 'changping',
        stations: deferStations([...slice(CHANGPING, '清河站', '西土城')].reverse(), ['朱房北']),
      },
    ],
  },
  {
    id: 'bj-erligou-2023',
    year: 2023,
    title: '二里沟启用',
    detail: '3月18日 · 6号线 / 16号线二里沟站开通运营',
    kind: 'metro',
    focusStations: [S('二里沟')],
    openStations: ['二里沟'],
    segments: [],
  },
  {
    id: 'bj-l11-moshikou-2023',
    year: 2023,
    title: '11号线模式口开通',
    detail: '12月30日 · 金安桥 — 模式口 · 开通试运营',
    kind: 'metro',
    focusStations: slice(L11, '模式口', '金安桥'),
    segments: [
      {
        id: 'bj-l11-b',
        line: '11号线',
        color: BJ_LINE_COLORS.l11,
        stations: slice(L11, '模式口', '金安桥'),
      },
    ],
  },
  {
    id: 'bj-l16-end-2023',
    year: 2023,
    title: '16号线剩余段开通',
    detail: '12月30日 · 榆树庄 — 宛平城 · 苏州街同步启用',
    kind: 'metro',
    focusStations: [...slice(L16, '榆树庄', '宛平城'), S('苏州街')],
    openStations: ['苏州街'],
    segments: [
      {
        id: 'bj-l16-d',
        line: '16号线',
        color: BJ_LINE_COLORS.l16,
        osmKey: 'l16',
        stations: slice(L16, '榆树庄', '宛平城'),
      },
    ],
  },
  {
    id: 'bj-l17n-2023',
    year: 2023,
    title: '17号线北段开通',
    detail: '12月30日 · 未来科学城北 — 工人体育场 · 开通试运营（望京西暂缓）',
    kind: 'metro',
    focusStations: L17N,
    segments: [
      {
        id: 'bj-l17-b',
        line: '17号线',
        color: BJ_LINE_COLORS.l17,
        osmKey: 'l17',
        stations: deferStations(L17N, ['望京西']),
      },
    ],
  },
  {
    id: 'bj-l3-2024',
    year: 2024,
    title: '3号线一期开通',
    detail: '12月15日 · 东四十条 — 东坝北 · 开通试运营',
    kind: 'metro',
    focusStations: L3,
    segments: [
      {
        id: 'bj-l3-a',
        line: '3号线',
        color: BJ_LINE_COLORS.l3,
        osmKey: 'l3',
        stations: L3,
      },
    ],
  },
  {
    id: 'bj-l12-2024',
    year: 2024,
    title: '12号线开通',
    detail: '12月15日 · 四季青桥 — 东坝北 · 开通试运营',
    kind: 'metro',
    focusStations: L12,
    segments: [
      {
        id: 'bj-l12-a',
        line: '12号线',
        color: BJ_LINE_COLORS.l12,
        osmKey: 'l12',
        stations: L12,
      },
    ],
  },
  {
    id: 'bj-changping-end-2024',
    year: 2024,
    title: '昌平线南延收官',
    detail: '12月15日 · 西土城 — 蓟门桥 · 朱房北同步启用',
    kind: 'metro',
    focusStations: [...slice(CHANGPING, '西土城', '蓟门桥'), S('朱房北')].reverse(),
    openStations: ['朱房北'],
    segments: [
      {
        id: 'bj-changping-e',
        line: '昌平线',
        color: BJ_LINE_COLORS.changping,
        osmKey: 'changping',
        stations: [...slice(CHANGPING, '西土城', '蓟门桥')].reverse(),
      },
    ],
  },
  {
    id: 'bj-l17m-2025',
    year: 2025,
    date: '2025-12-27',
    title: '17号线中段开通',
    detail: '12月 · 工人体育场 — 十里河 · 南北贯通',
    kind: 'metro',
    focusStations: L17M,
    segments: [
      {
        id: 'bj-l17-m',
        line: '17号线',
        color: BJ_LINE_COLORS.l17,
        osmKey: 'l17',
        stations: L17M,
      },
    ],
  },
  {
    id: 'bj-l18-2025',
    year: 2025,
    date: '2025-12-27',
    title: '18号线开通',
    detail: '12月 · 马连洼 — 天通苑东',
    kind: 'metro',
    focusStations: L18,
    segments: [
      {
        id: 'bj-l18-a',
        line: '18号线',
        color: BJ_LINE_COLORS.l18,
        osmKey: 'l18',
        stations: L18,
      },
    ],
  },
  {
    id: 'bj-l22-2026',
    year: 2026,
    date: '2026-12-31',
    title: '22号线平谷线（规划开通）',
    detail: '年底具备开通条件 · 红庙 — 平谷 · OSM 在建线位',
    kind: 'metro',
    planned: true,
    focus: { lng: 116.7, lat: 40.0, zoom: 10.5 },
    segments: [
      {
        id: 'bj-l22-a',
        line: '22号线',
        color: BJ_LINE_COLORS.l22,
        style: 'planned',
        stations: [],
      },
    ],
  },
  {
    id: 'bj-l28-2030',
    year: 2030,
    title: '28号线CBD线（规划）',
    detail: '在建推进 · OSM 线位',
    kind: 'metro',
    planned: true,
    focus: { lng: 116.45, lat: 39.91, zoom: 12 },
    segments: [
      {
        id: 'bj-l28-a',
        line: '28号线',
        color: BJ_LINE_COLORS.l28,
        style: 'planned',
        stations: [],
      },
    ],
  },
  {
    id: 'bj-daxing-n-2035',
    year: 2035,
    title: '大兴机场线北延（规划）',
    detail: '草桥 — 丽泽商务区 · OSM 在建线位',
    kind: 'metro',
    planned: true,
    focus: { lng: 116.32, lat: 39.86, zoom: 12 },
    segments: [
      {
        id: 'bj-daxing-n',
        line: '大兴机场线北延',
        color: BJ_LINE_COLORS.daxingAirport,
        style: 'planned',
        stations: [],
      },
    ],
  },
  {
    id: 'bj-buses',
    year: 2026,
    title: '北京公交线网',
    detail: '1路起全市公共汽电车 · OSM 线位',
    kind: 'metro',
    segments: [],
  },
  {
    id: 'bj-finale',
    year: 2035,
    title: '北京轨网成型',
    detail: '超大线网 · 规划/在建虚线收到 2035',
    kind: 'metro',
    fitNetwork: true,
    focusPad: 56,
    focusZoom: 10.2,
    focus: { lng: 116.40, lat: 39.92, zoom: 11 },
    segments: [],
    overview: true,
  },
].map((sc) => {
  if (sc.focusStations && !sc.focus) {
    const m = mid(sc.focusStations);
    sc.focus = { lng: m.lng, lat: m.lat, zoom: 14 };
  }
  return sc;
});

/** 把全市公交线挂到 bj-buses 分镜（就地改数组，时间轴已浅拷贝过同一引用） */
export function bindBeijingBuses(data) {
  const sc = BEIJING_SCENES.find((s) => s.id === 'bj-buses');
  if (!sc || !data?.lines?.length) return;
  const skip = /快速公交|^BRT|西郊|亦庄有轨/i;
  const segs = data.lines
    .filter((l) => l.path?.length >= 2 && !skip.test(l.name || l.ref || ''))
    .map((l) => ({
      id: `bj-bus-${l.id || l.ref}`,
      line: l.name,
      color: l.color,
      style: 'bus',
      osmFull: true,
      path: l.path,
      skipLabels: true,
      stations: l.stations || [],
    }));
  sc.segments.length = 0;
  sc.segments.push(...segs);
}
