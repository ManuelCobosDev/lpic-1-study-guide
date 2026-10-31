import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="progress-ring-wrapper"
      role="progressbar"
      [attr.aria-valuenow]="clampedValue()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label() || 'Progreso ' + clampedValue() + '%'"
      [style.width.px]="size()"
      [style.height.px]="size()"
    >
      <svg
        class="progress-ring-svg"
        [attr.viewBox]="'0 0 ' + viewBoxSize + ' ' + viewBoxSize"
        aria-hidden="true"
      >
        <!-- Pista de fondo -->
        <circle
          class="ring-track"
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()"
        />

        <!-- Arco de progreso -->
        <circle
          class="ring-progress"
          [class.ring-complete]="clampedValue() === 100"
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="dashOffset()"
        />
      </svg>

      <!-- Contenido central -->
      <div class="ring-content">
        @if (showText()) {
          <span class="ring-value">{{ clampedValue() }}%</span>
          @if (subtitle()) {
            <span class="ring-subtitle">{{ subtitle() }}</span>
          }
        } @else {
          <ng-content />
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .progress-ring-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    .progress-ring-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-track {
      fill: transparent;
      stroke: var(--border-strong);
    }

    .ring-progress {
      fill: transparent;
      stroke: var(--primary);
      stroke-linecap: round;
      transition: stroke-dashoffset 400ms ease-out, stroke var(--transition-base);
    }

    .ring-progress.ring-complete {
      stroke: var(--success);
    }

    .ring-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
    }

    .ring-value {
      font-size: 20px;
      font-weight: 700;
      font-family: var(--font-mono);
      color: var(--text);
      line-height: 1;
    }

    .ring-subtitle {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1;
    }
  `]
})
export class ProgressRingComponent {
  readonly value = input.required<number>();
  readonly size = input<number>(96);
  readonly strokeWidth = input<number>(8);
  readonly showText = input<boolean>(true);
  readonly subtitle = input<string>('');
  readonly label = input<string>('');

  readonly viewBoxSize = 100;
  readonly center = 50;

  readonly clampedValue = computed(() => {
    const v = this.value();
    if (isNaN(v)) return 0;
    return Math.min(Math.max(Math.round(v), 0), 100);
  });

  readonly radius = computed(() => {
    return this.center - this.strokeWidth();
  });

  readonly circumference = computed(() => {
    return 2 * Math.PI * this.radius();
  });

  readonly dashOffset = computed(() => {
    const c = this.circumference();
    const pct = this.clampedValue() / 100;
    return c - pct * c;
  });
}

