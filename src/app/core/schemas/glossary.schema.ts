import { z } from 'zod';

export const GlossaryTermSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  related: z.array(z.string()),
  subtopicIds: z.array(z.string().min(1))
});

export const GlossaryListSchema = z.array(GlossaryTermSchema);

