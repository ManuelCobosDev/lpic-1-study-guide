import { Slide } from '../../models/slide.model';
import { Block } from '../../models/block.model';
import { Lesson } from '../../models/lesson.model';

export interface AutolinkEntry {
  id: string;
  nameOrTerm: string;
  type: 'command' | 'term';
  aliases?: string[];
  explainedIn?: string[];
  sinExplicacion?: string;
  short?: string;
  subtopicIds?: string[];
}

export interface AutolinkOptions {
  subtopicId?: string;
  slideNumber?: number;
  usedInSlide?: Set<string>;
}

export interface MatchCandidate {
  phrase: string;
  normalizedPhrase: string;
  entry: AutolinkEntry;
  isCommand: boolean;
  length: number;
}

/**
 * Elimina acentos/diacríticos y convierte a minúsculas para comparaciones insensibles.
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const IGNORED_GENERIC_NAMES = new Set([
  'comando',
  'comando1',
  'comando2',
  'comando3',
  'subcomando',
  'cmd',
  'opciones',
  'argumentos',
  'archivo',
  'fichero'
]);

/**
 * Genera candidatos de coincidencia ordenados por longitud descendente (la más larga primero).
 */
export function buildMatchCandidates(entries: AutolinkEntry[]): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];

  for (const entry of entries) {
    const isCommand = entry.type === 'command';
    const names = [entry.nameOrTerm, ...(entry.aliases || [])];

    for (const name of names) {
      if (!name || name.trim().length === 0) continue;
      const cleanName = name.trim();

      if (IGNORED_GENERIC_NAMES.has(cleanName.toLowerCase())) {
        continue;
      }

      // Candidato principal
      candidates.push({
        phrase: cleanName,
        normalizedPhrase: isCommand ? cleanName : removeAccents(cleanName),
        entry,
        isCommand,
        length: cleanName.length
      });

      // Si es un término (no comando), admitir plurales simples 's' y 'es'
      if (!isCommand && cleanName.length > 2) {
        if (!cleanName.endsWith('s')) {
          const pluralS = cleanName + 's';
          candidates.push({
            phrase: pluralS,
            normalizedPhrase: removeAccents(pluralS),
            entry,
            isCommand: false,
            length: pluralS.length
          });
          const pluralES = cleanName + 'es';
          candidates.push({
            phrase: pluralES,
            normalizedPhrase: removeAccents(pluralES),
            entry,
            isCommand: false,
            length: pluralES.length
          });
        }
      }
    }
  }

  // Ordenar por longitud descendente: la palabra más larga primero
  candidates.sort((a, b) => b.length - a.length);
  return candidates;
}

interface TextSlice {
  text: string;
  isLinked: boolean;
}

/**
 * Aplica el autoenlazado a un fragmento de texto markdown respetando todas las reglas de la Spec 13 §13.2.
 */
