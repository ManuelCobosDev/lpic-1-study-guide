import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseInlineMarkdown } from '../../core/engines/markdown/markdown.engine';

@Component({
  selector: 'app-table-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-block-wrapper my-5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
      <table class="table-block w-full border-collapse text-left text-xs sm:text-sm">
        @if (caption()) {
          <caption class="p-2 text-xs font-semibold text-[var(--text-muted)] text-left bg-[var(--surface-muted)] border-b border-[var(--border)]">
            {{ caption() }}
          </caption>
        }
        <thead>
          <tr class="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)]">
            @for (header of headers(); track $index) {
              <th scope="col" class="py-2.5 px-3 font-semibold font-mono text-xs">
                {{ header }}
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--border)]">
          @for (row of rows(); track $index) {
            <tr class="hover:bg-[var(--surface-muted)] transition-colors">
              @for (cell of row; track $index) {
                <td
                  class="py-2.5 px-3 text-[var(--text)] align-top leading-relaxed"
                  [innerHTML]="parseCell(cell)"
                ></td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableBlockComponent {
  readonly headers = input.required<string[]>();
  readonly rows = input.required<string[][]>();
  readonly caption = input<string | undefined>();

  parseCell(text: string): string {
    return parseInlineMarkdown(text);
  }
}
