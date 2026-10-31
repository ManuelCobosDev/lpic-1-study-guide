import { describe, expect, it } from 'vitest';
import { parseInlineMarkdown, sanitizeHtml } from './markdown.engine';

describe('MarkdownEngine (Sanitización y Parser Inline)', () => {
  it('el HTML con <script> se sanitiza eliminando código malicioso (Gate 5)', () => {
    const maliciousHtml = '<p>Texto seguro</p><script>alert("XSS vulnerable")</script>';
    const cleaned = sanitizeHtml(maliciousHtml);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert');
    expect(cleaned).toContain('Texto seguro');
  });

  it('elimina atributos con manejadores de eventos como onerror y onclick', () => {
    const maliciousAttr = '<img src="invalido.jpg" onerror="alert(1)" alt="Prueba">';
    const cleaned = sanitizeHtml(maliciousAttr);

    expect(cleaned).not.toContain('onerror');
    expect(cleaned).not.toContain('alert(1)');
  });

  it('parsea correctamente negritas, cursivas y código en línea', () => {
    const raw = 'Comando **ls** con opción *recursiva* y ruta `/etc`';
    const parsed = parseInlineMarkdown(raw);

    expect(parsed).toContain('<strong>ls</strong>');
    expect(parsed).toContain('<em>recursiva</em>');
    expect(parsed).toContain('<code');
    expect(parsed).toContain('/etc</code>');
  });

  it('convierte enlaces a comandos cmd:id en enlaces interactivos estilo Wikipedia', () => {
    const raw = 'Usamos [tee](cmd:tee) para duplicar la salida';
    const parsed = parseInlineMarkdown(raw);

    expect(parsed).toContain('data-cmd="tee"');
    expect(parsed).toContain('wiki-cmd-link');
    expect(parsed).toContain('href="/comandos"');
    expect(parsed).toContain('tee');
  });

  it('convierte enlaces a términos term:id en enlaces interactivos estilo Wikipedia', () => {
    const raw = 'El flujo estándar [stdout](term:stdout) transporta la salida normal';
    const parsed = parseInlineMarkdown(raw);

    expect(parsed).toContain('data-term="stdout"');
    expect(parsed).toContain('wiki-term-link');
    expect(parsed).toContain('href="/glosario"');
    expect(parsed).toContain('stdout');
  });
});
