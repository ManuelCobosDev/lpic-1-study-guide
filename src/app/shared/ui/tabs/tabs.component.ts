import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
  panelId?: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="tabs-container" aria-label="Navegación por pestañas">
      <div class="tabs-list" role="tablist" aria-label="Pestañas de contenido">
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            role="tab"
            class="tab-btn"
            [class.tab-active]="tab.id === activeId()"
            [class.tab-disabled]="tab.disabled"
            [attr.aria-selected]="tab.id === activeId()"
            [attr.aria-controls]="tab.panelId ?? null"
            [attr.data-testid]="'tab-' + tab.id"
            [id]="'tab-' + tab.id"
            [disabled]="tab.disabled"
            (click)="selectTab(tab.id)"
          >
            <span>{{ tab.label }}</span>
            @if (tab.badge !== undefined && tab.badge !== null) {
              <span class="tab-badge">{{ tab.badge }}</span>
            }
          </button>
        }
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .tabs-container {
      display: block;
      width: 100%;
    }

    .tabs-list {
      display: flex;
      gap: 16px;
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tabs-list::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 4px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: color var(--transition-fast), border-color var(--transition-fast);
      margin-bottom: -1px;
    }

    .tab-btn:hover:not(:disabled) {
      color: var(--text);
    }

    .tab-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: -2px;
    }

    .tab-btn.tab-active {
      color: var(--primary-text);
      font-weight: 600;
      border-bottom-color: var(--primary);
    }

    .tab-btn.tab-disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      height: 18px;
      min-width: 18px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      background-color: var(--surface-muted);
      color: var(--text-muted);
    }

    .tab-btn.tab-active .tab-badge {
      background-color: var(--primary-soft);
      color: var(--primary-text);
    }
  `]
})
export class TabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeId = model<string>('');

  readonly tabChange = output<string>();

  selectTab(id: string): void {
    if (this.activeId() !== id) {
      this.activeId.set(id);
      this.tabChange.emit(id);
    }
  }
}

