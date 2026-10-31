import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'lpic1.v1.';
  private readonly memoryStorage = new Map<string, string>();
  readonly isFallbackMode = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith(this.PREFIX)) {
          // Permite que otros servicios escuchen si fuera necesario
        }
      });
    }
  }

  getItem(key: string): string | null {
    const prefixedKey = this.PREFIX + key;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(prefixedKey);
      }
    } catch {
      this.isFallbackMode.set(true);
    }
    return this.memoryStorage.get(prefixedKey) ?? null;
  }

  setItem(key: string, value: string): void {
    const prefixedKey = this.PREFIX + key;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(prefixedKey, value);
        return;
      }
    } catch {
      this.isFallbackMode.set(true);
    }
    this.memoryStorage.set(prefixedKey, value);
  }

  removeItem(key: string): void {
    const prefixedKey = this.PREFIX + key;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(prefixedKey);
        return;
      }
    } catch {
      this.isFallbackMode.set(true);
    }
    this.memoryStorage.delete(prefixedKey);
  }

  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  getAllPrefixedItems(): Record<string, string> {
    const result: Record<string, string> = {};
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k?.startsWith(this.PREFIX)) {
            const unprefixed = k.slice(this.PREFIX.length);
            const val = window.localStorage.getItem(k);
            if (val !== null) {
              result[unprefixed] = val;
            }
          }
        }
        return result;
      }
    } catch {
      this.isFallbackMode.set(true);
    }

    for (const [k, v] of this.memoryStorage.entries()) {
      if (k.startsWith(this.PREFIX)) {
        const unprefixed = k.slice(this.PREFIX.length);
        result[unprefixed] = v;
      }
    }
    return result;
  }

  clearAll(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k?.startsWith(this.PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch {
      this.isFallbackMode.set(true);
    }
    this.memoryStorage.clear();
  }
}

