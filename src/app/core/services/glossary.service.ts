import { Injectable, inject } from '@angular/core';
import { ContentService } from './content.service';
import { GlossaryTerm } from '../models/glossary.model';

export interface AlphaIndexItem {
  letter: string;
  hasTerms: boolean;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class GlossaryService {
  private readonly contentService = inject(ContentService);

  readonly alphabet: readonly string[] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  async getTerms(): Promise<GlossaryTerm[]> {
    const list = await this.contentService.getGlossary();
    return [...list].sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }));
  }

  async getTermById(id: string): Promise<GlossaryTerm | undefined> {
    const terms = await this.getTerms();
    return terms.find((t) => t.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Genera la lista de letras de la A a la Z con información de disponibilidad y recuento.
   */
  getAlphabetIndex(terms: GlossaryTerm[]): AlphaIndexItem[] {
    const countsByLetter = new Map<string, number>();

    for (const item of terms) {
      const initial = this.getNormalizedInitial(item.term);
      countsByLetter.set(initial, (countsByLetter.get(initial) ?? 0) + 1);
    }

    return this.alphabet.map((letter) => {
      const count = countsByLetter.get(letter) ?? 0;
      return {
        letter,
        hasTerms: count > 0,
        count
      };
    });
  }

  /**
   * Agrupa los términos por su letra inicial en mayúscula.
   */
  groupTermsByLetter(terms: GlossaryTerm[]): Record<string, GlossaryTerm[]> {
    const grouped: Record<string, GlossaryTerm[]> = {};

    for (const item of terms) {
      const initial = this.getNormalizedInitial(item.term);
      if (!grouped[initial]) {
        grouped[initial] = [];
      }
      grouped[initial].push(item);
    }

    return grouped;
  }

  /**
   * Filtra términos por búsqueda de texto (término y definición).
   */
  filterTerms(terms: GlossaryTerm[], query: string): GlossaryTerm[] {
    const cleanQuery = this.normalize(query);
    if (!cleanQuery) return terms;

    return terms.filter((item) => {
      const termNorm = this.normalize(item.term);
      const defNorm = this.normalize(item.definition);
      const relNorm = item.related ? item.related.map((r) => this.normalize(r)).join(' ') : '';

      return termNorm.includes(cleanQuery) || defNorm.includes(cleanQuery) || relNorm.includes(cleanQuery);
    });
  }

  private getNormalizedInitial(term: string): string {
    if (!term) return '#';
    const norm = this.normalize(term);
    const firstChar = norm.charAt(0).toUpperCase();
    return this.alphabet.includes(firstChar) ? firstChar : '#';
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

