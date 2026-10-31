import { describe, it, expect } from 'vitest';
import {
  BOX_INTERVALS_DAYS,
  calculateNextBox,
  formatDateIso,
  addDays,
  isCardDue,
  evaluateCard,
  selectCardsForSession,
  computeLeitnerStats
} from './leitner.engine';
import { CardProgress, LeitnerBox } from '../../models/flashcard.model';

describe('LeitnerEngine', () => {
  describe('Intervalos y Cajas', () => {
    it('debe definir los intervalos fijos especificados: 0, 1, 3, 7 y 21 días', () => {
      expect(BOX_INTERVALS_DAYS[1]).toBe(0);
      expect(BOX_INTERVALS_DAYS[2]).toBe(1);
      expect(BOX_INTERVALS_DAYS[3]).toBe(3);
      expect(BOX_INTERVALS_DAYS[4]).toBe(7);
      expect(BOX_INTERVALS_DAYS[5]).toBe(21);
    });

    it('calificación "again" debe devolver siempre Caja 1', () => {
      const boxes: LeitnerBox[] = [1, 2, 3, 4, 5];
      for (const box of boxes) {
        expect(calculateNextBox(box, 'again')).toBe(1);
      }
    });

    it('calificación "hard" debe mantener la misma caja', () => {
      const boxes: LeitnerBox[] = [1, 2, 3, 4, 5];
      for (const box of boxes) {
        expect(calculateNextBox(box, 'hard')).toBe(box);
      }
    });

    it('calificación "good" debe avanzar 1 caja hasta un máximo de 5', () => {
      expect(calculateNextBox(1, 'good')).toBe(2);
      expect(calculateNextBox(2, 'good')).toBe(3);
      expect(calculateNextBox(3, 'good')).toBe(4);
      expect(calculateNextBox(4, 'good')).toBe(5);
      expect(calculateNextBox(5, 'good')).toBe(5);
    });

    it('calificación "easy" debe avanzar 2 cajas hasta un máximo de 5', () => {
      expect(calculateNextBox(1, 'easy')).toBe(3);
      expect(calculateNextBox(2, 'easy')).toBe(4);
      expect(calculateNextBox(3, 'easy')).toBe(5);
      expect(calculateNextBox(4, 'easy')).toBe(5);
      expect(calculateNextBox(5, 'easy')).toBe(5);
    });
  });

  describe('Fechas y Vencimiento', () => {
    it('formatDateIso formatea correctamente en YYYY-MM-DD', () => {
      const date = new Date(2026, 9, 31); // 31 Octubre 2026
      expect(formatDateIso(date)).toBe('2026-10-31');
    });

    it('addDays suma días naturales correctamente', () => {
      const start = new Date(2026, 9, 30);
      const next = addDays(start, 3);
      expect(formatDateIso(next)).toBe('2026-11-02');
    });

    it('isCardDue detecta correctamente si una tarjeta ha vencido', () => {
      const today = new Date(2026, 9, 31);
      expect(isCardDue(null, today)).toBe(true);
      expect(isCardDue(undefined, today)).toBe(true);
      expect(isCardDue('2026-10-30', today)).toBe(true); // Ayer
      expect(isCardDue('2026-10-31', today)).toBe(true); // Hoy
      expect(isCardDue('2026-11-01', today)).toBe(false); // Mañana
    });
  });

  describe('evaluateCard', () => {
    const fixedNow = new Date(2026, 9, 31, 12, 0, 0);

    it('crea progreso inicial para una tarjeta nueva calificada con "good"', () => {
      const result = evaluateCard(undefined, 'cmd-tee', 'good', fixedNow);
      expect(result.cardId).toBe('cmd-tee');
      expect(result.box).toBe(2); // Inicia en 1 + 1 = 2
      expect(result.repetitions).toBe(1);
      expect(result.lapses).toBe(0);
      expect(result.nextReviewDate).toBe('2026-11-01'); // 1 día después
      expect(result.lastReviewedAt).toBe(fixedNow.toISOString());
    });

    it('reinicia a Caja 1 e incrementa lapsos cuando se evalúa con "again"', () => {
      const existing: CardProgress = {
        cardId: 'term-stdin',
        box: 4,
        nextReviewDate: '2026-10-31',
        lastReviewedAt: '2026-10-24T10:00:00.000Z',
        repetitions: 5,
        lapses: 1
      };

      const result = evaluateCard(existing, 'term-stdin', 'again', fixedNow);
      expect(result.box).toBe(1);
      expect(result.repetitions).toBe(6);
      expect(result.lapses).toBe(2);
      expect(result.nextReviewDate).toBe('2026-10-31'); // Caja 1 tiene 0 días de intervalo
    });

    it('mantiene la misma caja con "hard" y programa el intervalo correspondiente', () => {
      const existing: CardProgress = {
        cardId: 'term-stdin',
        box: 3,
        nextReviewDate: '2026-10-31',
        lastReviewedAt: '2026-10-28T10:00:00.000Z',
        repetitions: 3,
        lapses: 0
      };

      const result = evaluateCard(existing, 'term-stdin', 'hard', fixedNow);
      expect(result.box).toBe(3);
      expect(result.repetitions).toBe(4);
      expect(result.lapses).toBe(0);
      expect(result.nextReviewDate).toBe('2026-11-03'); // +3 días
    });

    it('salta dos cajas con "easy" sin superar la Caja 5', () => {
      const existing: CardProgress = {
        cardId: 'cmd-grep',
        box: 4,
        nextReviewDate: '2026-10-31',
        lastReviewedAt: '2026-10-24T10:00:00.000Z',
        repetitions: 4,
        lapses: 0
      };

      const result = evaluateCard(existing, 'cmd-grep', 'easy', fixedNow);
      expect(result.box).toBe(5);
      expect(result.nextReviewDate).toBe('2026-11-21'); // +21 días
    });
  });

  describe('selectCardsForSession y límites diarios', () => {
    const cards = [
      { id: 'c1' },
      { id: 'c2' },
      { id: 'c3' },
      { id: 'c4' },
      { id: 'c5' },
      { id: 'c6' }
    ];

    it('respeta el límite diario de tarjetas nuevas (dailyNewCardsLimit)', () => {
      const progressMap: Record<string, CardProgress> = {};
      const { dueCards, newCards, sessionCards } = selectCardsForSession(cards, progressMap, {
        dailyNewCardsLimit: 3
      });

      expect(dueCards.length).toBe(0);
      expect(newCards.length).toBe(3);
      expect(sessionCards.length).toBe(3);
      expect(sessionCards.map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
    });

    it('combina tarjetas vencidas con tarjetas nuevas hasta el límite', () => {
      const today = new Date(2026, 9, 31);
      const progressMap: Record<string, CardProgress> = {
        c1: {
          cardId: 'c1',
          box: 2,
          nextReviewDate: '2026-10-30', // Vencida ayer
          lastReviewedAt: '2026-10-29T10:00:00.000Z',
          repetitions: 2,
          lapses: 0
        },
        c2: {
          cardId: 'c2',
          box: 3,
          nextReviewDate: '2026-11-05', // Futura
          lastReviewedAt: '2026-10-28T10:00:00.000Z',
          repetitions: 3,
          lapses: 0
        }
      };

      const { dueCards, newCards, sessionCards } = selectCardsForSession(cards, progressMap, {
        dailyNewCardsLimit: 2,
        currentDate: today
      });

      expect(dueCards.map((c) => c.id)).toEqual(['c1']);
      expect(newCards.map((c) => c.id)).toEqual(['c3', 'c4']); // c2 no es nueva ni debida
      expect(sessionCards.map((c) => c.id)).toEqual(['c1', 'c3', 'c4']);
    });
  });

  describe('computeLeitnerStats', () => {
    it('calcula las estadísticas con precisión', () => {
      const cardIds = ['c1', 'c2', 'c3', 'c4', 'c5'];
      const today = new Date(2026, 9, 31);
      const progressMap: Record<string, CardProgress> = {
        c1: {
          cardId: 'c1',
          box: 5,
          nextReviewDate: '2026-11-15',
          lastReviewedAt: '2026-10-25T10:00:00.000Z',
          repetitions: 6,
          lapses: 0
        },
        c2: {
          cardId: 'c2',
          box: 2,
          nextReviewDate: '2026-10-31', // Debida hoy
          lastReviewedAt: '2026-10-30T10:00:00.000Z',
          repetitions: 2,
          lapses: 0
        },
        c3: {
          cardId: 'c3',
          box: 1,
          nextReviewDate: '2026-10-31', // Debida hoy
          lastReviewedAt: '2026-10-31T09:00:00.000Z',
          repetitions: 1,
          lapses: 1
        }
      };

      const stats = computeLeitnerStats(cardIds, progressMap, today);
      expect(stats.total).toBe(5);
      expect(stats.unseen).toBe(2); // c4, c5
      expect(stats.mastered).toBe(1); // c1 (caja 5)
      expect(stats.learning).toBe(2); // c2 (caja 2) + c3 (caja 1)
      expect(stats.byBox[5]).toBe(1);
      expect(stats.byBox[2]).toBe(1);
      expect(stats.byBox[1]).toBe(1);
      expect(stats.byBox[3]).toBe(0);
      expect(stats.byBox[4]).toBe(0);
      expect(stats.dueToday).toBe(4); // c2 + c3 debidas + 2 unseen
    });
  });
});

