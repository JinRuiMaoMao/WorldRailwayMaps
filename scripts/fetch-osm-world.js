/**
 * 世界地铁 / 高铁 / 公交拉取入口
 *   node scripts/fetch-osm-world.js          先东京/伦敦/纽约 + 日法高铁
 *   node scripts/fetch-osm-world.js all      清单内全部（resume）
 */
import { spawn } from 'child_process';

function run(script, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], { stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} ${code}`))));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('all');
  const rest = args.filter((a) => a !== 'all' && a !== 'force');
  const force = args.includes('force') ? ['force'] : [];
  mkdirWorld();
  console.log('osm:world skip China DETAILED_CITIES');
  if (all) {
    await run('scripts/fetch-osm-world-metro.js', ['all', ...force]);
    await run('scripts/fetch-osm-world-rail.js', ['all', ...force]);
    await run('scripts/fetch-osm-world-bus.js', ['all', ...force]);
    return;
  }
  if (rest.length) {
    await run('scripts/fetch-osm-world-metro.js', [...rest, ...force]);
    await run('scripts/fetch-osm-world-rail.js', [...rest, ...force]).catch(() => {});
    await run('scripts/fetch-osm-world-bus.js', [...rest, ...force]);
    return;
  }
  await run('scripts/fetch-osm-world-metro.js', ['tokyo', 'london', 'nyc', ...force]);
  await run('scripts/fetch-osm-world-rail.js', ['jp', 'fr', ...force]);
  await run('scripts/fetch-osm-world-bus.js', ['tokyo', 'london', 'nyc', ...force]);
}

function mkdirWorld() {
  /* dest dirs created by child scripts */
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
