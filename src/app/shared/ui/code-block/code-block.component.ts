import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-code-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block-container">
      @if (filename() || language() || showCopy()) {
        <div class="code-block-header">
          <div class="code-meta">
            @if (filename()) {
              <span class="code-filename">{{ filename() }}</span>
            }
            @if (language()) {
              <span class="code-lang">{{ language() }}</span>
            }
          </div>

          @if (showCopy()) {
            <button
              type="button"
              class="copy-btn"
              [attr.aria-label]="copied() ? 'Código copiado al portapapeles' : 'Copiar código'"
              (click)="copyToClipboard()"
            >
              @if (copied()) {
                <svg class="w-4 h-4 copy-success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="copy-text copy-success-text">Copiado</span>
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span class="copy-text">Copiar</span>
              }
            </button>
          }
        </div>
      }

      <pre class="code-pre" tabindex="0" role="region" [attr.aria-label]="language() ? 'Bloque de código ' + language() : 'Bloque de código'"><code class="code-body">{{ codeText() }}</code></pre>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 16px 0;
    }

    .code-block-container {
      background-color: var(--surface-muted);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .code-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      background-color: var(--surface);
      font-size: 12px;
      line-height: 16px;
    }

    .code-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .code-filename {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text);
    }

    .code-lang {
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 500;
    }

    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: var(--radius-xs);
      border: 1px solid var(--border);
      background-color: var(--surface);
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      transition: color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
    }

    .copy-btn:hover {
      color: var(--text);
      border-color: var(--border-strong);
      background-color: var(--surface-muted);
    }

    .copy-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 1px;
    }

    .copy-text {
      font-weight: 500;
    }

    .copy-success-icon,
    .copy-success-text {
      color: var(--success);
    }

    .code-pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 22px;
      color: var(--text);
    }

    .code-body {
      font-family: inherit;
      white-space: pre;
    }
  `]
})
export class CodeBlockComponent {
  readonly code = input<string>('');
  readonly language = input<string>('');
  readonly filename = input<string>('');
  readonly showCopy = input<boolean>(true);

  readonly copied = signal<boolean>(false);

  readonly codeText = computed(() => this.code().trim());

  async copyToClipboard(): Promise<void> {
    const text = this.codeText();
    if (!text) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
      }, 2000);
    } catch {
      // Ignorar fallo de portapapeles sin romper UI
    }
  }
}
