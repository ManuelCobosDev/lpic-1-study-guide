import MiniSearch from 'minisearch';
import {
  SearchDocument,
  SearchResultItem,
  SearchOptions,
  SearchIndexSource
} from '../../models/search.model';

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function highlightTextSnippet(
  text: string,
  query: string,
  maxLength = 120
): string {
  if (!text) return '';
  const cleanQuery = normalizeSearchText(query.trim());
  if (!cleanQuery) {
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  const terms = cleanQuery
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) {
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  const normText = normalizeSearchText(text);

  // Buscar la primera aparición de cualquiera de los términos en el texto normalizado
  let firstIndex = -1;

  for (const term of terms) {
    const idx = normText.indexOf(term);
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
      firstIndex = idx;
    }
  }

  let start = 0;
  let end = text.length;

  if (firstIndex !== -1 && text.length > maxLength) {
    const half = Math.floor(maxLength / 2);
    start = Math.max(0, firstIndex - half);
    end = Math.min(text.length, start + maxLength);
    if (end - start < maxLength && start > 0) {
      start = Math.max(0, end - maxLength);
    }
  } else if (text.length > maxLength) {
    end = maxLength;
  }

  let snippet = text.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';

  // Resaltar con <mark> preservando mayúsculas/minúsculas del texto original
  for (const term of terms) {
    // Regex segura para escapar caracteres especiales de regex
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Para respetar acentos en el original, construimos un patrón flexible de caracteres
    const pattern = createAccentInsensitiveRegex(escaped);
    snippet = snippet.replace(pattern, (match) => `<mark>${match}</mark>`);
  }

  return snippet;
}

function createAccentInsensitiveRegex(term: string): RegExp {
  const accentMap: Record<string, string> = {
    a: '[aáàäâã]',
    e: '[eéèëê]',
    i: '[iíìïî]',
    o: '[oóòöôõ]',
    u: '[uúùüû]',
    c: '[cç]',
    n: '[nñ]'
  };

  let patternStr = '';
  for (const char of term.toLowerCase()) {
    patternStr += accentMap[char] ?? char;
  }

  return new RegExp(patternStr, 'gi');
}

export class SearchEngine {
  private miniSearch: MiniSearch<SearchDocument>;
  private documentsMap = new Map<string, SearchDocument>();

