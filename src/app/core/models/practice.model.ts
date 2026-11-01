export interface QuickQuizResult {
  best: number;
  last: number;
  attempts: number;
  totalQuestions: number;
  date: string;
}

export interface LessonExercise {
  id: string;
  kind: 'guiado' | 'exploratorio';
  title?: string;
  statement: string;
  answer: string;
  source?: string[];
}

export interface PracticeState {
  schemaVersion: number;
  quick: Record<string, QuickQuizResult>;
  exerciseNotes: Record<string, string>;
  completedExercises: Record<string, boolean>;
}

export const DEFAULT_PRACTICE_STATE: PracticeState = {
  schemaVersion: 1,
  quick: {},
  exerciseNotes: {},
  completedExercises: {}
};

