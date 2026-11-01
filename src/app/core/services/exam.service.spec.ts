import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExamService } from './exam.service';
import { StorageService } from './storage.service';
import { ContentService } from './content.service';
import { PreferencesService } from './preferences.service';
import { Question } from '../models/question.model';
import { CurriculumManifest } from '../models/curriculum.model';

describe('ExamService (Servicio de Gestión de Exámenes y Persistencia)', () => {
  let service: ExamService;
  let mockStorageData: Record<string, string> = {};

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      topicId: '101',
      subtopicId: '101.1',
      type: 'single',
      prompt: 'Pregunta 1',
      correct: ['a'],
      explanation: 'Exp 1',
      difficulty: 'easy',
      placeholder: false
    },
    {
      id: 'q2',
      topicId: '103',
      subtopicId: '103.4',
      type: 'multiple',
      prompt: 'Pregunta 2',
      correct: ['b', 'c'],
      explanation: 'Exp 2',
      difficulty: 'medium',
      placeholder: false
    }
  ];

  const mockManifest: CurriculumManifest = {
    version: '1.0.0',
    generatedAt: '2026-10-31T00:00:00Z',
    stats: {
      totalExams: 2,
      totalTopics: 10,
      totalSubtopics: 42,
      availableSubtopics: 42,
      plannedSubtopics: 0,
      totalSlidesReal: 19,
      totalSlidesPlaceholder: 328,
      totalLabsReal: 1,
      totalLabsPlaceholder: 41,
      totalQuestionsReal: 43,
      totalQuestionsPlaceholder: 0,
      totalCommands: 25,
      totalTerms: 22
    },
    exams: [
      {
        id: '101',
        code: '101-500',
        title: 'Examen 101',
        description: 'Desc',
        status: 'available',
        weight: 60,
        topicIds: ['101', '103']
      }
    ],
    topics: [
      {
        id: '101',
        examId: '101',
        title: 'Tema 101',
        weight: 8,
        subtopicIds: ['101.1']
      },
      {
        id: '103',
        examId: '101',
        title: 'Tema 103',
        weight: 15,
        subtopicIds: ['103.4']
      },
      {
        id: '105',
        examId: '102',
        title: 'Tema 105',
        weight: 8,
        subtopicIds: ['105.1']
      }
    ],
    subtopics: [
      {
        id: '101.1',
        topicId: '101',
        title: 'Subtema 101.1',
        weight: 2,
        estimatedMinutes: 20,
        status: 'available',
        slideCount: 10,
        placeholder: false
      },
      {
        id: '103.4',
        topicId: '103',
        title: 'Subtema 103.4',
        weight: 4,
        estimatedMinutes: 30,
        status: 'available',
        slideCount: 19,
        placeholder: false
      },
      {
        id: '105.1',
        topicId: '105',
        title: 'Subtema 105.1',
        weight: 8,
        estimatedMinutes: 20,
        status: 'available',
        slideCount: 10,
        placeholder: false
      }
    ]
  };

  const mockStorageService = {
    getItem: vi.fn((key: string) => mockStorageData[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorageData[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorageData[key];
    })
  };

  const mock105Questions: Question[] = [
    {
      id: 'q105_1',
      topicId: '105',
      subtopicId: '105.1',
      type: 'single',
      prompt: 'Pregunta 105',
      correct: ['a'],
      explanation: 'Exp 105',
      difficulty: 'easy',
      placeholder: false,
      status: 'pendiente-verificacion'
    }
  ];

  const mockContentService = {
    getManifest: vi.fn().mockResolvedValue(mockManifest),
    getQuestions: vi.fn((topicId: string) => {
      if (topicId === '105') {
        return Promise.resolve(mock105Questions);
      }
      return Promise.resolve(mockQuestions);
    })
  };

  const mockPreferencesService = {
    includeExampleContent: vi.fn().mockReturnValue(false),
    preferences: signal({
      theme: 'system',
      defaultStudyView: 'slides',
      showInstructorNotes: true,
      dailyCardLimit: 20,
      includeExampleContent: false,
      enableExamTimer: true,
      enableKeyboardShortcuts: true
    })
  };

  beforeEach(() => {
    mockStorageData = {};
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ExamService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: ContentService, useValue: mockContentService },
        { provide: PreferencesService, useValue: mockPreferencesService }
      ]
    });

    service = TestBed.inject(ExamService);
  });

  it('debe crearse con estado inicial vacío (sin sesión activa ni historial)', () => {
    expect(service).toBeTruthy();
    expect(service.hasActiveSession()).toBe(false);
    expect(service.activeSession()).toBeNull();
    expect(service.history()).toHaveLength(0);
  });

  it('debe iniciar un simulacro de examen y persistir la sesión activa', async () => {
    const session = await service.startExam({ mode: 'exam', questionLimit: 2, seed: 1234 });

    expect(session).toBeTruthy();
    expect(session.mode).toBe('exam');
    expect(session.questions).toHaveLength(2);
    expect(session.durationSeconds).toBe(180); // 2 preguntas * 90 s
    expect(service.hasActiveSession()).toBe(true);
    expect(mockStorageService.setItem).toHaveBeenCalled();
  });

  it('debe calcular dinámicamente el tiempo restante en base a startedAt', async () => {
    // Simulamos un examen iniciado hace 30 segundos con duración de 180 s
    const now = Date.now();
    const startedAt = new Date(now - 30 * 1000).toISOString();

    const mockSession = {
      id: 'test-attempt',
      mode: 'exam' as const,
      startedAt,
      durationSeconds: 180,
      seed: 42,
      questions: mockQuestions,
      currentQuestionIndex: 0,
      answers: {}
    };

    const remaining = service.getRemainingSeconds(mockSession);
    // Debe haber ~150 segundos restantes
    expect(remaining).toBe(150);
  });

  it('debe guardar y actualizar respuestas en la sesión activa', async () => {
    await service.startExam({ mode: 'exam', questionLimit: 2 });

    service.answerQuestion('q1', { selectedOptions: ['a'] });
    const session = service.activeSession();

    expect(session?.answers['q1']?.selectedOptions).toEqual(['a']);
    expect(session?.answers['q1']?.answeredAt).toBeDefined();
  });

  it('debe alternar la marca de revisión (flagged) en una pregunta', async () => {
    await service.startExam({ mode: 'exam', questionLimit: 2 });

    expect(service.activeSession()?.answers['q1']?.flagged).toBeFalsy();

    service.toggleFlagQuestion('q1');
    expect(service.activeSession()?.answers['q1']?.flagged).toBe(true);

    service.toggleFlagQuestion('q1');
    expect(service.activeSession()?.answers['q1']?.flagged).toBe(false);
  });

  it('debe finalizar el examen, guardar en el historial y limpiar la sesión activa', async () => {
    await service.startExam({ mode: 'exam', questionLimit: 2 });
    service.answerQuestion('q1', { selectedOptions: ['a'] }); // Correcta
    service.answerQuestion('q2', { selectedOptions: ['b', 'c'] }); // Correcta

    const result = await service.finishCurrentExam();

    expect(result).toBeTruthy();
    expect(result?.score).toBe(800);
    expect(result?.passed).toBe(true);
    expect(service.hasActiveSession()).toBe(false);
    expect(service.history()).toHaveLength(1);
    expect(service.getAttemptById(result!.id)).toBeDefined();
  });

  it('debe descartar la sesión activa al llamar abandonCurrentExam', async () => {
    await service.startExam({ mode: 'exam', questionLimit: 2 });
    expect(service.hasActiveSession()).toBe(true);

    service.abandonCurrentExam();
    expect(service.hasActiveSession()).toBe(false);
    expect(service.activeSession()).toBeNull();
  });

  it('debe seleccionar preguntas de temas 105-110 al iniciar simulacro del Examen 102', async () => {
    const session = await service.startExam({ mode: 'exam', examId: '102', questionLimit: 1 });
    expect(session.examId).toBe('102');
    expect(session.questions[0]?.topicId).toBe('105');
    expect(session.durationSeconds).toBe(90);
    expect(service.selectedExamId()).toBe('102');
  });

  it('debe calcular estadísticas de preguntas verificadas para el Examen 102', async () => {
    const stats = await service.getVerifiedQuestionsStats('102');
    expect(stats.total).toBe(1);
    expect(stats.verified).toBe(0);
    expect(stats.pending).toBe(1);
    expect(stats.hasPending).toBe(true);
  });

  it('debe recordar y actualizar el selectedExamId seleccionado', () => {
    expect(service.selectedExamId()).toBe('101');
    service.setSelectedExamId('102');
    expect(service.selectedExamId()).toBe('102');
  });
});
