import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchPageComponent } from './search-page.component';
import { SearchService } from '../../../core/services/search.service';
import { SearchResultItem } from '../../../core/models/search.model';

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;
  let router: Router;

  // Mock de 25 resultados para verificar paginación a 20 por página
  const mockResults: SearchResultItem[] = Array.from({ length: 25 }, (_, i) => ({
    id: `result-${i + 1}`,
    type: i % 2 === 0 ? 'command' : 'slide',
    title: `Resultado de prueba ${i + 1}`,
    url: i % 2 === 0 ? `/comandos#cmd-${i + 1}` : `/estudiar/103.4?vista=slides&slide=${i + 1}`,
    breadcrumb: `Tema 103 › Subtema 103.4 › Item ${i + 1}`,
    snippet: `Este es un fragmento de prueba para el comando <mark>tee</mark> y tuberías ${i + 1}.`,
    score: 100 - i
  }));

  const mockSearchService = {
    isReady: signal(true),
    isPaletteOpen: signal(false),
    recentSearches: signal<string[]>(['grep', 'tuberías']),
    search: vi.fn().mockImplementation((query: string) => {
      if (query === 'sin-resultados') return [];
      return mockResults;
    }),
    addRecentSearch: vi.fn(),
    clearRecentSearches: vi.fn(),
    removeRecentSearch: vi.fn()
  };

  beforeEach(async () => {
    mockSearchService.search.mockClear();
    mockSearchService.addRecentSearch.mockClear();

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        provideRouter([]),
        { provide: SearchService, useValue: mockSearchService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(new Map([['q', 'tee'], ['tipo', 'all'], ['pagina', '1']]))
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente y leer los query params de la URL', () => {
    expect(component).toBeTruthy();
    expect(component.query()).toBe('tee');
    expect(component.activeFilter()).toBe('all');
    expect(component.currentPage()).toBe(1);
    expect(mockSearchService.addRecentSearch).toHaveBeenCalledWith('tee');
  });

  it('debe renderizar el título oficial y la barra de búsqueda', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent).toContain('Buscador Global');

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('tee');
  });

  it('debe paginar los resultados a un máximo de 20 por página', () => {
    expect(component.totalResults()).toBe(25);
    expect(component.totalPages()).toBe(2);
    expect(component.paginatedResults().length).toBe(20);

    const cards = fixture.nativeElement.querySelectorAll('.search-result-card');
    expect(cards.length).toBe(20);
    expect(component.rangeLabel()).toContain('Mostrando 1–20 de 25 resultados');
  });

  it('debe permitir cambiar de página navegando en la URL', () => {
    component.goToPage(2);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { pagina: 2 },
      queryParamsHandling: 'merge'
    });
  });

  it('debe filtrar los resultados por categoría activa', () => {
    component.setFilter('command');
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { tipo: 'command', pagina: 1 },
      queryParamsHandling: 'merge'
    });
  });

  it('debe calcular los enlaces de destino preservando ?q= para resaltar en diapositivas', () => {
    const slideItem = mockResults.find((r) => r.type === 'slide')!;
    const destUrl = component.getDestinationUrl(slideItem);
    expect(destUrl).toContain('slide=');
    expect(destUrl).toContain('&q=tee');
  });

  it('debe mostrar el estado vacío si la búsqueda no arroja resultados', async () => {
    // Configurar ActivatedRoute para término sin resultados
    const altFixture = TestBed.createComponent(SearchPageComponent);
    const altComponent = altFixture.componentInstance;
    altComponent.query.set('sin-resultados');
    altFixture.detectChanges();

    expect(altComponent.totalResults()).toBe(0);
    const emptyState = altFixture.nativeElement.querySelector('app-empty-state');
    expect(emptyState).toBeTruthy();
    expect(altFixture.nativeElement.textContent).toContain('No se encontraron resultados');
  });

  it('debe permitir limpiar la búsqueda', () => {
    component.clearSearch();
    expect(component.query()).toBe('');
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { q: null, tipo: null, pagina: null },
      queryParamsHandling: 'merge'
    });
  });
});