  constructor() {
    this.miniSearch = new MiniSearch<SearchDocument>({
      fields: ['code', 'title', 'headings', 'body', 'codeSnippets', 'tags'],
      storeFields: [
        'id',
        'type',
        'title',
        'url',
        'breadcrumb',
        'body',
        'subtopicId',
        'topicId',
        'examId',
        'slideNumber'
      ],
      processTerm: (term) => {
        const norm = normalizeSearchText(term);
        // Descomponer posibles rutas y comandos como "/etc/fstab" -> "etc", "fstab"
        if (norm.includes('/') || norm.includes('.')) {
          const parts = norm.split(/[/.]+/).filter((p) => p.length > 1);
          return [norm, ...parts];
        }
        return norm;
      },
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: {
          code: 10,
          title: 6,
          headings: 3,
          codeSnippets: 2,
          tags: 2,
          body: 1
        }
      }
    });
  }

  /**
   * Construye el índice de documentos a partir de la fuente proporcionada.
   * IMPORTANTE: No indexa preguntas del simulador (requisito estricto de Gate 6).
   */
  indexAll(source: SearchIndexSource): void {
    this.miniSearch.removeAll();
    this.documentsMap.clear();

    const docs: SearchDocument[] = [];

    // 1. Subtemas
    for (const sub of source.subtopics) {
      const doc: SearchDocument = {
        id: `curriculum:${sub.id}`,
        type: 'curriculum',
        title: `${sub.id} · ${sub.title}`,
        code: sub.id,
        subtopicId: sub.id,
        topicId: sub.topicId,
        examId: sub.examId ?? (sub.topicId.startsWith('10') && parseInt(sub.topicId, 10) <= 104 ? '101' : '102'),
        url: `/estudiar/${sub.id}`,
        breadcrumb: `Tema ${sub.topicId} › Subtema ${sub.id}`,
        body: (sub.objectives ?? []).join('. ') + ' ' + (sub.keyTerms ?? []).join(' '),
        tags: (sub.commands ?? []).join(' ')
      };
      docs.push(doc);
    }

    // 2. Diapositivas
    for (const slide of source.slides) {
      const doc: SearchDocument = {
        id: `slide:${slide.subtopicId}:${slide.slideNumber}`,
        type: 'slide',
        title: slide.title,
        subtopicId: slide.subtopicId,
        topicId: slide.topicId,
        examId: slide.examId ?? (slide.topicId.startsWith('10') && parseInt(slide.topicId, 10) <= 104 ? '101' : '102'),
        slideNumber: slide.slideNumber,
        url: `/estudiar/${slide.subtopicId}?slide=${slide.slideNumber}`,
        breadcrumb: `Tema ${slide.topicId} › ${slide.subtopicId} › Diapositiva ${slide.slideNumber}`,
        headings: slide.headings.join(' '),
        body: slide.text + (slide.notes ? ` (Notas: ${slide.notes})` : ''),
        codeSnippets: slide.code.join(' ')
      };
      docs.push(doc);
    }

    // 3. Comandos
    for (const cmd of source.commands) {
      const doc: SearchDocument = {
        id: `cmd:${cmd.name}`,
        type: 'command',
        title: cmd.name,
        code: cmd.name,
        subtopicId: cmd.subtopicId,
        url: `/comandos?q=${encodeURIComponent(cmd.name)}`,
        breadcrumb: cmd.subtopicId ? `Comandos › Subtema ${cmd.subtopicId}` : 'Catálogo de Comandos',
        body: cmd.summary + (cmd.description ? ` ${cmd.description}` : ''),
        tags: (cmd.flags ?? []).join(' ')
      };
      docs.push(doc);
    }

    // 4. Glosario
    for (const term of source.terms) {
      const doc: SearchDocument = {
        id: `term:${term.term}`,
        type: 'term',
        title: term.term,
        subtopicId: term.subtopicId,
        url: `/glosario?q=${encodeURIComponent(term.term)}`,
        breadcrumb: term.subtopicId ? `Glosario › Subtema ${term.subtopicId}` : 'Glosario de Términos',
        body: term.definition
      };
      docs.push(doc);
    }

    // 5. Laboratorios y Prácticas
    if (source.labs) {
      for (const lab of source.labs) {
        const doc: SearchDocument = {
          id: `lab:${lab.id}`,
          type: 'lab',
          title: `Laboratorio: ${lab.title}`,
          subtopicId: lab.subtopicId,
          url: `/laboratorios/${lab.id}`,
          breadcrumb: `Laboratorios › Práctica ${lab.subtopicId}`,
          body: lab.summary ?? '',
          tags: (lab.commands ?? []).join(' ')
        };
        docs.push(doc);
      }
    }

    // 6. Erratas
    if (source.errata) {
      for (const err of source.errata) {
        const doc: SearchDocument = {
          id: `errata:${err.id}`,
          type: 'errata',
          title: `Fe de erratas: ${err.title}`,
          url: '/erratas',
          breadcrumb: 'Fe de Erratas Oficial',
          body: err.description
        };
        docs.push(doc);
      }
    }

    // 7. Páginas de la aplicación
    if (source.pages) {
      for (const pg of source.pages) {
        const doc: SearchDocument = {
          id: `page:${pg.id}`,
          type: 'page',
          title: pg.title,
          url: pg.url,
          breadcrumb: 'Navegación de la Aplicación',
          body: pg.description
        };
        docs.push(doc);
      }
    }

    docs.forEach((d) => this.documentsMap.set(d.id, d));
    this.miniSearch.addAll(docs);
  }

  /**
   * Realiza una búsqueda devolviendo los resultados ordenados y con snippets resaltados.
   */
  search(query: string, options?: SearchOptions): SearchResultItem[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const normalizedQuery = normalizeSearchText(trimmed);

    // 1. Detección de coincidencia exacta con código de subtema (ej. "103.4") o comando (ej. "grep")
    const exactSubtopic = this.findExactCodeMatch(trimmed, normalizedQuery);

    // 2. Búsqueda con MiniSearch
    const searchFilter = options?.filter && options.filter !== 'all' ? options.filter : undefined;

    const miniResults = this.miniSearch.search(trimmed, {
      filter: searchFilter ? (doc) => doc['type'] === searchFilter : undefined
    });

    const results: SearchResultItem[] = [];

    // Si hubo coincidencia exacta de subtema y no está filtrado en contra, añadirlo en primera posición
    if (exactSubtopic && (!searchFilter || exactSubtopic.type === searchFilter)) {
      results.push({
        id: exactSubtopic.id,
        type: exactSubtopic.type,
        title: exactSubtopic.title,
        url: exactSubtopic.url,
        breadcrumb: exactSubtopic.breadcrumb,
        snippet: highlightTextSnippet(exactSubtopic.body, trimmed),
        score: 1000,
        exactMatch: true
      });
    }

    for (const r of miniResults) {
      if (exactSubtopic && r.id === exactSubtopic.id) {
        continue; // Ya añadido arriba como match exacto
      }

      const originalDoc = this.documentsMap.get(r.id);
      if (!originalDoc) continue;

      // Generar snippet a partir del texto más representativo
      const fullText = [
        originalDoc.title,
        originalDoc.headings,
        originalDoc.body,
        originalDoc.codeSnippets,
        originalDoc.tags
      ]
        .filter(Boolean)
        .join(' ');

      const snippet = highlightTextSnippet(fullText, trimmed, 130);

      results.push({
        id: originalDoc.id,
        type: originalDoc.type,
        title: originalDoc.title,
        url: originalDoc.url,
        breadcrumb: originalDoc.breadcrumb,
        snippet,
        score: r.score
      });
    }

    const limit = options?.limit ?? 50;
    return results.slice(0, limit);
  }

  private findExactCodeMatch(rawQuery: string, normalizedQuery: string): SearchDocument | null {
    // Buscar si es un código de subtema directo como "103.4"
    for (const doc of this.documentsMap.values()) {
      if (doc.type === 'curriculum' && doc.code && (doc.code === rawQuery || doc.code === normalizedQuery)) {
        return doc;
      }
    }

    // Buscar si es un comando exacto como "grep" o "tee"
    for (const doc of this.documentsMap.values()) {
      if (doc.type === 'command' && doc.code && (doc.code === rawQuery || doc.code === normalizedQuery)) {
        return doc;
      }
    }

    return null;
  }
}
