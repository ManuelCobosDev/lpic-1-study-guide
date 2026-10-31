export type ThemeMode = 'light' | 'dark' | 'system';
export type DefaultStudyView = 'slides' | 'web' | 'pdf';
export type TextDensity = 'compact' | 'normal' | 'spacious';
export type TextSize = 'sm' | 'md' | 'lg';

export interface UserPreferences {
  theme: ThemeMode;
  defaultStudyView: DefaultStudyView;
  newCardsPerDay: number;
  showInstructorNotes: boolean;
  includeExampleContent: boolean;
  textSize: TextSize;
  density: TextDensity;
  privacyBannerDismissed: boolean;
  lastExportAt?: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  defaultStudyView: 'slides',
  newCardsPerDay: 10,
  showInstructorNotes: true,
  includeExampleContent: true,
  textSize: 'md',
  density: 'normal',
  privacyBannerDismissed: false
};

