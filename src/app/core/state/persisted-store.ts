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
  private static readonly activeStores = new Set<PersistedStore<unknown>>();

  private readonly state: WritableSignal<T>;
  private readonly storage: StorageService;
  private readonly options: PersistedStoreOptions<T>;
  private readonly key: string;
  private readonly schemaVersion: number;
  private readonly debounceMs: number;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private hasPendingValue = false;
  private pendingValue: T;

  readonly data: Signal<T>;

  constructor(storage: StorageService, options: PersistedStoreOptions<T>) {
    this.storage = storage;
    this.options = options;
    this.key = options.key;
    this.schemaVersion = options.schemaVersion;
    this.debounceMs = options.debounceMs ?? 300;

    const initial = this.loadInitial(options);
    this.pendingValue = initial;
    this.state = signal<T>(initial);
    this.data = this.state.asReadonly();

    PersistedStore.activeStores.add(this as unknown as PersistedStore<unknown>);

    // Sincronización reactiva entre pestañas concurrentes (A8-010)
    if (typeof this.storage?.onStorageChange === 'function') {
      this.storage.onStorageChange((changedKey) => {
        if (changedKey === null || changedKey === this.key) {
          this.reload();
        }
      });
    }

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
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.hasPendingValue) {
      const valueToPersist = this.pendingValue;
      this.hasPendingValue = false;
      this.persist(valueToPersist);
    }
  }

  /** Restablece el almacén al valor inicial y elimina su clave persistida. */
  clear(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.hasPendingValue = false;
    this.pendingValue = this.options.initialValue;
    this.state.set(this.options.initialValue);
    try {
      this.storage.removeItem(this.key);
    } catch {
      // StorageService ya conmuta a fallback en memoria si falla
    }
  }

  reload(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.hasPendingValue = false;
    const reloaded = this.loadInitial(this.options);
    this.pendingValue = reloaded;
    this.state.set(reloaded);
  }

  static reloadAll(): void {
    for (const store of PersistedStore.activeStores) {
      store.reload();
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
    this.hasPendingValue = true;
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }

  private persist(value: T): void {
    // Cuando el estado vacío es null, eliminar la clave evita sesiones persistidas residuales al recargar
    if (value === null && this.options.initialValue === null) {
      try {
        this.storage.removeItem(this.key);
      } catch {
        // StorageService ya conmuta a fallback en memoria si falla
      }
      return;
    }

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

