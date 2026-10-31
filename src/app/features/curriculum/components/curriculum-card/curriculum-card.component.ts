import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subtopic, Topic } from '../../../../core/models/curriculum.model';
import { UserProgress } from '../../../../core/models/progress.model';
import { selectSubtopicProgress, selectTopicProgress } from '../../../../core/selectors/progress.selectors';
import { BadgeComponent, ButtonComponent, WeightMeterComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-curriculum-card',
  standalone: true,
  imports: [
    RouterLink,
    WeightMeterComponent,
    BadgeComponent,
    ButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="curriculum-card"
      [class.card-planned]="isPlanned()"
      [attr.aria-label]="'Tema ' + topic().id + ': ' + topic().title"
    >
      <!-- Cabecera de la Tarjeta -->
      <header class="card-header">
        <div class="header-top-row">
          <span class="topic-eyebrow font-mono">TEMA {{ topic().id }}</span>
          @if (isCompleted()) {
            <app-badge variant="success" [dot]="true">Completado</app-badge>
          } @else if (isPlanned()) {
            <span class="text-xs font-mono text-[var(--text-subtle)]">Planificado</span>
          }
        </div>

        <h3 class="topic-title">
          <a [routerLink]="['/temario', topic().examId, topic().id]" class="title-link">
            {{ topic().title }}
          </a>
        </h3>

        <div class="topic-meta-row">
          <span class="meta-item">{{ topicSubtopics().length }} subtemas</span>
          <span class="meta-dot">·</span>
          <span class="meta-item">~{{ totalHours() }} h</span>
          <span class="meta-dot">·</span>
          <span class="meta-item">{{ totalSlides() }} diapositivas</span>
        </div>

        <div class="weight-row">
          <app-weight-meter [weight]="topic().weight" />
        </div>
      </header>

      <!-- Lista de Subtemas (filas de 52 px) -->
      <div class="subtopics-list" role="list">
        @for (sub of topicSubtopics(); track sub.id) {
          <div class="subtopic-row" role="listitem">
            <a
              [routerLink]="isPlanned() ? null : ['/estudiar', sub.id]"
              class="subtopic-link"
              [class.pointer-events-none]="isPlanned()"
              [attr.aria-label]="sub.id + ' ' + sub.title"
            >
              <!-- Código mono en chip fijo de 52 px -->
              <span class="subtopic-code-chip font-mono">
                {{ sub.id }}
              </span>

              <!-- Título a máx 2 líneas sin truncar con elipsis -->
              <span class="subtopic-title">
                {{ sub.title }}
              </span>

              <!-- Metadatos del subtema -->
              <span class="subtopic-meta font-mono">
                {{ sub.estimatedMinutes }}m · {{ sub.slideCount ?? 0 }} slides
              </span>
            </a>

            <!-- Acciones a la derecha: Botón Lab y Check de completitud -->
            <div class="subtopic-actions">
              @if (sub.labId && !isPlanned()) {
                <a
                  [routerLink]="['/laboratorios', sub.labId]"
                  class="lab-btn"
                  title="Práctica de consola de este subtema"
                  aria-label="Abrir práctica del subtema"
                >
                  Lab
                </a>
              }

              <!-- Check verde SOLO si el subtema está realmente completado -->
              @if (isSubtopicCompleted(sub.id)) {
                <span class="check-icon" aria-label="Completado" title="Subtema completado">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              } @else {
                <span class="empty-check-space" aria-hidden="true"></span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Pie Fijo con Práctica Global del Tema -->
      <footer class="card-footer">
        @if (isPlanned()) {
          <div class="planned-footer-note">
            <span class="text-xs text-[var(--text-muted)] font-mono">Práctica global planificada para Fase 11</span>
          </div>
        } @else {
          <a
            [routerLink]="['/temario', topic().examId, topic().id]"
            [queryParams]="{ seccion: 'practicas' }"
            class="global-practice-btn"
            title="Práctica global y retos integradores del tema"
          >
            <span class="trophy-icon" aria-hidden="true">🏆</span>
            <span class="btn-text">Práctica global del Tema {{ topic().id }} · Misión integradora →</span>
          </a>
        }
      </footer>
    </article>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .curriculum-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      border-radius: var(--radius-2xl, 16px);
      background-color: var(--surface);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .curriculum-card:hover {
      border-color: var(--border-hover, var(--border));
    }

    .card-planned {
      border-style: dashed;
      border-color: var(--border);
      background-color: var(--surface-sunken);
    }

    /* Cabecera */
    .card-header {
      padding: 24px;
      border-bottom: 1px solid var(--border);
      background-color: var(--surface);
    }

    .card-planned .card-header {
      background-color: transparent;
    }

    .header-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .topic-eyebrow {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-text);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .topic-title {
      font-size: 18px;
      line-height: 24px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 10px 0;
    }

    .title-link {
      color: inherit;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .title-link:hover {
      color: var(--primary-text);
    }

    .topic-meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 14px;
    }

    .meta-dot {
      color: var(--text-subtle);
    }

    .weight-row {
      margin-top: 4px;
    }

    /* Lista de subtemas */
    .subtopics-list {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      background-color: var(--surface);
    }

    .card-planned .subtopics-list {
      background-color: transparent;
    }

    .subtopic-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 52px;
      padding: 8px 16px;
      gap: 12px;
      border-bottom: 1px solid var(--border);
      transition: background-color 0.15s ease;
    }

    .subtopic-row:last-child {
      border-bottom: none;
    }

    .subtopic-row:hover {
      background-color: var(--surface-raised);
    }

    .card-planned .subtopic-row:hover {
      background-color: transparent;
    }

    .subtopic-link {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1 1 auto;
      min-width: 0;
      text-decoration: none;
      color: inherit;
    }

    /* Chip de código mono fijo de 52 px */
    .subtopic-code-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      min-width: 52px;
      height: 26px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      background-color: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm, 6px);
      text-align: center;
    }

    /* Título a máx 2 líneas sin elipsis (no truncado según spec) */
    .subtopic-title {
      font-size: 13px;
      line-height: 18px;
      font-weight: 500;
      color: var(--text);
      flex: 1 1 auto;
      min-width: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: normal;
      overflow-wrap: break-word;
    }

    .subtopic-link:hover .subtopic-title {
      color: var(--primary-text);
    }

    .subtopic-meta {
      font-size: 11px;
      color: var(--text-subtle);
      white-space: nowrap;
      margin-left: 8px;
    }

    @media (max-width: 640px) {
      .subtopic-meta {
        display: none;
      }
    }

    /* Acciones */
    .subtopic-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .lab-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-text);
      background-color: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-md, 8px);
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .lab-btn:hover {
      background-color: var(--surface-sunken);
      border-color: var(--primary);
    }

    .check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--success-text);
    }

    .empty-check-space {
      display: inline-block;
      width: 24px;
      height: 24px;
    }

    /* Pie Fijo */
    .card-footer {
      padding: 12px 16px;
      background-color: var(--surface-sunken);
      border-top: 1px solid var(--border);
      margin-top: auto;
    }

    .global-practice-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md, 8px);
      text-decoration: none;
      text-align: center;
      transition: all 0.15s ease;
    }

    .global-practice-btn:hover {
      border-color: var(--warning-text);
      background-color: var(--surface-raised);
    }

    .trophy-icon {
      font-size: 14px;
      line-height: 1;
    }

    .planned-footer-note {
      text-align: center;
      padding: 8px 0;
    }
  `]
})
export class CurriculumCardComponent {
  readonly topic = input.required<Topic>();
  readonly subtopics = input.required<Subtopic[]>();
  readonly progress = input.required<UserProgress>();
  readonly isPlanned = input<boolean>(false);

  readonly topicSubtopics = computed(() => {
    return this.subtopics().filter((s) => s.topicId === this.topic().id);
  });

  readonly progressPercentage = computed(() => {
    return selectTopicProgress(this.topic().id, this.progress(), this.subtopics());
  });

  readonly isCompleted = computed(() => {
    return this.progressPercentage() === 100;
  });

  readonly totalHours = computed(() => {
    const totalMinutes = this.topicSubtopics().reduce((sum, s) => sum + s.estimatedMinutes, 0);
    return (totalMinutes / 60).toFixed(1);
  });

  readonly totalSlides = computed(() => {
    return this.topicSubtopics().reduce((sum, s) => sum + (s.slideCount ?? 0), 0);
  });

  isSubtopicCompleted(subtopicId: string): boolean {
    const subProgress = selectSubtopicProgress(subtopicId, this.progress(), 0);
    return subProgress === 100;
  }
}

