import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CurriculumPageComponent } from './curriculum-page.component';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

describe('CurriculumPageComponent', () => {
  let fixture: ComponentFixture<CurriculumPageComponent>;
  let component: CurriculumPageComponent;
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
        topicIds: ['101', '102', '103', '104']
      },
      {
        id: '102',
        code: '102-500',
        title: 'LPIC-1 Exam 102',
        description: 'Examen 102',
        weight: 60,
        status: 'planned',
        topicIds: ['105', '106', '107', '108', '109', '110']
      }
    ],
    topics: [
      { id: '101', examId: '101', title: 'Arquitectura del sistema', weight: 8, subtopicIds: ['101.1'] },
      { id: '102', examId: '101', title: 'Instalación de Linux y gestión de paquetes', weight: 12, subtopicIds: ['102.1'] },
      { id: '103', examId: '101', title: 'Comandos GNU y Unix', weight: 26, subtopicIds: ['103.1'] },
      { id: '104', examId: '101', title: 'Dispositivos, sistemas de archivos y FHS', weight: 14, subtopicIds: ['104.1'] },
      { id: '105', examId: '102', title: 'Shells y scripts', weight: 10, subtopicIds: ['105.1'] },
      { id: '106', examId: '102', title: 'Interfaces de usuario y escritorios', weight: 8, subtopicIds: ['106.1'] },
      { id: '107', examId: '102', title: 'Tareas administrativas', weight: 12, subtopicIds: ['107.1'] },
      { id: '108', examId: '102', title: 'Servicios esenciales del sistema', weight: 10, subtopicIds: ['108.1'] },
      { id: '109', examId: '102', title: 'Fundamentos de redes', weight: 12, subtopicIds: ['109.1'] },
      { id: '110', examId: '102', title: 'Seguridad', weight: 8, subtopicIds: ['110.1'] }
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
      imports: [CurriculumPageComponent],
      providers: [
        provideRouter([]),
        ContentService,
        ProgressService
      ]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    await contentService.getManifest();

    fixture = TestBed.createComponent(CurriculumPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y mostrar el H1 oficial del temario', () => {
    expect(component).toBeTruthy();
    const h1 = fixture.nativeElement.querySelector('.page-title');
    expect(h1.textContent).toContain('Temario Oficial LPIC-1');
  });

  it('renderiza las 4 tarjetas del Examen 101 en la vista por defecto', () => {
    expect(component.activeExamId()).toBe('101');
    const cards = fixture.nativeElement.querySelectorAll('app-curriculum-card');
    expect(cards.length).toBe(4);
  });

  it('permite cambiar a la pestaña del Examen 102 y muestra sus 6 temas planificados', () => {
    component.onTabChange('102');
    fixture.detectChanges();

    expect(component.activeExamId()).toBe('102');
    const cards = fixture.nativeElement.querySelectorAll('app-curriculum-card');
    expect(cards.length).toBe(6);
  });

  it('calcula las métricas dinámicas del manifiesto sin cifras hardcodeadas', () => {
    expect(component.totalTopics()).toBe(10);
    expect(component.totalSubtopics()).toBe(42);
    expect(component.totalWeight()).toBe(120);
  });
});

