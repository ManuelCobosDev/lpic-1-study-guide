import { z } from 'zod';
import { SlideSchema } from './slide.schema';

export const WikiReferenceSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['command', 'term']),
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  url: z.string().optional()
});

export const LessonExerciseSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['guiado', 'exploratorio']),
  title: z.string().optional(),
  statement: z.string().min(1),
  answer: z.string().min(1),
  source: z.array(z.string()).optional()
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
  wikiReferences: z.array(WikiReferenceSchema).optional(),
  exercises: z.array(LessonExerciseSchema).optional(),
  keyAreas: z.array(z.string().min(1)).optional()
});

