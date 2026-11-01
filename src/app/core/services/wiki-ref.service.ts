import { Injectable, inject, signal } from '@angular/core';
import { ContentService } from './content.service';
import { WikiLocation, WikiRefData } from '../models/wiki-ref.model';
import { Command } from '../models/command.model';
import { GlossaryTerm } from '../models/glossary.model';

@Injectable({
  providedIn: 'root'
})
export class WikiRefService {
  private readonly contentService = inject(ContentService);

  readonly activePopover = signal<WikiRefData | null>(null);

  private commandsCache: Map<string, Command> | null = null;
  private glossaryCache: Map<string, GlossaryTerm> | null = null;

  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  onTargetEnter(anchor: HTMLElement): void {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }
    this.hoverTimer = setTimeout(() => {
      this.resolveForAnchor(anchor);
    }, 250);
  }

  onTargetLeave(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
    }
    this.leaveTimer = setTimeout(() => {
      this.closePopover();
    }, 150);
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
    this.resolveForAnchor(anchor);
  }

  private resolveForAnchor(anchor: HTMLElement): void {
    const rect = anchor.getBoundingClientRect();
    const cmd = anchor.getAttribute('data-cmd');
    const term = anchor.getAttribute('data-term');
    const termRef = anchor.getAttribute('data-term-ref');
    const href = anchor.getAttribute('href') || '';

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

    if (id) {
      this.resolveRef(type, id, rect.left, rect.bottom + window.scrollY);
    }
  }

  async resolveRef(type: 'command' | 'term', id: string, x: number, y: number): Promise<void> {
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
          locations,
          sinExplicacion: cmd.sinExplicacion,
          x,
          y
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
          sinExplicacion: 'Comando complementario de Linux.',
          x,
          y
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
          locations,
          sinExplicacion: term.sinExplicacion,
          x,
          y
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
          sinExplicacion: 'Concepto evaluado en el temario general.',
          x,
          y
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
    this.activePopover.set(null);
  }

  private async ensureCaches(): Promise<void> {
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
  }
}
