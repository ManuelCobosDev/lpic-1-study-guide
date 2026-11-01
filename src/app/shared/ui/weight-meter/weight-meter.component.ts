import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-weight-meter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="weight-meter-container"
      role="meter"
      [attr.aria-valuenow]="weight()"
      aria-valuemin="1"
      [attr.aria-valuemax]="maxWeight()"
      [attr.aria-label]="'Peso LPI ' + weight() + ' de ' + maxWeight()"
    >
      <span class="weight-label">Peso LPI {{ weight() }}</span>
      <div class="weight-track" aria-hidden="true">
        <div class="weight-fill" [style.width.%]="fillPercentage()"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .weight-meter-container {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .weight-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .weight-track {
      width: 48px;
      height: 4px;
      background-color: var(--border-strong);
      border-radius: var(--radius-full);
      overflow: hidden;
      display: flex;
    }

    .weight-fill {
      height: 100%;
      background-color: var(--warning);
      border-radius: var(--radius-full);
      transition: width var(--transition-base);
    }
  `]
})
export class WeightMeterComponent {
  /** Peso LPI del tema o subtema (por defecto 1) */
  readonly weight = input.required<number>();

  /** Peso maximo de referencia en el examen LPIC-1 (max 26 segun spec 6.3) */
  readonly maxWeight = input<number>(26);

  readonly fillPercentage = computed(() => {
    const w = this.weight();
    const max = this.maxWeight();
    if (max <= 0) return 0;
    const pct = (w / max) * 100;
    return Math.min(Math.max(pct, 0), 100);
  });
}

