import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalloutComponent, CalloutType } from './callout.component';

@Component({
  standalone: true,
  imports: [CalloutComponent],
  template: `
    <app-callout [type]="type()" [title]="title()">
      <p>Texto del aviso</p>
    </app-callout>
  `
})
class TestHostComponent {
  readonly type = signal<CalloutType>('info');
  readonly title = signal<string>('');
}

describe('CalloutComponent', () => {
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

  it('debe renderizar como note para avisos informativos', () => {
    const calloutEl = fixture.nativeElement.querySelector('.callout-base');
    expect(calloutEl).toBeTruthy();
    expect(calloutEl.classList.contains('callout-info')).toBe(true);
    expect(calloutEl.getAttribute('role')).toBe('note');
    expect(calloutEl.textContent).toContain('Texto del aviso');
  });

  it('debe asignar rol alert para advertencias y renderizar el titulo', () => {
    host.type.set('warning');
    host.title.set('¡Atención en el examen!');
    fixture.detectChanges();

    const calloutEl = fixture.nativeElement.querySelector('.callout-base');
    expect(calloutEl.classList.contains('callout-warning')).toBe(true);
    expect(calloutEl.getAttribute('role')).toBe('alert');
    expect(calloutEl.textContent).toContain('¡Atención en el examen!');
  });
});

