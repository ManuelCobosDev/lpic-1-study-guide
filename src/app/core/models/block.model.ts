export type CalloutType = 'tip' | 'info' | 'warning' | 'exam';

export interface BaseBlock {
  src?: string;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string; // Puede incluir sintaxis markdown y enlaces cmd:id, term:id
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

export interface StepItem {
  number: number;
  title: string;
  description: string;
}

export interface StepsBlock extends BaseBlock {
  type: 'steps';
  items: StepItem[];
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language: string;
  code: string;
  title?: string;
  highlightLines?: number[];
}

export interface TerminalLine {
  prompt?: string;
  command?: string;
  output?: string;
}

export interface TerminalBlock extends BaseBlock {
  type: 'terminal';
  lines: TerminalLine[];
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  calloutType: CalloutType;
  title?: string;
  content: string;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface DiagramBlock extends BaseBlock {
  type: 'diagram';
  kind: 'flow' | 'layers' | 'tree' | 'segments' | 'streams' | 'matrix' | 'states';
  title?: string;
  caption?: string;
  alt: string;
  spec: Record<string, unknown>;
}

export interface KeytermBlock extends BaseBlock {
  type: 'keyterm';
  termId: string;
  term: string;
  definition: string;
}

export interface CommandRefBlock extends BaseBlock {
  type: 'command-ref';
  commandId: string;
  name: string;
  synopsis: string;
  description: string;
}

export interface KbdBlock extends BaseBlock {
  type: 'kbd';
  keys: string[];
  description?: string;
}

export interface QuizInlineBlock extends BaseBlock {
  type: 'quiz-inline';
  id: string;
  question: string;
  options: { key: string; text: string }[];
  correct: string[];
  explanation: string;
}

export interface HtmlBlock extends BaseBlock {
  type: 'html';
  sanitizedHtml: string;
}

export interface SlideHtmlBlock extends BaseBlock {
  type: 'slide-html';
  assetPath: string;
  title: string;
  searchableText?: string;
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | StepsBlock
  | CodeBlock
  | TerminalBlock
  | CalloutBlock
  | TableBlock
  | ImageBlock
  | DiagramBlock
  | KeytermBlock
  | CommandRefBlock
  | KbdBlock
  | QuizInlineBlock
  | HtmlBlock
  | SlideHtmlBlock;

