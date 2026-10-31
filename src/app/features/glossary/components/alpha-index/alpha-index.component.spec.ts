import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlphaIndexComponent } from './alpha-index.component';
import { AlphaIndexItem } from '../../../../core/services/glossary.service';

describe('AlphaIndexComponent', () => {
  let component: AlphaIndexComponent;
  let fixture: ComponentFixture<AlphaIndexComponent>;

  const mockItems: AlphaIndexItem[] = [
    { letter: 'A', hasTerms: false, count: 0 },
    { letter: 'B', hasTerms: true, count: 2 },
    { letter: 'C', hasTerms: false, count: 0 },
    { letter: 'D', hasTerms: true, count: 5 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphaIndexComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AlphaIndexComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('activeLetter', 'B');
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe deshabilitar letras sin términos', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.alpha-letter-btn');
    expect(buttons.length).toBe(4);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[0].getAttribute('aria-disabled')).toBe('true');
    expect(buttons[1].disabled).toBe(false);
  });

  it('debe emitir letterClick al hacer clic en una letra disponible', () => {
    let emitted = '';
    component.letterClick.subscribe((letter) => {
      emitted = letter;
    });

    component.onSelect('D', true);
    expect(emitted).toBe('D');
  });

  it('no debe emitir evento al seleccionar una letra vacía', () => {
    let emitted = '';
    component.letterClick.subscribe((letter) => {
      emitted = letter;
    });

    component.onSelect('A', false);
    expect(emitted).toBe('');
  });
});

