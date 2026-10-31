import { Injectable, inject, signal } from '@angular/core';
import { ContentService } from './content.service';
import { WikiRefData } from '../models/wiki-ref.model';

@Injectable({
  providedIn: 'root'
})
export class WikiRefService {
  private readonly contentService = inject(ContentService);

  readonly activePopover = signal<WikiRefData | null>(null);

  private commandsCache: Map<string, { name: string; synopsis: string; description: string }> | null = null;
  private glossaryCache: Map<string, { term: string; definition: string }> | null = null;

  async resolveRef(type: 'command' | 'term', id: string, x: number, y: number): Promise<void> {
    await this.ensureCaches();

    if (type === 'command') {
      const cmd = this.commandsCache?.get(id.toLowerCase());
      if (cmd) {
        this.activePopover.set({
          type: 'command',
          id,
          title: cmd.name,
          badge: 'Comando LPIC-1',
          synopsis: cmd.synopsis,
          description: cmd.description,
          link: `/comandos?q=${encodeURIComponent(cmd.name)}`,
          x,
          y
        });
      } else {
        // Fallback genérico
        this.activePopover.set({
          type: 'command',
          id,
          title: id,
          badge: 'Comando GNU/Linux',
          synopsis: `${id} [opciones] [argumentos]`,
          description: `Comando estándar del sistema operativo Linux para el examen LPIC-1.`,
          link: `/comandos?q=${encodeURIComponent(id)}`,
          x,
          y
        });
      }
    } else {
      const term = this.glossaryCache?.get(id.toLowerCase());
      if (term) {
        this.activePopover.set({
          type: 'term',
          id,
          title: term.term,
          badge: 'Glosario Oficial',
          description: term.definition,
          link: `/glosario?q=${encodeURIComponent(term.term)}`,
          x,
          y
        });
      } else {
        // Fallback genérico
        this.activePopover.set({
          type: 'term',
          id,
          title: id,
          badge: 'Concepto Clave',
          description: `Término fundamental evaluado en los objetivos oficiales de certificación LPIC-1.`,
          link: `/glosario?q=${encodeURIComponent(id)}`,
          x,
          y
        });
      }
    }
  }

  closePopover(): void {
    this.activePopover.set(null);
  }

  private async ensureCaches(): Promise<void> {
    if (!this.commandsCache) {
      this.commandsCache = new Map();
      try {
        const cmds = await this.contentService.getCommands();
        cmds.forEach((c) => {
          this.commandsCache!.set(c.name.toLowerCase(), {
            name: c.name,
            synopsis: c.synopsis,
            description: c.description
          });
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
          this.glossaryCache!.set(t.term.toLowerCase(), {
            term: t.term,
            definition: t.definition
          });
        });
      } catch {
        // Se llenará con fallbacks
      }
    }
  }
}
