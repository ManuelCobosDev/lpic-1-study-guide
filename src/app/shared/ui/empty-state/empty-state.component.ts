import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state-container">
      <div class="empty-state-icon" aria-hidden="true">
        <ng-content select="[icon]">
          <!-- Icono neutro por defecto si no se proyecta ninguno -->
          <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </ng-content>
      </div>

      <h3 class="empty-state-title">{{ title() }}</h3>

      @if (description()) {
        <p class="empty-state-desc">{{ description() }}</p>
      }

      <div class="empty-state-actions">
        <ng-content select="[actions], app-button, button" />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-lg);
      background-color: var(--surface);
      box-sizing: border-box;
    }

    .empty-state-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      border-radius: var(--radius-full);
      background-color: var(--surface-muted);
      color: var(--text-muted);
    }

    .empty-state-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 26px;
      color: var(--text);
    }

    .empty-state-desc {
      margin: 0 0 24px 0;
      max-width: 440px;
      font-size: 14px;
      line-height: 22px;
      color: var(--text-muted);
    }

    .empty-state-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  `]
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
}

