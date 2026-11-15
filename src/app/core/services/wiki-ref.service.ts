import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ContentService } from './content.service';
import { WikiAnchorRect, WikiLocation, WikiRefData } from '../models/wiki-ref.model';
import { Command } from '../models/command.model';
import { GlossaryTerm } from '../models/glossary.model';

@Injectable({
  providedIn: 'root'
})
export class WikiRefService implements OnDestroy {
  private readonly contentService = inject(ContentService);
  private readonly document = inject(DOCUMENT);

  readonly activePopover = signal<WikiRefData | null>(null);

  private commandsCache: Map<string, Command> | null = null;
  private glossaryCache: Map<string, GlossaryTerm> | null = null;
  private ensureCachesPromise: Promise<void> | null = null;

  private currentAnchor: HTMLElement | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  private cleanupListeners: (() => void) | null = null;

  constructor() {
    this.initGlobalListeners();
  }

  ngOnDestroy(): void {
    if (this.cleanupListeners) {
      this.cleanupListeners();
      this.cleanupListeners = null;
    }
    this.closePopover();
  }

  /**
   * Delegación global de eventos sobre conceptos, comandos y glosario en el documento.
   * Cubre tanto la vista continua como diapositivas, tablas, pasos y paneles de referencia.
   */
  private initGlobalListeners(): void {
    if (typeof window === 'undefined' || !this.document) return;

    const selector = 'a.term-link, a.wiki-ref, [data-term-ref], [data-cmd], [data-term]';

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest(selector) as HTMLElement | null;
      if (!anchor) return;

      const related = event.relatedTarget as Node | null;
      if (related && anchor.contains(related)) return;

      this.onTargetEnter(anchor);
    };

    const onMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest(selector) as HTMLElement | null;
      if (!anchor) return;

      const related = event.relatedTarget as Node | null;
      if (related && anchor.contains(related)) return;
      if (related && (related as HTMLElement).closest?.('.term-link-card, .wiki-popover-overlay')) return;

