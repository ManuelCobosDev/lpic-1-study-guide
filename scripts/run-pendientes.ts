import { spawnSync } from 'node:child_process';

process.env['E2E_PENDIENTES'] = 'true';
const npxExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxExecutable, ['playwright', 'test', 'e2e/ronda2/pendientes'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

process.exit(result.status ?? 0);

