import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full border border-[var(--border)] bg-[var(--surface)] rounded-2xl p-6 flex flex-col justify-between shadow-xs transition-colors">
      <div class="flex items-center justify-between gap-3 mb-2">
        <span class="text-[13px] font-medium text-[var(--text-muted)] truncate">{{ title() }}</span>
        @if (badgeText()) {
          <span
            class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            [ngClass]="badgeClasses()"
          >
            {{ badgeText() }}
          </span>
        }
      </div>

      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-[var(--text)] tracking-tight font-mono">{{ value() }}</span>
        @if (unit()) {
          <span class="text-sm font-medium text-[var(--text-muted)]">{{ unit() }}</span>
        }
      </div>

      @if (subtitle()) {
        <p class="text-[13px] text-[var(--text-subtle)] mt-2 line-clamp-2 leading-relaxed">
          {{ subtitle() }}
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input<string>();
  readonly subtitle = input<string>();
  readonly tone = input<StatTone>('neutral');
  readonly badgeText = input<string>();

  readonly badgeClasses = computed(() => {
    switch (this.tone()) {
      case 'primary':
        return 'bg-[var(--primary-soft)] text-[var(--primary-text)]';
      case 'success':
        return 'bg-[var(--success-soft)] text-[var(--success-text)]';
      case 'warning':
        return 'bg-[var(--warning-soft)] text-[var(--warning-text)]';
      case 'danger':
        return 'bg-[var(--danger-soft)] text-[var(--danger-text)]';
      case 'neutral':
      default:
        return 'bg-[var(--surface-muted)] text-[var(--text-muted)]';
    }
  });
}

