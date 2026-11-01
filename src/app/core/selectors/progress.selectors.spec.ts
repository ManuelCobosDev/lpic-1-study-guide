import { describe, it, expect } from 'vitest';
import {
  selectSubtopicProgress,
  selectTopicProgress,
  selectExamProgress,
  selectNextRecommendedSubtopic,
  selectWeakTopics
} from './progress.selectors';
import { UserProgress, DEFAULT_PROGRESS } from '../models/progress.model';
import { Subtopic, Topic } from '../models/curriculum.model';
import { ExamAttempt } from '../models/attempt.model';

describe('Progress Selectors (Casos límite y ponderación)', () => {
  const dummySubtopics: Subtopic[] = [
    {
      id: '101.1',
      topicId: '101',
      title: 'Hardware',
      weight: 2,
      estimatedMinutes: 30,
      status: 'available',
      placeholder: false,
      slideCount: 10
    },
    {
      id: '101.2',
      topicId: '101',
      title: 'Arranque',
      weight: 3,
      estimatedMinutes: 30,
      status: 'available',
      placeholder: false,
      slideCount: 20
    },
    {
      id: '101.3',
      topicId: '101',
      title: 'Runlevels',
      weight: 3,
      estimatedMinutes: 40,
      status: 'available',
      placeholder: false,
      slideCount: 10
    }
  ];

  const dummyTopics: Topic[] = [
    {
      id: '101',
      examId: '101',
      title: 'Arquitectura del sistema',
      weight: 8,
      subtopicIds: ['101.1', '101.2', '101.3']
    },
    {
      id: '102',
      examId: '101',
      title: 'Instalación de Linux',
      weight: 12,
      subtopicIds: []
    }
  ];

  describe('selectSubtopicProgress', () => {
    it('debe devolver 0 si no hay progreso ni diapositivas vistas', () => {
      expect(selectSubtopicProgress('101.1', DEFAULT_PROGRESS, 10)).toBe(0);
    });

    it('debe devolver 0 si totalSlides es 0 o negativo', () => {
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        viewedSlides: { '101.1': [1, 2, 3] }
      };
      expect(selectSubtopicProgress('101.1', progress, 0)).toBe(0);
      expect(selectSubtopicProgress('101.1', progress, -5)).toBe(0);
    });

    it('debe calcular el porcentaje proporcional y redondearlo', () => {
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        viewedSlides: { '101.1': [1, 2, 3, 4] } // 4 de 10 = 40%
      };
      expect(selectSubtopicProgress('101.1', progress, 10)).toBe(40);
    });

    it('debe topar el progreso en 99 si no esta marcado como completado aun viendo todas las diapositivas', () => {
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        viewedSlides: { '101.1': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } // 10 de 10
      };
      expect(selectSubtopicProgress('101.1', progress, 10)).toBe(99);
    });

    it('debe devolver 100 exactamente si el subtema esta en completedSubtopics', () => {
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        completedSubtopics: { '101.1': '2026-10-31T10:00:00Z' },
        viewedSlides: { '101.1': [1] } // Solo 1 vista, pero completado
      };
      expect(selectSubtopicProgress('101.1', progress, 10)).toBe(100);
    });
  });

  describe('selectTopicProgress', () => {
    it('debe ponderar el progreso por los minutos estimados de cada subtema', () => {
      // 101.1 (30 min): 100% completado -> 3000
      // 101.2 (30 min): 50% progreso (10/20 diapositivas) -> 1500
      // 101.3 (40 min): 0% progreso -> 0
      // Total ponderado: (3000 + 1500 + 0) / 100 min = 45%
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        completedSubtopics: { '101.1': '2026-10-31T10:00:00Z' },
        viewedSlides: {
          '101.2': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }
      };

      const result = selectTopicProgress('101', progress, dummySubtopics);
      expect(result).toBe(45);
    });

    it('debe devolver 0 si el tema no tiene subtemas o minutos', () => {
      expect(selectTopicProgress('999', DEFAULT_PROGRESS, dummySubtopics)).toBe(0);
    });
  });

  describe('selectExamProgress', () => {
    it('debe ponderar el progreso del examen por el peso LPI de cada tema', () => {
      // Tema 101 (peso 8): 50% de progreso -> 400
      // Tema 102 (peso 12): 0% de progreso -> 0
      // Total examen: 400 / 20 = 20%
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        completedSubtopics: {
          '101.1': '2026-10-31T10:00:00Z',
          '101.2': '2026-10-31T10:00:00Z'
        } // 101.1 (30min 100%) + 101.2 (30min 100%) + 101.3 (40min 0%) = 60/100 = 60% en tema 101
      };
      // Tema 101: 60% * 8 = 480
      // Tema 102: 0% * 12 = 0
      // Total: 480 / 20 = 24%
      const result = selectExamProgress('101', progress, dummyTopics, dummySubtopics);
      expect(result).toBe(24);
    });
  });

  describe('selectNextRecommendedSubtopic', () => {
    it('debe priorizar el subtema en curso (con diapositivas vistas) antes que uno no empezado', () => {
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        completedSubtopics: { '101.1': '2026-10-31T10:00:00Z' },
        viewedSlides: { '101.3': [1, 2] } // 101.3 fue empezado, 101.2 no
      };

      const next = selectNextRecommendedSubtopic(progress, dummySubtopics);
      expect(next?.id).toBe('101.3');
    });

    it('debe sugerir el primer subtema pendiente si no hay ninguno en curso', () => {
      const next = selectNextRecommendedSubtopic(DEFAULT_PROGRESS, dummySubtopics);
      expect(next?.id).toBe('101.1');
    });

    it('debe devolver null si todos los subtemas disponibles estan completados', () => {
      const progress: UserProgress = {
        ...DEFAULT_PROGRESS,
        completedSubtopics: {
          '101.1': '2026-10-31T10:00:00Z',
          '101.2': '2026-10-31T10:00:00Z',
          '101.3': '2026-10-31T10:00:00Z'
        }
      };

      const next = selectNextRecommendedSubtopic(progress, dummySubtopics);
      expect(next).toBeNull();
    });
  });

  describe('selectWeakTopics', () => {
    it('debe detectar temas con tasa de acierto inferior al 60% en intentos de examen', () => {
      const attempts: ExamAttempt[] = [
        {
          id: 'att-1',
          mode: 'exam',
          startedAt: '2026-10-31T10:00:00Z',
          durationSeconds: 1800,
          timeRemainingSeconds: 0,
          seed: 42,
          questionIds: ['q1', 'q2'],
          answers: {},
          topicScores: {
            '101': { correct: 8, total: 10, percentage: 80 },
            '102': { correct: 4, total: 10, percentage: 40 }
          }
        }
      ];

      const weak = selectWeakTopics(DEFAULT_PROGRESS, attempts, dummyTopics, dummySubtopics);
      expect(weak.map(w => w.id)).toEqual(['102']);
    });
  });
});

