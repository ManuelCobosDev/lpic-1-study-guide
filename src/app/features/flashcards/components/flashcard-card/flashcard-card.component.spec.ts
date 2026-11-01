import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FlashcardCardComponent } from './flashcard-card.component';
import { FlashcardItem, LeitnerRating } from '../../../../core/models/flashcard.model';

describe('FlashcardCardComponent', () => {
  let component: FlashcardCardComponent;
  let fixture: ComponentFixture<FlashcardCardComponent>;

  const mockCard: FlashcardItem = {
    id: 'cmd-tee',
    type: 'command',
    frontTitle: 'tee',
    frontSubtitle: 'Redirecciones',
    prompt: '¿Cuál es la función del comando tee?',
    backTitle: 'tee',
    backDescription: 'Copia stdin a archivo y stdout.',
    backSyntax: 'tee [OPCIÓN]... [ARCHIVO]...',
    backExample: 'ls | tee out.txt',
    backFlags: [{ flag: '-a', description: 'Append' }],
    subtopicIds: ['103.4']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FlashcardCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('card', mockCard);
    fixture.componentRef.setInput('currentBox', 2);
    fixture.componentRef.setInput('isFlipped', false);
    fixture.detectChanges();
  });

  it('debe crearse correctamente con el anverso visible', () => {
    expect(component).toBeTruthy();
    expect(component.boxBadge()).toBe('Caja 2');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card-main-title')?.textContent).toContain('tee');
  });

  it('debe emitir el evento flip al pulsar en la escena', () => {
    let flipped = false;
    component.flip.subscribe(() => {
      flipped = true;
    });

    component.onCardClick();
    expect(flipped).toBe(true);
  });

  it('debe calcular los intervalos de los botones basados en la caja actual', () => {
    const intervals = component.intervals();
    expect(intervals.again).toBe('Hoy'); // Caja 1 = 0 días
    expect(intervals.hard).toBe('1 día'); // Caja 2 = 1 día
    expect(intervals.good).toBe('3 días'); // Caja 3 = 3 días
    expect(intervals.easy).toBe('7 días'); // Caja 4 = 7 días
  });

  it('debe emitir el evento rate al calificar', () => {
    let emittedRating: LeitnerRating | null = null;
    component.rate.subscribe((rating) => {
      emittedRating = rating;
    });

    component.onRate('good');
    expect(emittedRating).toBe('good');
  });
});

