import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchService } from '../../core/services/search.service';
import {
  SearchFilter,
  SearchResultItem,
  SearchDocType
} from '../../core/models/search.model';
import { PreferencesService } from '../../core/services/preferences.service';

interface FilterChip {
  id: SearchFilter;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-search-palette',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (searchService.isPaletteOpen()) {
      <div
        class="search-palette-backdrop fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 md:p-12 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de búsqueda global"
        tabindex="-1"
        (click)="onBackdropClick($event)"
        (keydown.escape)="searchService.closePalette()"
      >
        <div
          class="search-palette-card w-full max-w-2xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        >
          <!-- Barra superior: Input de búsqueda -->
          <div class="palette-input-wrapper p-3 sm:p-4 border-b border-[var(--border)] flex items-center gap-3">
            <span class="text-lg text-[var(--text-muted)] select-none" aria-hidden="true">🔍</span>

            <input
              #searchInput
              type="search"
              class="palette-input flex-1 bg-transparent text-[var(--text)] text-sm sm:text-base outline-none placeholder:text-[var(--text-muted)]"
              placeholder="Buscar subtema, comando, término, práctica..."
              [value]="query()"
              (input)="onInputChange($event)"
              (keydown)="handleKeydown($event)"
              aria-label="Término de búsqueda"
              autocomplete="off"
              spellcheck="false"
            />

            @if (query().trim()) {
              <button
                type="button"
                class="p-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] rounded-md hover:bg-[var(--surface-muted)] cursor-pointer"
                (click)="clearQuery()"
                title="Limpiar búsqueda"
                aria-label="Limpiar término de búsqueda"
              >
                ✕
              </button>
            }

