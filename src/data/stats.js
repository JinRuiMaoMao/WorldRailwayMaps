/**
 * 关键统计（近似值，用于插值动画）
 * 来源：交通运输部统计公报、国铁集团、中国城市轨道交通协会等公开数据
 */
export const YEARLY_STATS = [
  { year: 1876, rail: 0.014, hsr: 0, metroKm: 0, metroCities: 0 },
  { year: 1881, rail: 0.01, hsr: 0, metroKm: 0, metroCities: 0 },
  { year: 1911, rail: 0.9, hsr: 0, metroKm: 0, metroCities: 0 },
  { year: 1949, rail: 2.18, hsr: 0, metroKm: 0, metroCities: 0 },
  { year: 1969, rail: 4.0, hsr: 0, metroKm: 0.023, metroCities: 1 },
  { year: 1976, rail: 4.6, hsr: 0, metroKm: 0.05, metroCities: 2 },
  { year: 1990, rail: 5.34, hsr: 0, metroKm: 0.05, metroCities: 2 },
  { year: 1993, rail: 5.5, hsr: 0, metroKm: 0.07, metroCities: 3 },
  { year: 1997, rail: 6.0, hsr: 0, metroKm: 0.09, metroCities: 4 },
  { year: 2000, rail: 6.87, hsr: 0, metroKm: 0.12, metroCities: 4 },
  { year: 2003, rail: 7.3, hsr: 0.4, metroKm: 0.25, metroCities: 5 },
  { year: 2005, rail: 7.5, hsr: 0.4, metroKm: 0.4, metroCities: 6 },
  { year: 2008, rail: 8.0, hsr: 0.67, metroKm: 0.8, metroCities: 10 },
  { year: 2010, rail: 9.1, hsr: 0.84, metroKm: 1.4, metroCities: 12 },
  { year: 2011, rail: 9.3, hsr: 1.0, metroKm: 1.6, metroCities: 14 },
  { year: 2012, rail: 9.8, hsr: 0.94, metroKm: 2.0, metroCities: 17 },
  { year: 2013, rail: 10.3, hsr: 1.1, metroKm: 2.4, metroCities: 19 },
  { year: 2014, rail: 11.2, hsr: 1.6, metroKm: 2.9, metroCities: 22 },
  { year: 2015, rail: 12.1, hsr: 1.9, metroKm: 3.3, metroCities: 26 },
  { year: 2016, rail: 12.4, hsr: 2.2, metroKm: 3.8, metroCities: 30 },
  { year: 2017, rail: 12.7, hsr: 2.5, metroKm: 4.5, metroCities: 34 },
  { year: 2018, rail: 13.1, hsr: 2.9, metroKm: 5.3, metroCities: 35 },
  { year: 2019, rail: 13.9, hsr: 3.5, metroKm: 6.2, metroCities: 40 },
  { year: 2020, rail: 14.6, hsr: 3.8, metroKm: 8.0, metroCities: 45 },
  { year: 2021, rail: 15.0, hsr: 4.0, metroKm: 9.2, metroCities: 50 },
  { year: 2022, rail: 15.5, hsr: 4.2, metroKm: 10.3, metroCities: 55 },
  { year: 2023, rail: 15.9, hsr: 4.5, metroKm: 11.2, metroCities: 58 },
  { year: 2024, rail: 16.2, hsr: 4.8, metroKm: 12.2, metroCities: 58 },
  { year: 2025, rail: 16.5, hsr: 5.0, metroKm: 12.7, metroCities: 58 },
];

export function interpolateStats(year) {
  const data = YEARLY_STATS;
  if (year <= data[0].year) return { ...data[0] };
  if (year >= data[data.length - 1].year) return { ...data[data.length - 1] };

  let i = 0;
  while (i < data.length - 1 && data[i + 1].year < year) i++;
  const a = data[i];
  const b = data[i + 1];
  const t = (year - a.year) / (b.year - a.year);

  return {
    year,
    rail: a.rail + (b.rail - a.rail) * t,
    hsr: a.hsr + (b.hsr - a.hsr) * t,
    metroKm: a.metroKm + (b.metroKm - a.metroKm) * t,
    metroCities: Math.round(a.metroCities + (b.metroCities - a.metroCities) * t),
  };
}
