import { BEIJING_SCENES } from './beijingMetro.js';
import { SHANGHAI_SCENES } from './shanghaiMetro.js';
import { GUANGZHOU_SCENES } from './guangzhouMetro.js';
import { SHENZHEN_SCENES } from './shenzhenMetro.js';
import { TIANJIN_SCENES } from './tianjinMetro.js';
import { CHONGQING_SCENES } from './chongqingMetro.js';
import { WUHAN_SCENES } from './wuhanMetro.js';
import { CHENGDU_SCENES } from './chengduMetro.js';
import { HANGZHOU_SCENES } from './hangzhouMetro.js';
import { NANJING_SCENES } from './nanjingMetro.js';
import { HONGKONG_SCENES } from './hongkongRail.js';
import { XIAN_SCENES } from './xianMetro.js';
import { SUZHOU_SCENES } from './suzhouMetro.js';
import { QINGDAO_SCENES } from './qingdaoMetro.js';
import { ZHENGZHOU_SCENES } from './zhengzhouMetro.js';
import { CHANGSHA_SCENES } from './changshaMetro.js';
import { HEFEI_SCENES } from './hefeiMetro.js';
import { NANCHANG_SCENES } from './nanchangMetro.js';
import { NANNING_SCENES } from './nanningMetro.js';
import { JINAN_SCENES } from './jinanMetro.js';
import { SHIJIAZHUANG_SCENES } from './shijiazhuangMetro.js';
import { KUNMING_SCENES } from './kunmingMetro.js';
import { FUZHOU_SCENES } from './fuzhouMetro.js';
import { NINGBO_SCENES } from './ningboMetro.js';
import { WUXI_SCENES } from './wuxiMetro.js';
import { DONGGUAN_SCENES } from './dongguanMetro.js';
import { CHANGCHUN_SCENES } from './changchunMetro.js';
import { DALIAN_SCENES } from './dalianMetro.js';
import { SHENYANG_SCENES } from './shenyangMetro.js';
import { FOSHAN_SCENES } from './foshanMetro.js';
import { TAIPEI_SCENES } from './taipeiMetro.js';
import { KAOHSIUNG_SCENES } from './kaohsiungMetro.js';
import { HARBIN_SCENES } from './harbinMetro.js';
import { XIAMEN_SCENES } from './xiamenMetro.js';
import { GUIYANG_SCENES } from './guiyangMetro.js';
import { URUMQI_SCENES } from './urumqiMetro.js';
import { WENZHOU_SCENES } from './wenzhouMetro.js';
import { LANZHOU_SCENES } from './lanzhouMetro.js';
import { XUZHOU_SCENES } from './xuzhouMetro.js';
import { CHANGZHOU_SCENES } from './changzhouMetro.js';
import { HOHHOT_SCENES } from './hohhotMetro.js';
import { TAIYUAN_SCENES } from './taiyuanMetro.js';
import { LUOYANG_SCENES } from './luoyangMetro.js';
import { SHAOXING_SCENES } from './shaoxingMetro.js';
import { WUHU_SCENES } from './wuhuMetro.js';
import { NANTONG_SCENES } from './nantongMetro.js';
import { JINHUA_SCENES } from './jinhuaMetro.js';
import { TAIZHOUZJ_SCENES } from './taizhouzjMetro.js';
import { MACAU_SCENES } from './macauMetro.js';
import { TAICHUNG_SCENES } from './taichungMetro.js';
import { TAOYUAN_SCENES } from './taoyuanMetro.js';
import { CHUZHOU_SCENES } from './chuzhouMetro.js';
import { XUCHANG_SCENES } from './xuchangMetro.js';
import { ZIYANG_SCENES } from './ziyangMetro.js';
import { HAINING_SCENES } from './hainingMetro.js';
import { PLACES } from './network.js';
import { attachCityBusScenes } from './cityBuses.js';
import { HSR_SCENES } from './hsrHistory.js';
import { CHINA_RAIL_SCENES } from './chinaRail.js';
import {
  METRO_CITY_OPENINGS,
  eraLabelForOpening,
  yearOfOpening,
} from './metroCityOpenings.js';

export { HSR_SCENES };

/**
 * 有逐段开通数据的城市：整段时间线并入全国一条播放轴
 * 香港：简办九广铁路（1910）+ 港铁（1979）
 * 其余新接入城：对照 Downloads 简办 3.0 视频 + 高德站位
 */
