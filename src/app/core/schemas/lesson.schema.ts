import { z } from 'zod';
import { SlideSchema } from './slide.schema';
import { BlockSchema } from './block.schema';

export const WikiReferenceSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['command', 'term']),
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  url: z.string().optional()
});

export const WebSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: z.number().int().min(1).max(6),
  blocks: z.array(BlockSchema)
});

export const LessonSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  examId: z.string().min(1),
  title: z.string().min(1),
  version: z.string().min(1),
  language: z.string().default('es'),
  estimatedMinutes: z.number().int().positive(),
  objectives: z.array(z.string().min(1)),
  keyTerms: z.array(z.string().min(1)),
  commands: z.array(z.string().min(1)),
  placeholder: z.boolean(),
  slides: z.array(SlideSchema),
  webDocument: z.array(WebSectionSchema).optional(),
  wikiReferences: z.array(WikiReferenceSchema).optional()
});

