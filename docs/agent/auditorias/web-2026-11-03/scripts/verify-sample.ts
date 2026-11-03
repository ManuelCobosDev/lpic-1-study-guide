import * as fs from 'node:fs';

console.log('=== 1. S-01/A3-001 (110.1 slide IDs) ===');
const l110_1 = JSON.parse(fs.readFileSync('content-src/lessons/110.1.json', 'utf8'));
const slideIds = l110_1.slides.map((s: any) => s.id);
console.log('Total slides:', slideIds.length, '| IDs únicos:', new Set(slideIds).size, '| Primer ID:', slideIds[0]);

console.log('\n=== 2. S-02/A4-002 (108.1 lab stub) ===');
const lab108_1 = JSON.parse(fs.readFileSync('content-src/labs/108.1.json', 'utf8'));
console.log('Pasos del lab 108.1:', lab108_1.steps.length, '| Comando del paso:', lab108_1.steps[0].command);

console.log('\n=== 3. S-03/A4-004 (README afirmaciones) ===');
const readme = fs.readFileSync('README.md', 'utf8');
console.log('README contiene "100% Cobertura Real, 0 Placeholders":', readme.includes('100% Cobertura Real, 0 Placeholders'));

console.log('\n=== 4. A6-001/A1-001 (block-renderer falta case "html") ===');
const renderer = fs.readFileSync('src/app/shared/content-blocks/block-renderer.component.ts', 'utf8');
console.log('Contiene @case (\'html\'):', renderer.includes("@case ('html')"));

console.log('\n=== 5. A5-001 (q-103-82 clave de respuesta invertida) ===');
const q103 = JSON.parse(fs.readFileSync('content-src/questions/103.json', 'utf8'));
const q82 = q103.questions.find((q: any) => q.id === 'q-103-82');
console.log('Pregunta:', (q82.prompt || q82.question).slice(0, 50), '...');
console.log('Correcto según json:', q82.correct, '| Opciones:', JSON.stringify(q82.options));
console.log('Explicación:', q82.explanation.slice(0, 80), '...');

console.log('\n=== 6. A5-002 (q-102-52 fill con nota editorial en correct) ===');
const q102 = JSON.parse(fs.readFileSync('content-src/questions/102.json', 'utf8'));
const q52 = q102.questions.find((q: any) => q.id === 'q-102-52');
console.log('correct array:', JSON.stringify(q52.correct));

console.log('\n=== 7. A8-001 (backup.service corrompe tarjetas con data.cards) ===');
const backup = fs.readFileSync('src/app/core/services/backup.service.ts', 'utf8');
console.log('Contiene data.cards en merge:', backup.includes('data.cards'));

console.log('\n=== 8. A2-001 (errata-page enlace roto a /leccion) ===');
const errataHtml = fs.readFileSync('src/app/features/errata/pages/errata-page.component.html', 'utf8');
console.log('Contiene [\'/leccion\', id]:', errataHtml.includes("['/leccion',"));

console.log('\n=== 9. A2-002 (topic-detail-page enlace a /laboratorios/tema-101) ===');
const topicDetail = fs.readFileSync('src/app/features/curriculum/pages/topic-detail-page.component.ts', 'utf8');
console.log('Contiene /laboratorios/tema-:', topicDetail.includes('/laboratorios/tema-'));

console.log('\n=== 10. S-15/A7-001 (home FAQ promete offline sin Service Worker) ===');
const homePage = fs.readFileSync('src/app/features/home/pages/home-page.component.ts', 'utf8');
const packageJson = fs.readFileSync('package.json', 'utf8');
console.log('FAQ pregunta offline:', homePage.includes('¿Puedo estudiar sin conexión?'));
console.log('Tiene @angular/service-worker:', packageJson.includes('@angular/service-worker'));
