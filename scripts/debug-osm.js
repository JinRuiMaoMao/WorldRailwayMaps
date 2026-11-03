const id = Number(process.argv[2] || 414866);
const res = await fetch(`https://api.openstreetmap.org/api/0.6/relation/${id}/full`, {
  headers: { 'User-Agent': 'chinasubwayplan/1.0' },
});
const xml = await res.text();
console.log('status', res.status, 'len', xml.length);
console.log(xml.slice(0, 1200));
console.log('nodes', (xml.match(/<node /g) || []).length);
console.log('ways', (xml.match(/<way /g) || []).length);
console.log('relations', (xml.match(/<relation /g) || []).length);
const members = [...xml.matchAll(/<member type="([^"]+)" ref="(\d+)" role="([^"]*)"\s*\/>/g)];
console.log('members', members.length);
console.log('sample', members.slice(0, 8).map((m) => m.slice(1)));
const roles = {};
for (const m of members) roles[m[1] + ':' + m[3]] = (roles[m[1] + ':' + m[3]] || 0) + 1;
console.log('roles', roles);