export const DETAILED_CITIES = [
  { id: 'hongkong', scenes: HONGKONG_SCENES },
  { id: 'beijing', scenes: BEIJING_SCENES },
  { id: 'tianjin', scenes: TIANJIN_SCENES },
  { id: 'shanghai', scenes: SHANGHAI_SCENES },
  { id: 'guangzhou', scenes: GUANGZHOU_SCENES },
  { id: 'chongqing', scenes: CHONGQING_SCENES },
  { id: 'shenzhen', scenes: SHENZHEN_SCENES },
  { id: 'nanjing', scenes: NANJING_SCENES },
  { id: 'wuhan', scenes: WUHAN_SCENES },
  { id: 'chengdu', scenes: CHENGDU_SCENES },
  { id: 'hangzhou', scenes: HANGZHOU_SCENES },
  { id: 'xian', scenes: XIAN_SCENES },
  { id: 'suzhou', scenes: SUZHOU_SCENES },
  { id: 'kunming', scenes: KUNMING_SCENES },
  { id: 'zhengzhou', scenes: ZHENGZHOU_SCENES },
  { id: 'changsha', scenes: CHANGSHA_SCENES },
  { id: 'ningbo', scenes: NINGBO_SCENES },
  { id: 'wuxi', scenes: WUXI_SCENES },
  { id: 'qingdao', scenes: QINGDAO_SCENES },
  { id: 'nanchang', scenes: NANCHANG_SCENES },
  { id: 'fuzhou', scenes: FUZHOU_SCENES },
  { id: 'dongguan', scenes: DONGGUAN_SCENES },
  { id: 'nanning', scenes: NANNING_SCENES },
  { id: 'hefei', scenes: HEFEI_SCENES },
  { id: 'shijiazhuang', scenes: SHIJIAZHUANG_SCENES },
  { id: 'jinan', scenes: JINAN_SCENES },
  { id: 'changchun', scenes: CHANGCHUN_SCENES },
  { id: 'dalian', scenes: DALIAN_SCENES },
  { id: 'shenyang', scenes: SHENYANG_SCENES },
  { id: 'foshan', scenes: FOSHAN_SCENES },
  { id: 'taipei', scenes: TAIPEI_SCENES },
  { id: 'kaohsiung', scenes: KAOHSIUNG_SCENES },
  { id: 'harbin', scenes: HARBIN_SCENES },
  { id: 'xiamen', scenes: XIAMEN_SCENES },
  { id: 'guiyang', scenes: GUIYANG_SCENES },
  { id: 'urumqi', scenes: URUMQI_SCENES },
  { id: 'wenzhou', scenes: WENZHOU_SCENES },
  { id: 'lanzhou', scenes: LANZHOU_SCENES },
  { id: 'xuzhou', scenes: XUZHOU_SCENES },
  { id: 'changzhou', scenes: CHANGZHOU_SCENES },
  { id: 'hohhot', scenes: HOHHOT_SCENES },
  { id: 'taiyuan', scenes: TAIYUAN_SCENES },
  { id: 'luoyang', scenes: LUOYANG_SCENES },
  { id: 'shaoxing', scenes: SHAOXING_SCENES },
  { id: 'wuhu', scenes: WUHU_SCENES },
  { id: 'nantong', scenes: NANTONG_SCENES },
  { id: 'jinhua', scenes: JINHUA_SCENES },
  { id: 'taizhouzj', scenes: TAIZHOUZJ_SCENES },
  { id: 'macau', scenes: MACAU_SCENES },
  { id: 'taichung', scenes: TAICHUNG_SCENES },
  { id: 'taoyuan', scenes: TAOYUAN_SCENES },
  { id: 'chuzhou', scenes: CHUZHOU_SCENES },
  { id: 'xuchang', scenes: XUCHANG_SCENES },
  { id: 'ziyang', scenes: ZIYANG_SCENES },
  { id: 'haining', scenes: HAINING_SCENES },
];

attachCityBusScenes(DETAILED_CITIES);

const DETAILED_IDS = new Set(DETAILED_CITIES.map((c) => c.id));

const OPENING_BY_ID = Object.fromEntries(METRO_CITY_OPENINGS.map((o) => [o.id, o]));

const CHINA_FOCUS = { lng: 108, lat: 35, zoom: 4.15 };

