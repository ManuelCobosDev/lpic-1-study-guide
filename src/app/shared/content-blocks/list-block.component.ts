import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { parseInlineMarkdown } from '../../core/engines/markdown/markdown.engine';
import { WikiRefService } from '../../core/services/wiki-ref.service';

@Component({
  selector: 'app-list-block',
  standalone: true,
  imports: [CommonModule],
  host: {
    '(click)': 'handleClick($event)',
    '(mouseover)': 'handleMouseOver($event)',
    '(mouseout)': 'handleMouseOut($event)',
    '(focusin)': 'handleFocusIn($event)',
    '(focusout)': 'handleFocusOut($event)'
  },
  template: `
    @if (ordered()) {
      <ol class="list-decimal pl-5 my-3 space-y-1 text-sm sm:text-base text-[var(--text)] leading-relaxed select-text">
        @for (itemHtml of parsedItems(); track $index) {
          <li [innerHTML]="itemHtml"></li>
        }
      </ol>
    } @else {
      <ul class="list-disc pl-5 my-3 space-y-1 text-sm sm:text-base text-[var(--text)] leading-relaxed select-text">
        @for (itemHtml of parsedItems(); track $index) {
          <li [innerHTML]="itemHtml"></li>
        }
      </ul>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListBlockComponent {
  private readonly wikiRefService = inject(WikiRefService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly items = input.required<string[]>();
  readonly ordered = input<boolean>(false);
  readonly highlightQuery = input<string>('');

  readonly parsedItems = computed<SafeHtml[]>(() => {
    const rawItems = this.items() ?? [];
    const query = this.highlightQuery()?.trim();

    return rawItems.map((item) => {
      let html = parseInlineMarkdown(item);
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
      return this.sanitizer.bypassSecurityTrustHtml(html);
    });
  });

  handleMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      const related = event.relatedTarget as Node | null;
      if (related && anchor.contains(related)) {
        return;
      }
      this.wikiRefService.onTargetEnter(anchor);
    }
  }

  handleMouseOut(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      const related = event.relatedTarget as Node | null;
      if (related && anchor.contains(related)) {
        return;
      }
      this.wikiRefService.onTargetLeave();
    }
  }

  handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      this.wikiRefService.openImmediately(anchor);
    }
  }

  handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (anchor) {
      this.wikiRefService.onTargetLeave();
    }
  }

  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.term-link, a.wiki-ref, [data-term-ref]') as HTMLElement | null;
    if (!anchor) return;

    const cmd = anchor.getAttribute('data-cmd');
    const term = anchor.getAttribute('data-term');
    const termRef = anchor.getAttribute('data-term-ref');

    if (cmd || term || termRef) {
      const rect = anchor.getBoundingClientRect();
      let type: 'command' | 'term' = cmd ? 'command' : 'term';
      let id = cmd || term || '';
      if (termRef) {
        if (termRef.startsWith('cmd:')) {
          type = 'command';
          id = termRef.substring(4);
        } else if (termRef.startsWith('term:')) {
          type = 'term';
          id = termRef.substring(5);
        }
      }
      this.wikiRefService.resolveRef(type, id, rect.left, rect.bottom + window.scrollY);
    }
  }
}

