import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { computeSubtopicHash } from './hash-utils';
import { ValidationsRegistry } from './types';

export function registerValidation(subtopicId: string, rootDir = '.'): { success: boolean; hash: string } {
  const validacionesFile = path.resolve(rootDir, 'docs/agent/validaciones.json');
  let registry: ValidationsRegistry = {};

  if (fs.existsSync(validacionesFile)) {
    try {
      registry = JSON.parse(fs.readFileSync(validacionesFile, 'utf-8'));
    } catch {
      registry = {};
    }
  }

  let commitHash = 'initial';
  try {
    commitHash = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf-8' }).trim();
  } catch {
    commitHash = 'unknown';
  }

  const hash = computeSubtopicHash(subtopicId, rootDir);
  const now = new Date().toISOString();

  registry[subtopicId] = {
    validadoPor: 'usuario',
    fecha: now,
    commit: commitHash,
    hash
  };

  fs.mkdirSync(path.dirname(validacionesFile), { recursive: true });
  fs.writeFileSync(validacionesFile, JSON.stringify(registry, null, 2) + '\n', 'utf-8');

  return { success: true, hash };
}

// CLI Driver
if (process.argv[1] && process.argv[1].endsWith('validation-register.ts')) {
  const targetId = process.argv[2];
  if (!targetId) {
    console.error('Uso: npx tsx scripts/coverage/validation-register.ts <subtopicId>');
    process.exit(1);
  }

  const result = registerValidation(targetId);
  console.log(`✅ Subtema ${targetId} registrado con éxito en validaciones.json.`);
  console.log(`   Hash: ${result.hash}`);
}

