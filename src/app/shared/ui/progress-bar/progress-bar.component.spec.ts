import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ProgressBarComponent, ProgressVariant } from './progress-bar.component';

@Component({
  standalone: true,
  imports: [ProgressBarComponent],
  template: `
    <app-progress-bar [value]="val()" [max]="maxVal()" [variant]="v()" label="Progreso general"></app-progress-bar>
  `
})
class TestHostComponent {
  readonly val = signal(45);
  readonly maxVal = signal(100);
  readonly v = signal<ProgressVariant>('primary');
}

describe('ProgressBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('debe calcular el porcentaje y aplicar el ancho en estilo', () => {
    const el = fixture.nativeElement as HTMLElement;
    const progressbar = el.querySelector('[role="progressbar"]');
    expect(progressbar).toBeTruthy();
    expect(progressbar?.getAttribute('aria-valuenow')).toBe('45');
    expect(progressbar?.getAttribute('aria-valuemax')).toBe('100');

    const fill = progressbar?.querySelector('div');
    expect(fill?.style.width).toBe('45%');
  });

  it('debe acotar valores superiores a max o inferiores a 0', () => {
    fixture.componentInstance.val.set(150);
    fixture.detectChanges();

    const progressbar = fixture.nativeElement.querySelector('[role="progressbar"]');
    expect(progressbar?.getAttribute('aria-valuenow')).toBe('100');
    const fill = progressbar?.querySelector('div');
    expect(fill?.style.width).toBe('100%');

    fixture.componentInstance.val.set(-20);
    fixture.detectChanges();
    expect(progressbar?.getAttribute('aria-valuenow')).toBe('0');
    expect(fill?.style.width).toBe('0%');
  });

  it('debe aplicar la clase de color según la variante', () => {
    fixture.componentInstance.v.set('success');
    fixture.detectChanges();

    const fill = fixture.nativeElement.querySelector('[role="progressbar"] div');
    expect(fill?.classList.contains('bg-[var(--success)]')).toBe(true);
  });
});


