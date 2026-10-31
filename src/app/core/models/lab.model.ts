export type LabDifficulty = 'basic' | 'intermediate' | 'advanced';
export type LabType = 'subtopic' | 'global';
export type LabStatus = 'pending' | 'in_progress' | 'completed';

export interface LabStep {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  command?: string;
  expectedOutput?: string;
  hint?: string;
  examAlert?: string;
}

export interface Lab {
  id: string;
  subtopicId?: string;
  topicId?: string;
  title: string;
  estimatedMinutes: number;
  difficulty: LabDifficulty;
  type: LabType;
  steps: LabStep[];
  solutionNotes?: string;
  placeholder?: boolean;
}

export interface LabSummary {
  id: string;
  subtopicId: string;
  topicId: string;
  title: string;
  estimatedMinutes: number;
  difficulty: LabDifficulty;
  type: LabType;
  stepCount: number;
  placeholder?: boolean;
}


