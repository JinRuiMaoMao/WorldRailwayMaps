/**
 * 中国 ORM schema2 已并入 fetch-osm-orm-rails.js（含 china-rail-network 注入）
 *   node scripts/build-cn-orm-rails.js
 *   → 等价于 node scripts/fetch-osm-orm-rails.js force cn
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const child = spawn(process.execPath, [join(here, 'fetch-osm-orm-rails.js'), 'force', 'cn'], {
  stdio: 'inherit',
  cwd: join(here, '..'),
});
child.on('exit', (code) => process.exit(code || 0));
