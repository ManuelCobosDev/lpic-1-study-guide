import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { WikiPopoverComponent } from './wiki-popover.component';
import { WikiRefService } from '../../../core/services/wiki-ref.service';
import { ContentService } from '../../../core/services/content.service';

describe('WikiPopoverComponent (Posicionamiento y Flip inteligente)', () => {
  let component: WikiPopoverComponent;
  let fixture: ComponentFixture<WikiPopoverComponent>;
  let wikiRefService: WikiRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WikiPopoverComponent],
      providers: [
        provideRouter([]),
        WikiRefService,
        {
          provide: ContentService,
          useValue: {
            getCommands: () => Promise.resolve([]),
            getGlossary: () => Promise.resolve([])
          }
        }
      ]
    });

    fixture = TestBed.createComponent(WikiPopoverComponent);
    component = fixture.componentInstance;
    wikiRefService = TestBed.inject(WikiRefService);
  });

  it('debe crearse correctamente y no renderizar popover si no hay activo', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.term-link-card');
    expect(el).toBeNull();
  });

  it('debe posicionar debajo (below) cuando hay espacio suficiente inferior', () => {
    // Simular viewport 1024x768
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true, writable: true });

    wikiRefService.activePopover.set({
      type: 'command',
      id: 'ls',
      title: 'ls',
      badge: 'Comando LPIC-1',
      short: 'Lista el contenido de directorios.',
      link: '/comandos?q=ls',
      x: 100,
      y: 120,
      anchorRect: {
        top: 100,
        bottom: 120,
        left: 100,
        right: 140,
        width: 40,
        height: 20
      }
    });

    fixture.detectChanges();
    const pos = component.position();
    expect(pos).not.toBeNull();
    expect(pos?.placement).toBe('below');
    // Top debe ser rect.bottom + GAP (120 + 8 = 128)
    expect(pos?.top).toBe(128);
    expect(pos?.left).toBe(100);
  });

  it('debe voltear por encima (above) cuando el concepto está cerca del borde inferior', () => {
    // Simular viewport 1024x768
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true, writable: true });

    // Concepto ubicado en Y=730 (solo quedan 38px hasta el borde de 768)
    wikiRefService.activePopover.set({
      type: 'command',
      id: 'grep',
      title: 'grep',
      badge: 'Comando LPIC-1',
      short: 'Busca patrones en archivos.',
      link: '/comandos?q=grep',
      x: 200,
      y: 750,
      anchorRect: {
        top: 730,
        bottom: 750,
        left: 200,
        right: 250,
        width: 50,
        height: 20
      }
    });

    fixture.detectChanges();
    const pos = component.position();
    expect(pos).not.toBeNull();
    expect(pos?.placement).toBe('above');
    // El popup debe situarse estrictamente por encima del top del anchor (730)
    expect(pos!.top).toBeLessThan(730);
    expect(pos!.top + 280).toBeLessThanOrEqual(730);
  });

  it('debe acotar horizontalmente si el concepto está cerca del borde derecho de la pantalla', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    // Anchor ubicado en X=950 en una pantalla de 1000px
    wikiRefService.activePopover.set({
      type: 'term',
      id: 'pipe',
      title: 'pipe',
      badge: 'Glosario Oficial',
      short: 'Tubería de comunicación interproceso.',
      link: '/glosario?q=pipe',
      x: 950,
      y: 220,
      anchorRect: {
        top: 200,
        bottom: 220,
        left: 950,
        right: 990,
        width: 40,
        height: 20
      }
    });

    fixture.detectChanges();
    const pos = component.position();
    expect(pos).not.toBeNull();
    // card width es 320, margen es 12. maxLeft = 1000 - 320 - 12 = 668.
    expect(pos?.left).toBe(668);
    expect((pos?.left ?? 0) + (pos?.width ?? 0)).toBeLessThanOrEqual(1000 - 12);
    // La flecha debe apuntar hacia el centro del concepto
    expect(pos?.arrowLeft).toBeGreaterThan(200);
  });

  it('debe acotar a un margen mínimo si el concepto está en el borde izquierdo extremo', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    // Anchor ubicado en X=2
    wikiRefService.activePopover.set({
      type: 'command',
      id: 'tar',
      title: 'tar',
      badge: 'Comando LPIC-1',
      short: 'Empaqueta archivos.',
      link: '/comandos?q=tar',
      x: 2,
      y: 220,
      anchorRect: {
        top: 200,
        bottom: 220,
        left: 2,
        right: 42,
        width: 40,
        height: 20
      }
    });

    fixture.detectChanges();
    const pos = component.position();
    expect(pos).not.toBeNull();
    expect(pos?.left).toBe(12); // Margin mínimo de 12px
  });
});
