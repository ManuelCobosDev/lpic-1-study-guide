import {
  DiagramEdge,
  DiagramKind,
  DiagramNode,
  DiagramScene,
  DiagramSpec,
  DiagramTone,
  SceneEdge,
  SceneGroup,
  SceneNode
} from '../../models/diagram.model';

export interface LayoutOptions {
  padding?: number;
}

const GRID_SIZE = 8;
const MIN_NODE_WIDTH = 128;
const MIN_NODE_HEIGHT = 48;
const DEFAULT_NODE_WIDTH = 144;
const DEFAULT_NODE_HEIGHT = 48;
const HORIZONTAL_GAP = 48;
const VERTICAL_GAP = 32;

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function layoutDiagram(spec: DiagramSpec, options?: LayoutOptions): DiagramScene {
  const padding = options?.padding ?? 24;

  let sceneNodes: SceneNode[] = [];
  let sceneEdges: SceneEdge[] = [];
  let sceneGroups: SceneGroup[] = [];

  switch (spec.kind) {
    case 'layers':
      sceneNodes = layoutLayers(spec.nodes, padding);
      break;
    case 'tree':
      sceneNodes = layoutTree(spec.nodes, spec.edges ?? [], padding);
      break;
    case 'segments':
      sceneNodes = layoutSegments(spec.nodes, padding);
      break;
    case 'streams':
      sceneNodes = layoutStreams(spec.nodes, padding);
      break;
    case 'matrix':
      sceneNodes = layoutMatrix(spec.nodes, padding);
      break;
    case 'states':
      sceneNodes = layoutStates(spec.nodes, padding);
      break;
    case 'flow':
    default:
      sceneNodes = layoutFlow(spec.nodes, spec.edges ?? [], spec.direction ?? 'horizontal', padding);
      break;
  }

  // Generar aristas
  if (spec.edges && spec.edges.length > 0) {
    sceneEdges = routeEdges(spec.edges, sceneNodes, spec.kind);
  }

  // Generar grupos
  if (spec.groups && spec.groups.length > 0) {
    sceneGroups = layoutGroups(spec.groups, sceneNodes);
  }

  // Calcular dimensiones totales y bounding box
  let maxX = 400;
  let maxY = 200;

  if (sceneNodes.length > 0) {
    maxX = Math.max(...sceneNodes.map((n) => n.x + n.width));
    maxY = Math.max(...sceneNodes.map((n) => n.y + n.height));
  }

  if (sceneGroups.length > 0) {
    maxX = Math.max(maxX, ...sceneGroups.map((g) => g.x + g.width));
    maxY = Math.max(maxY, ...sceneGroups.map((g) => g.y + g.height));
  }

  // Leyenda automática si hay más de 2 tonos
  const distinctTones = Array.from(new Set(sceneNodes.map((n) => n.tone)));
  let legend: { label: string; tone: DiagramTone }[] | undefined;
  if (spec.legend !== false && distinctTones.length > 2) {
    legend = distinctTones.map((tone) => ({
      label: capitalize(tone),
      tone
    }));
  }

  const extraBottom = legend && legend.length > 0 ? 40 : 0;
  const totalWidth = snapToGrid(maxX + padding);
  const totalHeight = snapToGrid(maxY + padding + extraBottom);

  return {
    width: totalWidth,
    height: totalHeight,
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    nodes: sceneNodes,
    edges: sceneEdges,
    groups: sceneGroups,
    legend,
    alt: spec.alt,
    title: spec.title,
    caption: spec.caption
  };
}

function layoutFlow(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  direction: 'horizontal' | 'vertical',
  padding: number
): SceneNode[] {
  const isHorizontal = direction === 'horizontal';
  const sceneNodes: SceneNode[] = [];
  const maxPerRow = 5;

  nodes.forEach((node, idx) => {
    const width = snapToGrid(Math.max(node.width ?? DEFAULT_NODE_WIDTH, MIN_NODE_WIDTH));
    const height = snapToGrid(Math.max(node.height ?? DEFAULT_NODE_HEIGHT, MIN_NODE_HEIGHT));

    let x = 0;
    let y = 0;

    if (isHorizontal) {
      const row = Math.floor(idx / maxPerRow);
      const col = idx % maxPerRow;
      x = padding + col * (width + HORIZONTAL_GAP);
      y = padding + row * (height + VERTICAL_GAP * 2);
    } else {
      x = padding;
      y = padding + idx * (height + VERTICAL_GAP);
    }

    sceneNodes.push({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      x: snapToGrid(x),
      y: snapToGrid(y),
      width,
      height,
      tone: node.tone ?? 'neutral',
      badge: node.badge,
      shape: node.shape ?? 'box'
    });
  });

  return sceneNodes;
}

