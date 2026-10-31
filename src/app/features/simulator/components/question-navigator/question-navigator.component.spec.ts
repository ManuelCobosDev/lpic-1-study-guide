import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionNavigatorComponent } from './question-navigator.component';
import { Question } from '../../../../core/models/question.model';
import { ComponentRef } from '@angular/core';

describe('QuestionNavigatorComponent', () => {
  let component: QuestionNavigatorComponent;
  let componentRef: ComponentRef<QuestionNavigatorComponent>;
  let fixture: ComponentFixture<QuestionNavigatorComponent>;

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      topicId: '103',
      subtopicId: '103.4',
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
      type: 'fill',
      prompt: 'Pregunta 2',
      correct: [],
      acceptedAnswers: ['top'],
      explanation: 'Exp 2',
      difficulty: 'medium',
      placeholder: false
    },
    {
      id: 'q3',
      topicId: '103',
      subtopicId: '103.4',
      type: 'single',
      prompt: 'Pregunta 3',
      correct: ['b'],
      explanation: 'Exp 3',
      difficulty: 'hard',
      placeholder: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionNavigatorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionNavigatorComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('questions', mockQuestions);
    componentRef.setInput('currentIndex', 0);
    componentRef.setInput('answers', {
      q1: { questionId: 'q1', selectedOptions: ['a'], flagged: false },
      q2: { questionId: 'q2', textAnswer: '', flagged: true }
    });
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe calcular correctamente las respondidas y las marcadas', () => {
    expect(component.answeredCount()).toBe(1); // sólo q1 tiene selectedOptions con datos
    expect(component.flaggedCount()).toBe(1); // q2 está marcada

    expect(component.isAnswered('q1')).toBe(true);
    expect(component.isAnswered('q2')).toBe(false);
    expect(component.isAnswered('q3')).toBe(false);

    expect(component.isFlagged('q1')).toBe(false);
    expect(component.isFlagged('q2')).toBe(true);
  });

  it('debe emitir selectQuestion al hacer click en una pregunta', () => {
    let selectedIdx = -1;
    component.selectQuestion.subscribe((idx) => {
      selectedIdx = idx;
    });

    component.onQuestionClick(2);
    expect(selectedIdx).toBe(2);
  });

  it('debe alternar el cajón de navegación móvil', () => {
    expect(component.isMobileDrawerOpen()).toBe(false);
    component.toggleMobileDrawer();
    expect(component.isMobileDrawerOpen()).toBe(true);
    component.toggleMobileDrawer();
    expect(component.isMobileDrawerOpen()).toBe(false);
  });
});

