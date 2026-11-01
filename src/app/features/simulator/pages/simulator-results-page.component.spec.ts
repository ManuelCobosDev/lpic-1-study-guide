import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorResultsPageComponent } from './simulator-results-page.component';
import { ExamService } from '../../../core/services/exam.service';
import { ContentService } from '../../../core/services/content.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { ExamAttempt } from '../../../core/models/attempt.model';
import { Question } from '../../../core/models/question.model';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

describe('SimulatorResultsPageComponent', () => {
  let component: SimulatorResultsPageComponent;
  let fixture: ComponentFixture<SimulatorResultsPageComponent>;
  let examServiceMock: Partial<ExamService>;
  let contentServiceMock: Partial<ContentService>;
  let router: Router;

  const mockQuestions: Question[] = [
    {
      id: 'q-res-1',
      topicId: '103',
      subtopicId: '103.4',
      type: 'single',
      prompt: 'Pregunta 1',
      options: [
        { id: 'a', text: 'Opción A' },
        { id: 'b', text: 'Opción B' }
      ],
      correct: ['a'],
      explanation: 'Explicación 1',
      difficulty: 'easy',
      placeholder: false
    },
    {
      id: 'q-res-2',
      topicId: '103',
      subtopicId: '103.4',
      type: 'single',
      prompt: 'Pregunta 2',
      options: [
        { id: 'a', text: 'Opción A' },
        { id: 'b', text: 'Opción B' }
      ],
      correct: ['b'],
      explanation: 'Explicación 2',
      difficulty: 'medium',
      placeholder: false
    }
  ];

  const mockAttempt: ExamAttempt = {
    id: 'attempt-123',
    mode: 'exam',
    startedAt: '2026-10-31T12:00:00.000Z',
    finishedAt: '2026-10-31T12:45:00.000Z',
    durationSeconds: 5400,
    timeRemainingSeconds: 2700,
    seed: 42,
    questionIds: ['q-res-1', 'q-res-2'],
    questions: mockQuestions,
    answers: {
      'q-res-1': { questionId: 'q-res-1', selectedOptions: ['a'], flagged: false },
      'q-res-2': { questionId: 'q-res-2', selectedOptions: ['a'], flagged: true } // fallada
    },
    score: 600,
    passed: true,
    topicScores: {
      '103': { correct: 1, total: 2, percentage: 50 } // débil (<70%)
    }
  };

  const mockManifest: Partial<CurriculumManifest> = {
    topics: [
      { id: '103', title: 'Comandos GNU y Unix', examId: '101', weight: 26, subtopicIds: [] }
    ]
  };

  beforeEach(async () => {
    examServiceMock = {
      getAttemptById: vi.fn().mockImplementation((id: string) => {
        return id === 'attempt-123' ? mockAttempt : undefined;
      }),
      getRecentAttempts: vi.fn().mockReturnValue([mockAttempt]),
      startExam: vi.fn().mockResolvedValue({ id: 'new-session' })
    };

    contentServiceMock = {
      getManifest: vi.fn().mockResolvedValue(mockManifest)
    };

    await TestBed.configureTestingModule({
      imports: [SimulatorResultsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ExamService, useValue: examServiceMock },
        { provide: ContentService, useValue: contentServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'id' ? 'attempt-123' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(SimulatorResultsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar el intento por query param id', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.attempt()?.id).toBe('attempt-123');
    expect(component.score()).toBe(600);
    expect(component.passed()).toBe(true);
  });

  it('debe formatear el tiempo empleado correctamente', async () => {
    await fixture.whenStable();
    expect(component.timeSpentFormatted()).toBe('45:00'); // 5400 - 2700 = 2700 s = 45 min
  });

  it('debe detectar temas débiles (< 70%)', async () => {
    await fixture.whenStable();
    expect(component.weakTopicIds()).toEqual(['103']);
  });

  it('debe filtrar preguntas en el acordeón de revisión', async () => {
    await fixture.whenStable();
    // Todas
    expect(component.filteredQuestions().length).toBe(2);

    // Falladas
    component.setReviewFilter('failed');
    expect(component.filteredQuestions().length).toBe(1);
    expect(component.filteredQuestions()[0]?.id).toBe('q-res-2');

    // Marcadas
    component.setReviewFilter('flagged');
    expect(component.filteredQuestions().length).toBe(1);
    expect(component.filteredQuestions()[0]?.id).toBe('q-res-2');
  });

  it('debe permitir expandir y colapsar items del acordeón', () => {
    expect(component.isAccordionExpanded('q-res-1')).toBe(false);
    component.toggleAccordion('q-res-1');
    expect(component.isAccordionExpanded('q-res-1')).toBe(true);
    component.toggleAccordion('q-res-1');
    expect(component.isAccordionExpanded('q-res-1')).toBe(false);
  });
});

