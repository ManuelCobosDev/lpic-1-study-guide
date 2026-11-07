import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-html-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="html-block-wrapper my-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text)] transition-colors shadow-xs"
      [innerHTML]="sanitizedContent()"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .html-block-wrapper :deep(code) {
      font-family: var(--font-mono);
      background: var(--surface-code);
      color: var(--text-code);
      padding: 0.15em 0.35em;
      border-radius: var(--radius-xs);
      font-size: 0.9em;
    }
    .html-block-wrapper :deep(a) {
      color: var(--primary-text);
      text-decoration: underline;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HtmlBlockComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = input.required<string>();

  readonly sanitizedContent = computed<SafeHtml>(() => {
    const raw = this.html() ?? '';
    if (!raw.trim()) return '';

    let clean = raw;
    if (typeof window !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
      clean = DOMPurify.sanitize(raw, {
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'b', 'strong', 'i', 'em', 'u', 'code', 'pre',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table',
          'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'mark', 'kbd',
          'hr', 'br', 'svg', 'path', 'circle', 'rect', 'line', 'g', 'text'
        ],
        ALLOWED_ATTR: [
          'style', 'class', 'id', 'role', 'tabindex', 'aria-label', 'aria-hidden',
          'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width',
          'stroke-linecap', 'stroke-linejoin', 'd', 'rx', 'ry', 'cx', 'cy', 'r',
          'x', 'y', 'x1', 'y1', 'x2', 'y2'
        ]
      });
    }

    return this.sanitizer.bypassSecurityTrustHtml(clean);
  });
}

