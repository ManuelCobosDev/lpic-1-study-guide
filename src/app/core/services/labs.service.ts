import { Injectable, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { ContentService } from './content.service';
import { ProgressService } from './progress.service';
import { PersistedStore } from '../state/persisted-store';
import { Lab, LabStatus, LabSummary } from '../models/lab.model';

export interface LabsState {
  schemaVersion: number;
  completedSteps: Record<string, number[]>; // labId -> array de stepNumbers completados
  dismissedVmNotice: boolean;
}

export const DEFAULT_LABS_STATE: LabsState = {
  schemaVersion: 1,
  completedSteps: {},
  dismissedVmNotice: false
};

@Injectable({
  providedIn: 'root'
})
export class LabsService {
  private readonly storage = inject(StorageService);
  private readonly contentService = inject(ContentService);
  private readonly progressService = inject(ProgressService);

  private readonly store = new PersistedStore<LabsState>(this.storage, {
    key: 'labs_progress',
    schemaVersion: 1,
    initialValue: DEFAULT_LABS_STATE
  });

  readonly state = this.store.data;

  readonly isDebianVmNoticeDismissed = computed(() => this.state().dismissedVmNotice);

  async getLab(labId: string): Promise<Lab> {
    return this.contentService.getLab(labId);
  }

  async getLabsCatalog(): Promise<LabSummary[]> {
    const manifest = await this.contentService.getManifest();
    const list: LabSummary[] = [];

    for (const sub of manifest.subtopics) {
      const labId = sub.labId || `lab-${sub.id.replace('.', '-')}`;
      list.push({
        id: labId,
        subtopicId: sub.id,
        topicId: sub.topicId,
        title: `Práctica ${sub.id} — ${sub.title}`,
        estimatedMinutes: sub.estimatedMinutes || 30,
        difficulty: sub.weight >= 4 ? 'advanced' : sub.weight >= 2 ? 'intermediate' : 'basic',
        type: 'subtopic',
        stepCount: sub.id === '103.4' ? 6 : 5,
        placeholder: sub.placeholder
      });
    }

    return list;
  }

  getCompletedSteps(labId: string): number[] {
    return this.state().completedSteps[labId] ?? [];
  }

  isStepCompleted(labId: string, stepNumber: number): boolean {
    const steps = this.getCompletedSteps(labId);
    return steps.includes(stepNumber);
  }

  toggleStep(labId: string, stepNumber: number, totalSteps?: number): void {
    this.store.update((s) => {
      const current = s.completedSteps[labId] ?? [];
      const exists = current.includes(stepNumber);
      const updated = exists
        ? current.filter((num) => num !== stepNumber)
        : [...current, stepNumber].sort((a, b) => a - b);

      // Si se han completado todos los pasos requeridos, marcar en ProgressService
      if (totalSteps && updated.length >= totalSteps && !exists) {
        this.progressService.markLabCompleted(labId);
      }

      return {
        ...s,
        completedSteps: {
          ...s.completedSteps,
          [labId]: updated
        }
      };
    });
  }

  markAllStepsCompleted(labId: string, totalSteps: number): void {
    const allSteps = Array.from({ length: totalSteps }, (_, i) => i + 1);
    this.store.update((s) => ({
      ...s,
      completedSteps: {
        ...s.completedSteps,
        [labId]: allSteps
      }
    }));
    this.progressService.markLabCompleted(labId);
  }

  resetLab(labId: string): void {
    this.store.update((s) => {
      const copy = { ...s.completedSteps };
      delete copy[labId];
      return {
        ...s,
        completedSteps: copy
      };
    });
  }

  getLabStatus(labId: string, totalSteps: number): LabStatus {
    const progress = this.progressService.progress();
    if (progress.completedLabs[labId]) {
      return 'completed';
    }

    const completed = this.getCompletedSteps(labId);
    if (completed.length >= totalSteps && totalSteps > 0) {
      return 'completed';
    }
    if (completed.length > 0) {
      return 'in_progress';
    }
    return 'pending';
  }

  dismissDebianVmNotice(): void {
    this.store.update((s) => ({
      ...s,
      dismissedVmNotice: true
    }));
  }

  resetDebianVmNotice(): void {
    this.store.update((s) => ({
      ...s,
      dismissedVmNotice: false
    }));
  }

  flush(): void {
    this.store.flush();
  }
}

