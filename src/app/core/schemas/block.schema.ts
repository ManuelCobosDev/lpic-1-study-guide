import { z } from 'zod';

export const HeadingBlockSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  text: z.string().min(1),
  src: z.string().optional()
});

export const ParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string(),
  src: z.string().optional()
});

export const ListBlockSchema = z.object({
  type: z.literal('list'),
  ordered: z.boolean().optional(),
  items: z.array(z.string()),
  src: z.string().optional()
});

export const StepItemSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  src: z.string().optional()
});

export const StepsBlockSchema = z.object({
  type: z.literal('steps'),
  items: z.array(StepItemSchema),
  src: z.string().optional()
});

export const CodeBlockSchema = z.object({
  type: z.literal('code'),
  language: z.string(),
  code: z.string(),
  title: z.string().optional(),
  highlightLines: z.array(z.number().int().positive()).optional(),
  src: z.string().optional()
});

export const TerminalLineSchema = z.object({
  prompt: z.string().optional(),
  command: z.string().optional(),
  output: z.string().optional()
});

export const TerminalBlockSchema = z.object({
  type: z.literal('terminal'),
  lines: z.array(TerminalLineSchema),
  src: z.string().optional()
});

export const CalloutBlockSchema = z.object({
  type: z.literal('callout'),
  calloutType: z.enum(['tip', 'info', 'warning', 'exam']),
  title: z.string().optional(),
  content: z.string(),
  src: z.string().optional()
});

export const TableBlockSchema = z.object({
  type: z.literal('table'),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  caption: z.string().optional(),
  src: z.string().optional()
});

export const ImageBlockSchema = z.object({
  type: z.literal('image'),
  src: z.string().min(1),
  alt: z.string().min(1), // alt obligatorio según 03-dominio.md §3.1
  caption: z.string().optional()
});

export const DiagramBlockSchema = z.object({
  type: z.literal('diagram'),
  kind: z.enum(['flow', 'layers', 'tree', 'segments', 'streams', 'matrix', 'states']),
  title: z.string().optional(),
  caption: z.string().optional(),
  alt: z.string().min(1), // alt obligatorio según 03-dominio.md §3.1
  spec: z.record(z.unknown()),
  src: z.string().optional()
});

export const KeytermBlockSchema = z.object({
  type: z.literal('keyterm'),
  termId: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  src: z.string().optional()
});

export const CommandRefBlockSchema = z.object({
  type: z.literal('command-ref'),
  commandId: z.string().min(1),
  name: z.string().min(1),
  synopsis: z.string(),
  description: z.string(),
  src: z.string().optional()
});

export const KbdBlockSchema = z.object({
  type: z.literal('kbd'),
  keys: z.array(z.string().min(1)),
  description: z.string().optional(),
  src: z.string().optional()
});

export const QuizInlineBlockSchema = z.object({
  type: z.literal('quiz-inline'),
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.object({
    key: z.string().min(1),
    text: z.string().min(1)
  })),
  correct: z.array(z.string().min(1)),
  explanation: z.string(),
  src: z.string().optional()
});

export const HtmlBlockSchema = z.object({
  type: z.literal('html'),
  sanitizedHtml: z.string(),
  src: z.string().optional()
});

export const SlideHtmlBlockSchema = z.object({
  type: z.literal('slide-html'),
  assetPath: z.string().min(1),
  title: z.string().min(1),
  searchableText: z.string().optional(),
  src: z.string().optional()
});

export const BlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  ListBlockSchema,
  StepsBlockSchema,
  CodeBlockSchema,
  TerminalBlockSchema,
  CalloutBlockSchema,
  TableBlockSchema,
  ImageBlockSchema,
  DiagramBlockSchema,
  KeytermBlockSchema,
  CommandRefBlockSchema,
  KbdBlockSchema,
  QuizInlineBlockSchema,
  HtmlBlockSchema,
  SlideHtmlBlockSchema
]);

