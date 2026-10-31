import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePageComponent } from './home-page.component';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

describe('HomePageComponent', () => {
  let fixture: ComponentFixture<HomePageComponent>;
  let component: HomePageComponent;
  let contentService: ContentService;
  let progressService: ProgressService;

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
        description: 'Examen 101',
        weight: 60,
        status: 'available',
        topicIds: ['101']
      },
      {
        id: '102',
        code: '102-500',
        title: 'LPIC-1 Exam 102',
        description: 'Examen 102',
        weight: 60,
        status: 'planned',
        topicIds: []
      }
    ],
    topics: [
      {
        id: '101',
        examId: '101',
        title: 'Arquitectura del sistema',
        weight: 8,
        subtopicIds: ['101.1']
      }
    ],
    subtopics: [
      {
        id: '101.1',
        topicId: '101',
        title: 'Determinación y configuración del hardware',
        weight: 2,
        estimatedMinutes: 20,
        status: 'available',
        placeholder: false
      }
    ]
  };

  beforeEach(async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockManifest
    });
    vi.stubGlobal('fetch', fetchSpy);

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        ContentService,
        ProgressService
      ]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    progressService = TestBed.inject(ProgressService);
    await contentService.getManifest();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente de la Home y renderizar el título principal', () => {
    expect(component).toBeTruthy();
    const title = fixture.nativeElement.querySelector('.hero-title');
    expect(title.textContent).toContain('Prepara el LPIC-1 a tu ritmo');
  });

  it('con progreso inicial vacío, el CTA dice "Empezar por el Tema 101 →" y el anillo muestra 0%', () => {
    const ctaText = component.primaryCtaText();
    expect(ctaText).toBe('Empezar por el Tema 101 →');

    const progressValue = component.exam101Progress();
    expect(progressValue).toBe(0);

    const ring = fixture.nativeElement.querySelector('app-progress-ring');
    expect(ring).toBeTruthy();
    expect(ring.textContent).toContain('0%');
  });

  it('muestra las métricas dinámicas exactas extraídas del manifiesto (R6: cero cifras a mano)', () => {
    expect(component.totalSlides()).toBe(336); // 19 + 317
    expect(component.totalSubtopics()).toBe(42);
    expect(component.totalLabs()).toBe(42); // 6 + 36
    expect(component.totalQuestions()).toBe(43);
    expect(component.totalCommands()).toBe(25);
    expect(component.totalTerms()).toBe(22);

    const metricNumbers = Array.from(fixture.nativeElement.querySelectorAll('.metric-number'))
      .map((el) => (el as HTMLElement).textContent?.trim());

    expect(metricNumbers).toContain('336');
    expect(metricNumbers).toContain('42');
    expect(metricNumbers).toContain('25');
    expect(metricNumbers).toContain('22');
  });

  it('debe permitir expandir y colapsar preguntas del acordeón FAQ', () => {
    // La primera pregunta (faq1) empieza abierta
    expect(component.isFaqOpen('faq1')).toBe(true);
    expect(component.isFaqOpen('faq2')).toBe(false);

    // Conmutar faq2
    component.toggleFaq('faq2');
    expect(component.isFaqOpen('faq2')).toBe(true);

    // Conmutar faq1 para cerrarla
    component.toggleFaq('faq1');
    expect(component.isFaqOpen('faq1')).toBe(false);
  });

  it('actualiza el progreso dinamicamente cuando progressService marca un subtema completado', () => {
    expect(component.exam101Progress()).toBe(0);
    progressService.markSubtopicCompleted('101.1');
    fixture.detectChanges();
    expect(component.exam101Progress()).toBe(100);
  });
});