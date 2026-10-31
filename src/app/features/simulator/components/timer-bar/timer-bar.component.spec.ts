import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerBarComponent } from './timer-bar.component';
import { ComponentRef } from '@angular/core';

describe('TimerBarComponent', () => {
  let component: TimerBarComponent;
  let componentRef: ComponentRef<TimerBarComponent>;
  let fixture: ComponentFixture<TimerBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TimerBarComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('remainingSeconds', 5400); // 90 min
    componentRef.setInput('totalSeconds', 5400);
    componentRef.setInput('currentIndex', 0);
    componentRef.setInput('totalQuestions', 60);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe formatear el tiempo correctamente en mm:ss', () => {
    expect(component.formattedTime()).toBe('90:00');

    componentRef.setInput('remainingSeconds', 75);
    fixture.detectChanges();
    expect(component.formattedTime()).toBe('01:15');

    componentRef.setInput('remainingSeconds', 0);
    fixture.detectChanges();
    expect(component.formattedTime()).toBe('00:00');
  });

  it('debe calcular los niveles de urgencia correctamente', () => {
    // > 600 segundos -> normal
    componentRef.setInput('remainingSeconds', 601);
    expect(component.urgencyLevel()).toBe('normal');

    // <= 600 y > 120 -> warning (ámbar)
    componentRef.setInput('remainingSeconds', 600);
    expect(component.urgencyLevel()).toBe('warning');

    componentRef.setInput('remainingSeconds', 121);
    expect(component.urgencyLevel()).toBe('warning');

    // <= 120 -> critical (rojo)
    componentRef.setInput('remainingSeconds', 120);
    expect(component.urgencyLevel()).toBe('critical');

    componentRef.setInput('remainingSeconds', 30);
    expect(component.urgencyLevel()).toBe('critical');
  });

  it('debe emitir finishExam al pulsar el botón de finalizar', () => {
    let emitted = false;
    component.finishExam.subscribe(() => {
      emitted = true;
    });

    component.onFinishClick();
    expect(emitted).toBe(true);
  });

  it('debe mostrar mensaje accesible adaptado', () => {
    componentRef.setInput('remainingSeconds', 120);
    expect(component.screenReaderAnnouncement()).toContain('2 minutos');

    componentRef.setInput('remainingSeconds', 45);
    expect(component.screenReaderAnnouncement()).toContain('menos de un minuto');
  });
});

