import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BlockRendererComponent } from './block-renderer.component';
import { Block } from '../../core/models/block.model';

describe('BlockRendererComponent', () => {
  let fixture: ComponentFixture<BlockRendererComponent>;
  let component: BlockRendererComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockRendererComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BlockRendererComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza bloque heading (h2)', () => {
    const headingBlock: Block = {
      type: 'heading',
      level: 2,
      text: 'Encabezado de prueba'
    };

    fixture.componentRef.setInput('block', headingBlock);
    fixture.detectChanges();

    const h2 = fixture.nativeElement.querySelector('h2.heading-block-2');
    expect(h2).toBeTruthy();
    expect(h2.textContent).toContain('Encabezado de prueba');
  });

  it('renderiza bloque paragraph con enlaces Wikipedia sanitizados', () => {
    const paragraphBlock: Block = {
      type: 'paragraph',
      text: 'Texto con enlace a [tee](cmd:tee) y [stdout](term:stdout)'
    };

    fixture.componentRef.setInput('block', paragraphBlock);
    fixture.detectChanges();

    const p = fixture.nativeElement.querySelector('p.paragraph-block');
    expect(p).toBeTruthy();
    expect(p.innerHTML).toContain('wiki-cmd-link');
    expect(p.innerHTML).toContain('wiki-term-link');
  });

  it('renderiza bloque terminal con prompt y salida atenuada', () => {
    const terminalBlock: Block = {
      type: 'terminal',
      lines: [
        { prompt: '$ ', command: 'ls /etc', output: 'passwd\nshadow' }
      ]
    };

    fixture.componentRef.setInput('block', terminalBlock);
    fixture.detectChanges();

    const cmdEl = fixture.nativeElement.querySelector('.terminal-cmd');
    expect(cmdEl).toBeTruthy();
    expect(cmdEl.textContent).toContain('ls /etc');

    const outEl = fixture.nativeElement.querySelector('.terminal-output');
    expect(outEl).toBeTruthy();
    expect(outEl.textContent).toContain('passwd');
  });

  it('renderiza bloque callout con tipo exam', () => {
    const calloutBlock: Block = {
      type: 'callout',
      calloutType: 'exam',
      title: 'Clave de Examen',
      content: 'Pregunta recurrente sobre operadores > y >>'
    };

    fixture.componentRef.setInput('block', calloutBlock);
    fixture.detectChanges();

    const calloutEl = fixture.nativeElement.querySelector('app-callout');
    expect(calloutEl).toBeTruthy();
    expect(calloutEl.textContent).toContain('Clave de Examen');
    expect(calloutEl.textContent).toContain('Pregunta recurrente');
  });

  it('renderiza bloque steps con pasos numerados', () => {
    const stepsBlock: Block = {
      type: 'steps',
      items: [
        { number: 1, title: 'Paso 1', description: 'Abrir terminal' },
        { number: 2, title: 'Paso 2', description: 'Ejecutar comando' }
      ]
    };

    fixture.componentRef.setInput('block', stepsBlock);
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('.step-badge');
    expect(badges.length).toBe(2);
    expect(badges[0].textContent?.trim()).toBe('1');
    expect(badges[1].textContent?.trim()).toBe('2');
  });

  it('renderiza bloque quiz-inline con comprobación de respuesta interactiva', () => {
    const quizBlock: Block = {
      type: 'quiz-inline',
      id: 'quiz-1',
      question: '¿Qué operador concatena sin truncar?',
      options: [
        { key: 'a', text: '>' },
        { key: 'b', text: '>>' },
        { key: 'c', text: '<' }
      ],
      correct: ['b'],
      explanation: 'El operador >> abre en modo append.'
    };

    fixture.componentRef.setInput('block', quizBlock);
    fixture.detectChanges();

    // Seleccionar opción b
    const inputB = fixture.nativeElement.querySelector('input[value="b"]');
    expect(inputB).toBeTruthy();
    inputB.click();
    fixture.detectChanges();

    // Comprobar respuesta
    const checkBtn = fixture.nativeElement.querySelector('button');
    checkBtn.click();
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector('.quiz-feedback');
    expect(feedback).toBeTruthy();
    expect(feedback.textContent).toContain('¡Respuesta correcta!');
    expect(feedback.textContent).toContain('modo append');
  });
});
