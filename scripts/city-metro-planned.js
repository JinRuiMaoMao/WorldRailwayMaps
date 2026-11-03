/**
 * 各城规划 / 在建 / 2025–2026 后通段。
 * planned:true → 时间轴虚线。from/to 须能在高德或 OSM 站表命中。
 * 年份取已公布开通或「十五五 / 三期建设规划」目标年；无精确日则只写年。
 */
export const PLANNED_BY_CITY = {
  shanghai: {
    finaleYear: 2035,
    extra: [
      { year: 2027, title: '19号线北段（规划）', detail: '目标 2027 底 · 上海宝山站 — 一二八纪念路', line: '19号线', from: '上海宝山站', to: '一二八纪念路', planned: true },
      { year: 2028, title: '嘉闵线（规划）', detail: '目标 2028 · 城北路 — 银都路', line: '嘉闵线', from: '城北路', to: '银都路', planned: true },
      { year: 2029, title: '19号线南段（规划）', detail: '目标 2028–2029 · 虹建路 — 世博大道', line: '19号线', from: '虹建路', to: '世博大道', planned: true },
      { year: 2030, title: '21号线一期（规划）', detail: '十五五建成 · 浦东南北骨干', line: '21号线', from: '川沙', to: '上海东站', planned: true },
      { year: 2030, title: '23号线一期（规划）', detail: '十五五建成 · 虹建路 — 上海体育场一带', line: '23号线', from: '虹建路', to: '上海体育场', planned: true },
      { year: 2030, title: '13号线西延伸（规划）', detail: '十五五建成 · 金运路以西', line: '13号线', from: '金运路', to: '国家会展中心', planned: true },
      { year: 2032, title: '19号线中段贯通（规划）', detail: '目标 2031–2032 · 全线贯通', line: '19号线', from: '虹建路', to: '上海宝山站', planned: true },
      { year: 2033, title: '20号线一期（规划）', detail: '规划/在建 · 交通路 — 北新园路', line: '20号线', from: '交通路', to: '北新园路', planned: true },
      { year: 2035, title: '22号线崇明线（规划）', detail: '2035 展望 · 金桥 — 陈家镇', line: '22号线', from: '金桥', to: '陈家镇', planned: true },
    ],
  },
  beijing: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-12-27', title: '17号线中段开通', detail: '12月 · 工人体育场 — 十里河', line: '17号线', from: '工人体育场', to: '十里河' },
      { year: 2025, date: '2025-12-27', title: '18号线开通', detail: '12月 · 丽泽商务区一带首通', line: '18号线', from: '丽泽商务区', to: '嘉会湖', planned: true },
      { year: 2026, date: '2026-12-31', title: '22号线平谷线（规划开通）', detail: '年底具备开通条件 · 红庙 — 平谷', line: '22号线', from: '红庙', to: '平谷', planned: true },
      { year: 2028, title: '3号线一期东延（规划）', detail: '在建 · 东坝北 — 管庄路西口', line: '3号线', from: '东坝北', to: '管庄路西口', planned: true },
      { year: 2030, title: '28号线CBD线（规划）', detail: '在建推进 · CBD 加密', line: '28号线', from: '东大桥', to: '北京站', planned: true },
      { year: 2030, title: 'M101线一期（规划）', detail: '城市副中心快线 · 十五五推进', line: 'M101线', from: '城市副中心', to: '曹各庄北', planned: true },
      { year: 2035, title: '大兴机场线北延（规划）', detail: '草桥 — 丽泽商务区', line: '大兴机场线', from: '草桥', to: '丽泽商务区', planned: true },
    ],
  },
  guangzhou: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-06-29', title: '10号线首通段开通', detail: '6月 · 西塱 — 杨箕东', line: '10号线', from: '西塱', to: '杨箕东' },
      { year: 2025, date: '2025-06-29', title: '12号线东西段开通', detail: '6月 · 二沙岛 — 大学城南', line: '12号线', from: '二沙岛', to: '大学城南' },
      { year: 2025, date: '2025-10-01', title: '13号线二期首通', detail: '10月 · 天河公园 — 新沙', line: '13号线', from: '天河公园', to: '新沙' },
      { year: 2025, date: '2025-12-29', title: '22号线后通段开通', detail: '12月 · 芳村 — 番禺广场', line: '22号线', from: '芳村', to: '番禺广场' },
      { year: 2028, title: '18号线北延（规划）', detail: '规划/在建 · 北延至广州东一带', line: '18号线', from: '冼村', to: '广州东站', planned: true },
      { year: 2030, title: '24号线（规划）', detail: '四期建设规划 · 南北快线', line: '24号线', from: '广州北站', to: '南沙客运港', planned: true },
      { year: 2035, title: '广州轨网远期（规划）', detail: '2035 线网展望', line: '28号线', from: '广州南站', to: '知识城', planned: true },
    ],
  },
  shenzhen: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-12-28', title: '13号线开通', detail: '12月起分段 · 深圳湾口岸 — 李松蓢', line: '13号线', from: '深圳湾口岸', to: '李松蓢' },
      { year: 2028, title: '15号线开通（规划）', detail: '目标 2028-12 · 前海 — 宝安环线', line: '15号线', from: '前海湾', to: '宝安', planned: true },
      { year: 2028, title: '19号线一期（规划）', detail: '目标 2028 · 南塘围 — 聚龙', line: '19号线', from: '南塘围', to: '聚龙', planned: true },
      { year: 2028, title: '20号线二期（规划）', detail: '目标 2028 · 机场 — 宝安中心一带', line: '20号线', from: '机场北', to: '宝安中心', planned: true },
      { year: 2028, title: '22号线一期（规划）', detail: '目标 2028 · 上沙 — 黎光', line: '22号线', from: '上沙', to: '黎光', planned: true },
      { year: 2028, title: '25号线一期（规划）', detail: '目标 2028 · 石岩 — 坂田', line: '25号线', from: '石岩', to: '坂田', planned: true },
      { year: 2028, title: '29号线一期（规划）', detail: '目标 2028 · 红树湾南 — 兴东', line: '29号线', from: '红树湾南', to: '兴东', planned: true },
      { year: 2028, title: '32号线一期（规划）', detail: '目标 2028 · 溪涌 — 葵涌东', line: '32号线', from: '溪涌', to: '葵涌东', planned: true },
      { year: 2029, title: '17号线一期（规划）', detail: '目标 2029 · 深圳火车站 — 上李朗', line: '17号线', from: '罗湖', to: '上李朗', planned: true },
      { year: 2029, title: '27号线一期（规划）', detail: '目标 2029 · 松坪村 — 岗头西', line: '27号线', from: '松坪村', to: '岗头西', planned: true },
      { year: 2035, title: '深圳轨网845公里展望', detail: '十五五目标 2030 后再加密至 2035', line: '13号线', from: '深圳湾口岸', to: '李松蓢', planned: true },
    ],
  },
  tianjin: {
    finaleYear: 2035,
    extra: [
      { year: 2029, title: '4号线中段（规划）', detail: '在建 · 西站 — 东南角 · 贯通南北两段', line: '4号线', from: '西站', to: '东南角', planned: true },
    ],
  },
  chongqing: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-01-02', title: '璧铜线开通', detail: '1月 · 璧山 — 铜梁西', line: '璧铜线', from: '璧山', to: '铜梁西' },
      { year: 2026, date: '2026-02-01', title: '4号线西延伸开通', detail: '2月 · 黄岭 — 石马河立交', line: '4号线', from: '黄岭', to: '石马河立交' },
      { year: 2027, title: '15号线（规划）', detail: '在建目标约 2027 · 两江快线', line: '15号线', from: '九曲河东', to: '两江影视城', planned: true },
      { year: 2027, title: '27号线（规划）', detail: '在建 · 南北快线', line: '27号线', from: '璧山', to: '重庆东站', planned: true },
      { year: 2028, title: '18号线剩余段（规划）', detail: '在建收尾', line: '18号线', from: '跳磴', to: '富华路', planned: true },
      { year: 2035, title: '重庆轨网远期（规划）', detail: '2035 展望', line: '24号线', from: '巴南', to: '两江新区', planned: true },
    ],
  },
  nanjing: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-08-06', title: '5号线开通', detail: '南段+北段贯通 · 吉印大道 — 方家营', line: '5号线', from: '吉印大道', to: '方家营' },
      { year: 2025, date: '2025-12-28', title: '3号线三期开通', detail: '12月 · 秣陵 — 林场', line: '3号线', from: '秣陵', to: '林场' },
      { year: 2025, date: '2025-12-28', title: '10号线二期开通', detail: '12月 · 东麒路 — 雨山路', line: '10号线', from: '东麒路', to: '雨山路' },
      { year: 2026, date: '2026-04-30', title: 'S2宁马线开通', detail: '4月 · 西善桥 — 太白', line: 'S2号线', from: '西善桥', to: '太白' },
      { year: 2026, date: '2026-09-29', title: '6号线开通', detail: '9月29日 · 南京南站 — 栖霞山', line: '6号线', from: '南京南站', to: '栖霞山' },
      { year: 2028, title: '9号线（规划）', detail: '在建/规划', line: '9号线', from: '滨江公园', to: '徐州路', planned: true },
      { year: 2030, title: '4号线二期（规划）', detail: '十五五', line: '4号线', from: '龙江', to: '珍珠泉', planned: true },
      { year: 2035, title: '南京轨网远期（规划）', detail: '2035 展望', line: '8号线', from: '仙林', to: '江宁', planned: true },
    ],
  },
  wuhan: {
    finaleYear: 2035,
    extra: [
      { year: 2026, date: '2026-05-01', title: '12号线一期开通', detail: '5月 · 墨水湖公园 — 钢都花园', line: '12号线', from: '墨水湖公园', to: '钢都花园' },
      { year: 2028, title: '11号线剩余段（规划）', detail: '在建收尾', line: '11号线', from: '武汉东站', to: '葛店南', planned: true },
      { year: 2030, title: '19号线延伸（规划）', detail: '十五五', line: '19号线', from: '武汉站西广场', to: '武汉新城', planned: true },
      { year: 2035, title: '武汉轨网远期（规划）', detail: '2035 展望', line: '15号线', from: '汉口北', to: '天河机场', planned: true },
    ],
  },
  chengdu: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-09-01', title: '17号线二期开通', detail: '9月 · 九江北 — 高洪', line: '17号线', from: '九江北', to: '高洪' },
      { year: 2025, date: '2025-09-01', title: '10号线三期开通', detail: '9月 · 武侯祠 — 新平(宝墩)', line: '10号线', from: '武侯祠', to: '新平(宝墩)' },
      { year: 2025, date: '2025-12-01', title: '13号线开通', detail: '12月 · 瓦窑滩 — 龙安', line: '13号线', from: '瓦窑滩', to: '龙安' },
      { year: 2025, date: '2025-12-01', title: '30号线开通', detail: '12月 · 双流机场2航站楼东 — 龙泉驿火车站南', line: '30号线', from: '双流机场2航站楼东', to: '龙泉驿火车站南' },
      { year: 2028, title: '18号线三期（规划）', detail: '在建/规划', line: '18号线', from: '天府机场北', to: '眉山东', planned: true },
      { year: 2030, title: '10号线四期（规划）', detail: '十五五', line: '10号线', from: '新平', to: '新津', planned: true },
      { year: 2035, title: '成都轨网远期（规划）', detail: '2035 展望', line: '27号线', from: '石佛', to: '红莲', planned: true },
    ],
  },
  hangzhou: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '3号线剩余段（规划）', detail: '在建/规划', line: '3号线', from: '吴山前村', to: '星桥', planned: true },
      { year: 2028, title: '10号线二期（规划）', detail: '在建/规划', line: '10号线', from: '逸盛路', to: '浙大紫金港', planned: true },
      { year: 2030, title: '15号线（规划）', detail: '三期建设规划', line: '15号线', from: '崇贤', to: '南星桥', planned: true },
      { year: 2030, title: '18号线（规划）', detail: '三期 · 杭州西 — 萧山南', line: '18号线', from: '杭州西站', to: '萧山南站', planned: true },
      { year: 2035, title: '杭州轨网远期（规划）', detail: '2035 展望', line: '12号线', from: '良渚', to: '临平', planned: true },
    ],
  },
  xian: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '1号线三期剩余（规划）', detail: '西延再延伸', line: '1号线', from: '沣河森林公园', to: '森林公园', planned: true },
      { year: 2030, title: '8号线环线剩余（规划）', detail: '十五五闭环加密', line: '8号线', from: '丈八六路', to: '博物馆', planned: true },
      { year: 2035, title: '西安轨网远期（规划）', detail: '2035 展望', line: '11号线', from: '西安北站', to: '洪庆', planned: true },
    ],
  },
  suzhou: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '2号线北延（规划）', detail: '在建/规划', line: '2号线', from: '骑河', to: '太仓', planned: true },
      { year: 2030, title: '4号线南延（规划）', detail: '十五五', line: '4号线', from: '同里', to: '吴江高铁站', planned: true },
      { year: 2030, title: 'S1线（规划）', detail: '市域 · 苏州 — 淀山湖', line: 'S1线', from: '苏州站', to: '淀山湖', planned: true },
      { year: 2035, title: '苏州轨网远期（规划）', detail: '2035 展望', line: '9号线', from: '浒墅关', to: '工业园区', planned: true },
    ],
  },
  qingdao: {
    finaleYear: 2035,
    extra: [
      { year: 2026, date: '2026-09-22', title: '8号线南段开通', detail: '9月22日 · 青岛北站 — 五四广场', line: '8号线', from: '青岛北站', to: '五四广场' },
      { year: 2028, title: '2号线剩余（规划）', detail: '在建/规划', line: '2号线', from: '四川路(轮渡)', to: '泰山路', planned: true },
      { year: 2030, title: '5号线（规划）', detail: '三期建设规划', line: '5号线', from: '麦岛', to: '青大附院', planned: true },
      { year: 2035, title: '青岛轨网远期（规划）', detail: '2035 展望', line: '7号线', from: '沧口', to: '东方影都', planned: true },
    ],
  },
  zhengzhou: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '6号线剩余段（规划）', detail: '在建收尾', line: '6号线', from: '贾鲁河', to: '河南大学新区', planned: true },
      { year: 2030, title: '10号线二期（规划）', detail: '十五五', line: '10号线', from: '郑州西站', to: '郑州东站', planned: true },
      { year: 2035, title: '郑州轨网远期（规划）', detail: '2035 展望', line: '9号线', from: '郑州南站', to: '惠济', planned: true },
    ],
  },
  changsha: {
    finaleYear: 2035,
    extra: [
      { year: 2026, date: '2026-09-04', title: '2号线西延二期开通', detail: '9月4日 · 龙虎岭 — 梅溪湖西', line: '2号线', from: '龙虎岭', to: '梅溪湖西' },
      { year: 2028, title: '7号线（规划）', detail: '在建/规划', line: '7号线', from: '云塘', to: '谷山', planned: true },
      { year: 2035, title: '长沙轨网远期（规划）', detail: '2035 展望', line: '8号线', from: '汽车西站', to: '黄花机场', planned: true },
    ],
  },
  hefei: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-12-26', title: '6号线开通', detail: '12月 · 青龙岗 — 龙塘', line: '6号线', from: '青龙岗', to: '龙塘' },
      { year: 2026, date: '2026-07-01', title: '7号线开通', detail: '7月1日 · 翡翠公园 — 省文化和非遗馆', line: '7号线', from: '翡翠公园', to: '省文化和非遗馆' },
      { year: 2028, title: '8号线二期（规划）', detail: '在建/规划', line: '8号线', from: '一里井', to: '北城高铁站', planned: true },
      { year: 2035, title: '合肥轨网远期（规划）', detail: '2035 展望', line: 'S1线', from: '合肥南站', to: '新桥机场', planned: true },
    ],
  },
  nanchang: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-06-28', title: '1号线北延东延开通', detail: '6月 · 北延东延', line: '1号线', from: '双港', to: '昌北机场' },
      { year: 2028, title: '4号线二期（规划）', detail: '在建/规划', line: '4号线', from: '白马山', to: '鱼尾洲', planned: true },
      { year: 2035, title: '南昌轨网远期（规划）', detail: '2035 展望', line: '5号线', from: '红谷滩', to: '昌东', planned: true },
    ],
  },
  nanning: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '6号线（规划）', detail: '在建/规划', line: '6号线', from: '那洪立交', to: '东沟岭', planned: true },
      { year: 2035, title: '南宁轨网远期（规划）', detail: '2035 展望', line: '1号线', from: '石埠', to: '火车东站', planned: true },
    ],
  },
  jinan: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-12-28', title: '4号线开通', detail: '12月 · 彭家庄 — 第一医科大学', line: '4号线', from: '彭家庄', to: '第一医科大学' },
      { year: 2025, date: '2025-12-28', title: '6号线东段开通', detail: '12月 · 梁王 — 山东大学', line: '6号线', from: '梁王', to: '山东大学' },
      { year: 2025, date: '2025-12-28', title: '8号线开通', detail: '12月 · 清源大街 — 邢村立交桥东', line: '8号线', from: '清源大街', to: '邢村立交桥东' },
      { year: 2025, date: '2025-12-28', title: '云巴1号线开通', detail: '12月 · 徐马 — 大正路', line: '云巴1号线', from: '徐马', to: '大正路' },
      { year: 2025, date: '2025-12-28', title: '济阳线开通', detail: '12月 · 济南东站 — 济阳北', line: '济阳线', from: '济南东站(济阳线)', to: '济阳北' },
      { year: 2030, title: '济阳线延伸（规划）', detail: '十五五', line: '济阳线', from: '济南东站', to: '济阳', planned: true },
      { year: 2035, title: '济南轨网远期（规划）', detail: '2035 展望', line: '5号线', from: '济南西站', to: '遥墙机场', planned: true },
    ],
  },
  shijiazhuang: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '1号线三期（规划）', detail: '在建/规划', line: '1号线', from: '洨河大道', to: '东庄', planned: true },
      { year: 2030, title: '4号线（规划）', detail: '二期建设规划', line: '4号线', from: '西王', to: '东垣', planned: true },
      { year: 2035, title: '石家庄轨网远期（规划）', detail: '2035 展望', line: '5号线', from: '新百广场', to: '正定机场', planned: true },
    ],
  },
  kunming: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '2号线二期（规划）', detail: '在建/规划', line: '2号线', from: '北部汽车站', to: '昆明南火车站', planned: true },
      { year: 2030, title: '9号线（规划）', detail: '三期建设规划', line: '9号线', from: '昆明站', to: '呈贡', planned: true },
      { year: 2035, title: '昆明轨网远期（规划）', detail: '2035 展望', line: '7号线', from: '长水机场', to: '西山', planned: true },
    ],
  },
  fuzhou: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '4号线剩余（规划）', detail: '在建收尾', line: '4号线', from: '帝封江', to: '半洲', planned: true },
      { year: 2030, title: '2号线东延（规划）', detail: '十五五', line: '2号线', from: '洋里', to: '下洋', planned: true },
      { year: 2035, title: '福州轨网远期（规划）', detail: '2035 展望', line: '3号线', from: '福州站', to: '南通镇', planned: true },
    ],
  },
  ningbo: {
    finaleYear: 2035,
    extra: [
      { year: 2026, date: '2026-01-10', title: '6号线开通', detail: '1月 · 古林 — 红联', line: '6号线', from: '古林', to: '红联' },
      { year: 2026, date: '2026-09-22', title: '12号线开通', detail: '9月22日 · 小洋江 — 大目湾', line: '12号线', from: '小洋江', to: '大目湾' },
      { year: 2028, title: '1号线西延（规划）', detail: '在建/规划', line: '1号线', from: '高桥西', to: '慈城', planned: true },
      { year: 2035, title: '宁波轨网远期（规划）', detail: '2035 展望', line: '5号线', from: '布政', to: '兴庄路', planned: true },
    ],
  },
  wuxi: {
    finaleYear: 2035,
    extra: [
      { year: 2028, title: '4号线二期（规划）', detail: '在建/规划', line: '4号线', from: '刘潭', to: '无锡新区', planned: true },
      { year: 2030, title: '5号线（规划）', detail: '三期建设规划', line: '5号线', from: '无锡站', to: '太湖新城', planned: true },
      { year: 2035, title: '无锡轨网远期（规划）', detail: '2035 展望', line: '6号线', from: '惠山', to: '宜兴', planned: true },
    ],
  },
  dongguan: {
    finaleYear: 2035,
    extra: [
      { year: 2025, date: '2025-11-28', title: '1号线开通', detail: '11月 · 东莞西站 — 梅塘', line: '1号线', from: '东莞西站', to: '梅塘' },
      { year: 2030, title: '3号线（规划）', detail: '二期建设规划', line: '3号线', from: '东莞站', to: '松山湖', planned: true },
      { year: 2035, title: '东莞轨网远期（规划）', detail: '2035 展望', line: '4号线', from: '虎门', to: '常平', planned: true },
    ],
  },
  changchun: { finaleYear: 2035, extra: [{ year: 2035, title: '长春轨网远期（规划）', detail: '2035 展望', line: '9号线', from: '长春站', to: '九台南', planned: true }] },
  dalian: { finaleYear: 2035, extra: [{ year: 2030, title: '4号线（规划）', detail: '在建/规划', line: '4号线', from: '驼山', to: '营城子', planned: true }, { year: 2035, title: '大连轨网远期（规划）', detail: '2035 展望', line: '1号线', from: '姚家', to: '河口', planned: true }] },
  shenyang: { finaleYear: 2035, extra: [{ year: 2028, title: '6号线（规划）', detail: '在建/规划', line: '6号线', from: '丁香湖', to: '世博园', planned: true }, { year: 2035, title: '沈阳轨网远期（规划）', detail: '2035 展望', line: '5号线', from: '沈阳站', to: '浑南', planned: true }] },
  foshan: { finaleYear: 2035, extra: [{ year: 2028, title: '4号线（规划）', detail: '在建/规划', line: '4号线', from: '佛山站', to: '北滘', planned: true }, { year: 2035, title: '佛山轨网远期（规划）', detail: '2035 展望', line: '1号线', from: '新城东', to: '沥滘', planned: true }] },
  harbin: { finaleYear: 2035, extra: [{ year: 2028, title: '2号线二期（规划）', detail: '在建/规划', line: '地铁2号线', from: '气象台', to: '哈尔滨东站', planned: true }, { year: 2035, title: '哈尔滨轨网远期（规划）', detail: '2035 展望', line: '地铁1号线', from: '哈尔滨东站', to: '新疆大街', planned: true }] },
  xiamen: { finaleYear: 2035, extra: [{ year: 2030, title: '4号线全线（规划）', detail: '试乘后全线', line: '地铁4号线', from: '集美软件园北', to: '前浯', planned: true }, { year: 2035, title: '厦门轨网远期（规划）', detail: '2035 展望', line: '地铁5号线', from: '厦门北站', to: '翔安机场', planned: true }] },
  guiyang: { finaleYear: 2035, extra: [{ year: 2030, title: 'S2线（规划）', detail: '市域', line: '轨道交通S2线', from: '贵阳北站', to: '清镇', planned: true }, { year: 2035, title: '贵阳轨网远期（规划）', detail: '2035 展望', line: '轨道交通4号线', from: '观山湖', to: '龙洞堡', planned: true }] },
  urumqi: { finaleYear: 2035, extra: [{ year: 2028, title: '2号线（规划）', detail: '在建', line: '轨道交通2号线', from: '延安路', to: '华光街', planned: true }, { year: 2035, title: '乌鲁木齐轨网远期（规划）', detail: '2035 展望', line: '轨道交通1号线', from: '国际机场', to: '三屯碑', planned: true }] },
  wenzhou: { finaleYear: 2035, extra: [{ year: 2028, title: 'S2线剩余（规划）', detail: '在建/规划', line: '轨道交通S2线', from: '清东路', to: '乐清', planned: true }, { year: 2035, title: '温州S3线（规划）', detail: '2035 展望', line: '轨道交通S3线', from: '温州南', to: '瑞安', planned: true }] },
  lanzhou: { finaleYear: 2035, extra: [{ year: 2028, title: '2号线剩余（规划）', detail: '在建', line: '轨道交通2号线', from: '东方红广场', to: '雁滩', planned: true }, { year: 2035, title: '兰州3号线（规划）', detail: '2035 展望', line: '轨道交通3号线', from: '陈官营', to: '和平', planned: true }] },
  xuzhou: { finaleYear: 2035, extra: [{ year: 2028, title: '4号线（规划）', detail: '在建/规划', line: '地铁4号线', from: '徐州站', to: '新城区', planned: true }, { year: 2035, title: '徐州轨网远期（规划）', detail: '2035 展望', line: '地铁5号线', from: '九里山', to: '铜山', planned: true }] },
  changzhou: { finaleYear: 2035, extra: [{ year: 2028, title: '1号线南延（规划）', detail: '在建/规划', line: '地铁1号线', from: '南夏墅', to: '武进', planned: true }, { year: 2035, title: '常州5号线（规划）', detail: '2035 展望', line: '地铁5号线', from: '常州站', to: '西太湖', planned: true }] },
  hohhot: { finaleYear: 2035, extra: [{ year: 2035, title: '呼和浩特3号线（规划）', detail: '2035 展望', line: '地铁3号线', from: '伊利健康谷', to: '白塔机场', planned: true }] },
  taiyuan: { finaleYear: 2035, extra: [{ year: 2030, title: '3号线（规划）', detail: '二期建设规划', line: '轨道交通3号线', from: '太原站', to: '武宿', planned: true }, { year: 2035, title: '太原轨网远期（规划）', detail: '2035 展望', line: '轨道交通1号线', from: '河龙湾', to: '武宿1号2号航站楼', planned: true }] },
  luoyang: { finaleYear: 2035, extra: [{ year: 2030, title: '3号线（规划）', detail: '二期建设规划', line: '地铁3号线', from: '洛阳龙门', to: '洛邑古城', planned: true }, { year: 2035, title: '洛阳轨网远期（规划）', detail: '2035 展望', line: '地铁4号线', from: '红山', to: '关林', planned: true }] },
  shaoxing: { finaleYear: 2035, extra: [{ year: 2030, title: '1号线剩余（规划）', detail: '十五五', line: '轨道交通1号线', from: '芳泉', to: '镜湖', planned: true }, { year: 2035, title: '绍兴4号线（规划）', detail: '2035 展望', line: '轨道交通4号线', from: '柯桥', to: '上虞', planned: true }] },
  wuhu: { finaleYear: 2035, extra: [{ year: 2035, title: '芜湖3号线（规划）', detail: '2035 展望', line: '轨道交通3号线', from: '鸠兹广场', to: '湾里', planned: true }] },
  nantong: { finaleYear: 2035, extra: [{ year: 2030, title: '3号线（规划）', detail: '二期建设规划', line: '轨道交通3号线', from: '南通站', to: '通州', planned: true }, { year: 2035, title: '南通轨网远期（规划）', detail: '2035 展望', line: '轨道交通1号线', from: '平潮', to: '振兴路', planned: true }] },
  jinhua: { finaleYear: 2035, extra: [{ year: 2035, title: '金义东延伸（规划）', detail: '2035 展望', line: '金义东线金义段', from: '金华站', to: '秦塘', planned: true }] },
  taizhouzj: { finaleYear: 2035, extra: [{ year: 2030, title: 'S2线（规划）', detail: '市域二期', line: '轨道交通S2线', from: '台州火车站', to: '温岭', planned: true }, { year: 2035, title: '台州S3线（规划）', detail: '2035 展望', line: '轨道交通S3线', from: '临海', to: '玉环', planned: true }] },
  macau: { finaleYear: 2035, extra: [{ year: 2028, title: '东线（规划）', detail: '澳门轻轨东线', line: '東線', from: '氹仔碼頭', to: '关闸', planned: true }, { year: 2035, title: '澳门轻轨远期（规划）', detail: '2035 展望', line: '氹仔線', from: '氹仔碼頭', to: '媽閣', planned: true }] },
  taichung: { finaleYear: 2035, extra: [{ year: 2030, title: '蓝线（规划）', detail: '台中捷运蓝线', line: '藍線', from: '台中高铁', to: '台中港', planned: true }, { year: 2035, title: '台中捷运远期（规划）', detail: '2035 展望', line: '綠線', from: '北屯總', to: '高鐵臺中', planned: true }] },
  taoyuan: { finaleYear: 2035, extra: [{ year: 2028, title: '绿线（规划）', detail: '桃园捷运绿线', line: '綠線', from: '坑口', to: '大湳', planned: true }, { year: 2035, title: '桃园捷运远期（规划）', detail: '2035 展望', line: '機場捷運 普通車 台北車站 → 老街溪', from: '台北車', to: '老街溪', planned: true }] },
  taipei: { finaleYear: 2035, extra: [{ year: 2030, title: '万大线（规划）', detail: '台北捷运万大线', line: '萬大線', from: '中正纪念堂', to: '中和', planned: true }] },
  kaohsiung: { finaleYear: 2035, extra: [{ year: 2030, title: '黄线（规划）', detail: '高雄捷运黄线', line: '黃線', from: '凯旋', to: '冈山', planned: true }, { year: 2035, title: '高雄捷运远期（规划）', detail: '2035 展望', line: '紅線 小港-岡山車站', from: '小港', to: '岡山', planned: true }] },
  chuzhou: { finaleYear: 2035, extra: [{ year: 2035, title: '滁宁线延伸（规划）', detail: '2035 展望', line: '寧滁線: 滁州高鐵站→汊河', from: '花博园', to: '汊河新城', planned: true }] },
  xuchang: { finaleYear: 2035, extra: [{ year: 2035, title: '郑许线延伸（规划）', detail: '2035 展望', line: '郑许线 长安路北 → 许昌东站', from: '长安路北', to: '许昌东', planned: true }] },
  ziyang: { finaleYear: 2035, extra: [{ year: 2035, title: '资阳线延伸（规划）', detail: '2035 展望', line: 'S3资阳线: 福田 → 资阳北站', from: '福田', to: '资阳北站', planned: true }] },
  haining: { finaleYear: 2035, extra: [{ year: 2035, title: '杭海城际延伸（规划）', detail: '2035 展望', line: '杭海城际铁路：临平南高铁站 -> 浙大国际校区', from: '临平南高铁', to: '浙大国际校区', planned: true }] },
  maanshan: { finaleYear: 2035, extra: [{ year: 2026, date: '2026-04-30', title: '宁马城际开通', detail: '4月 · 雨山路 — 当涂南', line: '宁马城际', from: '雨山路', to: '当涂南' }, { year: 2035, title: '宁马延伸（规划）', detail: '2035 展望', line: '宁马城际', from: '雨山路', to: '当涂南', planned: true }] },
};
