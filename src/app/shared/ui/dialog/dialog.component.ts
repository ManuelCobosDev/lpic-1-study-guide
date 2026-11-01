import { ChangeDetectionStrategy, Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown.escape)': 'handleEscape($event)'
  },
  template: `
    @if (open()) {
      <div class="dialog-container">
        @if (closeOnBackdrop()) {
          <button
            type="button"
            class="dialog-backdrop"
            aria-label="Cerrar diálogo"
            tabindex="-1"
            (click)="close()"
          ></button>
        } @else {
          <div class="dialog-backdrop" aria-hidden="true"></div>
        }

        <div
          #dialogPanel
          class="dialog-panel"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="title() ? titleId() : null"
          tabindex="-1"
        >
          <div class="dialog-header">
            @if (title()) {
              <h3 [id]="titleId()" class="dialog-title">{{ title() }}</h3>
            }
            <button
              type="button"
              class="dialog-close-btn"
              aria-label="Cerrar diálogo"
              (click)="close()"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="dialog-body">
            <ng-content />
          </div>

          <div class="dialog-footer">
            <ng-content select="[actions], app-button, button" />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .dialog-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: var(--z-dialog);
      box-sizing: border-box;
      animation: dialogFadeIn var(--transition-fast);
    }

    .dialog-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--dialog-backdrop);
      backdrop-filter: blur(2px);
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
    }

    .dialog-panel {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 520px;
      max-height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      background-color: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      box-sizing: border-box;
      animation: dialogZoomIn var(--transition-fast);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
    }

    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 26px;
      color: var(--text);
    }

    .dialog-close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-xs);
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }

    .dialog-close-btn:hover {
      background-color: var(--surface-muted);
      color: var(--text);
    }

    .dialog-close-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }

    .dialog-body {
      padding: 24px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 22px;
      color: var(--text);
    }

    .dialog-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      background-color: var(--surface-muted);
    }

    @keyframes dialogFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes dialogZoomIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class DialogComponent {
  private static nextId = 0;
  private readonly defaultId = `app-dialog-${DialogComponent.nextId++}`;

  readonly title = input<string>('');
  readonly closeOnBackdrop = input<boolean>(true);

  readonly open = model<boolean>(false);
  readonly closed = output<void>();

  readonly dialogPanel = viewChild<ElementRef<HTMLElement>>('dialogPanel');

  readonly titleId = computed(() => `${this.defaultId}-title`);

  handleEscape(event: Event): void {
    if (this.open()) {
      event.preventDefault();
      this.close();
    }
  }

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
