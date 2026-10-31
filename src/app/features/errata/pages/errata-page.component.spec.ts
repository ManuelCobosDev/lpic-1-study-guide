import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrataPageComponent } from './errata-page.component';
import { ContentService } from '../../../core/services/content.service';
import { Errata } from '../../../core/models/errata.model';

const mockErrata: Errata[] = [
  {
    id: 'err-1',
    page: 'Subtema 103.4',
    description: 'Error en operador de tuberías',
    correction: 'Se corrigió a tee -a',
    severity: 'minor',
    subtopicId: '103.4',
    fixedAt: '2026-10-20'
  },
  {
    id: 'err-2',
    page: 'Subtema 102.1',
    description: 'Límite incorrecto particiones MBR',
    correction: 'Máximo 4 particiones primarias',
    severity: 'major',
    subtopicId: '102.1'
  }
];

describe('ErrataPageComponent', () => {
  let component: ErrataPageComponent;
  let fixture: ComponentFixture<ErrataPageComponent>;
  let contentService: ContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrataPageComponent],
      providers: [provideRouter([]), ContentService]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    vi.spyOn(contentService, 'getErrata').mockResolvedValue(mockErrata);

    fixture = TestBed.createComponent(ErrataPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse correctamente y listar las erratas cargadas', () => {
    expect(component).toBeTruthy();
    expect(component.rawErrata().length).toBe(2);
    expect(component.filteredErrata().length).toBe(2);
  });

  it('debe calcular estadísticas de erratas (total, fixed, open)', () => {
    const stats = component.stats();
    expect(stats.total).toBe(2);
    expect(stats.fixed).toBe(1);
    expect(stats.open).toBe(1);
  });

  it('debe filtrar erratas por severidad', () => {
    component.setSeverity('major');
    fixture.detectChanges();

    const list = component.filteredErrata();
    expect(list.length).toBe(1);
    expect(list[0]?.id).toBe('err-2');
  });

  it('debe filtrar erratas por estado', () => {
    component.setStatus('fixed');
    fixture.detectChanges();

    const list = component.filteredErrata();
    expect(list.length).toBe(1);
    expect(list[0]?.id).toBe('err-1');
  });

  it('debe filtrar erratas por búsqueda de texto', () => {
    component.searchQuery.set('tuberías');
    fixture.detectChanges();

    const list = component.filteredErrata();
    expect(list.length).toBe(1);
    expect(list[0]?.id).toBe('err-1');
  });

  it('debe contener el botón de reporte a GitHub', () => {
    const btn = fixture.nativeElement.querySelector('[data-testid="report-errata-btn"]');
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('href')).toContain('github.com');
  });
});

