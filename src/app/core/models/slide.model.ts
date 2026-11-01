import { Block } from './block.model';

export type SlideLayout =
  | 'cover'
  | 'section'
  | 'content'
  | 'two-column'
  | 'code-explain'
  | 'diagram'
  | 'comparison'
  | 'checkpoint'
  | 'summary';

export interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  layout: SlideLayout;
  blocks: Block[];
  secondaryBlocks?: Block[]; // Utilizado en layouts como two-column, code-explain o comparison
  notes?: string;
  src?: string; // Trazabilidad de cobertura Ronda 2 (Spec 11 §11.5)
}

