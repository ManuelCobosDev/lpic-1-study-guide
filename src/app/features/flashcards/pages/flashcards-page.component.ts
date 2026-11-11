import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../../shared/ui/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { FlashcardCardComponent } from '../components/flashcard-card/flashcard-card.component';
import { FlashcardsService } from '../../../core/services/flashcards.service';
import {
  DeckType,
  FlashcardItem,
  LeitnerBox,
  LeitnerRating,
  LeitnerStats
} from '../../../core/models/flashcard.model';
import { isCardDue } from '../../../core/engines/leitner/leitner.engine';

export const BATCH_SIZE = 10;

export type BoxFilter = 'all' | 'unseen' | LeitnerBox;

export interface BoxFilterOption {
  id: BoxFilter;
  name: string;
  badge: string;
  shortDesc: string;
  colorClass: string;
}

export interface TopicDeckItem {
  id: DeckType;
  label: string;
  title: string;
  name: string;
  exam: '101' | '102';
}

@Component({
  selector: 'app-flashcards-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ContainerComponent,
    ButtonComponent,
    EmptyStateComponent,
    ProgressBarComponent,
    SkeletonComponent,
    FlashcardCardComponent
  ],
  templateUrl: './flashcards-page.component.html',
  styleUrls: ['./flashcards-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlashcardsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly flashcardsService = inject(FlashcardsService);

  readonly leitnerBoxes: readonly LeitnerBox[] = [1, 2, 3, 4, 5];

  readonly allCards = signal<FlashcardItem[]>([]);
  readonly selectedDeck = signal<DeckType>('all');
  readonly selectedBoxFilter = signal<BoxFilter>('all');
  readonly deckStats = signal<LeitnerStats | null>(null);
  readonly sessionCards = signal<FlashcardItem[]>([]);
  readonly currentIndex = signal<number>(0);
  readonly isFlipped = signal<boolean>(false);
  readonly isCompleted = signal<boolean>(false);
  readonly loading = signal<boolean>(true);

  // Estados del Explorador de Tarjetas
  readonly searchQuery = signal<string>('');
  readonly filterKind = signal<string>('all');
  readonly filterBox = signal<string>('all');
  readonly explorerPage = signal<number>(1);
  readonly revealedCardIds = signal<Set<string>>(new Set());
  readonly pageSize = 24;

  readonly ratingsCount = signal<Record<LeitnerRating, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  });

  readonly reviewedCards = signal<string[]>([]);

  // Opciones de configuración de cajas Leitner
  readonly boxFilterOptions: readonly BoxFilterOption[] = [
    { id: 'all', name: 'Todas', badge: 'Mezcla', shortDesc: 'Tanda aleatoria', colorClass: 'box-badge-all' },
    { id: 'unseen', name: 'Nuevas', badge: 'Sin ver', shortDesc: 'Sin clasificar', colorClass: 'box-badge-unseen' },
    { id: 1, name: 'Caja 1', badge: 'Urgente', shortDesc: 'Falladas (Otra vez)', colorClass: 'box-badge-1' },
    { id: 2, name: 'Caja 2', badge: 'Aprendizaje', shortDesc: 'Primer acierto', colorClass: 'box-badge-2' },
    { id: 3, name: 'Caja 3', badge: 'Afianzadas', shortDesc: 'Bien recordadas', colorClass: 'box-badge-3' },
    { id: 4, name: 'Caja 4', badge: 'Avanzadas', shortDesc: 'Consolidadas', colorClass: 'box-badge-4' },
    { id: 5, name: 'Caja 5', badge: 'Dominadas', shortDesc: 'Fijadas en memoria', colorClass: 'box-badge-5' }
  ];

  // Catálogo ordenado de temas oficiales LPIC-1
  readonly topicDecks: readonly TopicDeckItem[] = [
    { id: 'topic-101', label: '101', title: 'Tema 101', name: 'Arquitectura del sistema', exam: '101' },
    { id: 'topic-102', label: '102', title: 'Tema 102', name: 'Instalación y paquetes', exam: '101' },
    { id: 'topic-103', label: '103', title: 'Tema 103', name: 'Comandos GNU y Unix', exam: '101' },
    { id: 'topic-104', label: '104', title: 'Tema 104', name: 'Dispositivos y FHS', exam: '101' },
    { id: 'topic-105', label: '105', title: 'Tema 105', name: 'Shells y scripts', exam: '102' },
    { id: 'topic-106', label: '106', title: 'Tema 106', name: 'Interfaces y escritorios', exam: '102' },
    { id: 'topic-107', label: '107', title: 'Tema 107', name: 'Tareas administrativas', exam: '102' },
    { id: 'topic-108', label: '108', title: 'Tema 108', name: 'Servicios esenciales', exam: '102' },
    { id: 'topic-109', label: '109', title: 'Tema 109', name: 'Fundamentos de redes', exam: '102' },
    { id: 'topic-110', label: '110', title: 'Tema 110', name: 'Seguridad', exam: '102' }
  ];

  readonly exam101Topics = computed(() => this.topicDecks.filter((t) => t.exam === '101'));
  readonly exam102Topics = computed(() => this.topicDecks.filter((t) => t.exam === '102'));

  readonly availableDecks: readonly { id: DeckType; label: string; icon: string }[] = [
    { id: 'all', label: 'Todo el Catálogo', icon: '📚' },
    { id: 'exam-101', label: 'Examen 101 Completo', icon: '🐧' },
    { id: 'exam-102', label: 'Examen 102 Completo', icon: '🛡️' }
  ];

  // Tarjetas filtradas pertenecientes al mazo o tema seleccionado
  readonly activeDeckCards = computed(() => {
    return this.getCardsForDeck(this.selectedDeck(), this.allCards());
  });

  // Conteo reactivo por caja para el mazo/tema seleccionado (se actualiza en tiempo real al valorar)
  readonly deckBoxCounts = computed(() => {
    const cards = this.activeDeckCards();
    const progress = this.flashcardsService.progress();
    const counts: Record<string, number> = {
      all: cards.length,
      unseen: 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0
    };

    for (const card of cards) {
      const p = progress[card.id];
      if (!p) {
        counts['unseen'] = (counts['unseen'] ?? 0) + 1;
      } else {
        const box = p.box;
        if (box >= 1 && box <= 5) {
          const key = box.toString();
          counts[key] = (counts[key] ?? 0) + 1;
        }
      }
    }

    return counts;
  });

  readonly currentCard = computed(() => {
    return this.sessionCards()[this.currentIndex()] ?? null;
  });

  readonly totalCardsInSession = computed(() => {
    return this.sessionCards().length;
  });

  readonly totalFlashcardsCount = computed(() => {
    return this.allCards().length;
  });

  readonly progressPercent = computed(() => {
    const total = this.totalCardsInSession();
    if (total === 0) return 0;
    return Math.round((this.currentIndex() / total) * 100);
  });

  readonly currentCardBox = computed(() => {
    const card = this.currentCard();
    if (!card) return 1;
    return this.flashcardsService.progress()[card.id]?.box ?? 1;
  });

  readonly activeDeckLabel = computed(() => {
    const deck = this.selectedDeck();
    if (deck === 'all') return 'Todo LPIC-1 (Global)';
    if (deck === 'exam-101') return 'Examen 101 Completo';
    if (deck === 'exam-102') return 'Examen 102 Completo';
    const foundTopic = this.topicDecks.find((t) => t.id === deck);
    if (foundTopic) return `${foundTopic.title}: ${foundTopic.name}`;
    if (deck.startsWith('subtopic-')) return `Subtema ${deck.replace('subtopic-', '')}`;
    if (deck.startsWith('topic-')) return `Tema ${deck.replace('topic-', '')}`;
    return 'Mazo Personalizado';
  });

  readonly activeBoxLabel = computed(() => {
    const filter = this.selectedBoxFilter();
    const found = this.boxFilterOptions.find((o) => o.id === filter);
    if (found) {
      return `${found.name} (${found.badge})`;
    }
    return `Caja ${filter}`;
  });

  // Métodos de compatibilidad y selección
  getCardsForDeck(deck: DeckType, cards: FlashcardItem[]): FlashcardItem[] {
    if (deck === 'all') {
      return cards;
    }
    if (deck === 'exam-101') {
      return cards.filter(
        (c) =>
          c.examId === '101' ||
          c.subtopicIds.some((s) => {
            const num = parseInt(s.split('.')[0] || '0', 10);
            return num >= 101 && num <= 104;
          })
      );
    }
    if (deck === 'exam-102') {
      return cards.filter(
        (c) =>
          c.examId === '102' ||
          c.subtopicIds.some((s) => {
            const num = parseInt(s.split('.')[0] || '0', 10);
            return num >= 105 && num <= 110;
          })
      );
    }
    if (deck === 'commands') {
      return cards.filter((c) => c.type === 'command' || c.kind === 'comando');
    }
    if (deck === 'flags') {
      return cards.filter((c) => c.type === 'flag' || c.kind === 'opcion');
    }
    if (deck === 'glossary') {
      return cards.filter((c) => c.type === 'glossary' || c.kind === 'termino');
    }
    if (deck === 'due-today') {
      const progress = this.flashcardsService.progress();
      return cards.filter((c) => {
        const p = progress[c.id];
        return p !== undefined && isCardDue(p.nextReviewDate);
      });
    }
    if (deck.startsWith('topic-')) {
      const tid = deck.replace('topic-', '');
      return cards.filter((c) => c.topicId === tid || c.subtopicIds.some((s) => s.startsWith(`${tid}.`)));
    }
    if (deck.startsWith('subtopic-')) {
      const sid = deck.replace('subtopic-', '');
      return cards.filter((c) => c.subtopicIds.includes(sid));
    }
    return cards;
  }

  // Filtrado reactivo de tarjetas en el Explorador
  readonly filteredExplorerCards = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const deckCards = this.activeDeckCards();
    const kind = this.filterKind();
    const boxFilter = this.filterBox();
    const progress = this.flashcardsService.progress();

    let list = deckCards;

    // Filtro por tipo/kind
    if (kind !== 'all') {
      list = list.filter((c) => (c.kind || c.type) === kind);
    }

    // Filtro por caja Leitner
    if (boxFilter !== 'all') {
      if (boxFilter === 'unseen') {
        list = list.filter((c) => !progress[c.id]);
      } else {
        const targetBox = parseInt(boxFilter, 10);
        list = list.filter((c) => progress[c.id]?.box === targetBox);
      }
    }

    // Filtro textual de búsqueda rápida
    if (q) {
      list = list.filter(
        (c) =>
          c.frontTitle.toLowerCase().includes(q) ||
          c.backTitle.toLowerCase().includes(q) ||
          c.backDescription.toLowerCase().includes(q) ||
          c.prompt.toLowerCase().includes(q) ||
          (c.frontSubtitle && c.frontSubtitle.toLowerCase().includes(q)) ||
          (c.subtopicIds && c.subtopicIds.some((sid) => sid.toLowerCase().includes(q)))
      );
    }

    return list;
  });

  readonly totalExplorerPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredExplorerCards().length / this.pageSize));
  });

  readonly paginatedExplorerCards = computed(() => {
    const page = Math.min(this.explorerPage(), this.totalExplorerPages());
    const start = (page - 1) * this.pageSize;
    return this.filteredExplorerCards().slice(start, start + this.pageSize);
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }

    if (this.isCompleted() || !this.currentCard()) {
      return;
    }

    // Tecla Espacio: voltear tarjeta
    if (event.code === 'Space') {
      event.preventDefault();
      this.flipCard();
      return;
    }

    // Atajos 1-4 para valorar tarjeta
    if (this.isFlipped()) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          this.rateCurrentCard('again');
          break;
        case '2':
          event.preventDefault();
          this.rateCurrentCard('hard');
          break;
        case '3':
          event.preventDefault();
          this.rateCurrentCard('good');
          break;
        case '4':
          event.preventDefault();
          this.rateCurrentCard('easy');
          break;
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const all = await this.flashcardsService.getAllCards();
      this.allCards.set(all);

      const mazoParam = this.route.snapshot.queryParamMap.get('mazo') as DeckType;
      const temaParam = this.route.snapshot.queryParamMap.get('tema');
      const subtemaParam = this.route.snapshot.queryParamMap.get('subtema');
      let initialDeck: DeckType = 'all';

      if (subtemaParam) {
        initialDeck = `subtopic-${subtemaParam}`;
      } else if (temaParam) {
        initialDeck = `topic-${temaParam}`;
      } else if (mazoParam) {
        initialDeck = mazoParam;
      }

      await this.selectDeck(initialDeck);
    } finally {
      this.loading.set(false);
    }
  }

  async selectDeck(deck: DeckType): Promise<void> {
    this.loading.set(true);
    this.selectedDeck.set(deck);
    this.explorerPage.set(1);

    try {
      const [stats, session] = await Promise.all([
        this.flashcardsService.getDeckStats(deck),
        this.flashcardsService.getSessionCards(deck)
      ]);

      this.deckStats.set(stats);

      // Si allCards estaba vacío y el servicio devolvió tarjetas (caso de mock o prueba unitaria)
      if (this.allCards().length === 0 && session?.sessionCards && session.sessionCards.length > 0) {
        this.allCards.set(session.sessionCards);
      }

      this.startNewBatch(true);
    } finally {
      this.loading.set(false);
    }
  }

  setBoxFilter(filter: BoxFilter): void {
    this.selectedBoxFilter.set(filter);
    this.startNewBatch(true);
  }

  startNewBatch(preserveOrderIfSmall = false): void {
    this.isCompleted.set(false);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.ratingsCount.set({ again: 0, hard: 0, good: 0, easy: 0 });
    this.reviewedCards.set([]);

    const boxFilter = this.selectedBoxFilter();
    const progress = this.flashcardsService.progress();
    const deckCards = this.activeDeckCards();

    let candidates: FlashcardItem[] = [];

    if (boxFilter === 'all') {
      candidates = [...deckCards];
    } else if (boxFilter === 'unseen') {
      candidates = deckCards.filter((c) => !progress[c.id]);
    } else {
      candidates = deckCards.filter((c) => progress[c.id]?.box === boxFilter);
    }

    if (candidates.length === 0) {
      this.sessionCards.set([]);
      return;
    }

    // Si hay más de BATCH_SIZE (10), barajar aleatoriamente y recortar a 10
    if (candidates.length > BATCH_SIZE) {
      const shuffled = this.shuffleArray(candidates);
      this.sessionCards.set(shuffled.slice(0, BATCH_SIZE));
    } else {
      // Si hay <= 10: conservamos sin perder ninguna
      if (!preserveOrderIfSmall && candidates.length > 1) {
        this.sessionCards.set(this.shuffleArray(candidates));
      } else {
        this.sessionCards.set(candidates);
      }
    }
  }

  flipCard(): void {
    this.isFlipped.set(!this.isFlipped());
  }

  rateCurrentCard(rating: LeitnerRating): void {
    const card = this.currentCard();
    if (!card) return;

    this.flashcardsService.rateCard(card.id, rating);

    // Actualiza métricas de la tanda
    this.ratingsCount.update((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1
    }));
    this.reviewedCards.update((prev) => [...prev, card.id]);

    const nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.totalCardsInSession()) {
      this.isCompleted.set(true);
    } else {
      this.currentIndex.set(nextIndex);
      this.isFlipped.set(false);
    }
  }

  async restartSession(): Promise<void> {
    this.startNewBatch(false);
  }

  getBoxCount(box: LeitnerBox): number {
    return this.deckBoxCounts()[box.toString()] ?? this.deckStats()?.byBox[box] ?? 0;
  }

  getBoxFilterCount(filter: BoxFilter): number {
    return this.deckBoxCounts()[filter.toString()] ?? 0;
  }

  // Métodos del Explorador
  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
    this.explorerPage.set(1);
  }

  setFilterKind(kind: string): void {
    this.filterKind.set(kind);
    this.explorerPage.set(1);
  }

  setFilterBox(box: string): void {
    this.filterBox.set(box);
    this.explorerPage.set(1);
  }

  prevExplorerPage(): void {
    if (this.explorerPage() > 1) {
      this.explorerPage.update((p) => p - 1);
    }
  }

  nextExplorerPage(): void {
    if (this.explorerPage() < this.totalExplorerPages()) {
      this.explorerPage.update((p) => p + 1);
    }
  }

  isCardRevealed(cardId: string): boolean {
    return this.revealedCardIds().has(cardId);
  }

  toggleCardReveal(cardId: string): void {
    this.revealedCardIds.update((set) => {
      const next = new Set(set);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }

  getCardBox(cardId: string): number | null {
    return this.flashcardsService.progress()[cardId]?.box ?? null;
  }

  private shuffleArray<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i]!;
      result[i] = result[j]!;
      result[j] = temp;
    }
    return result;
  }
}
