/** Query OSM for tracks between 南礼士路 and 长椿街 */
const query = `
[out:json][timeout:90];
(
  way["railway"="subway"](39.896,116.343,39.908,116.362);
  way["railway"="rail"](39.896,116.343,39.908,116.362);
  way["railway"="construction"](39.896,116.343,39.908,116.362);
);
out body geom;
`;

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'data=' + encodeURIComponent(query),
});
console.log('status', res.status);
const j = await res.json();
console.log('elements', j.elements?.length);

const nl = { lng: 116.346395, lat: 39.905877 };
const cc = { lng: 116.357148, lat: 39.89806 };
const fx = { lng: 116.350669, lat: 39.905878 };

function nearBox(g) {
  if (!g?.length) return false;
  // ways that could connect nl to cc: span both northern and southern halves
  let minLat = 99,
    maxLat = -99,
    minLng = 999,
    maxLng = -999;
  for (const p of g) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lon);
    maxLng = Math.max(maxLng, p.lon);
  }
  const spansNS = minLat < 39.901 && maxLat > 39.903;
  const nearNL = maxLat > 39.904 && minLng < 116.349;
  const nearCC = minLat < 39.9 && maxLng > 116.354;
  return { spansNS, nearNL, nearCC, minLat, maxLat, minLng, maxLng };
}

for (const e of j.elements || []) {
  if (e.type !== 'way' || !e.geometry) continue;
  const tags = e.tags || {};
  const box = nearBox(e.geometry);
  const interesting = box.spansNS || (box.nearNL && box.nearCC);
  if (!interesting && !(tags.name || tags.service || tags.usage)) continue;
  if (!interesting) continue;
  console.log(
    '---',
    e.id,
    tags.name || '',
    tags.railway,
    tags.service || '',
    tags.usage || '',
    'n=' + e.geometry.length,
    box
  );
  const sample = e.geometry.filter((_, i) => i % Math.ceil(e.geometry.length / 6) === 0 || i === e.geometry.length - 1);
  console.log(sample.map((p) => `${p.lon.toFixed(5)},${p.lat.toFixed(5)}`).join(' → '));
}
