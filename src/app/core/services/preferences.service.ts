import { Injectable, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { PersistedStore } from '../state/persisted-store';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  ThemeMode,
  DefaultStudyView,
  TextSize,
  TextDensity
} from '../models/preferences.model';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly storage = inject(StorageService);
  private readonly store = new PersistedStore<UserPreferences>(this.storage, {
    key: 'preferences',
    schemaVersion: 1,
    initialValue: DEFAULT_PREFERENCES
  });

  readonly preferences = this.store.data;

  readonly theme = computed(() => this.preferences().theme);
  readonly defaultStudyView = computed(() => this.preferences().defaultStudyView);
  readonly newCardsPerDay = computed(() => this.preferences().newCardsPerDay);
  readonly includeExampleContent = computed(() => this.preferences().includeExampleContent);
  readonly textSize = computed(() => this.preferences().textSize);
  readonly density = computed(() => this.preferences().density);
  readonly privacyBannerDismissed = computed(() => this.preferences().privacyBannerDismissed);

  constructor() {
    this.applyDomPreferences();
  }

  private applyDomPreferences(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const current = this.preferences();
    root.setAttribute('data-density', current.density ?? 'normal');
    root.setAttribute('data-text-size', current.textSize ?? 'md');
  }

  setTheme(theme: ThemeMode): void {
    this.store.update(p => ({ ...p, theme }));
  }

  setDefaultStudyView(defaultStudyView: DefaultStudyView): void {
    this.store.update(p => ({ ...p, defaultStudyView }));
  }

  setTextSize(textSize: TextSize): void {
    this.store.update(p => ({ ...p, textSize }));
    this.applyDomPreferences();
  }

  setTextDensity(density: TextDensity): void {
    this.store.update(p => ({ ...p, density }));
    this.applyDomPreferences();
  }

  setIncludeExampleContent(include: boolean): void {
    this.store.update(p => ({ ...p, includeExampleContent: include }));
  }

  dismissPrivacyBanner(): void {
    this.store.update(p => ({ ...p, privacyBannerDismissed: true }));
  }

  setLastExportAt(lastExportAt: string): void {
    this.store.update(p => ({ ...p, lastExportAt }));
  }

  updatePreferences(partial: Partial<UserPreferences>): void {
    this.store.update(p => ({ ...p, ...partial }));
    this.applyDomPreferences();
  }

  resetPreferences(): void {
    this.store.set(DEFAULT_PREFERENCES);
    this.applyDomPreferences();
  }

  flush(): void {
    this.store.flush();
  }
}

