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
  readonly showInstructorNotes = computed(() => this.preferences().showInstructorNotes);
  readonly includeExampleContent = computed(() => this.preferences().includeExampleContent);
  readonly textSize = computed(() => this.preferences().textSize);
  readonly density = computed(() => this.preferences().density);
  readonly privacyBannerDismissed = computed(() => this.preferences().privacyBannerDismissed);

  setTheme(theme: ThemeMode): void {
    this.store.update(p => ({ ...p, theme }));
  }

  setDefaultStudyView(defaultStudyView: DefaultStudyView): void {
    this.store.update(p => ({ ...p, defaultStudyView }));
  }

  setTextSize(textSize: TextSize): void {
    this.store.update(p => ({ ...p, textSize }));
  }

  setTextDensity(density: TextDensity): void {
    this.store.update(p => ({ ...p, density }));
  }

  setShowInstructorNotes(show: boolean): void {
    this.store.update(p => ({ ...p, showInstructorNotes: show }));
  }

  setIncludeExampleContent(include: boolean): void {
    this.store.update(p => ({ ...p, includeExampleContent: include }));
  }

  dismissPrivacyBanner(): void {
    this.store.update(p => ({ ...p, privacyBannerDismissed: true }));
  }

  updatePreferences(partial: Partial<UserPreferences>): void {
    this.store.update(p => ({ ...p, ...partial }));
  }

  resetPreferences(): void {
    this.store.set(DEFAULT_PREFERENCES);
  }

  flush(): void {
    this.store.flush();
  }
}

