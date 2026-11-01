export type ExamStatus = 'available' | 'planned';
export type SubtopicStatus = 'available' | 'planned';

export interface Exam {
  id: string;
  code: string;
  title: string;
  description: string;
  status: ExamStatus;
  weight: number;
  topicIds: string[];
}

export interface Topic {
  id: string;
  examId: string;
  title: string;
  weight: number;
  subtopicIds: string[];
  globalLabId?: string;
  summarySubtopicId?: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  weight: number;
  estimatedMinutes: number;
  status: SubtopicStatus;
  placeholder: boolean;
  labId?: string;
  slideCount?: number;
  keyAreas?: string[];
}

export interface CurriculumStats {
  totalExams: number;
  totalTopics: number;
  totalSubtopics: number;
  availableSubtopics: number;
  plannedSubtopics: number;
  totalSlidesReal: number;
  totalSlidesPlaceholder: number;
  totalLabsReal: number;
  totalLabsPlaceholder: number;
  totalQuestionsReal: number;
  totalQuestionsPlaceholder: number;
  totalCommands: number;
  totalTerms: number;
  totalFlashcards?: number;
}

export interface CurriculumManifest {
  version: string;
  generatedAt: string;
  stats: CurriculumStats;
  exams: Exam[];
  topics: Topic[];
  subtopics: Subtopic[];
}

