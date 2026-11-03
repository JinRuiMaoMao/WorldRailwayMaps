const id = Number(process.argv[2] || 1667237);
const res = await fetch(`https://api.openstreetmap.org/api/0.6/relation/${id}/full`, {
  headers: { 'User-Agent': 'chinasubwayplan/1.0' },
});
const xml = await res.text();

// parse relation tags
const relMatch = xml.match(/<relation id="(\d+)"[^>]*>([\s\S]*?)<\/relation>/);
const body = relMatch[2];
const tags = {};
for (const t of body.matchAll(/<tag k="([^"]+)" v="([^"]+)"\s*\/>/g)) tags[t[1]] = t[2];
console.log('tags', tags.type, tags.route, tags.name, tags.ref);

const members = [...body.matchAll(/<member type="([^"]+)" ref="(\d+)" role="([^"]*)"\s*\/>/g)].map((m) => ({
  type: m[1],
  ref: m[2],
  role: m[3],
}));
console.log(
  'member summary',
  members.reduce((a, m) => {
    const k = m.type + ':' + m.role;
    a[k] = (a[k] || 0) + 1;
    return a;
  }, {})
);

// How many nd in ways?
const wayLens = [...xml.matchAll(/<way id="(\d+)"[\s\S]*?<\/way>/g)].map((w) => {
  const nds = (w[0].match(/<nd /g) || []).length;
  const railway = (w[0].match(/k="railway" v="([^"]+)"/) || [])[1];
  return { id: w[1], nds, railway };
});
console.log('ways', wayLens);

// stop names
const stopIds = new Set(members.filter((m) => m.type === 'node' && m.role.includes('stop')).map((m) => m.ref));
const names = [];
for (const n of xml.matchAll(/<node id="(\d+)"[^>]*lat="([^"]+)" lon="([^"]+)"[\s\S]*?<\/node>/g)) {
  if (!stopIds.has(n[1])) continue;
  const name = (n[0].match(/k="name" v="([^"]+)"/) || [])[1];
  if (name) names.push(name);
}
console.log('stops', names.length, names.join(' → '));
