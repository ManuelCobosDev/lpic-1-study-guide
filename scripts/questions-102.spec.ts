import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { import102Questions, SUBTOPIC_KEYWORDS_102 } from './import-legacy/questions-102';
import { TopicQuestionsSchema } from '../src/app/core/schemas/question.schema';

describe('Banco de preguntas del Examen 102 (Gate R6)', () => {
  const rootDir = process.cwd();
  const legacyFile = path.resolve(
    rootDir,
    '_legacy/Recurso Final Definitivo/app/simulador/preguntas_102.json'
  );
  const questionsDir = path.resolve(rootDir, 'content-src/questions');

  it('debe importar con éxito las 120 preguntas oficiales desde el legacy', () => {
    const res = import102Questions(legacyFile, questionsDir);
    expect(res.total).toBe(120);

    const sumTopics = Object.values(res.byTopic).reduce((a, b) => a + b, 0);
    expect(sumTopics).toBe(120);
  });

  it('debe garantizar que cada uno de los 19 subtemas del 102 cuenta con al menos 1 pregunta', () => {
    const expectedSubtopics = Object.keys(SUBTOPIC_KEYWORDS_102);
    expect(expectedSubtopics).toHaveLength(19);

    for (const subId of expectedSubtopics) {
      const topicId = subId.split('.')[0]!;
      const filePath = path.join(questionsDir, `${topicId}.json`);
      expect(fs.existsSync(filePath)).toBe(true);

      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const inSubtopic = parsed.questions.filter((q: { subtopicId: string }) => q.subtopicId === subId);
      expect(inSubtopic.length, `Subtema ${subId} debe tener al menos 1 pregunta`).toBeGreaterThanOrEqual(1);
    }
  });

  it('todas las preguntas del 102 deben cumplir con TopicQuestionsSchema y estar marcadas como pendiente-verificacion', () => {
    for (let t = 105; t <= 110; t++) {
      const filePath = path.join(questionsDir, `${t}.json`);
      expect(fs.existsSync(filePath)).toBe(true);

      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const validation = TopicQuestionsSchema.safeParse(raw);
      expect(validation.success, `Tema ${t} debe ser válido según TopicQuestionsSchema`).toBe(true);

      for (const q of raw.questions) {
        expect(q.status).toBe('pendiente-verificacion');
        expect(q.placeholder).toBe(false);
      }
    }
  });
});

