import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge-base inline-flex items-center justify-center shrink-0 h-[24px] min-h-[24px] max-h-[24px] px-2.5 text-[12px] font-semibold leading-none rounded-full border transition-colors select-none box-border"
      [ngClass]="classes()"
    >
      @if (dot()) {
        <span class="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" [ngClass]="dotClasses()"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly dot = input<boolean>(false);

  readonly classes = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'bg-[var(--primary-soft)] text-[var(--primary-text)] border-[var(--primary)]';
      case 'success':
        return 'bg-[var(--success-soft)] text-[var(--success-text)] border-[var(--success)]';
      case 'warning':
        return 'bg-[var(--warning-soft)] text-[var(--warning-text)] border-[var(--warning)]';
      case 'danger':
        return 'bg-[var(--danger-soft)] text-[var(--danger-text)] border-[var(--danger)]';
      case 'info':
        return 'bg-[var(--info-soft)] text-[var(--info-text)] border-[var(--info)]';
      case 'neutral':
      default:
        return 'bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border)]';
    }
  });

  readonly dotClasses = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'bg-[var(--primary)]';
      case 'success':
        return 'bg-[var(--success)]';
      case 'warning':
        return 'bg-[var(--warning)]';
      case 'danger':
        return 'bg-[var(--danger)]';
      case 'info':
        return 'bg-[var(--info)]';
      case 'neutral':
      default:
        return 'bg-[var(--text-subtle)]';
    }
  });
}

