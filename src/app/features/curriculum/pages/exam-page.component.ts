import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { selectExamProgress } from '../../../core/selectors/progress.selectors';
import { BadgeComponent, ButtonComponent, ContainerComponent, ProgressRingComponent } from '../../../shared/ui';
import { CurriculumCardComponent } from '../components/curriculum-card/curriculum-card.component';

@Component({
  selector: 'app-exam-page',
  standalone: true,
  imports: [
    RouterLink,
    ContainerComponent,
    BadgeComponent,
    ButtonComponent,
    ProgressRingComponent,
    CurriculumCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exam-page">
      <app-container>
        <!-- Navegación y Cabecera -->
        <div class="back-nav mb-4">
          <a routerLink="/temario" class="back-link">
            ← Volver a todos los exámenes
          </a>
        </div>

        @if (currentExam(); as exam) {
          <header class="exam-header" [class.header-planned]="isPlanned()">
            <div class="header-main-col">
              <div class="flex items-center gap-3 mb-2">
                <app-badge [variant]="isPlanned() ? 'neutral' : 'primary'">
                  LPIC-1 {{ exam.code }}
                </app-badge>
                <span class="status-pill" [class.status-available]="!isPlanned()">
                  {{ isPlanned() ? 'Planificado para Fase 11' : 'Disponible completo' }}
                </span>
              </div>

              <h1 class="exam-title">{{ exam.title }}</h1>
              <p class="exam-desc">{{ exam.description }}</p>

              <div class="exam-stats-row">
                <div class="stat-box">
                  <span class="stat-label">Peso Oficial</span>
                  <span class="stat-val font-mono">{{ exam.weight }} / 60</span>
                </div>
                <div class="stat-box">
                  <span class="stat-label">Temas</span>
                  <span class="stat-val font-mono">{{ examTopics().length }} temas</span>
                </div>
                <div class="stat-box">
                  <span class="stat-label">Subtemas</span>
                  <span class="stat-val font-mono">{{ examSubtopics().length }} subtemas</span>
                </div>
                <div class="stat-box">
                  <span class="stat-label">Horas Estimadas</span>
                  <span class="stat-val font-mono">~{{ totalHours() }} h</span>
                </div>
              </div>
            </div>

            <div class="header-progress-col">
              <app-progress-ring
                [value]="examProgress()"
                [size]="96"
                subtitle="Completado"
              />
            </div>
          </header>

          <!-- Cuadrícula de Temas del Examen -->
          <section class="exam-topics-section" [attr.aria-label]="'Temas del examen ' + exam.code">
            <h2 class="section-title mb-6">Temas de estudio incluidos</h2>

            <div [class]="isPlanned() ? 'topics-grid-3' : 'topics-grid-2'">
              @for (topic of examTopics(); track topic.id) {
                <div class="grid-card-wrapper">
                  <app-curriculum-card
                    [topic]="topic"
                    [subtopics]="allSubtopics()"
                    [progress]="progress()"
                    [isPlanned]="isPlanned()"
                  />
                </div>
              }
            </div>
          </section>
        } @else {
          <!-- Examen no encontrado -->
          <div class="not-found-card text-center py-16">
            <h2 class="text-2xl font-bold mb-4">Examen no encontrado</h2>
            <p class="text-[var(--text-muted)] mb-6">
              El identificador de examen especificado no corresponde a ningún examen de la certificación LPIC-1.
            </p>
            <app-button variant="primary" routerLink="/temario">
              Ver todos los exámenes del temario
            </app-button>
          </div>
        }
      </app-container>
    </div>
  `,
  styles: [`
    .exam-page {
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

    .exam-header {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 32px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-2xl, 16px);
      margin-bottom: 40px;
    }

    @media (min-width: 768px) {
      .exam-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .header-planned {
      border-style: dashed;
      background-color: var(--surface-sunken);
    }

    .header-main-col {
      flex: 1 1 auto;
      max-width: 760px;
    }

    .status-pill {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-subtle);
    }

    .status-available {
      color: var(--success-text);
    }

    .exam-title {
      font-size: 32px;
      line-height: 40px;
      font-weight: 800;
      color: var(--text);
      margin: 0 0 12px 0;
    }

    .exam-desc {
      font-size: 15px;
      line-height: 24px;
      color: var(--text-muted);
      margin: 0 0 24px 0;
    }

    .exam-stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-label {
      font-size: 11px;
      color: var(--text-subtle);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .stat-val {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
    }

    .header-progress-col {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
    }

    /* Grids */
    .topics-grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      align-items: stretch;
    }

    @media (min-width: 1024px) {
      .topics-grid-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .topics-grid-3 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      align-items: stretch;
    }

    @media (min-width: 768px) {
      .topics-grid-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1200px) {
      .topics-grid-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .grid-card-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ExamPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  readonly manifest = this.contentService.manifest;
  readonly progress = this.progressService.progress;

  private readonly routeParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('examen') ?? '101')),
    { initialValue: '101' }
  );

  readonly examId = computed(() => {
    const raw = this.routeParam();
    return raw?.replace('exam-', '').replace('examen-', '') ?? '101';
  });

  readonly currentExam = computed(() => {
    const id = this.examId();
    return this.manifest()?.exams.find((e) => e.id === id) ?? null;
  });

  readonly isPlanned = computed(() => {
    return this.currentExam()?.status === 'planned';
  });

  readonly allTopics = computed(() => this.manifest()?.topics ?? []);
  readonly allSubtopics = computed(() => this.manifest()?.subtopics ?? []);

  readonly examTopics = computed(() => {
    const id = this.examId();
    return this.allTopics().filter((t) => t.examId === id);
  });

  readonly examSubtopics = computed(() => {
    const topicIds = new Set(this.examTopics().map((t) => t.id));
    return this.allSubtopics().filter((s) => topicIds.has(s.topicId));
  });

  readonly totalHours = computed(() => {
    const subs = this.examSubtopics();
    const totalMinutes = subs.reduce((sum, s) => sum + s.estimatedMinutes, 0);
    return (totalMinutes / 60).toFixed(1);
  });

  readonly examProgress = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return selectExamProgress(this.examId(), this.progress(), m.topics, m.subtopics);
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
}

