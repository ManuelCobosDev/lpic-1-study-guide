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

  readonly availableDecks: { id: DeckType; label: string; icon: string }[] = [
    { id: 'all', label: 'Todo el Catálogo', icon: '📚' },
    { id: 'exam-101', label: 'Examen 101', icon: '🐧' },
    { id: 'exam-102', label: 'Examen 102', icon: '🛡️' },
    { id: 'commands', label: 'Solo Comandos', icon: '💻' },
    { id: 'flags', label: 'Opciones / Flags', icon: '⚙️' },
    { id: 'glossary', label: 'Solo Glosario', icon: '📖' },
    { id: 'due-today', label: 'Vencidas hoy', icon: '⏰' }
  ];

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
    const found = this.availableDecks.find((d) => d.id === deck);
    if (found) return found.label;
    if (deck.startsWith('subtopic-')) return `Subtema ${deck.replace('subtopic-', '')}`;
    if (deck.startsWith('topic-')) return `Tema ${deck.replace('topic-', '')}`;
    return 'Mazo Personalizado';
  });

  // Filtrado reactivo de tarjetas en el Explorador (< 1 ms sobre 1 200+ tarjetas)
  readonly filteredExplorerCards = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const deck = this.selectedDeck();
    const kind = this.filterKind();
    const boxFilter = this.filterBox();
    const progress = this.flashcardsService.progress();

    let list = this.allCards();

    // Filtro por mazo activo
    if (deck === 'commands') {
      list = list.filter((c) => c.type === 'command' || c.kind === 'comando');
    } else if (deck === 'flags') {
      list = list.filter((c) => c.type === 'flag' || c.kind === 'opcion');
    } else if (deck === 'glossary') {
      list = list.filter((c) => c.type === 'glossary' || c.kind === 'termino');
    } else if (deck === 'exam-101') {
      list = list.filter(
        (c) =>
          c.examId === '101' ||
          c.subtopicIds.some((s) => {
            const num = parseInt(s.split('.')[0] || '0', 10);
            return num >= 101 && num <= 104;
          })
      );
    } else if (deck === 'exam-102') {
      list = list.filter(
        (c) =>
          c.examId === '102' ||
          c.subtopicIds.some((s) => {
            const num = parseInt(s.split('.')[0] || '0', 10);
            return num >= 105 && num <= 110;
          })
      );
    } else if (deck === 'due-today') {
      list = list.filter((c) => {
        const p = progress[c.id];
        return p !== undefined && isCardDue(p.nextReviewDate);
      });
    } else if (deck.startsWith('topic-')) {
      const tid = deck.replace('topic-', '');
      list = list.filter((c) => c.topicId === tid || c.subtopicIds.some((s) => s.startsWith(`${tid}.`)));
    } else if (deck.startsWith('subtopic-')) {
      const sid = deck.replace('subtopic-', '');
      list = list.filter((c) => c.subtopicIds.includes(sid));
    }

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
      const subtemaParam = this.route.snapshot.queryParamMap.get('subtema');
      let initialDeck: DeckType = 'all';

      if (subtemaParam) {
        initialDeck = `subtopic-${subtemaParam}`;
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
    this.isCompleted.set(false);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.ratingsCount.set({ again: 0, hard: 0, good: 0, easy: 0 });
    this.reviewedCards.set([]);
    this.explorerPage.set(1);

    try {
      const [stats, session] = await Promise.all([
        this.flashcardsService.getDeckStats(deck),
        this.flashcardsService.getSessionCards(deck)
      ]);

      this.deckStats.set(stats);
      this.sessionCards.set(session.sessionCards);
    } finally {
      this.loading.set(false);
    }
  }

  flipCard(): void {
    this.isFlipped.set(!this.isFlipped());
  }

  rateCurrentCard(rating: LeitnerRating): void {
    const card = this.currentCard();
    if (!card) return;

    this.flashcardsService.rateCard(card.id, rating);

    // Actualiza métricas de la sesión
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
    await this.selectDeck(this.selectedDeck());
  }

  getBoxCount(box: LeitnerBox): number {
    return this.deckStats()?.byBox[box] ?? 0;
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
}
