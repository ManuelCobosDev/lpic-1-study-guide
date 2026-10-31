import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonRadius = 'xs' | 'sm' | 'md' | 'lg' | 'full';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="skeleton-pulse"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radiusVar()"
      aria-hidden="true"
    ></div>
  `,
  styles: [`
    :host {
      display: inline-block;
      width: 100%;
    }

    .skeleton-pulse {
      background-color: var(--surface-muted);
      border: 1px solid var(--border);
      animation: pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      box-sizing: border-box;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.45;
      }
    }
  `]
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('20px');
  readonly rounded = input<SkeletonRadius>('md');

  readonly radiusVar = computed(() => `var(--radius-${this.rounded()})`);
}

