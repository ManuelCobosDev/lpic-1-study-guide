import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { selectExamProgress } from '../../../core/selectors/progress.selectors';
import { BadgeComponent, ChipComponent, ContainerComponent, ProgressRingComponent, TabsComponent } from '../../../shared/ui';
import { TabItem } from '../../../shared/ui/tabs/tabs.component';
import { CurriculumCardComponent } from '../components/curriculum-card/curriculum-card.component';

@Component({
  selector: 'app-curriculum-page',
  standalone: true,
  imports: [
    ContainerComponent,
    BadgeComponent,
    ChipComponent,
    TabsComponent,
    ProgressRingComponent,
    CurriculumCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="curriculum-page">
      <app-container>
        <!-- Cabecera del Temario -->
        <header class="page-header">
          <div class="header-badges">
            <app-badge variant="primary">CERTIFICACIÓN OFICIAL</app-badge>
            <span class="version-tag font-mono">Versión 5.0 (101-500 & 102-500)</span>
          </div>

          <h1 class="page-title">Temario Oficial LPIC-1</h1>
          <p class="page-subtitle">
            Estructura completa de objetivos de certificación del Linux Professional Institute.
            Accede a las lecciones interactivas, prácticas en terminal y preparación de exámenes.
          </p>

          <!-- Chips de Resumen Dinámicos (R6: cero cifras a mano) -->
          <div class="summary-chips-row">
            <app-chip>
              <span class="font-mono font-semibold">{{ totalTopics() }}</span>&nbsp;temas ({{ availableTopics().length }} disponibles)
            </app-chip>
            <app-chip>
              <span class="font-mono font-semibold">{{ totalSubtopics() }}</span>&nbsp;subtemas oficiales
            </app-chip>
            <app-chip>
              Peso LPI:&nbsp;<span class="font-mono font-semibold">{{ totalWeight() }}</span>
            </app-chip>
            <app-chip>
              Estimado:&nbsp;~<span class="font-mono font-semibold">{{ estimatedTotalHours() }}</span>&nbsp;horas
            </app-chip>
          </div>
        </header>

        <!-- Selector de Examen con Tabs -->
        <nav class="tabs-wrapper" aria-label="Seleccionar examen LPIC-1">
          <app-tabs
            [tabs]="examTabs"
            [activeId]="activeExamId()"
            (tabChange)="onTabChange($event)"
          />
        </nav>

        <!-- Contenido según el Examen seleccionado -->
        @if (activeExamId() === '101') {
          <section class="exam-section" aria-label="Temario del Examen 101-500">
            <!-- Barra informativa del Examen 101 -->
            <div class="exam-banner">
              <div class="exam-info-col">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-mono font-bold text-[var(--primary-text)]">EXAMEN 101-500</span>
                  <app-badge variant="success">Disponible completo</app-badge>
                </div>
                <h2 class="exam-heading">LPIC-1 Exam 101: Arquitectura, paquetes y comandos GNU/Linux</h2>
                <p class="exam-desc">
                  Cubre los cuatro primeros temas oficiales: arquitectura del sistema, instalación de Linux y gestión de paquetes,
                  comandos GNU y Unix, y dispositivos, sistemas de archivos y estándar FHS.
                </p>
              </div>

              <div class="exam-progress-col">
                <app-progress-ring
                  [value]="exam101Progress()"
                  [size]="80"
                  subtitle="Completado"
                />
              </div>
            </div>

            <!-- Cuadrícula de 2 Columnas para el Examen 101 (Grid Stretch con Misma Altura) -->
            <div class="topics-grid-101">
              @for (topic of topics101(); track topic.id) {
                <div class="grid-card-wrapper">
                  <app-curriculum-card
                    [topic]="topic"
                    [subtopics]="allSubtopics()"
                    [progress]="progress()"
                    [isPlanned]="false"
                  />
                </div>
              }
            </div>
          </section>
        } @else {
          <section class="exam-section" aria-label="Temario del Examen 102-500">
            <!-- Barra informativa del Examen 102 -->
            <div class="exam-banner exam-banner-planned">
              <div class="exam-info-col">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-mono font-bold text-[var(--text-muted)]">EXAMEN 102-500</span>
                  <app-badge variant="neutral">Planificado</app-badge>
                </div>
                <h2 class="exam-heading">LPIC-1 Exam 102: Shells, scripting, redes y seguridad</h2>
                <p class="exam-desc">
                  Cubre los seis temas restantes del LPIC-1 (Temas 105 al 110). La importación de contenidos detallados
                  está planificada para la Fase 11, pero los objetivos y la estructura ya están formalizados.
                </p>
              </div>

              <div class="exam-progress-col">
                <app-progress-ring
                  [value]="exam102Progress()"
                  [size]="80"
                  subtitle="Completado"
                />
              </div>
            </div>

            <!-- Cuadrícula de 3 Columnas para el Examen 102 (Grid Stretch con Borde Discontinuo) -->
            <div class="topics-grid-102">
              @for (topic of topics102(); track topic.id) {
                <div class="grid-card-wrapper">
                  <app-curriculum-card
                    [topic]="topic"
                    [subtopics]="allSubtopics()"
                    [progress]="progress()"
                    [isPlanned]="true"
                  />
                </div>
              }
            </div>
          </section>
        }
      </app-container>
    </div>
  `,
  styles: [`
    .curriculum-page {
      padding: 40px 0 64px 0;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .header-badges {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .version-tag {
      font-size: 12px;
      color: var(--text-muted);
    }

    .page-title {
      font-size: 32px;
      line-height: 40px;
      font-weight: 800;
      color: var(--text);
      margin: 0 0 12px 0;
    }

    @media (min-width: 768px) {
      .page-title {
        font-size: 38px;
        line-height: 46px;
      }
    }

    .page-subtitle {
      font-size: 16px;
      line-height: 26px;
      color: var(--text-muted);
      margin: 0 0 20px 0;
      max-width: 800px;
    }

    .summary-chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .tabs-wrapper {
      margin-bottom: 32px;
      border-bottom: 1px solid var(--border);
    }

    /* Banner informativo de examen */
    .exam-banner {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-2xl, 16px);
      margin-bottom: 32px;
    }

    @media (min-width: 768px) {
      .exam-banner {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .exam-banner-planned {
      border-style: dashed;
      background-color: var(--surface-sunken);
    }

    .exam-info-col {
      flex: 1 1 auto;
      max-width: 760px;
    }

    .exam-heading {
      font-size: 20px;
      line-height: 28px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 8px 0;
    }

    .exam-desc {
      font-size: 14px;
      line-height: 22px;
      color: var(--text-muted);
      margin: 0;
    }

    .exam-progress-col {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
    }

    /* Cuadrícula 2 Columnas para Examen 101 */
    .topics-grid-101 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      align-items: stretch;
    }

    @media (min-width: 1024px) {
      .topics-grid-101 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    /* Cuadrícula 3 Columnas para Examen 102 */
    .topics-grid-102 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      align-items: stretch;
    }

    @media (min-width: 768px) {
      .topics-grid-102 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1200px) {
      .topics-grid-102 {
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
export class CurriculumPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  readonly manifest = this.contentService.manifest;
  readonly progress = this.progressService.progress;

  readonly activeExamId = signal<'101' | '102'>('101');

  readonly examTabs: TabItem[] = [
    { id: '101', label: 'Examen 101-500 (Temas 101–104)' },
    { id: '102', label: 'Examen 102-500 (Temas 105–110)' }
  ];

  readonly allTopics = computed(() => this.manifest()?.topics ?? []);
  readonly allSubtopics = computed(() => this.manifest()?.subtopics ?? []);

  readonly availableTopics = computed(() => {
    return this.allTopics().filter((t) => t.examId === '101');
  });

  readonly topics101 = computed(() => {
    return this.allTopics().filter((t) => t.examId === '101');
  });

  readonly topics102 = computed(() => {
    return this.allTopics().filter((t) => t.examId === '102');
  });

  readonly totalTopics = computed(() => this.manifest()?.stats.totalTopics ?? 0);
  readonly totalSubtopics = computed(() => this.manifest()?.stats.totalSubtopics ?? 0);

  readonly totalWeight = computed(() => {
    const exams = this.manifest()?.exams ?? [];
    return exams.reduce((sum, e) => sum + e.weight, 0);
  });

  readonly estimatedTotalHours = computed(() => {
    const subs = this.allSubtopics();
    const totalMinutes = subs.reduce((sum, s) => sum + s.estimatedMinutes, 0);
    return Math.round(totalMinutes / 60);
  });

  readonly exam101Progress = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return selectExamProgress('101', this.progress(), m.topics, m.subtopics);
  });

  readonly exam102Progress = computed(() => {
    const m = this.manifest();
    if (!m) return 0;
    return selectExamProgress('102', this.progress(), m.topics, m.subtopics);
  });

  async ngOnInit(): Promise<void> {
    if (!this.manifest()) {
      try {
        await this.contentService.getManifest();
      } catch {
        // El servicio gestiona el error
      }
    }
  }

  onTabChange(tabId: string): void {
    if (tabId === '101' || tabId === '102') {
      this.activeExamId.set(tabId);
    }
  }
}

