import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressVariant = 'primary' | 'success' | 'warning';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      role="progressbar"
      [attr.aria-valuenow]="normalizedValue()"
      aria-valuemin="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-label]="label()"
      class="w-full h-1.5 min-h-[6px] max-h-[6px] bg-[var(--surface-muted)] rounded-full overflow-hidden border border-[var(--border)]"
    >
      <div
        class="h-full rounded-full transition-all duration-300 ease-out"
        [ngClass]="fillClasses()"
        [style.width.%]="percentage()"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  readonly variant = input<ProgressVariant>('primary');
  readonly label = input<string>('Progreso');

  readonly normalizedValue = computed(() => Math.max(0, Math.min(this.value(), this.max())));

  readonly percentage = computed(() => {
    const maxVal = this.max();
    if (maxVal <= 0) return 0;
    return Math.round((this.normalizedValue() / maxVal) * 100);
  });

  readonly fillClasses = computed(() => {
    switch (this.variant()) {
      case 'success':
        return 'bg-[var(--success)]';
      case 'warning':
        return 'bg-[var(--warning)]';
      case 'primary':
      default:
        return 'bg-[var(--primary)]';
    }
  });
}

