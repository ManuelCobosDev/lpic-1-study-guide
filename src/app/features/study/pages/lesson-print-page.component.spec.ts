import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { LessonPrintPageComponent } from './lesson-print-page.component';
import { ContentService } from '../../../core/services/content.service';
import { Lesson } from '../../../core/models/lesson.model';

describe('LessonPrintPageComponent', () => {
  let component: LessonPrintPageComponent;
  let fixture: ComponentFixture<LessonPrintPageComponent>;
  let mockContentService: Partial<ContentService>;

  const mockLesson: Lesson = {
    id: '103.4',
    topicId: '103',
    examId: '101',
    title: 'Uso de tuberías y filtros',
    version: '1.0',
    language: 'es',
    estimatedMinutes: 25,
    objectives: ['Redirección de entrada y salida estándar', 'Uso de pipes'],
    keyTerms: ['stdin', 'stdout', 'stderr', 'pipe'],
    commands: ['tee', 'xargs', 'grep'],
    placeholder: false,
    slides: [
      {
        id: 'slide-1',
        slideNumber: 1,
        title: 'Introducción a Tuberías',
        layout: 'content',
        blocks: [
          {
            type: 'paragraph',
            text: 'Texto explicativo sobre pipes.'
          }
        ],
        notes: 'Nota didáctica'
      }
    ]
  };

  beforeEach(async () => {
    mockContentService = {
      getLesson: vi.fn().mockResolvedValue(mockLesson)
    };

    await TestBed.configureTestingModule({
      imports: [LessonPrintPageComponent],
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: mockContentService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { subtema: '103.4' },
              queryParams: { formato: 'documento', notas: '1' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonPrintPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar los datos de la lección', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.subtopicId()).toBe('103.4');
    expect(mockContentService.getLesson).toHaveBeenCalledWith('103.4');
    expect(component.lesson()).toEqual(mockLesson);

    const titleEl = fixture.nativeElement.querySelector('h1');
    expect(titleEl?.textContent).toContain('Uso de tuberías y filtros');
  });

  it('debe invocar window.print al llamar printDocument', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    component.printDocument();
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('debe cambiar de formato al seleccionar otra opción', () => {
    const event = { target: { value: 'diapositivas' } } as unknown as Event;
    component.onFormatoChange(event);
    expect(component.formato()).toBe('diapositivas');
  });

  it('debe alternar la inclusión de notas', () => {
    const event = { target: { checked: false } } as unknown as Event;
    component.onNotasToggle(event);
    expect(component.incluirNotas()).toBe(false);
  });
});

