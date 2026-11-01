import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { BadgeComponent, BadgeVariant } from './badge.component';

@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <app-badge [variant]="variant()" [dot]="hasDot()">Objetivo 103.4</app-badge>
  `
})
class TestHostComponent {
  readonly variant = signal<BadgeVariant>('primary');
  readonly hasDot = signal<boolean>(true);
}

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('debe crearse correctamente y renderizar el contenido proyectado', () => {
    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('app-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Objetivo 103.4');
  });

  it('debe tener clases de altura fija de 24px (h-[24px], min-h-[24px])', () => {
    const span = fixture.nativeElement.querySelector('span');
    expect(span.classList.contains('h-[24px]')).toBe(true);
    expect(span.classList.contains('min-h-[24px]')).toBe(true);
    expect(span.classList.contains('rounded-full')).toBe(true);
  });

  it('debe aplicar las clases de color correspondientes a la variante', () => {
    const span = fixture.nativeElement.querySelector('span');
    expect(span.classList.contains('bg-[var(--primary-soft)]')).toBe(true);

    fixture.componentInstance.variant.set('success');
    fixture.detectChanges();
    expect(span.classList.contains('bg-[var(--success-soft)]')).toBe(true);
  });
});

