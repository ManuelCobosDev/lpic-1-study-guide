export type ErrataSeverity = 'minor' | 'major' | 'critical';

export interface Errata {
  id: string;
  page: string;
  description: string;
  correction: string;
  severity: ErrataSeverity;
  subtopicId?: string;
  fixedAt?: string;
}

