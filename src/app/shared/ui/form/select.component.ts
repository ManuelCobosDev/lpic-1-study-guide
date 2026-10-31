import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="select-wrapper" [class.select-has-error]="!!error()">
      @if (label()) {
        <label [for]="selectId()" class="select-label">
          {{ label() }}
          @if (required()) {
            <span class="select-required-mark" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="select-control-container">
        <select
          [id]="selectId()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="describedBy()"
          class="select-element"
          (change)="handleChange($event)"
        >
          @if (placeholder()) {
            <option value="" [disabled]="required()" [selected]="!value()">{{ placeholder() }}</option>
          }
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value" [disabled]="opt.disabled" [selected]="opt.value === value()">
              {{ opt.label }}
            </option>
          }
        </select>
        <span class="select-chevron" aria-hidden="true">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      @if (error()) {
        <p [id]="errorId()" class="select-message select-error-text" role="alert">
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p [id]="hintId()" class="select-message select-hint-text">
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

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .select-label {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      color: var(--text);
    }

    .select-required-mark {
      color: var(--danger);
      margin-left: 2px;
    }

    .select-control-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .select-element {
      width: 100%;
      height: 40px;
      padding: 0 36px 0 14px;
      font-size: 14px;
      line-height: 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-strong);
      background-color: var(--surface);
      color: var(--text);
      appearance: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      box-sizing: border-box;
      cursor: pointer;
    }

    .select-element:focus-visible {
      outline: none;
      border-color: var(--ring);
      box-shadow: 0 0 0 2px var(--primary-soft);
    }

    .select-element:disabled {
      background-color: var(--surface-muted);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .select-chevron {
      position: absolute;
      right: 12px;
      pointer-events: none;
      color: var(--text-muted);
      display: flex;
      align-items: center;
    }

    /* Estado de Error */
    .select-has-error .select-element {
      border-color: var(--danger);
    }

    .select-has-error .select-element:focus-visible {
      box-shadow: 0 0 0 2px var(--danger-soft);
    }

    .select-message {
      margin: 0;
      font-size: 13px;
      line-height: 18px;
    }

    .select-error-text {
      color: var(--danger-text);
      font-weight: 500;
    }

    .select-hint-text {
      color: var(--text-muted);
    }
  `]
})
export class SelectComponent {
  private static nextId = 0;
  private readonly defaultId = `app-select-${SelectComponent.nextId++}`;

  readonly id = input<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input<SelectOption[]>([]);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly hint = input<string>('');

  readonly value = model<string>('');

  readonly selectId = computed(() => this.id() || this.defaultId);
  readonly errorId = computed(() => `${this.selectId()}-error`);
  readonly hintId = computed(() => `${this.selectId()}-hint`);

  readonly describedBy = computed(() => {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value.set(target.value);
  }
}

