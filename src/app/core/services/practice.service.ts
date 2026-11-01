import { Injectable, inject, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { PersistedStore } from '../state/persisted-store';
import {
  PracticeState,
  QuickQuizResult,
  DEFAULT_PRACTICE_STATE
} from '../models/practice.model';

@Injectable({
  providedIn: 'root'
})
export class PracticeService {
  private readonly storage = inject(StorageService);

  private readonly store = new PersistedStore<PracticeState>(this.storage, {
    key: 'practice_progress',
    schemaVersion: 1,
    initialValue: DEFAULT_PRACTICE_STATE
  });

  readonly state = this.store.data;
  readonly quickResults = computed(() => this.state().quick);
  readonly exerciseNotes = computed(() => this.state().exerciseNotes);
  readonly completedExercises = computed(() => this.state().completedExercises);

  getQuickQuizResult(subtopicId: string): QuickQuizResult | undefined {
    return this.state().quick[subtopicId];
  }

  recordQuickQuizResult(subtopicId: string, score: number, totalQuestions: number): void {
    const current = this.state();
    const prev = current.quick[subtopicId];
    const best = prev ? Math.max(prev.best, score) : score;
    const attempts = (prev?.attempts ?? 0) + 1;

    const newResult: QuickQuizResult = {
      best,
      last: score,
      attempts,
      totalQuestions,
      date: new Date().toISOString()
    };

    this.store.update((s) => ({
      ...s,
      quick: {
        ...s.quick,
        [subtopicId]: newResult
      }
    }));
  }

  getExerciseNote(exerciseId: string): string {
    return this.state().exerciseNotes[exerciseId] || '';
  }

  saveExerciseNote(exerciseId: string, note: string): void {
    this.store.update((s) => ({
      ...s,
      exerciseNotes: {
        ...s.exerciseNotes,
        [exerciseId]: note
      }
    }));
  }

  isExerciseCompleted(exerciseId: string): boolean {
    return !!this.state().completedExercises[exerciseId];
  }

  toggleExerciseCompleted(exerciseId: string): void {
    const current = this.isExerciseCompleted(exerciseId);
    this.store.update((s) => ({
      ...s,
      completedExercises: {
        ...s.completedExercises,
        [exerciseId]: !current
      }
    }));
  }
}

