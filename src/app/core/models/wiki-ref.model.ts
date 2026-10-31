export interface WikiRefData {
  type: 'command' | 'term';
  id: string;
  title: string;
  badge: string;
  description: string;
  synopsis?: string;
  link: string;
  x: number;
  y: number;
}

