import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="mx-auto w-full px-4 sm:px-6"
      [class.app-container-standard]="!isWide()"
      [class.app-container-wide]="isWide()"
    >
      <ng-content />
    </div>
  `,
  styles: [`
    .app-container-standard {
      max-width: 1200px;
    }
    .app-container-wide {
      max-width: 1440px;
    }
  `],
  host: {
    class: 'block w-full'
  }
})
export class ContainerComponent {
  readonly wide = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly size = input<'standard' | 'wide' | string>('standard');

  readonly isWide = computed(() => this.wide() || this.size() === 'wide');
}
