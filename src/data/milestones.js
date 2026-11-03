/** 关键发展里程碑 */
export const MILESTONES = [
  {
    year: 1876,
    title: '吴淞铁路通车',
    category: 'rail',
    text: '1876年7月3日上海—江湾营业，12月1日通至吴淞。中国第一条营业铁路，1877年收回拆除。',
  },
  {
    year: 1881,
    title: '唐胥铁路建成',
    category: 'rail',
    text: '1881年11月8日唐山—胥各庄通车。中国自建首条准轨铁路，后展筑为关内外 / 京奉。',
  },
  {
    year: 1912,
    title: '京张铁路精神延续',
    category: 'rail',
    text: '詹天佑主持的京张铁路成为早期自主工程的象征。',
  },
  {
    year: 1949,
    title: '新中国铁路起步',
    category: 'rail',
    text: '全国铁路营业里程约 2.2 万公里，百废待兴。',
  },
  {
    year: 1969,
    title: '北京地铁开通',
    category: 'metro',
    text: '中国第一条地下铁道投入试运营，城市轨道交通由此发端。',
  },
  {
    year: 1976,
    title: '天津地铁开通',
    category: 'metro',
    text: '天津成为中国第二个开通地铁的城市。',
  },
  {
    year: 1993,
    title: '上海地铁 1 号线',
    category: 'metro',
    text: '上海地铁正式运营，长三角城轨大发展拉开帷幕。',
  },
  {
    year: 1997,
    title: '广州地铁开通',
    category: 'metro',
    text: '华南首条地铁通车，珠三角轨道交通网络起步。',
  },
  {
    year: 2003,
    title: '秦沈客运专线',
    category: 'hsr',
    text: '中国第一条快速客运专线开通，为高铁时代铺路。',
  },
  {
    year: 2008,
    title: '京津城际开通',
    category: 'hsr',
    text: '中国第一条高速铁路通车，时速 350 公里时代到来。',
  },
  {
    year: 2009,
    title: '武广高铁开通',
    category: 'hsr',
    text: '当时世界上里程最长、时速最高的高铁之一。',
  },
  {
    year: 2011,
    title: '京沪高铁开通',
    category: 'hsr',
    text: '连接京津沪两大都市圈，成为中国高铁的标志线路。',
  },
  {
    year: 2012,
    title: '京广高铁贯通',
    category: 'hsr',
    text: '北京至广州全线贯通，形成南北大动脉。',
  },
  {
    year: 2016,
    title: '「八纵八横」规划',
    category: 'hsr',
    text: '《中长期铁路网规划》提出主干高铁网骨架。',
  },
  {
    year: 2017,
    title: '复兴号亮相',
    category: 'hsr',
    text: '中国标准动车组「复兴号」投入运营。',
  },
  {
    year: 2020,
    title: '城轨跨越 8000 公里',
    category: 'metro',
    text: '内地城轨运营里程逼近 8000 公里，开通城市超 40 个。',
  },
  {
    year: 2022,
    title: '城轨破万公里',
    category: 'metro',
    text: '中国内地城轨运营里程突破 1 万公里。',
  },
  {
    year: 2024,
    title: '铁路 16.2 万公里',
    category: 'rail',
    text: '全国铁路营业里程 16.2 万公里，其中高铁 4.8 万公里。',
  },
  {
    year: 2025,
    title: '高铁突破 5 万公里',
    category: 'hsr',
    text: '西延高铁等开通后，中国高铁运营里程突破 5 万公里。',
  },
];

export function getActiveMilestone(year) {
  let current = null;
  for (const m of MILESTONES) {
    if (m.year <= year) current = m;
  }
  return current;
}

export function getEra(year) {
  if (year < 1949) return { name: '萌芽与起步', desc: '从淞沪到全国干线雏形' };
  if (year < 1969) return { name: '干线奠基', desc: '铁路网扩展，服务国计民生' };
  if (year < 2008) return { name: '地铁兴起', desc: '大城市地下空间被重新定义' };
  if (year < 2016) return { name: '高铁崛起', desc: '从追赶到并跑的关键跨越' };
  return { name: '网络成型', desc: '八纵八横与城轨网络交织' };
}
