import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LabsService } from './labs.service';
import { StorageService } from './storage.service';
import { ContentService } from './content.service';
import { ProgressService } from './progress.service';
import { DEFAULT_PROGRESS } from '../models/progress.model';

describe('LabsService', () => {
  let service: LabsService;
  let mockStorage: Record<string, string>;
  let progressState: typeof DEFAULT_PROGRESS;

  const mockManifest = {
    subtopics: [
      {
        id: '103.4',
        topicId: '103',
        title: 'Tuberías y redirecciones',
        weight: 4,
        estimatedMinutes: 30,
        labId: 'lab-103-4',
        placeholder: false
      },
      {
        id: '101.1',
        topicId: '101',
        title: 'Arquitectura de hardware',
        weight: 2,
        estimatedMinutes: 20,
        labId: 'lab-101-1',
        placeholder: true
      }
    ]
  };

  beforeEach(() => {
    mockStorage = {};
    progressState = {
      ...DEFAULT_PROGRESS,
      completedLabs: {}
    };

    const storageServiceMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      })
    };

    const contentServiceMock = {
      getManifest: vi.fn().mockResolvedValue(mockManifest),
      getLab: vi.fn().mockResolvedValue({
        id: 'lab-103-4',
        subtopicId: '103.4',
        title: 'Práctica 103.4',
        steps: [
          { stepNumber: 1, title: 'Paso 1' },
          { stepNumber: 2, title: 'Paso 2' },
          { stepNumber: 3, title: 'Paso 3' }
        ]
      })
    };

    const progressServiceMock = {
      progress: signal(progressState),
      markLabCompleted: vi.fn((labId: string) => {
        progressState = {
          ...progressState,
          completedLabs: {
            ...progressState.completedLabs,
            [labId]: '2026-10-31T12:00:00.000Z'
          }
        };
        progressServiceMock.progress.set(progressState);
      })
    };

    TestBed.configureTestingModule({
      providers: [
        LabsService,
        { provide: StorageService, useValue: storageServiceMock },
        { provide: ContentService, useValue: contentServiceMock },
        { provide: ProgressService, useValue: progressServiceMock }
      ]
    });

    service = TestBed.inject(LabsService);
  });

  it('debe crearse con el estado inicial vacío', () => {
    expect(service).toBeTruthy();
    expect(service.getCompletedSteps('lab-103-4')).toEqual([]);
    expect(service.isDebianVmNoticeDismissed()).toBe(false);
  });

  it('debe generar el catálogo de laboratorios desde el manifiesto', async () => {
    const catalog = await service.getLabsCatalog();
    expect(catalog.length).toBe(2);
    expect(catalog[0]?.id).toBe('lab-103-4');
    expect(catalog[0]?.difficulty).toBe('advanced');
    expect(catalog[1]?.id).toBe('lab-101-1');
    expect(catalog[1]?.difficulty).toBe('intermediate');
  });

  it('debe permitir marcar y desmarcar pasos individuales (toggleStep)', () => {
    expect(service.isStepCompleted('lab-103-4', 1)).toBe(false);

    service.toggleStep('lab-103-4', 1);
    expect(service.isStepCompleted('lab-103-4', 1)).toBe(true);
    expect(service.getCompletedSteps('lab-103-4')).toEqual([1]);

    service.toggleStep('lab-103-4', 2);
    expect(service.getCompletedSteps('lab-103-4')).toEqual([1, 2]);

    // Desmarcar paso 1
    service.toggleStep('lab-103-4', 1);
    expect(service.isStepCompleted('lab-103-4', 1)).toBe(false);
    expect(service.getCompletedSteps('lab-103-4')).toEqual([2]);
  });

  it('debe marcar el laboratorio como completado al completar todos los pasos', () => {
    const progressService = TestBed.inject(ProgressService);

    service.toggleStep('lab-103-4', 1, 3);
    service.toggleStep('lab-103-4', 2, 3);
    expect(progressService.markLabCompleted).not.toHaveBeenCalled();

    // Completar el tercer y último paso
    service.toggleStep('lab-103-4', 3, 3);
    expect(progressService.markLabCompleted).toHaveBeenCalledWith('lab-103-4');
  });

  it('debe calcular correctamente el estado del laboratorio (pending, in_progress, completed)', () => {
    expect(service.getLabStatus('lab-103-4', 3)).toBe('pending');

    service.toggleStep('lab-103-4', 1);
    expect(service.getLabStatus('lab-103-4', 3)).toBe('in_progress');

    service.toggleStep('lab-103-4', 2);
    service.toggleStep('lab-103-4', 3);
    expect(service.getLabStatus('lab-103-4', 3)).toBe('completed');
  });

  it('debe permitir reiniciar una práctica con resetLab', () => {
    service.toggleStep('lab-103-4', 1);
    service.toggleStep('lab-103-4', 2);
    expect(service.getCompletedSteps('lab-103-4')).toEqual([1, 2]);

    service.resetLab('lab-103-4');
    expect(service.getCompletedSteps('lab-103-4')).toEqual([]);
    expect(service.getLabStatus('lab-103-4', 3)).toBe('pending');
  });

  it('debe permitir descartar el aviso de VM Debian 12', () => {
    expect(service.isDebianVmNoticeDismissed()).toBe(false);

    service.dismissDebianVmNotice();
    expect(service.isDebianVmNoticeDismissed()).toBe(true);

    service.resetDebianVmNotice();
    expect(service.isDebianVmNoticeDismissed()).toBe(false);
  });
});

