import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'app-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="textarea-wrapper" [class.textarea-has-error]="!!error()">
      @if (label()) {
        <label [for]="textareaId()" class="textarea-label">
          {{ label() }}
          @if (required()) {
            <span class="textarea-required-mark" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="textarea-control-container">
        <textarea
          [id]="textareaId()"
          [value]="value()"
          [rows]="rows()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="describedBy()"
          class="textarea-element"
          (input)="handleInput($event)"
        ></textarea>
      </div>

      @if (error()) {
        <p [id]="errorId()" class="textarea-message textarea-error-text" role="alert">
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p [id]="hintId()" class="textarea-message textarea-hint-text">
          {{ hint() }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .textarea-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .textarea-label {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      color: var(--text);
    }

    .textarea-required-mark {
      color: var(--danger);
      margin-left: 2px;
    }

    .textarea-control-container {
      position: relative;
      width: 100%;
    }

    .textarea-element {
      width: 100%;
      min-height: 80px;
      padding: 10px 14px;
      font-size: 14px;
      line-height: 22px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-strong);
      background-color: var(--surface);
      color: var(--text);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      box-sizing: border-box;
      resize: vertical;
      font-family: inherit;
    }

    .textarea-element::placeholder {
      color: var(--text-subtle);
    }

    .textarea-element:focus-visible {
      outline: none;
      border-color: var(--ring);
      box-shadow: 0 0 0 2px var(--primary-soft);
    }

    .textarea-element:disabled {
      background-color: var(--surface-muted);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Estado de Error */
    .textarea-has-error .textarea-element {
      border-color: var(--danger);
    }

    .textarea-has-error .textarea-element:focus-visible {
      box-shadow: 0 0 0 2px var(--danger-soft);
    }

    .textarea-message {
      margin: 0;
      font-size: 13px;
      line-height: 18px;
    }

    .textarea-error-text {
      color: var(--danger-text);
      font-weight: 500;
    }

    .textarea-hint-text {
      color: var(--text-muted);
    }
  `]
})
export class TextareaComponent {
  private static nextId = 0;
  private readonly defaultId = `app-textarea-${TextareaComponent.nextId++}`;

  readonly id = input<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly hint = input<string>('');

  readonly value = model<string>('');

  readonly textareaId = computed(() => this.id() || this.defaultId);
  readonly errorId = computed(() => `${this.textareaId()}-error`);
  readonly hintId = computed(() => `${this.textareaId()}-hint`);

  readonly describedBy = computed(() => {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  handleInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
  }
}

