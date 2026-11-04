import { TestBed } from '@angular/core/testing';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('BreadcrumbsComponent', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbsComponent],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'temario', component: DummyComponent },
          { path: 'temario/:examen', component: DummyComponent },
          { path: 'temario/:examen/:tema', component: DummyComponent },
          { path: 'estudiar/:subtema', component: DummyComponent },
          { path: 'mapa-mental', component: DummyComponent },
          { path: 'laboratorios/:id', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('formatea correctamente las migas de pan y evita enlace 404 a /estudiar', async () => {
    const fixture = TestBed.createComponent(BreadcrumbsComponent);
    const component = fixture.componentInstance;

    await router.navigateByUrl('/estudiar/105.1');
    fixture.detectChanges();

    const crumbs = component.crumbs();
    expect(crumbs.length).toBe(3);
    expect(crumbs[0]).toEqual({ label: 'Inicio', url: '/' });
    expect(crumbs[1]).toEqual({ label: 'Temario', url: '/temario' }); // Redirige a /temario en vez de /estudiar
    expect(crumbs[2]).toEqual({ label: 'Subtema 105.1', url: '/estudiar/105.1' });
  });

  it('formatea slugs con guiones como Mapa mental y laboratorios', async () => {
    const fixture = TestBed.createComponent(BreadcrumbsComponent);
    const component = fixture.componentInstance;

    await router.navigateByUrl('/mapa-mental');
    fixture.detectChanges();

    const crumbsMap = component.crumbs();
    expect(crumbsMap[1]).toEqual({ label: 'Mapa mental', url: '/mapa-mental' });

    await router.navigateByUrl('/laboratorios/lab-101-1');
    fixture.detectChanges();

    const crumbsLab = component.crumbs();
    expect(crumbsLab[1]).toEqual({ label: 'Laboratorios', url: '/laboratorios' });
    expect(crumbsLab[2]).toEqual({ label: 'Lab 101.1', url: '/laboratorios/lab-101-1' });
  });
});

