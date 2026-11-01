import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamPageComponent } from './exam-page.component';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

describe('ExamPageComponent', () => {
  let fixture: ComponentFixture<ExamPageComponent>;
  let component: ExamPageComponent;
  let contentService: ContentService;

  const mockManifest: CurriculumManifest = {
    version: '1.0.0',
    generatedAt: '2026-10-31T00:00:00Z',
    stats: {
      totalExams: 2,
      totalTopics: 10,
      totalSubtopics: 42,
      availableSubtopics: 23,
      plannedSubtopics: 19,
      totalSlidesReal: 19,
      totalSlidesPlaceholder: 317,
      totalLabsReal: 6,
      totalLabsPlaceholder: 36,
      totalQuestionsReal: 43,
      totalQuestionsPlaceholder: 0,
      totalCommands: 25,
      totalTerms: 22
    },
    exams: [
      {
        id: '101',
        code: '101-500',
        title: 'LPIC-1 Exam 101',
        description: 'Arquitectura, paquetes y comandos',
        weight: 60,
        status: 'available',
        topicIds: ['101', '102', '103', '104']
      }
    ],
    topics: [
      { id: '101', examId: '101', title: 'Arquitectura del sistema', weight: 8, subtopicIds: ['101.1'] },
      { id: '102', examId: '101', title: 'Instalación de Linux y paquetes', weight: 12, subtopicIds: ['102.1'] },
      { id: '103', examId: '101', title: 'Comandos GNU y Unix', weight: 26, subtopicIds: ['103.1'] },
      { id: '104', examId: '101', title: 'Dispositivos y FHS', weight: 14, subtopicIds: ['104.1'] }
    ],
    subtopics: [
      { id: '101.1', topicId: '101', title: 'Hardware', weight: 2, estimatedMinutes: 20, status: 'available', placeholder: false },
      { id: '102.1', topicId: '102', title: 'Paquetes', weight: 3, estimatedMinutes: 25, status: 'available', placeholder: false },
      { id: '103.1', topicId: '103', title: 'Comandos', weight: 4, estimatedMinutes: 30, status: 'available', placeholder: false },
      { id: '104.1', topicId: '104', title: 'Dispositivos', weight: 3, estimatedMinutes: 25, status: 'available', placeholder: false }
    ]
  };

  beforeEach(async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockManifest
    });
    vi.stubGlobal('fetch', fetchSpy);

    await TestBed.configureTestingModule({
      imports: [ExamPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['examen', '101']]))
          }
        },
        ContentService,
        ProgressService
      ]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    await contentService.getManifest();

    fixture = TestBed.createComponent(ExamPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y mostrar el título oficial del examen 101', () => {
    expect(component).toBeTruthy();
    expect(component.examId()).toBe('101');
    const title = fixture.nativeElement.querySelector('.exam-title');
    expect(title.textContent).toContain('LPIC-1 Exam 101');
  });

  it('renderiza las 4 tarjetas de temas del Examen 101', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-curriculum-card');
    expect(cards.length).toBe(4);
  });

  it('muestra el anillo de progreso para el examen', () => {
    const ring = fixture.nativeElement.querySelector('app-progress-ring');
    expect(ring).toBeTruthy();
    expect(ring.textContent).toContain('0%');
  });
});

