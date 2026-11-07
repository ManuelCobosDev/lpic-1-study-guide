import { TestBed } from '@angular/core/testing';
import { GlossaryService } from './glossary.service';
import { ContentService } from './content.service';
import { GlossaryTerm } from '../models/glossary.model';

describe('GlossaryService', () => {
  let service: GlossaryService;

  const mockTerms: GlossaryTerm[] = [
    {
      id: 'etc-passwd',
      term: '/etc/passwd',
      definition: 'Archivo de cuentas de usuario del sistema.',
      related: ['shadow'],
      subtopicIds: ['103.1']
    },
    {
      id: 'descriptor-de-archivo',
      term: 'descriptor de archivo',
      definition: 'Índice entero asignado por el kernel a archivos abiertos.',
      related: ['stdin', 'stdout'],
      subtopicIds: ['103.4']
    },
    {
      id: 'stdin',
      term: 'stdin',
      definition: 'Descriptor de archivo 0: flujo de entrada estándar.',
      related: ['stdout', 'stderr'],
      subtopicIds: ['103.4']
    },
    {
      id: 'stderr',
      term: 'stderr',
      definition: 'Descriptor de archivo 2: flujo estándar de errores.',
      related: ['stdin'],
      subtopicIds: ['103.4']
    }
  ];

  const mockContentService = {
    getGlossary: () => Promise.resolve(mockTerms)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlossaryService,
        { provide: ContentService, useValue: mockContentService }
      ]
    });
    service = TestBed.inject(GlossaryService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getTerms devuelve términos ordenados alfabéticamente', async () => {
    const list = await service.getTerms();
    expect(list.length).toBe(4);
    expect(list[0]?.id).toBe('etc-passwd');
    expect(list[1]?.id).toBe('descriptor-de-archivo');
    expect(list[2]?.id).toBe('stderr');
    expect(list[3]?.id).toBe('stdin');
  });

  it('getAlphabetIndex devuelve el índice A-Z con flags y recuentos correctos, incluyendo grupo #', () => {
    const index = service.getAlphabetIndex(mockTerms);
    expect(index.length).toBe(27);

    const hashItem = index.find((i) => i.letter === '#');
    expect(hashItem?.hasTerms).toBe(true);
    expect(hashItem?.count).toBe(1);

    const dItem = index.find((i) => i.letter === 'D');
    expect(dItem?.hasTerms).toBe(true);
    expect(dItem?.count).toBe(1);

    const sItem = index.find((i) => i.letter === 'S');
    expect(sItem?.hasTerms).toBe(true);
    expect(sItem?.count).toBe(2);

    const aItem = index.find((i) => i.letter === 'A');
    expect(aItem?.hasTerms).toBe(false);
    expect(aItem?.count).toBe(0);
  });

  it('groupTermsByLetter agrupa los términos por inicial mayúscula', () => {
    const groups = service.groupTermsByLetter(mockTerms);
    expect(groups['#']?.length).toBe(1);
    expect(groups['D']?.length).toBe(1);
    expect(groups['S']?.length).toBe(2);
    expect(groups['A']).toBeUndefined();
  });

  it('filterTerms busca por término, definición y términos relacionados', () => {
    const byDef = service.filterTerms(mockTerms, 'kernel');
    expect(byDef.length).toBe(1);
    expect(byDef[0]?.id).toBe('descriptor-de-archivo');

    const byRel = service.filterTerms(mockTerms, 'stdout');
    expect(byRel.length).toBe(2); // descriptor-de-archivo y stdin
  });
});
