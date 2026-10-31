import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { CurriculumCardComponent } from './curriculum-card.component';
import { Subtopic, Topic } from '../../../../core/models/curriculum.model';
import { DEFAULT_PROGRESS, UserProgress } from '../../../../core/models/progress.model';

describe('CurriculumCardComponent', () => {
  let fixture: ComponentFixture<CurriculumCardComponent>;
  let component: CurriculumCardComponent;

  const mockTopic: Topic = {
    id: '101',
    examId: '101',
    title: 'Arquitectura del sistema',
    weight: 8,
    subtopicIds: ['101.1', '101.2']
  };

  const mockSubtopics: Subtopic[] = [
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
    }
  ];

  function createComponent(progress: UserProgress = DEFAULT_PROGRESS, isPlanned = false) {
    TestBed.configureTestingModule({
      imports: [CurriculumCardComponent],
      providers: [provideRouter([])]
    });

    fixture = TestBed.createComponent(CurriculumCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.componentRef.setInput('subtopics', mockSubtopics);
    fixture.componentRef.setInput('progress', progress);
    fixture.componentRef.setInput('isPlanned', isPlanned);
    fixture.detectChanges();
  }

  it('debe renderizar el título del tema, eyebrow y el medidor de peso LPI', () => {
    createComponent();
    expect(component).toBeTruthy();

    const titleEl = fixture.nativeElement.querySelector('.topic-title');
    expect(titleEl.textContent).toContain('Arquitectura del sistema');

    const eyebrowEl = fixture.nativeElement.querySelector('.topic-eyebrow');
    expect(eyebrowEl.textContent).toContain('TEMA 101');

    const weightMeter = fixture.nativeElement.querySelector('app-weight-meter');
    expect(weightMeter).toBeTruthy();
  });

  it('con progreso inicial vacío, NINGÚN subtema muestra check verde (Gate 4)', () => {
    createComponent();
    const checkIcons = fixture.nativeElement.querySelectorAll('.check-icon');
    expect(checkIcons.length).toBe(0);
    expect(component.isSubtopicCompleted('101.1')).toBe(false);
    expect(component.isSubtopicCompleted('101.2')).toBe(false);
    expect(component.isCompleted()).toBe(false);
  });

  it('cuando un subtema está completado en el progreso, muestra el check verde', () => {
    const progressWithCompleted: UserProgress = {
      ...DEFAULT_PROGRESS,
      completedSubtopics: {
        '101.1': '2026-10-31T00:00:00Z'
      }
    };
    createComponent(progressWithCompleted);

    expect(component.isSubtopicCompleted('101.1')).toBe(true);
    expect(component.isSubtopicCompleted('101.2')).toBe(false);

    const checkIcons = fixture.nativeElement.querySelectorAll('.check-icon');
    expect(checkIcons.length).toBe(1);
  });

  it('renderiza el botón "Lab" de 32 px para subtemas con práctica asociada', () => {
    createComponent();
    const labBtn = fixture.nativeElement.querySelector('.lab-btn');
    expect(labBtn).toBeTruthy();
    expect(labBtn.textContent.trim()).toBe('Lab');
    expect(labBtn.getAttribute('href')).toContain('/laboratorios/101.1');
  });

  it('en modo planificado (isPlanned=true), aplica la clase visual dashed y bloquea enlaces', () => {
    createComponent(DEFAULT_PROGRESS, true);
    const card = fixture.nativeElement.querySelector('.curriculum-card');
    expect(card.classList.contains('card-planned')).toBe(true);
  });
});

