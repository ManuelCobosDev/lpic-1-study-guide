export interface WikiLocation {
  subtopicId: string;
  slideNumber: number;
  label: string;
  link: string;
  queryParams?: Record<string, string | number>;
}

export interface WikiRefData {
  type: 'command' | 'term';
  id: string;
  title: string;
  badge: string;
  short: string;
  description?: string;
  synopsis?: string;
  link: string;
  locations?: WikiLocation[];
  sinExplicacion?: string;
  x: number;
  y: number;
}

