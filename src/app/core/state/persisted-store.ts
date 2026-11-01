import { signal, Signal, WritableSignal, Injector, effect, runInInjectionContext } from '@angular/core';
import { StorageService } from '../services/storage.service';

export interface PersistedRecord<T> {
  schemaVersion: number;
  data: T;
  updatedAt: string;
}

export interface PersistedStoreOptions<T> {
  key: string;
  schemaVersion: number;
  initialValue: T;
  migrate?: (oldState: unknown, oldVersion: number) => T;
  debounceMs?: number;
  injector?: Injector;
}

export class PersistedStore<T> {
  private readonly state: WritableSignal<T>;
  private readonly storage: StorageService;
  private readonly key: string;
  private readonly schemaVersion: number;
  private readonly debounceMs: number;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingValue: T | null = null;

  readonly data: Signal<T>;

  constructor(storage: StorageService, options: PersistedStoreOptions<T>) {
    this.storage = storage;
    this.key = options.key;
    this.schemaVersion = options.schemaVersion;
    this.debounceMs = options.debounceMs ?? 300;

    const initial = this.loadInitial(options);
    this.state = signal<T>(initial);
    this.data = this.state.asReadonly();

    // Si se proporciona un injector o estamos en un contexto de inyeccion, podemos enlazar un effect
    if (options.injector) {
      runInInjectionContext(options.injector, () => {
        effect(() => {
          const current = this.state();
          this.scheduleSave(current);
        });
      });
    }
  }

  get(): T {
    return this.state();
  }

  set(value: T): void {
    this.state.set(value);
    this.scheduleSave(value);
  }

  update(updater: (prev: T) => T): void {
    this.state.update((prev) => {
      const next = updater(prev);
      this.scheduleSave(next);
      return next;
    });
  }

  flush(): void {
    if (this.debounceTimer !== null && this.pendingValue !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      this.persist(this.pendingValue);
      this.pendingValue = null;
    }
  }

  private loadInitial(options: PersistedStoreOptions<T>): T {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) {
        return options.initialValue;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedRecord<unknown>> | unknown;

      if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed && 'data' in parsed) {
        const record = parsed as PersistedRecord<unknown>;
        if (record.schemaVersion < this.schemaVersion && options.migrate) {
          const migrated = options.migrate(record.data, record.schemaVersion);
          this.persist(migrated);
          return migrated;
        }
        return record.data as T;
      }

      // Si existian datos sin encapsular en PersistedRecord
      if (options.migrate) {
        const migrated = options.migrate(parsed, 0);
        this.persist(migrated);
        return migrated;
      }

      return (parsed as T) ?? options.initialValue;
    } catch {
      return options.initialValue;
    }
  }

  private scheduleSave(value: T): void {
    this.pendingValue = value;
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }

  private persist(value: T): void {
    const record: PersistedRecord<T> = {
      schemaVersion: this.schemaVersion,
      data: value,
      updatedAt: new Date().toISOString()
    };
    try {
      this.storage.setItem(this.key, JSON.stringify(record));
    } catch {
      // StorageService ya conmuta a fallback en memoria si falla
    }
  }
}

