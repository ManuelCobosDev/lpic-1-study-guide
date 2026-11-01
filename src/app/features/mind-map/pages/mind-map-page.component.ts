import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { hierarchy, tree, HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, ZoomBehavior, ZoomTransform } from 'd3-zoom';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CurriculumManifest, Topic, Subtopic } from '../../../core/models/curriculum.model';
import { Command } from '../../../core/models/command.model';
import { GlossaryTerm } from '../../../core/models/glossary.model';

export type NodeStatus = 'completed' | 'in_progress' | 'pending';
export type NodeType = 'root' | 'exam' | 'topic' | 'subtopic' | 'command' | 'term';

export interface MindMapNodeData {
  id: string;
  name: string;
  type: NodeType;
  code?: string;
  examId?: string;
  topicId?: string;
  subtopicId?: string;
  explainedIn?: string;
  description?: string;
  weight?: number;
  estimatedMinutes?: number;
  status: NodeStatus;
  children?: MindMapNodeData[];
}

export interface RenderNode {
  id: string;
  x: number;
  y: number;
  data: MindMapNodeData;
  depth: number;
  isMatch: boolean;
  isDimmed: boolean;
}

export interface RenderLink {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  path: string;
  isDimmed: boolean;
}

@Component({
  selector: 'app-mind-map-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mind-map-page.component.html',
  styleUrls: ['./mind-map-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindMapPageComponent implements OnInit, AfterViewInit {
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  @ViewChild('svgContainer', { static: false }) svgContainerRef?: ElementRef<SVGSVGElement>;

  readonly manifest = signal<CurriculumManifest | null>(null);
  readonly commands = signal<Command[]>([]);
  readonly glossary = signal<GlossaryTerm[]>([]);
  readonly userProgress = this.progressService.progress;

  readonly searchQuery = signal<string>('');
  readonly onlyPending = signal<boolean>(false);
  readonly showCommandsTerms = signal<boolean>(false);
  readonly selectedNode = signal<MindMapNodeData | null>(null);

  // Zoom y Pan
  readonly currentTransform = signal<ZoomTransform>(zoomIdentity);
  private zoomBehavior?: ZoomBehavior<SVGSVGElement, unknown>;

  // Dimensiones del lienzo virtual
  readonly canvasWidth = 2400;
  readonly canvasHeight = 2200;

  async ngOnInit(): Promise<void> {
    try {
      const [m, cmds, terms] = await Promise.all([
        this.contentService.getManifest(),
        this.contentService.getCommands(),
        this.contentService.getGlossary()
      ]);
      this.manifest.set(m);
      this.commands.set(cmds);
      this.glossary.set(terms);

      // Si zoomBehavior ya fue inicializado, centrar el árbol
      setTimeout(() => {
        if (this.zoomBehavior && this.layoutTree().nodes.length > 0) {
          this.fitToScreen();
        }
      }, 50);
    } catch {
      // Ignorar errores de carga
    }
  }

  ngAfterViewInit(): void {
    this.initZoom();
  }

  toggleCommandsTerms(): void {
    this.showCommandsTerms.update((v) => !v);
    setTimeout(() => {
      this.fitToScreen();
    }, 50);
  }

  // --- CONSTRUCCIÓN DEL ÁRBOL JERÁRQUICO ---
  readonly rawHierarchyData = computed<MindMapNodeData | null>(() => {
    const m = this.manifest();
    if (!m) return null;

    const progress = this.userProgress();
    const completedMap = progress.completedSubtopics;
    const viewedSlidesMap = progress.viewedSlides;
    const completedLabsMap = progress.completedLabs;
    const withDetails = this.showCommandsTerms();
    const allCmds = this.commands();
    const allTerms = this.glossary();

    const getSubtopicStatus = (s: Subtopic): NodeStatus => {
      if (completedMap[s.id]) return 'completed';
      const slides = viewedSlidesMap[s.id];
      if ((slides && slides.length > 0) || (s.labId && completedLabsMap[s.labId])) {
        return 'in_progress';
      }
      return 'pending';
    };

    const getTopicStatus = (subList: MindMapNodeData[]): NodeStatus => {
      if (subList.length === 0) return 'pending';
      const allCompleted = subList.every((s) => s.status === 'completed');
      if (allCompleted) return 'completed';
      const anyActive = subList.some((s) => s.status === 'completed' || s.status === 'in_progress');
      if (anyActive) return 'in_progress';
      return 'pending';
    };

    const examNodes: MindMapNodeData[] = m.exams.map((ex) => {
      const examTopics = m.topics.filter((t: Topic) => t.examId === ex.id);

      const topicNodes: MindMapNodeData[] = examTopics.map((t: Topic) => {
        const topicSubs = m.subtopics.filter((s: Subtopic) => s.topicId === t.id);

        const subNodes: MindMapNodeData[] = topicSubs.map((s: Subtopic) => {
          const detailChildren: MindMapNodeData[] = [];
          if (withDetails) {
            const subCmds = allCmds.filter((c) => c.subtopicIds?.includes(s.id));
            for (const c of subCmds) {
              detailChildren.push({
                id: `cmd-${s.id}-${c.id}`,
                name: c.name,
                type: 'command',
                code: c.name,
                subtopicId: s.id,
                topicId: t.id,
                examId: ex.id,
                explainedIn: (c.explainedIn && c.explainedIn[0]) || s.id,
                description: c.synopsis || c.description,
                status: getSubtopicStatus(s)
              });
            }

            const subTerms = allTerms.filter((term) => term.subtopicIds?.includes(s.id));
            for (const term of subTerms) {
              detailChildren.push({
                id: `term-${s.id}-${term.id}`,
                name: term.term,
                type: 'term',
                code: term.term,
                subtopicId: s.id,
                topicId: t.id,
                examId: ex.id,
                explainedIn: (term.explainedIn && term.explainedIn[0]) || s.id,
                description: term.definition,
                status: getSubtopicStatus(s)
              });
            }
          }

          return {
            id: s.id,
            name: s.title,
            type: 'subtopic',
            code: s.id,
            topicId: t.id,
            examId: ex.id,
            weight: s.weight,
            estimatedMinutes: s.estimatedMinutes,
            status: getSubtopicStatus(s),
            children: detailChildren.length > 0 ? detailChildren : undefined
          };
        });

        return {
          id: `topic-${t.id}`,
          name: t.title,
          type: 'topic',
          code: `Tema ${t.id}`,
          examId: ex.id,
          weight: t.weight,
          status: getTopicStatus(subNodes),
          children: subNodes
        };
      });

      const examStatus = getTopicStatus(topicNodes);

      return {
        id: `exam-${ex.id}`,
        name: ex.title,
        type: 'exam',
        code: `Examen ${ex.code}`,
        status: examStatus,
        children: topicNodes
      };
    });

    const rootStatus = getTopicStatus(examNodes);

    return {
      id: 'root-lpic1',
      name: 'LPIC-1: Linux Professional Institute Certification',
      type: 'root',
      code: 'LPIC-1',
      status: rootStatus,
      children: examNodes
    };
  });

  // --- CÁLCULO D3 TREE ---
  readonly layoutTree = computed<{ nodes: RenderNode[]; links: RenderLink[] }>(() => {
    const rootData = this.rawHierarchyData();
    if (!rootData) return { nodes: [], links: [] };

    // Disposición horizontal: nodeSize([distanciaVertical, distanciaHorizontal])
    const rootNode = hierarchy<MindMapNodeData>(rootData);
    const withDetails = this.showCommandsTerms();
    const treeLayout = tree<MindMapNodeData>().nodeSize(withDetails ? [36, 260] : [48, 300]);
    const layoutRoot = treeLayout(rootNode) as HierarchyPointNode<MindMapNodeData>;

    const query = this.searchQuery().trim().toLowerCase();
    const hideCompleted = this.onlyPending();

    // Encontrar límites verticales para centrar
    let minY = Infinity;
    let maxY = -Infinity;
    layoutRoot.each((d) => {
      const x = d.x ?? 0;
      if (x < minY) minY = x;
      if (x > maxY) maxY = x;
    });

    const offsetY = -minY + 60;
    const offsetX = 80;

    const renderedNodes: RenderNode[] = [];
    const renderedLinks: RenderLink[] = [];

    // Mapear nodos
    layoutRoot.each((d) => {
      const data = d.data;
      const isMatch = Boolean(
        query.length > 0 &&
          (data.name.toLowerCase().includes(query) ||
            (data.code && data.code.toLowerCase().includes(query)))
      );

      const isDimmed = hideCompleted && data.status === 'completed';

      renderedNodes.push({
        id: data.id,
        x: (d.y ?? 0) + offsetX,
        y: (d.x ?? 0) + offsetY,
        data,
        depth: d.depth,
        isMatch,
        isDimmed
      });
    });

    // Mapear enlaces con curvas Bézier cúbicas suaves
    layoutRoot.links().forEach((link, idx) => {
      const sx = (link.source.y ?? 0) + offsetX;
      const sy = (link.source.x ?? 0) + offsetY;
      const tx = (link.target.y ?? 0) + offsetX;
      const ty = (link.target.x ?? 0) + offsetY;

      const midX = (sx + tx) / 2;
      const path = `M ${sx},${sy} C ${midX},${sy} ${midX},${ty} ${tx},${ty}`;

      const isDimmed = hideCompleted && link.target.data.status === 'completed';

      renderedLinks.push({
        id: `link-${idx}`,
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
        path,
        isDimmed
      });
    });

    return { nodes: renderedNodes, links: renderedLinks };
  });

  readonly totalNodesCount = computed<number>(() => {
    return this.layoutTree().nodes.length;
  });

  // --- RESULTADOS DE BÚSQUEDA ---
  readonly searchResults = computed<MindMapNodeData[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.layoutTree()
      .nodes.filter((n) => n.isMatch)
      .map((n) => n.data);
  });

  // --- MINIMAPA VIEWPORT ---
  readonly minimapaViewport = computed<{ x: number; y: number; width: number; height: number }>(() => {
    const transform = this.currentTransform();
    const scale = transform.k;
    const visibleWidth = 800 / scale;
    const visibleHeight = 600 / scale;
    const visibleX = -transform.x / scale;
    const visibleY = -transform.y / scale;

    const miniScale = 0.08;
    return {
      x: Math.max(0, visibleX * miniScale),
      y: Math.max(0, visibleY * miniScale),
      width: Math.min(160, visibleWidth * miniScale),
      height: Math.min(110, visibleHeight * miniScale)
    };
  });

  // --- MÉTODOS DE ZOOM / CONTROLES ---
  initZoom(): void {
    if (!this.svgContainerRef) return;
    const svgEl = this.svgContainerRef.nativeElement;
    const width = svgEl.clientWidth || 900;
    const height = svgEl.clientHeight || 650;

    this.zoomBehavior = zoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [width, height]
      ])
      .scaleExtent([0.1, 3.0])
      .on('zoom', (event) => {
        this.currentTransform.set(event.transform);
      });

    select(svgEl).call(this.zoomBehavior);

    // Ajuste inicial si hay nodos
    if (this.layoutTree().nodes.length > 0) {
      this.fitToScreen();
    }
  }

  zoomIn(): void {
    if (!this.svgContainerRef || !this.zoomBehavior) return;
    select(this.svgContainerRef.nativeElement)
      .call(this.zoomBehavior.scaleBy, 1.25);
  }

  zoomOut(): void {
    if (!this.svgContainerRef || !this.zoomBehavior) return;
    select(this.svgContainerRef.nativeElement)
      .call(this.zoomBehavior.scaleBy, 0.8);
  }

  resetZoom(): void {
    if (!this.svgContainerRef || !this.zoomBehavior) return;
    select(this.svgContainerRef.nativeElement)
      .call(this.zoomBehavior.transform, zoomIdentity);
  }

  fitToScreen(): void {
    if (!this.svgContainerRef || !this.zoomBehavior) return;
    const svgEl = this.svgContainerRef.nativeElement;
    const width = svgEl.clientWidth || 900;
    const height = svgEl.clientHeight || 650;

    const nodes = this.layoutTree().nodes;
    if (nodes.length === 0) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }

    const treeW = maxX - minX + 350;
    const treeH = maxY - minY + 100;

    const scale = Math.min(width / treeW, height / treeH, 0.9);
    const tx = (width - treeW * scale) / 2 - minX * scale + 40;
    const ty = (height - treeH * scale) / 2 - minY * scale + 20;

    const initialTransform = zoomIdentity.translate(tx, ty).scale(scale);

    select(svgEl)
      .call(this.zoomBehavior.transform, initialTransform);
  }

  focusNode(nodeData: MindMapNodeData): void {
    if ((nodeData.type === 'command' || nodeData.type === 'term') && !this.showCommandsTerms()) {
      this.showCommandsTerms.set(true);
    }
    this.selectedNode.set(nodeData);

    setTimeout(() => {
      const node = this.layoutTree().nodes.find((n) => n.id === nodeData.id);
      if (!node || !this.svgContainerRef || !this.zoomBehavior) return;

      const svgEl = this.svgContainerRef.nativeElement;
      const width = svgEl.clientWidth || 900;
      const height = svgEl.clientHeight || 650;

      const targetScale = 1.0;
      const tx = width / 2 - node.x * targetScale;
      const ty = height / 2 - node.y * targetScale;

      select(svgEl)
        .call(this.zoomBehavior.transform, zoomIdentity.translate(tx, ty).scale(targetScale));
    }, 50);
  }

  selectNode(nodeData: MindMapNodeData): void {
    this.selectedNode.set(nodeData);
  }

  closeDrawer(): void {
    this.selectedNode.set(null);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  toggleOnlyPending(): void {
    this.onlyPending.update((v) => !v);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      this.zoomOut();
    } else if (event.key === '0') {
      event.preventDefault();
      this.fitToScreen();
    } else if (event.key === 'Escape') {
      if (this.selectedNode()) {
        event.preventDefault();
        this.closeDrawer();
      }
    }
  }
}
