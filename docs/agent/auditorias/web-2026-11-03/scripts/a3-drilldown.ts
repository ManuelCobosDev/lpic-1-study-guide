import * as fs from 'node:fs';
import * as path from 'node:path';

const analysisPath = path.resolve(process.cwd(), 'docs', 'agent', 'auditorias', 'web-2026-11-03', 'a3-analisis-lecciones.json');
const data = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));

console.log('--- DETALLE DE LECCIONES SIN RESUMEN ---');
const missingSummary = data.lessons.filter((l: any) => !l.hasSummaryClosingSlide);
for (const l of missingSummary) {
  console.log(`Lección ${l.id} (${l.title}): última diapositiva="${l.closingSlideTitle}"`);
}

console.log('\n--- DETALLE DE SLIDES ESQUELETO EN 101-104 ---');
for (const l of data.lessons.filter((l: any) => l.skeletonSlidesCount > 0 && l.id < '110')) {
  const skel = l.slides.filter((s: any) => s.isSkeletonOnlyTitle);
  for (const s of skel) {
    console.log(`Lección ${l.id} Slide ${s.slideNumber}: "${s.title}" blocks: ${JSON.stringify(s.blockTypes)}`);
  }
}

console.log('\n--- SLIDES CON MAYOR NÚMERO DE LÍNEAS DE CÓDIGO (>14) ---');
for (const l of data.lessons) {
  for (const s of l.slides) {
    if (s.maxCodeLines > 14) {
      console.log(`Lección ${l.id} Slide ${s.slideNumber} (${s.title}): ${s.maxCodeLines} líneas`);
    }
  }
}

console.log('\n--- TOP 10 SLIDES CON MÁS PALABRAS (>140) ---');
const allSlides: any[] = [];
for (const l of data.lessons) {
  for (const s of l.slides) {
    allSlides.push({ lessonId: l.id, ...s });
  }
}
allSlides.sort((a, b) => b.wordCount - a.wordCount);
for (const s of allSlides.slice(0, 10)) {
  console.log(`Lección ${s.lessonId} Slide ${s.slideNumber} (${s.title}): ${s.wordCount} palabras, ${s.charCount} caracteres, ${s.blocksCount} bloques`);
}

console.log('\n--- TOP 10 SLIDES CON MÁS FILAS DE TABLA (>6) ---');
allSlides.sort((a, b) => b.maxTableRows - a.maxTableRows);
for (const s of allSlides.slice(0, 10)) {
  console.log(`Lección ${s.lessonId} Slide ${s.slideNumber} (${s.title}): ${s.maxTableRows} filas, ${s.maxTableCols} columnas`);
}
