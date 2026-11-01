import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { parseInlineMarkdown } from '../../core/engines/markdown/markdown.engine';
import { WikiRefService } from '../../core/services/wiki-ref.service';

@Component({
  selector: 'app-paragraph-block',
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly text = input.required<string>();
  readonly highlightQuery = input<string>('');

  readonly parsedHtml = computed<SafeHtml>(() => {
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
    return this.sanitizer.bypassSecurityTrustHtml(html);
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
