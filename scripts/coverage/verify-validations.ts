import * as fs from 'node:fs';
import * as path from 'node:path';
import { computeSubtopicHash } from './hash-utils';
import { ValidationsRegistry } from './types';

export function verifyValidations(rootDir = '.'): { passed: boolean; mismatches: string[] } {
  const validacionesFile = path.resolve(rootDir, 'docs/agent/validaciones.json');
  if (!fs.existsSync(validacionesFile)) {
    return { passed: true, mismatches: [] };
  }

  let registry: ValidationsRegistry = {};
  try {
    registry = JSON.parse(fs.readFileSync(validacionesFile, 'utf-8'));
  } catch (err) {
    console.error(`[verify:validations] Error al parsear ${validacionesFile}:`, err);
    return { passed: false, mismatches: ['Archivo validaciones.json corrupto'] };
  }

  const entries = Object.entries(registry);
  if (entries.length === 0) {
    return { passed: true, mismatches: [] };
  }

  const mismatches: string[] = [];
  for (const [subtopicId, data] of entries) {
    const currentHash = computeSubtopicHash(subtopicId, rootDir);
    if (currentHash !== data.hash) {
      mismatches.push(
        `Subtema ${subtopicId}: hash registrado ${data.hash} no coincide con el actual ${currentHash}`
      );
    }
  }

  return {
    passed: mismatches.length === 0,
    mismatches
  };
}

// CLI Driver
if (process.argv[1] && process.argv[1].endsWith('verify-validations.ts')) {
  const result = verifyValidations();
  if (result.passed) {
    console.log('PASS: Todas las validaciones oficiales registradas en validaciones.json son íntegras.');
    process.exit(0);
  } else {
    console.error(`❌ FALLO DE INTEGRIDAD: Se detectaron cambios en subtemas previamente validados:`);
    for (const m of result.mismatches) {
      console.error(`  - ${m}`);
    }
    console.error('\nPara corregir esto, el subtema modificado debe volver a auditarse y validarse formalmente.');
    process.exit(1);
  }
}

