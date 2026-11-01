import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PracticeTabComponent } from './practice-tab.component';
import { Question } from '../../../../core/models/question.model';
import { LessonExercise } from '../../../../core/models/practice.model';

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

  const mockExercises: LessonExercise[] = [
    {
      id: '105.1-eg-01',
      kind: 'guiado',
      title: 'Clasificación de shells',
      statement: 'Indique si gnome-terminal es un shell de login.',
      answer: 'No, es un shell interactivo sin login.',
      source: ['105.1#u288']
    },
    {
      id: '105.1-ee-01',
      kind: 'exploratorio',
      title: 'Recargar configuración',
      statement: '¿Qué orden recarga ~/.bashrc?',
      answer: 'source ~/.bashrc o . ~/.bashrc',
      source: ['105.1#u331']
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
    fixture.componentRef.setInput('exercises', mockExercises);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar las secciones Bloque A, Bloque B y Bloque C', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="quick-quiz"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="mini-flashcards"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="manual-exercises"]')).toBeTruthy();
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

  it('debe alternar la visibilidad de respuestas de ejercicios en el acordeón', () => {
    expect(component.isAnswerVisible('105.1-eg-01')).toBe(false);
    component.toggleShowAnswer('105.1-eg-01');
    expect(component.isAnswerVisible('105.1-eg-01')).toBe(true);
  });

  it('debe permitir marcar y desmarcar un ejercicio como completado', () => {
    expect(component.isExerciseDone('105.1-eg-01')).toBe(false);
    component.toggleExerciseDone('105.1-eg-01');
    expect(component.isExerciseDone('105.1-eg-01')).toBe(true);
  });
});
