import { z } from 'zod';

export const LabStepSchema = z.object({
  id: z.string().min(1),
  stepNumber: z.number().int().positive(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  command: z.string().optional(),
  expectedOutput: z.string().optional(),
  hint: z.string().optional(),
  examAlert: z.string().optional(),
  src: z.string().optional(),
  source: z.string().optional()
});

export const LabSchema = z.object({
  id: z.string().min(1),
  subtopicId: z.string().optional(),
  topicId: z.string().optional(),
  title: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  difficulty: z.enum(['basic', 'intermediate', 'advanced']),
  type: z.enum(['subtopic', 'global']),
  steps: z.array(LabStepSchema).min(1),
  solutionNotes: z.string().optional(),
  placeholder: z.boolean().optional(),
  src: z.string().optional(),
  source: z.string().optional()
});

