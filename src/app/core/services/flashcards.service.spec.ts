import { TestBed } from '@angular/core/testing';
import { FlashcardsService } from './flashcards.service';
import { ContentService } from './content.service';
import { StorageService } from './storage.service';
import { PreferencesService } from './preferences.service';
import { Command } from '../models/command.model';
import { GlossaryTerm } from '../models/glossary.model';
import { DEFAULT_PREFERENCES } from '../models/preferences.model';
import { signal } from '@angular/core';

describe('FlashcardsService', () => {
  let service: FlashcardsService;
  let mockStorageStore: Record<string, string> = {};

  const mockCommands: Command[] = [
    {
      id: 'tee',
      name: 'tee',
      synopsis: 'tee [OPCIÓN]...',
      description: 'Copia stdin a archivo y stdout.',
      category: 'Redirecciones',
      subtopicIds: ['103.4'],
      example: 'ls | tee out.txt',
      flags: []
    }
  ];

  const mockGlossary: GlossaryTerm[] = [
    {
      id: 'stdin',
      term: 'stdin',
      definition: 'Descriptor de archivo 0.',
      related: ['stdout'],
      subtopicIds: ['103.4']
    }
  ];

  const mockContentService = {
    getCommands: () => Promise.resolve(mockCommands),
    getGlossary: () => Promise.resolve(mockGlossary)
  };

  const mockStorageService = {
    getItem: (key: string): string | null => mockStorageStore[key] ?? null,
    setItem: (key: string, value: string): void => {
      mockStorageStore[key] = value;
    },
    removeItem: (key: string): void => {
      delete mockStorageStore[key];
    }
  };

  const mockPreferencesService = {
    preferences: signal(DEFAULT_PREFERENCES)
  };

  beforeEach(() => {
    mockStorageStore = {};
    TestBed.configureTestingModule({
      providers: [
        FlashcardsService,
        { provide: ContentService, useValue: mockContentService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: PreferencesService, useValue: mockPreferencesService }
      ]
    });
    service = TestBed.inject(FlashcardsService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('loadDeckItems carga tarjetas según el mazo seleccionado', async () => {
    const cmdDeck = await service.loadDeckItems('commands');
    expect(cmdDeck.length).toBe(1);
    expect(cmdDeck[0]?.id).toBe('cmd-tee');
    expect(cmdDeck[0]?.type).toBe('command');

    const termDeck = await service.loadDeckItems('glossary');
    expect(termDeck.length).toBe(1);
    expect(termDeck[0]?.id).toBe('term-stdin');
    expect(termDeck[0]?.type).toBe('glossary');

    const mixedDeck = await service.loadDeckItems('mixed');
    expect(mixedDeck.length).toBe(2);
  });

  it('rateCard actualiza la caja Leitner y persiste en StorageService', () => {
    const updated = service.rateCard('cmd-tee', 'good');
    expect(updated.box).toBe(2);
    expect(updated.repetitions).toBe(1);

    expect(service.progress()['cmd-tee']?.box).toBe(2);
  });

  it('getSessionCards respeta el límite diario y devuelve las tarjetas para la sesión', async () => {
    const session = await service.getSessionCards('mixed', 1);
    expect(session.sessionCards.length).toBe(1);
  });

  it('getDeckStats calcula estadísticas del mazo', async () => {
    const stats = await service.getDeckStats('mixed');
    expect(stats.total).toBe(2);
    expect(stats.unseen).toBe(2);
  });

  it('resetProgress borra el progreso en memoria y almacenamiento', () => {
    service.rateCard('cmd-tee', 'easy');
    expect(service.progress()['cmd-tee']).toBeDefined();

    service.resetProgress();
    expect(service.progress()['cmd-tee']).toBeUndefined();
  });
});
