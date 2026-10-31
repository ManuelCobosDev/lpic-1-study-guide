import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CurriculumSourceSchema, LessonSchema } from '../src/app/core/schemas/index';

function runBuildContent(): void {
  const tsxExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(tsxExecutable, ['tsx', 'scripts/build-content.ts'], {
    stdio: 'inherit',
    shell: true
  });
  if (result.status !== 0) {
    throw new Error(`build-content falló con código ${result.status}`);
  }
}

export function addNewSubtopic(subtopicId: string, title: string): void {
  if (!subtopicId || !title) {
    console.error('Uso: npm run new:subtopic -- <id-subtema> "<título>"');
    console.error('Ejemplo: npm run new:subtopic -- 103.9 "Prueba de Extensibilidad"');
    process.exit(1);
  }

  const topicId = subtopicId.split('.')[0] ?? '101';
  const curriculumPath = path.resolve('content-src/curriculum.yaml');
  const rawCurriculum = yaml.load(fs.readFileSync(curriculumPath, 'utf8')) as Record<string, unknown>;

  const parsedCurriculum = CurriculumSourceSchema.parse(rawCurriculum);

  const topic = parsedCurriculum.topics.find((t) => t.id === topicId);
  if (!topic) {
    console.error(`Error: No existe el tema ${topicId} en curriculum.yaml`);
    process.exit(1);
  }

  // Comprobar si ya existe
  if (parsedCurriculum.subtopics.some((s) => s.id === subtopicId)) {
    console.log(`Aviso: El subtema ${subtopicId} ya existe en curriculum.yaml.`);
  } else {
    // Añadir al array de subtopics del tema
    if (!topic.subtopicIds.includes(subtopicId)) {
      topic.subtopicIds.push(subtopicId);
    }

    // Añadir subtema oficial
    parsedCurriculum.subtopics.push({
      id: subtopicId,
      topicId,
      title,
      weight: 1,
      estimatedMinutes: 20,
      status: 'available',
      placeholder: false
    });

    fs.writeFileSync(curriculumPath, yaml.dump(parsedCurriculum), 'utf8');
    console.log(`✔ Subtema ${subtopicId} agregado a content-src/curriculum.yaml`);
  }

  // Crear archivo de lección si no existe
  const lessonPath = path.resolve(`content-src/lessons/${subtopicId}.json`);
  if (!fs.existsSync(lessonPath)) {
    const lessonData = {
      id: subtopicId,
      topicId,
      examId: topic.examId,
      title,
      version: '1.0.0',
      language: 'es',
      estimatedMinutes: 20,
      objectives: [`Objetivo general del subtema ${subtopicId}: ${title}`],
      keyTerms: [title.toLowerCase()],
      commands: ['echo'],
      placeholder: false,
      slides: [
        {
          id: `${subtopicId}-slide-1`,
          slideNumber: 1,
          title,
          layout: 'cover',
          blocks: [
            {
              type: 'heading',
              level: 1,
              text: title
            },
            {
              type: 'paragraph',
              text: `Contenido didáctico autogenerado para el subtema ${subtopicId}. Demuestra la extensibilidad del sistema 100% orientada a datos sin modificar componentes Angular.`
            }
          ]
        }
      ]
    };

    // Validar con Zod antes de escribir
    LessonSchema.parse(lessonData);
    fs.writeFileSync(lessonPath, JSON.stringify(lessonData, null, 2), 'utf8');
    console.log(`✔ Archivo de lección creado en ${lessonPath}`);
  }

  // Compilar contenido para actualizar manifiesto e índices
  console.log('>> Ejecutando compilación de contenido para sincronizar public/content/...');
  runBuildContent();

  console.log(`🎉 ¡Subtema ${subtopicId} ("${title}") creado y compilado exitosamente!`);
}

// Ejecución directa por CLI
const currentFile = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile);
if (isMain) {
  const args = process.argv.slice(2);
  const subtopicId = args[0] ?? '';
  const title = args[1] ?? 'Subtema Nuevo';
  addNewSubtopic(subtopicId, title);
}
