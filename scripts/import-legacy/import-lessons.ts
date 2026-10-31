import * as fs from 'node:fs';
import * as path from 'node:path';
import { LessonSchema } from '../../src/app/core/schemas/index';
import { Lesson, Slide, Block } from '../../src/app/core/models/index';

interface LegacySlidePoint {
  icon?: string;
  text: string;
  detail?: string;
}

interface LegacySlideOption {
  flag?: string;
  short?: string;
  desc?: string;
}

interface LegacySlideTerminal {
  command?: string;
  output?: string;
}

interface LegacySlideFile {
  path?: string;
  purpose?: string;
  content?: string;
}

interface LegacySlide {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  lead?: string;
  points?: LegacySlidePoint[];
  remember?: string;
  notes?: string;
  command?: string;
  purpose?: string;
  terminal?: LegacySlideTerminal;
  file?: LegacySlideFile;
  options?: LegacySlideOption[] | string[];
  diagram_html?: string;
  headers?: string[];
  rows?: string[][];
  scenario?: string;
  hint?: string;
  solution?: string | { explain?: string };
  steps?: unknown[];
  q?: string;
  answer?: number;
  why?: string;
  deck?: { front: string; back: string }[];
}

interface LegacyMeta {
  topic: string;
  title: string;
  weight: number;
  description: string;
  duracion?: string;
}

interface LegacyGlossaryEntry {
  term: string;
  definition: string;
}

interface LegacyContentFile {
  META: LegacyMeta;
  GLOSARIO?: LegacyGlossaryEntry[];
  SLIDES: LegacySlide[];
}

export const ALL_SUBTOPIC_IDS: string[] = [
  // Examen 101
  '101.1', '101.2', '101.3',
  '102.1', '102.2', '102.3', '102.4', '102.5', '102.6',
  '103.1', '103.2', '103.3', '103.4', '103.5', '103.6', '103.7', '103.8',
  '104.1', '104.2', '104.3', '104.5', '104.6', '104.7',
  // Examen 102
  '105.1', '105.2',
  '106.1', '106.2', '106.3',
  '107.1', '107.2', '107.3',
  '108.1', '108.2', '108.3', '108.4',
  '109.1', '109.2', '109.3', '109.4',
  '110.1', '110.2', '110.3'
];

function parseDuracion(duracion?: string): number {
  if (!duracion) return 30;
  const match = duracion.match(/(\d+)/);
  return match ? parseInt(match[1] ?? '30', 10) : 30;
}

