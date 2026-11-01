import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabItem, TabsComponent } from './tabs.component';

@Component({
  standalone: true,
  imports: [TabsComponent],
  template: `
    <app-tabs
      [tabs]="tabs()"
      [activeId]="activeId()"
      (tabChange)="onTabChange($event)"
    />
  `
})
class TestHostComponent {
  readonly tabs = signal<TabItem[]>([
    { id: 'tab1', label: 'General', badge: 3 },
    { id: 'tab2', label: 'Detalles' }
  ]);
  readonly activeId = signal<string>('tab1');
  selectedId = '';

  onTabChange(id: string): void {
    this.selectedId = id;
    this.activeId.set(id);
  }
}

describe('TabsComponent', () => {
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

  it('debe marcar la pestaña activa y mostrar su badge', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.tab-btn');
    expect(buttons.length).toBe(2);

    expect(buttons[0].classList.contains('tab-active')).toBe(true);
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
    expect(buttons[0].querySelector('.tab-badge')?.textContent).toBe('3');

    expect(buttons[1].classList.contains('tab-active')).toBe(false);
    expect(buttons[1].getAttribute('aria-selected')).toBe('false');
  });

  it('debe cambiar la pestaña activa al hacer clic y emitir tabChange', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.tab-btn');
    buttons[1].click();
    fixture.detectChanges();

    expect(host.selectedId).toBe('tab2');
    expect(buttons[1].classList.contains('tab-active')).toBe(true);
  });
});

