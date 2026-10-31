import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { addNewSubtopic } from './new-subtopic';

describe('new:subtopic (Extensibilidad orientada a datos - Gate 12)', () => {
  const testSubtopicId = '103.99';
  const testTitle = 'Subtema Temporal de Prueba';
  const lessonPath = path.resolve(`content-src/lessons/${testSubtopicId}.json`);
  const publicLessonPath = path.resolve(`public/content/lessons/${testSubtopicId}.json`);
  const curriculumPath = path.resolve('content-src/curriculum.yaml');

  afterEach(() => {
    // Limpieza estricta tras la prueba
    if (fs.existsSync(lessonPath)) {
      fs.unlinkSync(lessonPath);
    }
    if (fs.existsSync(publicLessonPath)) {
      fs.unlinkSync(publicLessonPath);
    }

    // Restaurar curriculum.yaml
    const raw = yaml.load(fs.readFileSync(curriculumPath, 'utf8')) as {
      subtopics: { id: string }[];
      topics: { id: string; subtopicIds: string[] }[];
    };
    raw.subtopics = raw.subtopics.filter((s) => s.id !== testSubtopicId);
    const topic = raw.topics.find((t) => t.id === '103');
    if (topic) {
      topic.subtopicIds = topic.subtopicIds.filter((id) => id !== testSubtopicId);
    }
    fs.writeFileSync(curriculumPath, yaml.dump(raw), 'utf8');

    // Recompilar para dejar el manifiesto limpio con 42 lecciones
    const tsxExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const { spawnSync } = require('node:child_process');
    spawnSync(tsxExecutable, ['tsx', 'scripts/build-content.ts'], { shell: true, stdio: 'ignore' });
  });

  it('debe agregar el nuevo subtema a curriculum.yaml, crear el JSON y compilar el manifiesto', () => {
    addNewSubtopic(testSubtopicId, testTitle);

    expect(fs.existsSync(lessonPath)).toBe(true);

    const curriculum = yaml.load(fs.readFileSync(curriculumPath, 'utf8')) as {
      subtopics: { id: string; title: string }[];
    };
    const added = curriculum.subtopics.find((s) => s.id === testSubtopicId);
    expect(added).toBeDefined();
    expect(added?.title).toBe(testTitle);

    const manifestPath = path.resolve('public/content/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const inManifest = manifest.subtopics.find((s: { id: string }) => s.id === testSubtopicId);
    expect(inManifest).toBeDefined();
  }, 25000);
});
