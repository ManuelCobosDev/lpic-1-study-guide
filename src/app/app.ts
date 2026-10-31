import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShellComponent } from './shared/layout/app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent],
  template: `<app-shell />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
