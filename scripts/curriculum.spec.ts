import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { describe, it, expect } from 'vitest';
import { CurriculumSourceSchema } from '../src/app/core/schemas/curriculum.schema';

describe('Curriculo Oficial LPIC-1 (content-src/curriculum.yaml)', () => {
  const curriculumFile = path.resolve(process.cwd(), 'content-src/curriculum.yaml');
  const fileContent = fs.readFileSync(curriculumFile, 'utf-8');
  const rawData = yaml.load(fileContent);

  it('debe existir el archivo y ser valido segun CurriculumSourceSchema de Zod', () => {
    expect(fs.existsSync(curriculumFile)).toBe(true);
    const parsed = CurriculumSourceSchema.safeParse(rawData);
    expect(parsed.success).toBe(true);
  });

  const parsed = CurriculumSourceSchema.parse(rawData);

  it('debe tener exactamente 2 examenes: 101 y 102 con peso 60 cada uno', () => {
    expect(parsed.exams).toHaveLength(2);
    const exam101 = parsed.exams.find(e => e.id === '101');
    const exam102 = parsed.exams.find(e => e.id === '102');

    expect(exam101).toBeDefined();
    expect(exam102).toBeDefined();

    expect(exam101?.weight).toBe(60);
    expect(exam102?.weight).toBe(60);

    expect(exam101?.status).toBe('available');
    expect(exam102?.status).toBe('planned');

    expect(exam101?.title).toBe(
      'Arquitectura del sistema, instalación de Linux y gestión de paquetes, comandos GNU y Unix, dispositivos y sistemas de archivos'
    );
  });

  it('debe tener exactamente 10 temas: 4 en el examen 101 y 6 en el 102', () => {
    expect(parsed.topics).toHaveLength(10);
    const topics101 = parsed.topics.filter(t => t.examId === '101');
    const topics102 = parsed.topics.filter(t => t.examId === '102');

    expect(topics101).toHaveLength(4);
    expect(topics102).toHaveLength(6);

    // Pesos exactos por tema en el 101: 8, 12, 26, 14
    expect(topics101.map(t => t.weight)).toEqual([8, 12, 26, 14]);
    expect(topics101.reduce((acc, t) => acc + t.weight, 0)).toBe(60);

    // Pesos exactos por tema en el 102: 8, 4, 12, 12, 14, 10
    expect(topics102.map(t => t.weight)).toEqual([8, 4, 12, 12, 14, 10]);
    expect(topics102.reduce((acc, t) => acc + t.weight, 0)).toBe(60);
  });

  it('debe tener exactamente 42 subtemas: 23 en el examen 101 y 19 en el 102', () => {
    expect(parsed.subtopics).toHaveLength(42);

    const subtopics101 = parsed.subtopics.filter(s => {
      const topic = parsed.topics.find(t => t.id === s.topicId);
      return topic?.examId === '101';
    });
    const subtopics102 = parsed.subtopics.filter(s => {
      const topic = parsed.topics.find(t => t.id === s.topicId);
      return topic?.examId === '102';
    });

    expect(subtopics101).toHaveLength(23);
    expect(subtopics102).toHaveLength(19);
  });

  it('no debe incluir el subtema 104.4 (salta de 104.3 a 104.5 en v5.0)', () => {
    const has1044 = parsed.subtopics.some(s => s.id === '104.4');
    expect(has1044).toBe(false);

    const ids104 = parsed.subtopics.filter(s => s.topicId === '104').map(s => s.id);
    expect(ids104).toEqual(['104.1', '104.2', '104.3', '104.5', '104.6', '104.7']);
  });

  it('todos los subtemas deben tener pesos que sumen exactamente el peso de su tema', () => {
    for (const topic of parsed.topics) {
      const subtopicsOfTopic = parsed.subtopics.filter(s => s.topicId === topic.id);
      const sumSubtopicsWeight = subtopicsOfTopic.reduce((acc, s) => acc + s.weight, 0);
      expect(sumSubtopicsWeight).toBe(topic.weight);
    }
  });

  it('cada tema debe configurar sus referencias de laboratorio global y resumen', () => {
    for (const topic of parsed.topics) {
      expect(topic.globalLabId).toBeDefined();
      expect(topic.summarySubtopicId).toBeDefined();
      expect(topic.subtopicIds.length).toBeGreaterThan(0);
    }
  });
});

