import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { ContainerComponent } from '../../../shared/ui';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-home-faq',
  standalone: true,
  imports: [ContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="faq-section" aria-label="Preguntas frecuentes">
      <app-container>
        <div class="section-heading text-center">
          <span class="section-eyebrow">DUDAS HABITUALES</span>
          <h2 class="section-title">Preguntas Frecuentes</h2>
        </div>

        <div class="faq-accordion">
          @for (faq of faqs; track faq.id) {
            <div class="faq-item" [class.faq-item-open]="isOpen(faq.id)">
              <button
                type="button"
                class="faq-question-btn"
                [attr.aria-expanded]="isOpen(faq.id)"
                (click)="toggle(faq.id)"
              >
                <span>{{ faq.question }}</span>
                <svg
                  class="faq-chevron"
                  [class.faq-chevron-open]="isOpen(faq.id)"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (isOpen(faq.id)) {
                <div class="faq-answer">
                  <p>{{ faq.answer }}</p>
                </div>
              }
            </div>
          }
        </div>
      </app-container>
    </section>
  `,
  styles: [`
    .faq-section {
      padding: 64px 0 80px 0;
    }

    .section-heading {
      margin-bottom: 40px;
    }

    .section-heading.text-center {
      text-align: center;
    }

    .section-eyebrow {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary-text);
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 26px;
      line-height: 32px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -0.02em;
    }

    @media (min-width: 640px) {
      .section-title {
        font-size: 32px;
        line-height: 40px;
      }
    }

    .faq-accordion {
      max-width: 760px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .faq-item {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .faq-item-open {
      border-color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    .faq-question-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      background: transparent;
      border: none;
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      text-align: left;
      cursor: pointer;
    }

    .faq-question-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: -2px;
    }

    .faq-chevron {
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      transition: transform var(--transition-fast);
      flex-shrink: 0;
    }

    .faq-chevron-open {
      transform: rotate(180deg);
    }

    .faq-answer {
      padding: 0 20px 20px 20px;
      font-size: 14px;
      line-height: 24px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 16px;
    }

    .faq-answer p {
      margin: 0;
    }
  `]
})
export class HomeFaqComponent {
  readonly openFaqs = model<Record<string, boolean>>({
    faq1: true
  });

  readonly faqs: FaqItem[] = [
    {
      id: 'faq1',
      question: '¿Qué versiones de LPIC-1 cubre esta guía de estudio?',
      answer: 'Cubre la versión oficial actual 5.0 de los dos exámenes requeridos: LPIC-1 101-500 y LPIC-1 102-500, con sus 10 temas y 42 objetivos ponderados según las especificaciones del Linux Professional Institute.'
    },
    {
      id: 'faq2',
      question: '¿Necesito crear una cuenta o registrarme?',
      answer: 'No. Toda tu actividad, notas personales, diapositivas vistas y resultados de simulacros se guardan exclusivamente en tu navegador de forma 100% privada mediante almacenamiento local.'
    },
    {
      id: 'faq3',
      question: '¿Puedo estudiar sin conexión a Internet (offline)?',
      answer: 'El progreso, las respuestas y las notas se guardan de forma local en tu navegador con total privacidad sin necesidad de cuenta. La aplicación se ejecuta en el cliente, pero requiere conexión a Internet para descargar las lecciones, laboratorios y preguntas conforme los vas explorando.'
    },
    {
      id: 'faq4',
      question: '¿Cómo exporto o hago copia de seguridad de mi progreso?',
      answer: 'En la sección de Ajustes puedes exportar un archivo JSON con todo tu avance en cualquier momento e importarlo en otro navegador u ordenador sin perder nada.'
    },
    {
      id: 'faq5',
      question: '¿Cómo funciona la puntuación del simulador de examen?',
      answer: 'Utiliza la escala oficial de LPI de 200 a 800 puntos, donde la nota mínima de corte para aprobar es de 500 puntos. Las preguntas se seleccionan respetando la ponderación real de cada objetivo.'
    }
  ];

  isOpen(id: string): boolean {
    return !!this.openFaqs()[id];
  }

  toggle(id: string): void {
    const current = this.isOpen(id);
    this.openFaqs.update((prev) => ({
      ...prev,
      [id]: !current
    }));
  }
}

