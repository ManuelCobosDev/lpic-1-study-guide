import { Injectable, inject } from '@angular/core';
import { ContentService } from './content.service';
import { Command } from '../models/command.model';

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private readonly contentService = inject(ContentService);

  async getCommands(): Promise<Command[]> {
    return this.contentService.getCommands();
  }

  async getCommandById(id: string): Promise<Command | undefined> {
    const commands = await this.getCommands();
    return commands.find((c) => c.id.toLowerCase() === id.toLowerCase());
  }

  async getCategories(): Promise<string[]> {
    const commands = await this.getCommands();
    const set = new Set<string>();
    for (const cmd of commands) {
      if (cmd.category) {
        set.add(cmd.category);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }

  /**
   * Filtra comandos por texto de búsqueda, categoría y tema/subtema.
   */
  filterCommands(
    commands: Command[],
    query: string,
    category: string,
    topicId: string
  ): Command[] {
    const cleanQuery = this.normalize(query);
    const hasQuery = cleanQuery.length > 0;
    const hasCategory = category && category !== 'todas' && category.trim() !== '';
    const hasTopic = topicId && topicId !== 'todos' && topicId.trim() !== '';

    return commands.filter((cmd) => {
      // Filtro por categoría
      if (hasCategory && cmd.category !== category) {
        return false;
      }

      // Filtro por tema (ej. "103" coincide con subtemas "103.4", o "103.4" exacto)
      if (hasTopic) {
        const matchesTopic = cmd.subtopicIds.some(
          (subId) => subId === topicId || subId.startsWith(`${topicId}.`)
        );
        if (!matchesTopic) {
          return false;
        }
      }

      // Filtro por texto
      if (hasQuery) {
        const nameNorm = this.normalize(cmd.name);
        const descNorm = this.normalize(cmd.description);
        const synNorm = this.normalize(cmd.synopsis);
        const exNorm = this.normalize(cmd.example);
        const flagsNorm = cmd.flags.map((f) => `${this.normalize(f.flag)} ${this.normalize(f.description)}`).join(' ');

        const inText =
          nameNorm.includes(cleanQuery) ||
          descNorm.includes(cleanQuery) ||
          synNorm.includes(cleanQuery) ||
          exNorm.includes(cleanQuery) ||
          flagsNorm.includes(cleanQuery);

        if (!inText) {
          return false;
        }
      }

      return true;
    });
  }

  private normalize(text: string | null | undefined): string {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