export function autolinkText(
  text: string,
  candidates: MatchCandidate[],
  options: AutolinkOptions = {}
): string {
  if (!text || text.trim().length === 0) return text;

  const used = options.usedInSlide || new Set<string>();
  const currentLoc = options.subtopicId && options.slideNumber
    ? `${options.subtopicId}#${options.slideNumber}`
    : undefined;

  // Segmentar el texto inicial protegiendo enlaces existentes y etiquetas HTML
  const protectedPattern = /(\[[^\]]+\]\([^)]+\)|<[^>]+>)/g;
  let slices: TextSlice[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = protectedPattern.exec(text)) !== null) {
    if (m.index > lastIdx) {
      slices.push({ text: text.substring(lastIdx, m.index), isLinked: false });
    }
    slices.push({ text: m[0], isLinked: true });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    slices.push({ text: text.substring(lastIdx), isLinked: false });
  }

  // Iterar candidatos (ordenados por longitud descendente)
  for (const cand of candidates) {
    const entryId = cand.entry.id;

    // Regla 2: Solo la primera aparición por diapositiva
    if (used.has(entryId)) continue;

    // Regla 3: No en la diapositiva que es la explainedIn principal del propio término
    const primaryExplainedIn = cand.entry.explainedIn && cand.entry.explainedIn.length > 0
      ? cand.entry.explainedIn[0]
      : undefined;
    if (currentLoc && primaryExplainedIn === currentLoc) {
      continue;
    }

    const nextSlices: TextSlice[] = [];
    let matchedInCandidate = false;

    for (const slice of slices) {
      if (slice.isLinked || matchedInCandidate) {
        nextSlices.push(slice);
        continue;
      }

      if (cand.isCommand) {
        const escaped = cand.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<=^|[^a-zA-Z0-9_-])(` + escaped + `)(?=$|[^a-zA-Z0-9_-])`, 'g');
        const matchFound = regex.exec(slice.text);

        if (matchFound && matchFound[1]) {
          const matchedStr = matchFound[1];
          const start = matchFound.index;
          const end = start + matchedStr.length;
          const isBackticked = start > 0 && slice.text[start - 1] === '`' && end < slice.text.length && slice.text[end] === '`';

          const before = isBackticked ? slice.text.substring(0, start - 1) : slice.text.substring(0, start);
          const after = isBackticked ? slice.text.substring(end + 1) : slice.text.substring(end);
          const linkText = isBackticked ? `[\`${matchedStr}\`](cmd:${entryId})` : `[${matchedStr}](cmd:${entryId})`;

          if (before) nextSlices.push({ text: before, isLinked: false });
          nextSlices.push({ text: linkText, isLinked: true });
          if (after) nextSlices.push({ text: after, isLinked: false });

          used.add(entryId);
          matchedInCandidate = true;
        } else {
          nextSlices.push(slice);
        }
      } else {
        // Término: insensible a mayúsculas y acentos
        const normSeg = removeAccents(slice.text);
        const normCand = cand.normalizedPhrase;
        const escaped = normCand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<=^|[^a-z0-9_-])(` + escaped + `)(?=$|[^a-z0-9_-])`, 'g');
        const matchFound = regex.exec(normSeg);

        if (matchFound && matchFound[1]) {
          const start = matchFound.index;
          const len = matchFound[1].length;
          const originalMatchedStr = slice.text.substring(start, start + len);

          const before = slice.text.substring(0, start);
          const after = slice.text.substring(start + len);
          const linkText = `[${originalMatchedStr}](term:${entryId})`;

          if (before) nextSlices.push({ text: before, isLinked: false });
          nextSlices.push({ text: linkText, isLinked: true });
          if (after) nextSlices.push({ text: after, isLinked: false });

          used.add(entryId);
          matchedInCandidate = true;
        } else {
          nextSlices.push(slice);
        }
      }
    }

    slices = nextSlices;
  }

  return slices.map(s => s.text).join('');
}

/**
 * Aplica el autoenlazado a todos los bloques de una diapositiva (mutación inmutable o clon).
 */
export function autolinkSlide(
  slide: Slide,
  subtopicId: string,
  candidates: MatchCandidate[]
): Slide {
  const usedInSlide = new Set<string>();
  const slideNumber = slide.slideNumber;
  const options: AutolinkOptions = { subtopicId, slideNumber, usedInSlide };

  // Copiamos los bloques clonando para pureza
  const newBlocks: Block[] = slide.blocks.map(b => {
    // Regla 3: No enlazar en bloques code y terminal
    if (b.type === 'code' || b.type === 'terminal') {
      return b;
    }

    if (b.type === 'paragraph') {
      return {
        ...b,
        text: autolinkText(b.text, candidates, options)
      };
    }

    if (b.type === 'callout') {
      return {
        ...b,
        // No enlazar en título del callout si no se desea, solo en contenido
        content: autolinkText(b.content, candidates, options)
      };
    }

    if (b.type === 'list') {
      return {
        ...b,
        items: b.items.map(item => autolinkText(item, candidates, options))
      };
    }

    if (b.type === 'table') {
      return {
        ...b,
        rows: b.rows.map(row => row.map(cell => autolinkText(cell, candidates, options)))
      };
    }

    if (b.type === 'steps') {
      return {
        ...b,
        items: b.items.map(st => ({
          ...st,
          title: autolinkText(st.title, candidates, options),
          description: autolinkText(st.description, candidates, options)
        }))
      };
    }

    return b;
  });

  return {
    ...slide,
    blocks: newBlocks
  };
}

/**
 * Puntuación según Spec 13 §13.1 para cada diapositiva que contenga el término:
 * +100 si está en el título o en un encabezado
 * +50 si aparece en negrita o en un bloque de definición
 * +30 si está en las listas keyTerms/commands de su lección
 * +10 si es la primera aparición en el subtema
 * Gana la mayor puntuación; en empate, la diapositiva más temprana.
 */
export function calculateExplainedInForEntry(
  entry: AutolinkEntry,
  lessons: Lesson[]
): string[] {
  // Si ya tiene sobrescritura manual válida, respetarla
  if (entry.explainedIn && entry.explainedIn.length > 0) {
    return entry.explainedIn;
  }

  interface SlideScore {
    subtopicId: string;
    slideNumber: number;
    score: number;
  }

  const scores: SlideScore[] = [];
  const termLower = entry.nameOrTerm.toLowerCase();
  const termNorm = removeAccents(entry.nameOrTerm);

  for (const lesson of lessons) {
    let firstInSubtopicSeen = false;
    const isDeclaredInLesson =
      (lesson.commands && lesson.commands.some(c => c.toLowerCase() === termLower)) ||
      (lesson.keyTerms && lesson.keyTerms.some(t => removeAccents(t).includes(termNorm))) ||
      (entry.subtopicIds && entry.subtopicIds.includes(lesson.id));

    lesson.slides.forEach((slide, sIdx) => {
      const slideNum = sIdx + 1;
      let slideScore = 0;
      let termAppearedInSlide = false;

      // Comprobar título de diapositiva (+100)
      if (slide.title && removeAccents(slide.title).includes(termNorm)) {
        slideScore += 100;
        termAppearedInSlide = true;
      }

      for (const block of slide.blocks) {
        // Encabezados (+100)
        if (block.type === 'heading' && removeAccents(block.text).includes(termNorm)) {
          slideScore += 100;
          termAppearedInSlide = true;
        }

        // Negrita o definición (+50)
        if (block.type === 'paragraph') {
          if (block.text.includes(`**${entry.nameOrTerm}**`) || removeAccents(block.text).includes(`**${termNorm}**`)) {
            slideScore += 50;
          }
          if (removeAccents(block.text).includes(termNorm)) {
            termAppearedInSlide = true;
          }
        }

        if (block.type === 'callout') {
          if (removeAccents(block.title || '').includes(termNorm) || removeAccents(block.content).includes(termNorm)) {
            slideScore += 50;
            termAppearedInSlide = true;
          }
        }

        if (block.type === 'html') {
          if (removeAccents(block.sanitizedHtml).includes(termNorm)) {
            termAppearedInSlide = true;
          }
        }

        if (block.type === 'table') {
          if (block.rows.some(r => r.some(c => removeAccents(c).includes(termNorm)))) {
            termAppearedInSlide = true;
          }
        }

        if (block.type === 'steps') {
          if (block.items.some(st => removeAccents(st.title).includes(termNorm) || removeAccents(st.description).includes(termNorm))) {
            termAppearedInSlide = true;
          }
        }

        if (block.type === 'code') {
          if (entry.type === 'command' && block.code.includes(entry.nameOrTerm)) {
            termAppearedInSlide = true;
          }
        } else if (block.type === 'terminal') {
          const termText = block.lines.map(l => l.command || '').join('\n');
          if (entry.type === 'command' && termText.includes(entry.nameOrTerm)) {
            termAppearedInSlide = true;
          }
        }
      }

      if (termAppearedInSlide) {
        if (isDeclaredInLesson) {
          slideScore += 30;
        }
        if (!firstInSubtopicSeen) {
          slideScore += 10;
          firstInSubtopicSeen = true;
        }

        scores.push({
          subtopicId: lesson.id,
          slideNumber: slideNum,
          score: slideScore
        });
      }
    });
  }

  if (scores.length === 0) {
    return [];
  }

  // Ordenar por score descendente; en empate, subtema menor y slide menor
  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.subtopicId !== b.subtopicId) return a.subtopicId.localeCompare(b.subtopicId);
    return a.slideNumber - b.slideNumber;
  });

  // Tomar hasta 3 ubicaciones únicas
  const locations: string[] = [];
  for (const s of scores) {
    const loc = `${s.subtopicId}#${s.slideNumber}`;
    if (!locations.includes(loc)) {
      locations.push(loc);
      if (locations.length >= 3) break;
    }
  }

  return locations;
}

