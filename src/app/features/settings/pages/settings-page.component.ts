import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContainerComponent } from '../../../shared/ui/container/container.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CalloutComponent } from '../../../shared/ui/callout/callout.component';
import { PreferencesService } from '../../../core/services/preferences.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BackupService } from '../../../core/services/backup.service';
import {
  ThemeMode,
  DefaultStudyView,
  TextDensity,
  TextSize
} from '../../../core/models/preferences.model';
import {
  ImportMode,
  ResetScope,
  BackupValidationResult,
  BackupDiff
} from '../../../core/models/backup.model';

export type SettingsTab = 'apariencia' | 'estudio' | 'datos' | 'atajos' | 'privacidad';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContainerComponent,
    ButtonComponent,
    CalloutComponent
  ],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent implements OnInit {
  private readonly preferencesService = inject(PreferencesService);
  private readonly themeService = inject(ThemeService);
  private readonly backupService = inject(BackupService);

  readonly activeTab = signal<SettingsTab>('apariencia');

  // Estado de modales y asistentes
  readonly isImportModalOpen = signal(false);
  readonly importStep = signal<1 | 2 | 3>(1);
  readonly importError = signal<string | null>(null);
  readonly validationResult = signal<BackupValidationResult | null>(null);
  readonly validDiff = computed<BackupDiff | null>(() => {
    const res = this.validationResult();
    return res && res.valid ? res.diff : null;
  });
  readonly selectedImportMode = signal<ImportMode>('replace');

  readonly isResetModalOpen = signal(false);
  readonly resetScope = signal<ResetScope>('all');
  readonly resetConfirmationText = signal('');

  readonly toastMessage = signal<string | null>(null);
  readonly canRollback = signal(false);

  // Preferencias actuales
  readonly currentTheme = computed(() => this.preferencesService.theme());
  readonly currentDensity = computed(() => this.preferencesService.density());
  readonly currentTextSize = computed(() => this.preferencesService.textSize());
  readonly currentStudyView = computed(() => this.preferencesService.defaultStudyView());
  readonly currentNewCards = computed(() => this.preferencesService.newCardsPerDay());
  readonly showInstructorNotes = computed(() => this.preferencesService.showInstructorNotes());
  readonly includeExampleContent = computed(() => this.preferencesService.includeExampleContent());
  readonly lastExportDate = computed(() => this.preferencesService.preferences().lastExportAt ?? null);

  readonly isResetButtonEnabled = computed(
    () => this.resetConfirmationText().trim() === 'BORRAR'
  );

  ngOnInit(): void {
    this.refreshRollbackStatus();
  }

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  // --- Apariencia ---
  onThemeChange(mode: ThemeMode): void {
    this.preferencesService.setTheme(mode);
    this.themeService.setMode(mode);
  }

  onDensityChange(density: TextDensity): void {
    this.preferencesService.setTextDensity(density);
  }

  onTextSizeChange(size: TextSize): void {
    this.preferencesService.setTextSize(size);
  }

  // --- Estudio ---
  onStudyViewChange(view: DefaultStudyView): void {
    this.preferencesService.setDefaultStudyView(view);
  }

  onNewCardsChange(event: Event): void {
    const val = Number((event.target as HTMLSelectElement).value);
    if (!isNaN(val) && val > 0) {
      this.preferencesService.updatePreferences({ newCardsPerDay: val });
    }
  }

  onToggleInstructorNotes(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.preferencesService.setShowInstructorNotes(checked);
  }

  onToggleExampleContent(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.preferencesService.setIncludeExampleContent(checked);
  }

  // --- Datos / Backup ---
  async exportJson(): Promise<void> {
    try {
      await this.backupService.downloadBackupFile();
      this.showToast('Copia de seguridad descargada con éxito.');
    } catch {
      this.showToast('No se pudo generar la copia de seguridad.');
    }
  }

  async exportCsv(): Promise<void> {
    try {
      await this.backupService.downloadCsvFile();
      this.showToast('Resumen en CSV descargado.');
    } catch {
      this.showToast('No se pudo exportar el CSV.');
    }
  }

  printReport(): void {
    this.backupService.printProgressReport();
  }

  openImportModal(): void {
    this.importStep.set(1);
    this.importError.set(null);
    this.validationResult.set(null);
    this.selectedImportMode.set('replace');
    this.isImportModalOpen.set(true);
  }

  closeImportModal(): void {
    this.isImportModalOpen.set(false);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      await this.processImportFile(file);
    }
  }

  async onFileDropped(event: DragEvent): Promise<void> {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await this.processImportFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private async processImportFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const result = await this.backupService.validateBackup(text);
      this.validationResult.set(result);

      if (result.valid) {
        this.importError.set(null);
        this.importStep.set(2);
      } else {
        this.importError.set(result.error);
        this.importStep.set(2);
      }
    } catch {
      this.importError.set('No se pudo leer el archivo seleccionado.');
      this.importStep.set(2);
    }
  }

  proceedToModeSelection(): void {
    const val = this.validationResult();
    if (val && val.valid) {
      this.importStep.set(3);
    }
  }

  setImportMode(mode: ImportMode): void {
    this.selectedImportMode.set(mode);
  }

  async confirmImport(): Promise<void> {
    const res = this.validationResult();
    if (!res || !res.valid) {
      return;
    }

    try {
      await this.backupService.importBackup(res.payload, this.selectedImportMode());
      this.closeImportModal();
      this.refreshRollbackStatus();
      this.showToast('Copia de seguridad restaurada correctamente. Puedes deshacerla si lo necesitas.');
    } catch {
      this.showToast('Ocurrió un error al restaurar la copia de seguridad.');
    }
  }

  executeRollback(): void {
    const ok = this.backupService.rollbackLastImport();
    if (ok) {
      this.refreshRollbackStatus();
      this.showToast('Se ha deshecho la última importación y restaurado el estado anterior.');
    } else {
      this.showToast('No se encontró ninguna instantánea previa para deshacer.');
    }
  }

  refreshRollbackStatus(): void {
    this.canRollback.set(this.backupService.hasRollbackSnapshot());
  }

  // --- Diálogo de Reinicio ---
  openResetModal(): void {
    this.resetScope.set('all');
    this.resetConfirmationText.set('');
    this.isResetModalOpen.set(true);
  }

  closeResetModal(): void {
    this.isResetModalOpen.set(false);
  }

  confirmReset(): void {
    if (!this.isResetButtonEnabled()) {
      return;
    }

    const scope = this.resetScope();
    const ok = this.backupService.reset(scope, this.resetConfirmationText());
    if (ok) {
      this.closeResetModal();
      this.showToast('Los datos seleccionados han sido eliminados.');
    }
  }

  resetAllPreferences(): void {
    this.preferencesService.resetPreferences();
    this.themeService.setMode('system');
    this.showToast('Preferencias restablecidas a los valores originales.');
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      if (this.toastMessage() === message) {
        this.toastMessage.set(null);
      }
    }, 5000);
  }

  closeToast(): void {
    this.toastMessage.set(null);
  }
}
