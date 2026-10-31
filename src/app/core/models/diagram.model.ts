export type DiagramTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type DiagramKind =
  | 'flow'
  | 'layers'
  | 'tree'
  | 'segments'
  | 'streams'
  | 'matrix'
  | 'states';

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  tone?: DiagramTone;
  badge?: string;
  shape?: 'box' | 'cylinder' | 'pill';
  width?: number;
  height?: number;
  size?: number; // Para segments: peso o tamaño proporcional
  row?: number; // Para matrix
  col?: number; // Para matrix
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  tone?: DiagramTone;
  style?: 'solid' | 'dashed';
  primary?: boolean;
  streamType?: 'stdin' | 'stdout' | 'stderr' | 'pipe';
}

export interface DiagramGroup {
  id: string;
  label: string;
  nodeIds: string[];
}

export interface DiagramSpec {
  kind: DiagramKind;
  title?: string;
  caption?: string;
  alt: string; // Obligatorio para accesibilidad
  direction?: 'horizontal' | 'vertical';
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  groups?: DiagramGroup[];
  legend?: boolean;
  size?: { width: number; height: number };
}

export interface SceneNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone: DiagramTone;
  badge?: string;
  shape: 'box' | 'cylinder' | 'pill';
}

export interface SceneEdge {
  from: string;
  to: string;
  path: string; // SVG path data (d="M... L... Q...")
  label?: string;
  labelPos?: { x: number; y: number };
  tone: DiagramTone;
  style: 'solid' | 'dashed';
  primary: boolean;
  markerEnd?: string;
}

export interface SceneGroup {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramScene {
  width: number;
  height: number;
  viewBox: string;
  nodes: SceneNode[];
  edges: SceneEdge[];
  groups: SceneGroup[];
  legend?: { label: string; tone: DiagramTone }[];
  alt: string;
  title?: string;
  caption?: string;
}
