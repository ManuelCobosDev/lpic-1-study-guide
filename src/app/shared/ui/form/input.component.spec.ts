import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';

@Component({
  standalone: true,
  imports: [InputComponent],
  template: `
    <app-input
      [label]="label()"
      [placeholder]="placeholder()"
      [error]="error()"
      [hint]="hint()"
      [(value)]="value"
    />
  `
})
class TestHostComponent {
  readonly label = signal<string>('Nombre de usuario');
  readonly placeholder = signal<string>('Ej: tux');
  readonly error = signal<string>('');
  readonly hint = signal<string>('Introduce tu login');
  value = signal<string>('');
}

describe('InputComponent', () => {
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

  it('debe renderizar label, placeholder y hint', () => {
    const labelEl = fixture.nativeElement.querySelector('.input-label');
    const inputEl = fixture.nativeElement.querySelector('input');
    const hintEl = fixture.nativeElement.querySelector('.input-hint-text');

    expect(labelEl.textContent).toContain('Nombre de usuario');
    expect(inputEl.getAttribute('placeholder')).toBe('Ej: tux');
    expect(hintEl.textContent).toContain('Introduce tu login');
    expect(inputEl.getAttribute('aria-invalid')).toBe('false');
  });

  it('debe reflejar estado de error con aria-invalid y role alert', () => {
    host.error.set('El campo es obligatorio');
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.querySelector('input');
    const errorEl = fixture.nativeElement.querySelector('.input-error-text');

    expect(inputEl.getAttribute('aria-invalid')).toBe('true');
    expect(errorEl.textContent).toContain('El campo es obligatorio');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('debe actualizar el modelo al escribir', () => {
    const inputEl = fixture.nativeElement.querySelector('input');
    inputEl.value = 'linus';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.value()).toBe('linus');
  });
});

