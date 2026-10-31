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

@Component({
  selector: 'app-flashcards-page',
  standalone: true,
  imports: [
    CommonModule,
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

  readonly selectedDeck = signal<DeckType>('mixed');
  readonly deckStats = signal<LeitnerStats | null>(null);
  readonly sessionCards = signal<FlashcardItem[]>([]);
  readonly currentIndex = signal<number>(0);
  readonly isFlipped = signal<boolean>(false);
  readonly isCompleted = signal<boolean>(false);
  readonly loading = signal<boolean>(true);

  readonly ratingsCount = signal<Record<LeitnerRating, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  });

  readonly reviewedCards = signal<string[]>([]);

  readonly availableDecks: { id: DeckType; label: string; icon: string }[] = [
    { id: 'mixed', label: 'Mixto (Comandos + Glosario)', icon: '⚡' },
    { id: 'commands', label: 'Solo Comandos', icon: '💻' },
    { id: 'glossary', label: 'Solo Glosario', icon: '📖' }
  ];

  readonly currentCard = computed(() => {
    return this.sessionCards()[this.currentIndex()] ?? null;
  });

  readonly totalCardsInSession = computed(() => {
    return this.sessionCards().length;
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
    const initialDeck = (this.route.snapshot.queryParamMap.get('mazo') as DeckType) || 'mixed';
    await this.selectDeck(initialDeck);
  }

  async selectDeck(deck: DeckType): Promise<void> {
    this.loading.set(true);
    this.selectedDeck.set(deck);
    this.isCompleted.set(false);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.ratingsCount.set({ again: 0, hard: 0, good: 0, easy: 0 });
    this.reviewedCards.set([]);

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
}

