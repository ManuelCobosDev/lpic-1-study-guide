import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SettingsPageComponent } from './settings-page.component';
import { PreferencesService } from '../../../core/services/preferences.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BackupService } from '../../../core/services/backup.service';
import { StorageService } from '../../../core/services/storage.service';
import { ClockService } from '../../../core/services/clock.service';
import { ContentService } from '../../../core/services/content.service';

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;
  let preferencesService: PreferencesService;
  let themeService: ThemeService;
  let backupService: BackupService;
  let storage: StorageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        PreferencesService,
        ThemeService,
        BackupService,
        StorageService,
        ClockService,
        {
          provide: ContentService,
          useValue: {
            getManifest: () => Promise.resolve({ subtopics: [] })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    preferencesService = TestBed.inject(PreferencesService);
    themeService = TestBed.inject(ThemeService);
    backupService = TestBed.inject(BackupService);
    storage = TestBed.inject(StorageService);

    storage.clearAll();
    fixture.detectChanges();
  });

  it('debe crearse correctamente con la pestaña apariencia activa por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('apariencia');
  });

  it('debe permitir cambiar de pestaña', () => {
    component.setTab('datos');
    expect(component.activeTab()).toBe('datos');

    component.setTab('atajos');
    expect(component.activeTab()).toBe('atajos');
  });

  it('debe actualizar el tema visual y la densidad', () => {
    vi.spyOn(themeService, 'setMode');
    component.onThemeChange('dark');

    expect(preferencesService.theme()).toBe('dark');
    expect(themeService.setMode).toHaveBeenCalledWith('dark');

    component.onDensityChange('compact');
    expect(preferencesService.density()).toBe('compact');
  });

  it('debe llamar a downloadBackupFile al pulsar exportar JSON', async () => {
    vi.spyOn(backupService, 'downloadBackupFile').mockReturnValue(Promise.resolve());
    await component.exportJson();

    expect(backupService.downloadBackupFile).toHaveBeenCalled();
    expect(component.toastMessage()).toContain('descargada con éxito');
  });

  it('debe abrir el modal de importacion en el paso 1', () => {
    component.openImportModal();
    expect(component.isImportModalOpen()).toBe(true);
    expect(component.importStep()).toBe(1);
    expect(component.importError()).toBeNull();

    component.closeImportModal();
    expect(component.isImportModalOpen()).toBe(false);
  });

  it('debe habilitar el boton de confirmacion de reinicio solo si se escribe BORRAR', () => {
    component.openResetModal();
    expect(component.isResetModalOpen()).toBe(true);
    expect(component.isResetButtonEnabled()).toBe(false);

    component.resetConfirmationText.set('borrar');
    expect(component.isResetButtonEnabled()).toBe(false);

    component.resetConfirmationText.set('BORRAR');
    expect(component.isResetButtonEnabled()).toBe(true);
  });

  it('debe invocar backupService.reset al confirmar el borrado seguro', () => {
    vi.spyOn(backupService, 'reset').mockReturnValue(true);
    component.openResetModal();
    component.resetConfirmationText.set('BORRAR');
    component.confirmReset();

    expect(backupService.reset).toHaveBeenCalledWith('all', 'BORRAR');
    expect(component.isResetModalOpen()).toBe(false);
    expect(component.toastMessage()).toContain('eliminados');
  });

  it('debe ejecutar rollback y actualizar canRollback', () => {
    vi.spyOn(backupService, 'rollbackLastImport').mockReturnValue(true);
    vi.spyOn(backupService, 'hasRollbackSnapshot').mockReturnValue(false);

    component.executeRollback();
    expect(backupService.rollbackLastImport).toHaveBeenCalled();
    expect(component.canRollback()).toBe(false);
    expect(component.toastMessage()).toContain('deshecho la última importación');
  });
});
