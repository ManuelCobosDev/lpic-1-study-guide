import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { ClockService } from './clock.service';
import { PersistedStore } from '../state/persisted-store';
import { UserProgress, DEFAULT_PROGRESS } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private readonly storage = inject(StorageService);
  private readonly clock = inject(ClockService);

  private readonly store = new PersistedStore<UserProgress>(this.storage, {
    key: 'progress',
    schemaVersion: 1,
    initialValue: DEFAULT_PROGRESS
  });

  readonly progress = this.store.data;

  markSubtopicCompleted(subtopicId: string): void {
    const nowIso = this.clock.nowIso();
    this.store.update((p) => ({
      ...p,
      completedSubtopics: {
        ...p.completedSubtopics,
        [subtopicId]: nowIso
      }
    }));
  }

  unmarkSubtopicCompleted(subtopicId: string): void {
    this.store.update((p) => {
      const copy = { ...p.completedSubtopics };
      delete copy[subtopicId];
      return {
        ...p,
        completedSubtopics: copy
      };
    });
  }

  recordSlideViewed(subtopicId: string, slideNumber: number): void {
    this.store.update((p) => {
      const existing = p.viewedSlides[subtopicId] ?? [];
      const updated = existing.includes(slideNumber) ? existing : [...existing, slideNumber].sort((a, b) => a - b);
      return {
        ...p,
        viewedSlides: {
          ...p.viewedSlides,
          [subtopicId]: updated
        },
        lastSlide: {
          ...p.lastSlide,
          [subtopicId]: slideNumber
        }
      };
    });
  }

  recordLastVisited(path: string, title: string): void {
    const nowIso = this.clock.nowIso();
    this.store.update((p) => ({
      ...p,
      lastVisited: {
        path,
        title,
        visitedAt: nowIso
      }
    }));
  }

  recordCheckpoint(quizId: string, passed: boolean): void {
    this.store.update((p) => ({
      ...p,
      checkpoints: {
        ...p.checkpoints,
        [quizId]: passed
      }
    }));
  }

  markLabCompleted(labId: string): void {
    const nowIso = this.clock.nowIso();
    this.store.update((p) => ({
      ...p,
      completedLabs: {
        ...p.completedLabs,
        [labId]: nowIso
      }
    }));
  }

  resetProgress(): void {
    this.store.set(DEFAULT_PROGRESS);
  }

  flush(): void {
    this.store.flush();
  }
}

