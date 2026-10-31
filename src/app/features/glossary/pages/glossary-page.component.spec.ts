import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GlossaryPageComponent } from './glossary-page.component';
import { GlossaryService } from '../../../core/services/glossary.service';
import { GlossaryTerm } from '../../../core/models/glossary.model';

describe('GlossaryPageComponent', () => {
  let component: GlossaryPageComponent;
  let fixture: ComponentFixture<GlossaryPageComponent>;

  const mockTerms: GlossaryTerm[] = [
    {
      id: 'descriptor-de-archivo',
      term: 'descriptor de archivo',
      definition: 'Índice entero asignado por el kernel a un archivo abierto.',
      related: ['stdin', 'stdout'],
      subtopicIds: ['103.4']
    },
    {
      id: 'stdin',
      term: 'stdin',
      definition: 'Flujo estándar de entrada.',
      related: ['stdout'],
      subtopicIds: ['103.4']
    }
  ];

  const mockGlossaryService = {
    getTerms: () => Promise.resolve(mockTerms),
    getAlphabetIndex: () => {
      const letters = ['D', 'S'];
      return ['A', 'B', 'C', 'D', 'E', 'S'].map((l) => ({
        letter: l,
        hasTerms: letters.includes(l),
        count: letters.includes(l) ? 1 : 0
      }));
    },
    groupTermsByLetter: (terms: GlossaryTerm[]) => {
      const grouped: Record<string, GlossaryTerm[]> = {};
      for (const t of terms) {
        const init = t.term.charAt(0).toUpperCase();
        if (!grouped[init]) grouped[init] = [];
        grouped[init].push(t);
      }
      return grouped;
    },
    filterTerms: (terms: GlossaryTerm[], q: string) => {
      if (!q) return terms;
      return terms.filter((t) => t.term.includes(q.toLowerCase()));
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlossaryPageComponent],
      providers: [
        provideRouter([]),
        { provide: GlossaryService, useValue: mockGlossaryService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ q: '' }))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlossaryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crearse correctamente y listar los términos', () => {
    expect(component).toBeTruthy();
    expect(component.totalCount()).toBe(2);
    expect(component.counterText()).toBe('2 términos técnicos');
  });

  it('debe agrupar los términos por inicial', () => {
    expect(component.availableLetters()).toEqual(['D', 'S']);
    expect(component.groupedTerms()['D']?.length).toBe(1);
    expect(component.groupedTerms()['S']?.length).toBe(1);
  });

  it('debe filtrar términos al buscar', () => {
    component.onSearchInput('stdin');
    expect(component.filteredCount()).toBe(1);
    expect(component.counterText()).toBe('1 de 2 términos');
  });

  it('scrollToLetter actualiza la letra activa', () => {
    component.scrollToLetter('S');
    expect(component.activeLetter()).toBe('S');
  });
});

