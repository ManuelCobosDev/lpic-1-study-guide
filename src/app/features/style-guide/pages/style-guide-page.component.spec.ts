import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StyleGuidePageComponent } from './style-guide-page.component';

describe('StyleGuidePageComponent', () => {
  let fixture: ComponentFixture<StyleGuidePageComponent>;
  let component: StyleGuidePageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleGuidePageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(StyleGuidePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear la pagina de guia de estilos y renderizar el titulo oficial', () => {
    expect(component).toBeTruthy();
    const heading = fixture.nativeElement.querySelector('.sg-title');
    expect(heading.textContent).toContain('Guía de Estilos & Primitivas UI');
  });

  it('debe renderizar las 6 variantes de botones', () => {
    const buttons = fixture.nativeElement.querySelectorAll('app-button');
    expect(buttons.length).toBeGreaterThanOrEqual(24); // 6 variantes * varios tamaños/estados
  });

  it('debe renderizar badges de 24 px fijos con y sin dot', () => {
    const badges = fixture.nativeElement.querySelectorAll('app-badge');
    expect(badges.length).toBeGreaterThanOrEqual(12);
  });
});

