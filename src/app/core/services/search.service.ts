import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { ContentService } from './content.service';
import { SearchEngine } from '../engines/search/search.engine';
import {
  SearchOptions,
  SearchResultItem,
  SearchIndexSource
} from '../models/search.model';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 8;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly storage = inject(StorageService);
  private readonly contentService = inject(ContentService);

  private readonly engine = new SearchEngine();
  private indexPromise: Promise<void> | null = null;

  readonly indexingStatus = signal<'idle' | 'indexing' | 'ready' | 'error'>('idle');
  readonly isPaletteOpen = signal<boolean>(false);
  readonly recentSearches = signal<string[]>([]);

  constructor() {
    this.loadRecentSearches();
    this.initGlobalShortcuts();
  }

  private loadRecentSearches(): void {
    const raw = this.storage.getItem(RECENT_SEARCHES_KEY);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.recentSearches.set(list.slice(0, MAX_RECENT_SEARCHES));
        }
      } catch {
        this.recentSearches.set([]);
      }
    }
  }

  private initGlobalShortcuts(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (event: KeyboardEvent) => {
        const isModifier = event.ctrlKey || event.metaKey;
        const target = event.target as HTMLElement | null;
        const isInput =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable);

        if (isModifier && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          this.togglePalette();
          return;
        }

        if (event.key === '/' && !isInput && !isModifier) {
          event.preventDefault();
          this.openPalette();
        }
      });
    }
  }

  async ensureIndex(): Promise<void> {
    if (this.indexingStatus() === 'ready') {
      return;
    }
    if (this.indexPromise) {
      return this.indexPromise;
    }

    this.indexingStatus.set('indexing');

    this.indexPromise = (async () => {
      try {
        const manifest = await this.contentService.getManifest();
        const commands = await this.contentService.getCommands().catch(() => []);
        const terms = await this.contentService.getGlossary().catch(() => []);
        const errata = await this.contentService.getErrata().catch(() => []);

        const source: SearchIndexSource = {
          subtopics: [],
          slides: [],
          commands: commands.map((c) => ({
            name: c.name,
            summary: c.synopsis,
            description: c.description,
            flags: c.flags?.map((f) => f.flag) ?? [],
            subtopicId: c.subtopicIds?.[0]
          })),
          terms: terms.map((t) => ({
            term: t.term,
            definition: t.definition,
            subtopicId: t.subtopicIds?.[0]
          })),
          errata: errata.map((e) => ({
            id: e.id,
            title: `Fe de erratas: ${e.page}`,
            description: `${e.description} - Corrección: ${e.correction}`
          })),
          pages: [
            {
              id: 'home',
              title: 'Inicio · Aula Virtual LPIC-1',
              description: 'Panel general de progreso, exámenes 101 y 102, simuladores y prácticas.',
              url: '/'
            },
            {
              id: 'curriculum',
              title: 'Temario Oficial LPIC-1',
              description: 'Temario completo con todos los temas, objetivos y pesos ponderados.',
              url: '/temario'
            },
            {
              id: 'style-guide',
              title: 'Guía de Estilos y Diseño',
              description: 'Tokens de diseño, componentes y catálogo de estilos del sistema.',
              url: '/guia-estilos'
            }
          ]
        };

        // Procesar subtemas y lecciones cargadas
        for (const sub of manifest.subtopics) {
          source.subtopics.push({
            id: sub.id,
            topicId: sub.topicId,
            title: sub.title
          });

          // Intentar obtener lección detallada si está disponible
          try {
            const lesson = await this.contentService.getLesson(sub.id);
            if (lesson && lesson.slides) {
              for (const slide of lesson.slides) {
                const headings: string[] = [];
                const texts: string[] = [];
                const codes: string[] = [];

                for (const b of slide.blocks) {
                  if (b.type === 'heading') headings.push(b.text);
                  else if (b.type === 'paragraph') texts.push(b.text);
                  else if (b.type === 'code') codes.push(b.code);
                  else if (b.type === 'terminal') {
                    codes.push(b.lines.map((l) => l.command ?? '').join(' '));
                  }
                }

                source.slides.push({
                  subtopicId: sub.id,
                  topicId: sub.topicId,
                  slideNumber: slide.slideNumber,
                  title: slide.title,
                  headings,
                  text: texts.join(' '),
                  code: codes,
                  notes: slide.notes
                });
              }
            }
          } catch {
            // Si la lección no está disponible o es placeholder, solo se indexa el subtema
          }
        }

        this.engine.indexAll(source);
        this.indexingStatus.set('ready');
      } catch (err) {
        this.indexingStatus.set('error');
        throw err;
      } finally {
        this.indexPromise = null;
      }
    })();

    return this.indexPromise;
  }

  search(query: string, options?: SearchOptions): SearchResultItem[] {
    if (this.indexingStatus() !== 'ready') {
      // Disparar indexación si aún no se ha hecho
      void this.ensureIndex();
    }
    return this.engine.search(query, options);
  }

  addRecentSearch(query: string): void {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    const current = this.recentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...current].slice(0, MAX_RECENT_SEARCHES);

    this.recentSearches.set(updated);
    this.storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }

  removeRecentSearch(query: string): void {
    const updated = this.recentSearches().filter((q) => q !== query);
    this.recentSearches.set(updated);
    this.storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }

  clearRecentSearches(): void {
    this.recentSearches.set([]);
    this.storage.removeItem(RECENT_SEARCHES_KEY);
  }

  openPalette(): void {
    this.isPaletteOpen.set(true);
    void this.ensureIndex();
  }

  closePalette(): void {
    this.isPaletteOpen.set(false);
  }

  togglePalette(): void {
    if (this.isPaletteOpen()) {
      this.closePalette();
    } else {
      this.openPalette();
    }
  }
}
