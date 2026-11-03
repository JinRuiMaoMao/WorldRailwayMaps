import { CORRIDORS, CITIES } from './network.js';
import { MILESTONES } from './milestones.js';

/**
 * 按年汇总「开通事件」——演示逻辑：有事件的年份放慢停留，无事件年份快进
 */
export function buildYearEvents() {
  const byYear = new Map();

  const push = (year, event) => {
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(event);
  };

  for (const c of CORRIDORS) {
    push(c.year, {
      kind: c.type === 'hsr' ? 'hsr' : 'rail',
      title: `${c.name}开通`,
      focus: c.id,
      type: 'corridor',
    });
  }

  for (const city of Object.values(CITIES)) {
    push(city.metro, {
      kind: 'metro',
      title: `${city.name}地铁开通`,
      focus: city.id,
      type: 'city',
    });
  }

  for (const m of MILESTONES) {
    push(m.year, {
      kind: m.category,
      title: m.title,
      text: m.text,
      type: 'milestone',
      focus: null,
    });
  }

  return byYear;
}

export const YEAR_EVENTS = buildYearEvents();

export function eventsAt(year) {
  return YEAR_EVENTS.get(year) || [];
}

export function hasEvents(year) {
  return YEAR_EVENTS.has(year);
}

/** 演示模式配置 */
export const DEMO_MODES = {
  all: {
    id: 'all',
    label: '全国铁路',
    start: 1876,
    end: 2025,
    showRail: true,
    showHsr: true,
    showMetro: true,
  },
  hsr: {
    id: 'hsr',
    label: '高铁发展',
    start: 2003,
    end: 2025,
    showRail: false,
    showHsr: true,
    showMetro: false,
  },
  metro: {
    id: 'metro',
    label: '城轨城市',
    start: 1969,
    end: 2025,
    showRail: false,
    showHsr: false,
    showMetro: true,
  },
};
