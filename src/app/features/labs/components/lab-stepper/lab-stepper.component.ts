import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabStep } from '../../../../core/models/lab.model';

@Component({
  selector: 'app-lab-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="lab-stepper-nav w-full space-y-1.5" aria-label="Pasos de la práctica">
      <div class="stepper-header px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center justify-between">
        <span>Misiones ({{ completedCount() }}/{{ steps().length }})</span>
        <span class="text-[11px] font-normal font-sans text-[var(--text)]">
          {{ progressPercent() }}%
        </span>
      </div>

      <div class="stepper-list space-y-1" role="list">
        @for (step of steps(); track step.stepNumber) {
          @let isCompleted = isStepCompleted(step.stepNumber);
          @let isActive = activeStepNumber() === step.stepNumber;

          <div
            class="stepper-item group flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs cursor-pointer select-none"
            [class.border-[var(--primary)]]="isActive"
            [class.bg-[var(--primary-soft)]]="isActive"
            [class.shadow-xs]="isActive"
            [class.border-transparent]="!isActive"
            [class.hover:bg-[var(--surface-muted)]]="!isActive"
            [attr.aria-current]="isActive ? 'step' : null"
            (click)="onStepClick(step.stepNumber)"
            (keydown.enter)="onStepClick(step.stepNumber)"
            tabindex="0"
            role="listitem"
          >
            <!-- Lado izquierdo: Círculo de estado y Título -->
            <div class="flex items-center gap-2.5 min-w-0 pr-2">
              <span
                class="step-badge shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all"
                [class.bg-[var(--success)]]="isCompleted"
                [class.text-white]="isCompleted"
                [class.bg-[var(--primary)]]="!isCompleted && isActive"
                [class.text-[var(--color-slate-900)]]="!isCompleted && isActive"
                [class.bg-[var(--surface-muted)]]="!isCompleted && !isActive"
                [class.text-[var(--text-muted)]]="!isCompleted && !isActive"
                [class.border]="!isCompleted && !isActive"
                [class.border-[var(--border)]]="!isCompleted && !isActive"
                aria-hidden="true"
              >
                @if (isCompleted) {
                  ✓
                } @else {
                  {{ step.stepNumber }}
                }
              </span>

              <span
                class="step-title truncate font-medium text-[var(--text)] transition-colors"
                [class.font-bold]="isActive"
                [class.text-[var(--primary-text)]]="isActive"
                [class.line-through]="isCompleted && !isActive"
              >
                {{ step.title }}
              </span>
            </div>

            <!-- Lado derecho: Botón rápido de alternar completado -->
            <button
              type="button"
              class="step-checkbox-btn shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer"
              [class.bg-[var(--success)]]="isCompleted"
              [class.border-[var(--success)]]="isCompleted"
              [class.text-white]="isCompleted"
              [class.border-[var(--border-strong)]]="!isCompleted"
              [class.bg-[var(--surface)]]="!isCompleted"
              [class.hover:border-[var(--primary)]]="!isCompleted"
              (click)="onCheckboxClick($event, step.stepNumber)"
              [title]="isCompleted ? 'Desmarcar como hecho' : 'Marcar como hecho'"
              [attr.aria-label]="isCompleted ? 'Desmarcar paso ' + step.stepNumber : 'Marcar paso ' + step.stepNumber + ' como hecho'"
            >
              @if (isCompleted) {
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              }
            </button>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabStepperComponent {
  readonly steps = input.required<LabStep[]>();
  readonly activeStepNumber = input<number>(1);
  readonly completedStepNumbers = input<number[]>([]);

  readonly stepSelect = output<number>();
  readonly stepToggle = output<number>();

  readonly completedCount = computed(() => {
    const completed = this.completedStepNumbers();
    const all = this.steps();
    return all.filter((s) => completed.includes(s.stepNumber)).length;
  });

  readonly progressPercent = computed(() => {
    const total = this.steps().length;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  isStepCompleted(stepNumber: number): boolean {
    return this.completedStepNumbers().includes(stepNumber);
  }

  onStepClick(stepNumber: number): void {
    this.stepSelect.emit(stepNumber);
  }

  onCheckboxClick(event: MouseEvent, stepNumber: number): void {
    event.stopPropagation();
    this.stepToggle.emit(stepNumber);
  }
}

