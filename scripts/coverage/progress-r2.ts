import * as fs from 'node:fs';
import * as path from 'node:path';
import { evaluateCoverage } from './verify-coverage';
import { ValidationsRegistry } from './types';

const SUBTOPICS_102 = [
  '105.1', '105.2',
  '106.1', '106.2', '106.3',
  '107.1', '107.2', '107.3',
  '108.1', '108.2', '108.3', '108.4',
  '109.1', '109.2', '109.3', '109.4',
  '110.1', '110.2', '110.3'
];

export function updateProgressR2(rootDir = '.'): void {
  const progresoPath = path.resolve(rootDir, 'docs/agent/PROGRESO_R2.md');
  if (!fs.existsSync(progresoPath)) {
    console.warn(`[progress:r2] No se encontró ${progresoPath}`);
    return;
  }

  const validacionesPath = path.resolve(rootDir, 'docs/agent/validaciones.json');
  let validations: ValidationsRegistry = {};
  if (fs.existsSync(validacionesPath)) {
    try {
      validations = JSON.parse(fs.readFileSync(validacionesPath, 'utf-8'));
    } catch {
      validations = {};
    }
  }

  const rows: string[] = [
    '| Subtema | Unidades (Map/Tot) | Tokens % | Diapositivas | Preguntas | Flashcards | Validación |',
    '|---|---|---|---|---|---|---|'
  ];

  for (const sid of SUBTOPICS_102) {
    const report = evaluateCoverage(sid, { rootDir });
    const mapped = report.mappedUnitsCount + report.omittedUnitsCount;
    const tokensPct = report.totalTokensCount > 0
      ? `${Math.round((report.coveredTokensCount / report.totalTokensCount) * 100)}%`
      : '0%';
    const isValidated = Boolean(validations[sid]);
    const valStr = isValidated ? '✅ Validado' : '⏳ Pendiente';

    rows.push(
      `| ${sid} | ${mapped} / ${report.totalUnits} | ${tokensPct} | ${report.slideCount} | ${report.questionsCount} | ${report.flashcardsCount} | ${valStr} |`
    );
  }

  const tableBlock = rows.join('\n');
  const content = fs.readFileSync(progresoPath, 'utf-8');

  const autoRegex = /<!-- AUTO:BEGIN -->[\s\S]*?<!-- AUTO:END -->/;
  if (autoRegex.test(content)) {
    const updated = content.replace(
      autoRegex,
      `<!-- AUTO:BEGIN -->\n${tableBlock}\n<!-- AUTO:END -->`
    );
    fs.writeFileSync(progresoPath, updated, 'utf-8');
    console.log(`✅ Bloque automático de PROGRESO_R2.md actualizado con éxito.`);
  } else {
    console.warn(`[progress:r2] No se encontró el delimitador <!-- AUTO:BEGIN --> en ${progresoPath}`);
  }
}

// CLI Driver
if (process.argv[1] && process.argv[1].endsWith('progress-r2.ts')) {
  updateProgressR2();
}

