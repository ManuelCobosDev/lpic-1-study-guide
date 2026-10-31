export type CalloutType = 'tip' | 'info' | 'warning' | 'exam';

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string; // Puede incluir sintaxis markdown y enlaces cmd:id, term:id
}

export interface ListBlock {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

export interface StepItem {
  number: number;
  title: string;
  description: string;
}

export interface StepsBlock {
  type: 'steps';
  items: StepItem[];
}

export interface CodeBlock {
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

export interface TerminalBlock {
  type: 'terminal';
  lines: TerminalLine[];
}

export interface CalloutBlock {
  type: 'callout';
  calloutType: CalloutType;
  title?: string;
  content: string;
}

export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface DiagramBlock {
  type: 'diagram';
  kind: 'flow' | 'layers' | 'tree' | 'segments' | 'streams' | 'matrix' | 'states';
  title?: string;
  caption?: string;
  alt: string;
  spec: Record<string, unknown>;
}

export interface KeytermBlock {
  type: 'keyterm';
  termId: string;
  term: string;
  definition: string;
}

export interface CommandRefBlock {
  type: 'command-ref';
  commandId: string;
  name: string;
  synopsis: string;
  description: string;
}

export interface KbdBlock {
  type: 'kbd';
  keys: string[];
  description?: string;
}

export interface QuizInlineBlock {
  type: 'quiz-inline';
  id: string;
  question: string;
  options: { key: string; text: string }[];
  correct: string[];
  explanation: string;
}

export interface HtmlBlock {
  type: 'html';
  sanitizedHtml: string;
}

export interface SlideHtmlBlock {
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

