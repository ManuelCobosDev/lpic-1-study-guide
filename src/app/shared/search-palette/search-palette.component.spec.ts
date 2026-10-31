import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { SearchPaletteComponent } from './search-palette.component';
import { SearchService } from '../../core/services/search.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { SearchResultItem } from '../../core/models/search.model';

describe('SearchPaletteComponent', () => {
  let component: SearchPaletteComponent;
  let fixture: ComponentFixture<SearchPaletteComponent>;
  let mockSearchService: {
    isPaletteOpen: ReturnType<typeof signal<boolean>>;
    recentSearches: ReturnType<typeof signal<string[]>>;
    search: ReturnType<typeof vi.fn>;
    openPalette: ReturnType<typeof vi.fn>;
    closePalette: ReturnType<typeof vi.fn>;
    addRecentSearch: ReturnType<typeof vi.fn>;
    removeRecentSearch: ReturnType<typeof vi.fn>;
    clearRecentSearches: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const mockResults: SearchResultItem[] = [
    {
      id: 'cmd:tee',
      type: 'command',
      title: 'tee',
      url: '/comandos?q=tee',
      breadcrumb: 'Comandos › Subtema 103.4',
      snippet: 'Lee de la entrada estándar y escribe en archivos y <mark>tee</mark>',
      score: 10
    },
    {
      id: 'slide:103.4:2',
      type: 'slide',
      title: 'Bifurcación con tee',
      url: '/estudiar/103.4?slide=2',
      breadcrumb: 'Tema 103 › 103.4 › Diapositiva 2',
      snippet: 'Uso de <mark>tee</mark> en pipelines',
      score: 8
    }
  ];

  beforeEach(async () => {
    mockSearchService = {
      isPaletteOpen: signal<boolean>(false),
      recentSearches: signal<string[]>(['grep', 'tuberias']),
      search: vi.fn().mockReturnValue(mockResults),
      openPalette: vi.fn().mockImplementation(() => mockSearchService.isPaletteOpen.set(true)),
      closePalette: vi.fn().mockImplementation(() => mockSearchService.isPaletteOpen.set(false)),
      addRecentSearch: vi.fn(),
      removeRecentSearch: vi.fn(),
      clearRecentSearches: vi.fn()
    };

    const mockPreferencesService = {
      defaultStudyView: vi.fn().mockReturnValue('slides')
    };

    await TestBed.configureTestingModule({
      imports: [SearchPaletteComponent],
      providers: [
        provideRouter([]),
        { provide: SearchService, useValue: mockSearchService },
        { provide: PreferencesService, useValue: mockPreferencesService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SearchPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no debe renderizarse en el DOM si isPaletteOpen es false', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it('debe renderizarse cuando isPaletteOpen es true', () => {
    mockSearchService.isPaletteOpen.set(true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-label')).toBe('Paleta de búsqueda global');
  });

  it('debe mostrar búsquedas recientes cuando no hay consulta', () => {
    mockSearchService.isPaletteOpen.set(true);
    fixture.detectChanges();

    const recentItems = fixture.nativeElement.querySelectorAll('.recent-searches-box button');
    expect(recentItems.length).toBeGreaterThan(0);
  });

  it('debe realizar la búsqueda al escribir y renderizar resultados', () => {
    mockSearchService.isPaletteOpen.set(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'tee';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.query()).toBe('tee');
    expect(mockSearchService.search).toHaveBeenCalledWith('tee', { filter: 'all', limit: 20 });

    const results = fixture.nativeElement.querySelectorAll('.result-item');
    expect(results.length).toBe(2);
  });

  it('debe permitir cambiar de categoría con los chips', () => {
    mockSearchService.isPaletteOpen.set(true);
    component.query.set('tee');
    fixture.detectChanges();

    component.setFilter('command');
    fixture.detectChanges();
    expect(component.activeFilter()).toBe('command');
    expect(mockSearchService.search).toHaveBeenCalledWith('tee', { filter: 'command', limit: 20 });
  });

  it('debe navegar con flechas ArrowDown y ArrowUp en los resultados', () => {
    mockSearchService.isPaletteOpen.set(true);
    component.query.set('tee');
    fixture.detectChanges();

    expect(component.selectedResultIndex()).toBe(0);

    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.handleKeydown(eventDown);
    expect(component.selectedResultIndex()).toBe(1);

    const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.handleKeydown(eventUp);
    expect(component.selectedResultIndex()).toBe(0);
  });

  it('debe seleccionar resultado al presionar Enter', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    mockSearchService.isPaletteOpen.set(true);
    component.query.set('tee');
    fixture.detectChanges();

    const eventEnter = new KeyboardEvent('keydown', { key: 'Enter' });
    component.handleKeydown(eventEnter);

    expect(mockSearchService.closePalette).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('debe cerrar la paleta al pulsar Escape', () => {
    mockSearchService.isPaletteOpen.set(true);
    fixture.detectChanges();

    const eventEsc = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeydown(eventEsc);

    expect(mockSearchService.closePalette).toHaveBeenCalled();
  });

  it('debe cerrar la paleta al hacer clic en el backdrop', () => {
    mockSearchService.isPaletteOpen.set(true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.search-palette-backdrop');
    backdrop.click();

    expect(mockSearchService.closePalette).toHaveBeenCalled();
  });
});

