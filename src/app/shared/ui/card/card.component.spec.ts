import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent, CardPadding } from './card.component';

@Component({
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card
      [interactive]="interactive()"
      [padding]="padding()"
      (cardClick)="onCardClick()"
    >
      <p>Contenido de prueba</p>
    </app-card>
  `
})
class TestHostComponent {
  readonly interactive = signal<boolean>(false);
  readonly padding = signal<CardPadding>('md');
  clicked = false;

  onCardClick(): void {
    this.clicked = true;
  }
}

describe('CardComponent', () => {
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

  it('debe renderizar el contenido proyectado y aplicar padding por defecto (24px/md)', () => {
    const cardEl = fixture.nativeElement.querySelector('.card-base');
    expect(cardEl).toBeTruthy();
    expect(cardEl.textContent).toContain('Contenido de prueba');
    expect(cardEl.classList.contains('card-pad-md')).toBe(true);
    expect(cardEl.getAttribute('role')).toBeNull();
  });

  it('debe aplicar estilos interactivos, atributos de accesibilidad y emitir cardClick al hacer clic', () => {
    host.interactive.set(true);
    fixture.detectChanges();

    const cardEl = fixture.nativeElement.querySelector('.card-base');
    expect(cardEl.classList.contains('card-interactive')).toBe(true);
    expect(cardEl.getAttribute('role')).toBe('button');
    expect(cardEl.getAttribute('tabindex')).toBe('0');

    cardEl.click();
    expect(host.clicked).toBe(true);
  });
});

