import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LabDetailPageComponent } from './lab-detail-page.component';
import { LabsService } from '../../../core/services/labs.service';
import { Lab } from '../../../core/models/lab.model';

describe('LabDetailPageComponent', () => {
  let component: LabDetailPageComponent;
  let fixture: ComponentFixture<LabDetailPageComponent>;

  const mockLab: Lab = {
    id: 'lab-103-4',
    subtopicId: '103.4',
    title: 'Práctica 103.4 — Redirecciones',
    estimatedMinutes: 30,
    difficulty: 'basic',
    type: 'subtopic',
    steps: [
      {
        id: 'm-1',
        stepNumber: 1,
        title: 'Misión 1: Stdout y Stderr',
        instruction: 'Ejecuta el comando para aislar flujos.',
        command: 'ls /etc > out.txt 2> err.txt',
        expectedOutput: 'out.txt con archivos',
        examAlert: 'Alerta de examen sobre descriptores'
      },
      {
        id: 'm-2',
        stepNumber: 2,
        title: 'Misión 2: Tuberías',
        instruction: 'Conecta dos comandos con pipe.',
        command: 'cat /etc/passwd | grep bash',
        expectedOutput: 'usuarios con bash',
        hint: 'Usa grep'
      },
      {
        id: 'm-3',
        stepNumber: 3,
        title: 'Misión 3: tee',
        instruction: 'Bifurca salida con tee.',
        command: 'echo hola | tee archivo.txt',
        expectedOutput: 'hola'
      }
    ]
  };

  let mockCompletedMap: Record<string, number[]> = {};
  let mockDismissedNotice = false;

  const mockLabsService = {
    state: signal({
      schemaVersion: 1,
      completedSteps: mockCompletedMap,
      dismissedVmNotice: mockDismissedNotice
    }),
    isDebianVmNoticeDismissed: vi.fn(() => mockDismissedNotice),
    getLab: vi.fn().mockResolvedValue(mockLab),
    getCompletedSteps: vi.fn((labId: string) => mockCompletedMap[labId] ?? []),
    isStepCompleted: vi.fn((labId: string, stepNumber: number) =>
      (mockCompletedMap[labId] ?? []).includes(stepNumber)
    ),
    toggleStep: vi.fn((labId: string, stepNumber: number) => {
      const current = mockCompletedMap[labId] ?? [];
      if (current.includes(stepNumber)) {
        mockCompletedMap[labId] = current.filter((s) => s !== stepNumber);
      } else {
        mockCompletedMap[labId] = [...current, stepNumber];
      }
      mockLabsService.state.set({
        schemaVersion: 1,
        completedSteps: { ...mockCompletedMap },
        dismissedVmNotice: mockDismissedNotice
      });
    }),
    resetLab: vi.fn((labId: string) => {
      delete mockCompletedMap[labId];
      mockLabsService.state.set({
        schemaVersion: 1,
        completedSteps: { ...mockCompletedMap },
        dismissedVmNotice: mockDismissedNotice
      });
    }),
    dismissVmNotice: vi.fn(() => {
      mockDismissedNotice = true;
      mockLabsService.state.set({
        schemaVersion: 1,
        completedSteps: { ...mockCompletedMap },
        dismissedVmNotice: true
      });
    })
  };

  beforeEach(async () => {
    mockCompletedMap = {};
    mockDismissedNotice = false;
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LabDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: LabsService, useValue: mockLabsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['id', '103.4']]))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LabDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse y cargar el laboratorio correctamente', () => {
    expect(component).toBeTruthy();
    expect(mockLabsService.getLab).toHaveBeenCalledWith('103.4');
    expect(component.lab()?.id).toBe('lab-103-4');
    expect(component.totalSteps()).toBe(3);
    expect(component.currentStep()?.stepNumber).toBe(1);
  });

  it('debe renderizar el título, la instrucción y el bloque de código del paso 1', () => {
    const article = fixture.nativeElement.querySelector('article');
    expect(article).toBeTruthy();

    const title = article.querySelector('h2');
    expect(title.textContent).toContain('Misión 1: Stdout y Stderr');

    const instruction = article.querySelector('p');
    expect(instruction.textContent).toContain('Ejecuta el comando para aislar flujos');

    const codeBlock = article.querySelector('app-code-block');
    expect(codeBlock).toBeTruthy();
  });

  it('debe permitir navegar entre pasos con los botones de anterior y siguiente', () => {
    expect(component.currentStepIndex()).toBe(0);

    component.goToNextStep();
    fixture.detectChanges();
    expect(component.currentStepIndex()).toBe(1);
    expect(component.currentStep()?.title).toContain('Misión 2');

    component.goToNextStep();
    fixture.detectChanges();
    expect(component.currentStepIndex()).toBe(2);

    // No debe avanzar más allá del último paso
    component.goToNextStep();
    expect(component.currentStepIndex()).toBe(2);

    component.goToPrevStep();
    fixture.detectChanges();
    expect(component.currentStepIndex()).toBe(1);
  });

  it('debe marcar pasos como completados y actualizar el porcentaje de avance', () => {
    expect(component.progressPercent()).toBe(0);
    expect(component.isCurrentStepCompleted()).toBe(false);

    component.toggleCurrentStep(); // Marca paso 1
    fixture.detectChanges();

    expect(mockLabsService.toggleStep).toHaveBeenCalledWith('lab-103-4', 1, 3);
    expect(component.completedSteps()).toContain(1);
    expect(component.isCurrentStepCompleted()).toBe(true);
    expect(component.progressPercent()).toBe(33);
  });

  it('debe abrir el diálogo de enhorabuena cuando se completan todos los pasos', () => {
    expect(component.showSuccessModal()).toBe(false);

    component.onStepToggle(1);
    component.onStepToggle(2);
    expect(component.showSuccessModal()).toBe(false);

    component.onStepToggle(3); // Se completan los 3
    expect(component.showSuccessModal()).toBe(true);
  });

  it('debe copiar el comando al portapapeles y activar el feedback', async () => {
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy
      }
    });

    await component.copyCommandToClipboard('ls -la');
    expect(clipboardSpy).toHaveBeenCalledWith('ls -la');
    expect(component.copiedCommandFeedback()).toBe(true);
  });

  it('debe descartar el aviso de VM Debian 12 al llamar dismissVmNotice', () => {
    component.dismissVmNotice();
    expect(mockLabsService.dismissVmNotice).toHaveBeenCalled();
  });

  it('debe reiniciar el laboratorio con confirmResetLab', () => {
    component.onStepToggle(1);
    expect(component.completedSteps().length).toBe(1);

    component.confirmResetLab();
    expect(mockLabsService.resetLab).toHaveBeenCalledWith('lab-103-4');
    expect(component.completedSteps().length).toBe(0);
    expect(component.currentStepIndex()).toBe(0);
  });
});

