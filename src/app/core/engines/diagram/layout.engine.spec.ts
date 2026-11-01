import { describe, expect, it } from 'vitest';
import { layoutDiagram } from './layout.engine';
import {
  ALL_OFFICIAL_DIAGRAMS,
  DIAGRAM_BOOT_SEQUENCE,
  DIAGRAM_DISK_PARTITIONS,
  DIAGRAM_FHS_TREE,
  DIAGRAM_OS_LAYERS,
  DIAGRAM_PERMISSIONS_MATRIX,
  DIAGRAM_PROCESS_STATES,
  DIAGRAM_STREAMS_PIPES
} from './diagram-catalog';

describe('DiagramLayoutEngine (layoutDiagram)', () => {
  it('es determinista: llamar layoutDiagram con la misma especificación produce idéntico resultado', () => {
    const sceneA = layoutDiagram(DIAGRAM_BOOT_SEQUENCE);
    const sceneB = layoutDiagram(DIAGRAM_BOOT_SEQUENCE);

    expect(sceneA).toEqual(sceneB);
  });

  it('todos los nodos respetan la alineación a la rejilla de 8 px', () => {
    const scene = layoutDiagram(DIAGRAM_BOOT_SEQUENCE);

    scene.nodes.forEach((node) => {
      expect(node.x % 8).toBe(0);
      expect(node.y % 8).toBe(0);
      expect(node.width % 8).toBe(0);
      expect(node.height % 8).toBe(0);
    });
  });

  it('resuelve correctamente el diagrama de capas (layers) con anchos uniformes apilados verticalmente', () => {
    const scene = layoutDiagram(DIAGRAM_OS_LAYERS);

    expect(scene.nodes).toHaveLength(4);
    // Cada capa debe estar debajo de la anterior
    for (let i = 1; i < scene.nodes.length; i++) {
      const prev = scene.nodes[i - 1]!;
      const curr = scene.nodes[i]!;
      expect(curr.y).toBeGreaterThan(prev.y + prev.height - 8);
      expect(curr.width).toBe(prev.width);
    }
  });

  it('resuelve correctamente el árbol FHS (tree) con el nodo raíz y sus hijos alineados', () => {
    const scene = layoutDiagram(DIAGRAM_FHS_TREE);

    const root = scene.nodes.find((n) => n.id === 'root');
    expect(root).toBeDefined();

    const children = scene.nodes.filter((n) => n.id !== 'root');
    expect(children.length).toBe(5);

    // Todos los hijos deben estar en la misma línea Y inferior a la raíz
    const childY = children[0]!.y;
    children.forEach((child) => {
      expect(child.y).toBe(childY);
      expect(child.y).toBeGreaterThan(root!.y + root!.height);
    });

    // Ningún hijo se solapa en X
    for (let i = 1; i < children.length; i++) {
      expect(children[i]!.x).toBeGreaterThan(children[i - 1]!.x + children[i - 1]!.width - 8);
    }
  });

  it('resuelve correctamente el particionado de disco (segments) como barra continua sin huecos', () => {
    const scene = layoutDiagram(DIAGRAM_DISK_PARTITIONS);

    expect(scene.nodes).toHaveLength(4);
    for (let i = 1; i < scene.nodes.length; i++) {
      const prev = scene.nodes[i - 1]!;
      const curr = scene.nodes[i]!;
      expect(curr.x).toBe(prev.x + prev.width);
    }
  });

  it('resuelve flujos estándar y tuberías (streams) con stdin a la izquierda y stdout/stderr a la derecha', () => {
    const scene = layoutDiagram(DIAGRAM_STREAMS_PIPES);

    const stdin = scene.nodes.find((n) => n.id === 'stdin')!;
    const proc = scene.nodes.find((n) => n.id === 'proc')!;
    const stdout = scene.nodes.find((n) => n.id === 'stdout')!;
    const stderr = scene.nodes.find((n) => n.id === 'stderr')!;

    expect(stdin.x).toBeLessThan(proc.x);
    expect(proc.x).toBeLessThan(stdout.x);
    expect(proc.x).toBeLessThan(stderr.x);
    // stdout arriba de stderr
    expect(stdout.y).toBeLessThan(stderr.y);
  });

  it('resuelve correctamente la matriz de permisos (matrix) en cuadrícula 3x3', () => {
    const scene = layoutDiagram(DIAGRAM_PERMISSIONS_MATRIX);

    expect(scene.nodes).toHaveLength(9);
    const row0 = scene.nodes.filter((n) => n.id.startsWith('u_'));
    const row1 = scene.nodes.filter((n) => n.id.startsWith('g_'));
    const row2 = scene.nodes.filter((n) => n.id.startsWith('o_'));

    expect(row0[0]!.y).toBe(row0[1]!.y);
    expect(row1[0]!.y).toBeGreaterThan(row0[0]!.y);
    expect(row2[0]!.y).toBeGreaterThan(row1[0]!.y);
  });

  it('resuelve estados de proceso (states) distribuidos alrededor de un centro', () => {
    const scene = layoutDiagram(DIAGRAM_PROCESS_STATES);

    expect(scene.nodes).toHaveLength(4);
    // Todos tienen forma de píldora
    scene.nodes.forEach((n) => {
      expect(n.shape).toBe('pill');
    });
  });

  it('genera leyenda automática cuando hay más de 2 tonos distintos', () => {
    const scene = layoutDiagram(DIAGRAM_BOOT_SEQUENCE);
    // Tonos: neutral, primary, success, info -> 4 tonos
    expect(scene.legend).toBeDefined();
    expect(scene.legend!.length).toBeGreaterThanOrEqual(3);
  });

  it('los 8 diagramas oficiales del catálogo se renderizan con alt obligatorio y nodos válidos', () => {
    expect(ALL_OFFICIAL_DIAGRAMS.length).toBeGreaterThanOrEqual(8);

    ALL_OFFICIAL_DIAGRAMS.forEach((spec) => {
      expect(spec.alt).toBeTruthy();
      expect(spec.alt.length).toBeGreaterThan(20);

      const scene = layoutDiagram(spec);
      expect(scene.width).toBeGreaterThan(100);
      expect(scene.height).toBeGreaterThan(50);
      expect(scene.nodes.length).toBeGreaterThan(0);
      expect(scene.viewBox).toContain(`0 0 ${scene.width} ${scene.height}`);
    });
  });
});
