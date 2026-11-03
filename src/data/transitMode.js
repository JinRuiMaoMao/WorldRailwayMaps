/** 图上线段归入 地铁 / 高铁 / 公交 */

export function classifyTransitMode(seg = {}) {
  const line = String(seg.line || '');
  const style = String(seg.style || '');
  if (style === 'ferry' || style === 'trolleybus' || /渡轮|轮渡|ferry/i.test(line)) return 'bus';
  if (style === 'bus' || style === 'shuttle') return 'bus';
  if (/快速公交|^BRT/i.test(line)) return 'bus';
  if (/(^|[^\d])(\d+)路/.test(line) && !/地铁|轻轨|有轨|高铁/.test(line)) return 'bus';
  if (/公交|无轨/.test(line) && !/有轨|地铁|轻轨/.test(line)) return 'bus';
  const rk = String(seg.routeKind || '').toLowerCase();
  if (rk === 'ferry' || rk === 'brt' || rk === 'trolleybus' || rk === 'bus' || rk === 'minibus') {
    return 'bus';
  }
  if (seg.networkRail || style === 'rail') return 'hsr';
  if (style === 'hsr' || /高铁|客运专线|城际铁路/.test(line)) return 'hsr';
  if (seg.kind === 'rail' && !/地铁|轻轨|有轨/.test(line)) return 'hsr';
  if (/铁路/.test(line) && !/地铁|轻轨|有轨|市域/.test(line)) return 'hsr';
  return 'metro';
}

/**
 * 全球总量目标口径下的细分桶（线路里程相加、不去重）
 * ferry | brt | bus | subway | light_rail | tram | monorail | hsr | rail | …
 */
export function classifyTransitBucket(seg = {}) {
  const line = String(seg.line || '');
  const style = String(seg.style || '');
  const railway = String(seg.railway || '');
  // kind 可能是导轨剖面数组，不能当模式用
  const routeKind = String(
    seg.routeKind || seg.route || (typeof seg.kind === 'string' ? seg.kind : '') || ''
  ).toLowerCase();

  if (
    style === 'ferry' ||
    routeKind === 'ferry' ||
    /渡轮|轮渡|^ferry$/i.test(line)
  ) {
    return 'ferry';
  }
  if (routeKind === 'brt' || /快速公交|^BRT/i.test(line)) return 'brt';
  if (
    routeKind === 'trolleybus' ||
    style === 'trolleybus' ||
    /无轨电车|trolleybus/i.test(line)
  ) {
    return 'trolleybus';
  }
  if (style === 'bus' || style === 'shuttle' || routeKind === 'bus' || routeKind === 'minibus') {
    return 'bus';
  }
  if (/(^|[^\d])(\d+)路/.test(line) && !/地铁|轻轨|有轨|高铁/.test(line)) return 'bus';
  if (/公交/.test(line) && !/有轨|地铁|轻轨/.test(line)) return 'bus';

  if (seg.highspeed || style === 'hsr' || railway === 'highspeed' || /高铁|客运专线/.test(line)) {
    return 'hsr';
  }

  if (routeKind === 'tram' || railway === 'tram' || /有轨电车|(^|[^a-z])tram/i.test(line)) {
    return 'tram';
  }
  if (routeKind === 'light_rail' || railway === 'light_rail' || /轻轨|LRT/i.test(line)) {
    return 'light_rail';
  }
  if (routeKind === 'monorail' || railway === 'monorail' || /单轨|monorail/i.test(line)) {
    return 'monorail';
  }
  if (routeKind === 'funicular' || railway === 'funicular' || /缆车|funicular/i.test(line)) {
    return 'funicular';
  }
  if (routeKind === 'subway' || routeKind === 'metro') return 'subway';

  if (
    routeKind === 'commuter' ||
    routeKind === 'train' ||
    /城际|市域|通勤|suburban|commuter/i.test(line)
  ) {
    return 'commuter';
  }
  if (
    seg.networkRail ||
    seg.ormRail ||
    style === 'rail' ||
    railway === 'rail' ||
    railway === 'narrow_gauge' ||
    routeKind === 'rail' ||
    (/铁路/.test(line) && !/地铁|轻轨|有轨/.test(line))
  ) {
    return 'rail';
  }
  return 'subway';
}

export const TRANSIT_BUCKET_LABEL = {
  ferry: '渡轮',
  brt: 'BRT',
  trolleybus: '无轨',
  bus: '公交',
  subway: '地铁',
  light_rail: '轻轨',
  tram: '有轨',
  monorail: '单轨',
  funicular: '缆车',
  hsr: '高铁',
  rail: '普铁',
  commuter: '通勤/城际',
};
