import { z } from 'zod';

export const GlossaryTermSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  related: z.array(z.string()),
  subtopicIds: z.array(z.string().min(1)),
  short: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  explainedIn: z.array(z.string()).optional(),
  sinExplicacion: z.string().optional()
});

export const GlossaryListSchema = z.array(GlossaryTermSchema);

