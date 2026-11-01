import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ExamService } from '../../../core/services/exam.service';
import { FlashcardsService } from '../../../core/services/flashcards.service';
import { ClockService } from '../../../core/services/clock.service';
import { CurriculumManifest, Topic, Subtopic } from '../../../core/models/curriculum.model';
import { ActivityHeatmapComponent } from '../components/activity-heatmap/activity-heatmap.component';
import { ScoreChartComponent } from '../components/score-chart/score-chart.component';

export interface TopicProgressView {
  id: string;
  number: number;
  title: string;
  exam: string;
  weight: number;
  completedSubtopics: number;
  totalSubtopics: number;
  percentage: number;
  status: 'completed' | 'in_progress' | 'pending';
  nextSubtopicId?: string;
}

export interface WeakTopicView {
  topicId: string;
  title: string;
  accuracy: number;
  exam: string;
  reason: string;
}

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ActivityHeatmapComponent,
    ScoreChartComponent
  ],
  templateUrl: './progress-page.component.html',
  styleUrls: ['./progress-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressPageComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);
  private readonly examService = inject(ExamService);
  private readonly flashcardsService = inject(FlashcardsService);
  private readonly clock = inject(ClockService);

  readonly manifest = signal<CurriculumManifest | null>(null);
  readonly userProgress = this.progressService.progress;
  readonly examHistory = this.examService.history;
  readonly flashcardsProgress = this.flashcardsService.progress;

  async ngOnInit(): Promise<void> {
    const m = await this.contentService.getManifest();
    this.manifest.set(m);
  }

  // --- STAT CARDS ---
  readonly lessonsStat = computed(() => {
    const m = this.manifest();
    if (!m) return { completed: 0, total: 0, percentage: 0 };
    const total = m.subtopics.length;
    const completed = Object.keys(this.userProgress().completedSubtopics).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  });

  readonly examsStat = computed(() => {
    const history = this.examHistory().filter((a) => a.score !== undefined);
    const count = history.length;
    if (count === 0) {
      return { count: 0, avgScore: 0, passRate: 0 };
    }
    const sumScore = history.reduce((acc, cur) => acc + (cur.score ?? 0), 0);
    const passedCount = history.filter((a) => a.passed).length;
    return {
      count,
      avgScore: Math.round(sumScore / count),
      passRate: Math.round((passedCount / count) * 100)
    };
  });

  readonly flashcardsStat = computed(() => {
    const progressMap = this.flashcardsProgress();
    const values = Object.values(progressMap);
    const total = values.length;
    const mastered = values.filter((c) => c.box === 5).length;
    return { mastered, total };
  });

  readonly streakStat = computed(() => {
    const dailyMap = this.activityDatesMap();
    const sortedDates = Object.keys(dailyMap).sort().reverse();
    if (sortedDates.length === 0) {
      return { current: 0, longest: 0 };
    }

    const todayStr = this.clock.nowDate().toISOString().slice(0, 10);
    const yesterday = new Date(this.clock.now() - 86400000).toISOString().slice(0, 10);

    let current = 0;
    let checkDate = new Date(this.clock.now());

    // Si hoy no hay actividad pero ayer sí, la racha sigue viva
    if (!dailyMap[todayStr]) {
      if (dailyMap[yesterday]) {
        checkDate = new Date(this.clock.now() - 86400000);
      } else {
        checkDate = new Date(0); // Racha rota
      }
    }

    if (checkDate.getTime() > 0) {
      while (true) {
        const dStr = checkDate.toISOString().slice(0, 10);
        if (dailyMap[dStr]) {
          current++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    // Calcular racha máxima histórica
    let longest = 0;
    let tempStreak = 0;
    const allDatesAsc = Object.keys(dailyMap).sort();
    for (let i = 0; i < allDatesAsc.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevStr = allDatesAsc[i - 1];
        const curStr = allDatesAsc[i];
        if (prevStr && curStr) {
          const prev = new Date(prevStr).getTime();
          const cur = new Date(curStr).getTime();
          const diffDays = Math.round((cur - prev) / 86400000);
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
      }
      if (tempStreak > longest) {
        longest = tempStreak;
      }
    }

    return { current, longest };
  });

  // --- HEATMAP ACTIVITIES ---
  readonly activityDatesMap = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {};

    const addDate = (isoStr: string | null | undefined) => {
      if (!isoStr) return;
      const day = isoStr.slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    };

    // Lecciones completadas
    const p = this.userProgress();
    Object.values(p.completedSubtopics).forEach(addDate);
    Object.values(p.completedLabs).forEach(addDate);

    // Intentos de examen
    this.examHistory().forEach((att) => addDate(att.startedAt));

    // Flashcards
    Object.values(this.flashcardsProgress()).forEach((c) => addDate(c.lastReviewedAt));

    return counts;
  });

  // --- PROGRESS POR TEMA ---
  readonly topicProgressList = computed<TopicProgressView[]>(() => {
    const m = this.manifest();
    if (!m) return [];

    const completedMap = this.userProgress().completedSubtopics;

    return m.topics.map((t: Topic) => {
      const topicSubtopics = m.subtopics.filter((s: Subtopic) => s.topicId === t.id);
      const total = topicSubtopics.length;
      const completedCount = topicSubtopics.filter((s: Subtopic) => !!completedMap[s.id]).length;
      const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      let status: 'completed' | 'in_progress' | 'pending' = 'pending';
      if (percentage === 100) {
        status = 'completed';
      } else if (completedCount > 0) {
        status = 'in_progress';
      }

      const nextSub = topicSubtopics.find((s: Subtopic) => !completedMap[s.id]);
      const topicNum = parseInt(t.id.replace(/\D/g, ''), 10) || 101;

      return {
        id: t.id,
        number: topicNum,
        title: t.title,
        exam: t.examId,
        weight: t.weight,
        completedSubtopics: completedCount,
        totalSubtopics: total,
        percentage,
        status,
        nextSubtopicId: nextSub?.id
      };
    });
  });

  // --- TEMAS DÉBILES (< 70% o lagunas detectadas en simulacros) ---
  readonly weakTopics = computed<WeakTopicView[]>(() => {
    const m = this.manifest();
    if (!m) return [];

    const attempts = this.examHistory().filter((a) => a.score !== undefined);
    const weakList: WeakTopicView[] = [];

    if (attempts.length > 0) {
      // Rendimiento acumulado por tema desde topicScores de exámenes
      const topicStats: Record<string, { correct: number; total: number }> = {};
      for (const att of attempts) {
        if (!att.topicScores) continue;
        for (const [topicId, data] of Object.entries(att.topicScores)) {
          if (!topicStats[topicId]) {
            topicStats[topicId] = { correct: 0, total: 0 };
          }
          topicStats[topicId].correct += data.correct;
          topicStats[topicId].total += data.total;
        }
      }

      for (const [topicId, stats] of Object.entries(topicStats)) {
        if (stats.total >= 3) {
          const acc = Math.round((stats.correct / stats.total) * 100);
          if (acc < 70) {
            const topic = m.topics.find((t: Topic) => t.id === topicId);
            if (topic) {
              weakList.push({
                topicId,
                title: topic.title,
                accuracy: acc,
                exam: topic.examId,
                reason: `${acc}% de aciertos en preguntas de examen (${stats.correct}/${stats.total})`
              });
            }
          }
        }
      }
    }

    return weakList;
  });

  // --- SIGUIENTE PASO RECOMENDADO ---
  readonly nextStep = computed<{
    type: 'continue' | 'weak_review' | 'all_done';
    title: string;
    subtitle: string;
    link: string;
    actionText: string;
  }>(() => {
    const m = this.manifest();
    if (!m) {
      return {
        type: 'all_done',
        title: 'Cargando contenido...',
        subtitle: '',
        link: '/temario',
        actionText: 'Ver temario'
      };
    }

    const weak = this.weakTopics();
    if (weak.length > 0 && weak[0]) {
      const topWeak = weak[0];
      return {
        type: 'weak_review',
        title: `Reforzar ${topWeak.title}`,
        subtitle: `Tu precisión media es del ${topWeak.accuracy}%. Conviene repasar las lecciones o realizar un test específico.`,
        link: `/simulador?topic=${topWeak.topicId}`,
        actionText: 'Practicar este tema'
      };
    }

    const completedMap = this.userProgress().completedSubtopics;
    const nextSub = m.subtopics.find((s: Subtopic) => !completedMap[s.id]);

    if (nextSub) {
      return {
        type: 'continue',
        title: `${nextSub.id} · ${nextSub.title}`,
        subtitle: 'Siguiente lección del temario oficial pendiente de completar.',
        link: `/leccion/${nextSub.id}`,
        actionText: 'Continuar lección'
      };
    }

    return {
      type: 'all_done',
      title: '¡Has completado todas las lecciones!',
      subtitle: 'Pon a prueba tus conocimientos con un simulacro de examen completo cronometrado.',
      link: '/simulador',
      actionText: 'Hacer simulacro de examen'
    };
  });
}
