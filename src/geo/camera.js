import { project, getMapSize } from './mapEngine.js';

export function createCamera(viewportEl) {
  const { width, height } = getMapSize();
  let current = { x: width / 2, y: height / 2, zoom: 1 };
  let anim = null;

  function apply() {
    const { x, y, zoom } = current;
    const tx = width / 2 - x * zoom;
    const ty = height / 2 - y * zoom;
    viewportEl.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${zoom.toFixed(3)})`);
  }

  function setInstant({ lng, lat, zoom }) {
    const [x, y] = project(lng, lat);
    current = { x, y, zoom };
    apply();
  }

  function setOverview() {
    current = { x: width / 2, y: height / 2, zoom: 1 };
    apply();
  }

  function focusOn(lng, lat, zoom = 8) {
    const [x, y] = project(lng, lat);
    return animateTo({ x, y, zoom });
  }

  function focusBounds(points, padZoom = 1.15) {
    if (!points.length) return Promise.resolve();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      const [x, y] = project(p.lng, p.lat);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const bw = Math.max(maxX - minX, 6);
    const bh = Math.max(maxY - minY, 6);
    const zoom = Math.min(18, Math.max(1.15, Math.min((width * 0.7) / bw, (height * 0.7) / bh) / padZoom));
    return animateTo({ x: cx, y: cy, zoom });
  }

  function animateTo(target, duration = 480) {
    if (anim) cancelAnimationFrame(anim.raf);
    const from = { ...current };
    const start = performance.now();

    return new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const e = t * t * (3 - 2 * t);
        current = {
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
          zoom: from.zoom + (target.zoom - from.zoom) * e,
        };
        apply();
        if (t < 1) anim = { raf: requestAnimationFrame(step) };
        else {
          anim = null;
          current = { ...target };
          apply();
          resolve();
        }
      };
      anim = { raf: requestAnimationFrame(step) };
    });
  }

  apply();
  return { setInstant, setOverview, focusOn, focusBounds, animateTo, get: () => ({ ...current }) };
}
