import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CurriculumTreeSidebarComponent } from './curriculum-tree.component';
import { CurriculumManifest } from '../../../core/models';

const mockManifest: CurriculumManifest = {
  version: '1.0.0',
  generatedAt: '2026-10-31T00:00:00Z',
  stats: {
    totalExams: 1,
    totalTopics: 1,
    totalSubtopics: 2,
    availableSubtopics: 2,
    plannedSubtopics: 0,
    totalSlidesReal: 10,
    totalSlidesPlaceholder: 0,
    totalLabsReal: 1,
    totalLabsPlaceholder: 0,
    totalQuestionsReal: 5,
    totalQuestionsPlaceholder: 0,
    totalCommands: 5,
    totalTerms: 5
  },
  exams: [
    {
      id: '101',
      code: '101-500',
      title: 'LPIC-1 Exam 101',
      description: 'Arquitectura del sistema y comandos',
      status: 'available',
      weight: 60,
      topicIds: ['101']
    }
  ],
  topics: [
    {
      id: '101',
      examId: '101',
      title: 'Arquitectura del sistema',
      weight: 8,
      subtopicIds: ['101.1', '101.2']
    }
  ],
  subtopics: [
    {
      id: '101.1',
      topicId: '101',
      title: 'Determinación y configuración del hardware',
      weight: 2,
      estimatedMinutes: 30,
      status: 'available',
      placeholder: false
    },
    {
      id: '101.2',
      topicId: '101',
      title: 'Arranque del sistema',
      weight: 3,
      estimatedMinutes: 30,
      status: 'available',
      placeholder: false
    }
  ]
};

@Component({
  standalone: true,
  imports: [CurriculumTreeSidebarComponent],
  template: `
    <app-curriculum-tree-sidebar
      [manifest]="manifest()"
      [completedSubtopics]="completedSubtopics()"
      [activeSubtopicId]="activeSubtopicId()"
    />
  `
})
class TestHostComponent {
  readonly manifest = signal<CurriculumManifest | null>(mockManifest);
  readonly completedSubtopics = signal<Record<string, boolean>>({});
  readonly activeSubtopicId = signal<string>('101.1');
}

describe('CurriculumTreeSidebarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe renderizar el total de subtemas y la lista de temas', () => {
    const badge = fixture.nativeElement.querySelector('.tree-header-badge');
    expect(badge.textContent).toContain('2 subtemas');

    const subtopicLinks = fixture.nativeElement.querySelectorAll('.subtopic-link');
    expect(subtopicLinks.length).toBe(2);
  });

  it('no debe mostrar ningún check con progreso vacío (Gate 4)', () => {
    const checkIcons = fixture.nativeElement.querySelectorAll('.check-icon');
    expect(checkIcons.length).toBe(0);
  });

  it('debe mostrar el check verde cuando un subtema está completado', () => {
    host.completedSubtopics.set({ '101.1': true });
    fixture.detectChanges();

    const checkIcons = fixture.nativeElement.querySelectorAll('.check-icon');
    expect(checkIcons.length).toBe(1);
  });

  it('debe marcar como activo el subtema indicado', () => {
    const activeLink = fixture.nativeElement.querySelector('.subtopic-active');
    expect(activeLink).toBeTruthy();
    expect(activeLink.textContent).toContain('101.1');
  });
});
