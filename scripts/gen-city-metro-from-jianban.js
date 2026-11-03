/**
 * 从简办发展史 Excel 抽出的事件 + 高德站位，生成各城 metro 场景模块。
 * Usage: node scripts/gen-city-metro-from-jianban.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NEW_CITY_META } from './city-metro-extras.js';
import { PLANNED_BY_CITY } from './city-metro-planned.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const eventsPath = path.join(root, 'src/data/jianbanNationalEvents.json');
const eventsAll = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const SCENE_EXPORT = {
  shanghai: 'SHANGHAI_SCENES',
  guangzhou: 'GUANGZHOU_SCENES',
  shenzhen: 'SHENZHEN_SCENES',
  tianjin: 'TIANJIN_SCENES',
  chongqing: 'CHONGQING_SCENES',
  wuhan: 'WUHAN_SCENES',
  chengdu: 'CHENGDU_SCENES',
  hangzhou: 'HANGZHOU_SCENES',
  nanjing: 'NANJING_SCENES',
  xian: 'XIAN_SCENES',
  suzhou: 'SUZHOU_SCENES',
  qingdao: 'QINGDAO_SCENES',
  zhengzhou: 'ZHENGZHOU_SCENES',
  changsha: 'CHANGSHA_SCENES',
  hefei: 'HEFEI_SCENES',
  nanchang: 'NANCHANG_SCENES',
  nanning: 'NANNING_SCENES',
  jinan: 'JINAN_SCENES',
  shijiazhuang: 'SHIJIAZHUANG_SCENES',
  kunming: 'KUNMING_SCENES',
  fuzhou: 'FUZHOU_SCENES',
  ningbo: 'NINGBO_SCENES',
  wuxi: 'WUXI_SCENES',
  dongguan: 'DONGGUAN_SCENES',
  changchun: 'CHANGCHUN_SCENES',
  dalian: 'DALIAN_SCENES',
  shenyang: 'SHENYANG_SCENES',
  foshan: 'FOSHAN_SCENES',
  taipei: 'TAIPEI_SCENES',
  kaohsiung: 'KAOHSIUNG_SCENES',
  harbin: 'HARBIN_SCENES',
  xiamen: 'XIAMEN_SCENES',
  guiyang: 'GUIYANG_SCENES',
  urumqi: 'URUMQI_SCENES',
  wenzhou: 'WENZHOU_SCENES',
  lanzhou: 'LANZHOU_SCENES',
  xuzhou: 'XUZHOU_SCENES',
  changzhou: 'CHANGZHOU_SCENES',
  hohhot: 'HOHHOT_SCENES',
  taiyuan: 'TAIYUAN_SCENES',
  luoyang: 'LUOYANG_SCENES',
  shaoxing: 'SHAOXING_SCENES',
  wuhu: 'WUHU_SCENES',
  nantong: 'NANTONG_SCENES',
  jinhua: 'JINHUA_SCENES',
  taizhouzj: 'TAIZHOUZJ_SCENES',
  macau: 'MACAU_SCENES',
  taichung: 'TAICHUNG_SCENES',
  taoyuan: 'TAOYUAN_SCENES',
  chuzhou: 'CHUZHOU_SCENES',
  xuchang: 'XUCHANG_SCENES',
  ziyang: 'ZIYANG_SCENES',
  haining: 'HAINING_SCENES',
  maanshan: 'MAANSHAN_SCENES',
};

const CITY_META = {
  shanghai: {
    label: '上海地铁',
    prefix: 'sh',
    center: { lng: 121.47, lat: 31.23 },
    blurb: '1993–2026 · 手校完成（不含规划）',
    finaleYear: 2026,
    skipExcel: true,
    skipExcelNoDateIf: /明珠线|上海火车站-共富|共富新村-富锦|港城路-灵岩|灵岩南路|市光路-耀华|耀华路-市光|桂林路-松江|修复段|航天博物馆|花木路|江苏路-嘉定|张江|广兰路|徐泾东|嘉定新城-安亭|杨高中路|航中路|世博|美兰湖|虹桥火车站|济阳|昌吉|潘广|刘行|临平|佘山|周家渡|中华艺术宫|金山|船厂路|松江南|金运路|祁连山南|沈杜|罗山路|花桥|天潼|滴水湖|曲阜|祁华|大渡河|长寿|龙阳|七莘|康新|迪士尼|曹路|东方绿舟|浦江|奉贤|张江路|基隆|航头|紫竹|封浜|桂桥|长江南路/,
    extra: [
      { year: 1993, date: '1993-05-28', title: '1号线南段开通', detail: '5月28日 · 徐家汇 — 锦江乐园', line: '1号线', from: '徐家汇', to: '锦江乐园', segId: 'sh-l1-south' },
      { year: 1995, date: '1995-04-10', title: '1号线全线开通', detail: '4月10日 · 锦江乐园 — 上海火车站', line: '1号线', from: '徐家汇', to: '上海火车站', segId: 'sh-l1-north' },
      { year: 1996, date: '1996-04-01', title: '锦江乐园站搬迁', detail: '4月 · 搬迁至沪闵路虹漕南路临时站点', terminusMove: { segId: 'sh-l1-south', station: '锦江乐园', lng: 121.4178, lat: 31.1506, color: '#E3002A' }, focus: { lng: 121.412, lat: 31.146, zoom: 15 } },
      { year: 1996, date: '1996-12-28', title: '1号线南延段开通', detail: '12月28日 · 莘庄 — 虹梅路 · 独立运营', line: '1号线', asLine: '1号线南延段', from: '莘庄', to: '虹梅路', segId: 'sh-l1-ext' },
      { year: 1997, date: '1997-07-01', title: '1号线全线贯通', detail: '7月1日 · 莘庄 — 上海火车站贯通 · 临时锦江乐园废弃', line: '1号线', from: '虹梅路', to: '新龙华', omit: ['锦江乐园'], segId: 'sh-l1-join', retireStations: ['锦江乐园'], terminusMove: { segId: 'sh-l1-south', station: '新龙华', lng: 121.425417, lat: 31.156469, color: '#E3002A', dropNames: ['锦江乐园'] }, recolor: { fromLine: '1号线南延段', lineName: '1号线', color: '#E3002A' } },
      { year: 1999, date: '1999-12-28', title: '新龙华站更名', detail: '12月28日 · 1号线新龙华改称上海南站', stationRename: { from: '新龙华', to: '上海南站', lng: 121.425417, lat: 31.156469, color: '#E3002A', open: true } },
      { year: 2000, date: '2000-06-11', title: '2号线一期开通', detail: '6月11日 · 中山公园 — 龙阳路', line: '2号线', from: '中山公园', to: '龙阳路' },
      { year: 2000, date: '2000-08-10', title: '人民公园站更名', detail: '8月10日 · 2号线人民公园改称人民广场 · 与 1 号线换乘', stationRename: { from: '人民公园', to: '人民广场', lng: 121.470589, lat: 31.234632, color: '#86B81C', open: true } },
      { year: 2000, date: '2000-12-26', title: '2号线东延开通', detail: '12月26日 · 龙阳路 — 张江高科', line: '2号线', from: '龙阳路', to: '张江高科', segId: 'sh-l2-e' },
      { year: 2000, date: '2000-12-26', title: '明珠线一期开通', detail: '12月26日 · 上海南站 — 石龙路 · 今 3 号线配色与走向', line: '3号线', asLine: '明珠线', from: '上海南站', to: '石龙路', segId: 'sh-l3-a' },
      { year: 2000, date: '2000-12-26', title: '明珠线通至宜山路', detail: '12月26日 · 石龙路 — 宜山路', line: '3号线', asLine: '明珠线', from: '石龙路', to: '宜山路', segId: 'sh-l3-b' },
      { year: 2000, date: '2000-12-26', title: '明珠线通至中山公园', detail: '12月26日 · 宜山路 — 中山公园', line: '3号线', asLine: '明珠线', from: '宜山路', to: '中山公园', segId: 'sh-l3-c1' },
      { year: 2000, date: '2000-12-26', title: '明珠线通至江湾镇', detail: '12月26日 · 中山公园 — 江湾镇', line: '3号线', asLine: '明珠线', from: '中山公园', to: '江湾镇', segId: 'sh-l3-c2' },
      { year: 2001, date: '2001-05-01', title: '虹梅路站更名', detail: '5月1日 · 1号线虹梅路改称锦江乐园', stationRename: { from: '虹梅路', to: '锦江乐园', lng: 121.409467, lat: 31.144099, color: '#E3002A', open: true } },
      { year: 2002, date: '2002-08-08', title: '明珠线更名3号线', detail: '8月8日 · 明珠线改称 3 号线', recolor: { fromLine: '明珠线', lineName: '3号线', color: '#FCD600' }, highlightFromLine: '明珠线' },
      { year: 2002, date: '2002-12-12', title: '杨高南路站更名', detail: '12月12日 · 2号线杨高南路改称上海科技馆', stationRename: { from: '杨高南路', to: '上海科技馆', lng: 121.540157, lat: 31.220966, color: '#86B81C', open: true } },
      { year: 2002, date: '2002-12-31', title: '磁浮线通车典礼', detail: '12月31日 · 龙阳路 — 浦东国际机场', line: '磁浮线', from: '龙阳路', to: '浦东国际机场', segId: 'sh-maglev' },
      { year: 2003, date: '2003-11-25', title: '5号线开通', detail: '11月25日 · 莘庄 — 颛桥', line: '5号线', from: '莘庄', to: '颛桥', segId: 'sh-l5-n' },
      { year: 2003, date: '2003-11-25', title: '5号线通至闵行开发区', detail: '11月25日 · 颛桥 — 闵行开发区', line: '5号线', from: '颛桥', to: '闵行开发区', segId: 'sh-l5-s' },
      { year: 2003, date: '2003-12-31', title: '上海南站停运', detail: '12月31日 · 配合上海南站施工 · 3号线上海南站停运', retireStations: ['上海南站'], focus: { lng: 121.425417, lat: 31.156469, zoom: 15 } },
      { year: 2004, date: '2004-06-10', title: '3号线高架下沉施工', detail: '6月10日 · 石龙路 — 宜山路停运', retireSegIds: ['sh-l3-a', 'sh-l3-b'], retireHoldCam: true, focus: { lng: 121.43, lat: 31.183, zoom: 14 } },
      { year: 2004, date: '2004-07-24', title: '3号线宜山路 — 石龙路恢复', detail: '7月24日 · 石龙路 — 宜山路恢复运营', line: '3号线', from: '石龙路', to: '宜山路', segId: 'sh-l3-b' },
      { year: 2004, date: '2004-12-28', title: '1号线北延开通', detail: '12月28日 · 上海火车站 — 共富新村', line: '1号线', from: '上海火车站', to: '共富新村' },
      { year: 2005, date: '2005-10-15', title: '3号线上海南站恢复', detail: '10月15日 · 石龙路 — 上海南站恢复运营', line: '3号线', from: '石龙路', to: '上海南站', segId: 'sh-l3-a' },
      { year: 2005, date: '2005-10-22', title: '东方路站停运', detail: '10月22日 · 配合 6 号线、9 号线施工 · 2号线东方路停运', retireStations: ['东方路'], focus: { lng: 121.522877, lat: 31.230781, zoom: 15 } },
      { year: 2005, date: '2005-12-31', title: '4号线开通', detail: '12月31日 · 大木桥路 — 蓝村路', line: '4号线', from: '大木桥路', to: '蓝村路' },
      { year: 2006, date: '2006-04-27', title: '磁浮线投入商业运营', detail: '4月27日 · 龙阳路 — 浦东国际机场正式投入商业运营', line: '磁浮线', overview: true, focus: { lng: 121.68, lat: 31.18, zoom: 12 } },
      { year: 2006, date: '2006-07-18', title: '东方路站更名', detail: '7月18日 · 2号线东方路改称世纪大道', stationRename: { from: '东方路', to: '世纪大道', lng: 121.522877, lat: 31.230781, color: '#86B81C' } },
      { year: 2006, date: '2006-10-19', title: '三站更名', detail: '10月19日 · 河南中路改南京东路 · 石门一路改南京西路 · 汶水东路改大柏树', stationRename: [
        { from: '河南中路', to: '南京东路', lng: 121.480141, lat: 31.240071, color: '#86B81C', open: true },
        { from: '石门一路', to: '南京西路', lng: 121.455406, lat: 31.23176, color: '#86B81C', open: true },
        { from: '汶水东路', to: '大柏树', lng: 121.47872, lat: 31.291376, color: '#FCD600', open: true },
      ] },
      { year: 2006, date: '2006-10-28', title: '世纪大道站恢复运营', detail: '10月28日 · 2号线', addStations: [{ name: '世纪大道', after: '浦东南路(原东昌路)', lng: 121.522877, lat: 31.230781 }] },
      { year: 2006, date: '2006-12-18', title: '3号线北延开通', detail: '12月18日 · 江湾镇 — 长江南路', line: '3号线', from: '江湾镇', to: '长江南路', segId: 'sh-l3-n0' },
      { year: 2006, date: '2006-12-18', title: '3号线通至水产路', detail: '12月18日 · 长江南路 — 水产路', line: '3号线', from: '长江南路', to: '水产路', segId: 'sh-l3-n3' },
      { year: 2006, date: '2006-12-18', title: '3号线通至江杨北路', detail: '12月18日 · 水产路 — 江杨北路', line: '3号线', from: '水产路', to: '江杨北路', segId: 'sh-l3-n2' },
      { year: 2006, date: '2006-12-30', title: '2号线西延开通', detail: '12月30日 · 中山公园 — 淞虹路', line: '2号线', from: '中山公园', to: '淞虹路' },
      { year: 2007, date: '2007-12-29', title: '1号线北延二期开通', detail: '12月29日 · 共富新村 — 富锦路', line: '1号线', from: '共富新村', to: '富锦路' },
      { year: 2007, date: '2007-12-29', title: '4号线修复段开通', detail: '12月29日 · 大木桥路 — 宜山路', line: '4号线修复段', asLine: '4号线', from: '大木桥路', to: '宜山路', segId: 'sh-l4-sw' },
      { year: 2007, date: '2007-12-29', title: '4号线共线段开通', detail: '12月29日 · 宜山路 — 临平路', line: '4号线修复段', asLine: '4号线', from: '宜山路', to: '临平路', segId: 'sh-l4-share' },
      { year: 2007, date: '2007-12-29', title: '4号线通至蓝村路', detail: '12月29日 · 临平路 — 蓝村路 · 环线合龙', line: '4号线修复段', asLine: '4号线', from: '临平路', to: '蓝村路', segId: 'sh-l4-ne' },
      { year: 2007, date: '2007-12-29', title: '6号线一期开通', detail: '12月29日 · 灵岩南路 — 港城路', line: '6号线', from: '灵岩南路', to: '港城路' },
      { year: 2007, date: '2007-12-29', title: '8号线一期开通', detail: '12月29日 · 耀华路 — 市光路', line: '8号线', from: '耀华路', to: '西藏南路', segId: 'sh-l8-a', ghost: ['周家渡'] },
      { year: 2007, date: '2007-12-29', title: '8号线通至市光路', detail: '12月29日 · 西藏南路 — 市光路', line: '8号线', from: '西藏南路', to: '市光路', segId: 'sh-l8-b' },
      { year: 2007, date: '2007-12-29', title: '9号线开通', detail: '12月29日 · 桂林路 — 佘山', line: '9号线', from: '桂林路', to: '佘山', segId: 'sh-l9-a' },
      { year: 2007, date: '2007-12-29', title: '9号线通至松江新城', detail: '12月29日 · 佘山 — 松江新城', line: '9号线', from: '佘山', to: '松江新城', segId: 'sh-l9-song' },
      { year: 2008, date: '2008-01-22', title: '8号线区间停运', detail: '1月22日 · 配合西藏南路隧道施工 · 耀华路 — 西藏南路停运', retireSegIds: ['sh-l8-a'], retireHoldCam: true, focus: { lng: 121.49, lat: 31.20, zoom: 14 } },
      { year: 2008, date: '2008-02-01', title: '8号线区间恢复', detail: '2月1日 · 西藏南路 — 耀华路恢复运营', line: '8号线', from: '西藏南路', to: '耀华路', segId: 'sh-l8-a', ghost: ['周家渡'] },
      { year: 2008, date: '2008-05-28', title: '上海地铁 15 周年', detail: '自 1993 年 5 月 28 日徐家汇 — 锦江乐园开通 · 十五周年', overview: true, focus: { lng: 121.50, lat: 31.22, zoom: 9 } },
      { year: 2008, date: '2008-12-28', title: '9号线东延开通', detail: '12月28日 · 桂林路 — 宜山路', line: '9号线', from: '桂林路', to: '宜山路' },
      { year: 2009, date: '2009-07-05', title: '8号线二期开通', detail: '7月5日 · 耀华路 — 航天博物馆', line: '8号线', from: '耀华路', to: '航天博物馆', ghost: ['济阳路'] },
      { year: 2009, date: '2009-12-05', title: '7号线首段开通', detail: '12月5日 · 花木路 — 高科西路', line: '7号线', from: '花木路', to: '高科西路', segId: 'sh-l7-e' },
      { year: 2009, date: '2009-12-05', title: '7号线通至云台路', detail: '12月5日 · 高科西路 — 云台路', line: '7号线', from: '高科西路', to: '云台路', segId: 'sh-l7-gap' },
      { year: 2009, date: '2009-12-05', title: '7号线通至上海大学', detail: '12月5日 · 云台路 — 上海大学', line: '7号线', from: '云台路', to: '上海大学', segId: 'sh-l7-w', ghost: ['后滩'] },
      { year: 2009, date: '2009-12-31', title: '9号线东延开通', detail: '12月31日 · 宜山路 — 世纪大道', line: '9号线', from: '宜山路', to: '世纪大道' },
      { year: 2009, date: '2009-12-31', title: '11号线一期开通', detail: '12月31日 · 江苏路 — 嘉定北', line: '11号线', from: '江苏路', to: '嘉定北', ghost: ['陈翔公路'] },
      { year: 2009, date: '2009-12-31', title: '张江有轨电车开通', detail: '12月31日 · 张江地铁站 — 张东路金秋路', line: '张江有轨电车', from: '张江地铁站', to: '张东路金秋路', segId: 'sh-tram-zj' },
      { year: 2010, date: '2010-02-14', title: '2号线东延段停运改造', detail: '2月14日 · 张江高科 — 龙阳路停运', retireSegIds: ['sh-l2-e'], retireHoldCam: true, focus: { lng: 121.57, lat: 31.205, zoom: 14 } },
      { year: 2010, date: '2010-02-24', title: '2号线东延开通', detail: '2月24日 · 龙阳路 — 广兰路', line: '2号线', from: '龙阳路', to: '广兰路' },
      { year: 2010, date: '2010-03-16', title: '2号线西延开通', detail: '3月16日 · 淞虹路 — 徐泾东', line: '2号线', from: '淞虹路', to: '徐泾东', segId: 'sh-l2-w', ghost: ['虹桥火车站'] },
      { year: 2010, date: '2010-03-29', title: '11号线支线开通', detail: '3月29日 · 嘉定新城 — 安亭', line: '11号线', from: '嘉定新城', to: '安亭', ghost: ['昌吉东路'] },
      { year: 2010, date: '2010-04-07', title: '9号线东延开通', detail: '4月7日 · 世纪大道 — 杨高中路', line: '9号线', from: '世纪大道', to: '杨高中路' },
      { year: 2010, date: '2010-04-08', title: '2号线通至机场', detail: '4月8日 · 广兰路 — 浦东国际机场', line: '2号线', from: '广兰路', to: '浦东国际机场', omit: ['浦东1号2号航站楼'] },
      { year: 2010, date: '2010-04-10', title: '10号线一期开通', detail: '4月10日 · 航中路 — 新江湾城', line: '10号线', from: '航中路', to: '新江湾城' },
      { year: 2010, date: '2010-04-20', title: '世博专线开通', detail: '4月20日 · 马当路 — 世博大道', line: '世博专线', from: '马当路', to: '世博大道', segId: 'sh-expo' },
      { year: 2010, date: '2010-04-20', title: '后滩站投入使用', detail: '4月20日 · 7号线', openStations: ['后滩'] },
      { year: 2010, date: '2010-07-01', title: '虹桥火车站开通', detail: '7月1日 · 2号线随高铁站投入使用', openStations: ['虹桥火车站'] },
      { year: 2010, date: '2010-11-02', title: '世博专线停运', detail: '11月2日 · 世博会闭园 · 马当路 — 世博大道退出运营', retireSegIds: ['sh-expo'], retireHoldCam: true, focus: { lng: 121.48, lat: 31.19, zoom: 14 } },
      { year: 2010, date: '2010-11-28', title: '10号线通至虹桥', detail: '11月28日 · 龙溪路 — 虹桥火车站', line: '10号线', from: '龙溪路', to: '虹桥火车站' },
      { year: 2010, date: '2010-12-28', title: '7号线北延开通', detail: '12月28日 · 上海大学 — 美兰湖', line: '7号线', from: '上海大学', to: '美兰湖', ghost: ['祁华路', '刘行', '潘广路'] },
      { year: 2011, date: '2011-04-12', title: '济阳路站开通', detail: '4月12日 · 6号线、8号线一同启用', line: '6号线', from: '灵岩南路', to: '济阳路', openStations: ['济阳路'] },
      { year: 2011, date: '2011-04-26', title: '昌吉东路站开通', detail: '4月26日 · 11号线', openStations: ['昌吉东路'] },
      { year: 2011, date: '2011-05-07', title: '济阳路站更名', detail: '5月7日 · 6号线、8号线济阳路改称东方体育中心', stationRename: { from: '济阳路', to: '东方体育中心', lng: 121.47581, lat: 31.155365, color: '#F0087D', open: true } },
      { year: 2011, date: '2011-06-30', title: '7号线两站启用', detail: '6月30日 · 潘广路、刘行投入使用', openStations: ['潘广路', '刘行'] },
      { year: 2012, date: '2012-01-23', title: '4号线共线段停运', detail: '1月23日 · 不均衡沉降大修 · 临平路 — 宜山路停运', retireSegIds: ['sh-l4-share'], retireHoldCam: true, focus: { lng: 121.43, lat: 31.24, zoom: 13 } },
      { year: 2012, date: '2012-01-29', title: '4号线共线段恢复', detail: '1月29日 · 临平路 — 宜山路恢复运营', line: '4号线修复段', asLine: '4号线', from: '临平路', to: '宜山路', segId: 'sh-l4-share' },
      { year: 2012, date: '2012-08-07', title: '9号线松江段停运', detail: '8月7日 · 设备改造 · 松江新城 — 佘山停运', retireSegIds: ['sh-l9-song'], retireHoldCam: true, focus: { lng: 121.23, lat: 31.04, zoom: 13 } },
      { year: 2012, date: '2012-09-04', title: '9号线松江段恢复', detail: '9月4日 · 松江新城 — 佘山恢复运营', line: '9号线', from: '松江新城', to: '佘山', segId: 'sh-l9-song' },
      { year: 2012, date: '2012-09-28', title: '周家渡站更名开通', detail: '9月28日 · 8号线周家渡改称中华艺术宫并投入使用', stationRename: { from: '周家渡', to: '中华艺术宫', lng: 121.489176, lat: 31.187263, color: '#01A2E2', open: true } },
      { year: 2012, date: '2012-09-29', title: '金山铁路开通', detail: '9月29日 · 改造竣工 · 上海南站 — 金山卫', line: '金山铁路', from: '上海南站', to: '金山卫' },
      { year: 2012, date: '2012-12-24', title: '船厂路站更名', detail: '12月24日 · 7号线船厂路改称龙华中路', stationRename: { from: '船厂路', to: '龙华中路', lng: 121.452495, lat: 31.186302, color: '#EE782E', open: true } },
      { year: 2012, date: '2012-12-30', title: '9号线松江段开通', detail: '12月30日 · 松江新城 — 松江南站', line: '9号线', from: '松江新城', to: '松江南站' },
      { year: 2012, date: '2012-12-30', title: '13号线一期西段开通', detail: '12月30日 · 金运路 — 金沙江路', line: '13号线', from: '金运路', to: '金沙江路', ghost: ['祁连山南路', '大渡河路'] },
      { year: 2013, date: '2013-05-28', title: '上海地铁 20 周年', detail: '自 1993 年 5 月 28 日徐家汇 — 锦江乐园开通 · 二十周年', overview: true, focus: { lng: 121.50, lat: 31.22, zoom: 9 } },
      { year: 2013, date: '2013-06-15', title: '祁连山南路站开通', detail: '6月15日 · 13号线祁连山南站投入使用', openStations: ['祁连山南路'] },
      { year: 2013, date: '2013-08-31', title: '航天博物馆站更名', detail: '8月31日 · 8号线航天博物馆改称沈杜公路', stationRename: { from: '航天博物馆', to: '沈杜公路', lng: 121.507899, lat: 31.063571, color: '#01A2E2', open: true } },
      { year: 2013, date: '2013-08-31', title: '11号线二期开通', detail: '8月31日 · 江苏路 — 罗山路', line: '11号线', from: '江苏路', to: '罗山路', ghost: ['康恒路'] },
      { year: 2013, date: '2013-10-16', title: '11号线通至花桥', detail: '10月16日 · 安亭 — 花桥', line: '11号线', from: '安亭', to: '花桥' },
      { year: 2013, date: '2013-12-29', title: '12号线东段开通', detail: '12月29日 · 天潼路 — 金海路', line: '12号线', from: '天潼路', to: '金海路' },
      { year: 2013, date: '2013-12-29', title: '16号线开通', detail: '12月29日 · 罗山路 — 滴水湖', line: '16号线', from: '罗山路', to: '滴水湖' },
      { year: 2014, date: '2014-01-31', title: '3号线北段停运', detail: '1月31日 · 沉降整治 · 水产路以北 江杨北路 — 水产路停运', retireSegIds: ['sh-l3-n2'], retireHoldCam: true, focus: { lng: 121.48, lat: 31.40, zoom: 13 } },
      { year: 2014, date: '2014-02-07', title: '3号线北段恢复', detail: '2月7日 · 江杨北路 — 水产路恢复运营', line: '3号线', from: '水产路', to: '江杨北路', segId: 'sh-l3-n2' },
      { year: 2014, date: '2014-05-10', title: '12号线西延开通', detail: '5月10日 · 天潼路 — 曲阜路', line: '12号线', from: '天潼路', to: '曲阜路' },
      { year: 2014, date: '2014-07-22', title: '祁华路站开通', detail: '7月22日 · 7号线', openStations: ['祁华路'] },
      { year: 2014, date: '2014-09-18', title: '卢浦大桥站更名', detail: '9月18日 · 13号线世博专线段卢浦大桥改称世博会博物馆', stationRename: { from: '卢浦大桥', to: '世博会博物馆', lng: 121.477098, lat: 31.199552, color: '#EB81B9', open: true } },
      { year: 2014, date: '2014-11-01', title: '大渡河路站开通', detail: '11月1日 · 13号线', openStations: ['大渡河路'] },
      { year: 2014, date: '2014-12-28', title: '13号线东延开通', detail: '12月28日 · 金沙江路 — 长寿路', line: '13号线', from: '金沙江路', to: '长寿路' },
      { year: 2014, date: '2014-12-28', title: '16号线通至龙阳路', detail: '12月28日 · 罗山路 — 龙阳路', line: '16号线', from: '罗山路', to: '龙阳路' },
      { year: 2015, date: '2015-02-16', title: '3号线北段停运', detail: '2月16日 · 基地扩容 · 水产路以北 江杨北路 — 水产路停运', retireSegIds: ['sh-l3-n2'], retireHoldCam: true, focus: { lng: 121.48, lat: 31.40, zoom: 13 } },
      { year: 2015, date: '2015-03-01', title: '3号线北段恢复', detail: '3月1日 · 江杨北路 — 水产路恢复运营', line: '3号线', from: '水产路', to: '江杨北路', segId: 'sh-l3-n2' },
      { year: 2015, date: '2015-12-19', title: '12号线西段开通', detail: '12月19日 · 曲阜路 — 七莘路', line: '12号线', from: '曲阜路', to: '七莘路' },
      { year: 2015, date: '2015-12-19', title: '13号线通至世博大道', detail: '12月19日 · 长寿路 — 世博大道', line: '13号线', from: '长寿路', to: '世博大道' },
      { year: 2015, date: '2015-12-19', title: '11号线通至康新公路', detail: '12月19日 · 罗山路 — 康新公路', line: '11号线', from: '罗山路', to: '康新公路' },
      { year: 2016, date: '2016-01-30', title: '漕河泾开发区封站', detail: '1月30日 · 9号线封站改造', retireStations: ['漕河泾开发区'], focus: { lng: 121.393123, lat: 31.172509, zoom: 15 } },
      { year: 2016, date: '2016-02-22', title: '漕河泾开发区恢复', detail: '2月22日 · 9号线改造完成启用', addStations: [{ name: '漕河泾开发区', after: '桂林路', lng: 121.393123, lat: 31.172509 }] },
      { year: 2016, date: '2016-04-26', title: '11号线三期开通', detail: '4月26日 · 康新公路 — 迪士尼', line: '11号线', from: '康新公路', to: '迪士尼' },
      { year: 2017, date: '2017-01-17', title: '人民广场停运改造', detail: '1月17日 · 补短板 · 1号线、8号线人民广场封站', retireStations: ['人民广场'], focus: { lng: 121.470589, lat: 31.234632, zoom: 15 } },
      { year: 2017, date: '2017-01-21', title: '张江高科停运改造', detail: '1月21日 · 补短板 · 2号线张江高科封站', retireStations: ['张江高科'], focus: { lng: 121.583286, lat: 31.204086, zoom: 15 } },
      { year: 2017, date: '2017-01-25', title: '沈杜公路停运改造', detail: '1月25日 · 补短板 · 8号线沈杜公路封站', retireStations: ['沈杜公路'], focus: { lng: 121.507899, lat: 31.063571, zoom: 15 } },
      { year: 2017, date: '2017-02-09', title: '沈杜公路恢复', detail: '2月9日 · 8号线', addStations: [{ name: '沈杜公路', lng: 121.507899, lat: 31.063571 }] },
      { year: 2017, date: '2017-02-11', title: '两站恢复运营', detail: '2月11日 · 人民广场、张江高科恢复', addStations: [
        { name: '人民广场', after: '黄陂南路', lng: 121.470589, lat: 31.234632 },
        { name: '人民广场', after: '大世界', lng: 121.470589, lat: 31.234632 },
        { name: '张江高科', after: '金科路', lng: 121.583286, lat: 31.204086 },
      ] },
      { year: 2017, date: '2017-12-30', title: '9号线三期开通', detail: '12月30日 · 杨高中路 — 曹路', line: '9号线', from: '杨高中路', to: '曹路' },
      { year: 2017, date: '2017-12-30', title: '17号线开通', detail: '12月30日 · 虹桥火车站 — 东方绿舟', line: '17号线', from: '虹桥火车站', to: '东方绿舟' },
      { year: 2018, date: '2018-03-31', title: '浦江线开通', detail: '3月31日 · 沈杜公路 — 汇臻路', line: '浦江线', from: '沈杜公路', to: '汇臻路' },
      { year: 2018, date: '2018-12-26', title: '松江有轨一期开通', detail: '12月26日 · 仓华路 — 中辰路', line: '松江有轨T2', from: '仓华路', to: '中辰路', segId: 'sh-sj-t2a' },
      { year: 2018, date: '2018-12-30', title: '5号线南延伸开通', detail: '12月30日 · 东川路 — 奉贤新城', line: '5号线', from: '东川路', to: '奉贤新城' },
      { year: 2018, date: '2018-12-30', title: '13号线二、三期开通', detail: '12月30日 · 世博大道 — 张江路', line: '13号线', from: '世博大道', to: '张江路' },
      { year: 2019, date: '2019-08-10', title: '松江有轨T1开通', detail: '8月10日 · 仓华路 — 新庙三路', line: '松江有轨T1', from: '仓华路', to: '新庙三路', segId: 'sh-sj-t1a' },
      { year: 2019, date: '2019-08-10', title: '松江有轨T2环线开通', detail: '8月10日 · 中辰路 — 松江体育中心', line: '松江有轨T2', from: '中辰路', to: '松江体育中心', segId: 'sh-sj-t2b' },
      { year: 2019, date: '2019-12-30', title: '松江有轨T1东延', detail: '12月30日 · 新庙三路 — 新桥火车站', line: '松江有轨T1', from: '新庙三路', to: '新桥火车站', segId: 'sh-sj-t1b' },
      { year: 2020, date: '2020-01-23', title: '2号线西段停运', detail: '1月23日 · 隧道整体施工 · 淞虹路 — 徐泾东停运', retireSegIds: ['sh-l2-w'], retireHoldCam: true, focus: { lng: 121.33, lat: 31.20, zoom: 13 } },
      { year: 2020, date: '2020-02-02', title: '2号线西段恢复', detail: '2月2日 · 淞虹路 — 徐泾东恢复运营', line: '2号线', from: '淞虹路', to: '徐泾东', segId: 'sh-l2-w' },
      { year: 2020, date: '2020-08-25', title: '陈翔公路站开通', detail: '8月25日 · 11号线', openStations: ['陈翔公路'] },
      { year: 2020, date: '2020-09-12', title: '3号线更换枕木', detail: '9月12日 — 19日 · 上海南站 — 中山公园停运', retireSegIds: ['sh-l3-a', 'sh-l3-b', 'sh-l3-c1'], retireHoldCam: true, focus: { lng: 121.43, lat: 31.20, zoom: 12 } },
      { year: 2020, date: '2020-09-21', title: '3号线南段恢复', detail: '9月14日 — 21日 · 上海南站 — 中山公园恢复运营', line: '3号线', from: '上海南站', to: '石龙路', segId: 'sh-l3-a' },
      { year: 2020, date: '2020-09-21', title: '3号线石龙路 — 宜山路恢复', detail: '9月21日 · 石龙路 — 宜山路', line: '3号线', from: '石龙路', to: '宜山路', segId: 'sh-l3-b' },
      { year: 2020, date: '2020-09-21', title: '3号线宜山路 — 中山公园恢复', detail: '9月21日 · 宜山路 — 中山公园', line: '3号线', from: '宜山路', to: '中山公园', segId: 'sh-l3-c1' },
      { year: 2020, date: '2020-12-26', title: '10号线二期开通', detail: '12月26日 · 新江湾城 — 基隆路', line: '10号线', from: '新江湾城', to: '基隆路' },
      { year: 2020, date: '2020-12-26', title: '18号线南段开通', detail: '12月26日 · 御桥 — 航头', line: '18号线', from: '御桥', to: '航头' },
      { year: 2021, date: '2021-01-23', title: '15号线开通', detail: '1月23日 · 顾村公园 — 紫竹高新区', line: '15号线', from: '顾村公园', to: '紫竹高新区', ghost: ['桂林路'] },
      { year: 2021, date: '2021-02-12', title: '7号线区间停运', detail: '2月12日 · 隧道修整 · 云台路 — 高科西路停运', retireSegIds: ['sh-l7-gap'], retireHoldCam: true, focus: { lng: 121.50, lat: 31.18, zoom: 14 } },
      { year: 2021, date: '2021-02-18', title: '7号线区间恢复', detail: '2月18日 · 云台路 — 高科西路恢复运营', line: '7号线', from: '高科西路', to: '云台路', segId: 'sh-l7-gap' },
      { year: 2021, date: '2021-06-20', title: '两站更名', detail: '6月20日 · 新天地改一大会址·新天地 · 黄陂南路改一大会址·黄陂南路', stationRename: [
        { from: '新天地', to: '一大会址·新天地', lng: 121.470665, lat: 31.21832, color: '#C6AFD4', open: true },
        { from: '黄陂南路', to: '一大会址·黄陂南路', lng: 121.468379, lat: 31.225841, color: '#E3002A', open: true },
      ] },
      { year: 2021, date: '2021-06-27', title: '15号线桂林路开通', detail: '6月27日 · 15号线', openStations: ['桂林路'] },
      { year: 2021, date: '2021-06-30', title: '临港捷运1号线开通', detail: '6月30日 · 滴水湖 — 鸿音广场', line: '临港捷运1号线', from: '滴水湖', to: '鸿音广场' },
      { year: 2021, date: '2021-12-30', title: '14号线开通', detail: '12月30日 · 封浜 — 桂桥路', line: '14号线', from: '封浜', to: '桂桥路' },
      { year: 2021, date: '2021-12-30', title: '18号线北段开通', detail: '12月30日 · 御桥 — 长江南路', line: '18号线', from: '御桥', to: '长江南路' },
      { year: 2022, date: '2022-02-01', title: '5号线北段停运', detail: '2月1日 · 集中整治 · 莘庄 — 颛桥停运', retireSegIds: ['sh-l5-n'], retireHoldCam: true, focus: { lng: 121.39, lat: 31.10, zoom: 13 } },
      { year: 2022, date: '2022-02-07', title: '5号线北段恢复', detail: '2月7日 · 莘庄 — 颛桥恢复运营', line: '5号线', from: '莘庄', to: '颛桥', segId: 'sh-l5-n' },
      { year: 2022, date: '2022-03-28', title: '浦东分区封控', detail: '3月28日 · 以黄浦江为界分区封控 · 浦东、浦南等区域地铁站封站 · 公交等大范围调整', overview: true, focus: { lng: 121.55, lat: 31.18, zoom: 10 } },
      { year: 2022, date: '2022-04-01', title: '浦西封控筛查', detail: '4月1日 · 浦西开始封控筛查 · 浦西地铁、公交等公共交通大范围停运', overview: true, focus: { lng: 121.43, lat: 31.23, zoom: 10 } },
      { year: 2022, date: '2022-04-02', title: '轨交大部停运', detail: '4月2日 — 5月10日 · 上海地铁大部分区域停运 · 部分线路曾有限恢复', overview: true, focus: { lng: 121.50, lat: 31.22, zoom: 9 } },
      { year: 2022, date: '2022-05-10', title: '6、16号线亦暂停', detail: '5月10日 13 时起 · 6号线、16号线也全线暂停运营', overview: true, focus: { lng: 121.58, lat: 31.16, zoom: 10 } },
      { year: 2022, date: '2022-05-22', title: '四线恢复运营', detail: '5月22日 · 3、6、10、16号线恢复 · 运营时间 7:00—20:00 · 其他线路仍暂停', overview: true, focus: { lng: 121.50, lat: 31.22, zoom: 10 } },
      { year: 2022, date: '2022-06-01', title: '全网基本恢复', detail: '6月1日 · 上海地铁全网络恢复基本运行 · 除部分车站外其他线路恢复运营', overview: true, focus: { lng: 121.50, lat: 31.22, zoom: 9 } },
      { year: 2022, date: '2022-07-04', title: '全网车站恢复', detail: '7月4日 · 此前关闭的车站恢复 · 上海地铁全网其他车站恢复正常运营服务', overview: true, focus: { lng: 121.50, lat: 31.22, zoom: 9 } },
      { year: 2022, date: '2022-10-28', title: '临港捷运2号线开通', detail: '10月28日 · 滴水湖 — 水华路', line: '临港捷运2号线', from: '滴水湖', to: '水华路' },
      { year: 2023, date: '2023-01-21', title: '3号线北段停运', detail: '1月21日 · 江杨北路 — 长江南路临时停运施工', retireSegIds: ['sh-l3-n2', 'sh-l3-n3'], retireHoldCam: true, focus: { lng: 121.48, lat: 31.38, zoom: 13 } },
      { year: 2023, date: '2023-01-22', title: '2号线西段停运', detail: '1月22日 · 淞虹路 — 徐泾东临时施工停运', retireSegIds: ['sh-l2-w'], retireHoldCam: true, focus: { lng: 121.33, lat: 31.20, zoom: 13 } },
      { year: 2023, date: '2023-01-27', title: '2号线西段恢复', detail: '1月27日 · 淞虹路 — 徐泾东恢复运营', line: '2号线', from: '淞虹路', to: '徐泾东', segId: 'sh-l2-w' },
      { year: 2023, date: '2023-01-28', title: '3号线北段恢复', detail: '1月28日 · 长江南路 — 水产路恢复运营', line: '3号线', from: '长江南路', to: '水产路', segId: 'sh-l3-n3' },
      { year: 2023, date: '2023-01-28', title: '3号线通至江杨北路恢复', detail: '1月28日 · 水产路 — 江杨北路恢复运营', line: '3号线', from: '水产路', to: '江杨北路', segId: 'sh-l3-n2' },
      { year: 2023, date: '2023-05-28', title: '上海地铁 30 周年', detail: '自 1993 年 5 月 28 日徐家汇 — 锦江乐园开通 · 三十周年', overview: true, focus: { lng: 121.50, lat: 31.22, zoom: 9 } },
      { year: 2023, date: '2023-06-01', title: '张江有轨电车停运', detail: '6月1日 · 张江有轨电车1路退出运营', retireSegIds: ['sh-tram-zj'], retireHoldCam: true, focus: { lng: 121.61, lat: 31.204, zoom: 14 } },
      { year: 2023, date: '2023-06-24', title: '沪苏11号线跨城衔接', detail: '6月24日 · 上海11号线与苏州11号线在花桥衔接', overview: true, highlightFromLine: '11号线', focus: { lng: 121.10, lat: 31.30, zoom: 13 } },
      { year: 2024, date: '2024-04-30', title: '松江有轨退出运营', detail: '4月30日 · 松江有轨电车 T1、T2 退出运营', retireSegIds: ['sh-sj-t1a', 'sh-sj-t1b', 'sh-sj-t2a', 'sh-sj-t2b'], retireHoldCam: true, focus: { lng: 121.23, lat: 31.04, zoom: 12 } },
      { year: 2024, date: '2024-09-28', title: '康恒路站开通', detail: '9月28日 · 11号线', openStations: ['康恒路'] },
      { year: 2024, date: '2024-11-30', title: '西岑站开通', detail: '11月30日 · 17号线东方绿舟 — 西岑', line: '17号线', from: '东方绿舟', to: '西岑' },
      { year: 2024, date: '2024-12-27', title: '市域机场线开通', detail: '12月27日 · 虹桥2号航站楼 — 浦东1号2号航站楼', line: '市域机场线', from: '虹桥2号航站楼', to: '浦东1号2号航站楼' },
      { year: 2025, date: '2025-11-01', title: '蟠祥路站开通', detail: '11月1日 · 2号线徐泾东 — 蟠祥路', line: '2号线', from: '徐泾东', to: '蟠祥路', omit: ['国家会展中心(2号线)'] },
      { year: 2025, date: '2025-12-27', title: '18号线二期开通', detail: '12月27日 · 长江南路 — 康文路', line: '18号线', from: '长江南路', to: '康文路' },
      { year: 2026, date: '2026-04-21', title: '22号线轨道贯通', detail: '4月21日 · 崇明线全线轨道贯通 · 尚未开通', overview: true, focus: { lng: 121.70, lat: 31.45, zoom: 9 } },
      { year: 2026, date: '2026-06-25', title: '22号线北段上线测试', detail: '6月25日 · 崇明线北段列车上线测试完成 · 尚未开通', overview: true, focus: { lng: 121.70, lat: 31.50, zoom: 9 } },
    ],
  },
  guangzhou: {
    label: '广州地铁',
    prefix: 'gz',
    center: { lng: 113.27, lat: 23.13 },
    blurb: '简办3.0 · 1997 起逐段开通',
    finaleYear: 2024,
    extra: [
      { year: 2013, date: '12-28', title: '6号线开通', detail: '12月28日 · 浔峰岗 — 长湴', line: '6号线', from: '浔峰岗', to: '长湴' },
      { year: 2016, date: '12-28', title: '7号线开通', detail: '12月28日 · 广州南站 — 大学城南', line: '7号线', from: '广州南站', to: '大学城南' },
      { year: 2017, date: '12-28', title: '4号线南延', detail: '12月28日 · 金洲 — 南沙客运港', line: '4号线', from: '金洲', to: '南沙客运港' },
      { year: 2018, date: '12-28', title: '14号线开通', detail: '12月28日 · 嘉禾望岗 — 东风', line: '14号线', from: '嘉禾望岗', to: '东风' },
      { year: 2019, date: '12-28', title: '21号线开通', detail: '12月28日 · 员村 — 增城广场', line: '21号线', from: '员村', to: '增城广场' },
      { year: 2021, date: '09-28', title: '18号线开通', detail: '9月28日 · 冼村 — 万顷沙', line: '18号线', from: '冼村', to: '万顷沙' },
    ],
  },
  shenzhen: {
    label: '深圳地铁',
    prefix: 'sz',
    center: { lng: 114.06, lat: 22.54 },
    blurb: '简办3.0 · 2004 起逐段开通',
    finaleYear: 2024,
    extra: [
      { year: 2016, date: '10-28', title: '11号线开通', detail: '10月28日 · 福田 — 碧头', line: '11号线', from: '福田', to: '碧头' },
      { year: 2016, date: '10-28', title: '7号线开通', detail: '10月28日 · 西丽湖 — 太安', line: '7号线', from: '西丽湖', to: '太安' },
      { year: 2016, date: '10-28', title: '9号线开通', detail: '10月28日 · 红树湾南 — 文锦', line: '9号线', from: '红树湾南', to: '文锦' },
      { year: 2020, date: '08-18', title: '6号线开通', detail: '8月18日 · 松岗 — 科学馆', line: '6号线', from: '松岗', to: '科学馆' },
      { year: 2020, date: '10-28', title: '8号线开通', detail: '10月28日 · 梧桐山南 — 盐田路', line: '8号线', from: '梧桐山南', to: '盐田路' },
      { year: 2022, date: '10-28', title: '14号线开通', detail: '10月28日 · 岗厦北 — 沙田', line: '14号线', from: '岗厦北', to: '沙田' },
    ],
  },
  tianjin: {
    label: '天津地铁',
    prefix: 'tj',
    center: { lng: 117.2, lat: 39.08 },
    blurb: '1976 起逐段开通 · 已手校',
    finaleYear: 2026,
    skipExcel: true,
    skipOsmLines: ['8号线'],
    extra: [
      { year: 1976, date: '1976-01-10', title: '既有线开通', detail: '1月10日 · 新华路 — 海光寺 · 中国大陆第二条地铁', line: '1号线', asLine: '既有线', from: '新华路', to: '海光寺', segId: 'tj-old-a' },
      { year: 1980, date: '1980-01-10', title: '既有线西延', detail: '1月10日 · 海光寺 — 西南角', line: '1号线', asLine: '既有线', from: '海光寺', to: '西南角', segId: 'tj-old-b' },
      { year: 1984, date: '1984-12-28', title: '更名为天津地铁1号线', detail: '12月28日 · 全线新华路 — 西站开通', line: '1号线', from: '西南角', to: '西站', segId: 'tj-old-c', recolor: { fromLine: '既有线', lineName: '1号线', color: '#CC0000' } },
      { year: 1996, date: '1996-01-10', title: '天津地铁 20 周年', detail: '自 1976 年 1 月 10 日新华路 — 海光寺开通 · 二十周年', overview: true, focus: { lng: 117.36, lat: 39.13, zoom: 9 } },
      { year: 2001, date: '2001-01-10', title: '天津地铁 25 周年', detail: '自 1976 年 1 月 10 日开通 · 二十五周年', overview: true, focus: { lng: 117.36, lat: 39.13, zoom: 9 } },
      { year: 2001, date: '2001-10-09', title: '1号线停运改造', detail: '10月9日 · 新华路 — 西站全线停运', retireSegIds: ['tj-old-a', 'tj-old-b', 'tj-old-c'], retireHoldCam: true, focus: { lng: 117.18, lat: 39.13, zoom: 13 } },
      { year: 2004, date: '2004-03-28', title: '津滨快轨开通试运营', detail: '3月28日 · 中山门 — 东海路', line: '9号线', asLine: '津滨快线', from: '中山门', to: '东海路', segId: 'tj-l9-a', ghost: ['一号桥', '二号桥', '市民广场', '会展中心', '新立', '小东庄', '军粮城', '胡家园', '太湖路', '张贵庄'] },
      { year: 2004, date: '2004-05-25', title: '一号桥站投入使用', detail: '5月25日 · 津滨快轨', openStations: ['一号桥'] },
      { year: 2004, date: '2004-10-18', title: '市民广场站投入使用', detail: '10月18日 · 津滨快轨', openStations: ['市民广场'] },
      { year: 2005, date: '2005-03-27', title: '会展中心站开通', detail: '3月27日 · 津滨快轨', openStations: ['会展中心'] },
      { year: 2005, date: '2005-04-28', title: '津滨快轨站名调整', detail: '4月28日 · 洞庭路改泰达 · 洋货市场改塘沽 · 一号桥暂停 · 二号桥投入使用', openStations: ['二号桥'], retireStations: ['一号桥'], stationRename: [
        { from: '洞庭路（泰达）', to: '泰达', lng: 117.673154, lat: 39.024665, color: '#2249A3', open: true },
        { from: '洋货市场', to: '塘沽', lng: 117.654872, lat: 39.02873, color: '#2249A3', open: true },
      ] },
      { year: 2006, date: '2006-01-10', title: '天津地铁 30 周年', detail: '自 1976 年 1 月 10 日开通 · 三十周年', overview: true, focus: { lng: 117.36, lat: 39.13, zoom: 9 } },
      { year: 2006, date: '2006-03-01', title: '津滨快轨多站开通', detail: '3月1日 · 一号桥恢复 · 新立、小东庄、军粮城、胡家园投入使用', openStations: ['新立', '小东庄', '军粮城', '胡家园'], addStations: [{ name: '一号桥', after: '中山门' }] },
      { year: 2006, date: '2006-06-12', title: '1号线刘园 — 双林开通', detail: '6月12日 · 新华路成为中国大陆第一个永久废弃的地铁站', line: '1号线', from: '刘园', to: '财经大学', ghost: ['新华路'], segId: 'tj-l1-2006' },
      { year: 2006, date: '2006-06-12', title: '1号线通至双林', detail: '6月12日 · 财经大学 — 双林', line: '1号线', from: '财经大学', to: '双林', segId: 'tj-l1-shuanglin' },
      { year: 2007, date: '2007-05-10', title: '开发区导轨电车开通', detail: '5月10日 · 泰达 — 学院区北 · 全国首条导轨电车', line: '导轨电车', from: '泰达', to: '学院区北', segId: 'tj-tram' },
      { year: 2009, date: '2009-05-28', title: '西站停运', detail: '5月28日 · 配合京沪高铁施工 · 西站停运约两年', retireStations: ['西站'], focus: { lng: 117.160419, lat: 39.155866, zoom: 14 } },
      { year: 2011, date: '2011-01-10', title: '天津地铁 35 周年', detail: '自 1976 年 1 月 10 日开通 · 三十五周年', overview: true, focus: { lng: 117.36, lat: 39.13, zoom: 9 } },
      { year: 2011, date: '2011-05-01', title: '9号线开通', detail: '5月1日 · 津滨快线更名为 9 号线 · 中山门 — 十一经路', line: '9号线', from: '中山门', to: '十一经路', segId: 'tj-l9-b', recolor: { fromLine: '津滨快线', lineName: '9号线', color: '#2249A3' } },
      { year: 2011, date: '2011-06-29', title: '西站恢复运营', detail: '6月29日 · 京沪高铁开通前西站恢复', addStations: [{ name: '西站', after: '洪湖里' }] },
      { year: 2011, date: '2011-08-25', title: '学院区南站更名', detail: '8月25日 · 导轨电车学院区南改称联合研究院', stationRename: { from: '学院区南', to: '联合研究院', lng: 117.7034, lat: 39.0822, color: '#8BC34A', open: true } },
      { year: 2011, date: '2011-09-22', title: '1号线扩编', detail: '9月22日 · 4 编组扩为 6 编组', overview: true, focus: { lng: 117.17, lat: 39.14, zoom: 12 } },
      { year: 2012, date: '2012-07-01', title: '2号线西段开通', detail: '7月1日 · 曹庄 — 东南角 · 东西分段运营', line: '2号线', from: '曹庄', to: '东南角', ghost: ['芥园西道'] },
      { year: 2012, date: '2012-07-01', title: '2号线东段开通', detail: '7月1日 · 天津站 — 空港经济区 · 建国道区间未通', line: '2号线', from: '天津站', to: '空港经济区' },
      { year: 2012, date: '2012-10-01', title: '3号线一期开通', detail: '10月1日 · 高新区 — 小淀', line: '3号线', from: '高新区', to: '小淀' },
      { year: 2012, date: '2012-10-15', title: '9号线通至天津站', detail: '10月15日 · 十一经路 — 天津站', line: '9号线', from: '十一经路', to: '天津站', segId: 'tj-l9-c' },
      { year: 2012, date: '2012-11-18', title: '芥园西道站投入使用', detail: '11月18日 · 2 号线', openStations: ['芥园西道'] },
      { year: 2013, date: '2013-08-28', title: '2号线全线贯通', detail: '8月28日 · 东南角 — 天津站贯通 · 新设建国道站', line: '2号线', from: '东南角', to: '天津站' },
      { year: 2013, date: '2013-12-28', title: '3号线西南延伸开通', detail: '12月28日 · 高新区 — 南站', line: '3号线', from: '高新区', to: '南站' },
      { year: 2014, date: '2014-08-28', title: '2号线通至机场', detail: '8月28日 · 空港经济区 — 滨海国际机场', line: '2号线', from: '空港经济区', to: '滨海国际机场' },
      { year: 2015, date: '2015-01-10', title: '天津地铁 39 周年', detail: '自 1976 年 1 月 10 日开通 · 三十九周年', overview: true, focus: { lng: 117.36, lat: 39.13, zoom: 9 } },
      { year: 2015, date: '2015-08-13', title: '9号线全线停运', detail: '8月13日 · 受 8·12 事故影响全线暂停运营', retireSegIds: ['tj-l9-a', 'tj-l9-b', 'tj-l9-c'], retireHoldCam: true, focus: { lng: 117.45, lat: 39.06, zoom: 10 } },
      { year: 2015, date: '2015-09-14', title: '东海路站拆除重建', detail: '9月14日 · 不具备修复条件 · 拆除重建', retireStations: ['东海路'], focus: { lng: 117.730983, lat: 39.039625, zoom: 14 } },
      { year: 2015, date: '2015-12-16', title: '9号线部分恢复', detail: '12月16日 · 天津站 — 钢管公司恢复运营', line: '9号线', from: '天津站', to: '钢管公司', ghost: ['张贵庄'], segId: 'tj-l9-r1' },
      { year: 2016, date: '2016-06-26', title: '9号线再恢复一段', detail: '6月26日 · 钢管公司 — 市民广场恢复运营', line: '9号线', from: '钢管公司', to: '市民广场', segId: 'tj-l9-r2' },
      { year: 2016, date: '2016-08-06', title: '6号线首开段开通', detail: '8月6日 · 长虹公园 — 南翠屏', line: '6号线', from: '长虹公园', to: '南翠屏' },
      { year: 2016, date: '2016-12-28', title: '双林站拆除', detail: '12月28日 · 配合 1 号线东延工程拆除双林', retireSegIds: ['tj-l1-shuanglin'], retireHoldCam: true, focus: { lng: 117.253, lat: 39.066, zoom: 14 } },
      { year: 2016, date: '2016-12-31', title: '9号线全线恢复', detail: '12月31日 · 剩余段恢复 · 重建东海路及预留太湖路、张贵庄投入使用', line: '9号线', from: '市民广场', to: '东海路', openStations: ['太湖路', '张贵庄', '东海路'], segId: 'tj-l9-r3' },
      { year: 2016, date: '2016-12-31', title: '6号线一期北段开通', detail: '12月31日 · 长虹公园 — 南孙庄', line: '6号线', from: '长虹公园', to: '南孙庄', defer: ['北运河'] },
      { year: 2018, date: '2018-04-26', title: '6号线一期南段开通', detail: '4月26日 · 南翠屏 — 梅林路', line: '6号线', from: '南翠屏', to: '梅林路', ghost: ['梅林路'] },
      { year: 2018, date: '2018-07-31', title: '1号线两站更名', detail: '7月31日 · 西横堤改瑞景新苑 · 果酒厂改佳园里', stationRename: [
        { from: '西横堤', to: '瑞景新苑', lng: 117.115423, lat: 39.198998, color: '#CC0000', open: true },
        { from: '果酒厂', to: '佳园里', lng: 117.121727, lat: 39.190781, color: '#CC0000', open: true },
      ] },
      { year: 2018, date: '2018-10-22', title: '5号线一期开通', detail: '10月22日 · 丹河北道 — 中医一附院', line: '5号线', from: '丹河北道', to: '中医一附院' },
      { year: 2018, date: '2018-12-03', title: '1号线东延开通', detail: '12月3日 · 财经大学 — 李楼 · 双林重建开通', line: '1号线', from: '财经大学', to: '李楼' },
      { year: 2019, date: '2019-01-31', title: '5号线北端开通', detail: '1月31日 · 丹河北道 — 北辰科技园北', line: '5号线', from: '丹河北道', to: '北辰科技园北' },
      { year: 2019, date: '2019-12-28', title: '1号线通至东沽路', detail: '12月28日 · 李楼 — 东沽路', line: '1号线', from: '李楼', to: '东沽路', defer: ['洪泥河东'] },
      { year: 2021, date: '2021-05-12', title: '1号线两站更名', detail: '5月12日 · 北洋村改国际会展中心 · 国展路改国瑞路', stationRename: [
        { from: '北洋村', to: '国际会展中心', lng: 117.377448, lat: 39.027863, color: '#CC0000', open: true },
        { from: '国展路', to: '国瑞路', lng: 117.384201, lat: 39.020821, color: '#CC0000', open: true },
      ] },
      { year: 2021, date: '2021-12-07', title: '李七庄站投入使用', detail: '12月7日 · 5号线中医一附院 — 李七庄南', line: '5号线', from: '中医一附院', to: '李七庄南' },
      { year: 2021, date: '2021-12-22', title: '黑牛城道站更名', detail: '12月22日 · 6号线黑牛城道改称医大二院', stationRename: { from: '黑牛城道', to: '医大二院', lng: 117.216663, lat: 39.080399, color: '#A61D7F', open: true } },
      { year: 2021, date: '2021-12-28', title: '梅林路站投入使用', detail: '12月28日 · 6号线', openStations: ['梅林路'] },
      { year: 2021, date: '2021-12-28', title: '6号线二期开通', detail: '12月28日 · 梅林路 — 咸水沽西', line: '6号线', asLine: '6号线二期', from: '梅林路', to: '咸水沽西' },
      { year: 2021, date: '2021-12-28', title: '4号线南段开通', detail: '12月28日 · 东南角 — 新兴村', line: '4号线', from: '东南角', to: '新兴村' },
      { year: 2022, date: '2022-11-18', title: '10号线一期开通', detail: '11月18日 · 于台 — 屿东城', line: '10号线', from: '于台', to: '屿东城' },
      { year: 2023, date: '2023-06-01', title: '导轨电车停运拆除', detail: '6月1日 · 设备检修暂停运行 · 后期拆除', retireSegIds: ['tj-tram'], retireHoldCam: true, focus: { lng: 117.689, lat: 39.057, zoom: 13 } },
      { year: 2023, date: '2023-07-31', title: '洪泥河东站投入使用', detail: '7月31日 · 1号线', openStations: ['洪泥河东'] },
      { year: 2023, date: '2023-12-28', title: '11号线一期东段开通', detail: '12月28日 · 东丽六经路 — 东江道', line: '11号线', from: '东丽六经路', to: '东江道' },
      { year: 2024, date: '2024-07-01', title: '1号线延伸段开通', detail: '7月1日 · 洪泥河东方向延伸至双桥河', line: '1号线', from: '东沽路', to: '双桥河' },
      { year: 2024, date: '2024-09-28', title: '津静线首开段开通', detail: '9月28日 · 京华东道 — 团泊医学园', line: '津静线', from: '京华东道', to: '团泊医学园' },
      { year: 2024, date: '2024-09-28', title: '京华东道站投入运营', detail: '9月28日 · 5号线李七庄南 — 京华东道 · 与津静线同日开通', line: '5号线', from: '李七庄南', to: '京华东道' },
      { year: 2024, date: '2024-12-28', title: '11号线一期西段开通', detail: '12月28日 · 水上公园西路 — 东江道（不含）· 一期全线贯通', line: '11号线', from: '水上公园西路', to: '东江道' },
      { year: 2025, date: '2025-07-08', title: '4号线北段开通', detail: '7月8日 · 小街 — 西站 · 开通初期运营', line: '4号线', from: '小街', to: '西站' },
      { year: 2025, date: '2025-09-28', title: '7号线南段开通', detail: '9月28日 · 赛达路 — 鼓楼 · 一期南段开通初期运营', line: '7号线', from: '赛达路', to: '鼓楼' },
      { year: 2026, date: '2026-01-18', title: '滨海新区Z4线一期北段开通', detail: '1月18日 · 北塘 — 寨上 · 约 23.7 公里 · 10 座车站', line: 'Z4线', from: '北塘', to: '寨上' },
    ],
  },
  chongqing: {
    label: '重庆轨交',
    prefix: 'cq',
    center: { lng: 106.55, lat: 29.56 },
    blurb: '简办3.0 · 2005 起逐段开通',
    finaleYear: 2024,
    extra: [
      { year: 2016, date: '12-28', title: '5号线开通', detail: '12月28日 · 园博中心 — 大石坝', line: '5号线', from: '园博中心', to: '大石坝' },
      { year: 2018, date: '12-28', title: '环线开通', detail: '12月28日 · 重庆西站 — 二郎', line: '环线', from: '重庆西站', to: '二郎' },
      { year: 2021, date: '01-20', title: '9号线开通', detail: '1月20日 · 兴隆 — 回兴', line: '9号线', from: '兴隆', to: '回兴' },
    ],
  },
  wuhan: {
    label: '武汉地铁',
    prefix: 'wh',
    center: { lng: 114.3, lat: 30.59 },
    blurb: '简办3.0 · 2004 起逐段开通',
    finaleYear: 2024,
    extra: [
      { year: 2013, date: '12-28', title: '4号线开通', detail: '12月28日 · 黄金口 — 武汉火车站', line: '4号线', from: '黄金口', to: '武汉火车站' },
      { year: 2015, date: '12-28', title: '3号线开通', detail: '12月28日 · 沌阳大道 — 宏图大道', line: '3号线', from: '沌阳大道', to: '宏图大道' },
      { year: 2017, date: '12-26', title: '7号线开通', detail: '12月26日 · 园博园北 — 野芷湖', line: '7号线', from: '园博园北', to: '野芷湖' },
      { year: 2018, date: '12-26', title: '8号线开通', detail: '12月26日 · 三金潭 — 军运村', line: '8号线', from: '三金潭', to: '军运村' },
    ],
  },
  chengdu: {
    label: '成都地铁',
    prefix: 'cd',
    center: { lng: 104.07, lat: 30.67 },
    blurb: '简办3.0 · 2010 起逐段开通',
    finaleYear: 2024,
    extra: [
      { year: 2010, date: '09-27', title: '1号线开通', detail: '9月27日 · 升仙湖 — 世纪城', line: '1号线', from: '升仙湖', to: '世纪城' },
      { year: 2015, date: '12-26', title: '3号线开通', detail: '12月26日 · 军区总医院 — 双流西站', line: '3号线', from: '军区总医院', to: '双流西站' },
      { year: 2017, date: '09-06', title: '7号线开通', detail: '9月6日 · 环线开通', line: '7号线', from: '火车北站', to: '火车南站' },
      { year: 2020, date: '12-18', title: '18号线开通', detail: '12月18日 · 火车南站 — 天府机场北', line: '18号线', from: '火车南站', to: '天府机场北' },
    ],
  },
  hangzhou: {
    label: '杭州地铁',
    prefix: 'hz',
    center: { lng: 120.15, lat: 30.28 },
    blurb: '简办3.0 · 2012 起逐段开通',
    finaleYear: 2024,
    extra: [
      { year: 2015, date: '11-24', title: '4号线开通', detail: '11月24日 · 彭埠 — 浦沿', line: '4号线', from: '彭埠', to: '浦沿' },
      { year: 2019, date: '06-06', title: '5号线开通', detail: '6月6日 · 善贤 — 长河', line: '5号线', from: '善贤', to: '长河' },
      { year: 2020, date: '12-30', title: '7号线开通', detail: '12月30日 · 吴山广场 — 江东二路', line: '7号线', from: '吴山广场', to: '江东二路' },
      { year: 2021, date: '09-23', title: '6号线开通', detail: '9月23日 · 双浦 — 火车东站', line: '6号线', from: '双浦', to: '火车东站（东广场）' },
    ],
  },
  nanjing: {
    label: '南京地铁',
    prefix: 'nj',
    center: { lng: 118.8, lat: 32.06 },
    blurb: '简办3.0 · 2005 起逐段开通',
    finaleYear: 2024,
    extra: [
      { year: 2014, date: '08-01', title: '10号线开通', detail: '8月1日 · 安德门 — 雨山路', line: '10号线', from: '安德门', to: '雨山路' },
      { year: 2015, date: '04-01', title: '3号线开通', detail: '4月1日 · 林场 — 秣周东路', line: '3号线', from: '林场', to: '秣周东路' },
      { year: 2017, date: '01-18', title: '4号线开通', detail: '1月18日 · 龙江 — 仙林湖', line: '4号线', from: '龙江', to: '仙林湖' },
      { year: 2021, date: '12-28', title: '7号线开通', detail: '12月28日 · 仙新路 — 幕府西路', line: '7号线', from: '仙新路', to: '幕府西路' },
    ],
  },
  ...NEW_CITY_META,
};

function lineKeyMatches(lineKey, hint) {
  if (!hint) return false;
  if (lineKey === hint) return true;
  if (/支线/.test(lineKey) !== /支线/.test(hint)) return false;
  const special = /[A-Za-z]|快线|城郊|磁浮|滨海|西海岸|蓝谷|锡澄|支线|广佛|环状|文湖|淡水|板南|信义|信義|松山|新店|中和|新芦|新蘆|芦洲|蘆洲|木栅|木柵|栅湖|柵湖|南港线|南港線|小南门|小南門|新北投|小碧潭|貓空|猫空|缆车|纜車|淡海|绿山|藍海|蓝海|安坑|三莺|三鶯|橘|红线|紅線|環狀|S1|S2|金义|义东|柯桥|机场捷运|鄭許|郑许|滁宁|杭海|宁马|氹仔|橫琴|横琴|石排灣|石排湾|綠線|绿线|资阳|嘉闵|崇明|南汇|示范区|平谷|云巴|济阳|璧铜|机场线|市域|金山|浦江|松江有轨|临港|有轨/;
  if (special.test(hint) || special.test(lineKey)) {
    const h = hint.replace(/地铁|轨道交通/g, '');
    const k = lineKey.replace(/地铁|轨道交通/g, '');
    return k.includes(h) || h.includes(k) || lineKey.includes(hint);
  }
  const hm = String(hint).match(/(?:^|[^\d])(\d+)\s*号线/);
  const km = String(lineKey).match(/(?:^|[^\d])(\d+)\s*号线/);
  if (hm && km) return hm[1] === km[1];
  return false;
}

function loadStationSource(cityId) {
  const files = [`${cityId}StationsAmap.json`, `${cityId}StationsOsm.json`];
  const loaded = [];
  for (const name of files) {
    const p = path.join(root, 'src/data', name);
    if (fs.existsSync(p)) loaded.push({ data: JSON.parse(fs.readFileSync(p, 'utf8')), file: `./${name}` });
  }
  if (!loaded.length) return null;
  if (loaded.length === 1) return loaded[0];
  const [amap, osm] = loaded[0].file.includes('Amap') ? [loaded[0], loaded[1]] : [loaded[1], loaded[0]];
  const data = {
    city: cityId,
    source: 'amap+osm',
    stations: { ...(osm.data.stations || {}), ...(amap.data.stations || {}) },
    lines: { ...(osm.data.lines || {}), ...(amap.data.lines || {}) },
  };
  return { data, file: amap.file };
}

function lineColor(amap, lineName, fallback = '#4a90d9') {
  if (!amap?.lines) return fallback;
  if (amap.lines[lineName]?.color) return amap.lines[lineName].color;
  for (const [k, v] of Object.entries(amap.lines)) {
    if (lineKeyMatches(k, lineName)) return v.color || fallback;
  }
  return fallback;
}

function sliceByNames(amap, from, to, lineHint, omit = []) {
  const skip = new Set(omit);
  const stations = amap?.stations || {};
  // Prefer line order from amap.lines
  let order = null;
  if (amap?.lines) {
    if (lineHint) {
      const hits = [];
      for (const [k, v] of Object.entries(amap.lines)) {
        if (lineKeyMatches(k, lineHint) && v.stations?.includes(from) && v.stations?.includes(to)) {
          hits.push(k);
        }
      }
      hits.sort((a, b) => {
        const score = (k) => {
          const kn = k.replace(/地铁|轨道交通/g, '');
          if (kn === lineHint || k === lineHint) return 1000 + k.length;
          if (k.includes(lineHint) || kn.includes(lineHint)) return 500 + k.length;
          return k.length;
        };
        return score(b) - score(a);
      });
      if (hits[0]) order = amap.lines[hits[0]].stations;
    }
    if (!order) {
      for (const v of Object.values(amap.lines)) {
        if (v.stations?.includes(from) && v.stations?.includes(to)) {
          order = v.stations;
          break;
        }
      }
    }
  }
  if (order) {
    const a = order.indexOf(from);
    const b = order.indexOf(to);
    if (a >= 0 && b >= 0) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      return order.slice(lo, hi + 1).map((n) => {
        if (skip.has(n)) return null;
        const c = stations[n];
        return c ? { name: n, lng: c[0], lat: c[1] } : null;
      }).filter(Boolean).filter((s, i, arr) => i === 0 || s.name !== arr[i - 1].name);
    }
  }
  // fallback: just endpoints if known
  const out = [];
  for (const n of [from, to]) {
    const c = stations[n];
    if (c) out.push({ name: n, lng: c[0], lat: c[1] });
  }
  return out;
}

function stationsFromEvent(amap, ev) {
  const table = amap?.stations || {};
  const names = (ev.stations || [])
    .map((s) => s.name)
    .filter((n) => n && !/车辆段|停车场|基地|维修|统一票价|取消|独立|不演示|中心线|联络线|培训|临时|正式投入|商业运营|调整|双线/.test(n));
  const resolved = [];
  for (const n of names) {
    // strip markers
    const name = n.replace(/^\*\//, '').replace(/\*$/, '').trim();
    const c = table[name];
    if (c) resolved.push({ name, lng: c[0], lat: c[1], deferred: !!n.startsWith('*/') || n.endsWith('*') });
  }
  return resolved;
}

