import {
  CardProgress,
  LeitnerBox,
  LeitnerRating,
  LeitnerStats
} from '../../models/flashcard.model';

/**
 * Intervalos de días entre revisiones según la caja Leitner:
 * Caja 1: 0 días (hoy mismo / inmediata)
 * Caja 2: 1 día
 * Caja 3: 3 días
 * Caja 4: 7 días
 * Caja 5: 21 días
 */
export const BOX_INTERVALS_DAYS: Readonly<Record<LeitnerBox, number>> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 21
};

/**
 * Determina la siguiente caja tras calificar una tarjeta:
 * - 'again'  -> Caja 1 (reinicio)
 * - 'hard'   -> Misma caja
 * - 'good'   -> +1 caja (máx 5)
 * - 'easy'   -> +2 cajas (máx 5)
 */
export function calculateNextBox(currentBox: LeitnerBox, rating: LeitnerRating): LeitnerBox {
  switch (rating) {
    case 'again':
      return 1;
    case 'hard':
      return currentBox;
    case 'good':
      return Math.min(5, currentBox + 1) as LeitnerBox;
    case 'easy':
      return Math.min(5, currentBox + 2) as LeitnerBox;
  }
}

/** Formatea una fecha como YYYY-MM-DD */
export function formatDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Añade un número de días naturales a una fecha */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Comprueba si una tarjeta vence en o antes de la fecha dada (por defecto hoy).
 * Las tarjetas sin fecha o con fecha <= hoy vencen hoy.
 */
export function isCardDue(nextReviewDate: string | null | undefined, currentDate: Date = new Date()): boolean {
  if (!nextReviewDate) return true;
  const todayStr = formatDateIso(currentDate);
  return nextReviewDate <= todayStr;
}

/**
 * Evalúa una tarjeta y devuelve un nuevo objeto inmutable con el progreso actualizado.
 */
export function evaluateCard(
  progress: CardProgress | undefined,
  cardId: string,
  rating: LeitnerRating,
  reviewDate: Date = new Date()
): CardProgress {
  const currentBox: LeitnerBox = progress ? progress.box : 1;
  const nextBox = calculateNextBox(currentBox, rating);
  const intervalDays = BOX_INTERVALS_DAYS[nextBox];
  const nextDate = addDays(reviewDate, intervalDays);

  return {
    cardId,
    box: nextBox,
    nextReviewDate: formatDateIso(nextDate),
    lastReviewedAt: reviewDate.toISOString(),
    repetitions: (progress?.repetitions ?? 0) + 1,
    lapses: rating === 'again' ? (progress?.lapses ?? 0) + 1 : (progress?.lapses ?? 0)
  };
}

/**
 * Selecciona las tarjetas a estudiar en una sesión:
 * 1. Tarjetas en progreso cuya fecha de revisión venció (dueCards).
 * 2. Tarjetas nuevas (unseen o nunca estudiadas), limitadas por dailyNewCardsLimit (por defecto 20).
 * 3. Mezcla combinada para la sesión: primero las debidas, luego las nuevas.
 */
export function selectCardsForSession<T extends { id: string }>(
  allCards: T[],
  progressMap: Record<string, CardProgress>,
  options: {
    dailyNewCardsLimit?: number;
    currentDate?: Date;
  } = {}
): {
  dueCards: T[];
  newCards: T[];
  sessionCards: T[];
} {
  const limit = options.dailyNewCardsLimit ?? 20;
  const now = options.currentDate ?? new Date();

  const dueCards: T[] = [];
  const newCards: T[] = [];

  for (const card of allCards) {
    const prog = progressMap[card.id];
    if (!prog || (prog.repetitions === 0 && !prog.lastReviewedAt)) {
      // Tarjeta nueva
      if (newCards.length < limit) {
        newCards.push(card);
      }
    } else if (isCardDue(prog.nextReviewDate, now)) {
      // Tarjeta existente debida para hoy
      dueCards.push(card);
    }
  }

  return {
    dueCards,
    newCards,
    sessionCards: [...dueCards, ...newCards]
  };
}

/**
 * Calcula estadísticas agregadas del mazo Leitner.
 */
export function computeLeitnerStats(
  allCardIds: string[],
  progressMap: Record<string, CardProgress>,
  currentDate: Date = new Date()
): LeitnerStats {
  const byBox: Record<LeitnerBox, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  let mastered = 0;
  let learning = 0;
  let unseen = 0;
  let dueToday = 0;

  for (const id of allCardIds) {
    const prog = progressMap[id];
    if (!prog || (prog.repetitions === 0 && !prog.lastReviewedAt)) {
      unseen++;
      dueToday++; // Tarjetas nuevas cuentan como debidas si entran en sesión
    } else {
      byBox[prog.box]++;
      if (prog.box === 5) {
        mastered++;
      } else {
        learning++;
      }
      if (isCardDue(prog.nextReviewDate, currentDate)) {
        dueToday++;
      }
    }
  }

  return {
    total: allCardIds.length,
    byBox,
    mastered,
    learning,
    unseen,
    dueToday
  };
}

