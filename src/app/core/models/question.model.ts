export type QuestionType = 'single' | 'multiple' | 'fill';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string; // p. ej. 'a', 'b', 'c', 'd'
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  subtopicId: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
  correct: string[]; // ids de opciones correctas (para single o multiple)
  acceptedAnswers?: string[]; // respuestas en texto normalizadas (para fill)
  explanation: string;
  difficulty: QuestionDifficulty;
  placeholder: boolean;
  status?: 'verificada' | 'pendiente-verificacion';
  verified?: boolean;
  src?: string;
  source?: string;
  explainedIn?: string;
}

export interface TopicQuestions {
  topicId: string;
  questions: Question[];
}

