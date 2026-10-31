import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="mx-auto w-full px-4 sm:px-6"
      [class.app-container-standard]="!wide()"
      [class.app-container-wide]="wide()"
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
  readonly wide = input<boolean>(false);
}