function layoutLayers(nodes: DiagramNode[], padding: number): SceneNode[] {
  const sceneNodes: SceneNode[] = [];
  const layerWidth = 480;
  const layerHeight = 44;
  const layerGap = 16;

  nodes.forEach((node, idx) => {
    const y = padding + idx * (layerHeight + layerGap);
    sceneNodes.push({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      x: padding,
      y: snapToGrid(y),
      width: layerWidth,
      height: layerHeight,
      tone: node.tone ?? 'neutral',
      badge: node.badge,
      shape: node.shape ?? 'box'
    });
  });

  return sceneNodes;
}

function layoutTree(nodes: DiagramNode[], edges: DiagramEdge[], padding: number): SceneNode[] {
  const sceneNodes: SceneNode[] = [];
  if (nodes.length === 0) return sceneNodes;

  // Nodo raíz (el que no tiene arista entrante)
  const incoming = new Set(edges.map((e) => e.to));
  const fallback = nodes[0]!;
  const rootNode = nodes.find((n) => !incoming.has(n.id)) ?? fallback;
  const children = nodes.filter((n) => n.id !== rootNode.id);

  const rootWidth = 160;
  const rootHeight = 48;
  const childWidth = 136;
  const childHeight = 44;

  const totalChildrenWidth = children.length * childWidth + (children.length - 1) * 24;
  const centerX = padding + Math.max(0, (totalChildrenWidth - rootWidth) / 2);

  // Raíz
  sceneNodes.push({
    id: rootNode.id,
    label: rootNode.label,
    sublabel: rootNode.sublabel,
    x: snapToGrid(centerX),
    y: snapToGrid(padding),
    width: rootWidth,
    height: rootHeight,
    tone: rootNode.tone ?? 'primary',
    badge: rootNode.badge,
    shape: rootNode.shape ?? 'box'
  });

  // Hijos
  const startChildrenX = padding;
  const childrenY = padding + rootHeight + 56;

  children.forEach((child, idx) => {
    const cx = startChildrenX + idx * (childWidth + 24);
    sceneNodes.push({
      id: child.id,
      label: child.label,
      sublabel: child.sublabel,
      x: snapToGrid(cx),
      y: snapToGrid(childrenY),
      width: childWidth,
      height: childHeight,
      tone: child.tone ?? 'neutral',
      badge: child.badge,
      shape: child.shape ?? 'box'
    });
  });

  return sceneNodes;
}

function layoutSegments(nodes: DiagramNode[], padding: number): SceneNode[] {
  const sceneNodes: SceneNode[] = [];
  const totalBarWidth = 600;
  const barHeight = 56;
  const totalWeight = nodes.reduce((acc, n) => acc + (n.size ?? 1), 0);

  let currentX = padding;
  nodes.forEach((node) => {
    const weight = node.size ?? 1;
    const rawWidth = (weight / totalWeight) * totalBarWidth;
    const width = snapToGrid(Math.max(rawWidth, 72));

    sceneNodes.push({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      x: snapToGrid(currentX),
      y: snapToGrid(padding),
      width,
      height: barHeight,
      tone: node.tone ?? 'primary',
      badge: node.badge,
      shape: 'box'
    });

    currentX += width;
  });

  return sceneNodes;
}

function layoutStreams(nodes: DiagramNode[], padding: number): SceneNode[] {
  // Streams: proceso central, entrada stdin (0) a la izquierda, salida stdout (1) arriba-derecha, stderr (2) abajo-derecha
  const sceneNodes: SceneNode[] = [];
  const procWidth = 160;
  const procHeight = 64;

  const leftX = padding;
  const procX = padding + 180;
  const rightX = procX + procWidth + 120;

  const centerY = padding + 80;

  nodes.forEach((node) => {
    let x = procX;
    let y = centerY;
    let w = procWidth;
    let h = procHeight;

    if (node.id.includes('stdin') || node.id.includes('input') || node.id === '0') {
      x = leftX;
      y = centerY;
      w = 128;
      h = 44;
    } else if (node.id.includes('stdout') || node.id.includes('output') || node.id === '1') {
      x = rightX;
      y = centerY - 48;
      w = 144;
      h = 44;
    } else if (node.id.includes('stderr') || node.id.includes('error') || node.id === '2') {
      x = rightX;
      y = centerY + 48;
      w = 144;
      h = 44;
    } else if (node.id.includes('tee') || node.id.includes('pipe') || node.id.includes('cmd2')) {
      x = rightX;
      y = centerY;
      w = 144;
      h = procHeight;
    }

    sceneNodes.push({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: snapToGrid(w),
      height: snapToGrid(h),
      tone: node.tone ?? (node.id.includes('stderr') ? 'danger' : 'neutral'),
      badge: node.badge,
      shape: node.shape ?? 'box'
    });
  });

  return sceneNodes;
}

