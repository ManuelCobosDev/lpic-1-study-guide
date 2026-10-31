import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { selectSubtopicProgress, selectTopicProgress } from '../../../core/selectors/progress.selectors';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ChipComponent,
  ContainerComponent,
  ProgressBarComponent,
  ProgressRingComponent,
  WeightMeterComponent
} from '../../../shared/ui';

@Component({
  selector: 'app-topic-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    ContainerComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    ChipComponent,
    ProgressBarComponent,
    ProgressRingComponent,
    WeightMeterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topic-detail-page">
      <app-container>
        <!-- Migas de pan y retorno -->
        <nav class="back-nav mb-6" aria-label="Navegación jerárquica">
          <a [routerLink]="['/temario', currentExamId()]" class="back-link">
            ← Volver al Examen {{ currentExamId() }}
          </a>
        </nav>

        @if (currentTopic(); as topic) {
          <!-- Cabecera del Tema -->
          <header class="topic-header">
            <div class="header-main-col">
              <div class="flex items-center gap-3 mb-2">
                <span class="topic-eyebrow font-mono">TEMA {{ topic.id }}</span>
                <span class="meta-dot">·</span>
                <span class="text-xs font-mono text-[var(--text-muted)]">EXAMEN {{ topic.examId }}-500</span>
                @if (isTopicCompleted()) {
                  <app-badge variant="success" [dot]="true">Completado</app-badge>
                }
              </div>

              <h1 class="topic-title">{{ topic.title }}</h1>

              <div class="topic-stats-row">
                <div class="stat-pill font-mono">
                  Peso LPI: <strong>{{ topic.weight }}</strong>
                </div>
                <div class="stat-pill font-mono">
                  <strong>{{ topicSubtopics().length }}</strong> subtemas
                </div>
                <div class="stat-pill font-mono">
                  ~<strong>{{ totalHours() }}</strong> h estimadas
                </div>
                <div class="stat-pill font-mono">
                  <strong>{{ totalSlides() }}</strong> diapositivas
                </div>
              </div>

              <div class="mt-4">
                <app-weight-meter [weight]="topic.weight" />
              </div>
            </div>

            <!-- Progreso y CTA Continuar -->
            <div class="header-action-col">
              <div class="flex items-center gap-4 mb-4">
                <app-progress-ring
                  [value]="topicProgress()"
                  [size]="72"
                  subtitle="Tema"
                />
                <div>
                  <span class="text-xs text-[var(--text-subtle)] block">Progreso del tema</span>
                  <span class="text-lg font-bold font-mono">{{ topicProgress() }}%</span>
                </div>
              </div>

              <app-button
                variant="primary"
                size="md"
                [routerLink]="['/estudiar', nextSubtopicId()]"
              >
                {{ topicProgress() > 0 ? 'Continuar estudio →' : 'Empezar tema →' }}
              </app-button>
            </div>
          </header>

          <!-- Layout de 2 columnas: Contenido principal + Barra lateral -->
          <div class="topic-content-grid">
            <div class="main-column">
              <!-- SECCIÓN 1: TEORÍA Y SUBTEMAS -->
              <section class="section-block" aria-labelledby="heading-teoria">
                <div class="section-header">
                  <div class="flex items-center gap-2">
                    <span class="section-icon">📖</span>
                    <h2 id="heading-teoria" class="section-title">1. Lecciones teóricas y objetivos</h2>
                  </div>
                  <span class="text-xs text-[var(--text-muted)] font-mono">
                    {{ topicSubtopics().length }} lecciones interactivas
                  </span>
                </div>

                <div class="subtopics-cards-list">
                  @for (sub of topicSubtopics(); track sub.id) {
                    <div class="subtopic-card" [class.subtopic-done]="isSubtopicCompleted(sub.id)">
                      <div class="subtopic-card-left">
                        <span class="subtopic-code font-mono">{{ sub.id }}</span>
                        <div class="subtopic-card-body">
                          <h3 class="subtopic-card-title">
                            <a [routerLink]="['/estudiar', sub.id]" class="subtopic-title-link">
                              {{ sub.title }}
                            </a>
                          </h3>
                          <div class="subtopic-card-meta font-mono">
                            <span>Peso {{ sub.weight }}</span>
                            <span>·</span>
                            <span>{{ sub.estimatedMinutes }} min</span>
                            <span>·</span>
                            <span>{{ sub.slideCount ?? 0 }} diapositivas</span>
                          </div>
                        </div>
                      </div>

                      <div class="subtopic-card-right">
                        @if (isSubtopicCompleted(sub.id)) {
                          <span class="completed-check" aria-label="Completado" title="Subtema completado">
                            <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-[var(--success-text)]">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                          </span>
                        }

                        <app-button
                          variant="secondary"
                          size="sm"
                          [routerLink]="['/estudiar', sub.id]"
                        >
                          Estudiar →
                        </app-button>
                      </div>
                    </div>
                  }
                </div>
              </section>

              <!-- SECCIÓN 2: PRÁCTICAS Y LABORATORIOS -->
              <section class="section-block" aria-labelledby="heading-practicas">
                <div class="section-header">
                  <div class="flex items-center gap-2">
                    <span class="section-icon">💻</span>
                    <h2 id="heading-practicas" class="section-title">2. Laboratorios y retos prácticos</h2>
                  </div>
                  <span class="text-xs text-[var(--text-muted)] font-mono">Terminal y comandos</span>
                </div>

                <div class="practices-grid">
                  <!-- Práctica global integradora -->
                  <app-card>
                    <div class="global-lab-card">
                      <div class="flex items-center justify-between mb-3">
                        <app-badge variant="warning">MISIÓN INTEGRADORA</app-badge>
                        <span class="trophy-badge font-mono">🏆 Reto Global</span>
                      </div>
                      <h3 class="text-base font-bold mb-2">Práctica global del Tema {{ topic.id }}</h3>
                      <p class="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                        Escenario de administración realista que integra todos los comandos, opciones y configuraciones
                        exigidas en los subtemas de esta sección.
                      </p>
                      <app-button
                        variant="warning"
                        size="sm"
                        [routerLink]="['/laboratorios', 'tema-' + topic.id]"
                      >
                        Iniciar misión integradora →
                      </app-button>
                    </div>
                  </app-card>

                  <!-- Prácticas guiadas de subtemas -->
                  @for (sub of subtopicsWithLabs(); track sub.id) {
                    <div class="lab-item-card">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-xs font-semibold text-[var(--primary-text)]">Lab {{ sub.id }}</span>
                        <span class="text-xs text-[var(--text-subtle)] font-mono">Guiado</span>
                      </div>
                      <h4 class="text-xs font-semibold text-[var(--text)] mb-3">{{ sub.title }}</h4>
                      <a [routerLink]="['/laboratorios', sub.labId]" class="lab-item-link">
                        Abrir consola de prácticas →
                      </a>
                    </div>
                  }
                </div>
              </section>

              <!-- SECCIÓN 3: CUESTIONARIO ESPECÍFICO DEL TEMA -->
              <section class="section-block" aria-labelledby="heading-cuestionario">
                <div class="section-header">
                  <div class="flex items-center gap-2">
                    <span class="section-icon">📝</span>
                    <h2 id="heading-cuestionario" class="section-title">3. Test oficial del Tema {{ topic.id }}</h2>
                  </div>
                  <app-badge variant="info">Simulador LPIC-1</app-badge>
                </div>

                <div class="quiz-banner-card">
                  <div class="quiz-banner-content">
                    <h3 class="text-base font-bold mb-2">Cuestionario de examen por objetivos</h3>
                    <p class="text-xs text-[var(--text-muted)] mb-4 max-w-lg leading-relaxed">
                      Preguntas oficiales de opción múltiple y respuesta rellenada sobre los conceptos del Tema {{ topic.id }}.
                      Retroalimentación inmediata y explicaciones didácticas paso a paso.
                    </p>
                    <div class="flex flex-wrap gap-3">
                      <app-button
                        variant="primary"
                        size="sm"
                        routerLink="/simulador/practica"
                        [queryParams]="{ tema: topic.id }"
                      >
                        Hacer test del Tema {{ topic.id }} →
                      </app-button>
                      <app-button
                        variant="secondary"
                        size="sm"
                        routerLink="/simulador"
                      >
                        Ver simulacro general
                      </app-button>
                    </div>
                  </div>
                </div>
              </section>

              <!-- SECCIÓN 4: RESUMEN Y SÍNTESIS COMPLETA -->
              <section class="section-block" aria-labelledby="heading-resumen">
                <div class="section-header">
                  <div class="flex items-center gap-2">
                    <span class="section-icon">📌</span>
                    <h2 id="heading-resumen" class="section-title">4. Resumen y chuleta del tema</h2>
                  </div>
                  <app-badge variant="neutral">Repaso rápido</app-badge>
                </div>

                <div class="summary-card">
                  <h3 class="text-sm font-bold text-[var(--text)] mb-2">
                    Síntesis ejecutiva de conceptos del Tema {{ topic.id }}
                  </h3>
                  <p class="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                    Repasa en 5 minutos los comandos más preguntados, rutas clave en el sistema de archivos (/etc, /proc, /sys)
                    y opciones obligatorias antes de enfrentarte al simulador.
                  </p>
                  <div class="flex items-center gap-3">
                    <a
                      [routerLink]="['/estudiar', firstSubtopicId()]"
                      [queryParams]="{ vista: 'web' }"
                      class="summary-link font-mono"
                    >
                      Ver chuleta y notas rápidas →
                    </a>
                  </div>
                </div>
              </section>
            </div>

            <!-- Columna lateral: Datos del tema y navegación entre temas -->
            <aside class="sidebar-column" aria-label="Información complementaria del tema">
              <div class="sticky-sidebar">
                <!-- Tarjeta de Objetivos y Comandos -->
                <div class="sidebar-box">
                  <h3 class="sidebar-box-title">Ponderación LPI</h3>
                  <p class="text-xs text-[var(--text-muted)] mb-3">
                    Este tema aporta <strong>{{ topic.weight }}</strong> puntos al peso total del examen (máximo 60).
                  </p>
                  <app-progress-bar
                    [value]="(topic.weight / 26) * 100"
                    variant="primary"
                  />
                  <span class="text-[11px] text-[var(--text-subtle)] block mt-1">
                    Representa el {{ Math.round((topic.weight / 60) * 100) }}% del examen
                  </span>
                </div>

                <!-- Herramientas directas del tema -->
                <div class="sidebar-box">
                  <h3 class="sidebar-box-title">Herramientas</h3>
                  <ul class="sidebar-links-list">
                    <li>
                      <a routerLink="/comandos" class="sidebar-link">
                        <span>⌨️</span> Comandos del tema
                      </a>
                    </li>
                    <li>
                      <a routerLink="/glosario" class="sidebar-link">
                        <span>📚</span> Glosario de términos
                      </a>
                    </li>
                    <li>
                      <a routerLink="/flashcards" class="sidebar-link">
                        <span>🗂️</span> Tarjetas de memorización
                      </a>
                    </li>
                  </ul>
                </div>

                <!-- Navegador entre temas adyacentes -->
                <div class="sidebar-box">
                  <h3 class="sidebar-box-title">Navegación de temas</h3>
                  <div class="adjacent-nav">
                    @if (prevTopic(); as prev) {
                      <a [routerLink]="['/temario', prev.examId, prev.id]" class="adj-link">
                        <span class="text-[11px] text-[var(--text-subtle)]">← Anterior</span>
                        <span class="font-semibold text-xs text-[var(--text)]">Tema {{ prev.id }}</span>
                      </a>
                    }
                    @if (nextTopic(); as next) {
                      <a [routerLink]="['/temario', next.examId, next.id]" class="adj-link text-right">
                        <span class="text-[11px] text-[var(--text-subtle)]">Siguiente →</span>
                        <span class="font-semibold text-xs text-[var(--text)]">Tema {{ next.id }}</span>
                      </a>
                    }
                  </div>
                </div>
              </div>
            </aside>
          </div>
        } @else {
          <!-- Tema no encontrado -->
          <div class="not-found-card text-center py-16">
            <h2 class="text-2xl font-bold mb-4">Tema no encontrado</h2>
            <p class="text-[var(--text-muted)] mb-6">
              El tema solicitado no existe en el plan de estudios del LPIC-1.
            </p>
            <app-button variant="primary" routerLink="/temario">
              Volver al temario general
            </app-button>
          </div>
        }
      </app-container>
    </div>
  `,
  styles: [`
    .topic-detail-page {
      padding: 32px 0 64px 0;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .back-link:hover {
      color: var(--primary-text);
    }

    /* Cabecera */
    .topic-header {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 28px 32px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-2xl, 16px);
      margin-bottom: 36px;
    }

    @media (min-width: 900px) {
      .topic-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .header-main-col {
      flex: 1 1 auto;
      max-width: 740px;
    }

    .topic-eyebrow {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-text);
      letter-spacing: 0.08em;
    }

    .meta-dot {
      color: var(--text-subtle);
    }

    .topic-title {
      font-size: 28px;
      line-height: 36px;
      font-weight: 800;
      color: var(--text);
      margin: 0 0 16px 0;
    }

    @media (min-width: 768px) {
      .topic-title {
        font-size: 34px;
        line-height: 42px;
      }
    }

    .topic-stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .stat-pill {
      font-size: 12px;
      padding: 4px 10px;
      background-color: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm, 6px);
      color: var(--text-muted);
    }

    .stat-pill strong {
      color: var(--text);
    }

    .header-action-col {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    @media (min-width: 900px) {
      .header-action-col {
        align-items: flex-end;
      }
    }

    /* Layout 2 columnas */
    .topic-content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      align-items: start;
    }

    @media (min-width: 1024px) {
      .topic-content-grid {
        grid-template-columns: 1fr 300px;
      }
    }

    /* Bloques de sección */
    .section-block {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-2xl, 16px);
      padding: 24px;
      margin-bottom: 28px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }

    .section-icon {
      font-size: 18px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    /* Subtemas */
    .subtopics-cards-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .subtopic-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 18px;
      background-color: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl, 12px);
      transition: all 0.15s ease;
    }

    .subtopic-card:hover {
      border-color: var(--border-hover, var(--border));
      background-color: var(--surface-raised);
    }

    .subtopic-card-left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1 1 auto;
      min-width: 0;
    }

    .subtopic-code {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      min-width: 52px;
      height: 28px;
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-text);
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm, 6px);
      text-align: center;
    }

    .subtopic-card-body {
      flex: 1 1 auto;
      min-width: 0;
    }

    .subtopic-card-title {
      font-size: 14px;
      line-height: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .subtopic-title-link {
      color: var(--text);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .subtopic-title-link:hover {
      color: var(--primary-text);
    }

    .subtopic-card-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text-subtle);
    }

    .subtopic-card-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    /* Prácticas */
    .practices-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    @media (min-width: 640px) {
      .practices-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .global-lab-card {
      padding: 4px;
    }

    .trophy-badge {
      font-size: 11px;
      color: var(--warning-text);
    }

    .lab-item-card {
      padding: 16px;
      background-color: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl, 12px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .lab-item-link {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-text);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .lab-item-link:hover {
      text-decoration: underline;
    }

    /* Quiz */
    .quiz-banner-card {
      padding: 20px;
      background-color: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl, 12px);
    }

    /* Resumen */
    .summary-card {
      padding: 18px;
      background-color: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl, 12px);
    }

    .summary-link {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-text);
      text-decoration: none;
    }

    .summary-link:hover {
      text-decoration: underline;
    }

    /* Barra lateral */
    .sticky-sidebar {
      position: sticky;
      top: 80px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .sidebar-box {
      padding: 20px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-2xl, 16px);
    }

    .sidebar-box-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sidebar-links-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .sidebar-link:hover {
      color: var(--primary-text);
    }

    .adjacent-nav {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .adj-link {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      gap: 2px;
      transition: opacity 0.15s ease;
    }

    .adj-link:hover {
      opacity: 0.8;
    }
  `]
})
export class TopicDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  readonly Math = Math;

  readonly manifest = this.contentService.manifest;
  readonly progress = this.progressService.progress;

  private readonly routeExamId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('examen') ?? '101')),
    { initialValue: '101' }
  );

  private readonly routeTopicId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('tema') ?? '101')),
    { initialValue: '101' }
  );

  readonly currentExamId = computed(() => {
    return this.routeExamId()?.replace('exam-', '').replace('examen-', '') ?? '101';
  });

  readonly currentTopicId = computed(() => {
    return this.routeTopicId()?.replace('tema-', '') ?? '101';
  });

  readonly allTopics = computed(() => this.manifest()?.topics ?? []);
  readonly allSubtopics = computed(() => this.manifest()?.subtopics ?? []);

  readonly currentTopic = computed(() => {
    const id = this.currentTopicId();
    return this.allTopics().find((t) => t.id === id) ?? null;
  });

  readonly topicSubtopics = computed(() => {
    const id = this.currentTopicId();
    return this.allSubtopics().filter((s) => s.topicId === id);
  });

  readonly subtopicsWithLabs = computed(() => {
    return this.topicSubtopics().filter((s) => Boolean(s.labId));
  });

  readonly totalHours = computed(() => {
    const totalMinutes = this.topicSubtopics().reduce((sum, s) => sum + s.estimatedMinutes, 0);
    return (totalMinutes / 60).toFixed(1);
  });

  readonly totalSlides = computed(() => {
    return this.topicSubtopics().reduce((sum, s) => sum + (s.slideCount ?? 0), 0);
  });

  readonly topicProgress = computed(() => {
    const topic = this.currentTopic();
    if (!topic) return 0;
    return selectTopicProgress(topic.id, this.progress(), this.allSubtopics());
  });

  readonly isTopicCompleted = computed(() => {
    return this.topicProgress() === 100;
  });

  readonly firstSubtopicId = computed(() => {
    return this.topicSubtopics()[0]?.id ?? '101.1';
  });

  readonly nextSubtopicId = computed(() => {
    const subs = this.topicSubtopics();
    if (subs.length === 0) return '101.1';
    const pending = subs.find((s) => !this.isSubtopicCompleted(s.id));
    return pending?.id ?? subs[0]?.id ?? '101.1';
  });

  readonly prevTopic = computed(() => {
    const current = this.currentTopic();
    if (!current) return null;
    const sameExam = this.allTopics().filter((t) => t.examId === current.examId);
    const index = sameExam.findIndex((t) => t.id === current.id);
    return index > 0 ? sameExam[index - 1] : null;
  });

  readonly nextTopic = computed(() => {
    const current = this.currentTopic();
    if (!current) return null;
    const sameExam = this.allTopics().filter((t) => t.examId === current.examId);
    const index = sameExam.findIndex((t) => t.id === current.id);
    return index >= 0 && index < sameExam.length - 1 ? sameExam[index + 1] : null;
  });

  async ngOnInit(): Promise<void> {
    if (!this.manifest()) {
      try {
        await this.contentService.getManifest();
      } catch {
        // Manejado en el servicio
      }
    }
  }

  isSubtopicCompleted(subtopicId: string): boolean {
    const progress = selectSubtopicProgress(subtopicId, this.progress(), 0);
    return progress === 100;
  }
}