const HSR_SKIP = new Set(['hsr-intro', 'hsr-finale', 'hsr-plan-finale']);

function isCityFinale(sc) {
  return typeof sc.id === 'string' && /-finale$/.test(sc.id);
}

function cityEraLabel(id) {
  const o = OPENING_BY_ID[id];
  if (o) return eraLabelForOpening(o);
  const p = PLACES[id];
  return p ? `${p.name}地铁` : '城市轨道';
}

function lightUpScene(o) {
  const year = yearOfOpening(o);
  const place = PLACES[o.id] || {
    id: o.id,
    name: o.name,
    lng: o.lng,
    lat: o.lat,
    metro: year,
  };
  return {
    id: `metro-open-${o.id}`,
    year,
    title:
      o.system === '港铁'
        ? '香港港铁开通'
        : `${o.name}${o.system || '地铁'}开通`,
    detail: `${o.date.replace(/-/g, '.')} · ${o.name}接入全国城轨图`,
    kind: 'metro',
    cityId: o.id,
    eraLabel: eraLabelForOpening(o),
    focus: { lng: o.lng, lat: o.lat, zoom: 8.2 },
    cityDot: place,
    segments: [],
  };
}

function buildUnifiedScenes() {
  let seq = 0;
  const events = [];

  // 0) 干线铁路（吴淞等），按年插入全国轴
  for (const sc of CHINA_RAIL_SCENES) {
    events.push({
      ...sc,
      cityId: sc.cityId,
      eraLabel: sc.eraLabel || '铁路',
      _seq: seq++,
      _rail: true,
    });
  }

  // 1) 有逐段线网：保留每条线路 grow；首镜带城标与简办简介名
  for (const { id, scenes } of DETAILED_CITIES) {
    const eraLabel = cityEraLabel(id);
    const city = PLACES[id];
    let first = true;
    for (const sc of scenes) {
      if (isCityFinale(sc)) continue;
      events.push({
        ...sc,
        cityId: id,
        eraLabel: sc.eraLabel || eraLabel,
        cityDot: first && city ? city : sc.cityDot,
        _seq: seq++,
      });
      first = false;
    }
  }

  // 2) 简办年表达全量城市：无逐段数据的只点亮城标（含香港/台北/澳门等）
  for (const o of METRO_CITY_OPENINGS) {
    if (DETAILED_IDS.has(o.id)) continue;
    events.push({ ...lightUpScene(o), _seq: seq++ });
  }

  // 3) 高铁开通 + 规划
  for (const sc of HSR_SCENES) {
    if (HSR_SKIP.has(sc.id)) continue;
    events.push({
      ...sc,
      _seq: seq++,
      _hsr: true,
    });
  }

  events.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const ar = a._hsr ? 1 : 0;
    const br = b._hsr ? 1 : 0;
    if (ar !== br) return ar - br;
    const ad = a.date || '';
    const bd = b.date || '';
    if (ad && bd && ad !== bd) return ad < bd ? -1 : 1;
    if (ad && !bd) return -1;
    if (!ad && bd) return 1;
    return a._seq - b._seq;
  });

  return [
    {
      id: 'china-intro',
      year: 1865,
      title: '中国铁路 · 一张地图',
      detail: '自宣武门展览铁路起 · 干线铁路 + 地铁逐段 + 城标点亮 + 高铁走廊',
      kind: 'metro',
      eraLabel: '中国铁路',
      nationalMap: true,
      overview: true,
      focus: { ...CHINA_FOCUS },
      segments: [],
    },
    ...events.map(({ _seq, _hsr, ...sc }) => sc),
    {
      id: 'china-finale',
      year: 2035,
      title: '路网一览',
      detail: `城轨 ${METRO_CITY_OPENINGS.length} 城 · 地铁规划虚线与高铁规划同图收到 2035+`,
      kind: 'hsr',
      eraLabel: '中国铁路',
      nationalMap: true,
      overview: true,
      fitNetwork: true,
      focusPad: 56,
      focusZoom: 5.2,
      focus: { ...CHINA_FOCUS },
      segments: [],
      milestone: true,
    },
  ];
}

export const UNIFIED_SCENES = buildUnifiedScenes();

export const CHAPTERS = {
  china: {
    id: 'china',
    label: '中国铁路',
    blurb: '简办年表 · 一张图播完',
    scenes: UNIFIED_SCENES,
  },
};
