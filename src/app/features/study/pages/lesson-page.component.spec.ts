import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LessonPageComponent } from './lesson-page.component';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { NotesService } from '../../../core/services/notes.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { Lesson } from '../../../core/models/lesson.model';

describe('LessonPageComponent', () => {
  let component: LessonPageComponent;
  let fixture: ComponentFixture<LessonPageComponent>;
  let mockContentService: Partial<ContentService>;
  let mockProgressService: Partial<ProgressService>;
  let mockNotesService: Partial<NotesService>;
  let mockPreferencesService: Partial<PreferencesService>;
  let titleService: Title;

  const mockLesson: Lesson = {
    id: '103.4',
    topicId: '103',
    examId: '101',
    title: 'Secuencias, tuberías y redirecciones',
    version: '1.0',
    language: 'es',
    estimatedMinutes: 40,
    objectives: ['Redirigir flujos estándar', 'Encadenar tuberías'],
    keyTerms: ['stdin', 'stdout', 'stderr', 'pipe'],
    commands: ['tee', 'xargs', 'grep'],
    placeholder: false,
    slides: [
      {
        id: '103.4-1',
        slideNumber: 1,
        title: 'Portada de Flujos',
        layout: 'cover',
        blocks: [
          {
            type: 'paragraph',
            text: 'Texto introductorio.'
          }
        ]
      },
      {
        id: '103.4-2',
        slideNumber: 2,
        title: 'Los 3 Descriptores Estándar',
        layout: 'content',
        blocks: [
          {
            type: 'paragraph',
            text: 'stdin 0, stdout 1, stderr 2.'
          }
        ]
      }
    ]
  };

  const paramMap$ = new BehaviorSubject({
    get: (key: string) => (key === 'subtema' ? '103.4' : null)
  });

  const queryParamMap$ = new BehaviorSubject({
    get: (key: string) => {
      if (key === 'slide') return '2';
      if (key === 'vista') return 'slides';
      return null;
    }
  });

  beforeEach(async () => {
    mockContentService = {
      getLesson: vi.fn().mockResolvedValue(mockLesson),
      getManifest: vi.fn().mockResolvedValue({ exams: [] }),
      manifest: vi.fn().mockReturnValue(null) as unknown as ContentService['manifest']
    };

    mockProgressService = {
      progress: vi.fn().mockReturnValue({
        completedSubtopics: {},
        viewedSlides: {},
        lastSlide: {},
        lastVisited: null,
        checkpoints: {},
        completedLabs: {}
      }) as unknown as ProgressService['progress'],
      markSubtopicCompleted: vi.fn(),
      unmarkSubtopicCompleted: vi.fn(),
      recordSlideViewed: vi.fn(),
      recordLastVisited: vi.fn(),
      flush: vi.fn()
    };

    mockNotesService = {
      getNote: vi.fn().mockReturnValue('Mi apunte sobre tee'),
      setNote: vi.fn(),
      flush: vi.fn()
    };

    mockPreferencesService = {
      defaultStudyView: vi.fn().mockReturnValue('slides') as unknown as PreferencesService['defaultStudyView'],
      setDefaultStudyView: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LessonPageComponent],
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: mockContentService },
        { provide: ProgressService, useValue: mockProgressService },
        { provide: NotesService, useValue: mockNotesService },
        { provide: PreferencesService, useValue: mockPreferencesService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$,
            queryParamMap: queryParamMap$,
            snapshot: { params: { subtema: '103.4' }, queryParams: { slide: '2' } }
          }
        }
      ]
    }).compileComponents();

    titleService = TestBed.inject(Title);
    fixture = TestBed.createComponent(LessonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar los datos de la lección 103.4', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.subtopicId()).toBe('103.4');
    expect(mockContentService.getLesson).toHaveBeenCalledWith('103.4');
    expect(component.lesson()).toEqual(mockLesson);
    expect(titleService.getTitle()).toContain('103.4 Secuencias, tuberías');
  });

  it('debe reflejar la diapositiva inicial indicada en queryParams (?slide=2)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.currentSlideNumber()).toBe(2);
  });

  it('debe alternar el estado de completado con toggleCompleted()', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isCompleted()).toBe(false);
    component.toggleCompleted();
    expect(mockProgressService.markSubtopicCompleted).toHaveBeenCalledWith('103.4');
  });

  it('debe permitir cambiar de vista (slides, web, pdf)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    component.onSelectView('web');
    expect(component.vista()).toBe('web');
    expect(mockPreferencesService.setDefaultStudyView).toHaveBeenCalledWith('web');

    component.onSelectView('pdf');
    expect(component.vista()).toBe('pdf');
  });

  it('debe actualizar y persistir notas personales', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.subtopicNote()).toBe('Mi apunte sobre tee');

    const event = { target: { value: 'Nuevo apunte sobre xargs' } } as unknown as Event;
    component.onNoteInput(event);

    expect(component.subtopicNote()).toBe('Nuevo apunte sobre xargs');
    expect(mockNotesService.setNote).toHaveBeenCalledWith('103.4', 'Nuevo apunte sobre xargs');
  });

  it('debe cambiar a vista slides y avanzar diapositiva al saltar desde la vista web', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    component.onSelectView('web');
    expect(component.vista()).toBe('web');

    component.onJumpToSlideFromWeb(2);
    expect(component.vista()).toBe('slides');
    expect(component.currentSlideNumber()).toBe(2);
    expect(mockProgressService.recordSlideViewed).toHaveBeenCalledWith('103.4', 2);
  });
});

