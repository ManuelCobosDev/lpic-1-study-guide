import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-kbd',
  standalone: true,
  template: `
    <kbd class="font-mono text-[12px] font-semibold px-1.5 py-0.5 rounded border border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text)] shadow-xs leading-none inline-flex items-center justify-center min-w-[20px] select-none">
      <ng-content></ng-content>
    </kbd>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbdComponent {}

