import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundPageComponent } from './not-found-page.component';

describe('NotFoundPageComponent', () => {
  let component: NotFoundPageComponent;
  let fixture: ComponentFixture<NotFoundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el código 404 y el título oficial', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error-code')?.textContent).toContain('404');
    expect(el.querySelector('.error-title')?.textContent).toContain('Página no encontrada');
  });

  it('debe contener la caja de terminal con simulación curl HTTP 404', () => {
    const el = fixture.nativeElement as HTMLElement;
    const term = el.querySelector('.terminal-box');
    expect(term).toBeTruthy();
    expect(term?.textContent).toContain('HTTP/2 404 Not Found');
  });

  it('debe contener los 3 botones de rescate (Home, Temario, Buscador)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="btn-404-home"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="btn-404-curriculum"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="btn-404-search"]')).toBeTruthy();
  });
});

