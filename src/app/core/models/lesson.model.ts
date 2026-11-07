import { Slide } from './slide.model';
import { LessonExercise } from './practice.model';

export interface WikiReference {
  id: string;
  type: 'command' | 'term';
  name: string;
  shortDescription: string;
  url?: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  examId: string;
  title: string;
  version: string;
  language: string; // por defecto 'es'
  estimatedMinutes: number;
  objectives: string[];
  keyTerms: string[];
  commands: string[];
  placeholder: boolean;
  slides: Slide[];
  wikiReferences?: WikiReference[];
  exercises?: LessonExercise[];
  keyAreas?: string[];
}

