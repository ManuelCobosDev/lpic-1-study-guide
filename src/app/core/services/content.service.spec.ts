import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentService } from './content.service';
import { CurriculumManifest } from '../models/curriculum.model';

describe('ContentService (Carga perezosa y cacheada de recursos)', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
    vi.restoreAllMocks();
  });

  const mockManifest: CurriculumManifest = {
    version: '1.0.0',
    generatedAt: '2026-10-31T00:00:00Z',
    stats: {
      totalExams: 2,
      totalTopics: 10,
      totalSubtopics: 42,
      availableSubtopics: 23,
      plannedSubtopics: 19,
      totalSlidesReal: 0,
      totalSlidesPlaceholder: 336,
      totalLabsReal: 0,
      totalLabsPlaceholder: 42,
      totalQuestionsReal: 0,
      totalQuestionsPlaceholder: 40,
      totalCommands: 0,
      totalTerms: 0
    },
    exams: [],
    topics: [],
    subtopics: []
  };

  it('debe cargar el manifiesto desde /content/manifest.json y cachearlo en llamadas sucesivas', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockManifest
    });
    vi.stubGlobal('fetch', fetchSpy);

    const first = await service.getManifest();
    expect(first).toEqual(mockManifest);
    expect(service.manifest()).toEqual(mockManifest);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Segunda llamada debe usar la cache y no invocar fetch de nuevo
    const second = await service.getManifest();
    expect(second).toEqual(mockManifest);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('debe actualizar la señal error si fetch falla', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(service.getManifest()).rejects.toThrow();
    expect(service.error()).toContain('404');
    expect(service.loading()).toBe(false);
  });
});

