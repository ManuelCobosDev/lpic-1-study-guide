import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { selectExamProgress, selectNextRecommendedSubtopic } from '../../../core/selectors/progress.selectors';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ChipComponent,
  ContainerComponent,
  ProgressBarComponent,
  ProgressRingComponent
} from '../../../shared/ui';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    ChipComponent,
    ProgressBarComponent,
    ProgressRingComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- 1. Hero Principal -->
    <section class="hero-section" aria-label="Introducción al curso">
      <app-container>
        <div class="hero-grid">
          <div class="hero-text-col">
            <div class="hero-eyebrow">
              <span class="hero-badge">PREPARACIÓN OFICIAL LPIC-1 · 101 Y 102</span>
            </div>

            <h1 class="hero-title">
              Prepara el LPIC-1 a tu ritmo, sin cuentas ni registros
            </h1>

            <p class="hero-desc">
              Contenido completo de los exámenes 101-500 y 102-500. Diapositivas interactivas,
              laboratorios guiados con terminal y simulador de examen real guardados solo en tu navegador.
            </p>

            <div class="hero-cta-group">
              <app-button
                variant="primary"
                size="lg"
                [routerLink]="primaryCtaLink()"
              >
                {{ primaryCtaText() }}
              </app-button>

              <app-button
                variant="secondary"
                size="lg"
                routerLink="/simulador"
              >
                Hacer un simulacro
              </app-button>
            </div>
          </div>

          <!-- Tarjeta de progreso en Hero -->
          <div class="hero-card-col">
            <app-card>
              <div class="progress-card-inner">
                <div class="progress-card-header">
                  <div>
                    <h3 class="progress-card-title">Tu progreso de estudio</h3>
                    <p class="progress-card-subtitle">Examen 101-500 · Administrador Linux</p>
                  </div>
                  <app-badge [variant]="exam101Progress() > 0 ? 'primary' : 'neutral'">
                    {{ exam101Progress() > 0 ? 'En curso' : 'Sin empezar' }}
                  </app-badge>
                </div>

                <div class="progress-ring-row">
                  <app-progress-ring
                    [value]="exam101Progress()"
                    [size]="96"
                    subtitle="Objetivos"
                  />
                  <div class="progress-bars-col">
                    <div class="prog-bar-item">
                      <div class="prog-bar-label">
                        <span>Examen 101 (Temas 101–104)</span>
                        <span class="font-mono">{{ exam101Progress() }}%</span>
                      </div>
                      <app-progress-bar [value]="exam101Progress()" variant="primary" />
                    </div>

                    <div class="prog-bar-item">
                      <div class="prog-bar-label">
                        <span>Examen 102 (Temas 105–110)</span>
                        <span class="font-mono">{{ exam102Progress() }}%</span>
                      </div>
                      <app-progress-bar [value]="exam102Progress()" variant="warning" />
                    </div>
                  </div>
                </div>

                <div class="progress-card-footer">
                  <span class="streak-text">Racha: 1 día · 0 h estudiadas</span>
                  @if (exam101Progress() === 0) {
                    <span class="text-xs text-[var(--text-subtle)]">Todo listo para empezar</span>
                  } @else {
                    <a [routerLink]="primaryCtaLink()" class="resume-link">Continuar lección →</a>
                  }
                </div>
              </div>
            </app-card>
          </div>
        </div>
      </app-container>
    </section>

    <!-- 2. Franja de Métricas (100% calculadas dinámicamente del manifiesto) -->
    <section class="metrics-section" aria-label="Métricas del curso">
      <app-container>
        <div class="metrics-grid">
          <a routerLink="/temario" class="metric-card">
            <span class="metric-number font-mono">{{ totalSlides() }}</span>
            <span class="metric-label">Diapositivas</span>
          </a>

          <a routerLink="/temario" class="metric-card">
            <span class="metric-number font-mono">{{ totalSubtopics() }}</span>
            <span class="metric-label">Subtemas</span>
          </a>

          <a routerLink="/laboratorios" class="metric-card">
            <span class="metric-number font-mono">{{ totalLabs() }}</span>
            <span class="metric-label">Prácticas</span>
          </a>

          <a routerLink="/comandos" class="metric-card">
            <span class="metric-number font-mono">{{ totalCommands() }}</span>
            <span class="metric-label">Comandos</span>
          </a>

          <a routerLink="/glosario" class="metric-card">
            <span class="metric-number font-mono">{{ totalTerms() }}</span>
            <span class="metric-label">Términos</span>
          </a>
        </div>
      </app-container>
    </section>

    <!-- 3. Cómo Funciona -->
    <section class="how-section">
      <app-container>
        <div class="section-heading text-center">
          <span class="section-eyebrow">METODOLOGÍA DE APRENDIZAJE</span>
          <h2 class="section-title">Cómo prepararte para aprobar a la primera</h2>
        </div>

        <div class="how-grid">
          <div class="how-card">
            <div class="how-step-num font-mono">01</div>
            <h3 class="how-step-title">Estudia la teoría interactiva</h3>
            <p class="how-step-desc">
              Diapositivas estructuradas con explicaciones claras, diagramas visuales y vínculos internos al glosario de comandos.
            </p>
          </div>

          <div class="how-card">
            <div class="how-step-num font-mono">02</div>
            <h3 class="how-step-title">Practica en laboratorios reales</h3>
            <p class="how-step-desc">
              Misiones guiadas paso a paso con sintaxis de consola, flags habituales y resolución interactiva de retos.
            </p>
          </div>

          <div class="how-card">
            <div class="how-step-num font-mono">03</div>
            <h3 class="how-step-title">Evalúate con el simulador oficial</h3>
            <p class="how-step-desc">
              Preguntas de opción múltiple y respuesta rellenada idénticas al formato real del examen LPI con calificación de 200 a 800 puntos.
            </p>
          </div>
        </div>
      </app-container>
    </section>

    <!-- 4. Exámenes LPIC-1 -->
    <section class="exams-section">
      <app-container>
        <div class="section-heading">
          <span class="section-eyebrow">OBJETIVOS DE CERTIFICACIÓN</span>
          <h2 class="section-title">Los dos exámenes del LPIC-1</h2>
        </div>

        <div class="exams-grid">
          <!-- Examen 101 -->
          <app-card>
            <div class="exam-card-inner">
              <div class="flex items-center justify-between mb-4">
                <app-badge variant="primary">Examen 101-500</app-badge>
                <span class="text-xs font-semibold text-[var(--success-text)]">Disponible completo</span>
              </div>
              <h3 class="text-xl font-bold mb-2">LPIC-1 Exam 101</h3>
              <p class="text-sm text-[var(--text-muted)] mb-6">
                Arquitectura del sistema, instalación de Linux, gestión de paquetes, comandos GNU y Unix, dispositivos y sistemas de archivos.
              </p>

              <div class="exam-meta-row mb-6">
                <div>
                  <span class="text-xs text-[var(--text-muted)] block">Peso oficial</span>
                  <span class="font-mono font-bold text-sm">60 / 60</span>
                </div>
                <div>
                  <span class="text-xs text-[var(--text-muted)] block">Temas</span>
                  <span class="font-mono font-bold text-sm">4 temas (101–104)</span>
                </div>
                <div>
                  <span class="text-xs text-[var(--text-muted)] block">Subtemas</span>
                  <span class="font-mono font-bold text-sm">23 subtemas</span>
                </div>
              </div>

              <div class="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span class="text-xs text-[var(--text-muted)] font-mono">Progreso: {{ exam101Progress() }}%</span>
                <app-button variant="primary" size="md" routerLink="/temario/101">Ver temario →</app-button>
              </div>
            </div>
          </app-card>

          <!-- Examen 102 -->
          <div class="exam-card-planned">
            <div class="flex items-center justify-between mb-4">
              <app-badge variant="neutral">Examen 102-500</app-badge>
              <span class="text-xs font-semibold text-[var(--text-subtle)]">Próximamente</span>
            </div>
            <h3 class="text-xl font-bold mb-2 text-[var(--text)]">LPIC-1 Exam 102</h3>
            <p class="text-sm text-[var(--text-muted)] mb-6">
              Shells y scripts, interfaces de usuario, tareas administrativas, servicios del sistema, fundamentos de redes y seguridad.
            </p>

            <div class="exam-meta-row mb-6">
              <div>
                <span class="text-xs text-[var(--text-muted)] block">Peso oficial</span>
                <span class="font-mono font-bold text-sm">60 / 60</span>
              </div>
              <div>
                <span class="text-xs text-[var(--text-muted)] block">Temas</span>
                <span class="font-mono font-bold text-sm">6 temas (105–110)</span>
              </div>
              <div>
                <span class="text-xs text-[var(--text-muted)] block">Subtemas</span>
                <span class="font-mono font-bold text-sm">19 subtemas</span>
              </div>
            </div>

            <div class="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <span class="text-xs text-[var(--text-muted)] font-mono">Planificado para Fase 11</span>
              <app-button variant="secondary" size="md" [disabled]="true">Próximamente</app-button>
            </div>
          </div>
        </div>
      </app-container>
    </section>

    <!-- 5. Herramientas de Estudio (Grid 3x2) -->
    <section class="tools-section">
      <app-container>
        <div class="section-heading">
          <span class="section-eyebrow">RECURSOS COMPLEMENTARIOS</span>
          <h2 class="section-title">Herramientas para dominar cada objetivo</h2>
        </div>

        <div class="tools-grid">
          <app-card [interactive]="true" routerLink="/mapa-mental">
            <div class="tool-card-content">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold">Mapa Mental</h3>
                <app-badge variant="info">10 temas</app-badge>
              </div>
              <p class="text-xs text-[var(--text-muted)] mb-4">
                Vista panorámica interactiva del árbol completo de objetivos de LPIC-1 con filtros por estado.
              </p>
              <span class="tool-link-text">Abrir →</span>
            </div>
          </app-card>

          <app-card [interactive]="true" routerLink="/simulador">
            <div class="tool-card-content">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold">Simulador de Examen</h3>
                <app-badge variant="warning">{{ totalQuestions() }} preguntas</app-badge>
              </div>
              <p class="text-xs text-[var(--text-muted)] mb-4">
                Simulacro de 90 minutos con puntuación oficial ponderada de 200 a 800 y práctica por tema.
              </p>
              <span class="tool-link-text">Abrir →</span>
            </div>
          </app-card>

          <app-card [interactive]="true" routerLink="/laboratorios">
            <div class="tool-card-content">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold">Laboratorios</h3>
                <app-badge variant="primary">{{ totalLabs() }} prácticas</app-badge>
              </div>
              <p class="text-xs text-[var(--text-muted)] mb-4">
                Instrucciones paso a paso de comandos de Linux, tuberías, permisos y administración de paquetes.
              </p>
              <span class="tool-link-text">Abrir →</span>
            </div>
          </app-card>

          <app-card [interactive]="true" routerLink="/comandos">
            <div class="tool-card-content">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold">Comandos Clave</h3>
                <app-badge variant="info">{{ totalCommands() }} comandos</app-badge>
              </div>
              <p class="text-xs text-[var(--text-muted)] mb-4">
                Catálogo alfabético exhaustivo con sinopsis, opciones más preguntadas y ejemplos prácticos.
              </p>
              <span class="tool-link-text">Abrir →</span>
            </div>
          </app-card>

          <app-card [interactive]="true" routerLink="/glosario">
            <div class="tool-card-content">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold">Glosario Técnico</h3>
                <app-badge variant="neutral">{{ totalTerms() }} términos</app-badge>
              </div>
              <p class="text-xs text-[var(--text-muted)] mb-4">
                Definiciones rigurosas de conceptos clave: inodos, demonios, señales, niveles de ejecución y FHS.
              </p>
              <span class="tool-link-text">Abrir →</span>
            </div>
          </app-card>

          <app-card [interactive]="true" routerLink="/flashcards">
            <div class="tool-card-content">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold">Flashcards (Leitner)</h3>
                <app-badge variant="success">{{ totalFlashcards() }} tarjetas</app-badge>
              </div>
              <p class="text-xs text-[var(--text-muted)] mb-4">
                Memorización activa con algoritmo de 5 cajas para afianzar comandos y opciones de examen.
              </p>
              <span class="tool-link-text">Abrir →</span>
            </div>
          </app-card>
        </div>
      </app-container>
    </section>

    <!-- 6. Banda Oscura del Simulador -->
    <section class="simulator-band-section">
      <app-container>
        <div class="sim-band-inner">
          <div class="sim-band-header">
            <div class="flex items-center gap-2 mb-2">
              <app-badge variant="warning" [dot]="true">Simulador Oficial</app-badge>
              <span class="text-xs font-mono text-[var(--warning-text)]">Formato LPI Real</span>
            </div>
            <h2 class="sim-band-title">Pon a prueba tus conocimientos en condiciones de examen</h2>
            <p class="sim-band-desc">
              Entrena con preguntas reales redactadas en español y clasificadas por ponderación de objetivos oficial.
            </p>
          </div>

          <!-- 3 Subtarjetas del simulador -->
          <div class="sim-cards-grid">
            <div class="sim-subcard">
              <h3 class="sim-subcard-title">Modo Simulacro</h3>
              <p class="sim-subcard-desc">
                60 preguntas en 90 minutos con cuenta regresiva. Puntuación oficial de 200 a 800 (aprobado ≥ 500).
              </p>
            </div>

            <div class="sim-subcard">
              <h3 class="sim-subcard-title">Modo Práctica Guiada</h3>
              <p class="sim-subcard-desc">
                Respuestas inmediatas con explicación pedagógica razonada de por qué cada opción es correcta o incorrecta.
              </p>
            </div>

            <div class="sim-subcard">
              <h3 class="sim-subcard-title">Distribución Oficial</h3>
              <p class="sim-subcard-desc">
                Selección ponderada según el peso LPI de cada tema para reflejar fielmente el examen real.
              </p>
            </div>
          </div>

          <div class="sim-band-actions">
            <app-button variant="warning" size="lg" routerLink="/simulador/examen">
              Iniciar simulacro ahora
            </app-button>
            <app-button variant="secondary" size="lg" routerLink="/simulador/practica">
              Modo práctica libre
            </app-button>
          </div>

          <!-- Chips de entrenamiento por tema -->
          <div class="sim-chips-row">
            <span class="text-xs text-[var(--text-muted)]">Entrenar por tema específico:</span>
            <div class="flex flex-wrap gap-2">
              <app-chip [routerLink]="['/simulador/practica']" [queryParams]="{ tema: '101' }">Tema 101</app-chip>
              <app-chip [routerLink]="['/simulador/practica']" [queryParams]="{ tema: '102' }">Tema 102</app-chip>
              <app-chip [routerLink]="['/simulador/practica']" [queryParams]="{ tema: '103' }">Tema 103</app-chip>
              <app-chip [routerLink]="['/simulador/practica']" [queryParams]="{ tema: '104' }">Tema 104</app-chip>
            </div>
          </div>
        </div>
      </app-container>
    </section>

    <!-- 7. FAQ en Acordeón -->
    <section class="faq-section">
      <app-container>
        <div class="section-heading text-center">
          <span class="section-eyebrow">DUDAS HABITUALES</span>
          <h2 class="section-title">Preguntas Frecuentes</h2>
        </div>

        <div class="faq-accordion">
          @for (faq of faqs; track faq.id) {
            <div class="faq-item" [class.faq-item-open]="isFaqOpen(faq.id)">
              <button
                type="button"
                class="faq-question-btn"
                [attr.aria-expanded]="isFaqOpen(faq.id)"
                (click)="toggleFaq(faq.id)"
              >
                <span>{{ faq.question }}</span>
                <svg
                  class="faq-chevron"
                  [class.faq-chevron-open]="isFaqOpen(faq.id)"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (isFaqOpen(faq.id)) {
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
    /* Hero */
    .hero-section {
      padding: 64px 0 48px 0;
      border-bottom: 1px solid var(--border);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      align-items: center;
    }

    @media (min-width: 1024px) {
      .hero-grid {
        grid-template-columns: 7fr 5fr;
      }
    }

    .hero-eyebrow {
      margin-bottom: 12px;
    }

    .hero-badge {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-text);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .hero-title {
      font-size: 36px;
      line-height: 44px;
      font-weight: 800;
      color: var(--text);
      margin: 0 0 16px 0;
    }

    @media (min-width: 768px) {
      .hero-title {
        font-size: 44px;
        line-height: 52px;
      }
    }

    .hero-desc {
      font-size: 16px;
      line-height: 26px;
      color: var(--text-muted);
      margin: 0 0 32px 0;
      max-width: 600px;
    }

    .hero-cta-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    /* Tarjeta Progreso en Hero */
    .progress-card-inner {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .progress-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .progress-card-title {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }

    .progress-card-subtitle {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted);
    }

    .progress-ring-row {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .progress-bars-col {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .prog-bar-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .prog-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
    }

    .progress-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-size: 12px;
    }

    .streak-text {
      color: var(--text-muted);
      font-weight: 500;
    }

    .resume-link {
      color: var(--primary-text);
      font-weight: 600;
      text-decoration: none;
    }

    .resume-link:hover {
      text-decoration: underline;
    }

    /* Métricas */
    .metrics-section {
      padding: 32px 0;
      border-bottom: 1px solid var(--border);
      background-color: var(--surface-muted);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (min-width: 640px) {
      .metrics-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: border-color var(--transition-fast), transform var(--transition-fast);
    }

    .metric-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    .metric-number {
      font-size: 28px;
      font-weight: 800;
      color: var(--text);
      line-height: 1.2;
    }

    .metric-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Secciones Generales */
    .section-heading {
      margin-bottom: 40px;
    }

    .section-eyebrow {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-text);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 28px;
      line-height: 36px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    .how-section,
    .exams-section,
    .tools-section,
    .faq-section {
      padding: 64px 0;
    }

    /* Cómo funciona */
    .how-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    @media (min-width: 768px) {
      .how-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .how-card {
      padding: 32px 24px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
    }

    .how-step-num {
      font-size: 32px;
      font-weight: 800;
      color: var(--primary-text);
      margin-bottom: 16px;
    }

    .how-step-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 10px 0;
    }

    .how-step-desc {
      font-size: 14px;
      line-height: 22px;
      color: var(--text-muted);
      margin: 0;
    }

    /* Exámenes */
    .exams-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    @media (min-width: 768px) {
      .exams-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .exam-card-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .exam-card-planned {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 24px;
      background-color: var(--surface);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-lg);
      box-sizing: border-box;
    }

    .exam-meta-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background-color: var(--surface-muted);
      padding: 12px;
      border-radius: var(--radius-md);
    }

    /* Herramientas (Grid 3x2) */
    .tools-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    @media (min-width: 640px) {
      .tools-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .tools-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .tool-card-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .tool-link-text {
      margin-top: auto;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-text);
    }

    /* Banda Simulador */
    .simulator-band-section {
      background-color: var(--surface-elevated);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 64px 0;
    }

    .sim-band-inner {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .sim-band-title {
      font-size: 28px;
      line-height: 36px;
      font-weight: 700;
      color: var(--text);
      margin: 8px 0;
    }

    .sim-band-desc {
      font-size: 15px;
      line-height: 24px;
      color: var(--text-muted);
      max-width: 720px;
      margin: 0;
    }

    .sim-cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    @media (min-width: 768px) {
      .sim-cards-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .sim-subcard {
      padding: 20px;
      background-color: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
    }

    .sim-subcard-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 8px 0;
    }

    .sim-subcard-desc {
      font-size: 13px;
      line-height: 20px;
      color: var(--text-muted);
      margin: 0;
    }

    .sim-band-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    .sim-chips-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    /* FAQ */
    .faq-accordion {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .faq-item {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background-color: var(--surface);
      overflow: hidden;
      transition: border-color var(--transition-fast);
    }

    .faq-item-open {
      border-color: var(--border-strong);
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
export class HomePageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  readonly manifest = this.contentService.manifest;
  readonly progress = this.progressService.progress;

  readonly openFaqs = signal<Record<string, boolean>>({
    faq1: true // Primera abierta por defecto
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
      answer: 'Sí. Una vez cargada la aplicación, todos los contenidos, lecciones teóricas, comandos y preguntas quedan en caché en el navegador para permitir el estudio completo sin conexión.'
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

  readonly exam101Progress = computed(() => {
    const m = this.manifest();
    const p = this.progress();
    if (!m) return 0;
    return selectExamProgress('101', p, m.topics, m.subtopics);
  });

  readonly exam102Progress = computed(() => {
    const m = this.manifest();
    const p = this.progress();
    if (!m) return 0;
    return selectExamProgress('102', p, m.topics, m.subtopics);
  });

  readonly nextSubtopic = computed(() => {
    const m = this.manifest();
    const p = this.progress();
    if (!m) return null;
    return selectNextRecommendedSubtopic(p, m.subtopics);
  });

  readonly primaryCtaText = computed(() => {
    const p = this.progress();
    if (p.lastVisited) {
      return 'Continuar donde lo dejaste →';
    }
    if (this.exam101Progress() > 0) {
      return 'Continuar con el Tema 101 →';
    }
    return 'Empezar por el Tema 101 →';
  });

  readonly primaryCtaLink = computed(() => {
    const p = this.progress();
    if (p.lastVisited?.path) {
      return p.lastVisited.path;
    }
    const next = this.nextSubtopic();
    if (next) {
      return `/estudiar/${next.id}`;
    }
    return '/estudiar/101.1';
  });

  // Métricas dinámicas calculadas desde el manifiesto
  readonly totalSlides = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return m.stats.totalSlidesReal + m.stats.totalSlidesPlaceholder;
  });

  readonly totalSubtopics = computed(() => {
    const m = this.manifest();
    return m ? m.stats.totalSubtopics : 0;
  });

  readonly totalLabs = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return m.stats.totalLabsReal + m.stats.totalLabsPlaceholder;
  });

  readonly totalQuestions = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return m.stats.totalQuestionsReal + m.stats.totalQuestionsPlaceholder;
  });

  readonly totalCommands = computed(() => {
    const m = this.manifest();
    return m ? m.stats.totalCommands : 0;
  });

  readonly totalTerms = computed(() => {
    const m = this.manifest();
    return m ? m.stats.totalTerms : 0;
  });

  readonly totalFlashcards = computed(() => {
    const m = this.manifest();
    return m ? (m.stats.totalFlashcards ?? 0) : 0;
  });

  async ngOnInit(): Promise<void> {
    if (!this.manifest()) {
      try {
        await this.contentService.getManifest();
      } catch {
        // El servicio ya gestiona el error
      }
    }
  }

  isFaqOpen(id: string): boolean {
    return !!this.openFaqs()[id];
  }

  toggleFaq(id: string): void {
    const current = this.isFaqOpen(id);
    this.openFaqs.update((prev) => ({
      ...prev,
      [id]: !current
    }));
  }
}

