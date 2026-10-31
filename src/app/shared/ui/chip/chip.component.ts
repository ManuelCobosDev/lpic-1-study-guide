import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-1.5 shrink-0 h-[28px] min-h-[28px] max-h-[28px] px-3 text-[13px] font-medium leading-none rounded-lg border transition-all select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      [ngClass]="classes()"
      (click)="handleClick()"
    >
      <ng-content></ng-content>
      @if (removable()) {
        <span
          role="button"
          tabindex="0"
          aria-label="Eliminar"
          class="ml-0.5 hover:opacity-75 focus:outline-hidden"
          (click)="handleRemove($event)"
          (keydown.enter)="handleRemove($event)"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipComponent {
  readonly selected = input<boolean>(false);
  readonly removable = input<boolean>(false);
  readonly chipToggle = output<boolean>();
  readonly chipRemove = output<void>();

  readonly classes = computed(() => {
    if (this.selected()) {
      return 'bg-[var(--primary-soft)] text-[var(--primary-text)] border-[var(--primary)] font-semibold shadow-xs';
    }
    return 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)]';
  });

  handleClick(): void {
    this.chipToggle.emit(!this.selected());
  }

  handleRemove(event: Event): void {
    event.stopPropagation();
    this.chipRemove.emit();
  }
}

