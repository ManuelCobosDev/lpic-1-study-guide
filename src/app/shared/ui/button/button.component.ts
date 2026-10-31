import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'warning' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (routerLink()) {
      <a
        [routerLink]="routerLink()"
        [class]="buttonClasses()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-disabled]="disabled() || loading() ? 'true' : null"
        [tabindex]="disabled() || loading() ? -1 : 0"
        (click)="handleClick($event)"
      >
        <ng-container *ngTemplateOutlet="buttonContent" />
      </a>
    } @else {
      <button
        [type]="type()"
        [class]="buttonClasses()"
        [disabled]="disabled() || loading()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-busy]="loading()"
        (click)="handleClick($event)"
      >
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    }

    <ng-template #buttonContent>
      @if (loading()) {
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      }
      <ng-content />
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .btn-base {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      border-radius: var(--radius-sm);
      gap: 8px;
      transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      user-select: none;
      box-sizing: border-box;
    }

    .btn-base:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }

    .btn-base:disabled,
    .btn-base[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Tamanos */
    .btn-sm {
      height: 32px;
      padding: 0 12px;
      font-size: 13px;
      line-height: 20px;
    }

    .btn-md {
      height: 40px;
      padding: 0 16px;
      font-size: 14px;
      line-height: 20px;
    }

    .btn-lg {
      height: 48px;
      padding: 0 20px;
      font-size: 15px;
      line-height: 24px;
    }

    .btn-icon {
      width: 40px;
      height: 40px;
      padding: 0;
      font-size: 14px;
    }

    /* Variantes */
    .btn-primary {
      background-color: var(--primary);
      color: var(--color-slate-0);
      border: 1px solid transparent;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: var(--primary-hover);
    }

    .btn-secondary {
      background-color: var(--surface);
      color: var(--text);
      border: 1px solid var(--border-strong);
    }
    .btn-secondary:hover:not(:disabled) {
      background-color: var(--surface-muted);
    }

    .btn-ghost {
      background-color: transparent;
      color: var(--text);
      border: 1px solid transparent;
    }
    .btn-ghost:hover:not(:disabled) {
      background-color: var(--surface-muted);
    }

    .btn-warning {
      background-color: var(--warning);
      color: var(--color-slate-900);
      border: 1px solid transparent;
    }
    .btn-warning:hover:not(:disabled) {
      background-color: var(--warning-hover);
    }

    .btn-destructive {
      background-color: var(--danger);
      color: var(--color-slate-0);
      border: 1px solid transparent;
    }
    .btn-destructive:hover:not(:disabled) {
      background-color: var(--danger-hover);
    }

    .btn-link {
      background-color: transparent;
      color: var(--primary);
      border: 1px solid transparent;
      padding: 0;
      height: auto;
    }
    .btn-link:hover:not(:disabled) {
      text-decoration: underline;
    }
  `]
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaLabel = input<string>('');
  readonly routerLink = input<string | readonly (string | number)[] | null>(null);

  readonly btnClick = output<MouseEvent>();

  readonly buttonClasses = computed(() => {
    return [
      'btn-base',
      `btn-${this.variant()}`,
      `btn-${this.size()}`
    ].join(' ');
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.btnClick.emit(event);
  }
}
