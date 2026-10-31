import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressPageComponent } from './progress-page.component';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ExamService } from '../../../core/services/exam.service';
import { FlashcardsService } from '../../../core/services/flashcards.service';
import { ClockService } from '../../../core/services/clock.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

const mockManifest: CurriculumManifest = {
  version: '1.0.0',
  generatedAt: '2026-10-31T00:00:00Z',
  exams: [
    { id: '101', code: '101-500', title: 'LPIC-1 Exam 101', description: 'Exam 101', status: 'available', weight: 60, topicIds: ['t101', 't102'] },
    { id: '102', code: '102-500', title: 'LPIC-1 Exam 102', description: 'Exam 102', status: 'available', weight: 60, topicIds: ['t105'] }
  ],
  topics: [
    { id: '101', examId: '101', title: 'Arquitectura del Sistema', weight: 8, subtopicIds: ['101.1'] },
    { id: '102', examId: '101', title: 'Instalación de Linux', weight: 7, subtopicIds: ['102.1'] },
    { id: '105', examId: '102', title: 'Shells y Scripts', weight: 8, subtopicIds: ['105.1'] }
  ],
  subtopics: [
    { id: '101.1', topicId: '101', title: 'Determinación y configuración del hardware', weight: 2, estimatedMinutes: 45, status: 'available', placeholder: false },
    { id: '102.1', topicId: '102', title: 'Diseño del esquema de particiones', weight: 3, estimatedMinutes: 40, status: 'available', placeholder: false },
    { id: '105.1', topicId: '105', title: 'Personalización del entorno shell', weight: 4, estimatedMinutes: 50, status: 'available', placeholder: false }
  ],
  stats: {
    totalExams: 2,
    totalTopics: 3,
    totalSubtopics: 3,
    availableSubtopics: 3,
    plannedSubtopics: 0,
    totalSlidesReal: 30,
    totalSlidesPlaceholder: 0,
    totalLabsReal: 3,
    totalLabsPlaceholder: 0,
    totalQuestionsReal: 30,
    totalQuestionsPlaceholder: 0,
    totalCommands: 30,
    totalTerms: 30
  }
};

describe('ProgressPageComponent', () => {
  let component: ProgressPageComponent;
  let fixture: ComponentFixture<ProgressPageComponent>;
  let contentService: ContentService;
  let progressService: ProgressService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ProgressPageComponent],
      providers: [
        provideRouter([]),
        ContentService,
        ProgressService,
        ExamService,
        FlashcardsService,
        ClockService
      ]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    progressService = TestBed.inject(ProgressService);
    vi.spyOn(contentService, 'getManifest').mockResolvedValue(mockManifest);

    fixture = TestBed.createComponent(ProgressPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse correctamente y mostrar el título de la página', () => {
    expect(component).toBeTruthy();
    const title = fixture.nativeElement.querySelector('.page-title');
    expect(title.textContent).toContain('Tu progreso');
  });

  it('debe mostrar las 4 StatCards principales', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="stat-lessons"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="stat-exams"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="stat-flashcards"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="stat-streak"]')).toBeTruthy();
  });

  it('debe actualizar las lecciones completadas al marcar progreso', () => {
    expect(component.lessonsStat().completed).toBe(0);
    expect(component.lessonsStat().total).toBe(3);

    progressService.markSubtopicCompleted('101.1');
    fixture.detectChanges();

    expect(component.lessonsStat().completed).toBe(1);
    expect(component.lessonsStat().percentage).toBe(33);
  });

  it('debe calcular la tabla de progreso por tema oficial', () => {
    const list = component.topicProgressList();
    expect(list.length).toBe(3);
    const firstTopic = list[0];
    expect(firstTopic).toBeDefined();
    if (firstTopic) {
      expect(firstTopic.id).toBe('101');
      expect(firstTopic.number).toBe(101);
      expect(firstTopic.weight).toBe(8);
    }
  });

  it('debe mostrar recomendación de siguiente lección si no hay temas débiles', () => {
    const next = component.nextStep();
    expect(next.type).toBe('continue');
    expect(next.link).toBe('/leccion/101.1');
  });

  it('debe renderizar la tabla de progreso con las filas correspondientes', () => {
    const rows = fixture.nativeElement.querySelectorAll('.progress-table tbody tr');
    expect(rows.length).toBe(3);
  });
});