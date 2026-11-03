/**
 * 中国高铁发展史场景（对照简办《中国高铁》2003–2025 / 八纵八横）
 * 站序走 network.js 走廊；本文件负责时间线与文案。
 */
import { CORRIDORS, getCorridorPlaces, PLACES } from './network.js';

function corridorById(id) {
  const c = CORRIDORS.find((x) => x.id === id);
  if (!c) throw new Error(`hsr corridor missing: ${id}`);
  return c;
}

function sceneFromCorridor(id, { year, title, detail, zoomPad = 1.2, milestone, planned } = {}) {
  const corridor = corridorById(id);
  const places = getCorridorPlaces(corridor);
  const mid = places[Math.floor(places.length / 2)];
  const isPlanned = !!planned || corridor.status === 'planned';
  const y = year ?? corridor.year;
  return {
    id: `hsr-${id}-${y}`,
    year: y,
    title: title || (isPlanned ? `${corridor.name}（规划/在建）` : `${corridor.name}开通`),
    detail,
    kind: 'hsr',
    planned: isPlanned,
    focusStations: places,
    focusPad: zoomPad,
    milestone: !!milestone,
    segments: [
      {
        id: `seg-${id}-${y}`,
        line: corridor.name,
        color: isPlanned ? '#8aabb8' : corridor.type === 'hsr' ? '#4eb8ff' : '#4fd39a',
        stations: places,
        style: isPlanned ? 'planned' : 'hsr',
      },
    ],
    focus: mid ? { lng: mid.lng, lat: mid.lat, zoom: 6.5 } : undefined,
  };
}

function yearMark(year, title, detail) {
  return {
    id: `hsr-mark-${year}`,
    year,
    title,
    detail,
    kind: 'hsr',
    planned: true,
    milestone: true,
    focus: { lng: 108, lat: 35, zoom: 4.2 },
    fitNetwork: true,
    focusPad: 48,
    focusZoom: 4.3,
    segments: [],
    overview: true,
  };
}

