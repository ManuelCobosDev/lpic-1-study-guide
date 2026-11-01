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
  computeLeitnerStats
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
   * Carga los elementos del mazo especificado y los convierte al modelo unificado FlashcardItem.
   */
  async loadDeckItems(deck: DeckType): Promise<FlashcardItem[]> {
    if (deck === 'commands') {
      const commands = await this.contentService.getCommands();
      return commands.map((c) => this.commandToFlashcard(c));
    }

    if (deck === 'glossary') {
      const terms = await this.contentService.getGlossary();
      return terms.map((t) => this.glossaryToFlashcard(t));
    }

    // Mazo mixto: combina comandos y glosario de forma intercalada
    const [commands, terms] = await Promise.all([
      this.contentService.getCommands(),
      this.contentService.getGlossary()
    ]);

    const cmdCards = commands.map((c) => this.commandToFlashcard(c));
    const termCards = terms.map((t) => this.glossaryToFlashcard(t));
    const mixed: FlashcardItem[] = [];
    const maxLen = Math.max(cmdCards.length, termCards.length);

    for (let i = 0; i < maxLen; i++) {
      const cmd = cmdCards[i];
      if (cmd) mixed.push(cmd);
      const term = termCards[i];
      if (term) mixed.push(term);
    }

    return mixed;
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
    const items = await this.loadDeckItems('mixed');
    const filtered = items.filter(
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
