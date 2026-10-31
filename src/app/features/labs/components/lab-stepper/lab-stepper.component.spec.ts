import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LabStepperComponent } from './lab-stepper.component';
import { LabStep } from '../../../../core/models/lab.model';

describe('LabStepperComponent', () => {
  let component: LabStepperComponent;
  let fixture: ComponentFixture<LabStepperComponent>;

  const mockSteps: LabStep[] = [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Misión 1: Redirección estándar',
      instruction: 'Instrucción 1'
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Misión 2: Tuberías',
      instruction: 'Instrucción 2'
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Misión 3: Filtro xargs',
      instruction: 'Instrucción 3'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabStepperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LabStepperComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('steps', mockSteps);
    fixture.componentRef.setInput('activeStepNumber', 1);
    fixture.componentRef.setInput('completedStepNumbers', [1]);
    fixture.detectChanges();
  });

  it('debe crearse y renderizar todos los pasos', () => {
    expect(component).toBeTruthy();
    const items = fixture.nativeElement.querySelectorAll('.stepper-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Misión 1: Redirección estándar');
  });

  it('debe reflejar el paso activo con aria-current="step"', () => {
    const activeItem = fixture.nativeElement.querySelector('[aria-current="step"]');
    expect(activeItem).toBeTruthy();
    expect(activeItem.textContent).toContain('Misión 1');
  });

  it('debe calcular el progreso exacto y mostrar icono de completado', () => {
    expect(component.completedCount()).toBe(1);
    expect(component.progressPercent()).toBe(33);

    const header = fixture.nativeElement.querySelector('.stepper-header');
    expect(header.textContent).toContain('Misiones (1/3)');
    expect(header.textContent).toContain('33%');
  });

  it('debe emitir stepSelect al hacer clic en un elemento del paso', () => {
    const selectSpy = vi.fn();
    component.stepSelect.subscribe(selectSpy);

    const items = fixture.nativeElement.querySelectorAll('.stepper-item');
    items[1].click();

    expect(selectSpy).toHaveBeenCalledWith(2);
  });

  it('debe emitir stepToggle al hacer clic en el botón de checkbox sin propagar clic al item', () => {
    const selectSpy = vi.fn();
    const toggleSpy = vi.fn();
    component.stepSelect.subscribe(selectSpy);
    component.stepToggle.subscribe(toggleSpy);

    const checkboxBtns = fixture.nativeElement.querySelectorAll('.step-checkbox-btn');
    checkboxBtns[2].click();

    expect(toggleSpy).toHaveBeenCalledWith(3);
    expect(selectSpy).not.toHaveBeenCalled();
  });
});

