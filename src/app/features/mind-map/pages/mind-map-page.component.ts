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

export const LPIC_TOPIC_SUMMARIES: Record<string, string> = {
  '101': 'Arquitectura del sistema: hardware y configuración (BIOS/UEFI, PCI, USB), secuencia de arranque del kernel e initramfs, y niveles de ejecución (SysVinit, systemd targets, shutdown y reboot).',
  '102': 'Instalación de Linux y paquetes: diseño del esquema de particiones, gestor de arranque GRUB 2, librerías compartidas (ldconfig, ldd), empaquetado Debian (dpkg, apt), RPM/YUM/DNF y virtualización.',
  '103': 'Comandos GNU y Unix: línea de comandos Bash, variables de entorno, tuberías y redirecciones (pipes, tee), procesamiento de texto con filtros (grep, sed, awk, cut, sort) y gestión de procesos (ps, top, kill, nice).',
  '104': 'Dispositivos y sistemas de archivos: particionamiento, formateo (mkfs, fsck), montaje (/etc/fstab, mount/umount), cuotas de disco, permisos tradicionales (chmod, chown, umask) y especiales (SUID, SGID, Sticky bit).',
  '105': 'Shells y scripts: personalización del entorno Bash (.bashrc, .bash_profile), alias, funciones y desarrollo de scripts en shell estándar (condicionales if, bucles for/while, argumentos posicionales y códigos de salida).',
  '106': 'Interfaces de usuario y escritorios: servidor gráfico X11 (configuración, display, xhost), protocolo Wayland, escritorios (GNOME, KDE) y tecnologías de accesibilidad (lectores de pantalla, lupa y teclados virtuales).',
  '107': 'Tareas administrativas: gestión de cuentas de usuario y grupos (/etc/passwd, /etc/shadow, useradd, usermod), programación de tareas periódicas con Cron (crontab) y systemd timers, y localización (locales, tzselect, UTF-8).',
  '108': 'Servicios esenciales: sincronización horaria del sistema (NTP, chrony, timedatectl), demonios de registro y logs (syslog, rsyslog, journalctl), agentes de transporte de correo MTA y gestión de impresión con CUPS.',
  '109': 'Fundamentos de redes: arquitectura TCP/IP (IPv4, IPv6, CIDR, puertos estándar), configuración y diagnóstico de interfaces (ip, ifconfig, nmcli), resolución DNS (/etc/resolv.conf, /etc/hosts) y herramientas de red (ping, traceroute, netstat, ss).',
  '110': 'Seguridad del sistema: auditoría de seguridad básica, límites de recursos (/etc/security/limits.conf), supervisión de puertos y conexiones (nmap, lsof), configuración de SSH seguro (claves, sshd_config) y cifrado GPG (claves, firmas y cifrado).'
};

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

  readonly selectedNodeSummary = computed<string>(() => {
    const node = this.selectedNode();
    if (!node) return '';
    if (node.type === 'topic') {
      const topicId = node.topicId || node.id.replace('topic-', '');
      return LPIC_TOPIC_SUMMARIES[topicId] || node.description || 'Tema oficial del examen LPIC-1.';
    }
    if (node.type === 'subtopic') {
      const m = this.manifest();
      const sub = m?.subtopics.find((s) => s.id === node.id);
      if (sub?.keyAreas && sub.keyAreas.length > 0) {
        return sub.keyAreas.join(' · ');
      }
      return node.description || `Subtema oficial ${node.id} del temario LPIC-1.`;
    }
    if (node.type === 'exam') {
      return node.description || 'Examen oficial de certificación Linux Professional Institute LPIC-1.';
    }
    return node.description || '';
  });

  readonly selectedNodeCommands = computed<Command[]>(() => {
    const node = this.selectedNode();
    if (!node) return [];
    const allCmds = this.commands();
    if (node.type === 'subtopic') {
      return allCmds.filter((c) => c.subtopicIds?.includes(node.id));
    }
    if (node.type === 'topic') {
      const topicId = node.topicId || node.id.replace('topic-', '');
      const m = this.manifest();
      const subs = m?.subtopics.filter((s) => s.topicId === topicId).map((s) => s.id) || [];
      return allCmds.filter((c) => c.subtopicIds?.some((sid) => subs.includes(sid)));
    }
    if (node.type === 'exam') {
      const examId = node.examId || node.id.replace('exam-', '');
      const m = this.manifest();
      const topics = m?.topics.filter((t) => t.examId === examId).map((t) => t.id) || [];
      const subs = m?.subtopics.filter((s) => topics.includes(s.topicId)).map((s) => s.id) || [];
      return allCmds.filter((c) => c.subtopicIds?.some((sid) => subs.includes(sid))).slice(0, 24);
    }
    if (node.type === 'command') {
      return allCmds.filter((c) => c.name === node.name);
    }
    return [];
  });

  getNodeWidth(node: RenderNode): number {
    switch (node.depth) {
      case 0:
        return 270;
      case 1:
        return 230;
      case 2:
        return 230;
      case 3:
        return 250;
      case 4:
      default:
        return 190;
    }
  }

  getNodeHeight(node: RenderNode): number {
    return node.depth === 4 ? 28 : 36;
  }

  getTruncatedNodeLabel(node: RenderNode): { codePrefix?: string; name: string } {
    const data = node.data;
    if (node.depth === 4 && data.type === 'command') {
      const name = data.name.length > 20 ? data.name.slice(0, 19) + '…' : data.name;
      return { name: `$ ${name}` };
    }
    if (node.depth === 4 && data.type === 'term') {
      const name = data.name.length > 18 ? data.name.slice(0, 17) + '…' : data.name;
      return { name: `📖 ${name}` };
    }

    const maxChars = node.depth === 0 ? 32 : node.depth === 1 ? 26 : node.depth === 2 ? 26 : 30;
    const code = data.code ? `${data.code}: ` : '';
    const fullText = data.name || '';

    const availableForName = Math.max(12, maxChars - code.length);
    const truncatedName = fullText.length > availableForName
      ? fullText.slice(0, availableForName - 1) + '…'
      : fullText;

    return {
      codePrefix: code || undefined,
      name: truncatedName
    };
  }

  getFullNodeTitle(node: RenderNode): string {
    const d = node.data;
    const prefix = d.code ? `${d.code}: ` : '';
    return `${prefix}${d.name} (${d.status})`;
  }

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
          description: LPIC_TOPIC_SUMMARIES[t.id] || t.title,
          status: getTopicStatus(subNodes),
          children: subNodes
        };
      });

      const examStatus = getTopicStatus(topicNodes);
      const shortExamName = ex.code === '101-500' || ex.id === '101'
        ? 'Sistema, Paquetes y GNU/Unix'
        : 'Shells, Redes y Seguridad';

      return {
        id: `exam-${ex.id}`,
        name: shortExamName,
        type: 'exam',
        code: `Examen ${ex.code}`,
        description: ex.title,
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

    // Garantizar escala legible mínima para evitar colapso a texto microscópico (A8-006, S-10)
    const rawScale = Math.min(width / treeW, height / treeH, 0.9);
    const scale = Math.max(0.55, rawScale);
    const tx = Math.max(20, (width - treeW * scale) / 2 - minX * scale + 40);
    const ty = Math.max(20, (height - treeH * scale) / 2 - minY * scale + 20);

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