export interface ExplainedInValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valida según Spec 13 §13.1 y §13.7 (criterio 5):
 * 1. La diapositiva indicada en explainedIn debe existir y contener realmente el término.
 * 2. Si un término/comando no tiene ubicación y no lleva sinExplicacion, es un error.
 */
export function validateExplainedIn(
  entries: AutolinkEntry[],
  lessons: Lesson[]
): ExplainedInValidationResult {
  const errors: string[] = [];
  const lessonMap = new Map<string, Lesson>();
  for (const l of lessons) {
    lessonMap.set(l.id, l);
  }

  for (const entry of entries) {
    // Si no tiene explainedIn
    if (!entry.explainedIn || entry.explainedIn.length === 0) {
      if (!entry.sinExplicacion || !entry.sinExplicacion.trim()) {
        errors.push(`El término/comando "${entry.nameOrTerm}" (${entry.id}) no tiene ubicación en explainedIn ni motivo en sinExplicacion.`);
      }
      continue;
    }

    // Si tiene explainedIn, validar cada ubicación
    for (const loc of entry.explainedIn) {
      const match = loc.match(/^(\d{3}\.\d)#(\d+)$/);
      if (!match || !match[1] || !match[2]) {
        errors.push(`El término/comando "${entry.nameOrTerm}" tiene una ubicación con formato inválido: "${loc}". Debe ser "<subtema>#<diapositiva>".`);
        continue;
      }

      const subtopicId = match[1];
      const slideNum = parseInt(match[2], 10);
      const lesson = lessonMap.get(subtopicId);

      if (!lesson) {
        errors.push(`El término/comando "${entry.nameOrTerm}" referencia el subtema inexistente "${subtopicId}" en "${loc}".`);
        continue;
      }

      const slide = lesson.slides.find((s, idx) => (s.slideNumber || (idx + 1)) === slideNum);
      if (!slide) {
        errors.push(`El término/comando "${entry.nameOrTerm}" referencia la diapositiva inexistente ${slideNum} del subtema "${subtopicId}".`);
        continue;
      }

      // Comprobar que la diapositiva contiene realmente el término
      const termNorm = removeAccents(entry.nameOrTerm);
      let found = false;

      if (slide.title && removeAccents(slide.title).includes(termNorm)) {
        found = true;
      }

      if (!found) {
        for (const block of slide.blocks) {
          if (block.type === 'heading' && removeAccents(block.text).includes(termNorm)) {
            found = true;
            break;
          }
          if (block.type === 'paragraph' && removeAccents(block.text).includes(termNorm)) {
            found = true;
            break;
          }
          if (block.type === 'callout' && (removeAccents(block.title || '').includes(termNorm) || removeAccents(block.content).includes(termNorm))) {
            found = true;
            break;
          }
          if (block.type === 'html' && removeAccents(block.sanitizedHtml).includes(termNorm)) {
            found = true;
            break;
          }
          if (block.type === 'table' && block.rows.some(r => r.some(c => removeAccents(c).includes(termNorm)))) {
            found = true;
            break;
          }
          if (block.type === 'steps' && block.items.some(st => removeAccents(st.title).includes(termNorm) || removeAccents(st.description).includes(termNorm))) {
            found = true;
            break;
          }
          if (block.type === 'list' && block.items.some(i => removeAccents(i).includes(termNorm))) {
            found = true;
            break;
          }
          if (block.type === 'code' && entry.type === 'command' && block.code.includes(entry.nameOrTerm)) {
            found = true;
            break;
          }
          if (block.type === 'terminal' && entry.type === 'command' && block.lines.some(l => (l.command || '').includes(entry.nameOrTerm))) {
            found = true;
            break;
          }
        }
      }

      if (!found) {
        errors.push(`La diapositiva indicada en "${loc}" no contiene realmente el término o comando "${entry.nameOrTerm}".`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

