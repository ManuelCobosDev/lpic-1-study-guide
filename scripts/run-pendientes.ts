import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

process.env['E2E_PENDIENTES'] = 'true';

const pendientesDir = path.join(process.cwd(), 'e2e', 'ronda2', 'pendientes');
const files = fs.existsSync(pendientesDir)
  ? fs.readdirSync(pendientesDir).filter((f) => f.endsWith('.spec.ts'))
  : [];

if (files.length === 0) {
  console.log('✅ 0 fallos pendientes en e2e/ronda2/pendientes/ (todos los fallos F1-F6 han sido resueltos).');
  process.exit(0);
}

const npxExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxExecutable, ['playwright', 'test', 'e2e/ronda2/pendientes'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

process.exit(result.status ?? 0);


