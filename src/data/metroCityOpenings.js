/**
 * 中国城轨城市首通年表（对照简办全国发展史 + 通行开通节点）
 * date: YYYY-MM-DD；无精确日则用月中。
 * system: 顶部简介用名（地铁/捷运/港铁/轻轨）
 */
export const METRO_CITY_OPENINGS = [
  // 简办：港铁前身九广铁路英段 1910-10-01 九龙—罗湖（早于内地地铁）
  { id: 'hongkong', name: '香港', date: '1910-10-01', lng: 114.1694, lat: 22.3193, system: '九广铁路' },
  { id: 'beijing', name: '北京', date: '1971-01-15', lng: 116.4074, lat: 39.9042, system: '地铁' },
  { id: 'tianjin', name: '天津', date: '1976-01-10', lng: 117.201, lat: 39.0842, system: '地铁' },
  { id: 'shanghai', name: '上海', date: '1993-05-28', lng: 121.4737, lat: 31.2304, system: '地铁' },
  { id: 'taipei', name: '台北', date: '1996-03-28', lng: 121.5654, lat: 25.033, system: '捷运' },
  { id: 'guangzhou', name: '广州', date: '1997-06-28', lng: 113.2644, lat: 23.1291, system: '地铁' },
  { id: 'changchun', name: '长春', date: '2002-10-30', lng: 125.3235, lat: 43.8171, system: '轨道交通' },
  { id: 'dalian', name: '大连', date: '2003-05-01', lng: 121.6147, lat: 38.914, system: '地铁' },
  { id: 'wuhan', name: '武汉', date: '2004-07-28', lng: 114.3055, lat: 30.5928, system: '地铁' },
  { id: 'chongqing', name: '重庆', date: '2004-11-06', lng: 106.5516, lat: 29.563, system: '轨道交通' },
  { id: 'shenzhen', name: '深圳', date: '2004-12-28', lng: 114.0579, lat: 22.5431, system: '地铁' },
  { id: 'nanjing', name: '南京', date: '2005-09-03', lng: 118.7969, lat: 32.0603, system: '地铁' },
  { id: 'kaohsiung', name: '高雄', date: '2008-03-09', lng: 120.3014, lat: 22.6273, system: '捷运' },
  { id: 'chengdu', name: '成都', date: '2010-09-27', lng: 104.0665, lat: 30.5723, system: '地铁' },
  { id: 'shenyang', name: '沈阳', date: '2010-09-27', lng: 123.4315, lat: 41.8057, system: '地铁' },
  { id: 'foshan', name: '佛山', date: '2010-11-03', lng: 113.1214, lat: 23.0215, system: '地铁' },
  { id: 'xian', name: '西安', date: '2011-09-16', lng: 108.9398, lat: 34.3416, system: '地铁' },
  { id: 'suzhou', name: '苏州', date: '2012-04-28', lng: 120.5853, lat: 31.2989, system: '轨道交通' },
  { id: 'kunming', name: '昆明', date: '2012-06-28', lng: 102.8329, lat: 24.8801, system: '地铁' },
  { id: 'hangzhou', name: '杭州', date: '2012-11-24', lng: 120.1551, lat: 30.2741, system: '地铁' },
  { id: 'harbin', name: '哈尔滨', date: '2013-09-26', lng: 126.5349, lat: 45.8038, system: '地铁' },
  { id: 'zhengzhou', name: '郑州', date: '2013-12-28', lng: 113.6254, lat: 34.7466, system: '地铁' },
  { id: 'changsha', name: '长沙', date: '2014-04-29', lng: 112.9388, lat: 28.2282, system: '地铁' },
  { id: 'ningbo', name: '宁波', date: '2014-05-30', lng: 121.544, lat: 29.8683, system: '轨道交通' },
  { id: 'wuxi', name: '无锡', date: '2014-07-01', lng: 120.3019, lat: 31.5747, system: '地铁' },
  { id: 'qingdao', name: '青岛', date: '2015-12-16', lng: 120.3826, lat: 36.0671, system: '地铁' },
  { id: 'nanchang', name: '南昌', date: '2015-12-26', lng: 115.8581, lat: 28.6832, system: '地铁' },
  { id: 'fuzhou', name: '福州', date: '2016-05-18', lng: 119.2965, lat: 26.0745, system: '地铁' },
  { id: 'dongguan', name: '东莞', date: '2016-05-27', lng: 113.7518, lat: 23.0207, system: '轨道交通' },
  { id: 'nanning', name: '南宁', date: '2016-06-28', lng: 108.3669, lat: 22.817, system: '轨道交通' },
  { id: 'hefei', name: '合肥', date: '2016-12-26', lng: 117.2272, lat: 31.8206, system: '轨道交通' },
  { id: 'taoyuan', name: '桃园', date: '2017-03-02', lng: 121.301, lat: 24.9936, system: '机场捷运' },
  { id: 'shijiazhuang', name: '石家庄', date: '2017-06-26', lng: 114.5149, lat: 38.0428, system: '地铁' },
  { id: 'xiamen', name: '厦门', date: '2017-12-31', lng: 118.0894, lat: 24.4798, system: '轨道交通' },
  { id: 'guiyang', name: '贵阳', date: '2017-12-28', lng: 106.6302, lat: 26.647, system: '轨道交通' },
  { id: 'urumqi', name: '乌鲁木齐', date: '2018-10-25', lng: 87.6168, lat: 43.8256, system: '地铁' },
  { id: 'wenzhou', name: '温州', date: '2019-01-23', lng: 120.6994, lat: 27.9943, system: '轨道交通' },
  { id: 'jinan', name: '济南', date: '2019-04-01', lng: 117.1205, lat: 36.6519, system: '轨道交通' },
  { id: 'lanzhou', name: '兰州', date: '2019-06-23', lng: 103.8343, lat: 36.0611, system: '轨道交通' },
  { id: 'xuzhou', name: '徐州', date: '2019-09-28', lng: 117.2838, lat: 34.2044, system: '地铁' },
  { id: 'changzhou', name: '常州', date: '2019-09-21', lng: 119.974, lat: 31.8112, system: '地铁' },
  { id: 'hohhot', name: '呼和浩特', date: '2019-12-29', lng: 111.749, lat: 40.8424, system: '地铁' },
  { id: 'macau', name: '澳门', date: '2019-12-10', lng: 113.5439, lat: 22.1987, system: '轻轨' },
  { id: 'taiyuan', name: '太原', date: '2020-12-26', lng: 112.5489, lat: 37.8706, system: '地铁' },
  { id: 'luoyang', name: '洛阳', date: '2021-03-28', lng: 112.454, lat: 34.6197, system: '轨道交通' },
  { id: 'taichung', name: '台中', date: '2021-04-25', lng: 120.6736, lat: 24.1477, system: '捷运' },
  { id: 'shaoxing', name: '绍兴', date: '2021-06-28', lng: 120.582, lat: 30.051, system: '轨道交通' },
  { id: 'haining', name: '海宁', date: '2021-06-28', lng: 120.68, lat: 30.51, system: '轨道交通' },
  { id: 'wuhu', name: '芜湖', date: '2021-11-03', lng: 118.3765, lat: 31.3263, system: '轨道交通' },
  { id: 'jinhua', name: '金华', date: '2022-08-30', lng: 119.647, lat: 29.079, system: '轨道交通' },
  { id: 'nantong', name: '南通', date: '2022-11-10', lng: 120.864, lat: 32.0162, system: '地铁' },
  { id: 'taizhouzj', name: '台州', date: '2022-12-28', lng: 121.4208, lat: 28.6561, system: '轨道交通' },
  { id: 'chuzhou', name: '滁州', date: '2023-06-28', lng: 118.3163, lat: 32.3036, system: '轨道交通' },
  { id: 'xuchang', name: '许昌', date: '2023-12-28', lng: 113.826, lat: 34.022, system: '轨道交通' },
  { id: 'ziyang', name: '资阳', date: '2024-09-29', lng: 104.642, lat: 30.122, system: '轨道交通' },
  { id: 'maanshan', name: '马鞍山', date: '2026-04-30', lng: 118.51, lat: 31.67, system: '轨道交通' },
];

export function eraLabelForOpening(o) {
  if (o.system === '九广铁路') return '九广铁路';
  if (o.system === '港铁') return '港铁';
  if (o.system === '捷运' || o.system === '机场捷运') return `${o.name}${o.system}`;
  if (o.system === '轻轨') return `${o.name}轻轨`;
  return `${o.name}${o.system || '地铁'}`;
}

export function yearOfOpening(o) {
  return Number(String(o.date).slice(0, 4));
}
