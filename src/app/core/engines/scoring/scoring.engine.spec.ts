import { describe, it, expect } from 'vitest';
import {
  normalizeAnswer,
  isAnswerCorrect,
  calculateExamScore,
  mulberry32,
  selectExamQuestions,
  SubtopicWeightInfo
} from './scoring.engine';
import { Question } from '../../models/question.model';
import { QuestionAnswer } from '../../models/attempt.model';

describe('ScoringEngine (Motor de Puntuación y Selección LPI)', () => {

  describe('normalizeAnswer', () => {
    it('debe convertir a minúsculas y recortar espacios en blanco', () => {
      expect(normalizeAnswer('   BASH   ')).toBe('bash');
    });

    it('debe colapsar múltiples espacios internos a uno solo', () => {
      expect(normalizeAnswer('cat    /etc/passwd   ')).toBe('cat /etc/passwd');
    });

    it('debe manejar cadenas vacías o undefined de forma segura', () => {
      expect(normalizeAnswer('')).toBe('');
      expect(normalizeAnswer(undefined)).toBe('');
      expect(normalizeAnswer(null)).toBe('');
    });
  });

  describe('isAnswerCorrect (Corrección todo o nada)', () => {
    const singleQ: Question = {
      id: 'q-s-1',
      topicId: '103',
      subtopicId: '103.4',
      type: 'single',
      prompt: 'Pregunta simple',
      correct: ['c'],
      explanation: 'Explicación',
      difficulty: 'medium',
      placeholder: false
    };

    const multiQ: Question = {
      id: 'q-m-1',
      topicId: '103',
      subtopicId: '103.4',
      type: 'multiple',
      prompt: 'Pregunta múltiple (2 respuestas)',
      correct: ['a', 'd'],
      explanation: 'Explicación múltiple',
      difficulty: 'medium',
      placeholder: false
    };

    const fillQ: Question = {
      id: 'q-f-1',
      topicId: '103',
      subtopicId: '103.4',
      type: 'fill',
      prompt: 'Indica el comando',
      correct: ['nice'],
      acceptedAnswers: ['nice', '/usr/bin/nice'],
      explanation: 'Explicación fill',
      difficulty: 'medium',
      placeholder: false
    };

    it('para tipo single: debe validar acierto exacto de una sola opción', () => {
      expect(isAnswerCorrect(singleQ, { questionId: 'q-s-1', selectedOptions: ['c'] })).toBe(true);
      expect(isAnswerCorrect(singleQ, { questionId: 'q-s-1', selectedOptions: ['a'] })).toBe(false);
      expect(isAnswerCorrect(singleQ, { questionId: 'q-s-1', selectedOptions: ['c', 'a'] })).toBe(false);
      expect(isAnswerCorrect(singleQ, { questionId: 'q-s-1', selectedOptions: [] })).toBe(false);
      expect(isAnswerCorrect(singleQ, null)).toBe(false);
    });

    it('para tipo multiple: debe aplicar regla todo o nada (sin puntos parciales)', () => {
      // Ambas correctas -> true
      expect(isAnswerCorrect(multiQ, { questionId: 'q-m-1', selectedOptions: ['a', 'd'] })).toBe(true);
      expect(isAnswerCorrect(multiQ, { questionId: 'q-m-1', selectedOptions: ['d', 'a'] })).toBe(true);

      // Solo 1 correcta -> false (todo o nada)
      expect(isAnswerCorrect(multiQ, { questionId: 'q-m-1', selectedOptions: ['a'] })).toBe(false);
      expect(isAnswerCorrect(multiQ, { questionId: 'q-m-1', selectedOptions: ['d'] })).toBe(false);

      // 2 correctas más 1 errónea -> false
      expect(isAnswerCorrect(multiQ, { questionId: 'q-m-1', selectedOptions: ['a', 'b', 'd'] })).toBe(false);
    });

    it('para tipo fill: debe comparar normalizado contra lista acceptedAnswers', () => {
      expect(isAnswerCorrect(fillQ, { questionId: 'q-f-1', textAnswer: 'nice' })).toBe(true);
      expect(isAnswerCorrect(fillQ, { questionId: 'q-f-1', textAnswer: '  NICE  ' })).toBe(true);
      expect(isAnswerCorrect(fillQ, { questionId: 'q-f-1', textAnswer: '/usr/bin/nice' })).toBe(true);
      expect(isAnswerCorrect(fillQ, { questionId: 'q-f-1', textAnswer: 'renice' })).toBe(false);
      expect(isAnswerCorrect(fillQ, { questionId: 'q-f-1', textAnswer: '' })).toBe(false);
    });
  });

  describe('calculateExamScore (Escala oficial LPI 200–800 y aprobación en 500)', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        topicId: '101',
        subtopicId: '101.1',
        type: 'single',
        prompt: 'P1',
        correct: ['a'],
        explanation: 'E',
        difficulty: 'medium',
        placeholder: false
      },
      {
        id: 'q2',
        topicId: '101',
        subtopicId: '101.2',
        type: 'single',
        prompt: 'P2',
        correct: ['b'],
        explanation: 'E',
        difficulty: 'medium',
        placeholder: false
      },
      {
        id: 'q3',
        topicId: '103',
        subtopicId: '103.4',
        type: 'single',
        prompt: 'P3',
        correct: ['c'],
        explanation: 'E',
        difficulty: 'medium',
        placeholder: false
      },
      {
        id: 'q4',
        topicId: '103',
        subtopicId: '103.4',
        type: 'single',
        prompt: 'P4',
        correct: ['d'],
        explanation: 'E',
        difficulty: 'medium',
        placeholder: false
      }
    ];

    const subtopics: SubtopicWeightInfo[] = [
      { id: '101.1', topicId: '101', weight: 2 },
      { id: '101.2', topicId: '101', weight: 2 },
      { id: '103.4', topicId: '103', weight: 4 }
    ];

    it('0% aciertos produce 200 puntos y suspendido (passed: false)', () => {
      const answers: Record<string, QuestionAnswer> = {
        q1: { questionId: 'q1', selectedOptions: ['x'] },
        q2: { questionId: 'q2', selectedOptions: ['x'] }
      };

      const result = calculateExamScore(questions, answers, subtopics);
      expect(result.score).toBe(200);
      expect(result.passed).toBe(false);
      expect(result.correctCount).toBe(0);
      expect(result.accuracyPercentage).toBe(0);
    });

    it('100% aciertos produce 800 puntos y aprobado (passed: true)', () => {
      const answers: Record<string, QuestionAnswer> = {
        q1: { questionId: 'q1', selectedOptions: ['a'] },
        q2: { questionId: 'q2', selectedOptions: ['b'] },
        q3: { questionId: 'q3', selectedOptions: ['c'] },
        q4: { questionId: 'q4', selectedOptions: ['d'] }
      };

      const result = calculateExamScore(questions, answers, subtopics);
      expect(result.score).toBe(800);
      expect(result.passed).toBe(true);
      expect(result.correctCount).toBe(4);
      expect(result.accuracyPercentage).toBe(100);
      expect(result.weakTopicIds).toHaveLength(0);
    });

    it('50% de puntos obtenidos produce exactamente 500 puntos (aprobado)', () => {
      // Puntos posibles:
      // q1 (peso 2 / 1 q) = 2 pts
      // q2 (peso 2 / 1 q) = 2 pts
      // q3 (peso 4 / 2 q) = 2 pts
      // q4 (peso 4 / 2 q) = 2 pts
      // Total = 8 pts.
      // Acertar q1 y q2 = 4 pts (50%).
      const answers: Record<string, QuestionAnswer> = {
        q1: { questionId: 'q1', selectedOptions: ['a'] },
        q2: { questionId: 'q2', selectedOptions: ['b'] }
      };

      const result = calculateExamScore(questions, answers, subtopics);
      expect(result.rawPointsEarned).toBe(4);
      expect(result.rawPointsTotal).toBe(8);
      expect(result.score).toBe(500);
      expect(result.passed).toBe(true);
    });

    it('identifica correctamente temas débiles con acierto < 70%', () => {
      const answers: Record<string, QuestionAnswer> = {
        q1: { questionId: 'q1', selectedOptions: ['a'] },
        q2: { questionId: 'q2', selectedOptions: ['b'] }
        // Tema 103 tiene 0% acierto
      };

      const result = calculateExamScore(questions, answers, subtopics);
      expect(result.topicScores['101']?.percentage).toBe(100);
      expect(result.topicScores['103']?.percentage).toBe(0);
      expect(result.weakTopicIds).toContain('103');
      expect(result.weakTopicIds).not.toContain('101');
    });
  });

  describe('selectExamQuestions y Mulberry32 (Determinismo por semilla)', () => {
    const mockPool: Question[] = Array.from({ length: 30 }, (_, i) => ({
      id: `q-mock-${i + 1}`,
      topicId: i < 15 ? '101' : '103',
      subtopicId: i < 15 ? '101.1' : '103.4',
      type: 'single',
      prompt: `Pregunta mock ${i + 1}`,
      correct: ['a'],
      explanation: 'Exp',
      difficulty: 'medium',
      placeholder: false
    }));

    const subtopics: SubtopicWeightInfo[] = [
      { id: '101.1', topicId: '101', weight: 2 },
      { id: '103.4', topicId: '103', weight: 4 }
    ];

    it('mulberry32 genera números deterministas en el rango [0, 1)', () => {
      const rng1 = mulberry32(42);
      const val1 = rng1();
      const val2 = rng1();

      const rng2 = mulberry32(42);
      expect(rng2()).toBe(val1);
      expect(rng2()).toBe(val2);
      expect(val1).toBeGreaterThanOrEqual(0);
      expect(val1).toBeLessThan(1);
    });

    it('la misma semilla produce la misma secuencia idéntica de preguntas', () => {
      const run1 = selectExamQuestions(mockPool, subtopics, 10, 12345);
      const run2 = selectExamQuestions(mockPool, subtopics, 10, 12345);

      expect(run1.map((q) => q.id)).toEqual(run2.map((q) => q.id));
    });

    it('distintas semillas producen barajados diferentes', () => {
      const runA = selectExamQuestions(mockPool, subtopics, 10, 1111);
      const runB = selectExamQuestions(mockPool, subtopics, 10, 9999);

      expect(runA.map((q) => q.id)).not.toEqual(runB.map((q) => q.id));
    });

    it('reparte preguntas proporcionalmente según el peso de los subtemas', () => {
      // Subtema 101.1 tiene peso 2; 103.4 tiene peso 4 (ratio 1:2)
      // Para 15 preguntas: 5 de 101.1 y 10 de 103.4
      const selected = selectExamQuestions(mockPool, subtopics, 15, 42);
      expect(selected).toHaveLength(15);

      const count101 = selected.filter((q) => q.subtopicId === '101.1').length;
      const count103 = selected.filter((q) => q.subtopicId === '103.4').length;

      expect(count101).toBe(5);
      expect(count103).toBe(10);
    });

    it('excluye preguntas placeholder cuando hay suficientes preguntas reales', () => {
      const mixedPool: Question[] = [
        ...mockPool,
        {
          id: 'q-placeholder',
          topicId: '101',
          subtopicId: '101.1',
          type: 'single',
          prompt: 'Placeholder',
          correct: ['a'],
          explanation: 'Exp',
          difficulty: 'easy',
          placeholder: true
        }
      ];

      const selected = selectExamQuestions(mixedPool, subtopics, 10, 42);
      const hasPlaceholder = selected.some((q) => q.placeholder);
      expect(hasPlaceholder).toBe(false);
    });
  });

});
