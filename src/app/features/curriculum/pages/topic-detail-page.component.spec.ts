import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TopicDetailPageComponent } from './topic-detail-page.component';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

describe('TopicDetailPageComponent', () => {
  let fixture: ComponentFixture<TopicDetailPageComponent>;
  let component: TopicDetailPageComponent;
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
        description: 'Examen 101',
        weight: 60,
        status: 'available',
        topicIds: ['101', '102']
      }
    ],
    topics: [
      { id: '101', examId: '101', title: 'Arquitectura del sistema', weight: 8, subtopicIds: ['101.1', '101.2'] },
      { id: '102', examId: '101', title: 'Instalación de Linux y gestión de paquetes', weight: 12, subtopicIds: ['102.1'] }
    ],
    subtopics: [
      {
        id: '101.1',
        topicId: '101',
        title: 'Determinación y configuración del hardware',
        weight: 2,
        estimatedMinutes: 20,
        status: 'available',
        placeholder: false,
        slideCount: 12,
        labId: '101.1'
      },
      {
        id: '101.2',
        topicId: '101',
        title: 'Arranque del sistema (boot)',
        weight: 3,
        estimatedMinutes: 25,
        status: 'available',
        placeholder: false,
        slideCount: 15
      },
      {
        id: '102.1',
        topicId: '102',
        title: 'Diseño de la estructura de disco',
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
      imports: [TopicDetailPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([
              ['examen', '101'],
              ['tema', '101']
            ]))
          }
        },
        ContentService,
        ProgressService
      ]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    await contentService.getManifest();

    fixture = TestBed.createComponent(TopicDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y mostrar el título del Tema 101', () => {
    expect(component).toBeTruthy();
    expect(component.currentTopicId()).toBe('101');
    const title = fixture.nativeElement.querySelector('.topic-title');
    expect(title.textContent).toContain('Arquitectura del sistema');
  });

  it('renderiza las 4 secciones estructuradas requeridas por la especificación', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('1. Lecciones teóricas y objetivos');
    expect(text).toContain('2. Laboratorios y retos prácticos');
    expect(text).toContain('3. Test oficial del Tema 101');
    expect(text).toContain('4. Resumen y chuleta del tema');
  });

  it('con progreso inicial vacío, ningún subtema muestra check verde y el progreso del tema es 0%', () => {
    expect(component.topicProgress()).toBe(0);
    const checks = fixture.nativeElement.querySelectorAll('.completed-check');
    expect(checks.length).toBe(0);
  });

  it('renderiza los subtemas del tema y la misión integradora global', () => {
    const subtopicCards = fixture.nativeElement.querySelectorAll('.subtopic-card');
    expect(subtopicCards.length).toBe(2);

    const globalMissionTitle = fixture.nativeElement.textContent;
    expect(globalMissionTitle).toContain('Práctica global del Tema 101');
  });

  it('ofrece navegación adyacente hacia el Tema 102', () => {
    expect(component.prevTopic()).toBeNull(); // Es el primer tema
    expect(component.nextTopic()).not.toBeNull();
    expect(component.nextTopic()?.id).toBe('102');

    const adjLinks = fixture.nativeElement.querySelectorAll('.adj-link');
    expect(adjLinks.length).toBe(1);
    expect(adjLinks[0].textContent).toContain('Tema 102');
  });
});

