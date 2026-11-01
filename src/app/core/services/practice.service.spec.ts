import { TestBed } from '@angular/core/testing';
import { PracticeService } from './practice.service';
import { StorageService } from './storage.service';

describe('PracticeService', () => {
  let service: PracticeService;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    const storageSpy = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      }
    };

    TestBed.configureTestingModule({
      providers: [
        PracticeService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(PracticeService);
  });

  it('debe inicializarse con estado vacío', () => {
    expect(service.quickResults()).toEqual({});
    expect(service.exerciseNotes()).toEqual({});
    expect(service.completedExercises()).toEqual({});
  });

  it('debe registrar el resultado de un test rápido y actualizar récord', () => {
    service.recordQuickQuizResult('105.1', 8, 10);
    const r1 = service.getQuickQuizResult('105.1');
    expect(r1).toBeDefined();
    expect(r1?.last).toBe(8);
    expect(r1?.best).toBe(8);
    expect(r1?.attempts).toBe(1);

    // Segundo intento con menor puntuación
    service.recordQuickQuizResult('105.1', 6, 10);
    const r2 = service.getQuickQuizResult('105.1');
    expect(r2?.last).toBe(6);
    expect(r2?.best).toBe(8);
    expect(r2?.attempts).toBe(2);
  });

  it('debe guardar y recuperar notas de ejercicios', () => {
    service.saveExerciseNote('105.1-eg-01', 'Mi respuesta personal');
    expect(service.getExerciseNote('105.1-eg-01')).toBe('Mi respuesta personal');
  });

  it('debe alternar el estado de completado de un ejercicio', () => {
    expect(service.isExerciseCompleted('105.1-eg-01')).toBe(false);
    service.toggleExerciseCompleted('105.1-eg-01');
    expect(service.isExerciseCompleted('105.1-eg-01')).toBe(true);
    service.toggleExerciseCompleted('105.1-eg-01');
    expect(service.isExerciseCompleted('105.1-eg-01')).toBe(false);
  });
});

