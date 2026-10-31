import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LabsPageComponent } from './labs-page.component';
import { LabsService } from '../../../core/services/labs.service';
import { LabSummary } from '../../../core/models/lab.model';

describe('LabsPageComponent', () => {
  let component: LabsPageComponent;
  let fixture: ComponentFixture<LabsPageComponent>;
  let router: Router;

  const mockCatalog: LabSummary[] = [
    {
      id: 'lab-103-4',
      subtopicId: '103.4',
      topicId: '103',
      title: 'Práctica 103.4 — Tuberías y Redirecciones',
      estimatedMinutes: 30,
      difficulty: 'advanced',
      type: 'subtopic',
      stepCount: 6
    },
    {
      id: 'lab-101-1',
      subtopicId: '101.1',
      topicId: '101',
      title: 'Práctica 101.1 — Arquitectura de Hardware',
      estimatedMinutes: 20,
      difficulty: 'basic',
      type: 'subtopic',
      stepCount: 5
    }
  ];

  const mockLabsService = {
    state: signal({
      schemaVersion: 1,
      completedSteps: {
        'lab-103-4': [1, 2, 3, 4, 5, 6] // Completado
      },
      dismissedVmNotice: false
    }),
    getLabsCatalog: vi.fn().mockResolvedValue(mockCatalog),
    getCompletedSteps: vi.fn((labId: string) => {
      if (labId === 'lab-103-4') return [1, 2, 3, 4, 5, 6];
      return [];
    }),
    getLabStatus: vi.fn((labId: string) => {
      if (labId === 'lab-103-4') return 'completed';
      return 'pending';
    })
  };

  beforeEach(async () => {
    mockLabsService.getLabsCatalog.mockClear();

    await TestBed.configureTestingModule({
      imports: [LabsPageComponent],
      providers: [
        provideRouter([]),
        { provide: LabsService, useValue: mockLabsService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(new Map([['tema', 'all'], ['dificultad', 'all'], ['estado', 'all']]))
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LabsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse y cargar el catálogo de laboratorios', () => {
    expect(component).toBeTruthy();
    expect(component.rawLabs().length).toBe(2);
    expect(mockLabsService.getLabsCatalog).toHaveBeenCalled();
  });

  it('debe renderizar el título de la página y las tarjetas', () => {
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading.textContent).toContain('Laboratorios Prácticos');

    const cards = fixture.nativeElement.querySelectorAll('.lab-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('103.4');
    expect(cards[1].textContent).toContain('101.1');
  });

  it('debe calcular estadísticas de estado correctamente', () => {
    expect(component.totalCompleted()).toBe(1);
    expect(component.totalPending()).toBe(1);
    expect(component.totalInProgress()).toBe(0);
  });

  it('debe filtrar laboratorios por término de búsqueda', () => {
    component.query.set('103.4');
    fixture.detectChanges();

    expect(component.filteredLabs().length).toBe(1);
    expect(component.filteredLabs()[0]?.id).toBe('lab-103-4');
  });

  it('debe filtrar laboratorios por dificultad', () => {
    component.selectedDifficulty.set('basic');
    fixture.detectChanges();

    expect(component.filteredLabs().length).toBe(1);
    expect(component.filteredLabs()[0]?.id).toBe('lab-101-1');
  });

  it('debe filtrar laboratorios por estado (completed vs pending)', () => {
    component.selectedStatus.set('completed');
    fixture.detectChanges();

    expect(component.filteredLabs().length).toBe(1);
    expect(component.filteredLabs()[0]?.id).toBe('lab-103-4');
  });

  it('debe mostrar el estado vacío si ningún laboratorio coincide', () => {
    component.query.set('no-existe-este-lab');
    fixture.detectChanges();

    expect(component.filteredLabs().length).toBe(0);
    const emptyState = fixture.nativeElement.querySelector('app-empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No hay laboratorios que coincidan');
  });
});

