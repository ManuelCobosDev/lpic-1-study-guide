import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { WeightMeterComponent } from './weight-meter.component';

@Component({
  standalone: true,
  imports: [WeightMeterComponent],
  template: `
    <app-weight-meter [weight]="weight()" [maxWeight]="maxWeight()" />
  `
})
class TestHostComponent {
  readonly weight = signal<number>(8);
  readonly maxWeight = signal<number>(26);
}

describe('WeightMeterComponent', () => {
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

  it('debe renderizar el texto y atributos ARIA del medidor', () => {
    const el = fixture.nativeElement.querySelector('.weight-meter-container');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('meter');
    expect(el.getAttribute('aria-valuenow')).toBe('8');
    expect(el.getAttribute('aria-valuemax')).toBe('26');

    const label = fixture.nativeElement.querySelector('.weight-label');
    expect(label.textContent).toContain('Peso LPI 8');
  });

  it('debe calcular el porcentaje de llenado proporcional', () => {
    const fill = fixture.nativeElement.querySelector('.weight-fill');
    // 8 / 26 * 100 = ~30.769%
    expect(fill.style.width).toContain('30.769');

    host.weight.set(26);
    fixture.detectChanges();
    expect(fill.style.width).toBe('100%');
  });
});