function layoutMatrix(nodes: DiagramNode[], padding: number): SceneNode[] {
  const sceneNodes: SceneNode[] = [];
  const cellWidth = 112;
  const cellHeight = 44;
  const gap = 12;

  nodes.forEach((node, idx) => {
    const row = node.row ?? Math.floor(idx / 3);
    const col = node.col ?? idx % 3;

    const x = padding + col * (cellWidth + gap);
    const y = padding + row * (cellHeight + gap);

    sceneNodes.push({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: cellWidth,
      height: cellHeight,
      tone: node.tone ?? 'neutral',
      badge: node.badge,
      shape: node.shape ?? 'box'
    });
  });

  return sceneNodes;
}

function layoutStates(nodes: DiagramNode[], padding: number): SceneNode[] {
  // Disposición en diamante / ciclo de estados (Running, Sleeping, Stopped, Zombie)
  const sceneNodes: SceneNode[] = [];
  const stateWidth = 136;
  const stateHeight = 48;

  const centerX = padding + 180;
  const centerY = padding + 120;
  const radiusX = 140;
  const radiusY = 90;

  const count = nodes.length;
  nodes.forEach((node, idx) => {
    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radiusX * Math.cos(angle) - stateWidth / 2;
    const y = centerY + radiusY * Math.sin(angle) - stateHeight / 2;

    sceneNodes.push({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: stateWidth,
      height: stateHeight,
      tone: node.tone ?? 'neutral',
      badge: node.badge,
      shape: 'pill'
    });
  });

  return sceneNodes;
}

function routeEdges(
  edges: DiagramEdge[],
  nodes: SceneNode[],
  kind: DiagramKind
): SceneEdge[] {
  const nodeMap = new Map<string, SceneNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const sceneEdges: SceneEdge[] = [];

  edges.forEach((edge) => {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);
    if (!from || !to) return;

    let path = '';
    let labelPos: { x: number; y: number } | undefined;

    // Calcular puntos de conexión
    if (kind === 'layers' || to.y > from.y + from.height - 8) {
      // De arriba hacia abajo
      const startX = from.x + from.width / 2;
      const startY = from.y + from.height;
      const endX = to.x + to.width / 2;
      const endY = to.y;

      if (Math.abs(startX - endX) < 8) {
        path = `M ${startX} ${startY} L ${endX} ${endY}`;
        labelPos = { x: startX + 8, y: (startY + endY) / 2 };
      } else {
        const midY = (startY + endY) / 2;
        path = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: midY - 8 };
      }
    } else {
      // De izquierda a derecha
      const startX = from.x + from.width;
      const startY = from.y + from.height / 2;
      const endX = to.x;
      const endY = to.y + to.height / 2;

      if (Math.abs(startY - endY) < 8) {
        path = `M ${startX} ${startY} L ${endX} ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: startY - 8 };
      } else {
        const midX = (startX + endX) / 2;
        path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        labelPos = { x: midX, y: (startY + endY) / 2 - 8 };
      }
    }

    sceneEdges.push({
      from: edge.from,
      to: edge.to,
      path,
      label: edge.label,
      labelPos,
      tone: edge.tone ?? (edge.primary ? 'primary' : 'neutral'),
      style: edge.style ?? 'solid',
      primary: edge.primary ?? false,
      markerEnd: `url(#arrow-${edge.tone ?? (edge.primary ? 'primary' : 'neutral')})`
    });
  });

  return sceneEdges;
}

function layoutGroups(
  groups: { id: string; label: string; nodeIds: string[] }[],
  nodes: SceneNode[]
): SceneGroup[] {
  const nodeMap = new Map<string, SceneNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const sceneGroups: SceneGroup[] = [];
  const pad = 12;

  groups.forEach((group) => {
    const groupNodes = group.nodeIds.map((id) => nodeMap.get(id)).filter(Boolean) as SceneNode[];
    if (groupNodes.length === 0) return;

    const minX = Math.min(...groupNodes.map((n) => n.x)) - pad;
    const minY = Math.min(...groupNodes.map((n) => n.y)) - pad * 2;
    const maxX = Math.max(...groupNodes.map((n) => n.x + n.width)) + pad;
    const maxY = Math.max(...groupNodes.map((n) => n.y + n.height)) + pad;

    sceneGroups.push({
      id: group.id,
      label: group.label,
      x: snapToGrid(minX),
      y: snapToGrid(minY),
      width: snapToGrid(maxX - minX),
      height: snapToGrid(maxY - minY)
    });
  });

  return sceneGroups;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