function convertSlide(leg: LegacySlide, subtopicId: string, index: number): Slide {
  const slideNum = typeof leg.id === 'number' ? leg.id : (parseInt(String(leg.id), 10) || (index + 1));
  const blocks: Block[] = [];

  // Heading
  blocks.push({
    type: 'heading',
    level: leg.type === 'cover' ? 1 : 2,
    text: leg.title
  });

  // Subtitle
  if (leg.subtitle) {
    blocks.push({
      type: 'paragraph',
      text: leg.subtitle
    });
  }

  // Lead
  if (leg.lead) {
    blocks.push({
      type: 'paragraph',
      text: leg.lead
    });
  }

  // Points list
  if (leg.points && leg.points.length > 0) {
    const items = leg.points.map(p => {
      const detailStr = p.detail ? ` — ${p.detail}` : '';
      return `**${p.text}**${detailStr}`;
    });
    blocks.push({
      type: 'list',
      ordered: false,
      items
    });
  }

  // Command & Purpose
  if (leg.command) {
    const codeStr = Array.isArray(leg.command) ? leg.command.join('\n') : String(leg.command);
    blocks.push({
      type: 'code',
      language: 'bash',
      code: codeStr,
      title: leg.purpose ?? 'Sintaxis del comando'
    });
  }

  // File
  if (leg.file && (leg.file.path || leg.file.content)) {
    const fileContent = Array.isArray(leg.file.content)
      ? leg.file.content.join('\n')
      : String(leg.file.content ?? '');
    blocks.push({
      type: 'code',
      language: 'bash',
      code: fileContent,
      title: leg.file.path ?? leg.file.purpose ?? 'Archivo de configuración'
    });
  }

  // Terminal
  if (leg.terminal && (leg.terminal.command || leg.terminal.output)) {
    const termOutput = Array.isArray(leg.terminal.output)
      ? leg.terminal.output.join('\n')
      : String(leg.terminal.output ?? '');
    const termCommand = Array.isArray(leg.terminal.command)
      ? leg.terminal.command.join('\n')
      : String(leg.terminal.command ?? '');
    blocks.push({
      type: 'terminal',
      lines: [
        {
          prompt: '$ ',
          command: termCommand,
          output: termOutput
        }
      ]
    });
  }

  // Table or Matrix
  if ((leg.type === 'table' || leg.type === 'matrix') && leg.headers && leg.rows) {
    blocks.push({
      type: 'table',
      headers: leg.headers,
      rows: leg.rows,
      caption: leg.title
    });
  }

  // Challenge
  if (leg.type === 'challenge') {
    if (leg.scenario) {
      blocks.push({
        type: 'callout',
        calloutType: 'warning',
        title: 'Escenario del Desafío',
        content: leg.scenario
      });
    }
    if (leg.hint) {
      blocks.push({
        type: 'callout',
        calloutType: 'tip',
        title: 'Pista',
        content: leg.hint
      });
    }
    if (leg.solution) {
      if (typeof leg.solution === 'string') {
        blocks.push({
          type: 'code',
          language: 'bash',
          code: leg.solution,
          title: 'Solución del desafío'
        });
      } else if (Array.isArray(leg.solution)) {
        blocks.push({
          type: 'code',
          language: 'bash',
          code: leg.solution.join('\n'),
          title: 'Solución del desafío'
        });
      } else if (typeof leg.solution === 'object' && leg.solution !== null) {
        const solObj = leg.solution as { explain?: string };
        blocks.push({
          type: 'callout',
          calloutType: 'tip',
          title: 'Solución y Explicación del Desafío',
          content: solObj.explain ?? JSON.stringify(leg.solution)
        });
      }
    }
  }

  // Exercise
  if (leg.type === 'exercise') {
    if (leg.steps && Array.isArray(leg.steps)) {
      const stepItems: string[] = leg.steps.map((st: unknown) => {
        if (typeof st === 'string') return st;
        if (typeof st === 'object' && st !== null) {
          const stObj = st as { action?: string; command?: string; reason?: string };
          const act = stObj.action ?? '';
          const cmd = stObj.command ? ` — Comando: \`${stObj.command}\`` : '';
          const rsn = stObj.reason ? ` (${stObj.reason})` : '';
          return `${act}${cmd}${rsn}`;
        }
        return String(st);
      });
      blocks.push({
        type: 'list',
        ordered: true,
        items: stepItems
      });
    }
    if (leg.solution) {
      if (typeof leg.solution === 'string') {
        blocks.push({
          type: 'code',
          language: 'bash',
          code: leg.solution,
          title: 'Solución del ejercicio'
        });
      } else if (typeof leg.solution === 'object' && leg.solution !== null) {
        const solObj = leg.solution as { explain?: string };
        blocks.push({
          type: 'callout',
          calloutType: 'tip',
          title: 'Solución y Explicación del Ejercicio',
          content: solObj.explain ?? JSON.stringify(leg.solution)
        });
      }
    }
  }

  // Review / inline quiz
  if (leg.type === 'review' && leg.q && Array.isArray(leg.options)) {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
    const ansIdx = typeof leg.answer === 'number' ? leg.answer : 0;
    blocks.push({
      type: 'quiz-inline',
      id: `quiz-${subtopicId.replace('.', '-')}-${leg.id}`,
      question: leg.q,
      options: leg.options.map((opt, idx) => ({
        key: letters[idx] ?? `opt-${idx}`,
        text: String(opt)
      })),
      correct: [letters[ansIdx] ?? 'a'],
      explanation: leg.why ?? 'Explicación del examen LPIC-1.'
    });
  } else if (leg.options && Array.isArray(leg.options) && leg.options.length > 0) {
    const isObjectList = typeof leg.options[0] === 'object' && leg.options[0] !== null;
    if (isObjectList) {
      blocks.push({
        type: 'table',
        headers: ['Opción / Bandera', 'Nombre', 'Descripción'],
        rows: (leg.options as LegacySlideOption[]).map(opt => [opt.flag ?? '', opt.short ?? '', opt.desc ?? '']),
        caption: 'Opciones y parámetros del comando'
      });
    } else {
      blocks.push({
        type: 'list',
        ordered: false,
        items: leg.options.map(String)
      });
    }
  }

  // Diagram HTML
  if (leg.diagram_html) {
    if (subtopicId === '103.4' && (leg.id === 2 || index === 1)) {
      blocks.push({
        type: 'diagram',
        kind: 'streams',
        title: 'Flujos Estándar y Descriptores de Archivo (0, 1, 2)',
        caption: 'Mapeo de los tres descriptores estándar de un proceso Linux',
        alt: 'Diagrama de los canales estándar de un proceso Linux: stdin descriptor 0 para entrada, stdout descriptor 1 para salida estándar y stderr descriptor 2 para errores.',
        spec: {
          nodes: [
            {
              id: 'stdin',
              label: '0: stdin',
              sublabel: 'Entrada estándar',
              tone: 'neutral',
              badge: '0'
            },
            {
              id: 'proc',
              label: 'Proceso Linux',
              sublabel: 'grep / awk / sed',
              tone: 'primary',
              shape: 'box'
            },
            {
              id: 'stdout',
              label: '1: stdout',
              sublabel: 'Salida normal (>)',
              tone: 'success',
              badge: '1'
            },
            {
              id: 'stderr',
              label: '2: stderr',
              sublabel: 'Errores (2>)',
              tone: 'danger',
              badge: '2'
            }
          ],
          edges: [
            {
              from: 'stdin',
              to: 'proc',
              label: 'Canal 0 (<)'
            },
            {
              from: 'proc',
              to: 'stdout',
              label: 'Canal 1 (>)',
              tone: 'success'
            },
            {
              from: 'proc',
              to: 'stderr',
              label: 'Canal 2 (2>)',
              tone: 'danger'
            }
          ]
        }
      });
    } else {
      blocks.push({
        type: 'html',
        sanitizedHtml: leg.diagram_html
      });
    }
  }

  // Flashcards deck
  if (leg.type === 'flashcards' && Array.isArray(leg.deck)) {
    blocks.push({
      type: 'table',
      headers: ['Concepto', 'Significado / Uso'],
      rows: leg.deck.map((card: { front: string; back: string }) => [card.front, card.back]),
      caption: 'Tarjetas de memorización'
    });
  }

  // Remember / Exam tip
  if (leg.remember) {
    blocks.push({
      type: 'callout',
      calloutType: 'exam',
      title: 'Clave de Examen LPIC-1',
      content: leg.remember
    });
  }

  // Layout selection
  let layout: Slide['layout'] = 'content';
  if (leg.type === 'cover') {
    layout = 'cover';
  } else if (leg.type === 'diagram') {
    layout = 'diagram';
  } else if (leg.type === 'command' || leg.type === 'concept') {
    layout = 'content';
  } else if (leg.type === 'review' || leg.type === 'practice') {
    layout = 'checkpoint';
  } else if (leg.type === 'summary') {
    layout = 'summary';
  } else if (leg.type === 'exercise' || leg.type === 'challenge') {
    layout = 'two-column';
  }

  return {
    id: `${subtopicId}-slide-${slideNum}`,
    slideNumber: slideNum,
    title: leg.title,
    layout,
    blocks,
    notes: leg.notes
  };
}

