import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface QuizOptionItem {
  key: string;
  text: string;
}

@Component({
  selector: 'app-quiz-inline-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="quiz-inline-card my-6 p-5 rounded-2xl border transition-all"
      [class.border-[var(--border)]]="status() === 'unanswered'"
      [class.border-[var(--success)]]="status() === 'correct'"
      [class.border-[var(--danger)]]="status() === 'incorrect'"
      [class.bg-[var(--surface)]]="status() === 'unanswered'"
      [class.bg-[var(--success-soft)]]="status() === 'correct'"
      [class.bg-[var(--danger-soft)]]="status() === 'incorrect'"
    >
      <!-- Cabecera de la pregunta -->
      <div class="flex items-center gap-2 mb-3">
        <span class="text-base" aria-hidden="true">💡</span>
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary-text)]">
          Comprueba lo aprendido
        </span>
      </div>

      <h4 class="text-sm sm:text-base font-bold text-[var(--text)] mb-4 leading-snug">
        {{ question() }}
      </h4>

      <!-- Opciones -->
      <fieldset class="space-y-2 mb-4 border-none p-0 m-0">
        <legend class="sr-only">Opciones de respuesta</legend>
        @for (opt of options(); track opt.key) {
          <label
            class="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] cursor-pointer transition-all select-none hover:bg-[var(--surface-muted)]"
            [class.border-[var(--primary)]]="isSelected(opt.key) && status() === 'unanswered'"
            [class.bg-[var(--surface-elevated)]]="isSelected(opt.key)"
          >
            <input
              [type]="isMultiSelect() ? 'checkbox' : 'radio'"
              [name]="'quiz-' + id()"
              [value]="opt.key"
              [checked]="isSelected(opt.key)"
              (change)="toggleOption(opt.key)"
              class="mt-0.5 accent-[var(--primary)]"
            />
            <div class="flex items-baseline gap-2 flex-1 text-xs sm:text-sm">
              <span class="font-mono font-bold text-[var(--text-muted)]">{{ opt.key }})</span>
              <span class="text-[var(--text)]">{{ opt.text }}</span>
            </div>
          </label>
        }
      </fieldset>

      <!-- Botones de acción -->
      <div class="flex items-center gap-3">
        @if (status() === 'unanswered') {
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs sm:text-sm font-semibold hover:bg-[var(--primary-hover)] transition-all cursor-pointer disabled:opacity-50"
            [disabled]="selectedKeys().length === 0"
            (click)="checkAnswer()"
          >
            Comprobar respuesta
          </button>
        } @else {
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface-muted)] transition-all cursor-pointer"
            (click)="resetQuiz()"
          >
            Reintentar ↻
          </button>
        }
      </div>

      <!-- Explicación y feedback tras comprobar -->
      @if (status() !== 'unanswered') {
        <div
          class="quiz-feedback mt-4 p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed"
          [class.bg-[var(--surface)]]="true"
        >
          <div class="flex items-center gap-2 mb-1.5 font-bold">
            @if (status() === 'correct') {
              <span class="text-[var(--success-text)]">✓ ¡Respuesta correcta!</span>
            } @else {
              <span class="text-[var(--danger-text)]">✕ Respuesta incorrecta</span>
            }
          </div>
          <p class="text-[var(--text-muted)] m-0">
            {{ explanation() }}
          </p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizInlineBlockComponent {
  readonly id = input.required<string>();
  readonly question = input.required<string>();
  readonly options = input.required<QuizOptionItem[]>();
  readonly correct = input.required<string[]>();
  readonly explanation = input.required<string>();

  readonly selectedKeys = signal<string[]>([]);
  readonly status = signal<'unanswered' | 'correct' | 'incorrect'>('unanswered');

  readonly isMultiSelect = computed(() => this.correct().length > 1);

  isSelected(key: string): boolean {
    return this.selectedKeys().includes(key);
  }

  toggleOption(key: string): void {
    if (this.isMultiSelect()) {
      const curr = this.selectedKeys();
      if (curr.includes(key)) {
        this.selectedKeys.set(curr.filter((k) => k !== key));
      } else {
        this.selectedKeys.set([...curr, key]);
      }
    } else {
      this.selectedKeys.set([key]);
    }
  }

  checkAnswer(): void {
    const sel = [...this.selectedKeys()].sort();
    const cor = [...this.correct()].sort();

    const isMatch = sel.length === cor.length && sel.every((val, index) => val === cor[index]);
    this.status.set(isMatch ? 'correct' : 'incorrect');
  }

  resetQuiz(): void {
    this.selectedKeys.set([]);
    this.status.set('unanswered');
  }
}

