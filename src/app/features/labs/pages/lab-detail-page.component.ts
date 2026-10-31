import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge.component';
import { CalloutComponent } from '../../../shared/ui/callout/callout.component';
import { CodeBlockComponent } from '../../../shared/ui/code-block/code-block.component';
import { ProgressBarComponent } from '../../../shared/ui/progress-bar/progress-bar.component';
import { LabStepperComponent } from '../components/lab-stepper/lab-stepper.component';
import { LabsService } from '../../../core/services/labs.service';
import { Lab, LabStep } from '../../../core/models/lab.model';

@Component({
  selector: 'app-lab-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ContainerComponent,
    ButtonComponent,
    BadgeComponent,
    CalloutComponent,
    CodeBlockComponent,
    ProgressBarComponent,
    LabStepperComponent
  ],
  templateUrl: './lab-detail-page.component.html',
  styleUrls: ['./lab-detail-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly labsService = inject(LabsService);

  readonly lab = signal<Lab | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly currentStepIndex = signal<number>(0);
  readonly showVmGuideModal = signal<boolean>(false);
  readonly showSolutionModal = signal<boolean>(false);
  readonly showSuccessModal = signal<boolean>(false);
  readonly showResetConfirmModal = signal<boolean>(false);
  readonly copiedCommandFeedback = signal<boolean>(false);

  // Estados computados reactivos al store de LabsService
  readonly completedSteps = computed<number[]>(() => {
    this.labsService.state(); // reactividad
    const currentLab = this.lab();
    if (!currentLab) return [];
    return this.labsService.getCompletedSteps(currentLab.id);
  });

  readonly isDebianVmNoticeDismissed = computed(() =>
    this.labsService.isDebianVmNoticeDismissed()
  );

  readonly totalSteps = computed<number>(() => this.lab()?.steps.length ?? 0);

  readonly currentStep = computed<LabStep | null>(() => {
    const steps = this.lab()?.steps ?? [];
    const idx = this.currentStepIndex();
    return steps[idx] ?? null;
  });

  readonly isCurrentStepCompleted = computed<boolean>(() => {
    const step = this.currentStep();
    if (!step) return false;
    return this.completedSteps().includes(step.stepNumber);
  });

  readonly progressPercent = computed<number>(() => {
    const total = this.totalSteps();
    if (total === 0) return 0;
    return Math.round((this.completedSteps().length / total) * 100);
  });

  readonly isAllStepsCompleted = computed<boolean>(() => {
    const total = this.totalSteps();
    return total > 0 && this.completedSteps().length === total;
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadLab(id);
      }
    });
  }

  async loadLab(id: string): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.labsService.getLab(id);
      this.lab.set(data);

      // Si hay pasos completados, posicionar en el primer paso incompleto
      const completed = this.labsService.getCompletedSteps(data.id);
      const firstIncompleteIdx = data.steps.findIndex(
        (s) => !completed.includes(s.stepNumber)
      );
      if (firstIncompleteIdx >= 0) {
        this.currentStepIndex.set(firstIncompleteIdx);
      } else {
        this.currentStepIndex.set(0);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : `No se pudo cargar la práctica ${id}`;
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  onStepSelect(stepNumber: number): void {
    const steps = this.lab()?.steps ?? [];
    const idx = steps.findIndex((s) => s.stepNumber === stepNumber);
    if (idx >= 0) {
      this.currentStepIndex.set(idx);
    }
  }

  onStepToggle(stepNumber: number): void {
    const currentLab = this.lab();
    if (!currentLab) return;

    const wasCompleted = this.labsService.isStepCompleted(currentLab.id, stepNumber);
    this.labsService.toggleStep(currentLab.id, stepNumber, currentLab.steps.length);

    // Si completó el paso y ahora todos los pasos están listos, abrir modal de felicitación
    const updatedCompleted = this.labsService.getCompletedSteps(currentLab.id);
    if (!wasCompleted && updatedCompleted.length === currentLab.steps.length) {
      this.showSuccessModal.set(true);
    }
  }

  toggleCurrentStep(): void {
    const step = this.currentStep();
    if (step) {
      this.onStepToggle(step.stepNumber);
    }
  }

  goToNextStep(): void {
    const steps = this.lab()?.steps ?? [];
    const nextIdx = this.currentStepIndex() + 1;
    if (nextIdx < steps.length) {
      this.currentStepIndex.set(nextIdx);
    }
  }

  goToPrevStep(): void {
    const prevIdx = this.currentStepIndex() - 1;
    if (prevIdx >= 0) {
      this.currentStepIndex.set(prevIdx);
    }
  }

  async copyCommandToClipboard(cmd: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cmd);
      }
      this.copiedCommandFeedback.set(true);
      setTimeout(() => {
        this.copiedCommandFeedback.set(false);
      }, 2000);
    } catch {
      // Fallback si no hay permisos de portapapeles
      this.copiedCommandFeedback.set(true);
      setTimeout(() => {
        this.copiedCommandFeedback.set(false);
      }, 2000);
    }
  }

  dismissVmNotice(): void {
    this.labsService.dismissVmNotice();
  }

  openVmGuideModal(): void {
    this.showVmGuideModal.set(true);
  }

  closeVmGuideModal(): void {
    this.showVmGuideModal.set(false);
  }

  openSolutionModal(): void {
    this.showSolutionModal.set(true);
  }

  closeSolutionModal(): void {
    this.showSolutionModal.set(false);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
  }

  requestResetLab(): void {
    this.showResetConfirmModal.set(true);
  }

  cancelResetLab(): void {
    this.showResetConfirmModal.set(false);
  }

  confirmResetLab(): void {
    const currentLab = this.lab();
    if (currentLab) {
      this.labsService.resetLab(currentLab.id);
      this.currentStepIndex.set(0);
      this.showResetConfirmModal.set(false);
    }
  }

  getDifficultyBadgeVariant(difficulty: string): BadgeVariant {
    switch (difficulty) {
      case 'basic':
        return 'success';
      case 'intermediate':
        return 'primary';
      case 'advanced':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'basic':
        return 'Básica';
      case 'intermediate':
        return 'Intermedia';
      case 'advanced':
        return 'Avanzada';
      default:
        return difficulty;
    }
  }
}