export function importAllLessons(legacyContentDir: string, destLessonsDir: string): Lesson[] {
  if (!fs.existsSync(destLessonsDir)) {
    fs.mkdirSync(destLessonsDir, { recursive: true });
  }

  const importedLessons: Lesson[] = [];

  for (const subtopicId of ALL_SUBTOPIC_IDS) {
    const topicId = subtopicId.split('.')[0] ?? '101';
    const examId = parseInt(topicId, 10) <= 104 ? '101' : '102';
    const jsonPath = path.join(legacyContentDir, `t${topicId}`, `${subtopicId}.json`);

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Archivo legacy no encontrado para ${subtopicId}: ${jsonPath}`);
    }

    const raw: LegacyContentFile = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const slides: Slide[] = raw.SLIDES.map((leg, idx) => convertSlide(leg, subtopicId, idx));

    // Extraer keyTerms desde GLOSARIO si existe, o desde los títulos y puntos
    const keyTerms: string[] = [];
    if (raw.GLOSARIO && Array.isArray(raw.GLOSARIO)) {
      for (const item of raw.GLOSARIO) {
        if (item.term && !keyTerms.includes(item.term)) {
          keyTerms.push(item.term);
        }
      }
    }
    if (keyTerms.length === 0) {
      keyTerms.push(raw.META.title, `Tema ${topicId}`);
    }

    // Extraer commands
    const commands: string[] = [];
    for (const s of raw.SLIDES) {
      if (s.command) {
        const cmdName = s.command.split(' ')[0]?.trim();
        if (cmdName && /^[a-zA-Z0-9_\-.]+$/.test(cmdName) && !commands.includes(cmdName)) {
          commands.push(cmdName);
        }
      }
    }

    // Construir webDocument agrupando bloques de slides en secciones
    const webDocument = slides
      .filter(s => s.layout !== 'cover')
      .slice(0, 10)
      .map((s, idx) => ({
        id: `sec-${subtopicId.replace('.', '-')}-${idx + 1}`,
        title: s.title,
        level: 2 as const,
        blocks: s.blocks
      }));

    const lesson: Lesson = {
      id: subtopicId,
      topicId,
      examId,
      title: raw.META.title,
      version: '1.0.0',
      language: 'es',
      estimatedMinutes: parseDuracion(raw.META.duracion),
      objectives: [
        raw.META.description,
        `Dominio técnico de las herramientas y configuración del subtema ${subtopicId}`
      ],
      keyTerms,
      commands,
      placeholder: false,
      slides,
      webDocument
    };

    // Validar con LessonSchema
    const validation = LessonSchema.safeParse(lesson);
    if (!validation.success) {
      throw new Error(`Error validando Lesson ${subtopicId}: ${JSON.stringify(validation.error.format())}`);
    }

    // Guardar en content-src/lessons/
    const destPath = path.join(destLessonsDir, `${subtopicId}.json`);
    fs.writeFileSync(destPath, JSON.stringify(lesson, null, 2), 'utf-8');
    importedLessons.push(lesson);
  }

  return importedLessons;
}

const isMain = process.argv[1]?.includes('import-lessons');
if (isMain) {
  const rootDir = process.cwd();
  const legacyDir = path.resolve(rootDir, '_legacy/Recurso Final Definitivo/content');
  const destDir = path.resolve(rootDir, 'content-src/lessons');
  console.log('Iniciando importAllLessons...');
  const lessons = importAllLessons(legacyDir, destDir);
  let totalSlides = 0;
  for (const l of lessons) totalSlides += l.slides.length;
  console.log(`SUCCESS: ${lessons.length} lecciones y ${totalSlides} diapositivas importadas con éxito.`);
}


