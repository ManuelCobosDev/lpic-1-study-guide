import { Injectable, computed, inject } from '@angular/core';
import { ContentService } from './content.service';
import { StorageService } from './storage.service';
import { PreferencesService } from './preferences.service';
import { PersistedStore } from '../state/persisted-store';
import {
  CardProgress,
  DeckType,
  FlashcardItem,
  LeitnerRating,
  LeitnerStats
} from '../models/flashcard.model';
import {
  evaluateCard,
  selectCardsForSession,
  computeLeitnerStats,
  isCardDue
} from '../engines/leitner/leitner.engine';
import { Command } from '../models/command.model';
import { GlossaryTerm } from '../models/glossary.model';

export interface FlashcardsState {
  schemaVersion: number;
  progress: Record<string, CardProgress>;
}

export const DEFAULT_FLASHCARDS_STATE: FlashcardsState = {
  schemaVersion: 1,
  progress: {}
};

@Injectable({
  providedIn: 'root'
})
export class FlashcardsService {
  private readonly contentService = inject(ContentService);
  private readonly storage = inject(StorageService);
  private readonly preferencesService = inject(PreferencesService);

  private readonly store = new PersistedStore<FlashcardsState>(this.storage, {
    key: 'flashcards_progress',
    schemaVersion: 1,
    initialValue: DEFAULT_FLASHCARDS_STATE
  });

  readonly state = this.store.data;
  readonly progress = computed(() => this.state().progress);

  /**
   * Carga la colección completa de tarjetas desde el ContentService o genera un fallback si procede.
   */
  async getAllCards(): Promise<FlashcardItem[]> {
    try {
      if (typeof this.contentService.getFlashcards === 'function') {
        const catalog = await this.contentService.getFlashcards();
        if (catalog && catalog.length > 0) {
          return catalog;
        }
      }
    } catch {
      // Ignorar fallo de red y pasar al fallback
    }

    // Fallback: sintetiza tarjetas directamente desde comandos y glosario
    const [commands, terms] = await Promise.all([
      this.contentService.getCommands(),
      this.contentService.getGlossary()
    ]);
    const cmdCards = commands.map((c) => this.commandToFlashcard(c));
    const termCards = terms.map((t) => this.glossaryToFlashcard(t));
    return [...cmdCards, ...termCards];
  }

  /**
   * Carga los elementos del mazo especificado y los filtra según criterio avanzado (examen, tema, subtema, tipo).
   */
  async loadDeckItems(deck: DeckType): Promise<FlashcardItem[]> {
    const allCards = await this.getAllCards();

    if (deck === 'all') {
      return allCards;
    }

    if (deck === 'commands') {
      return allCards.filter((c) => c.type === 'command' || c.kind === 'comando');
    }

    if (deck === 'flags') {
      return allCards.filter((c) => c.type === 'flag' || c.kind === 'opcion');
    }

    if (deck === 'glossary') {
      return allCards.filter((c) => c.type === 'glossary' || c.kind === 'termino');
    }

    if (deck === 'exam-101') {
      return allCards.filter((c) => {
        if (c.examId) return c.examId === '101';
        return c.subtopicIds.some((s) => {
          const num = parseInt(s.split('.')[0] || '0', 10);
          return num >= 101 && num <= 104;
        });
      });
    }

    if (deck === 'exam-102') {
      return allCards.filter((c) => {
        if (c.examId) return c.examId === '102';
        return c.subtopicIds.some((s) => {
          const num = parseInt(s.split('.')[0] || '0', 10);
          return num >= 105 && num <= 110;
        });
      });
    }

    if (deck === 'due-today') {
      const prog = this.progress();
      return allCards.filter((c) => {
        const p = prog[c.id];
        return p !== undefined && isCardDue(p.nextReviewDate);
      });
    }

    if (deck.startsWith('topic-')) {
      const topicId = deck.replace('topic-', '');
      return allCards.filter((c) => {
        if (c.topicId === topicId) return true;
        return c.subtopicIds.some((s) => s.startsWith(`${topicId}.`));
      });
    }

    if (deck.startsWith('subtopic-')) {
      const subtopicId = deck.replace('subtopic-', '');
      return allCards.filter((c) => c.subtopicIds.includes(subtopicId));
    }

    if (deck === 'mixed') {
      return allCards;
    }

    return allCards;
  }

  /**
   * Obtiene las tarjetas listas para la sesión de estudio actual según Leitner y preferencias de usuario.
   */
  async getSessionCards(
    deck: DeckType,
    customDailyLimit?: number
  ): Promise<{
    dueCards: FlashcardItem[];
    newCards: FlashcardItem[];
    sessionCards: FlashcardItem[];
  }> {
    const items = await this.loadDeckItems(deck);
    const limit = customDailyLimit ?? this.preferencesService.preferences().newCardsPerDay ?? 20;

    return selectCardsForSession(items, this.progress(), {
      dailyNewCardsLimit: limit
    });
  }

  /**
   * Obtiene hasta `limit` tarjetas de un subtema concreto respetando Leitner:
   * primero las tarjetas vencidas (dueCards), luego las nuevas (newCards).
   */
  async getSubtopicCards(
    subtopicId: string,
    limit = 10
  ): Promise<{
    dueCards: FlashcardItem[];
    newCards: FlashcardItem[];
    sessionCards: FlashcardItem[];
  }> {
    const allCards = await this.getAllCards();
    const filtered = allCards.filter(
      (item) => item.subtopicIds && item.subtopicIds.includes(subtopicId)
    );
    return selectCardsForSession(filtered, this.progress(), {
      dailyNewCardsLimit: limit
    });
  }

  /**
   * Califica una tarjeta y persiste el cambio inmediatamente en StorageService a través de PersistedStore.
   */
  rateCard(cardId: string, rating: LeitnerRating): CardProgress {
    const currentProg = this.progress()[cardId];
    const updated = evaluateCard(currentProg, cardId, rating);

    this.store.update((state) => ({
      ...state,
      progress: {
        ...state.progress,
        [cardId]: updated
      }
    }));
    this.store.flush();

    return updated;
  }

  /**
   * Obtiene estadísticas Leitner completas para un mazo dado.
   */
  async getDeckStats(deck: DeckType): Promise<LeitnerStats> {
    const items = await this.loadDeckItems(deck);
    return computeLeitnerStats(items.map((i) => i.id), this.progress());
  }

  /**
   * Restablece el progreso de todas las tarjetas.
   */
  resetProgress(): void {
    this.store.set(DEFAULT_FLASHCARDS_STATE);
  }

  private commandToFlashcard(cmd: Command): FlashcardItem {
    return {
      id: `cmd-${cmd.id}`,
      type: 'command',
      frontTitle: cmd.name,
      frontSubtitle: `Comando · ${cmd.category}`,
      prompt: '¿Cuál es la función principal de este comando y su sinopsis de uso?',
      backTitle: cmd.name,
      backDescription: cmd.description,
      backSyntax: cmd.synopsis,
      backExample: cmd.example,
      backFlags: cmd.flags,
      subtopicIds: cmd.subtopicIds
    };
  }

  private glossaryToFlashcard(term: GlossaryTerm): FlashcardItem {
    return {
      id: `term-${term.id}`,
      type: 'glossary',
      frontTitle: term.term,
      frontSubtitle: 'Término del Glosario',
      prompt: '¿Cuál es la definición y contexto técnico de este concepto en LPIC-1?',
      backTitle: term.term,
      backDescription: term.definition,
      relatedTerms: term.related,
      subtopicIds: term.subtopicIds
    };
  }
}
