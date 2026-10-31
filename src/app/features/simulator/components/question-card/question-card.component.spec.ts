import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionCardComponent } from './question-card.component';
import { Question } from '../../../../core/models/question.model';
import { ComponentRef } from '@angular/core';

describe('QuestionCardComponent', () => {
  let component: QuestionCardComponent;
  let componentRef: ComponentRef<QuestionCardComponent>;
  let fixture: ComponentFixture<QuestionCardComponent>;

  const mockSingleQuestion: Question = {
    id: 'q-single-1',
    topicId: '103',
    subtopicId: '103.4',
    type: 'single',
    prompt: '¿Qué comando cambia la prioridad de un proceso en ejecución?',
    options: [
      { id: 'a', text: 'nice' },
      { id: 'b', text: 'renice' },
      { id: 'c', text: 'top' },
      { id: 'd', text: 'ps' }
    ],
    correct: ['b'],
    explanation: 'renice altera la prioridad de un proceso existente.',
    difficulty: 'medium',
    placeholder: false
  };

  const mockMultipleQuestion: Question = {
    id: 'q-multi-1',
    topicId: '103',
    subtopicId: '103.4',
    type: 'multiple',
    prompt: '¿Cuáles de los siguientes son comandos para enviar señales a procesos?',
    options: [
      { id: 'a', text: 'kill' },
      { id: 'b', text: 'pkill' },
      { id: 'c', text: 'ps' },
      { id: 'd', text: 'top' }
    ],
    correct: ['a', 'b'],
    explanation: 'kill y pkill envían señales.',
    difficulty: 'medium',
    placeholder: false
  };

  const mockFillQuestion: Question = {
    id: 'q-fill-1',
    topicId: '103',
    subtopicId: '103.4',
    type: 'fill',
    prompt: 'Escribe el comando para listar procesos con árbol jerárquico:',
    correct: [],
    acceptedAnswers: ['pstree', '/usr/bin/pstree'],
    explanation: 'pstree muestra los procesos en forma de árbol.',
    difficulty: 'easy',
    placeholder: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('question', mockSingleQuestion);
    componentRef.setInput('questionNumber', 1);
    componentRef.setInput('totalQuestions', 10);
    componentRef.setInput('mode', 'exam');
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.typeLabel()).toBe('Opción única');
  });

  it('debe emitir respuesta para opción única al seleccionar una opción', () => {
    let emittedAnswer: { selectedOptions?: string[]; textAnswer?: string } | undefined;
    component.answerChanged.subscribe((ans) => {
      emittedAnswer = ans;
    });

    component.onSelectSingle('b');
    expect(emittedAnswer).toEqual({ selectedOptions: ['b'] });
  });

  it('debe gestionar selecciones múltiples alternando opciones', () => {
    componentRef.setInput('question', mockMultipleQuestion);
    fixture.detectChanges();

    let emittedAnswer: { selectedOptions?: string[]; textAnswer?: string } | undefined;
    component.answerChanged.subscribe((ans) => {
      emittedAnswer = ans;
    });

    // Seleccionar primera
    component.onToggleMultiple('a');
    expect(emittedAnswer?.selectedOptions).toEqual(['a']);

    // Ahora simular que ya tenía seleccionada 'a' y seleccionar 'b'
    componentRef.setInput('answer', {
      questionId: mockMultipleQuestion.id,
      selectedOptions: ['a']
    });
    fixture.detectChanges();

    component.onToggleMultiple('b');
    expect(emittedAnswer?.selectedOptions).toEqual(['a', 'b']);

    // Deseleccionar 'a'
    componentRef.setInput('answer', {
      questionId: mockMultipleQuestion.id,
      selectedOptions: ['a', 'b']
    });
    fixture.detectChanges();

    component.onToggleMultiple('a');
    expect(emittedAnswer?.selectedOptions).toEqual(['b']);
  });

  it('debe emitir respuesta de texto para preguntas fill', () => {
    componentRef.setInput('question', mockFillQuestion);
    fixture.detectChanges();

    let emittedAnswer: { selectedOptions?: string[]; textAnswer?: string } | undefined;
    component.answerChanged.subscribe((ans) => {
      emittedAnswer = ans;
    });

    const mockEvent = {
      target: { value: 'pstree -p' }
    } as unknown as Event;

    component.onTextInput(mockEvent);
    expect(emittedAnswer).toEqual({ textAnswer: 'pstree -p' });
  });

  it('debe emitir toggleFlag al hacer click en el botón de marcar', () => {
    let flagEmitted = false;
    component.toggleFlag.subscribe(() => {
      flagEmitted = true;
    });

    component.onFlagClick();
    expect(flagEmitted).toBe(true);
  });

  it('en modo práctica debe evaluar aciertos y mostrar retroalimentación', () => {
    componentRef.setInput('mode', 'practice');
    componentRef.setInput('isPracticeChecked', true);
    componentRef.setInput('answer', {
      questionId: mockSingleQuestion.id,
      selectedOptions: ['b'] // respuesta correcta
    });
    fixture.detectChanges();

    expect(component.isPracticeAnswerCorrect()).toBe(true);
    const targetOption = mockSingleQuestion.options![1];
    expect(targetOption).toBeDefined();
    if (targetOption) {
      expect(component.getOptionFeedbackClass(targetOption)).toBe('feedback-correct');
    }
  });
});
