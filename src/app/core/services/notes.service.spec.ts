import { TestBed } from '@angular/core/testing';
import { NotesService } from './notes.service';
import { StorageService } from './storage.service';

describe('NotesService', () => {
  let service: NotesService;
  let mockStorage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [NotesService, StorageService]
    });

    service = TestBed.inject(NotesService);
    mockStorage = TestBed.inject(StorageService);
  });

  it('debe crearse correctamente con notas vacías', () => {
    expect(service).toBeTruthy();
    expect(service.getNote('103.4')).toBe('');
    expect(service.hasNote('103.4')).toBe(false);
  });

  it('debe guardar una nota y recuperarla', () => {
    service.setNote('103.4', 'Importante recordar que noclobber protege de sobreescritura accidental');
    expect(service.getNote('103.4')).toContain('noclobber');
    expect(service.hasNote('103.4')).toBe(true);

    service.flush();
    const raw = mockStorage.getItem('notes');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as { schemaVersion: number; data: Record<string, string> };
    expect(parsed.data['103.4']).toContain('noclobber');
  });

  it('debe eliminar la nota si el texto está vacío', () => {
    service.setNote('103.4', 'Texto temporal');
    expect(service.hasNote('103.4')).toBe(true);

    service.setNote('103.4', '   ');
    expect(service.hasNote('103.4')).toBe(false);
    expect(service.getNote('103.4')).toBe('');
  });
});
