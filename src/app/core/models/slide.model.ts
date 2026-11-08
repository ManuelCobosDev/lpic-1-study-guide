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

/**
 * Retorna los bloques visibles de la diapositiva omitiendo encabezados
 * iniciales que dupliquen de forma redundante el título de la diapositiva (A3-003, S-04).
 */
export function getVisibleSlideBlocks(slide: Slide): Block[] {
  if (!slide.blocks || slide.blocks.length === 0) return [];
  const first = slide.blocks[0];
  if (first && first.type === 'heading') {
    const normSlide = slide.title.toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
    const normHeading = first.text.toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
    if (normSlide === normHeading || slide.title.trim().toLowerCase() === first.text.trim().toLowerCase()) {
      return slide.blocks.slice(1);
    }
  }
  return slide.blocks;
}


