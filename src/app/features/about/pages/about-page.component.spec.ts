import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AboutPageComponent } from './about-page.component';
import { ContentService } from '../../../core/services/content.service';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

const mockManifest: CurriculumManifest = {
  version: '1.2.3',
  generatedAt: '2026-10-31T00:00:00Z',
  exams: [],
  topics: [],
  subtopics: [],
  stats: {
    totalExams: 0,
    totalTopics: 0,
    totalSubtopics: 0,
    availableSubtopics: 0,
    plannedSubtopics: 0,
    totalSlidesReal: 0,
    totalSlidesPlaceholder: 0,
    totalLabsReal: 0,
    totalLabsPlaceholder: 0,
    totalQuestionsReal: 0,
    totalQuestionsPlaceholder: 0,
    totalCommands: 0,
    totalTerms: 0
  }
};

describe('AboutPageComponent', () => {
  let component: AboutPageComponent;
  let fixture: ComponentFixture<AboutPageComponent>;
  let contentService: ContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPageComponent],
      providers: [provideRouter([]), ContentService]
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    vi.spyOn(contentService, 'getManifest').mockResolvedValue(mockManifest);

    fixture = TestBed.createComponent(AboutPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.appVersion).toBe('0.1.0');
    expect(component.lpiVersion).toBe('5.0');
  });

  it('debe renderizar el título de la página y el aviso legal de no afiliación', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.page-title');
    expect(title?.textContent).toContain('Acerca de LPIC-1 Aula');

    const disclaimer = el.querySelector('.disclaimer-banner');
    expect(disclaimer).toBeTruthy();
    expect(disclaimer?.textContent).toContain('no está patrocinado, avalado ni afiliado oficialmente a Linux Professional Institute');
  });

  it('debe mostrar las tarjetas de metodología pedagógica', () => {
    const cards = fixture.nativeElement.querySelectorAll('.feature-card');
    expect(cards.length).toBe(4);
  });
});
