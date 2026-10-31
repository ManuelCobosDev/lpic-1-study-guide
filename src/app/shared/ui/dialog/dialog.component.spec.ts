import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';

@Component({
  standalone: true,
  imports: [DialogComponent],
  template: `
    <app-dialog
      [title]="title()"
      [(open)]="isOpen"
      (closed)="onClosed()"
    >
      <p>Contenido modal de confirmación</p>
    </app-dialog>
  `
})
class TestHostComponent {
  readonly title = signal<string>('Confirmar acción');
  isOpen = signal<boolean>(false);
  closedCalled = false;

  onClosed(): void {
    this.closedCalled = true;
  }
}

describe('DialogComponent', () => {
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

  it('no debe renderizar el panel si open es false', () => {
    const dialogEl = fixture.nativeElement.querySelector('.dialog-backdrop');
    expect(dialogEl).toBeNull();
  });

  it('debe renderizar como dialogo accesible cuando open es true', () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    const panelEl = fixture.nativeElement.querySelector('.dialog-panel');
    expect(panelEl).toBeTruthy();
    expect(panelEl.getAttribute('role')).toBe('dialog');
    expect(panelEl.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Confirmar acción');
    expect(fixture.nativeElement.textContent).toContain('Contenido modal de confirmación');
  });

  it('debe cerrarse al hacer clic en el botón de cierre', () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.dialog-close-btn');
    closeBtn.click();
    fixture.detectChanges();

    expect(host.isOpen()).toBe(false);
    expect(host.closedCalled).toBe(true);
  });
});

