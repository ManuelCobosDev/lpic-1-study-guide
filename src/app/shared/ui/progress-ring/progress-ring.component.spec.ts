import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ProgressRingComponent } from './progress-ring.component';

@Component({
  standalone: true,
  imports: [ProgressRingComponent],
  template: `
    <app-progress-ring
      [value]="value()"
      [size]="size()"
      [subtitle]="subtitle()"
    />
  `
})
class TestHostComponent {
  readonly value = signal<number>(45);
  readonly size = signal<number>(96);
  readonly subtitle = signal<string>('Completado');
}

describe('ProgressRingComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe renderizar el valor numérico y atributos ARIA de barra de progreso', () => {
    const el = fixture.nativeElement.querySelector('.progress-ring-wrapper');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('45');

    const valueEl = fixture.nativeElement.querySelector('.ring-value');
    expect(valueEl.textContent).toContain('45%');

    const subEl = fixture.nativeElement.querySelector('.ring-subtitle');
    expect(subEl.textContent).toContain('Completado');
  });

  it('debe aplicar la clase ring-complete cuando el valor llega a 100', () => {
    host.value.set(100);
    fixture.detectChanges();

    const progressCircle = fixture.nativeElement.querySelector('.ring-progress');
    expect(progressCircle.classList.contains('ring-complete')).toBe(true);
  });
});

