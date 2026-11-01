import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorPracticePageComponent } from './simulator-practice-page.component';
import { ContentService } from '../../../core/services/content.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Question } from '../../../core/models/question.model';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

describe('SimulatorPracticePageComponent', () => {
  let component: SimulatorPracticePageComponent;
  let fixture: ComponentFixture<SimulatorPracticePageComponent>;
  let contentServiceMock: Partial<ContentService>;
  let preferencesServiceMock: Partial<PreferencesService>;

  const mockQuestions: Question[] = [
    {
      id: 'q-prac-1',
      topicId: '103',
      subtopicId: '103.4',
      type: 'single',
      prompt: '¿Qué opción de ps muestra todos los procesos?',
      options: [
        { id: 'a', text: 'ps aux' },
        { id: 'b', text: 'ps -e' }
      ],
      correct: ['a'],
      explanation: 'ps aux lista todos los procesos de forma estándar BSD.',
      difficulty: 'easy',
      placeholder: false
    },
    {
      id: 'q-prac-2',
      topicId: '103',
      subtopicId: '103.4',
      type: 'fill',
      prompt: 'Escribe el comando de monitorización dinámica de procesos:',
      correct: [],
      acceptedAnswers: ['top'],
      explanation: 'top muestra la lista interactiva de procesos.',
      difficulty: 'medium',
      placeholder: false
    }
  ];

  const mockManifest: Partial<CurriculumManifest> = {
    topics: [
      { id: '103', title: 'Comandos GNU y Unix', examId: '101', weight: 26, subtopicIds: [] }
    ]
  };

  beforeEach(async () => {
    contentServiceMock = {
      getManifest: vi.fn().mockResolvedValue(mockManifest),
      getQuestions: vi.fn().mockResolvedValue(mockQuestions)
    };

    preferencesServiceMock = {
      includeExampleContent: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [SimulatorPracticePageComponent],
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: contentServiceMock },
        { provide: PreferencesService, useValue: preferencesServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'tema' ? '103' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SimulatorPracticePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente y cargar las preguntas filtradas por tema', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.topics().length).toBe(1);
    expect(component.selectedTopicId()).toBe('103');
    expect(component.filteredQuestions().length).toBe(2);
  });

  it('debe permitir navegar entre preguntas siguiente y anterior', async () => {
    await fixture.whenStable();
    expect(component.currentIndex()).toBe(0);

    component.nextQuestion();
    expect(component.currentIndex()).toBe(1);

    component.prevQuestion();
    expect(component.currentIndex()).toBe(0);
  });

  it('debe registrar respuestas y permitir comprobarlas', async () => {
    await fixture.whenStable();
    const q1 = mockQuestions[0]!;

    component.handleAnswerChange({ selectedOptions: ['a'] });
    expect(component.answers()[q1.id]?.selectedOptions).toEqual(['a']);

    component.handleCheckPractice();
    expect(component.isCurrentChecked()).toBe(true);
  });

  it('debe permitir marcar y desmarcar preguntas para revisión', async () => {
    await fixture.whenStable();
    const q1 = mockQuestions[0]!;

    component.handleToggleFlag();
    expect(component.answers()[q1.id]?.flagged).toBe(true);

    component.handleToggleFlag();
    expect(component.answers()[q1.id]?.flagged).toBe(false);
  });
});