/** 简办式高铁主时间线（运营开通节点） */
export const HSR_SCENES = [
  {
    id: 'hsr-intro',
    year: 2003,
    title: '中国高铁时代开启',
    detail: '从秦沈客专起步 · 走向八纵八横',
    kind: 'hsr',
    focus: { lng: 108, lat: 35, zoom: 4.2 },
    segments: [],
  },
  sceneFromCorridor('qsh', {
    year: 2003,
    title: '秦沈客运专线开通',
    detail: '10月12日 · 秦皇岛 — 沈阳 · 中国首条客专',
    zoomPad: 1.05,
  }),
  {
    id: 'hsr-speedup-2007',
    year: 2007,
    title: '第六次大提速',
    detail: '4月18日 · 和谐号动车组规模开行 · 进入动车时代',
    kind: 'hsr',
    focus: { lng: 112, lat: 34, zoom: 4.4 },
    milestone: true,
    segments: [],
  },
  sceneFromCorridor('hening', {
    year: 2008,
    title: '合宁铁路开通',
    detail: '4月18日 · 合肥 — 南京 · 时速250公里客专',
    zoomPad: 1.1,
  }),
  sceneFromCorridor('jj', {
    year: 2008,
    title: '京津城际开通',
    detail: '8月1日 · 北京南 — 天津 · 时速350公里城际',
    zoomPad: 0.95,
  }),
  sceneFromCorridor('shitai', {
    year: 2009,
    title: '石太客专开通',
    detail: '4月1日 · 石家庄 — 太原',
    zoomPad: 1.1,
  }),
  sceneFromCorridor('yongtaiwen', {
    year: 2009,
    title: '甬台温铁路开通',
    detail: '9月28日 · 宁波 — 温州 · 东南沿海通道',
    zoomPad: 1.15,
  }),
  sceneFromCorridor('wenfu', {
    year: 2009,
    title: '温福铁路开通',
    detail: '9月28日 · 温州 — 福州',
    zoomPad: 1.15,
  }),
  sceneFromCorridor('wg', {
    year: 2009,
    title: '武广高铁开通',
    detail: '12月26日 · 武汉 — 广州南 · 长距离干线高铁',
    zoomPad: 1.35,
  }),
  sceneFromCorridor('zhengxi', {
    year: 2010,
    title: '郑西高铁开通',
    detail: '2月6日 · 郑州 — 西安 · 湿陷性黄土地区高铁',
    zoomPad: 1.2,
  }),
  sceneFromCorridor('fuxia-old', {
    year: 2010,
    title: '福厦铁路开通',
    detail: '4月26日 · 福州 — 厦门 · 时速250公里',
    zoomPad: 1.15,
  }),
  sceneFromCorridor('huning', {
    year: 2010,
    title: '沪宁城际开通',
    detail: '7月1日 · 上海 — 南京',
    zoomPad: 1.1,
  }),
  sceneFromCorridor('huhang', {
    year: 2010,
    title: '沪杭高铁开通',
    detail: '10月26日 · 上海虹桥 — 杭州东 · CRH380A 投入',
    zoomPad: 1.05,
  }),
  sceneFromCorridor('changjiu', {
    year: 2010,
    title: '昌九城际开通',
    detail: '9月20日 · 南昌 — 九江',
    zoomPad: 1.05,
  }),
  sceneFromCorridor('jinghu', {
    year: 2011,
    title: '京沪高铁开通',
    detail: '6月30日 · 北京南 — 上海虹桥 · 1318 公里干线',
    zoomPad: 1.4,
    milestone: true,
  }),
  sceneFromCorridor('hajia', {
    year: 2012,
    title: '哈大高铁开通',
    detail: '12月1日 · 哈尔滨 — 大连 · 高寒地区高铁',
    zoomPad: 1.3,
  }),
  sceneFromCorridor('jingguang', {
    year: 2012,
    title: '京广高铁全线贯通',
    detail: '12月26日 · 北京西 — 广州南 · 2298 公里',
    zoomPad: 1.45,
    milestone: true,
  }),
  sceneFromCorridor('ninghang', {
    year: 2013,
    title: '宁杭高铁开通',
    detail: '7月1日 · 南京南 — 杭州东',
    zoomPad: 1.1,
  }),
  sceneFromCorridor('hangyong', {
    year: 2013,
    title: '杭甬高铁开通',
    detail: '7月1日 · 杭州东 — 宁波',
    zoomPad: 1.05,
  }),
  sceneFromCorridor('xi-bao', {
    year: 2013,
    title: '西宝高铁开通',
    detail: '12月28日 · 西安北 — 宝鸡南',
    zoomPad: 1.05,
  }),
  sceneFromCorridor('xiashen', {
    year: 2013,
    title: '厦深铁路开通',
    detail: '12月28日 · 厦门 — 深圳 · 东南沿海贯通',
    zoomPad: 1.25,
  }),
  sceneFromCorridor('guiguang', {
    year: 2014,
    title: '贵广高铁开通',
    detail: '12月26日 · 贵阳北 — 广州南',
    zoomPad: 1.3,
  }),
  sceneFromCorridor('nan-guang', {
    year: 2014,
    title: '南广高铁开通',
    detail: '12月26日 · 南宁东 — 广州南',
    zoomPad: 1.25,
  }),
  sceneFromCorridor('hangchang', {
    year: 2014,
    title: '杭长高铁开通',
    detail: '12月10日 · 杭州东 — 长沙南 · 沪昆通道东段',
    zoomPad: 1.3,
  }),
  sceneFromCorridor('lanxin2', {
    year: 2014,
    title: '兰新高铁开通',
    detail: '12月26日 · 兰州 — 乌鲁木齐 · 穿越戈壁大风区',
    zoomPad: 1.45,
  }),
  sceneFromCorridor('qingrong', {
    year: 2014,
    title: '青荣城际开通',
    detail: '12月28日 · 青岛 — 荣成 · 胶东半岛',
    zoomPad: 1.15,
  }),
  sceneFromCorridor('hefu', {
    year: 2015,
    title: '合福高铁开通',
    detail: '6月28日 · 合肥南 — 福州 · 穿越黄山武夷',
    zoomPad: 1.25,
  }),
  sceneFromCorridor('chengmianle', {
    year: 2015,
    title: '成渝高铁开通',
    detail: '12月26日 · 成都东 — 重庆北',
    zoomPad: 1.15,
  }),
  sceneFromCorridor('hainan-east', {
    year: 2015,
    title: '海南环岛高铁贯通',
    detail: '12月30日 · 环岛东段西段连通 · 世界最南高铁环线',
    zoomPad: 1.0,
  }),
  sceneFromCorridor('kunyu', {
    year: 2016,
    title: '沪昆高铁全线贯通',
    detail: '12月28日 · 上海虹桥 — 昆明南 · 东西大通道',
    zoomPad: 1.5,
    milestone: true,
  }),
  sceneFromCorridor('nankun', {
    year: 2016,
    title: '南昆客专开通',
    detail: '12月28日 · 南宁 — 昆明南 · 云南接入高铁网',
    zoomPad: 1.3,
  }),
  {
    id: 'hsr-fuxing-2017',
    year: 2017,
    title: '复兴号 · 京沪提速',
    detail: '9月21日 · 京沪高铁恢复时速350公里运营',
    kind: 'hsr',
    focusStations: getCorridorPlaces(corridorById('jinghu')),
    focusPad: 1.35,
    milestone: true,
    segments: [
      {
        id: 'seg-jinghu-350',
        line: '京沪高铁',
        color: '#ff6b4a',
        stations: getCorridorPlaces(corridorById('jinghu')),
        style: 'hsr',
      },
    ],
  },
  sceneFromCorridor('bao-lan', {
    year: 2017,
    title: '宝兰高铁开通',
    detail: '7月9日 · 宝鸡南 — 兰州西',
    zoomPad: 1.2,
  }),
  sceneFromCorridor('xicheng', {
    year: 2017,
    title: '西成高铁开通',
    detail: '12月6日 · 西安北 — 成都东 · 穿越秦岭',
    zoomPad: 1.25,
  }),
  sceneFromCorridor('hanghuang', {
    year: 2018,
    title: '杭黄高铁开通',
    detail: '12月25日 · 杭州东 — 黄山北',
    zoomPad: 1.1,
  }),
  sceneFromCorridor('jingzhang', {
    year: 2019,
    title: '京张高铁开通',
    detail: '12月30日 · 北京北 — 张家口 · 智能高铁',
    zoomPad: 1.05,
  }),
  sceneFromCorridor('chenggui', {
    year: 2019,
    title: '成贵高铁开通',
    detail: '12月16日 · 成都 — 贵阳 · 乐山宜宾段贯通',
    zoomPad: 1.25,
  }),
  sceneFromCorridor('yinxi', {
    year: 2020,
    title: '银西高铁开通',
    detail: '12月26日 · 银川 — 西安',
    zoomPad: 1.25,
  }),
  sceneFromCorridor('taijiao', {
    year: 2020,
    title: '太焦高铁开通',
    detail: '12月12日 · 太原 — 焦作 · 接入郑州方向',
    zoomPad: 1.15,
  }),
  sceneFromCorridor('shanghehang', {
    year: 2020,
    title: '商合杭高铁开通',
    detail: '6月28日 / 12月22日 · 商丘 — 合肥 — 杭州分段贯通',
    zoomPad: 1.3,
  }),
  sceneFromCorridor('jingha', {
    year: 2021,
    title: '京哈高铁承沈段开通',
    detail: '1月22日 · 承德 — 沈阳 · 京哈高铁全线贯通',
    zoomPad: 1.35,
  }),
  sceneFromCorridor('zhengyu', {
    year: 2022,
    title: '郑渝高铁全线贯通',
    detail: '6月20日 · 郑州东 — 重庆北',
    zoomPad: 1.35,
  }),
  sceneFromCorridor('guinan', {
    year: 2023,
    title: '贵南高铁开通',
    detail: '8月8日 · 贵阳 — 南宁',
    zoomPad: 1.25,
  }),
  sceneFromCorridor('fuxia', {
    year: 2023,
    title: '福厦高铁开通',
    detail: '9月28日 · 福州 — 厦门 · 时速350公里沿海高铁',
    zoomPad: 1.15,
  }),
  sceneFromCorridor('hushuhu', {
    year: 2024,
    title: '沪苏湖高铁开通',
    detail: '12月26日 · 上海虹桥 — 湖州',
    zoomPad: 1.05,
  }),
  sceneFromCorridor('xiyan', {
    year: 2025,
    title: '西延高铁开通',
    detail: '西安 — 延安 · 革命老区接入高铁网',
    zoomPad: 1.1,
  }),
  {
    id: 'hsr-finale',
    year: 2025,
    title: '高铁突破 5 万公里',
    detail: '已开通主干成型 · 运营里程世界第一',
    kind: 'hsr',
    focus: { lng: 108, lat: 35, zoom: 4.2 },
    fitNetwork: true,
    focusPad: 48,
    focusZoom: 4.3,
    segments: [],
    overview: true,
    milestone: true,
  },
  yearMark(2026, '2026 · 十五五开局', '一批在建高铁冲刺开通 · 虚线为规划/在建（时间以公告为准）'),
  sceneFromCorridor('xiongshang', {
    title: '雄商高铁',
    detail: '计划开通 · 京港（台）通道 · 雄安 — 商丘',
    zoomPad: 1.2,
    planned: true,
  }),
  sceneFromCorridor('xiongxin', {
    year: 2026,
    title: '雄忻高铁',
    detail: '力争建成 · 雄安 — 忻州 — 太原',
    zoomPad: 1.2,
    planned: true,
  }),

  yearMark(2027, '2027 · 高铁集中建成年', '成渝地区与东部通道多条干线计划建成通车'),
  sceneFromCorridor('chengyu-mid', {
    title: '成渝中线高铁',
    detail: '计划开通 · 成渝双城 1 小时通勤走廊',
    zoomPad: 1.1,
    planned: true,
  }),
  sceneFromCorridor('yukun', {
    title: '渝昆高铁',
    detail: '计划开通 · 重庆 — 宜宾 — 昭通 — 昆明',
    zoomPad: 1.3,
    planned: true,
  }),
  sceneFromCorridor('jinwei', {
    title: '津潍高铁',
    detail: '计划开通 · 天津 — 潍坊 · 京沪二通道北段',
    zoomPad: 1.15,
    planned: true,
  }),
  sceneFromCorridor('chengdawan', {
    title: '成达万高铁',
    detail: '计划开通 · 成都 — 达州 — 万州',
    zoomPad: 1.2,
    planned: true,
  }),
  sceneFromCorridor('yuwuan', {
    title: '渝万高铁',
    detail: '计划开通 · 重庆 — 万州 · 成渝地区环线',
    zoomPad: 1.05,
    planned: true,
  }),
  sceneFromCorridor('tongsujiayong', {
    title: '通苏嘉甬高铁',
    detail: '计划开通 · 南通 — 苏州 — 嘉兴 — 宁波',
    zoomPad: 1.15,
    planned: true,
  }),

  yearMark(2028, '2028 · 通道继续加密', '西渝、沿海与中南通道等项目计划建成'),
  sceneFromCorridor('xiyu', {
    title: '西渝高铁',
    detail: '计划开通 · 西安 — 安康 — 万州 — 重庆',
    zoomPad: 1.25,
    planned: true,
  }),
  sceneFromCorridor('wenfu350', {
    title: '温福高铁',
    detail: '计划开通 · 沿海通道 350 公里级补强',
    zoomPad: 1.15,
    planned: true,
  }),
  sceneFromCorridor('hezhan', {
    title: '合湛高铁',
    detail: '计划开通 · 包（银）海通道中南段',
    zoomPad: 1.35,
    planned: true,
  }),

  yearMark(2029, '2029 · 路网填平补齐', '区域联络线与省内高铁继续投产 · 向六万公里迈进'),

  yearMark(2030, '2030 · 八纵八横基本成网', '高铁营业里程目标约 6 万公里 · 骨干通道全面加强'),
  sceneFromCorridor('huyurong', {
    title: '沪渝蓉沿江高铁',
    detail: '规划建成 · 沿江通道补强 · 上海 — 重庆 — 成都',
    zoomPad: 1.45,
    planned: true,
  }),
  sceneFromCorridor('chuanzang', {
    title: '川藏铁路',
    detail: '规划/在建 · 成都 — 雅安 — 林芝 — 拉萨',
    zoomPad: 1.45,
    planned: true,
  }),
  sceneFromCorridor('baoeayu', {
    title: '包鄂榆高铁',
    detail: '规划 · 包（银）海通道北段收官',
    zoomPad: 1.15,
    planned: true,
  }),

  yearMark(2031, '2031 · 十五五中后期', '加密成网 · 补齐西部与跨区域留白段'),
  yearMark(2032, '2032 · 路网持续延伸', '区域城际与高铁联络线继续建成'),
  yearMark(2033, '2033 · 通道能力再提升', '既有通道扩能与新建段落交织推进'),
  yearMark(2034, '2034 · 迈向下一目标年', '为 2035 远景路网夯实骨架'),

  {
    id: 'hsr-plan-finale',
    year: 2035,
    title: '规划网远景',
    detail: '实线已开通 · 虚线规划/在建 · 对照简办展望图',
    kind: 'hsr',
    planned: true,
    focus: { lng: 108, lat: 35, zoom: 4.2 },
    fitNetwork: true,
    focusPad: 52,
    focusZoom: 4.2,
    segments: [],
    overview: true,
    milestone: true,
  },
];

/** 供 HUD 展示：仅高铁型走廊 */
export function listHsrCorridors() {
  return CORRIDORS.filter((c) => c.type === 'hsr');
}

export function listPlannedHsrCorridors() {
  return CORRIDORS.filter((c) => c.type === 'hsr' && c.status === 'planned');
}

export { PLACES };
