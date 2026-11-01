export type SearchDocType =
  | 'curriculum'
  | 'slide'
  | 'command'
  | 'term'
  | 'lab'
  | 'errata'
  | 'page';

export type SearchFilter = SearchDocType | 'all';

export interface SearchDocument {
  id: string; // Identificador único: tipo:id (ej. "slide:103.4:2", "cmd:grep")
  type: SearchDocType;
  title: string;
  subtopicId?: string;
  topicId?: string;
  examId?: string;
  slideNumber?: number;
  url: string;
  breadcrumb: string;
  // Campos indexables
  code?: string;
  headings?: string;
  body: string;
  codeSnippets?: string;
  tags?: string;
}

export interface SearchResultItem {
  id: string;
  type: SearchDocType;
  title: string;
  url: string;
  breadcrumb: string;
  snippet: string;
  score: number;
  exactMatch?: boolean;
}

export interface SearchOptions {
  filter?: SearchFilter;
  limit?: number;
  topicId?: string;
  examId?: string;
}

export interface SearchIndexSource {
  subtopics: {
    id: string;
    topicId: string;
    examId?: string;
    title: string;
    objectives?: string[];
    keyTerms?: string[];
    commands?: string[];
  }[];
  slides: {
    subtopicId: string;
    topicId: string;
    examId?: string;
    slideNumber: number;
    title: string;
    headings: string[];
    text: string;
    code: string[];
    notes?: string;
  }[];
  commands: {
    name: string;
    summary: string;
    description?: string;
    flags?: string[];
    subtopicId?: string;
  }[];
  terms: {
    term: string;
    definition: string;
    subtopicId?: string;
  }[];
  labs?: {
    id: string;
    subtopicId: string;
    title: string;
    summary?: string;
    commands?: string[];
  }[];
  errata?: {
    id: string;
    title: string;
    description: string;
  }[];
  pages?: {
    id: string;
    title: string;
    description: string;
    url: string;
  }[];
}

