import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { Question } from '../../../core/models/question.model';
import { TimerBarComponent } from '../components/timer-bar/timer-bar.component';
import { QuestionCardComponent } from '../components/question-card/question-card.component';
import { QuestionNavigatorComponent } from '../components/question-navigator/question-navigator.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-simulator-exam-page',
  standalone: true,
  imports: [
    TimerBarComponent,
    QuestionCardComponent,
    QuestionNavigatorComponent,
    ButtonComponent
  ],
  templateUrl: './simulator-exam-page.component.html',
  styleUrls: ['./simulator-exam-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulatorExamPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly examService = inject(ExamService);

  readonly remainingSeconds = signal<number>(0);
  readonly isFinishDialogOpen = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  private timerIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly activeSession = this.examService.activeSession;

  readonly questions = computed<Question[]>(() => {
    return this.activeSession()?.questions ?? [];
  });

  readonly currentIndex = computed<number>(() => {
    return this.activeSession()?.currentQuestionIndex ?? 0;
  });

  readonly answers = computed(() => {
    return this.activeSession()?.answers ?? {};
  });

  readonly currentQuestion = computed<Question | undefined>(() => {
    const list = this.questions();
    const idx = this.currentIndex();
    if (idx >= 0 && idx < list.length) {
      return list[idx];
    }
    return undefined;
  });

  readonly currentAnswer = computed(() => {
    const q = this.currentQuestion();
    if (!q) return undefined;
    return this.answers()[q.id];
  });

  readonly isCurrentFlagged = computed<boolean>(() => {
    return Boolean(this.currentAnswer()?.flagged);
  });

  // Estadísticas para el diálogo modal de confirmación
  readonly answeredCount = computed<number>(() => {
    const answersMap = this.answers();
    let count = 0;
    for (const q of this.questions()) {
      const a = answersMap[q.id];
      if (a) {
        if (a.selectedOptions && a.selectedOptions.length > 0) count++;
        else if (a.textAnswer && a.textAnswer.trim().length > 0) count++;
      }
    }
    return count;
  });

  readonly unansweredCount = computed<number>(() => {
    return this.questions().length - this.answeredCount();
  });

  readonly flaggedCount = computed<number>(() => {
    const answersMap = this.answers();
    let count = 0;
    for (const q of this.questions()) {
      if (answersMap[q.id]?.flagged) count++;
    }
    return count;
  });

  async ngOnInit(): Promise<void> {
    let session = this.activeSession();
    const queryExam = this.route.snapshot.queryParamMap.get('exam');

    if (!session && queryExam) {
      const examId = queryExam === '102' ? '102' : '101';
      await this.examService.startExam({ mode: 'exam', examId });
      session = this.activeSession();
    } else if (session && queryExam) {
      const targetExam = queryExam === '102' ? '102' : '101';
      if (session.examId && session.examId !== targetExam) {
        await this.examService.startExam({ mode: 'exam', examId: targetExam });
        session = this.activeSession();
      }
    }

    if (!session) {
      // Si no hay sesión activa, intentar iniciar una o redirigir
      await this.router.navigate(['/simulador']);
      return;
    }

    // Calcular segundos restantes de inmediato
    this.updateRemainingTime();

    // Iniciar temporizador que comprueba cada segundo
    this.timerIntervalId = setInterval(() => {
      this.updateRemainingTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private updateRemainingTime(): void {
    const remaining = this.examService.getRemainingSeconds();
    this.remainingSeconds.set(remaining);

    // Si el tiempo se agota, finalizar automáticamente el examen
    if (remaining <= 0 && this.activeSession()) {
      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId);
        this.timerIntervalId = null;
      }
      this.finishExamAutomatically();
    }
  }

  handleAnswerChange(answerData: { selectedOptions?: string[]; textAnswer?: string }): void {
    const q = this.currentQuestion();
    if (!q) return;
    this.examService.answerQuestion(q.id, answerData);
  }

  handleToggleFlag(): void {
    const q = this.currentQuestion();
    if (!q) return;
    this.examService.toggleFlagQuestion(q.id);
  }

  handleSelectQuestion(index: number): void {
    this.examService.setCurrentQuestionIndex(index);
  }

  prevQuestion(): void {
    if (this.currentIndex() > 0) {
      this.examService.setCurrentQuestionIndex(this.currentIndex() - 1);
    }
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.questions().length - 1) {
      this.examService.setCurrentQuestionIndex(this.currentIndex() + 1);
    }
  }

  openFinishDialog(): void {
    this.isFinishDialogOpen.set(true);
  }

  closeFinishDialog(): void {
    this.isFinishDialogOpen.set(false);
  }

  async confirmFinishExam(): Promise<void> {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    try {
      const attempt = await this.examService.finishCurrentExam();
      this.closeFinishDialog();
      if (attempt) {
        await this.router.navigate(['/simulador/resultados'], {
          queryParams: { id: attempt.id }
        });
      } else {
        await this.router.navigate(['/simulador']);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private async finishExamAutomatically(): Promise<void> {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    try {
      const attempt = await this.examService.finishCurrentExam();
      if (attempt) {
        await this.router.navigate(['/simulador/resultados'], {
          queryParams: { id: attempt.id }
        });
      } else {
        await this.router.navigate(['/simulador']);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

