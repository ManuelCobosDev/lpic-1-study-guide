import { z } from 'zod';
import { BlockSchema } from './block.schema';

export const SlideLayoutSchema = z.enum([
  'cover',
  'section',
  'content',
  'two-column',
  'code-explain',
  'diagram',
  'comparison',
  'checkpoint',
  'summary'
]);

export const SlideSchema = z.object({
  id: z.string().min(1),
  slideNumber: z.number().int().positive(),
  title: z.string().min(1),
  layout: SlideLayoutSchema,
  blocks: z.array(BlockSchema),
  secondaryBlocks: z.array(BlockSchema).optional(),
  notes: z.string().optional(),
  src: z.string().optional()
});

