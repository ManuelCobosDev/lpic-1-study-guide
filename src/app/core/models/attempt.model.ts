import { Question } from './question.model';

export interface QuestionAnswer {
  questionId: string;
  selectedOptions?: string[]; // Para single y multiple
  textAnswer?: string;        // Para fill
  flagged?: boolean;          // Marcada para revisar
  answeredAt?: string;
  isCorrect?: boolean;
}

export interface ActiveExamSession {
  id: string;
  mode: 'exam' | 'practice';
  examId?: '101' | '102';
  topicId?: string;
  startedAt: string;
  durationSeconds: number;
  seed: number;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, QuestionAnswer>;
}

export interface ExamAttempt {
  id: string;
  mode: 'exam' | 'practice';
  examId?: '101' | '102';
  topicId?: string;           // Si es práctica específica de tema
  startedAt: string;
  finishedAt?: string;
  durationSeconds: number;
  timeRemainingSeconds: number;
  seed: number;
  questionIds: string[];
  questions?: Question[];
  answers: Record<string, QuestionAnswer>;
  score?: number;             // Escala oficial LPI 200 - 800
  passed?: boolean;           // >= 500
  topicScores?: Record<string, { correct: number; total: number; percentage: number }>;
}
