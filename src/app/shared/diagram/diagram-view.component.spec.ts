import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DiagramViewComponent } from './diagram-view.component';
import { DIAGRAM_BOOT_SEQUENCE, DIAGRAM_STREAMS_PIPES } from '../../core/engines/diagram/diagram-catalog';

describe('DiagramViewComponent', () => {
  let fixture: ComponentFixture<DiagramViewComponent>;
  let component: DiagramViewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagramViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DiagramViewComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza SVG accesible con role="img", <title> y <desc>', () => {
    fixture.componentRef.setInput('spec', DIAGRAM_BOOT_SEQUENCE);
    fixture.detectChanges();

    const svgEl = fixture.nativeElement.querySelector('svg.diagram-svg');
    expect(svgEl).toBeTruthy();
    expect(svgEl.getAttribute('role')).toBe('img');

    const titleEl = svgEl.querySelector('title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent).toContain('Secuencia de Arranque de Linux');

    const descEl = svgEl.querySelector('desc');
    expect(descEl).toBeTruthy();
    expect(descEl.textContent).toContain('Diagrama de flujo de la secuencia de arranque');
  });

  it('renderiza los nodos y la lista accesible sr-only para lectores de pantalla', () => {
    fixture.componentRef.setInput('spec', DIAGRAM_STREAMS_PIPES);
    fixture.detectChanges();

    const nodeEls = fixture.nativeElement.querySelectorAll('.diagram-node');
    expect(nodeEls.length).toBe(4);

    const srList = fixture.nativeElement.querySelector('ol.sr-only');
    expect(srList).toBeTruthy();
    expect(srList.textContent).toContain('0: stdin');
    expect(srList.textContent).toContain('1: stdout');
    expect(srList.textContent).toContain('2: stderr');
  });

  it('renderiza pie de figura (figcaption) si caption está definido', () => {
    fixture.componentRef.setInput('spec', DIAGRAM_BOOT_SEQUENCE);
    fixture.detectChanges();

    const figcaption = fixture.nativeElement.querySelector('figcaption.diagram-caption');
    expect(figcaption).toBeTruthy();
    expect(figcaption.textContent).toContain('Etapas del proceso de inicialización');
  });
});

