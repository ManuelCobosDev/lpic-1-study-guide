import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreChartComponent } from './score-chart.component';
import { ExamAttempt } from '../../../../core/models/attempt.model';

const mockAttempts: ExamAttempt[] = [
  {
    id: 'att-1',
    mode: 'exam',
    startedAt: '2026-10-15T10:00:00Z',
    finishedAt: '2026-10-15T11:00:00Z',
    durationSeconds: 5400,
    timeRemainingSeconds: 1800,
    seed: 12345,
    questionIds: ['q1', 'q2'],
    answers: {},
    score: 450,
    passed: false
  },
  {
    id: 'att-2',
    mode: 'exam',
    startedAt: '2026-10-25T10:00:00Z',
    finishedAt: '2026-10-25T11:00:00Z',
    durationSeconds: 5400,
    timeRemainingSeconds: 2000,
    seed: 67890,
    questionIds: ['q1', 'q2'],
    answers: {},
    score: 620,
    passed: true
  }
];

describe('ScoreChartComponent', () => {
  let component: ScoreChartComponent;
  let fixture: ComponentFixture<ScoreChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreChartComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente y mostrar estado vacío si no hay intentos', () => {
    expect(component).toBeTruthy();
    expect(component.chartPoints().length).toBe(0);
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('debe calcular puntos y coordenadas correctamente con intentos', () => {
    component.attempts = mockAttempts;
    fixture.detectChanges();

    const points = component.chartPoints();
    expect(points.length).toBe(2);
    expect(points[0]?.score).toBe(450);
    expect(points[0]?.passed).toBe(false);
    expect(points[1]?.score).toBe(620);
    expect(points[1]?.passed).toBe(true);

    const svg = fixture.nativeElement.querySelector('.chart-svg');
    expect(svg).toBeTruthy();
  });

  it('debe calcular la línea de aprobado en 500 puntos', () => {
    const passingY = component.passingY();
    expect(passingY).toBeGreaterThan(0);
    expect(passingY).toBeLessThan(component.height);
  });
});

