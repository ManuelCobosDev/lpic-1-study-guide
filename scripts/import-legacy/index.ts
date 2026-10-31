import * as path from 'node:path';
import {
  import1034Lesson,
  import1034Lab,
  import103Questions,
  importCommandsAndGlossary
} from './import-103-4';
import { buildContent } from '../build-content';

export function runImportLegacy(): void {
  const rootDir = process.cwd();
  const legacyContentDir = path.resolve(rootDir, '_legacy/Recurso Final Definitivo/content');
  const legacyPracticasDir = path.resolve(rootDir, '_legacy/Recurso Final Definitivo/practicas-v2');
  const legacyQuestionsFile = path.resolve(rootDir, '_legacy/lpic1-slides-publico/simulador/preguntas_101.json');

  const contentSrcDir = path.resolve(rootDir, 'content-src');
  const destLessonsDir = path.join(contentSrcDir, 'lessons');
  const destLabsDir = path.join(contentSrcDir, 'labs');
  const destQuestionsDir = path.join(contentSrcDir, 'questions');

  console.log('=== Iniciando Importación Idempotente Legacy (Tajada Vertical 103.4) ===');

  console.log('1. Importando lección 103.4...');
  const lesson = import1034Lesson(legacyContentDir, destLessonsDir);
  console.log(`   ✔ Lección 103.4 importada con ${lesson.slides.length} diapositivas reales.`);

  console.log('2. Importando laboratorio 103.4...');
  const lab = import1034Lab(legacyPracticasDir, destLabsDir);
  console.log(`   ✔ Laboratorio 103.4 importado con ${lab.steps.length} misiones guiadas.`);

  console.log('3. Importando preguntas oficiales en español para Tema 103...');
  const questions = import103Questions(legacyQuestionsFile, destQuestionsDir);
  console.log(`   ✔ ${questions.length} preguntas traducidas y validadas con Zod para el Tema 103.`);

  console.log('4. Importando catálogo de comandos (>= 20) y glosario (>= 20) relacionados...');
  const { commands, glossary } = importCommandsAndGlossary(contentSrcDir);
  console.log(`   ✔ ${commands.length} comandos y ${glossary.length} términos de glosario importados.`);

  console.log('5. Ejecutando pipeline build-content para sincronizar public/content/...');
  const manifest = buildContent({ contentSrcDir });
  console.log('=== Importación Legacy completada con éxito ===');
  console.log(`Estadísticas del manifiesto: ${manifest.stats.totalSlidesReal} slides reales, ${manifest.stats.totalSlidesPlaceholder} slides de relleno.`);
}

const isMain = process.argv[1]?.includes('import-legacy');
if (isMain) {
  runImportLegacy();
}
