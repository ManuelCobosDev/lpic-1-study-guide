import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LessonWebViewComponent } from './lesson-web-view.component';
import { Slide } from '../../../../core/models/slide.model';

describe('LessonWebViewComponent', () => {
  let component: LessonWebViewComponent;
  let fixture: ComponentFixture<LessonWebViewComponent>;

  const mockSlides: Slide[] = [
    {
      id: 'slide-1',
      slideNumber: 1,
      title: 'Introducción a Tuberías',
      layout: 'content',
      blocks: [
        {
          type: 'paragraph',
          text: 'Los pipes conectan stdout de un comando con stdin de otro.'
        }
      ],
      notes: 'Hacer énfasis en el operador | frente a redirecciones.'
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      title: 'Filtros Comunes',
      layout: 'content',
      blocks: [
        {
          type: 'paragraph',
          text: 'Comandos como grep, cut, sort y uniq.'
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonWebViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonWebViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('slides', mockSlides);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar tantas secciones como slides haya', () => {
    const sections = fixture.nativeElement.querySelectorAll('.web-slide-section');
    expect(sections.length).toBe(2);

    const firstTitle = fixture.nativeElement.querySelector('h2');
    expect(firstTitle?.textContent).toContain('Introducción a Tuberías');
  });

  it('debe emitir jumpToSlide con el número de diapositiva al pulsar "Ver en diapositiva"', () => {
    const emitSpy = vi.fn();
    component.jumpToSlide.subscribe(emitSpy);

    const jumpButtons = fixture.nativeElement.querySelectorAll('.jump-to-slide-btn');
    expect(jumpButtons.length).toBe(2);

    jumpButtons[0].click();
    expect(emitSpy).toHaveBeenCalledWith(1);

    jumpButtons[1].click();
    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('debe mostrar la nota didáctica del instructor solo si está definida en la diapositiva', () => {
    const notesCards = fixture.nativeElement.querySelectorAll('.instructor-note-card');
    expect(notesCards.length).toBe(1);
    expect(notesCards[0].textContent).toContain('Hacer énfasis en el operador |');
  });

  it('debe renderizar el índice lateral con las diapositivas', () => {
    const tocLinks = fixture.nativeElement.querySelectorAll('.toc-link');
    expect(tocLinks.length).toBe(2);
    expect(tocLinks[0].textContent).toContain('1. Introducción a Tuberías');
    expect(tocLinks[1].textContent).toContain('2. Filtros Comunes');
  });

  it('scrollToSection actualiza activeSection', () => {
    const mockEvent = { preventDefault: vi.fn() } as unknown as MouseEvent;
    component.scrollToSection(mockEvent, 2);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.activeSection()).toBe(2);
  });
});

