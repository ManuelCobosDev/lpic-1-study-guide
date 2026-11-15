import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { WikiRefService } from './wiki-ref.service';
import { ContentService } from './content.service';
import { Command } from '../models/command.model';
import { GlossaryTerm } from '../models/glossary.model';

describe('WikiRefService', () => {
  let service: WikiRefService;

  const mockCommands: Command[] = [
    {
      id: 'chmod',
      name: 'chmod',
      description: 'chmod modifica los bits de modo de un archivo o directorio.',
      short: 'Cambia los permisos de acceso de archivos y directorios',
      category: 'Permisos',
      synopsis: 'chmod [opciones] modo archivo...',
      example: 'chmod 755 script.sh',
      flags: [],
      subtopicIds: ['104.5'],
      explainedIn: ['104.5#3']
    }
  ];

  const mockTerms: GlossaryTerm[] = [
    {
      id: 'inodo',
      term: 'inodo',
      definition: 'Estructura de datos en sistemas de archivos tipo Unix.',
      short: 'Estructura de datos del sistema de archivos.',
      related: ['superbloque'],
      subtopicIds: ['104.2'],
      explainedIn: ['104.2#2']
    }
  ];

  const mockContentService = {
    getCommands: () => Promise.resolve(mockCommands),
    getGlossary: () => Promise.resolve(mockTerms)
  };

  const createMockRect = (top: number, bottom: number, left: number, right: number): DOMRect => ({
    top,
    bottom,
    left,
    right,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({ top, bottom, left, right })
  });

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        WikiRefService,
        { provide: ContentService, useValue: mockContentService }
      ]
    });
    service = TestBed.inject(WikiRefService);
  });

  afterEach(() => {
    service.closePopover();
    vi.useRealTimers();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
    expect(service.activePopover()).toBeNull();
  });

  it('no debe sumar window.scrollY a las coordenadas de posición en viewport fijo', async () => {
    // Simulamos que la ventana tiene scroll vertical de 500px
    const originalScrollY = window.scrollY;
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true });

    const anchor = document.createElement('a');
    anchor.setAttribute('data-cmd', 'chmod');
    anchor.getBoundingClientRect = () => createMockRect(200, 224, 150, 210);

    service.onTargetEnter(anchor);
    await vi.advanceTimersByTimeAsync(300);

    const popover = service.activePopover();
    expect(popover).not.toBeNull();
    // En un overlay position: fixed, 'y' DEBE ser 224 (relativo al viewport), NO 224 + 500 = 724
    expect(popover?.y).toBe(224);
    expect(popover?.anchorRect).toBeDefined();
    expect(popover?.anchorRect?.top).toBe(200);
    expect(popover?.anchorRect?.bottom).toBe(224);

    // Restaurar scroll
    Object.defineProperty(window, 'scrollY', { value: originalScrollY, configurable: true, writable: true });
  });

  it('debe resolver comandos con data-cmd o data-term-ref="cmd:xxx"', async () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('data-term-ref', 'cmd:chmod');
    anchor.getBoundingClientRect = () => createMockRect(100, 120, 80, 140);

    service.onTargetEnter(anchor);
    await vi.advanceTimersByTimeAsync(300);

    const popover = service.activePopover();
    expect(popover).not.toBeNull();
    expect(popover?.type).toBe('command');
    expect(popover?.title).toBe('chmod');
    expect(popover?.badge).toBe('Comando LPIC-1');
  });

  it('debe resolver términos de glosario con data-term o data-term-ref="term:xxx"', async () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('data-term-ref', 'term:inodo');
    anchor.getBoundingClientRect = () => createMockRect(100, 120, 80, 140);

    service.onTargetEnter(anchor);
    await vi.advanceTimersByTimeAsync(300);

    const popover = service.activePopover();
    expect(popover).not.toBeNull();
    expect(popover?.type).toBe('term');
    expect(popover?.title).toBe('inodo');
    expect(popover?.badge).toBe('Glosario Oficial');
  });

  it('no debe reiniciar hoverTimer si se pasa el mismo anchor reiteradamente', async () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('data-cmd', 'chmod');
    anchor.getBoundingClientRect = () => createMockRect(100, 120, 80, 140);

    service.onTargetEnter(anchor);
    await vi.advanceTimersByTimeAsync(150); // Han pasado 150ms
    service.onTargetEnter(anchor); // Segundo evento sobre el mismo elemento
    await vi.advanceTimersByTimeAsync(120); // Total 270ms desde el inicio

    // Debe abrirse sin haberse cancelado ni reiniciado el temporizador
    expect(service.activePopover()).not.toBeNull();
  });

  it('openImmediately debe abrir el popover al instante sin esperar timer', async () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('data-cmd', 'chmod');
    anchor.getBoundingClientRect = () => createMockRect(100, 120, 80, 140);

    service.openImmediately(anchor);
    await vi.advanceTimersByTimeAsync(50); // Muy rápido, menos que los 250ms estándar

    expect(service.activePopover()).not.toBeNull();
    expect(service.activePopover()?.title).toBe('chmod');
  });
});
