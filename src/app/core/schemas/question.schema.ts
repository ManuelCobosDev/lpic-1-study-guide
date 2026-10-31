import { z } from 'zod';

export const QuestionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1)
});

export const QuestionSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  subtopicId: z.string().min(1),
  type: z.enum(['single', 'multiple', 'fill']),
  prompt: z.string().min(1),
  options: z.array(QuestionOptionSchema).optional(),
  correct: z.array(z.string().min(1)),
  acceptedAnswers: z.array(z.string().min(1)).optional(),
  explanation: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  placeholder: z.boolean()
}).refine(data => {
  // Para single o multiple, las opciones deben existir y las respuestas correctas deben estar en las opciones
  if (data.type === 'single' || data.type === 'multiple') {
    if (!data.options || data.options.length < 2) return false;
    const optionIds = new Set(data.options.map(o => o.id));
    return data.correct.length > 0 && data.correct.every(c => optionIds.has(c));
  }
  // Para fill, debe haber al menos una respuesta correcta
  return data.correct.length > 0 || (data.acceptedAnswers && data.acceptedAnswers.length > 0);
}, {
  message: 'Para preguntas de opción múltiple/única, las respuestas correctas deben coincidir con opciones existentes'
});

export const TopicQuestionsSchema = z.object({
  topicId: z.string().min(1),
  questions: z.array(QuestionSchema)
});

