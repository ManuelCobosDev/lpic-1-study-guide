import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PersistedStore } from './persisted-store';
import { StorageService } from '../services/storage.service';

describe('PersistedStore (Persistencia, debounce y migración)', () => {
  let storage: StorageService;

  beforeEach(() => {
    vi.useFakeTimers();
    storage = new StorageService();
    storage.clearAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  interface TestStateV1 {
    name: string;
    score: number;
  }

  interface TestStateV2 {
    name: string;
    points: number;
    active: boolean;
  }

  it('debe inicializarse con initialValue si no hay datos guardados', () => {
    const store = new PersistedStore<TestStateV1>(storage, {
      key: 'test-key',
      schemaVersion: 1,
      initialValue: { name: 'Linux', score: 100 }
    });

    expect(store.get()).toEqual({ name: 'Linux', score: 100 });
    expect(store.data()).toEqual({ name: 'Linux', score: 100 });
  });

  it('debe posponer el guardado con debounce de 300ms', () => {
    const store = new PersistedStore<TestStateV1>(storage, {
      key: 'test-debounce',
      schemaVersion: 1,
      initialValue: { name: 'Linux', score: 10 },
      debounceMs: 300
    });

    store.update((s) => ({ ...s, score: 20 }));
    store.update((s) => ({ ...s, score: 30 }));

    // Inmediatamente despues del update no debe haberse guardado aun
    const rawBefore = storage.getItem('test-debounce');
    expect(rawBefore).toBeNull();

    // Avanzamos 290 ms
    vi.advanceTimersByTime(290);
    expect(storage.getItem('test-debounce')).toBeNull();

    // Avanzamos 20 ms mas (total 310 ms)
    vi.advanceTimersByTime(20);
    const rawAfter = storage.getItem('test-debounce');
    expect(rawAfter).not.toBeNull();

    const parsed = JSON.parse(rawAfter!);
    expect(parsed.data).toEqual({ name: 'Linux', score: 30 });
    expect(parsed.schemaVersion).toBe(1);
  });

  it('flush() debe persistir inmediatamente sin esperar al debounce', () => {
    const store = new PersistedStore<TestStateV1>(storage, {
      key: 'test-flush',
      schemaVersion: 1,
      initialValue: { name: 'Ubuntu', score: 50 },
      debounceMs: 300
    });

    store.set({ name: 'Debian', score: 99 });
    expect(storage.getItem('test-flush')).toBeNull();

    store.flush();
    const raw = storage.getItem('test-flush');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.data).toEqual({ name: 'Debian', score: 99 });
  });

  it('debe ejecutar la funcion migrate cuando la version guardada es inferior', () => {
    // Simulamos que existian datos guardados en v1
    const v1Data = {
      schemaVersion: 1,
      data: { name: 'RedHat', score: 85 },
      updatedAt: '2026-01-01T00:00:00Z'
    };
    storage.setItem('test-migrate', JSON.stringify(v1Data));

    const migrateFn = (oldData: unknown): TestStateV2 => {
      const v1 = oldData as TestStateV1;
      return {
        name: v1.name,
        points: v1.score * 10,
        active: true
      };
    };

    const store = new PersistedStore<TestStateV2>(storage, {
      key: 'test-migrate',
      schemaVersion: 2,
      initialValue: { name: 'Default', points: 0, active: false },
      migrate: migrateFn
    });

    expect(store.get()).toEqual({
      name: 'RedHat',
      points: 850,
      active: true
    });

    // Debe haberse persistido la version migrada
    const raw = storage.getItem('test-migrate');
    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.data.points).toBe(850);
  });

  it('debe funcionar con fallback en memoria si localStorage falla', () => {
    // Simulamos fallo en localStorage activando isFallbackMode
    storage.isFallbackMode.set(true);
    storage.setItem('fallback-test', JSON.stringify({ schemaVersion: 1, data: { name: 'Arch', score: 100 } }));

    const store = new PersistedStore<TestStateV1>(storage, {
      key: 'fallback-test',
      schemaVersion: 1,
      initialValue: { name: 'Init', score: 0 }
    });

    expect(store.get()).toEqual({ name: 'Arch', score: 100 });
  });
});

