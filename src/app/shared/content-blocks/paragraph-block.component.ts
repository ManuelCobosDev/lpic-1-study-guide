import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseInlineMarkdown } from '../../core/engines/markdown/markdown.engine';
import { WikiRefService } from '../../core/services/wiki-ref.service';

@Component({
  selector: 'app-paragraph-block',
  standalone: true,
  imports: [CommonModule],
  host: {
    '(click)': 'handleClick($event)'
  },
  template: `
    <p
      class="paragraph-block text-sm lg:text-base text-[var(--text)] leading-relaxed my-3 select-text"
      [innerHTML]="parsedHtml()"
    ></p>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParagraphBlockComponent {
  private readonly wikiRefService = inject(WikiRefService);

  readonly text = input.required<string>();
  readonly highlightQuery = input<string>('');

  readonly parsedHtml = computed(() => {
    let html = parseInlineMarkdown(this.text());
    const query = this.highlightQuery()?.trim();
    if (query && query.length > 1) {
      const terms = query.split(/\s+/).filter((t) => t.length > 1);
      for (const term of terms) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(?![^<]*>)(${escaped})`, 'gi');
        html = html.replace(
          pattern,
          '<mark class="bg-[var(--warning-soft)] text-[var(--warning-text)] px-0.5 rounded font-semibold">$1</mark>'
        );
      }
    }
    return html;
  });

  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.wiki-ref') as HTMLAnchorElement | null;
    if (!anchor) return;

    const cmd = anchor.getAttribute('data-cmd');
    const term = anchor.getAttribute('data-term');

    if (cmd || term) {
      event.preventDefault();
      event.stopPropagation();
      const rect = anchor.getBoundingClientRect();
      const type = cmd ? 'command' : 'term';
      const id = (cmd ?? term) as string;
      this.wikiRefService.resolveRef(type, id, rect.left, rect.bottom + window.scrollY);
    }
  }
}
