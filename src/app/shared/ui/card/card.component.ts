import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="cardClasses()"
      [attr.role]="interactive() ? 'button' : null"
      [attr.tabindex]="interactive() ? 0 : null"
      (click)="handleClick($event)"
      (keydown)="handleKeydown($event)"
    >
      <ng-content />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .card-base {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      color: var(--text);
      transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
      box-sizing: border-box;
    }

    .card-pad-none {
      padding: 0;
    }

    .card-pad-sm {
      padding: 16px;
    }

    .card-pad-md {
      padding: 24px;
    }

    .card-pad-lg {
      padding: 32px;
    }

    .card-interactive {
      cursor: pointer;
    }

    .card-interactive:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .card-interactive:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }
  `]
})
export class CardComponent {
  /** Indica si la tarjeta es interactiva (clickable, hover con borde primario) */
  readonly interactive = input<boolean>(false);

  /** Relleno interno (por defecto md = 24px segun spec 5.3 y 5.5) */
  readonly padding = input<CardPadding>('md');

  /** Emite al hacer clic cuando es interactiva */
  readonly cardClick = output<MouseEvent>();

  readonly cardClasses = computed(() => {
    return [
      'card-base',
      `card-pad-${this.padding()}`,
      this.interactive() ? 'card-interactive' : ''
    ].filter(Boolean).join(' ');
  });

  handleClick(event: MouseEvent): void {
    if (this.interactive()) {
      this.cardClick.emit(event);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.interactive() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      // Disparar evento de clic sintetico para interaccion con teclado
      this.handleClick(new MouseEvent('click'));
    }
  }
}

