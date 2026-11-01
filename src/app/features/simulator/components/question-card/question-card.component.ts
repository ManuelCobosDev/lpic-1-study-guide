import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { Question, QuestionOption } from '../../../../core/models/question.model';
import { QuestionAnswer } from '../../../../core/models/attempt.model';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionCardComponent {
  readonly question = input.required<Question>();
  readonly questionNumber = input.required<number>(); // 1-based
  readonly totalQuestions = input.required<number>();
  readonly answer = input<QuestionAnswer | undefined>();
  readonly isFlagged = input<boolean>(false);
  readonly mode = input<'exam' | 'practice'>('exam');
  readonly isPracticeChecked = input<boolean>(false);

  readonly answerChanged = output<{ selectedOptions?: string[]; textAnswer?: string }>();
  readonly toggleFlag = output<void>();
  readonly checkPractice = output<void>();

  /**
   * Opciones seleccionadas actualmente por el usuario (para single/multiple)
   */
  readonly selectedOptions = computed<string[]>(() => {
    return this.answer()?.selectedOptions ?? [];
  });

  /**
   * Texto ingresado actualmente por el usuario (para fill)
   */
  readonly textAnswer = computed<string>(() => {
    return this.answer()?.textAnswer ?? '';
  });

  /**
   * Etiqueta humana para el tipo de pregunta
   */
  readonly typeLabel = computed<string>(() => {
    switch (this.question().type) {
      case 'single':
        return 'Opción única';
      case 'multiple':
        return `Opción múltiple (Elige ${this.question().correct.length})`;
      case 'fill':
        return 'Respuesta abierta';
      default:
        return 'Pregunta';
    }
  });

  /**
   * Número de respuestas que el usuario debe elegir si es de opción múltiple
   */
  readonly requiredMultipleCount = computed<number>(() => {
    return this.question().correct.length;
  });

  /**
   * Comprueba si una opción específica está seleccionada
   */
  isOptionSelected(optionId: string): boolean {
    return this.selectedOptions().includes(optionId);
  }

  /**
   * Manejador para preguntas de opción única ('single')
   */
  onSelectSingle(optionId: string): void {
    if (this.mode() === 'practice' && this.isPracticeChecked()) return;
    this.answerChanged.emit({ selectedOptions: [optionId] });
  }

  /**
   * Manejador para preguntas de opción múltiple ('multiple')
   */
  onToggleMultiple(optionId: string): void {
    if (this.mode() === 'practice' && this.isPracticeChecked()) return;
    const current = [...this.selectedOptions()];
    const index = current.indexOf(optionId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(optionId);
    }
    this.answerChanged.emit({ selectedOptions: current });
  }

  /**
   * Manejador para preguntas abiertas de texto ('fill')
   */
  onTextInput(event: Event): void {
    if (this.mode() === 'practice' && this.isPracticeChecked()) return;
    const value = (event.target as HTMLInputElement).value;
    this.answerChanged.emit({ textAnswer: value });
  }

  onFlagClick(): void {
    this.toggleFlag.emit();
  }

  onCheckPracticeClick(): void {
    this.checkPractice.emit();
  }

  /**
   * Determina las clases visuales de retroalimentación en modo práctica
   */
  getOptionFeedbackClass(option: QuestionOption): string {
    if (this.mode() !== 'practice' || !this.isPracticeChecked()) return '';

    const isCorrect = this.question().correct.includes(option.id);
    const isSelected = this.isOptionSelected(option.id);

    if (isCorrect) return 'feedback-correct';
    if (isSelected && !isCorrect) return 'feedback-incorrect';
    return '';
  }

  /**
   * Evalúa si la respuesta en modo práctica es correcta (para el banner didáctico)
   */
  readonly isPracticeAnswerCorrect = computed<boolean>(() => {
    if (this.mode() !== 'practice' || !this.isPracticeChecked()) return false;

    const q = this.question();
    if (q.type === 'single') {
      const selected = this.selectedOptions()[0];
      return Boolean(selected && q.correct.includes(selected));
    }

    if (q.type === 'multiple') {
      const selected = this.selectedOptions();
      if (selected.length !== q.correct.length) return false;
      return q.correct.every((c) => selected.includes(c));
    }

    if (q.type === 'fill') {
      const txt = (this.textAnswer() || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!txt) return false;
      const accepted = (q.acceptedAnswers ?? []).map((a) =>
        a.trim().toLowerCase().replace(/\s+/g, ' ')
      );
      return accepted.includes(txt);
    }

    return false;
  });
}

