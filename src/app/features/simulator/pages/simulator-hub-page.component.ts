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
import { ExamService } from '../../../core/services/exam.service';
import { ContentService } from '../../../core/services/content.service';
import { Topic } from '../../../core/models/curriculum.model';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';

@Component({
  selector: 'app-simulator-hub-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    ChipComponent
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
  readonly isStartingExam = signal<boolean>(false);

  readonly hasActiveSession = this.examService.hasActiveSession;
  readonly activeSession = this.examService.activeSession;
  readonly recentAttempts = computed(() => this.examService.getRecentAttempts(5));

  readonly activeSessionRemainingTime = computed(() => {
    const s = this.examService.getRemainingSeconds();
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  });

  async ngOnInit(): Promise<void> {
    try {
      const manifest = await this.contentService.getManifest();
      this.topics.set(manifest.topics);
    } catch {
      this.topics.set([]);
    }
  }

  async startTimedExam(): Promise<void> {
    if (this.isStartingExam()) return;
    this.isStartingExam.set(true);
    try {
      await this.examService.startExam({ mode: 'exam' });
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

  goToPractice(topicId?: string): void {
    if (topicId) {
      this.router.navigate(['/simulador/practica'], { queryParams: { tema: topicId } });
    } else {
      this.router.navigate(['/simulador/practica']);
    }
  }
}

