/** 图上线段归入 地铁 / 高铁 / 公交 */

export function classifyTransitMode(seg = {}) {
  const line = String(seg.line || '');
  const style = String(seg.style || '');
  if (style === 'bus' || style === 'shuttle') return 'bus';
  if (/快速公交|^BRT/i.test(line)) return 'bus';
  if (/(^|[^\d])(\d+)路/.test(line) && !/地铁|轻轨|有轨|高铁/.test(line)) return 'bus';
  if (/公交/.test(line) && !/有轨|地铁|轻轨/.test(line)) return 'bus';
  if (seg.networkRail || style === 'rail') return 'hsr';
  if (style === 'hsr' || /高铁|客运专线|城际铁路/.test(line)) return 'hsr';
  if (seg.kind === 'rail' && !/地铁|轻轨|有轨/.test(line)) return 'hsr';
  if (/铁路/.test(line) && !/地铁|轻轨|有轨|市域/.test(line)) return 'hsr';
  return 'metro';
}
