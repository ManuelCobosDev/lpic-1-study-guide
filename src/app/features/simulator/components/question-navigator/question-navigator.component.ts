import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { Question } from '../../../../core/models/question.model';
import { QuestionAnswer } from '../../../../core/models/attempt.model';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [],
  templateUrl: './question-navigator.component.html',
  styleUrls: ['./question-navigator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionNavigatorComponent {
  readonly questions = input.required<Question[]>();
  readonly currentIndex = input.required<number>(); // 0-based
  readonly answers = input<Record<string, QuestionAnswer>>({});
  readonly mode = input<'exam' | 'practice'>('exam');

  readonly selectQuestion = output<number>();

  /**
   * Control de apertura del cajón inferior en pantallas móviles
   */
  readonly isMobileDrawerOpen = signal<boolean>(false);

  /**
   * Total de preguntas respondidas
   */
  readonly answeredCount = computed<number>(() => {
    const answersMap = this.answers();
    let count = 0;
    for (const q of this.questions()) {
      const a = answersMap[q.id];
      if (a) {
        if (a.selectedOptions && a.selectedOptions.length > 0) {
          count++;
        } else if (a.textAnswer && a.textAnswer.trim().length > 0) {
          count++;
        }
      }
    }
    return count;
  });

  /**
   * Total de preguntas marcadas para revisar
   */
  readonly flaggedCount = computed<number>(() => {
    const answersMap = this.answers();
    let count = 0;
    for (const q of this.questions()) {
      if (answersMap[q.id]?.flagged) {
        count++;
      }
    }
    return count;
  });

  /**
   * Determina si una pregunta ha sido respondida
   */
  isAnswered(questionId: string): boolean {
    const a = this.answers()[questionId];
    if (!a) return false;
    if (a.selectedOptions && a.selectedOptions.length > 0) return true;
    if (a.textAnswer && a.textAnswer.trim().length > 0) return true;
    return false;
  }

  /**
   * Determina si una pregunta está marcada para revisión
   */
  isFlagged(questionId: string): boolean {
    return Boolean(this.answers()[questionId]?.flagged);
  }

  onQuestionClick(index: number): void {
    this.selectQuestion.emit(index);
    this.isMobileDrawerOpen.set(false); // Cierra el cajón en móvil al seleccionar
  }

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update((open) => !open);
  }
}

