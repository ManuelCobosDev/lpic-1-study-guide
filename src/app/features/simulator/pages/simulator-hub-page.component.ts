import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../core/services/exam.service';
import { ContentService } from '../../../core/services/content.service';
import { Topic } from '../../../core/models/curriculum.model';
import { ExamAttempt } from '../../../core/models/attempt.model';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { DialogComponent } from '../../../shared/ui/dialog/dialog.component';

@Component({
  selector: 'app-simulator-hub-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    ChipComponent,
    DialogComponent
  ],
  templateUrl: './simulator-hub-page.component.html',
  styleUrls: ['./simulator-hub-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulatorHubPageComponent implements OnInit {
  private readonly router = inject(Router);
  readonly examService = inject(ExamService);
  private readonly contentService = inject(ContentService);

  readonly topics = signal<Topic[]>([]);
  readonly selectedExam = signal<'101' | '102'>('101');
  readonly isStartingExam = signal<boolean>(false);
  readonly onlyVerifiedQuestions = signal<boolean>(false);
  readonly verifiedStats = signal<{
    total: number;
    verified: number;
    pending: number;
    hasPending: boolean;
  }>({ total: 0, verified: 0, pending: 0, hasPending: false });

  // Modal de confirmación para eliminar intento o descartar sesión activa
  readonly isConfirmModalOpen = signal<boolean>(false);
  readonly attemptToDelete = signal<ExamAttempt | null>(null);
  readonly isDiscardingActiveSession = signal<boolean>(false);

  readonly hasActiveSession = this.examService.hasActiveSession;
  readonly activeSession = this.examService.activeSession;
  readonly recentAttempts = computed(() => this.examService.getRecentAttempts(5));

  readonly activeSessionRemainingTime = computed(() => {
    const s = this.examService.getRemainingSeconds();
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  });

  /**
   * Temas filtrados correspondientes al examen seleccionado (101-104 o 105-110).
   */
  readonly filteredTopics = computed<Topic[]>(() => {
    const exam = this.selectedExam();
    return this.topics().filter((t) =>
      exam === '102' ? parseInt(t.id, 10) >= 105 : parseInt(t.id, 10) <= 104
    );
  });

  async ngOnInit(): Promise<void> {
    this.selectedExam.set(this.examService.selectedExamId());
    try {
      const manifest = await this.contentService.getManifest();
      this.topics.set(manifest.topics);
      await this.refreshVerifiedStats();
    } catch {
      this.topics.set([]);
    }
  }

  async selectExam(examId: '101' | '102'): Promise<void> {
    this.selectedExam.set(examId);
    this.examService.setSelectedExamId(examId);
    await this.refreshVerifiedStats();
  }

  private async refreshVerifiedStats(): Promise<void> {
    const stats = await this.examService.getVerifiedQuestionsStats(this.selectedExam());
    this.verifiedStats.set(stats);
  }

  async startTimedExam(): Promise<void> {
    if (this.isStartingExam()) return;
    this.isStartingExam.set(true);
    const exam = this.selectedExam();
    try {
      await this.examService.startExam({
        mode: 'exam',
        examId: exam,
        onlyVerified: this.onlyVerifiedQuestions()
      });
      await this.router.navigate(['/simulador/examen']);
    } finally {
      this.isStartingExam.set(false);
    }
  }

  resumeActiveExam(): void {
    this.router.navigate(['/simulador/examen']);
  }

  abandonActiveExam(): void {
    this.examService.abandonCurrentExam();
  }

  confirmAbandonActiveExam(): void {
    this.isDiscardingActiveSession.set(true);
    this.attemptToDelete.set(null);
    this.isConfirmModalOpen.set(true);
  }

  confirmDeleteAttempt(attempt: ExamAttempt): void {
    this.isDiscardingActiveSession.set(false);
    this.attemptToDelete.set(attempt);
    this.isConfirmModalOpen.set(true);
  }

  executeDelete(): void {
    if (this.isDiscardingActiveSession()) {
      this.abandonActiveExam();
    } else if (this.attemptToDelete()) {
      this.examService.deleteAttempt(this.attemptToDelete()!.id);
    }
    this.closeModal();
  }

  closeModal(): void {
    this.isConfirmModalOpen.set(false);
    this.attemptToDelete.set(null);
    this.isDiscardingActiveSession.set(false);
  }

  goToPractice(topicId?: string): void {
    const exam = this.selectedExam();
    if (topicId) {
      this.router.navigate(['/simulador/practica'], {
        queryParams: { exam, tema: topicId }
      });
    } else {
      this.router.navigate(['/simulador/practica'], {
        queryParams: { exam }
      });
    }
  }
}
