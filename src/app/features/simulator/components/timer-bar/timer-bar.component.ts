import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-timer-bar',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './timer-bar.component.html',
  styleUrls: ['./timer-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerBarComponent {
  readonly remainingSeconds = input.required<number>();
  readonly totalSeconds = input<number>(5400); // 90 min por defecto
  readonly currentIndex = input.required<number>(); // 0-based
  readonly totalQuestions = input.required<number>();
  readonly isPractice = input<boolean>(false);

  readonly finishExam = output<void>();

  /**
   * Formato MM:SS del tiempo restante
   */
  readonly formattedTime = computed(() => {
    const s = Math.max(0, this.remainingSeconds());
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  });

  /**
   * Estado de urgencia semántica:
   * - 'critical': <= 2 minutos (120 s) -> rojo
   * - 'warning': <= 10 minutos (600 s) -> ámbar
   * - 'normal': > 10 minutos
   */
  readonly urgencyLevel = computed<'normal' | 'warning' | 'critical'>(() => {
    const s = this.remainingSeconds();
    if (s <= 120) return 'critical';
    if (s <= 600) return 'warning';
    return 'normal';
  });

  /**
   * Mensaje accesible para lectores de pantalla. Se computa al cambiar de minuto
   * o al entrar en estado crítico, para no saturar con lecturas cada segundo.
   */
  readonly screenReaderAnnouncement = computed(() => {
    if (this.isPractice()) {
      return `Modo práctica. Pregunta ${this.currentIndex() + 1} de ${this.totalQuestions()}`;
    }
    const s = this.remainingSeconds();
    const minutes = Math.floor(s / 60);
    if (s <= 0) return 'Tiempo agotado.';
    if (s <= 60) return 'Queda menos de un minuto.';
    if (s <= 120) return 'Atención: quedan 2 minutos de examen.';
    if (minutes === 10) return 'Atención: quedan 10 minutos de examen.';
    return `Tiempo restante: ${minutes} minutos. Pregunta ${this.currentIndex() + 1} de ${this.totalQuestions()}`;
  });

  onFinishClick(): void {
    this.finishExam.emit();
  }
}

