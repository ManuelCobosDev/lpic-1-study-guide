import DOMPurify from 'dompurify';

/**
 * Sanitiza contenido HTML crudo eliminando scripts maliciosos,
 * eventos inline (onload, onerror) y etiquetas peligrosas.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  // DOMPurify tanto en navegador como en entorno con window
  if (typeof window !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'b', 'strong', 'i', 'em', 'u', 'code', 'pre', 'a', 'span',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'mark', 'kbd',
        'div', 'hr', 'br', 'img'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'class', 'id', 'data-cmd', 'data-term', 'data-term-ref',
        'tabindex', 'src', 'alt', 'title', 'aria-label', 'role'
      ]
    });
  }

  // Fallback seguro si no hay DOMPurify activo en entorno Node básico
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '');
}

/**
 * Parsea markdown en línea para párrafos y títulos, soportando:
 * - Enlaces a comandos estilo Wikipedia: [texto](cmd:comando)
 * - Enlaces a glosario estilo Wikipedia: [texto](term:termino)
 * - Enlaces normales: [texto](https://...)
 * - Negrita: **texto**
 * - Cursiva: *texto*
 * - Código en línea: `codigo`
 * y sanitiza el resultado final.
 */
export function parseInlineMarkdown(text: string): string {
  if (!text) return '';

  // 1. Enlaces estilo Wikipedia a comandos: [texto](cmd:tee)
  let html = text.replace(/\[([^\]]+)\]\(cmd:([a-zA-Z0-9_.-]+)\)/g, (_match, label, cmd) => {
    return `<a href="/comandos" data-term-ref="cmd:${cmd}" data-cmd="${cmd}" class="term-link wiki-ref wiki-cmd-link inline-flex items-center gap-1 font-mono font-semibold text-[var(--primary-text)] border-b border-dotted border-[var(--primary-text)] hover:opacity-80 cursor-pointer" title="Comando: ${cmd}" role="button" tabindex="0"><span aria-hidden="true">💻</span>${label}</a>`;
  });

  // 2. Enlaces estilo Wikipedia a términos del glosario: [texto](term:stdout)
  html = html.replace(/\[([^\]]+)\]\(term:([a-zA-Z0-9_.-]+)\)/g, (_match, label, term) => {
    return `<a href="/glosario" data-term-ref="term:${term}" data-term="${term}" class="term-link wiki-ref wiki-term-link inline-flex items-center gap-1 font-semibold text-[var(--info-text)] border-b border-dotted border-[var(--info-text)] hover:opacity-80 cursor-pointer" title="Término: ${term}" role="button" tabindex="0"><span aria-hidden="true">📖</span>${label}</a>`;
  });

  // 3. Enlaces web normales [texto](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    return `<a href="${url}" class="text-[var(--primary-text)] underline hover:opacity-80" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // 4. Negrita **texto**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 5. Cursiva *texto*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 6. Código inline `codigo`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text)] border border-[var(--border)] font-mono text-[0.9em]">$1</code>'
  );

  return sanitizeHtml(html);
}

