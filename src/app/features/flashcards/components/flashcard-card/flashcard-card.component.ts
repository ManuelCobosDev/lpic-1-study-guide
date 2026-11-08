import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FlashcardItem, LeitnerBox, LeitnerRating } from '../../../../core/models/flashcard.model';
import { BOX_INTERVALS_DAYS, calculateNextBox } from '../../../../core/engines/leitner/leitner.engine';

@Component({
  selector: 'app-flashcard-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flashcard-card.component.html',
  styleUrls: ['./flashcard-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlashcardCardComponent {
  readonly card = input.required<FlashcardItem>();
  readonly currentBox = input<number>(1);
  readonly isFlipped = input<boolean>(false);

  readonly flip = output<void>();
  readonly rate = output<LeitnerRating>();

  readonly boxBadge = computed(() => `Caja ${this.currentBox()}`);

  readonly boxSubtext = computed(() => {
    switch (this.currentBox()) {
      case 1:
        return 'Repaso diario';
      case 2:
        return 'Repaso en 1 día';
      case 3:
        return 'Repaso en 3 días';
      case 4:
        return 'Repaso en 7 días';
      case 5:
        return 'Dominada (21 días)';
      default:
        return '';
    }
  });

  readonly boxDescription = computed(() => {
    switch (this.currentBox()) {
      case 1:
        return 'Caja 1: Tarjeta nueva o fallada. Se repasa hoy mismo.';
      case 2:
        return 'Caja 2: En progreso inicial. Próximo repaso en 1 día.';
      case 3:
        return 'Caja 3: Consolidada. Próximo repaso en 3 días.';
      case 4:
        return 'Caja 4: Avanzada. Próximo repaso en 7 días.';
      case 5:
        return 'Caja 5: Dominada. Próximo repaso en 21 días (afianzada para examen).';
      default:
        return '';
    }
  });

  readonly intervals = computed(() => {
    const box = (this.currentBox() || 1) as LeitnerBox;
    const againBox = calculateNextBox(box, 'again');
    const hardBox = calculateNextBox(box, 'hard');
    const goodBox = calculateNextBox(box, 'good');
    const easyBox = calculateNextBox(box, 'easy');

    return {
      again: this.formatInterval(BOX_INTERVALS_DAYS[againBox]),
      hard: this.formatInterval(BOX_INTERVALS_DAYS[hardBox]),
      good: this.formatInterval(BOX_INTERVALS_DAYS[goodBox]),
      easy: this.formatInterval(BOX_INTERVALS_DAYS[easyBox])
    };
  });

  private formatInterval(days: number): string {
    if (days === 0) return 'Hoy';
    if (days === 1) return '1 día';
    return `${days} días`;
  }

  onCardClick(): void {
    if (!this.isFlipped()) {
      this.flip.emit();
    }
  }

  onRate(rating: LeitnerRating, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.rate.emit(rating);
  }
}

