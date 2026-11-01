import { TestBed } from '@angular/core/testing';
import { BackupService, calculateChecksum } from './backup.service';
import { StorageService } from './storage.service';
import { ProgressService } from './progress.service';
import { PreferencesService } from './preferences.service';
import { ClockService } from './clock.service';
import { ContentService } from './content.service';
import { BACKUP_FORMAT, CURRENT_SCHEMA_VERSION, BackupPayload } from '../models/backup.model';

describe('BackupService', () => {
  let service: BackupService;
  let storage: StorageService;
  let progressService: ProgressService;
  let preferencesService: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BackupService,
        StorageService,
        ProgressService,
        PreferencesService,
        ClockService,
        {
          provide: ContentService,
          useValue: {
            getManifest: () =>
              Promise.resolve({
                subtopics: [
                  { id: '101.1', topicId: '101', title: 'Determinación de la configuración de hardware' },
                  { id: '101.2', topicId: '101', title: 'Arranque del sistema' }
                ]
              })
          }
        }
      ]
    });

    service = TestBed.inject(BackupService);
    storage = TestBed.inject(StorageService);
    progressService = TestBed.inject(ProgressService);
    preferencesService = TestBed.inject(PreferencesService);

    storage.clearAll();
  });

  it('debe instanciarse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('exportBackup', () => {
    it('debe exportar un JSON con formato lpic1-aula-backup, schemaVersion 1 y checksum SHA-256 valido', async () => {
      progressService.markSubtopicCompleted('101.1');
      progressService.flush();
      storage.setItem('notes', JSON.stringify({ schemaVersion: 1, data: { '101.1': 'Mi nota' } }));

      const jsonStr = await service.exportBackup();
      const payload: BackupPayload = JSON.parse(jsonStr);

      expect(payload.format).toBe(BACKUP_FORMAT);
      expect(payload.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(payload.appVersion).toBe('0.1.0');
      expect(payload.exportedAt).toBeTruthy();
      expect(payload.data).toBeTruthy();
      expect(payload.checksum.length).toBe(64);

      // Verificamos que el checksum coincida
      const expectedChecksum = await calculateChecksum(payload.data);
      expect(payload.checksum).toBe(expectedChecksum);

      // Verificamos que actualizó la preferencia lastExportAt
      expect(preferencesService.preferences().lastExportAt).toBe(payload.exportedAt);
    });
  });

  describe('validateBackup', () => {
    it('debe validar con exito un payload correcto y generar el diff', async () => {
      const data = {
        progress: { schemaVersion: 1, data: { completedSubtopics: { '101.1': '2026-10-31T10:00:00Z' } } },
        notes: { schemaVersion: 1, data: { '101.1': 'Nota' } }
      };
      const checksum = await calculateChecksum(data);
      const validPayload: BackupPayload = {
        format: BACKUP_FORMAT,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        appVersion: '0.1.0',
        exportedAt: '2026-10-31T10:00:00Z',
        data,
        checksum
      };

      const result = await service.validateBackup(JSON.stringify(validPayload));
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.diff.backupStats.completedSubtopicsCount).toBe(1);
        expect(result.diff.backupStats.notesCount).toBe(1);
      }
    });

    it('debe rechazar un archivo con JSON invalido', async () => {
      const result = await service.validateBackup('{ json roto: ');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('JSON válido');
      }
    });

    it('debe rechazar una version de esquema futura', async () => {
      const data = {};
      const checksum = await calculateChecksum(data);
      const futurePayload = {
        format: BACKUP_FORMAT,
        schemaVersion: 99,
        appVersion: '0.1.0',
        exportedAt: '2026-10-31T10:00:00Z',
        data,
        checksum
      };

      const result = await service.validateBackup(JSON.stringify(futurePayload));
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('más reciente');
      }
    });

    it('debe rechazar un archivo con checksum manipulado', async () => {
      const data = { valor: 1 };
      const validPayload = {
        format: BACKUP_FORMAT,
        schemaVersion: 1,
        appVersion: '0.1.0',
        exportedAt: '2026-10-31T10:00:00Z',
        data,
        checksum: '0000000000000000000000000000000000000000000000000000000000000000'
      };

      const result = await service.validateBackup(JSON.stringify(validPayload));
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('checksum');
      }
    });
  });

  describe('importBackup y rollback', () => {
    it('debe importar en modo replace guardando snapshot de pre-import', async () => {
      // Estado previo
      progressService.markSubtopicCompleted('101.1');
      progressService.flush();
      expect(storage.getItem('progress')).toBeTruthy();

      const backupData = {
        progress: {
          schemaVersion: 1,
          data: {
            completedSubtopics: { '102.1': '2026-10-31T12:00:00Z' },
            viewedSlides: {},
            totalTimeMinutes: 45,
            streakDays: 3
          }
        }
      };
      const checksum = await calculateChecksum(backupData);
      const payload: BackupPayload = {
        format: BACKUP_FORMAT,
        schemaVersion: 1,
        appVersion: '0.1.0',
        exportedAt: '2026-10-31T12:00:00Z',
        data: backupData,
        checksum
      };

      await service.importBackup(payload, 'replace');

      // Se guardó el snapshot previo
      expect(service.hasRollbackSnapshot()).toBe(true);

      // El store fue reemplazado con 102.1
      const currentProgressRaw = storage.getItem('progress');
      expect(currentProgressRaw).toContain('102.1');
      expect(currentProgressRaw).not.toContain('101.1');

      // Ejecutar rollback
      const rollbackOk = service.rollbackLastImport();
      expect(rollbackOk).toBe(true);
      expect(service.hasRollbackSnapshot()).toBe(false);

      // Ahora volvió 101.1
      const restoredProgressRaw = storage.getItem('progress');
      expect(restoredProgressRaw).toContain('101.1');
    });

    it('debe fusionar en modo merge uniendo completados y notas', async () => {
      // Estado previo: completado 101.1 y nota 101.1
      progressService.markSubtopicCompleted('101.1');
      progressService.flush();
      storage.setItem('notes', JSON.stringify({ schemaVersion: 1, data: { '101.1': 'Nota 101' } }));

      // Backup con completado 101.2 y nota 101.2
      const backupData = {
        progress: {
          schemaVersion: 1,
          data: {
            completedSubtopics: { '101.2': '2026-10-31T12:00:00Z' }
          }
        },
        notes: {
          schemaVersion: 1,
          data: { '101.2': 'Nota 102' }
        }
      };
      const checksum = await calculateChecksum(backupData);
      const payload: BackupPayload = {
        format: BACKUP_FORMAT,
        schemaVersion: 1,
        appVersion: '0.1.0',
        exportedAt: '2026-10-31T12:00:00Z',
        data: backupData,
        checksum
      };

      await service.importBackup(payload, 'merge');

      // Deben existir tanto 101.1 como 101.2
      const mergedProgressRaw = storage.getItem('progress');
      expect(mergedProgressRaw).toContain('101.1');
      expect(mergedProgressRaw).toContain('101.2');

      const mergedNotesRaw = storage.getItem('notes');
      expect(mergedNotesRaw).toContain('Nota 101');
      expect(mergedNotesRaw).toContain('Nota 102');
    });
  });

  describe('reset', () => {
    it('debe rechazar reinicio si no se introduce la palabra BORRAR exacta', () => {
      storage.setItem('progress', 'data');
      const ok = service.reset('all', 'borrar');
      expect(ok).toBe(false);
      expect(storage.getItem('progress')).toBe('data');
    });

    it('debe limpiar todo el contenido relevante al indicar BORRAR y scope all', () => {
      storage.setItem('progress', 'prog');
      storage.setItem('notes', 'notes');
      storage.setItem('labs_progress', 'labs');
      storage.setItem('exam_history', 'exam');

      const ok = service.reset('all', 'BORRAR');
      expect(ok).toBe(true);

      expect(storage.getItem('progress')).toBeNull();
      expect(storage.getItem('notes')).toBeNull();
      expect(storage.getItem('labs_progress')).toBeNull();
      expect(storage.getItem('exam_history')).toBeNull();
    });

    it('debe limpiar solo notas si el scope es notes', () => {
      storage.setItem('progress', 'prog');
      storage.setItem('notes', 'notes');

      const ok = service.reset('notes', 'BORRAR');
      expect(ok).toBe(true);

      expect(storage.getItem('progress')).toBe('prog');
      expect(storage.getItem('notes')).toBeNull();
    });
  });

  describe('exportCsv', () => {
    it('debe generar filas con el listado de subtemas y cabeceras', async () => {
      progressService.markSubtopicCompleted('101.1');
      const csv = await service.exportCsv();

      expect(csv).toContain('Subtema,Título,Tema,Completado,FechaCompletado,TieneNota');
      expect(csv).toContain('101.1');
      expect(csv).toContain('Determinación de la configuración de hardware');
      expect(csv).toContain('Sí');
    });
  });

  describe('isExportReminderDue', () => {
    it('debe ser false si no hay ningun progreso', () => {
      expect(service.isExportReminderDue()).toBe(false);
    });

    it('debe ser true si hay progreso y nunca se ha exportado', () => {
      progressService.markSubtopicCompleted('101.1');
      expect(service.isExportReminderDue()).toBe(true);
    });

    it('debe ser true si han pasado mas de 14 dias desde la ultima exportacion', () => {
      progressService.markSubtopicCompleted('101.1');
      const oldDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
      preferencesService.setLastExportAt(oldDate);

      expect(service.isExportReminderDue()).toBe(true);
    });

    it('debe ser false si se ha exportado recientemente', () => {
      progressService.markSubtopicCompleted('101.1');
      preferencesService.setLastExportAt(new Date().toISOString());

      expect(service.isExportReminderDue()).toBe(false);
    });
  });
});
