export interface LastVisitedRoute {
  path: string;
  title: string;
  visitedAt: string;
}

export interface UserProgress {
  schemaVersion: number;
  completedSubtopics: Record<string, string>; // subtopicId -> ISO date de finalización
  viewedSlides: Record<string, number[]>;      // subtopicId -> array de índices de diapositivas vistas (base 1)
  lastSlide: Record<string, number>;          // subtopicId -> último índice de diapositiva vista
  lastVisited?: LastVisitedRoute;
  checkpoints: Record<string, boolean>;       // quizInlineId -> acierto
  completedLabs: Record<string, string>;      // labId -> ISO date
}

export const DEFAULT_PROGRESS: UserProgress = {
  schemaVersion: 1,
  completedSubtopics: {},
  viewedSlides: {},
  lastSlide: {},
  checkpoints: {},
  completedLabs: {}
};

