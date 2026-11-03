import { geoConicEqualArea, geoPath } from 'd3-geo';

const WIDTH = 1000;
const HEIGHT = 820;
const PAD = [36, 28, 24, 36];

const FOCUS = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPoint',
    coordinates: [
      [73.5, 18.2],
      [122.5, 18.2],
      [134.5, 48.5],
      [80.0, 45.0],
      [87.6, 43.8],
      [116.4, 39.9],
      [126.5, 45.8],
      [121.5, 31.2],
      [113.3, 23.1],
      [110.3, 20.0],
      [121.0, 23.7],
      [91.1, 29.6],
    ],
  },
};

let projection = null;
let ready = null;

export function getMapSize() {
  return { width: WIDTH, height: HEIGHT };
}

export async function initMap() {
  if (ready) return ready;
  ready = (async () => {
    const nation = await fetch('/geo/china-nation-simple.json').then((r) => r.json());

    projection = geoConicEqualArea()
      .parallels([25, 47])
      .rotate([-105, 0])
      .fitExtent(
        [
          [PAD[3], PAD[0]],
          [WIDTH - PAD[1], HEIGHT - PAD[2]],
        ],
        FOCUS
      );

    const pathGen = geoPath(projection);
    const nationPath = pathGen(nation);

    return { nationPath, nationFill: nationPath, provincePaths: [] };
  })();
  return ready;
}

export function project(lng, lat) {
  if (!projection) return [0, 0];
  return projection([lng, lat]);
}

export function projectPlace(place) {
  return project(place.lng, place.lat);
}

/** 折线：跟站延伸，渲染更轻 */
export function linePath(places) {
  const pts = places.map((p) => project(p.lng, p.lat)).filter((p) => p && Number.isFinite(p[0]));
  if (pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
}

export function smoothLinePath(places) {
  return linePath(places);
}

export { WIDTH, HEIGHT };
