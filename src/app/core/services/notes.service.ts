import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { PersistedStore } from '../state/persisted-store';

export type NotesRecord = Record<string, string>;

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private readonly storage = inject(StorageService);

  private readonly store = new PersistedStore<NotesRecord>(this.storage, {
    key: 'notes',
    schemaVersion: 1,
    initialValue: {},
    debounceMs: 500
  });

  readonly notes = this.store.data;

  getNote(subtopicId: string): string {
    return this.notes()[subtopicId] ?? '';
  }

  setNote(subtopicId: string, content: string): void {
    const trimmed = content.trim();
    this.store.update((prev) => {
      if (!trimmed) {
        const copy = { ...prev };
        delete copy[subtopicId];
        return copy;
      }
      return {
        ...prev,
        [subtopicId]: content
      };
    });
  }

  hasNote(subtopicId: string): boolean {
    const note = this.notes()[subtopicId];
    return typeof note === 'string' && note.trim().length > 0;
  }

  flush(): void {
    this.store.flush();
  }
}

