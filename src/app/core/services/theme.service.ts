import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly THEME_KEY = 'theme';

  private readonly modeSignal = signal<ThemeMode>(this.getInitialMode());
  private readonly systemIsDarkSignal = signal<boolean>(this.getSystemDarkPreference());

  readonly mode = this.modeSignal.asReadonly();

  readonly isDark = computed(() => {
    const currentMode = this.modeSignal();
    if (currentMode === 'system') {
      return this.systemIsDarkSignal();
    }
    return currentMode === 'dark';
  });

  constructor() {
    this.applyTheme(this.isDark());

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        this.systemIsDarkSignal.set(e.matches);
        if (this.modeSignal() === 'system') {
          this.applyTheme(e.matches);
        }
      });
    }
  }

  private getInitialMode(): ThemeMode {
    const saved = this.storage.getItem(this.THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  }

  private getSystemDarkPreference(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  setMode(mode: ThemeMode): void {
    this.modeSignal.set(mode);
    this.storage.setItem(this.THEME_KEY, mode);
    this.applyTheme(this.isDark());
  }

  toggle(): void {
    const nextMode = this.isDark() ? 'light' : 'dark';
    this.setMode(nextMode);
  }

  private applyTheme(dark: boolean): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }
}

