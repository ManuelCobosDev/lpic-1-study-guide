import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CalloutType = 'tip' | 'info' | 'warning' | 'exam' | 'danger';

@Component({
  selector: 'app-callout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="calloutClasses()" [attr.role]="roleAttribute()">
      <div class="callout-icon" aria-hidden="true">
        @switch (type()) {
          @case ('tip') {
            <!-- Bombilla (Tip/Consejo) -->
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          @case ('warning') {
            <!-- Triangulo de advertencia -->
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          @case ('exam') {
            <!-- Birrete / examen LPIC-1 -->
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          }
          @case ('danger') {
            <!-- Circulo de peligro/error -->
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          @default {
            <!-- Informacion (Sky/Azure) -->
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        }
      </div>

      <div class="callout-body">
        @if (title()) {
          <h4 class="callout-title">{{ title() }}</h4>
        }
        <div class="callout-content">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 16px 0;
    }

    .callout-base {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      border-left: 3px solid transparent;
      box-sizing: border-box;
      line-height: 24px;
      font-size: 14px;
    }

    .callout-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .callout-body {
      flex: 1 1 auto;
      min-width: 0;
    }

    .callout-title {
      margin: 0 0 4px 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 22px;
    }

    .callout-content {
      color: var(--text);
    }

    /* Tip (Azure / Primario) */
    .callout-tip {
      background-color: var(--primary-soft);
      border-left-color: var(--primary);
    }
    .callout-tip .callout-icon,
    .callout-tip .callout-title {
      color: var(--primary-text);
    }

    /* Info (Sky) */
    .callout-info {
      background-color: var(--info-soft);
      border-left-color: var(--info);
    }
    .callout-info .callout-icon,
    .callout-info .callout-title {
      color: var(--info-text);
    }

    /* Warning (Amber) */
    .callout-warning {
      background-color: var(--warning-soft);
      border-left-color: var(--warning);
    }
    .callout-warning .callout-icon,
    .callout-warning .callout-title {
      color: var(--warning-text);
    }

    /* Exam (Amber destacado) */
    .callout-exam {
      background-color: var(--warning-soft);
      border-left-color: var(--warning);
    }
    .callout-exam .callout-icon,
    .callout-exam .callout-title {
      color: var(--warning-text);
    }

    /* Danger (Rose) */
    .callout-danger {
      background-color: var(--danger-soft);
      border-left-color: var(--danger);
    }
    .callout-danger .callout-icon,
    .callout-danger .callout-title {
      color: var(--danger-text);
    }
  `]
})
export class CalloutComponent {
  readonly type = input<CalloutType>('info');
  readonly title = input<string>('');

  readonly calloutClasses = computed(() => {
    return `callout-base callout-${this.type()}`;
  });

  readonly roleAttribute = computed(() => {
    const t = this.type();
    if (t === 'warning' || t === 'danger') return 'alert';
    return 'note';
  });
}

