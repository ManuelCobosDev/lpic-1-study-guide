import * as path from 'node:path';
import { importAllLessons } from './import-lessons';
import { importAllLabs } from './import-labs';
import { importAllQuestions } from './import-questions';
import { importAllCommandsAndGlossary } from './import-commands-glossary';
import { buildContent } from '../build-content';

export interface ImportLegacyOptions {
  contentSrcDir?: string;
  outputDir?: string;
}

export function runImportLegacy(options?: ImportLegacyOptions): void {
  const rootDir = process.cwd();
  const legacyContentDir = path.resolve(rootDir, '_legacy/Recurso Final Definitivo/content');
  const legacyPracticasDir = path.resolve(rootDir, '_legacy/Recurso Final Definitivo/practicas-v2');
  const legacySimDir = path.resolve(rootDir, '_legacy/lpic1-slides-publico/simulador');
  const legacyPublicoDir = path.resolve(rootDir, '_legacy/lpic1-slides-publico');

  const contentSrcDir = options?.contentSrcDir ? path.resolve(options.contentSrcDir) : path.resolve(rootDir, 'content-src');
  const destLessonsDir = path.join(contentSrcDir, 'lessons');
  const destLabsDir = path.join(contentSrcDir, 'labs');
  const destQuestionsDir = path.join(contentSrcDir, 'questions');

  console.log('=== Iniciando Importación Idempotente y Completa del Legacy LPIC-1 ===');

  console.log('1. Importando 42 lecciones oficiales (Temas 101 al 110)...');
  const lessons = importAllLessons(legacyContentDir, destLessonsDir);
  let totalSlides = 0;
  for (const l of lessons) totalSlides += l.slides.length;
  console.log(`   ✔ ${lessons.length} lecciones importadas con ${totalSlides} diapositivas reales.`);

  console.log('2. Importando 42 laboratorios guiados...');
  const labs = importAllLabs(legacyPracticasDir, destLabsDir);
  let totalSteps = 0;
  for (const l of labs) totalSteps += l.steps.length;
  console.log(`   ✔ ${labs.length} laboratorios importados con ${totalSteps} misiones paso a paso.`);

  console.log('3. Importando banco de 240 preguntas del simulador (Exámenes 101 y 102)...');
  const questionsByTopic = importAllQuestions(legacySimDir, destQuestionsDir);
  let totalQuestions = 0;
  for (const t of Object.keys(questionsByTopic)) {
    totalQuestions += questionsByTopic[t]?.length ?? 0;
  }
  console.log(`   ✔ ${totalQuestions} preguntas validadas y distribuidas en 10 temas.`);

  console.log('4. Importando catálogo de comandos y glosario oficial...');
  const { commands, glossary } = importAllCommandsAndGlossary(
    legacyPublicoDir,
    legacyContentDir,
    contentSrcDir
  );
  console.log(`   ✔ ${commands.length} comandos y ${glossary.length} términos de glosario importados.`);

  console.log('5. Ejecutando pipeline build-content para sincronizar public/content/...');
  const manifest = buildContent({ contentSrcDir, outputDir: options?.outputDir });
  console.log('=== Importación Completa Legacy finalizada con éxito ===');
  console.log(`Estadísticas del manifiesto:`);
  console.log(`  - Subtemas disponibles: ${manifest.stats.availableSubtopics} / ${manifest.stats.totalSubtopics}`);
  console.log(`  - Diapositivas reales: ${manifest.stats.totalSlidesReal} (placeholders: ${manifest.stats.totalSlidesPlaceholder})`);
  console.log(`  - Laboratorios reales: ${manifest.stats.totalLabsReal} (placeholders: ${manifest.stats.totalLabsPlaceholder})`);
  console.log(`  - Preguntas reales: ${manifest.stats.totalQuestionsReal} (placeholders: ${manifest.stats.totalQuestionsPlaceholder})`);
  console.log(`  - Comandos: ${manifest.stats.totalCommands}`);
  console.log(`  - Términos de glosario: ${manifest.stats.totalTerms}`);
}

const isMain = process.argv[1]?.includes('import-legacy');
if (isMain) {
  runImportLegacy();
}
