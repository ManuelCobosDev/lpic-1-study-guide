import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOUR_STEPS, TourService } from './tour.service';
import { StorageService } from './storage.service';

@Component({ template: '', standalone: true })
class DummyRouteComponent {}

describe('TourService', () => {
  let service: TourService;
  let storage: StorageService;
  let router: Router;
  let targetNodes: HTMLElement[] = [];

  const mountTarget = (className: string): HTMLElement => {
    const el = document.createElement('div');
    el.className = className;
    el.getBoundingClientRect = () => ({
      x: 10,
      y: 20,
      top: 20,
      left: 10,
      bottom: 120,
      right: 310,
      width: 300,
      height: 100,
      toJSON: () => ({})
    });
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    targetNodes.push(el);
    return el;
  };

  beforeEach(async () => {
    targetNodes = [];
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      providers: [
        TourService,
        StorageService,
        provideRouter([
          { path: '', component: DummyRouteComponent },
          { path: 'temario', component: DummyRouteComponent },
          { path: 'estudiar/:subtema', component: DummyRouteComponent },
          { path: 'laboratorios', component: DummyRouteComponent },
          { path: 'simulador', component: DummyRouteComponent },
          { path: 'comandos', component: DummyRouteComponent },
          { path: 'glosario', component: DummyRouteComponent },
          { path: 'flashcards', component: DummyRouteComponent },
          { path: 'mapa-mental', component: DummyRouteComponent },
          { path: 'progreso', component: DummyRouteComponent }
        ])
      ]
    }).compileComponents();

    storage = TestBed.inject(StorageService);
    storage.clearAll();
    router = TestBed.inject(Router);
    service = TestBed.inject(TourService);
    await router.navigateByUrl('/');
  });

  afterEach(() => {
    service.stopTour();
    storage.clearAll();
    for (const el of targetNodes) {
      el.remove();
    }
    targetNodes = [];
    vi.restoreAllMocks();
  });

  it('define los 12 pasos esperados cubriendo todas las secciones clave', () => {
    expect(TOUR_STEPS.length).toBe(12);

    const routes = TOUR_STEPS.map((s) => s.route);
    expect(routes).toEqual([
      '/',
      '/',
      '/temario',
      '/estudiar/101.1',
      '/estudiar/101.1',
      '/laboratorios',
      '/simulador',
      '/comandos',
      '/glosario',
      '/flashcards',
      '/mapa-mental',
      '/progreso'
    ]);

    for (const step of TOUR_STEPS) {
      expect(step.id.length).toBeGreaterThan(0);
      expect(step.selector.length).toBeGreaterThan(0);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(20);
    }
  });

  it('lee correctamente el estado inicial de tour_completed desde StorageService', () => {
    expect(service.hasCompletedTour()).toBe(false);

    storage.setItem('tour_completed', 'true');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [TourService, StorageService, provideRouter([])]
    });
    const freshService = TestBed.inject(TourService);
    expect(freshService.hasCompletedTour()).toBe(true);
    freshService.stopTour();
  });

  it('inicia el tour, muestra el popover con barra de progreso y persiste tour_completed al detenerse', async () => {
    mountTarget('app-header');

    await service.startTour(0);

    expect(service.isActive()).toBe(true);
    expect(service.currentStepIndex()).toBe(0);

    const popover = document.querySelector('.driver-popover.lpic1-tour-popover');
    expect(popover).toBeTruthy();
    expect(popover?.querySelector('.driver-popover-title')?.textContent).toContain('1/12');

    const progressFill = popover?.querySelector<HTMLElement>('.lpic1-tour-progress-fill');
    expect(progressFill).toBeTruthy();
    expect(progressFill?.style.width).toBe('8%');

    service.stopTour();

    expect(service.isActive()).toBe(false);
    expect(service.hasCompletedTour()).toBe(true);
    expect(storage.getItem('tour_completed')).toBe('true');
    expect(document.querySelector('.driver-popover.lpic1-tour-popover')).toBeNull();
  });

  it('navega a la ruta correspondiente al avanzar a un paso de otra sección', async () => {
    mountTarget('app-header');
    const temarioBanner = document.createElement('div');
    temarioBanner.className = 'curriculum-page';
    const bannerChild = document.createElement('div');
    bannerChild.className = 'exam-banner';
    bannerChild.getBoundingClientRect = () => ({
      x: 10,
      y: 80,
      top: 80,
      left: 10,
      bottom: 220,
      right: 410,
      width: 400,
      height: 140,
      toJSON: () => ({})
    });
    bannerChild.scrollIntoView = vi.fn();
    temarioBanner.appendChild(bannerChild);
    document.body.appendChild(temarioBanner);
    targetNodes.push(temarioBanner);

    await service.startTour(0);
    expect(service.currentStepIndex()).toBe(0);

    await service.moveToStep(2);
    expect(router.url).toBe('/temario');
    expect(service.currentStepIndex()).toBe(2);

    const popover = document.querySelector('.driver-popover.lpic1-tour-popover');
    expect(popover?.querySelector('.driver-popover-title')?.textContent).toContain('3/12');
    const progressFill = popover?.querySelector<HTMLElement>('.lpic1-tour-progress-fill');
    expect(progressFill?.style.width).toBe('25%');
  });
});

