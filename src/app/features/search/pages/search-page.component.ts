import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchService } from '../../../core/services/search.service';
import { SearchDocType, SearchFilter, SearchResultItem } from '../../../core/models/search.model';

export interface CategoryChip {
  id: SearchFilter;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly searchService = inject(SearchService);

  readonly query = signal<string>('');
  readonly activeFilter = signal<SearchFilter>('all');
  readonly currentPage = signal<number>(1);
  readonly pageSize = 20;

  readonly categoryChips: CategoryChip[] = [
    { id: 'all', label: 'Todo', icon: '🔍' },
    { id: 'curriculum', label: 'Temario', icon: '📚' },
    { id: 'slide', label: 'Diapositivas', icon: '🖥️' },
    { id: 'command', label: 'Comandos', icon: '💻' },
    { id: 'term', label: 'Glosario', icon: '📖' },
    { id: 'lab', label: 'Prácticas', icon: '🧪' }
  ];

  readonly popularTerms = [
    '103.4',
    'grep',
    'tee',
    'tuberías',
    'xargs',
    'redirección',
    'permisos',
    'fstab'
  ];

  // Resultados completos sin paginar para el término actual (todas las categorías)
  private readonly allUnfilteredResults = computed<SearchResultItem[]>(() => {
    this.searchService.indexingStatus();
    const q = this.query().trim();
    if (!q) return [];
    return this.searchService.search(q, { filter: 'all', limit: 1000 });
  });

  // Conteo de resultados por categoría para los chips
  readonly countByCategory = computed<Record<SearchFilter, number>>(() => {
    const results = this.allUnfilteredResults();
    const counts: Record<SearchFilter, number> = {
      all: results.length,
      curriculum: 0,
      slide: 0,
      command: 0,
      term: 0,
      lab: 0,
      errata: 0,
      page: 0
    };

    for (const r of results) {
      if (counts[r.type] !== undefined) {
        counts[r.type]++;
      }
    }
    return counts;
  });

  // Resultados filtrados según la categoría activa
  readonly filteredResults = computed<SearchResultItem[]>(() => {
    const filter = this.activeFilter();
    const results = this.allUnfilteredResults();
    if (filter === 'all') return results;
    return results.filter((r) => r.type === filter);
  });

  // Total de resultados filtrados
  readonly totalResults = computed<number>(() => this.filteredResults().length);

  // Total de páginas (mínimo 1)
  readonly totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(this.totalResults() / this.pageSize))
  );

  // Resultados paginados a 20 por página
  readonly paginatedResults = computed<SearchResultItem[]>(() => {
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return this.filteredResults().slice(start, start + this.pageSize);
  });

  // Rango visible de resultados (ej: 1 - 20 de 45)
  readonly rangeLabel = computed<string>(() => {
    const total = this.totalResults();
    if (total === 0) return '0 resultados';
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return `Mostrando ${start}–${end} de ${total} resultados`;
  });

  constructor() {
    void this.searchService.ensureIndex();

    // Sincronización desde los query params de la URL
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') || '';
      const filter = (params.get('tipo') as SearchFilter) || 'all';
      const page = parseInt(params.get('pagina') || '1', 10);

      this.query.set(q);
      this.activeFilter.set(filter);
      this.currentPage.set(isNaN(page) || page < 1 ? 1 : page);

      if (q.trim()) {
        this.searchService.addRecentSearch(q.trim());
      }
    });
  }

  onSearchSubmit(newQuery?: string): void {
    const targetQuery = (newQuery !== undefined ? newQuery : this.query()).trim();
    this.updateUrlParams({
      q: targetQuery || null,
      pagina: 1
    });
  }

  setFilter(filter: SearchFilter): void {
    this.updateUrlParams({
      tipo: filter === 'all' ? null : filter,
      pagina: 1
    });
  }

  goToPage(page: number): void {
    const targetPage = Math.min(Math.max(1, page), this.totalPages());
    this.updateUrlParams({
      pagina: targetPage === 1 ? null : targetPage
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearSearch(): void {
    this.query.set('');
    this.updateUrlParams({
      q: null,
      tipo: null,
      pagina: null
    });
  }

  getBadgeVariant(type: SearchDocType): BadgeVariant {
    switch (type) {
      case 'curriculum':
        return 'info';
      case 'slide':
        return 'primary';
      case 'command':
        return 'success';
      case 'term':
        return 'warning';
      case 'lab':
        return 'danger';
      case 'errata':
      default:
        return 'neutral';
    }
  }

  getCategoryLabel(type: SearchDocType): string {
    switch (type) {
      case 'curriculum':
        return 'Temario';
      case 'slide':
        return 'Diapositiva';
      case 'command':
        return 'Comando';
      case 'term':
        return 'Glosario';
      case 'lab':
        return 'Laboratorio';
      case 'errata':
        return 'Fe de erratas';
      default:
        return 'Recurso';
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
      default:
        return '📄';
    }
  }

  getRouterPath(item: SearchResultItem): string {
    return item.url.split('?')[0] || item.url;
  }

  getQueryParams(item: SearchResultItem): Record<string, string> {
    const params: Record<string, string> = {};
    const q = this.query().trim();
    if (q) {
      params['q'] = q;
    }

    const questionIndex = item.url.indexOf('?');
    if (questionIndex !== -1) {
      const queryString = item.url.slice(questionIndex + 1);
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((val, key) => {
        params[key] = val;
      });
    }

    return params;
  }

  /**
   * Construye el enlace de navegación agregando el query param `q` para que
   * en la página destino (como diapositivas) el término buscado quede resaltado con `<mark>`.
   */
  getDestinationUrl(item: SearchResultItem): string {
    const q = this.query().trim();
    if (!q) return item.url;

    // Si ya incluye parámetros de búsqueda, encadenar con `&q=...`
    if (item.url.includes('?')) {
      return `${item.url}&q=${encodeURIComponent(q)}`;
    }
    return `${item.url}?q=${encodeURIComponent(q)}`;
  }

  private updateUrlParams(params: Record<string, string | number | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }
}
