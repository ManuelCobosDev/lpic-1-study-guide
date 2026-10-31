export interface QuestionAnswer {
  questionId: string;
  selectedOptions?: string[]; // Para single y multiple
  textAnswer?: string;        // Para fill
  flagged?: boolean;          // Marcada para revisar
  answeredAt?: string;
  isCorrect?: boolean;
}

export interface ExamAttempt {
  id: string;
  mode: 'exam' | 'practice';
  topicId?: string;           // Si es práctica específica de tema
  startedAt: string;
  finishedAt?: string;
  durationSeconds: number;
  timeRemainingSeconds: number;
  seed: number;
  questionIds: string[];
  answers: Record<string, QuestionAnswer>;
  score?: number;             // Escala oficial LPI 200 - 800
  passed?: boolean;           // >= 500
  topicScores?: Record<string, { correct: number; total: number; percentage: number }>;
}

