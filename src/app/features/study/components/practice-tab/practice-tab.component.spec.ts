import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PracticeTabComponent } from './practice-tab.component';
import { Question } from '../../../../core/models/question.model';
import { FlashcardItem } from '../../../../core/models/flashcard.model';

describe('PracticeTabComponent', () => {
  let fixture: ComponentFixture<PracticeTabComponent>;
  let component: PracticeTabComponent;

  const mockQuestions: Question[] = [
    {
      id: 'q-test-1',
      topicId: '105',
      subtopicId: '105.1',
      type: 'single',
      prompt: '¿Qué comando lista las variables de entorno?',
      options: [
        { id: 'a', text: 'env' },
        { id: 'b', text: 'ls' },
        { id: 'c', text: 'cd' }
      ],
      correct: ['a'],
      explanation: 'El comando env muestra las variables de entorno activas.',
      difficulty: 'easy',
      placeholder: false
    },
    {
      id: 'q-test-2',
      topicId: '105',
      subtopicId: '105.1',
      type: 'fill',
      prompt: '¿Qué fichero se lee al iniciar un shell interactivo de login?',
      correct: ['/etc/profile'],
      acceptedAnswers: ['/etc/profile', '~/.bash_profile'],
      explanation: '/etc/profile es el primer archivo leído.',
      difficulty: 'medium',
      placeholder: false
    }
  ];

  const mockFlashcards: FlashcardItem[] = [
    {
      id: 'fc-test-1',
      topicId: '105',
      subtopicIds: ['105.1'],
      type: 'command',
      frontTitle: 'export',
      frontSubtitle: 'Variables',
      prompt: 'Promueve una variable al entorno de los subshells.',
      backTitle: 'export [variable[=valor]]',
      backDescription: 'Marca variables para ser exportadas a procesos hijos.',
      backSyntax: 'export VAR=valor'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeTabComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeTabComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subtopicId', '105.1');
    fixture.componentRef.setInput('questions', mockQuestions);
    fixture.componentRef.setInput('flashcards', mockFlashcards);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar las secciones Bloque A (Test Rápido) y Bloque B (Mini-Flashcards)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="quick-quiz"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="mini-flashcards"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="manual-exercises"]')).toBeFalsy();
  });

  it('debe permitir seleccionar una opción y comprobar la respuesta en el test rápido', () => {
    expect(component.isAnswerChecked()).toBe(false);

    component.toggleOption('a', 'single');
    expect(component.selectedOptions()).toEqual(['a']);

    component.checkAnswer();
    expect(component.isAnswerChecked()).toBe(true);
    expect(component.isCurrentQuestionCorrect()).toBe(true);
    expect(component.quizScore()).toBe(1);
  });
});