      this.onTargetLeave();
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest(selector) as HTMLElement | null;
      if (anchor) {
        this.openImmediately(anchor);
      }
    };

    const onFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest(selector) as HTMLElement | null;
      if (anchor) {
        this.onTargetLeave();
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest(selector) as HTMLElement | null;
      if (anchor) {
        // Evitar navegación accidental o recarga; abrir/mantener inmediatamente el popup
        event.preventDefault();
        this.openImmediately(anchor);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.activePopover()) {
        this.closePopover();
      }
    };

    const onScrollOrResize = () => {
      if (this.activePopover() && this.currentAnchor) {
        const rect = this.currentAnchor.getBoundingClientRect();
        // Si el anchor sale de la pantalla visible, cerrar
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          this.closePopover();
        } else {
          this.updateAnchorPosition(this.currentAnchor);
        }
      }
    };

    this.document.addEventListener('mouseover', onMouseOver, true);
    this.document.addEventListener('mouseout', onMouseOut, true);
    this.document.addEventListener('focusin', onFocusIn, true);
    this.document.addEventListener('focusout', onFocusOut, true);
    this.document.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    this.cleanupListeners = () => {
      this.document.removeEventListener('mouseover', onMouseOver, true);
      this.document.removeEventListener('mouseout', onMouseOut, true);
      this.document.removeEventListener('focusin', onFocusIn, true);
      this.document.removeEventListener('focusout', onFocusOut, true);
      this.document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }

  onTargetEnter(anchor: HTMLElement): void {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }

    // Si ya estamos esperando abrir este mismo anchor o ya está abierto, no reiniciar el timer
    if (this.currentAnchor === anchor) {
      if (this.hoverTimer) {
        return;
      }
      if (this.activePopover()) {
        return;
      }
    }

    this.currentAnchor = anchor;

    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }

    // Si ya hay un popover abierto de otro término, el cambio debe ser ágil (120ms)
    const delay = this.activePopover() ? 120 : 200;

    this.hoverTimer = setTimeout(() => {
      this.hoverTimer = null;
      this.resolveForAnchor(anchor);
    }, delay);
  }

  onTargetLeave(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
    }
    // Margen de gracia generoso (250ms) para que el cursor cruce al popover sin que se cierre
    this.leaveTimer = setTimeout(() => {
      this.leaveTimer = null;
      this.closePopover();
    }, 250);
  }

  keepOpen(): void {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
  }

  openImmediately(anchor: HTMLElement): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
    this.hoverTimer = null;
    this.leaveTimer = null;
    this.currentAnchor = anchor;
    this.resolveForAnchor(anchor);
  }

  private updateAnchorPosition(anchor: HTMLElement): void {
    const current = this.activePopover();
    if (!current) return;
    const rect = anchor.getBoundingClientRect();
    this.activePopover.set({
      ...current,
      x: rect.left,
      y: rect.bottom,
      anchorRect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      }
    });
  }

  private resolveForAnchor(anchor: HTMLElement): void {
    const rect = anchor.getBoundingClientRect();
    const anchorRect: WikiAnchorRect = {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height
    };

    const cmd = anchor.getAttribute('data-cmd');
    const term = anchor.getAttribute('data-term');
    const termRef = anchor.getAttribute('data-term-ref');
    const href = anchor.getAttribute('href') || '';
    const title = anchor.getAttribute('title') || '';

    let type: 'command' | 'term' = 'command';
    let id = '';

    if (termRef) {
      if (termRef.startsWith('cmd:')) {
        type = 'command';
        id = termRef.substring(4);
      } else if (termRef.startsWith('term:')) {
        type = 'term';
        id = termRef.substring(5);
      }
    } else if (cmd) {
      type = 'command';
      id = cmd;
    } else if (term) {
      type = 'term';
      id = term;
    } else if (href.includes('/comandos?q=')) {
      type = 'command';
      const m = href.match(/[?&]q=([^&]+)/);
      if (m && m[1]) id = decodeURIComponent(m[1]);
    } else if (href.includes('/glosario?q=')) {
      type = 'term';
      const m = href.match(/[?&]q=([^&]+)/);
      if (m && m[1]) id = decodeURIComponent(m[1]);
    }

    // Extracción de respaldo desde el atributo title ("Comando: grep", "Término: usb")
    if (!id && title) {
      const matchCmd = title.match(/Comando:\s*([^\s]+)/i);
      if (matchCmd && matchCmd[1]) {
        type = 'command';
        id = matchCmd[1];
      } else {
        const matchTerm = title.match(/T[ée]rmino:\s*([^\s]+)/i);
        if (matchTerm && matchTerm[1]) {
          type = 'term';
          id = matchTerm[1];
        }
      }
    }

    // Extracción de respaldo desde el contenido textual del enlace
    if (!id) {
      const text = anchor.textContent?.trim().replace(/^[💻📖]\s*/, '') || '';
      if (text) {
        if (anchor.classList.contains('wiki-cmd-link')) {
          type = 'command';
          id = text;
        } else if (anchor.classList.contains('wiki-term-link')) {
          type = 'term';
          id = text;
        }
      }
    }

    if (id) {
      // Coordenadas relativas estrictamente al VIEWPORT (rect.left, rect.bottom), sin window.scrollY
      this.resolveRef(type, id.trim(), rect.left, rect.bottom, anchorRect);
    }
  }

  async resolveRef(
    type: 'command' | 'term',
    id: string,
    x: number,
    y: number,
    anchorRect?: WikiAnchorRect
  ): Promise<void> {
    // Normalizar si algún llamador antiguo sumó window.scrollY
    if (typeof window !== 'undefined' && window.scrollY > 0 && y > window.innerHeight && y >= window.scrollY) {
      y = y - window.scrollY;
    }

    const effectiveRect: WikiAnchorRect = anchorRect ?? {
      top: y - 24,
      bottom: y,
      left: x,
      right: x + 60,
      width: 60,
      height: 24
    };

    await this.ensureCaches();

    if (type === 'command') {
      const cmd = this.commandsCache?.get(id.toLowerCase());
      if (cmd) {
        const locations = this.buildLocations(cmd.name, cmd.explainedIn);
        this.activePopover.set({
          type: 'command',
          id,
          title: cmd.name,
          badge: 'Comando LPIC-1',
          synopsis: cmd.synopsis,
          short: cmd.short || cmd.description.slice(0, 180),
          description: cmd.description,
          link: `/comandos?q=${encodeURIComponent(cmd.name)}`,
          targetPath: '/comandos',
          queryParams: { q: cmd.name },
          locations,
          sinExplicacion: cmd.sinExplicacion,
          x,
          y,
          anchorRect: effectiveRect
        });
      } else {
        // Fallback
        this.activePopover.set({
          type: 'command',
          id,
          title: id,
          badge: 'Comando GNU/Linux',
          synopsis: `${id} [opciones] [argumentos]`,
          short: `Comando estándar del sistema operativo Linux para el examen LPIC-1.`,
          description: `Comando estándar del sistema operativo Linux para el examen LPIC-1.`,
          link: `/comandos?q=${encodeURIComponent(id)}`,
          targetPath: '/comandos',
          queryParams: { q: id },
          sinExplicacion: 'Comando complementario de Linux.',
          x,
          y,
          anchorRect: effectiveRect
        });
      }
    } else {
      const term = this.glossaryCache?.get(id.toLowerCase());
      if (term) {
        const locations = this.buildLocations(term.term, term.explainedIn);
        this.activePopover.set({
          type: 'term',
          id,
          title: term.term,
          badge: 'Glosario Oficial',
          short: term.short || term.definition.slice(0, 180),
          description: term.definition,
          link: `/glosario?q=${encodeURIComponent(term.term)}`,
          targetPath: '/glosario',
          queryParams: { q: term.term },
          locations,
          sinExplicacion: term.sinExplicacion,
          x,
          y,
          anchorRect: effectiveRect
        });
      } else {
        // Fallback
        this.activePopover.set({
          type: 'term',
          id,
          title: id,
          badge: 'Concepto Clave',
          short: `Término fundamental evaluado en los objetivos oficiales de certificación LPIC-1.`,
          description: `Término fundamental evaluado en los objetivos oficiales de certificación LPIC-1.`,
          link: `/glosario?q=${encodeURIComponent(id)}`,
          targetPath: '/glosario',
          queryParams: { q: id },
          sinExplicacion: 'Concepto evaluado en el temario general.',
          x,
          y,
          anchorRect: effectiveRect
        });
      }
    }
  }

  private buildLocations(termName: string, explainedIn?: string[]): WikiLocation[] {
    if (!explainedIn || explainedIn.length === 0) return [];
    const res: WikiLocation[] = [];

    for (let i = 0; i < explainedIn.length; i++) {
      const loc = explainedIn[i];
      if (!loc) continue;
      const match = loc.match(/^(\d{3}\.\d)#(\d+)$/);
      if (match && match[1] && match[2]) {
        const subtopicId = match[1];
        const slideNumber = parseInt(match[2], 10);
        const prefix = i === 0 ? 'Se explica en: ' : 'También en: ';
        res.push({
          subtopicId,
          slideNumber,
          label: `${prefix}${subtopicId} · Diapositiva ${slideNumber}`,
          link: `/estudiar/${subtopicId}`,
          queryParams: { slide: slideNumber, q: termName }
        });
      }
    }
    return res;
  }

  closePopover(): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
    this.hoverTimer = null;
    this.leaveTimer = null;
    this.currentAnchor = null;
    this.activePopover.set(null);
  }

  private async ensureCaches(): Promise<void> {
    if (this.commandsCache && this.glossaryCache) return;
    if (this.ensureCachesPromise) return this.ensureCachesPromise;

    this.ensureCachesPromise = (async () => {
      if (!this.commandsCache) {
        this.commandsCache = new Map();
        try {
          const cmds = await this.contentService.getCommands();
          cmds.forEach((c) => {
            this.commandsCache!.set(c.id.toLowerCase(), c);
            this.commandsCache!.set(c.name.toLowerCase(), c);
          });
        } catch {
          // Se llenará con fallbacks
        }
      }

      if (!this.glossaryCache) {
        this.glossaryCache = new Map();
        try {
          const terms = await this.contentService.getGlossary();
          terms.forEach((t) => {
            this.glossaryCache!.set(t.id.toLowerCase(), t);
            this.glossaryCache!.set(t.term.toLowerCase(), t);
          });
        } catch {
          // Se llenará con fallbacks
        }
      }
    })();

    return this.ensureCachesPromise;
  }
}
