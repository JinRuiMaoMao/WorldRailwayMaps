/** GitHub Pages 等子路径部署时，拼上 import.meta.env.BASE_URL */
export function assetUrl(path = '') {
  const base = import.meta.env.BASE_URL || '/';
  const p = String(path).replace(/^\//, '');
  return `${base}${p}`;
}
