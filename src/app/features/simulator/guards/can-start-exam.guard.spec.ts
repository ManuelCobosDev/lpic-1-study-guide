import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { canStartExamGuard } from './can-start-exam.guard';
import { ExamService } from '../../../core/services/exam.service';

describe('canStartExamGuard', () => {
  let mockExamService: {
    hasActiveSession: ReturnType<typeof vi.fn>;
    hasAvailableQuestions: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockExamService = {
      hasActiveSession: vi.fn(),
      hasAvailableQuestions: vi.fn()
    };

    mockRouter = {
      createUrlTree: vi.fn((commands, extras) => ({
        commands,
        extras
      } as unknown as UrlTree))
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ExamService, useValue: mockExamService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('debe permitir el acceso si ya existe una sesión de examen activa', async () => {
    mockExamService.hasActiveSession.mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      canStartExamGuard({} as never, {} as never)
    );

    expect(result).toBe(true);
  });

  it('debe permitir el acceso si no hay sesión pero hay preguntas disponibles en el banco', async () => {
    mockExamService.hasActiveSession.mockReturnValue(false);
    mockExamService.hasAvailableQuestions.mockResolvedValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      canStartExamGuard({} as never, {} as never)
    );

    expect(result).toBe(true);
  });

  it('debe bloquear y redirigir a /simulador si no hay preguntas disponibles', async () => {
    mockExamService.hasActiveSession.mockReturnValue(false);
    mockExamService.hasAvailableQuestions.mockResolvedValue(false);

    const result = await TestBed.runInInjectionContext(() =>
      canStartExamGuard({} as never, {} as never)
    );

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/simulador'], {
      queryParams: { error: 'no_questions' }
    });
    expect(result).not.toBe(true);
  });
});

