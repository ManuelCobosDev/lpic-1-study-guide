import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

export type InputType = 'text' | 'email' | 'password' | 'search' | 'number';

@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="input-wrapper" [class.input-has-error]="!!error()">
      @if (label()) {
        <label [for]="inputId()" class="input-label">
          {{ label() }}
          @if (required()) {
            <span class="input-required-mark" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="input-control-container">
        <input
          [id]="inputId()"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="describedBy()"
          class="input-element"
          (input)="handleInput($event)"
        />
      </div>

      @if (error()) {
        <p [id]="errorId()" class="input-message input-error-text" role="alert">
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p [id]="hintId()" class="input-message input-hint-text">
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

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .input-label {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      color: var(--text);
    }

    .input-required-mark {
      color: var(--danger);
      margin-left: 2px;
    }

    .input-control-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .input-element {
      width: 100%;
      height: 40px;
      padding: 0 14px;
      font-size: 14px;
      line-height: 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-strong);
      background-color: var(--surface);
      color: var(--text);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      box-sizing: border-box;
    }

    .input-element::placeholder {
      color: var(--text-subtle);
    }

    .input-element:focus-visible {
      outline: none;
      border-color: var(--ring);
      box-shadow: 0 0 0 2px var(--primary-soft);
    }

    .input-element:disabled {
      background-color: var(--surface-muted);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Estado de Error */
    .input-has-error .input-element {
      border-color: var(--danger);
    }

    .input-has-error .input-element:focus-visible {
      box-shadow: 0 0 0 2px var(--danger-soft);
    }

    .input-message {
      margin: 0;
      font-size: 13px;
      line-height: 18px;
    }

    .input-error-text {
      color: var(--danger-text);
      font-weight: 500;
    }

    .input-hint-text {
      color: var(--text-muted);
    }
  `]
})
export class InputComponent {
  private static nextId = 0;
  private readonly defaultId = `app-input-${InputComponent.nextId++}`;

  readonly id = input<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<InputType>('text');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly hint = input<string>('');

  readonly value = model<string>('');

  readonly inputId = computed(() => this.id() || this.defaultId);
  readonly errorId = computed(() => `${this.inputId()}-error`);
  readonly hintId = computed(() => `${this.inputId()}-hint`);

  readonly describedBy = computed(() => {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}

