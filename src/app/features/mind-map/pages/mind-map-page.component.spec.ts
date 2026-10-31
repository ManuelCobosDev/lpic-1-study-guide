import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MindMapPageComponent } from './mind-map-page.component';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

const mockManifest: CurriculumManifest = {
  version: '1.0.0',
  generatedAt: '2026-10-31T00:00:00Z',
  exams: [
    { id: '101', code: '101-500', title: 'LPIC-1 Exam 101', description: 'Exam 101', status: 'available', weight: 60, topicIds: ['101', '102'] },
    { id: '102', code: '102-500', title: 'LPIC-1 Exam 102', description: 'Exam 102', status: 'available', weight: 60, topicIds: ['105'] }
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

describe('MindMapPageComponent', () => {
  let component: MindMapPageComponent;
  let fixture: ComponentFixture<MindMapPageComponent>;
  let contentService: ContentService;
  let progressService: ProgressService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [MindMapPageComponent],
      providers: [
        provideRouter([]),
        ContentService,
        ProgressService
      ]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    progressService = TestBed.inject(ProgressService);
    vi.spyOn(contentService, 'getManifest').mockResolvedValue(mockManifest);

    fixture = TestBed.createComponent(MindMapPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse correctamente y cargar el árbol jerárquico', () => {
    expect(component).toBeTruthy();
    const tree = component.layoutTree();
    expect(tree.nodes.length).toBeGreaterThan(0);
    // Raíz (1) + Exámenes (2) + Temas (3) + Subtemas (3) = 9 nodos
    expect(tree.nodes.length).toBe(9);
  });

  it('debe renderizar el lienzo SVG con la leyenda de estados', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.mind-map-svg')).toBeTruthy();
    expect(el.querySelector('.status-legend')).toBeTruthy();
    expect(el.querySelector('[data-testid="toggle-only-pending"]')).toBeTruthy();
  });

  it('debe actualizar el estado de los nodos al marcar progreso', () => {
    const subNodeBefore = component.layoutTree().nodes.find((n) => n.id === '101.1');
    expect(subNodeBefore?.data.status).toBe('pending');

    progressService.markSubtopicCompleted('101.1');
    fixture.detectChanges();

    const subNodeAfter = component.layoutTree().nodes.find((n) => n.id === '101.1');
    expect(subNodeAfter?.data.status).toBe('completed');
  });

  it('debe filtrar o atenuar completados cuando el toggle solo pendientes está activo', () => {
    progressService.markSubtopicCompleted('101.1');
    component.toggleOnlyPending();
    fixture.detectChanges();

    expect(component.onlyPending()).toBe(true);
    const subNode = component.layoutTree().nodes.find((n) => n.id === '101.1');
    expect(subNode?.isDimmed).toBe(true);
  });

  it('debe buscar nodos por código o nombre y resaltar coincidencias', () => {
    component.searchQuery.set('hardware');
    fixture.detectChanges();

    const results = component.searchResults();
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe('101.1');

    const matchedNode = component.layoutTree().nodes.find((n) => n.id === '101.1');
    expect(matchedNode?.isMatch).toBe(true);
  });

  it('debe abrir y cerrar el panel lateral (drawer) con los detalles del nodo', () => {
    const subNode = component.layoutTree().nodes.find((n) => n.id === '101.1');
    expect(subNode).toBeDefined();
    if (subNode) {
      component.selectNode(subNode.data);
      fixture.detectChanges();

      const drawer = fixture.nativeElement.querySelector('[data-testid="node-drawer"]');
      expect(drawer).toBeTruthy();
      expect(drawer.textContent).toContain('Determinación y configuración del hardware');

      component.closeDrawer();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="node-drawer"]')).toBeNull();
    }
  });

  it('debe cerrar el panel lateral al pulsar Escape', () => {
    const subNode = component.layoutTree().nodes.find((n) => n.id === '101.1');
    if (subNode) {
      component.selectNode(subNode.data);
      expect(component.selectedNode()).not.toBeNull();

      component.onEscape();
      expect(component.selectedNode()).toBeNull();
    }
  });
});

