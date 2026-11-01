import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FlashcardsPageComponent } from './flashcards-page.component';
import { FlashcardsService } from '../../../core/services/flashcards.service';
import { FlashcardItem, LeitnerStats } from '../../../core/models/flashcard.model';
import { signal } from '@angular/core';

describe('FlashcardsPageComponent', () => {
  let component: FlashcardsPageComponent;
  let fixture: ComponentFixture<FlashcardsPageComponent>;

  const mockCards: FlashcardItem[] = [
    {
      id: 'cmd-tee',
      type: 'command',
      frontTitle: 'tee',
      prompt: '¿Función de tee?',
      backTitle: 'tee',
      backDescription: 'Copia stdin a archivo y stdout.',
      subtopicIds: ['103.4']
    },
    {
      id: 'term-stdin',
      type: 'glossary',
      frontTitle: 'stdin',
      prompt: '¿Definición de stdin?',
      backTitle: 'stdin',
      backDescription: 'Flujo estándar 0.',
      subtopicIds: ['103.4']
    }
  ];

  const mockStats: LeitnerStats = {
    total: 2,
    byBox: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0 },
    mastered: 0,
    learning: 2,
    unseen: 0,
    dueToday: 2
  };

  const mockFlashcardsService = {
    progress: signal({
      'cmd-tee': { cardId: 'cmd-tee', box: 1, nextReviewDate: '2026-10-31', lastReviewedAt: null, repetitions: 0, lapses: 0 }
    }),
    getAllCards: () => Promise.resolve(mockCards),
    getDeckStats: () => Promise.resolve(mockStats),
    getSessionCards: () =>
      Promise.resolve({
        dueCards: [mockCards[0]!],
        newCards: [mockCards[1]!],
        sessionCards: mockCards
      }),
    rateCard: () => ({
      cardId: 'cmd-tee',
      box: 2,
      nextReviewDate: '2026-11-01',
      lastReviewedAt: new Date().toISOString(),
      repetitions: 1,
      lapses: 0
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardsPageComponent],
      providers: [
        provideRouter([]),
        { provide: FlashcardsService, useValue: mockFlashcardsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlashcardsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crearse correctamente y cargar la sesión de tarjetas', () => {
    expect(component).toBeTruthy();
    expect(component.totalCardsInSession()).toBe(2);
    expect(component.currentCard()?.id).toBe('cmd-tee');
  });

  it('debe voltear la tarjeta con flipCard() o tecla Espacio', () => {
    expect(component.isFlipped()).toBe(false);
    component.flipCard();
    expect(component.isFlipped()).toBe(true);
  });

  it('debe responder al atajo de teclado Espacio para voltear', () => {
    expect(component.isFlipped()).toBe(false);
    const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });
    component.handleKeyboardEvent(spaceEvent);
    expect(component.isFlipped()).toBe(true);
  });

  it('debe calificar la tarjeta con rating 1 a 4 y avanzar al siguiente índice', () => {
    component.flipCard(); // Debe estar volteada para calificar
    expect(component.currentIndex()).toBe(0);

    // Pulsa tecla '3' (Bien)
    const keyEvent = new KeyboardEvent('keydown', { key: '3' });
    component.handleKeyboardEvent(keyEvent);

    expect(component.ratingsCount().good).toBe(1);
    expect(component.currentIndex()).toBe(1);
    expect(component.isFlipped()).toBe(false); // Se resetea para la siguiente tarjeta
  });

  it('debe marcar la sesión como completada al calificar la última tarjeta', () => {
    component.flipCard();
    component.rateCurrentCard('good'); // Primera tarjeta

    component.flipCard();
    component.rateCurrentCard('easy'); // Segunda tarjeta

    expect(component.isCompleted()).toBe(true);
  });

  it('debe filtrar las tarjetas en el explorador según la búsqueda textual', () => {
    expect(component.filteredExplorerCards().length).toBe(2);

    component.onSearchQueryChange('tee');
    expect(component.filteredExplorerCards().length).toBe(1);
    expect(component.filteredExplorerCards()[0]?.id).toBe('cmd-tee');

    component.onSearchQueryChange('no-existe');
    expect(component.filteredExplorerCards().length).toBe(0);

    component.onSearchQueryChange('');
    expect(component.filteredExplorerCards().length).toBe(2);
  });

  it('debe permitir desplegar y ocultar el reverso de una tarjeta en el explorador', () => {
    expect(component.isCardRevealed('cmd-tee')).toBe(false);
    component.toggleCardReveal('cmd-tee');
    expect(component.isCardRevealed('cmd-tee')).toBe(true);
    component.toggleCardReveal('cmd-tee');
    expect(component.isCardRevealed('cmd-tee')).toBe(false);
  });
});

