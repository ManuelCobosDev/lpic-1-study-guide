import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ContainerComponent } from './container.component';

@Component({
  standalone: true,
  imports: [ContainerComponent],
  template: `
    <app-container [wide]="wide()" [size]="size()">
      <p>Contenido de prueba</p>
    </app-container>
  `
})
class TestHostComponent {
  readonly wide = signal<boolean>(false);
  readonly size = signal<'standard' | 'wide' | 'fixed' | string>('standard');
}

describe('ContainerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let routerEvents$: Subject<unknown>;
  let mockRouter: { url: string; events: Subject<unknown> };

  beforeEach(async () => {
    routerEvents$ = new Subject<unknown>();
    mockRouter = {
      url: '/',
      events: routerEvents$
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('en la ruta inicial "/" debe aplicar .app-container-fixed por defecto', () => {
    const innerDiv = fixture.nativeElement.querySelector('div');
    expect(innerDiv).toBeTruthy();
    expect(innerDiv.classList.contains('app-container-fixed')).toBe(true);
    expect(innerDiv.classList.contains('app-container-standard')).toBe(false);
  });

  it('en la ruta "/" con wide=true debe aplicar .app-container-wide', () => {
    host.wide.set(true);
    fixture.detectChanges();

    const innerDiv = fixture.nativeElement.querySelector('div');
    expect(innerDiv.classList.contains('app-container-wide')).toBe(true);
    expect(innerDiv.classList.contains('app-container-fixed')).toBe(false);
  });

  it('al navegar a una ruta distinta como "/temario", debe aplicar el ancho fluido .app-container-standard', () => {
    routerEvents$.next(new NavigationEnd(1, '/temario', '/temario'));
    fixture.detectChanges();

    const innerDiv = fixture.nativeElement.querySelector('div');
    expect(innerDiv.classList.contains('app-container-standard')).toBe(true);
    expect(innerDiv.classList.contains('app-container-fixed')).toBe(false);
  });

  it('en una ruta como "/comandos" con size="wide", debe aplicar .app-container-wide', () => {
    routerEvents$.next(new NavigationEnd(1, '/comandos', '/comandos'));
    host.size.set('wide');
    fixture.detectChanges();

    const innerDiv = fixture.nativeElement.querySelector('div');
    expect(innerDiv.classList.contains('app-container-wide')).toBe(true);
    expect(innerDiv.classList.contains('app-container-fixed')).toBe(false);
  });

  it('en una ruta fuera de home con size="fixed", debe aplicar .app-container-fixed', () => {
    routerEvents$.next(new NavigationEnd(1, '/temario', '/temario'));
    host.size.set('fixed');
    fixture.detectChanges();

    const innerDiv = fixture.nativeElement.querySelector('div');
    expect(innerDiv.classList.contains('app-container-fixed')).toBe(true);
    expect(innerDiv.classList.contains('app-container-standard')).toBe(false);
  });

  it('debe incluir las clases de espaciado responsivo mx-auto w-full px-4 sm:px-6 lg:px-8', () => {
    const innerDiv = fixture.nativeElement.querySelector('div');
    expect(innerDiv.classList.contains('mx-auto')).toBe(true);
    expect(innerDiv.classList.contains('w-full')).toBe(true);
    expect(innerDiv.classList.contains('px-4')).toBe(true);
    expect(innerDiv.classList.contains('sm:px-6')).toBe(true);
    expect(innerDiv.classList.contains('lg:px-8')).toBe(true);
  });
});
