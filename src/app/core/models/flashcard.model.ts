export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export type LeitnerRating = 'again' | 'hard' | 'good' | 'easy';

export type DeckType = 'glossary' | 'commands' | 'mixed';

export interface CardProgress {
  cardId: string;
  box: LeitnerBox;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedAt: string | null;
  repetitions: number;
  lapses: number;
}

export interface FlashcardItem {
  id: string;
  type: 'command' | 'glossary';
  frontTitle: string;
  frontSubtitle?: string;
  prompt: string;
  backTitle: string;
  backDescription: string;
  backSyntax?: string;
  backExample?: string;
  backFlags?: { flag: string; description: string }[];
  relatedTerms?: string[];
  subtopicIds: string[];
}

export interface LeitnerStats {
  total: number;
  byBox: Record<LeitnerBox, number>;
  mastered: number; // caja 5
  learning: number; // cajas 1-4
  unseen: number;
  dueToday: number;
}

export interface SessionResult {
  totalReviewed: number;
  ratingsCount: Record<LeitnerRating, number>;
  cardsReviewed: string[];
  completedAt: string;
}

