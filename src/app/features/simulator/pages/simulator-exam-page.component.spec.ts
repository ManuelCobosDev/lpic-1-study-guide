import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorExamPageComponent } from './simulator-exam-page.component';
import { ExamService } from '../../../core/services/exam.service';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ActiveExamSession } from '../../../core/models/attempt.model';
import { Question } from '../../../core/models/question.model';

describe('SimulatorExamPageComponent', () => {
  let component: SimulatorExamPageComponent;
  let fixture: ComponentFixture<SimulatorExamPageComponent>;
  let examServiceMock: Partial<ExamService>;
  let router: Router;

  const mockQuestions: Question[] = [
    {
      id: 'q-exam-1',
      topicId: '103',
      subtopicId: '103.4',
      type: 'single',
      prompt: 'Pregunta 1 de examen',
      options: [
        { id: 'a', text: 'Opción A' },
        { id: 'b', text: 'Opción B' }
      ],
      correct: ['a'],
      explanation: 'Exp 1',
      difficulty: 'easy',
      placeholder: false
    },
    {
      id: 'q-exam-2',
      topicId: '103',
      subtopicId: '103.4',
      type: 'single',
      prompt: 'Pregunta 2 de examen',
      options: [
        { id: 'a', text: 'Opción A' },
        { id: 'b', text: 'Opción B' }
      ],
      correct: ['b'],
      explanation: 'Exp 2',
      difficulty: 'medium',
      placeholder: false
    }
  ];

  const mockActiveSession: ActiveExamSession = {
    id: 'test-session-1',
    mode: 'exam',
    startedAt: new Date().toISOString(),
    durationSeconds: 5400,
    seed: 12345,
    questions: mockQuestions,
    currentQuestionIndex: 0,
    answers: {}
  };

  beforeEach(async () => {
    examServiceMock = {
      activeSession: signal(mockActiveSession),
      getRemainingSeconds: vi.fn().mockReturnValue(5000),
      answerQuestion: vi.fn(),
      toggleFlagQuestion: vi.fn(),
      setCurrentQuestionIndex: vi.fn(),
      finishCurrentExam: vi.fn().mockResolvedValue({
        id: 'test-session-1',
        mode: 'exam',
        score: 650,
        passed: true
      })
    };

    await TestBed.configureTestingModule({
      imports: [SimulatorExamPageComponent],
      providers: [
        provideRouter([]),
        { provide: ExamService, useValue: examServiceMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(SimulatorExamPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente con las preguntas de la sesión activa', () => {
    expect(component).toBeTruthy();
    expect(component.questions().length).toBe(2);
    expect(component.currentIndex()).toBe(0);
    expect(component.currentQuestion()?.id).toBe('q-exam-1');
  });

  it('debe actualizar la respuesta de una pregunta en ExamService', () => {
    component.handleAnswerChange({ selectedOptions: ['a'] });
    expect(examServiceMock.answerQuestion).toHaveBeenCalledWith('q-exam-1', {
      selectedOptions: ['a']
    });
  });

  it('debe alternar la marca de revisión en ExamService', () => {
    component.handleToggleFlag();
    expect(examServiceMock.toggleFlagQuestion).toHaveBeenCalledWith('q-exam-1');
  });

  it('debe navegar a la pregunta siguiente y anterior', () => {
    component.nextQuestion();
    expect(examServiceMock.setCurrentQuestionIndex).toHaveBeenCalledWith(1);
  });

  it('debe abrir y cerrar el diálogo de confirmación de finalización', () => {
    expect(component.isFinishDialogOpen()).toBe(false);
    component.openFinishDialog();
    expect(component.isFinishDialogOpen()).toBe(true);
    component.closeFinishDialog();
    expect(component.isFinishDialogOpen()).toBe(false);
  });

  it('debe entregar el examen y redirigir a resultados con id', async () => {
    await component.confirmFinishExam();
    expect(examServiceMock.finishCurrentExam).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/simulador/resultados'], {
      queryParams: { id: 'test-session-1' }
    });
  });
});

