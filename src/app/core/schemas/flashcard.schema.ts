import { z } from 'zod';

export const FlashcardKindSchema = z.enum([
  'comando',
  'opcion',
  'termino',
  'archivo',
  'concepto',
  'areaClave'
]);

export const FlashcardItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['command', 'glossary', 'flag', 'extra']),
  kind: FlashcardKindSchema.optional(),
  frontTitle: z.string().min(1),
  frontSubtitle: z.string().optional(),
  prompt: z.string().min(1),
  backTitle: z.string().min(1),
  backDescription: z.string().min(1),
  backSyntax: z.string().optional(),
  backExample: z.string().optional(),
  backFlags: z.array(z.object({
    flag: z.string(),
    description: z.string()
  })).optional(),
  relatedTerms: z.array(z.string()).optional(),
  subtopicIds: z.array(z.string()),
  topicId: z.string().optional(),
  examId: z.enum(['101', '102']).optional(),
  source: z.array(z.string()).optional(),
  hint: z.string().optional()
});

export const FlashcardsCatalogSchema = z.array(FlashcardItemSchema);