            <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] text-[11px] font-mono">
              Esc
            </kbd>
          </div>

          <!-- Filtros de categoría por chips -->
          <div class="palette-chips-bar flex items-center gap-1.5 p-2 px-3 border-b border-[var(--border)] bg-[var(--surface-muted)] overflow-x-auto scrollbar-none text-xs">
            @for (chip of filterChips; track chip.id) {
              <button
                type="button"
                class="filter-chip px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                [class.bg-[var(--surface)]]="activeFilter() === chip.id"
                [class.text-[var(--primary-text)]]="activeFilter() === chip.id"
                [class.shadow-xs]="activeFilter() === chip.id"
                [class.font-bold]="activeFilter() === chip.id"
                [class.text-[var(--text-muted)]]="activeFilter() !== chip.id"
                [class.hover:text-[var(--text)]]="activeFilter() !== chip.id"
                (click)="setFilter(chip.id)"
              >
                <span aria-hidden="true">{{ chip.icon }}</span>
                <span>{{ chip.label }}</span>
              </button>
            }
          </div>

          <!-- Cuerpo: Resultados o Sugerencias -->
          <div class="palette-body flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
            @if (query().trim() === '') {
              <!-- Estado inicial: Búsquedas recientes y Sugerencias -->
              <div class="space-y-4 p-2">
                @if (searchService.recentSearches().length > 0) {
                  <div class="recent-searches-box">
                    <div class="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-2 px-1">
                      <span class="font-bold uppercase tracking-wider">Búsquedas recientes</span>
                      <button
                        type="button"
                        class="hover:text-[var(--text)] underline cursor-pointer"
                        (click)="searchService.clearRecentSearches()"
                      >
                        Borrar todas
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                      @for (item of searchService.recentSearches(); track item) {
                        <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--text)]">
                          <button
                            type="button"
                            class="hover:text-[var(--primary-text)] font-mono cursor-pointer"
                            (click)="applySuggestion(item)"
                          >
                            {{ item }}
                          </button>
                          <button
                            type="button"
                            class="text-[var(--text-muted)] hover:text-red-500 cursor-pointer ml-1"
                            (click)="searchService.removeRecentSearch(item)"
                            title="Eliminar de recientes"
                            aria-label="Eliminar búsqueda"
                          >
                            ×
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="suggestions-box">
                  <div class="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">
                    Sugerencias de búsqueda rápida
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (sug of popularSuggestions; track sug) {
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] hover:text-[var(--primary-text)] text-xs font-mono transition-colors cursor-pointer"
                        (click)="applySuggestion(sug)"
                      >
                        {{ sug }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            } @else if (results().length === 0) {
              <!-- Estado vacío sin resultados -->
              <div class="p-8 text-center space-y-2">
                <span class="text-3xl" aria-hidden="true">🔎</span>
                <p class="text-sm font-semibold text-[var(--text)]">
                  No se encontraron resultados para "{{ query() }}"
                </p>
                <p class="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Prueba buscando por nombre de comando (ej: <code class="font-mono">grep</code>), código oficial (ej: <code class="font-mono">103.4</code>) o término en general.
                </p>
              </div>
            } @else {
              <!-- Lista de resultados -->
              <div class="results-list space-y-1" role="listbox" aria-label="Resultados de búsqueda">
                @for (item of results(); track item.id; let idx = $index) {
                  <div
                    class="result-item p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none"
                    [class.border-[var(--primary)]]="selectedResultIndex() === idx"
                    [class.bg-[var(--primary-soft)]]="selectedResultIndex() === idx"
                    [class.border-transparent]="selectedResultIndex() !== idx"
                    [class.hover:bg-[var(--surface-muted)]]="selectedResultIndex() !== idx"
                    role="option"
                    tabindex="0"
                    [attr.aria-selected]="selectedResultIndex() === idx"
                    (click)="selectResult(item)"
                    (keydown.enter)="selectResult(item)"
                    (mouseenter)="selectedResultIndex.set(idx)"
                  >
                    <div class="flex items-start gap-2.5">
                      <span class="text-base shrink-0 mt-0.5" aria-hidden="true">
                        {{ getIconForType(item.type) }}
                      </span>

                      <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex items-center justify-between gap-2">
                          <h4 class="text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                            {{ item.title }}
                          </h4>
                          @if (item.exactMatch) {
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--primary)] text-white shrink-0">
                              Exacto
                            </span>
                          }
                        </div>

                        <div class="text-[11px] font-mono text-[var(--text-muted)] truncate">
                          {{ item.breadcrumb }}
                        </div>

                        <p
                          class="result-snippet text-xs text-[var(--text-muted)] leading-relaxed m-0 line-clamp-2"
                          [innerHTML]="item.snippet"
                        ></p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Pie de la paleta: Controles y Enlace a /buscar -->
          <footer class="palette-footer p-2.5 px-4 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between gap-4 text-xs text-[var(--text-muted)] font-mono">
            <div class="hidden sm:flex items-center gap-3">
              <span><kbd class="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">↑↓</kbd> Navegar</span>
              <span><kbd class="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">↵</kbd> Abrir</span>
              <span><kbd class="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">Tab</kbd> Filtro</span>
            </div>

            @if (query().trim() && results().length > 0) {
              <button
                type="button"
                class="hover:text-[var(--primary-text)] font-bold underline cursor-pointer ml-auto"
                (click)="viewAllResults()"
              >
                Ver todos los resultados en /buscar ({{ results().length }}) →
              </button>
            }
          </footer>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPaletteComponent {
  readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly preferencesService = inject(PreferencesService);

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly query = signal<string>('');
  readonly activeFilter = signal<SearchFilter>('all');
  readonly selectedResultIndex = signal<number>(0);

  readonly filterChips: FilterChip[] = [
    { id: 'all', label: 'Todo', icon: '🔍' },
    { id: 'curriculum', label: 'Temario', icon: '📚' },
    { id: 'slide', label: 'Diapositivas', icon: '🖥️' },
    { id: 'command', label: 'Comandos', icon: '💻' },
    { id: 'term', label: 'Glosario', icon: '📖' },
    { id: 'lab', label: 'Prácticas', icon: '🧪' }
  ];

  readonly popularSuggestions = [
    '103.4',
    'grep',
    'tee',
    'tuberías',
    'xargs',
    'redirección',
    'permisos',
    'fstab'
  ];

  readonly results = computed<SearchResultItem[]>(() => {
    const q = this.query().trim();
    if (!q) return [];
    return this.searchService.search(q, {
      filter: this.activeFilter(),
      limit: 20
    });
  });

  constructor() {
    // Al abrir la paleta, enfocar el input y reiniciar selección
    effect(() => {
      if (this.searchService.isPaletteOpen()) {
        this.selectedResultIndex.set(0);
        setTimeout(() => {
          this.searchInput()?.nativeElement.focus();
        }, 50);
      }
    });
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
    this.selectedResultIndex.set(0);
  }

  clearQuery(): void {
    this.query.set('');
    this.selectedResultIndex.set(0);
    this.searchInput()?.nativeElement.focus();
  }

  setFilter(filter: SearchFilter): void {
    this.activeFilter.set(filter);
    this.selectedResultIndex.set(0);
  }

  applySuggestion(text: string): void {
    this.query.set(text);
    this.selectedResultIndex.set(0);
    this.searchInput()?.nativeElement.focus();
  }

  handleKeydown(event: KeyboardEvent): void {
    const res = this.results();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (res.length > 0) {
        this.selectedResultIndex.update((i) => Math.min(i + 1, res.length - 1));
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (res.length > 0) {
        this.selectedResultIndex.update((i) => Math.max(i - 1, 0));
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (res.length > 0 && res[this.selectedResultIndex()]) {
        this.selectResult(res[this.selectedResultIndex()]!);
      } else if (this.query().trim()) {
        this.viewAllResults();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.searchService.closePalette();
    } else if (event.key === 'Tab') {
      // Navegar cíclicamente entre filtros de chips si no hay modificador
      if (!event.shiftKey) {
        const curIdx = this.filterChips.findIndex((c) => c.id === this.activeFilter());
        const nextIdx = (curIdx + 1) % this.filterChips.length;
        this.setFilter(this.filterChips[nextIdx]!.id);
        event.preventDefault();
      }
    }
  }

  selectResult(item: SearchResultItem): void {
    this.searchService.addRecentSearch(this.query().trim() || item.title);
    this.searchService.closePalette();

    // Si es diapositiva, incluir q= para resaltar el término
    if (item.type === 'slide') {
      const preferredView = this.preferencesService.defaultStudyView();
      const cleanTerm = this.query().trim();
      const targetUrl = item.url.includes('?')
        ? `${item.url}&vista=${preferredView}&q=${encodeURIComponent(cleanTerm)}`
        : `${item.url}?vista=${preferredView}&q=${encodeURIComponent(cleanTerm)}`;
      this.router.navigateByUrl(targetUrl);
    } else {
      this.router.navigateByUrl(item.url);
    }
  }

  viewAllResults(): void {
    const q = this.query().trim();
    if (q) {
      this.searchService.addRecentSearch(q);
      this.searchService.closePalette();
      this.router.navigate(['/buscar'], {
        queryParams: { q, tipo: this.activeFilter() }
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('search-palette-backdrop')) {
      this.searchService.closePalette();
    }
  }

  getIconForType(type: SearchDocType): string {
    switch (type) {
      case 'curriculum':
        return '📚';
      case 'slide':
        return '🖥️';
      case 'command':
        return '💻';
      case 'term':
        return '📖';
      case 'lab':
        return '🧪';
      case 'errata':
        return '⚠️';
      case 'page':
        return '🌐';
    }
  }
}

