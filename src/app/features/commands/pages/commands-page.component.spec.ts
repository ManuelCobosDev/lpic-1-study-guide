import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CommandsPageComponent } from './commands-page.component';
import { CommandService } from '../../../core/services/command.service';
import { Command } from '../../../core/models/command.model';

describe('CommandsPageComponent', () => {
  let component: CommandsPageComponent;
  let fixture: ComponentFixture<CommandsPageComponent>;

  const mockCommands: Command[] = [
    {
      id: 'tee',
      name: 'tee',
      synopsis: 'tee [OPCIÓN]... [ARCHIVO]...',
      description: 'Copia stdin a archivo y stdout.',
      category: 'Redirecciones y Tuberías',
      subtopicIds: ['103.4'],
      example: 'ls | tee out.txt',
      flags: [{ flag: '-a', description: 'Añadir al archivo' }]
    },
    {
      id: 'xargs',
      name: 'xargs',
      synopsis: 'xargs [OPCIÓN]... [COMANDO]',
      description: 'Construye y ejecuta líneas de comando desde stdin.',
      category: 'Procesamiento',
      subtopicIds: ['103.4'],
      example: 'find . -name "*.log" | xargs rm',
      flags: [{ flag: '-0', description: 'Separador nulo' }]
    }
  ];

  const mockCommandService = {
    getCommands: () => Promise.resolve(mockCommands),
    getCategories: () => Promise.resolve(['Procesamiento', 'Redirecciones y Tuberías']),
    filterCommands: (cmds: Command[], q: string, cat: string, tema: string) => {
      let result = cmds;
      if (cat && cat !== 'todas') result = result.filter((c) => c.category === cat);
      if (tema && tema !== 'todos') result = result.filter((c) => c.subtopicIds.includes(tema));
      if (q) result = result.filter((c) => c.name.includes(q.toLowerCase()));
      return result;
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandsPageComponent],
      providers: [
        provideRouter([]),
        { provide: CommandService, useValue: mockCommandService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ q: 'tee', cat: 'todas', tema: 'todos' }))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crearse e inicializar los filtros desde la URL', () => {
    expect(component).toBeTruthy();
    expect(component.searchQuery()).toBe('tee');
  });

  it('debe calcular el contador reactivo N de M comandos', () => {
    expect(component.totalCommands()).toBe(2);
    expect(component.filteredCount()).toBe(1);
    expect(component.counterText()).toBe('1 de 2 comandos');
  });

  it('debe permitir alternar entre vista de tabla y tarjetas', () => {
    expect(component.viewMode()).toBe('table');
    component.toggleViewMode('cards');
    expect(component.viewMode()).toBe('cards');
  });

  it('debe expandir y plegar los detalles del comando', () => {
    expect(component.expandedCommandId()).toBeNull();
    component.toggleExpand('tee');
    expect(component.expandedCommandId()).toBe('tee');
    component.toggleExpand('tee');
    expect(component.expandedCommandId()).toBeNull();
  });

  it('debe copiar al portapapeles y mostrar feedback visual', async () => {
    await component.copyText('ls | tee out.txt', 'ex-tee');
    expect(component.copiedCommandId()).toBe('ex-tee');
  });
});

