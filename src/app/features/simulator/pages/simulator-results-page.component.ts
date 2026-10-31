import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExamService } from '../../../core/services/exam.service';
import { ContentService } from '../../../core/services/content.service';
import { ExamAttempt, QuestionAnswer } from '../../../core/models/attempt.model';
import { Question } from '../../../core/models/question.model';
import { Topic } from '../../../core/models/curriculum.model';
import { isAnswerCorrect } from '../../../core/engines/scoring/scoring.engine';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

export type ReviewFilter = 'all' | 'failed' | 'flagged';

@Component({
  selector: 'app-simulator-results-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent
  ],
  templateUrl: './simulator-results-page.component.html',
  styleUrls: ['./simulator-results-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulatorResultsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly examService = inject(ExamService);
  private readonly contentService = inject(ContentService);

  readonly attempt = signal<ExamAttempt | undefined>(undefined);
  readonly topicsMap = signal<Record<string, Topic>>({});
  readonly reviewFilter = signal<ReviewFilter>('all');
  readonly expandedQuestions = signal<Record<string, boolean>>({});

  /**
   * Puntuación oficial del intento (200 - 800)
   */
  readonly score = computed<number>(() => {
    return this.attempt()?.score ?? 200;
  });

  /**
   * Si el examen ha sido aprobado (>= 500)
   */
  readonly passed = computed<boolean>(() => {
    return Boolean(this.attempt()?.passed);
  });

  /**
   * Tiempo total invertido en formato minutos:segundos
   */
  readonly timeSpentFormatted = computed<string>(() => {
    const att = this.attempt();
    if (!att) return '00:00';
    const spentSeconds = Math.max(0, att.durationSeconds - att.timeRemainingSeconds);
    const mm = Math.floor(spentSeconds / 60).toString().padStart(2, '0');
    const ss = (spentSeconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  });

  /**
   * Porcentaje visual en base a la escala LPI (200 = 0%, 800 = 100%)
   */
  readonly scorePercentage = computed<number>(() => {
    const s = this.score();
    return Math.max(0, Math.min(100, Math.round(((s - 200) / 600) * 100)));
  });

  /**
   * Lista de preguntas asociadas al intento
   */
  readonly questions = computed<Question[]>(() => {
    return this.attempt()?.questions ?? [];
  });

  /**
   * Mapa de respuestas del usuario
   */
  readonly answers = computed<Record<string, QuestionAnswer>>(() => {
    return this.attempt()?.answers ?? {};
  });

  /**
   * Comprueba si una pregunta específica fue respondida correctamente
   */
  isQuestionCorrect(q: Question): boolean {
    const ans = this.answers()[q.id];
    return isAnswerCorrect(q, ans);
  }

  /**
   * Preguntas filtradas para el acordeón de revisión
   */
  readonly filteredQuestions = computed<Question[]>(() => {
    const list = this.questions();
    const filter = this.reviewFilter();
    const answersMap = this.answers();

    if (filter === 'failed') {
      return list.filter((q) => !this.isQuestionCorrect(q));
    }
    if (filter === 'flagged') {
      return list.filter((q) => Boolean(answersMap[q.id]?.flagged));
    }
    return list;
  });

  /**
   * Desglose de puntuaciones por tema ordenado
   */
  readonly topicScoresList = computed<
    {
      topicId: string;
      topicTitle: string;
      correct: number;
      total: number;
      percentage: number;
      isWeak: boolean;
    }[]
  >(() => {
    const att = this.attempt();
    if (!att || !att.topicScores) return [];

    const map = this.topicsMap();
    return Object.entries(att.topicScores).map(([topicId, stats]) => ({
      topicId,
      topicTitle: map[topicId]?.title ?? `Tema ${topicId}`,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.percentage,
      isWeak: stats.percentage < 70
    }));
  });

  /**
   * Identificadores de temas débiles (< 70% de acierto)
   */
  readonly weakTopicIds = computed<string[]>(() => {
    return this.topicScoresList()
      .filter((t) => t.isWeak)
      .map((t) => t.topicId);
  });

  async ngOnInit(): Promise<void> {
    try {
      const manifest = await this.contentService.getManifest();
      const map: Record<string, Topic> = {};
      for (const t of manifest.topics) {
        map[t.id] = t;
      }
      this.topicsMap.set(map);
    } catch {
      // Ignorar
    }

    // Leer id desde query params ?id=...
    const attemptId = this.route.snapshot.queryParamMap.get('id');
    if (attemptId) {
      const found = this.examService.getAttemptById(attemptId);
      if (found) {
        this.attempt.set(found);
        return;
      }
    }

    // Fallback al intento más reciente del historial
    const recent = this.examService.getRecentAttempts(1);
    if (recent.length > 0) {
      this.attempt.set(recent[0]);
    }
  }

  setReviewFilter(filter: ReviewFilter): void {
    this.reviewFilter.set(filter);
  }

  toggleAccordion(questionId: string): void {
    this.expandedQuestions.update((m) => ({
      ...m,
      [questionId]: !m[questionId]
    }));
  }

  isAccordionExpanded(questionId: string): boolean {
    return Boolean(this.expandedQuestions()[questionId]);
  }

  getUserAnswerText(q: Question): string {
    const ans = this.answers()[q.id];
    if (!ans) return 'Sin responder';

    if (q.type === 'fill') {
      return ans.textAnswer && ans.textAnswer.trim().length > 0
        ? ans.textAnswer
        : 'Sin responder';
    }

    if (ans.selectedOptions && ans.selectedOptions.length > 0) {
      return ans.selectedOptions
        .map((optId) => {
          const opt = q.options?.find((o) => o.id === optId);
          return opt ? `${opt.id.toUpperCase()}) ${opt.text}` : optId.toUpperCase();
        })
        .join(', ');
    }

    return 'Sin responder';
  }

  getCorrectAnswerText(q: Question): string {
    if (q.type === 'fill') {
      return (q.acceptedAnswers ?? []).join(' | ');
    }

    return (q.correct ?? [])
      .map((optId) => {
        const opt = q.options?.find((o) => o.id === optId);
        return opt ? `${opt.id.toUpperCase()}) ${opt.text}` : optId.toUpperCase();
      })
      .join(', ');
  }

  async repeatExam(): Promise<void> {
    await this.examService.startExam({ mode: 'exam' });
    await this.router.navigate(['/simulador/examen']);
  }

  goToPracticeWeakTopics(): void {
    const weak = this.weakTopicIds();
    if (weak.length > 0) {
      this.router.navigate(['/simulador/practica'], {
        queryParams: { tema: weak[0] }
      });
    } else {
      this.router.navigate(['/simulador/practica']);
    }
  }
}

