import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorHubPageComponent } from './simulator-hub-page.component';
import { ExamService } from '../../../core/services/exam.service';
import { ContentService } from '../../../core/services/content.service';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { CurriculumManifest } from '../../../core/models/curriculum.model';

describe('SimulatorHubPageComponent', () => {
  let component: SimulatorHubPageComponent;
  let fixture: ComponentFixture<SimulatorHubPageComponent>;
  let examServiceMock: Partial<ExamService>;
  let contentServiceMock: Partial<ContentService>;
  let router: Router;

  const mockManifest: Partial<CurriculumManifest> = {
    topics: [
      { id: '101', title: 'Arquitectura del sistema', examId: '101', weight: 8, subtopicIds: [] },
      { id: '102', title: 'Instalación de Linux y paquetes', examId: '101', weight: 7, subtopicIds: [] }
    ]
  };

  beforeEach(async () => {
    examServiceMock = {
      hasActiveSession: signal(false),
      activeSession: signal(null),
      getRecentAttempts: vi.fn().mockReturnValue([]),
      getRemainingSeconds: vi.fn().mockReturnValue(3600),
      startExam: vi.fn().mockResolvedValue({ id: 'test-session' }),
      abandonCurrentExam: vi.fn()
    };

    contentServiceMock = {
      getManifest: vi.fn().mockResolvedValue(mockManifest)
    };

    await TestBed.configureTestingModule({
      imports: [SimulatorHubPageComponent],
      providers: [
        provideRouter([]),
        { provide: ExamService, useValue: examServiceMock },
        { provide: ContentService, useValue: contentServiceMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(SimulatorHubPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente y cargar los temas', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.topics().length).toBe(2);
  });

  it('debe iniciar un simulacro cronometrado y navegar a /simulador/examen', async () => {
    await component.startTimedExam();
    expect(examServiceMock.startExam).toHaveBeenCalledWith({ mode: 'exam' });
    expect(router.navigate).toHaveBeenCalledWith(['/simulador/examen']);
  });

  it('debe navegar a práctica libre con o sin query params de tema', () => {
    component.goToPractice('101');
    expect(router.navigate).toHaveBeenCalledWith(['/simulador/practica'], {
      queryParams: { tema: '101' }
    });

    component.goToPractice();
    expect(router.navigate).toHaveBeenCalledWith(['/simulador/practica']);
  });

  it('debe permitir descartar un examen activo', () => {
    component.abandonActiveExam();
    expect(examServiceMock.abandonCurrentExam).toHaveBeenCalled();
  });
});
