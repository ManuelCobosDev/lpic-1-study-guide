import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityHeatmapComponent } from './activity-heatmap.component';

describe('ActivityHeatmapComponent', () => {
  let component: ActivityHeatmapComponent;
  let fixture: ComponentFixture<ActivityHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityHeatmapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe calcular 26 semanas de celdas en el mapa', () => {
    const weeks = component.weeks();
    expect(weeks.length).toBe(26);
    const firstWeek = weeks[0];
    expect(firstWeek).toBeDefined();
    if (firstWeek) {
      expect(firstWeek.days.length).toBe(7);
    }
  });

  it('debe calcular niveles de intensidad según el número de actividades', () => {
    component.activityData = { '2026-10-31': 50 };
    fixture.detectChanges();

    const weeks = component.weeks();
    expect(weeks.length).toBe(26);
    const dayWithActivity = weeks.flatMap((w) => w.days).find((d) => d.dateStr === '2026-10-31');
    if (dayWithActivity) {
      expect(dayWithActivity.minutes).toBe(50);
      expect(dayWithActivity.level).toBe(3);
    }
  });
});