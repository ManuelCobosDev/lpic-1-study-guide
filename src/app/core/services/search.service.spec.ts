import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { ContentService } from './content.service';
import { StorageService } from './storage.service';
import { CurriculumManifest } from '../models/curriculum.model';

describe('SearchService', () => {
  let service: SearchService;
  let mockContentService: Partial<ContentService>;
  let mockStorage: StorageService;

  const mockManifest: Partial<CurriculumManifest> = {
    subtopics: [
      {
        id: '103.4',
        topicId: '103',
        title: 'Uso de tuberías y flujos',
        weight: 4,
        estimatedMinutes: 40,
        status: 'available',
        placeholder: false
      }
    ]
  };

  beforeEach(() => {
    localStorage.clear();

    mockContentService = {
      getManifest: vi.fn().mockResolvedValue(mockManifest as CurriculumManifest),
      getCommands: vi.fn().mockResolvedValue([
        {
          id: 'tee',
          name: 'tee',
          synopsis: 'Bifurca entrada estándar hacia archivos',
          description: 'Útil para logs',
          category: 'filtros',
          subtopicIds: ['103.4'],
          example: 'ls | tee out.txt',
          flags: [{ flag: '-a', description: 'anexa' }]
        }
      ]),
      getGlossary: vi.fn().mockResolvedValue([
        {
          id: 'pipe',
          term: 'pipe',
          definition: 'Tubería de comunicación entre procesos',
          related: [],
          subtopicIds: ['103.4']
        }
      ]),
      getErrata: vi.fn().mockResolvedValue([]),
      getLesson: vi.fn().mockResolvedValue({
        id: '103.4',
        topicId: '103',
        examId: '101',
        title: 'Uso de tuberías y flujos',
        version: '1.0',
        language: 'es',
        estimatedMinutes: 40,
        objectives: [],
        keyTerms: [],
        commands: ['tee'],
        placeholder: false,
        slides: [
          {
            id: '103.4-1',
            slideNumber: 1,
            title: 'Introducción a Tuberías',
            layout: 'content',
            blocks: [
              {
                type: 'paragraph',
                text: 'El comando tee divide el flujo de salida.'
              }
            ]
          }
        ]
      })
    };

    TestBed.configureTestingModule({
      providers: [
        SearchService,
        StorageService,
        { provide: ContentService, useValue: mockContentService }
      ]
    });

    service = TestBed.inject(SearchService);
    mockStorage = TestBed.inject(StorageService);
  });

  it('debe crearse con estado idle y paleta cerrada', () => {
    expect(service).toBeTruthy();
    expect(service.indexingStatus()).toBe('idle');
    expect(service.isPaletteOpen()).toBe(false);
    expect(service.recentSearches()).toEqual([]);
  });

  it('ensureIndex construye el índice y cambia a ready', async () => {
    await service.ensureIndex();
    expect(service.indexingStatus()).toBe('ready');
    expect(mockContentService.getManifest).toHaveBeenCalled();
  });

  it('search devuelve resultados tras indexar', async () => {
    await service.ensureIndex();
    const results = service.search('tee');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.title.includes('tee'))).toBe(true);
  });

  it('gestiona búsquedas recientes y las persiste en StorageService', () => {
    service.addRecentSearch('grep');
    service.addRecentSearch('tee');
    expect(service.recentSearches()).toEqual(['tee', 'grep']);

    const raw = mockStorage.getItem('recent_searches');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual(['tee', 'grep']);

    service.removeRecentSearch('grep');
    expect(service.recentSearches()).toEqual(['tee']);

    service.clearRecentSearches();
    expect(service.recentSearches()).toEqual([]);
  });

  it('openPalette, closePalette y togglePalette gestionan isPaletteOpen', () => {
    service.openPalette();
    expect(service.isPaletteOpen()).toBe(true);

    service.closePalette();
    expect(service.isPaletteOpen()).toBe(false);

    service.togglePalette();
    expect(service.isPaletteOpen()).toBe(true);
  });
});
