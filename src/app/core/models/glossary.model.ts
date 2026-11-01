export interface GlossaryTerm {
  id: string; // normalizado, ej: 'stdin'
  term: string;
  definition: string;
  related: string[];
  subtopicIds: string[];
  short?: string;
  aliases?: string[];
  explainedIn?: string[];
  sinExplicacion?: string;
}

