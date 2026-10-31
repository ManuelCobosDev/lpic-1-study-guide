import { spawnSync } from 'node:child_process';

const STAGES = [
  { name: 'build:content', cmd: 'npm', args: ['run', 'build:content'] },
  { name: 'validate:content', cmd: 'npm', args: ['run', 'validate:content'] },
  { name: 'typecheck', cmd: 'npm', args: ['run', 'typecheck'] },
  { name: 'lint', cmd: 'npm', args: ['run', 'lint'] },
  { name: 'check:tokens', cmd: 'npm', args: ['run', 'check:tokens'] },
  { name: 'check:boundaries', cmd: 'npm', args: ['run', 'check:boundaries'] },
  { name: 'test', cmd: 'npm', args: ['run', 'test'] },
  { name: 'build', cmd: 'npm', args: ['run', 'build'] },
  { name: 'e2e', cmd: 'npm', args: ['run', 'e2e'] }
];

console.log('=== Iniciando pipeline completo de verificación (npm run verify) ===');

const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const stage of STAGES) {
  console.log(`\n>> [verify] Ejecutando etapa: ${stage.name}...`);
  const result = spawnSync(npmExecutable, stage.args, {
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    console.error(`\n❌ FALLO en etapa "${stage.name}" con codigo de salida ${result.status}. Abortando verify.`);
    process.exit(result.status ?? 1);
  }
  console.log(`✔ [verify] Etapa "${stage.name}" completada con exito.`);
}

console.log('\n🎉 ¡TODAS LAS ETAPAS DE VERIFY COMPLETADAS EN VERDE!');

