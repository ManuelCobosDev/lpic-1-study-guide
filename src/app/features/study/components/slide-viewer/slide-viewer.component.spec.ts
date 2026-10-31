import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SlideViewerComponent } from './slide-viewer.component';
import { Slide } from '../../../../core/models/slide.model';

describe('SlideViewerComponent', () => {
  let fixture: ComponentFixture<SlideViewerComponent>;
  let component: SlideViewerComponent;

  const mockSlides: Slide[] = [
    {
      id: '103.4-1',
      slideNumber: 1,
      title: 'Portada: Flujos y tuberías',
      layout: 'cover',
      blocks: [
        { type: 'heading', level: 1, text: 'Portada: Flujos y tuberías' },
        { type: 'paragraph', text: 'Objetivo 103.4' }
      ],
      notes: 'Nota del instructor para slide 1'
    },
    {
      id: '103.4-2',
      slideNumber: 2,
      title: 'Los tres canales estándar',
      layout: 'content',
      blocks: [
        { type: 'heading', level: 2, text: 'Los tres canales estándar' },
        { type: 'paragraph', text: '0 stdin, 1 stdout, 2 stderr' }
      ],
      notes: 'Nota del instructor para slide 2'
    },
    {
      id: '103.4-3',
      slideNumber: 3,
      title: 'El operador tee',
      layout: 'content',
      blocks: [
        { type: 'heading', level: 2, text: 'El operador tee' }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SlideViewerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subtopicId', '103.4');
    fixture.componentRef.setInput('slides', mockSlides);
    fixture.componentRef.setInput('currentSlideNumber', 1);
    fixture.detectChanges();
  });

  it('debe crearse y renderizar la primera diapositiva', () => {
    expect(component).toBeTruthy();
    expect(component.currentIndex()).toBe(0);
    expect(component.totalSlides()).toBe(3);

    const titleEl = fixture.nativeElement.querySelector('.slide-header h1');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent).toContain('Portada: Flujos y tuberías');
  });

  it('avanza a la siguiente diapositiva con nextSlide() y con atajo ArrowRight', () => {
    component.nextSlide();
    fixture.detectChanges();

    expect(component.currentSlideNumber()).toBe(2);
    expect(component.currentIndex()).toBe(1);

    // Con evento de teclado ArrowRight
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(component.currentSlideNumber()).toBe(3);
    expect(component.currentIndex()).toBe(2);
  });

  it('retrocede con prevSlide() y con atajo ArrowLeft', () => {
    component.goToSlide(3);
    fixture.detectChanges();

    expect(component.currentSlideNumber()).toBe(3);

    component.prevSlide();
    fixture.detectChanges();
    expect(component.currentSlideNumber()).toBe(2);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(component.currentSlideNumber()).toBe(1);
  });

  it('salta con teclas numéricas 1..9', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    fixture.detectChanges();

    expect(component.currentSlideNumber()).toBe(3);
  });

  it('alterna pantalla completa con toggleFullscreen() o tecla F y sale con Escape', () => {
    expect(component.isFullscreen()).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    fixture.detectChanges();
    expect(component.isFullscreen()).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.isFullscreen()).toBe(false);
  });

  it('abre y cierra el cajón de miniaturas con T y tecla Escape', () => {
    expect(component.showThumbnails()).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
    fixture.detectChanges();
    expect(component.showThumbnails()).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.showThumbnails()).toBe(false);
  });

  it('actualiza el anuncio aria-live al cambiar de diapositiva', () => {
    component.goToSlide(2);
    fixture.detectChanges();

    expect(component.ariaAnnouncement()).toContain('Diapositiva 2 de 3: Los tres canales estándar');
  });
});

