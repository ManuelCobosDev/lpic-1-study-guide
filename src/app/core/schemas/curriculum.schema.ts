import { z } from 'zod';

export const ExamSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  status: z.enum(['available', 'planned']),
  weight: z.number().int().positive(),
  topicIds: z.array(z.string().min(1))
});

export const TopicSchema = z.object({
  id: z.string().min(1),
  examId: z.string().min(1),
  title: z.string().min(1),
  weight: z.number().int().positive(),
  subtopicIds: z.array(z.string().min(1)),
  globalLabId: z.string().optional(),
  summarySubtopicId: z.string().optional()
});

export const SubtopicSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  weight: z.number().int().positive(),
  estimatedMinutes: z.number().int().positive(),
  status: z.enum(['available', 'planned']),
  placeholder: z.boolean(),
  labId: z.string().optional(),
  slideCount: z.number().int().nonnegative().optional(),
  keyAreas: z.array(z.string()).optional()
});

export const CurriculumManifestSchema = z.object({
  version: z.string().min(1),
  generatedAt: z.string().datetime(),
  stats: z.object({
    totalExams: z.number().int().nonnegative(),
    totalTopics: z.number().int().nonnegative(),
    totalSubtopics: z.number().int().nonnegative(),
    availableSubtopics: z.number().int().nonnegative(),
    plannedSubtopics: z.number().int().nonnegative(),
    totalSlidesReal: z.number().int().nonnegative(),
    totalSlidesPlaceholder: z.number().int().nonnegative(),
    totalLabsReal: z.number().int().nonnegative(),
    totalLabsPlaceholder: z.number().int().nonnegative(),
    totalQuestionsReal: z.number().int().nonnegative(),
    totalQuestionsPlaceholder: z.number().int().nonnegative(),
    totalCommands: z.number().int().nonnegative(),
    totalTerms: z.number().int().nonnegative()
  }),
  exams: z.array(ExamSchema),
  topics: z.array(TopicSchema),
  subtopics: z.array(SubtopicSchema)
});

export const CurriculumSourceSchema = z.object({
  exams: z.array(ExamSchema),
  topics: z.array(TopicSchema),
  subtopics: z.array(SubtopicSchema)
});