function guessLineName(ev) {
  const line = ev.line || '';
  const m = line.match(/(\d+号线|磁浮|浦江线|机场线|APM|广佛|环线|[一二三四五六七八九十]+号线)/);
  if (m) return m[1].replace(/[一二三四五六七八九十]+/, (x) => {
    const map = { 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9', 十: '10' };
    return (map[x] || x) + (x.length ? '' : '');
  });
  // 上海地铁1号线 → 1号线
  const m2 = line.match(/地铁\s*(\d+)\s*号线/) || line.match(/(\d+)\s*号线/);
  if (m2) return `${m2[1]}号线`;
  if (/磁浮/.test(line)) return '磁浮线';
  if (/八通|房山|亦庄|昌平|大兴|机场|燕房|S1|浦江|广佛|环线|空港/.test(line)) {
    const mm = line.match(/(八通线|房山线|亦庄线|昌平线|大兴线|机场线|燕房线|S1线|浦江线|广佛线|环线|空港线)/);
    if (mm) return mm[1];
  }
  return line.replace(/^北京|^上海|^广州|^深圳|^天津|^南京|^武汉|^成都|^杭州|^重庆|地铁/g, '').trim() || '地铁';
}

function buildOpenings(cityId, meta, amap) {
  const openings = [];
  let raw = meta.skipExcel ? [] : eventsAll[cityId] || [];
  if (meta.skipExcelBefore) {
    raw = raw.filter((ev) => {
      const dateStr = ev.date && /^\d{4}/.test(ev.date) ? ev.date : null;
      if (dateStr) return +dateStr.slice(0, 4) >= meta.skipExcelBefore;
      const blob = `${ev.line || ''} ${ev.demo || ''}`;
      if (meta.skipExcelNoDateIf && meta.skipExcelNoDateIf.test(blob)) return false;
      return true;
    });
  }
  let idx = 0;
  for (const ev of raw) {
    if (ev.status !== '线路开通') continue;
    const demo = ev.demo || '';
    // skip non-segment noise
    if (/统一票价|站内换乘|独立计费|商业运营$/.test(demo) && !demo.includes('-')) continue;
    let stations = stationsFromEvent(amap, ev);
    // try demo "A-B"
    const dm = demo.match(/^([^—\-]+)[—\-]([^—\-]+)/);
    if (stations.length < 2 && dm) {
      const from = dm[1].replace(/站$/, '').trim();
      const to = dm[2].replace(/站$/, '').trim().replace(/独立运行|贯通.*|开通.*$/, '').trim();
      const lineName = guessLineName(ev);
      stations = sliceByNames(amap, from, to, lineName);
    }
    if (stations.length < 2) continue;

    const lineName = guessLineName(ev);
    const color = lineColor(amap, lineName);
    const dateStr = ev.date && /^\d{4}-\d{2}-\d{2}/.test(ev.date) ? ev.date : null;
    const year = dateStr ? +dateStr.slice(0, 4) : (ev.yearCell && parseInt(ev.yearCell, 10)) || 2000;
    const md = dateStr ? `${+dateStr.slice(5, 7)}月${+dateStr.slice(8, 10)}日` : '';
    openings.push({
      id: `${meta.prefix}-${year}-${idx}`,
      year,
      title: `${lineName}开通`,
      detail: md ? `${md} · ${demo}` : demo,
      line: lineName,
      color,
      stations: stations.map(({ name, lng, lat }) => ({ name, lng, lat })),
      defer: stations.filter((s) => s.deferred).map((s) => s.name),
    });
    idx++;
  }

  // extras + 规划/在建
  const extras = [...(meta.extra || []), ...((PLANNED_BY_CITY[cityId] || {}).extra || [])];
  for (const ex of extras) {
    const lineName = ex.line;
    if ((ex.overview || ex.retireSegIds || ex.openStations || ex.stationRename || ex.retireStations || ex.addStations || ex.terminusMove || ex.recolor || ex.highlightFromLine) && !(ex.from && ex.to)) {
      const names = ex.openStations || (ex.addStations || []).map((s) => s.name) || [];
      const stations = names.map((n) => {
        const c = (amap.stations || {})[n];
        return c ? { name: n, lng: c[0], lat: c[1] } : { name: n };
      });
      const addStations = (ex.addStations || []).map((s) => {
        if (s.lng != null && s.lat != null) return s;
        const c = (amap.stations || {})[s.name];
        return c ? { ...s, lng: c[0], lat: c[1] } : s;
      });
      openings.push({
        id: `${meta.prefix}-${ex.year}-x${idx}`,
        year: ex.year,
        date: ex.date || undefined,
        title: ex.title,
        detail: ex.detail,
        line: lineName,
        stations,
        overview: !!ex.overview,
        fitNetwork: !!ex.fitNetwork,
        focus: ex.focus,
        focusPad: ex.focusPad,
        focusZoom: ex.focusZoom,
        retireSegIds: ex.retireSegIds,
        retireHoldCam: ex.retireHoldCam,
        recolor: ex.recolor,
        openStations: ex.openStations,
        retireStations: ex.retireStations,
        stationRename: ex.stationRename,
        terminusMove: ex.terminusMove,
        highlightFromLine: ex.highlightFromLine,
        addStations,
        allowEmpty: true,
        allowSingle: true,
        planned: !!ex.planned,
      });
      idx++;
      continue;
    }
    let stations = sliceByNames(amap, ex.from, ex.to, lineName, ex.omit);
    if (stations.length < 2) {
      console.warn('  skip extra', cityId, ex.year, ex.title, ex.from, '—', ex.to);
      continue;
    }
    openings.push({
      id: `${meta.prefix}-${ex.year}-x${idx}`,
      year: ex.year,
      date: ex.date || undefined,
      title: ex.title,
      detail: ex.detail,
      line: ex.asLine || lineName,
      color: ex.color || lineColor(amap, lineName),
      stations,
      defer: ex.defer,
      ghost: ex.ghost,
      planned: !!ex.planned,
      style: ex.style,
      osmKey: ex.osmKey,
      segId: ex.segId,
      recolor: ex.recolor,
      openStations: ex.openStations,
      retireStations: ex.retireStations,
      retireSegIds: ex.retireSegIds,
      retireHoldCam: ex.retireHoldCam,
      stationRename: ex.stationRename,
      highlightFromLine: ex.highlightFromLine,
      terminusMove: ex.terminusMove,
    });
    idx++;
  }

  // OSM 规划/在建线：无公开年份的一律收到 2035 虚线
  const usedLines = new Set(openings.map((o) => o.line).filter(Boolean));
  const osmPath = path.join(root, 'public/geo', `${cityId}-osm-lines.json`);
  if (fs.existsSync(osmPath)) {
    try {
      const osm = JSON.parse(fs.readFileSync(osmPath, 'utf8'));
      for (const [key, line] of Object.entries(osm.lines || {})) {
        if (!line?.status || line.status === 'open') continue;
        if (/港鐵|東涌|旅客捷運|T3-S1|機場捷運系統|广州地铁1号线改线|廣州地鐵1號線改線/.test(key + (line.routeName || ''))) continue;
        if (/^(C线|A线|B线)$/.test(key)) continue;
        if ((meta.skipOsmLines || []).some((n) => lineKeyMatches(key, n) || lineKeyMatches(n, key))) continue;
        if ([...usedLines].some((u) => lineKeyMatches(key, u) || lineKeyMatches(u, key))) continue;
        const order = (amap.lines && Object.entries(amap.lines).find(([k]) => lineKeyMatches(k, key))?.[1]?.stations)
          || osm.stationLines?.[key]?.stations
          || [];
        let stations = [];
        if (order.length >= 2) stations = sliceByNames(amap, order[0], order[order.length - 1], key);
        if (stations.length < 2 && line.path?.length >= 2) {
          const a = line.path[0];
          const b = line.path[line.path.length - 1];
          stations = [
            { name: `${key}起点`, lng: a[1], lat: a[0] },
            { name: `${key}终点`, lng: b[1], lat: b[0] },
          ];
        }
        if (stations.length < 2) continue;
        const year = line.status === 'construction' ? 2028 : 2035;
        openings.push({
          id: `${meta.prefix}-${year}-osm${idx}`,
          year,
          title: `${key}${line.status === 'construction' ? '在建开通' : '规划展望'}`,
          detail: line.status === 'construction'
            ? `在建 · ${stations[0].name} — ${stations[stations.length - 1].name} · 公开日期未定时按 2028 示意`
            : `规划 · ${stations[0].name} — ${stations[stations.length - 1].name} · 收到 2035 线网展望`,
          line: key,
          color: line.color || lineColor(amap, key),
          stations,
          planned: true,
        });
        usedLines.add(key);
        idx++;
      }
    } catch (e) {
      console.warn('  osm planned skip', cityId, e.message);
    }
  }

  // sort by year then id
  openings.sort((a, b) => a.year - b.year || String(a.date || '9999').localeCompare(String(b.date || '9999')) || a.id.localeCompare(b.id));
  return openings;
}

function emitModule(cityId, meta, openings, amapImport) {
  const sceneExport = SCENE_EXPORT[cityId];
  if (!sceneExport) {
    console.warn('skip no SCENE_EXPORT', cityId);
    return 0;
  }

  const code = `/**
 * ${meta.label} · 简办发展史 + 高德站位（${cityId}）
 */
import AMAP from '${amapImport}' with { type: 'json' };
import { buildCityScenes, makeStationResolver } from './metroShared.js';

const S = makeStationResolver(AMAP);

const RAW = ${JSON.stringify(openings, null, 2)};

const OPENINGS = RAW.map((op) => ({
  ...op,
  stations: op.stations.map((st) => S(st.name, st.lng, st.lat)),
}));

export const ${sceneExport} = buildCityScenes({
  prefix: '${meta.prefix}',
  openings: OPENINGS,
  finaleYear: ${Math.max(meta.finaleYear || 2024, (PLANNED_BY_CITY[cityId] || {}).finaleYear || 0, openings.some((o) => o.year >= 2030) ? 2035 : meta.finaleYear || 2024)},
  finaleTitle: '${meta.label}线网成型',
  finaleDetail: '对照简办 3.0 · 规划/在建虚线至 2035+',
  center: ${JSON.stringify(meta.center)},
});

export const ${cityId.toUpperCase()}_META = {
  id: '${cityId}',
  label: '${meta.label}',
  blurb: '${meta.blurb}',
};
`;

  const out = path.join(root, 'src/data', `${cityId}Metro.js`);
  fs.writeFileSync(out, code);
  console.log(`${cityId}: ${openings.length} openings → ${out}`);
  return openings.length;
}

const only = process.argv.slice(2);
let total = 0;
for (const [cityId, meta] of Object.entries(CITY_META)) {
  if (only.length && !only.includes(cityId)) continue;
  const src = loadStationSource(cityId);
  if (!src) {
    console.warn('skip no stations', cityId);
    continue;
  }
  total += emitModule(cityId, meta, buildOpenings(cityId, meta, src.data), src.file);
}
console.log('done, openings', total);
