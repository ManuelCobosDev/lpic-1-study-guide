import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseInlineMarkdown } from '../../core/engines/markdown/markdown.engine';

@Component({
  selector: 'app-heading-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (level()) {
      @case (1) {
        <h1
          class="heading-block-1 text-2xl lg:text-3xl font-black text-[var(--text)] tracking-tight my-4 leading-tight"
          [innerHTML]="parsedHtml()"
        ></h1>
      }
      @case (2) {
        <h2
          class="heading-block-2 text-xl lg:text-2xl font-bold text-[var(--text)] tracking-tight my-4 leading-snug"
          [innerHTML]="parsedHtml()"
        ></h2>
      }
      @case (3) {
        <h3
          class="heading-block-3 text-lg font-bold text-[var(--text)] my-3 leading-snug"
          [innerHTML]="parsedHtml()"
        ></h3>
      }
      @default {
        <h4
          class="heading-block-4 text-base font-semibold text-[var(--text)] my-2 leading-snug"
          [innerHTML]="parsedHtml()"
        ></h4>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadingBlockComponent {
  readonly level = input<1 | 2 | 3 | 4 | 5 | 6>(2);
  readonly text = input.required<string>();
  readonly highlightQuery = input<string>('');

  readonly parsedHtml = computed(() => {
    let html = parseInlineMarkdown(this.text());
    const q = this.highlightQuery()?.trim();
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      html = html.replace(
        regex,
        '<mark class="bg-[var(--warning-soft)] text-[var(--warning-text)] px-0.5 rounded font-semibold">$1</mark>'
      );
    }
    return html;
  });
}

