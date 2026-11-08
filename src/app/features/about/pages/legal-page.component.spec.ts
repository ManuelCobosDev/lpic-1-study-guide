import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { LegalPageComponent } from './legal-page.component';
import { APP_VERSION } from '../../../core/constants/version';

describe('LegalPageComponent', () => {
  let component: LegalPageComponent;
  let fixture: ComponentFixture<LegalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LegalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente con los metadatos del titular y versión', () => {
    expect(component).toBeTruthy();
    expect(component.appVersion).toBe(APP_VERSION);
    expect(component.projectOwner).toBe('Manuel Cobos');
    expect(component.domainName).toBe('lpic1.manuelcobos.dev');
  });

  it('debe renderizar las 7 secciones jurídicas y la exención del art. 22.2 LSSI-CE', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.page-title');
    expect(title?.textContent).toContain('Aviso Legal, Privacidad y Política de Almacenamiento Local');

    const sections = el.querySelectorAll('.legal-section');
    expect(sections.length).toBe(7);

    expect(el.textContent).toContain('artículo 22.2, párrafo segundo, de la Ley 34/2002 (LSSI-CE)');
    expect(el.textContent).toContain('Reglamento (UE) 2016/679 General de Protección de Datos (RGPD)');
    expect(el.textContent).toContain('no está afiliado, patrocinado, autorizado, certificado, administrado ni respaldado oficialmente por Linux Professional Institute');
  });

  it('debe documentar en la tabla el inventario técnico de las 9 claves lpic1.v1.*', () => {
    const rows = fixture.nativeElement.querySelectorAll('.audit-table tbody tr');
    expect(rows.length).toBe(9);
    expect(fixture.nativeElement.textContent).toContain('lpic1.v1.theme');
    expect(fixture.nativeElement.textContent).toContain('lpic1.v1.progress');
    expect(fixture.nativeElement.textContent).toContain('lpic1.v1.flashcards_progress');
  });
});

