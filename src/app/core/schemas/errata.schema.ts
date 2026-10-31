import { z } from 'zod';

export const ErrataSchema = z.object({
  id: z.string().min(1),
  page: z.string().min(1),
  description: z.string().min(1),
  correction: z.string().min(1),
  severity: z.enum(['minor', 'major', 'critical']),
  subtopicId: z.string().optional(),
  fixedAt: z.string().optional()
});

export const ErrataListSchema = z.array(ErrataSchema);

