import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { PreferencesService } from './preferences.service';
import { ProgressService } from './progress.service';
import { ClockService } from './clock.service';
import { ContentService } from './content.service';
import {
  BACKUP_FORMAT,
  CURRENT_SCHEMA_VERSION,
  APP_VERSION,
  BackupPayload,
  BackupPayloadSchema,
  BackupDiff,
  BackupValidationResult,
  ImportMode,
  ResetScope
} from '../models/backup.model';

export const PRE_IMPORT_SNAPSHOT_KEY = 'backup.pre-import';

export async function calculateChecksum(data: unknown): Promise<string> {
  const jsonStr = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly storage = inject(StorageService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly progressService = inject(ProgressService);
  private readonly clock = inject(ClockService);
  private readonly contentService = inject(ContentService);

  private readonly BACKUP_STORES = [
    'progress',
    'preferences',
    'notes',
    'labs_progress',
    'exam_active_session',
    'exam_history',
    'flashcards_progress'
  ] as const;

  async exportBackup(): Promise<string> {
    const data: Record<string, unknown> = {};

    for (const key of this.BACKUP_STORES) {
      const raw = this.storage.getItem(key);
      if (raw !== null) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          data[key] = raw;
        }
      }
    }

    const exportedAt = this.clock.nowIso();
    const checksum = await calculateChecksum(data);

    const payload: BackupPayload = {
      format: BACKUP_FORMAT,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      exportedAt,
      data,
      checksum
    };

    // Actualiza la fecha de última exportación
    this.preferencesService.setLastExportAt(exportedAt);
    this.preferencesService.flush();

    return JSON.stringify(payload, null, 2);
  }

  async downloadBackupFile(): Promise<void> {
    const jsonStr = await this.exportBackup();
    const dateStr = this.clock.nowDate().toISOString().slice(0, 10);
    const fileName = `lpic1-backup-${dateStr}.json`;
    this.triggerFileDownload(jsonStr, fileName, 'application/json');
  }

  async exportCsv(): Promise<string> {
    const manifest = await this.contentService.getManifest();
    const progress = this.progressService.progress();
    const notesRaw = this.storage.getItem('notes');
    let notesMap: Record<string, string> = {};
    if (notesRaw) {
      try {
        const parsed = JSON.parse(notesRaw);
        notesMap = parsed.data ?? parsed;
      } catch {
        // Ignorar
      }
    }

    const lines: string[] = ['Subtema,Título,Tema,Completado,FechaCompletado,TieneNota'];

    if (manifest && manifest.subtopics) {
      for (const sub of manifest.subtopics) {
        const completedDate = progress.completedSubtopics[sub.id];
        const isCompleted = !!completedDate;
        const hasNote = !!notesMap[sub.id]?.trim();
        const cleanTitle = `"${sub.title.replace(/"/g, '""')}"`;
        lines.push(
          `${sub.id},${cleanTitle},${sub.topicId},${isCompleted ? 'Sí' : 'No'},${completedDate ?? ''},${hasNote ? 'Sí' : 'No'}`
        );
      }
    }

    return '\uFEFF' + lines.join('\n');
  }

  async downloadCsvFile(): Promise<void> {
    const csvContent = await this.exportCsv();
    const dateStr = this.clock.nowDate().toISOString().slice(0, 10);
    const fileName = `lpic1-resumen-${dateStr}.csv`;
    this.triggerFileDownload(csvContent, fileName, 'text/csv;charset=utf-8');
  }

  printProgressReport(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  async validateBackup(fileContent: string): Promise<BackupValidationResult> {
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(fileContent);
    } catch {
      return { valid: false, error: 'El archivo seleccionado no contiene un formato JSON válido.' };
    }

    const parseResult = BackupPayloadSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message ?? 'Estructura de copia de seguridad no válida.';
      return { valid: false, error: firstError };
    }

    const payload = parseResult.data;

    if (payload.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return {
        valid: false,
        error: `La copia de seguridad utiliza la versión de esquema ${payload.schemaVersion}, más reciente que la versión soportada (${CURRENT_SCHEMA_VERSION}). Actualiza la aplicación para poder restaurarla.`
      };
    }

    const expectedChecksum = await calculateChecksum(payload.data);
    if (payload.checksum !== expectedChecksum) {
      return {
        valid: false,
        error: 'La copia de seguridad está dañada o ha sido modificada (el checksum de verificación SHA-256 no coincide).'
      };
    }

    const diff = this.computeDiff(payload);
    return { valid: true, payload, diff };
  }

  async importBackup(payload: BackupPayload, mode: ImportMode): Promise<void> {
    // 1. Snapshot de seguridad previo
    this.savePreImportSnapshot();

    if (mode === 'replace') {
      for (const key of this.BACKUP_STORES) {
        if (key in payload.data) {
          const val = payload.data[key];
          this.storage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        } else {
          this.storage.removeItem(key);
        }
      }
    } else {
      // Modo 'merge': fusiona respetando marcas temporales e históricos
      this.mergeStores(payload.data);
    }
  }

  hasRollbackSnapshot(): boolean {
    return this.storage.hasItem(PRE_IMPORT_SNAPSHOT_KEY);
  }

  rollbackLastImport(): boolean {
    const raw = this.storage.getItem(PRE_IMPORT_SNAPSHOT_KEY);
    if (!raw) {
      return false;
    }

    try {
      const snapshot = JSON.parse(raw) as Record<string, string>;
      for (const key of this.BACKUP_STORES) {
        if (key in snapshot && snapshot[key] !== undefined) {
          this.storage.setItem(key, snapshot[key] as string);
        } else {
          this.storage.removeItem(key);
        }
      }
      this.storage.removeItem(PRE_IMPORT_SNAPSHOT_KEY);
      return true;
    } catch {
      return false;
    }
  }

  reset(scope: ResetScope, confirmationWord: string): boolean {
    if (confirmationWord.trim() !== 'BORRAR') {
      return false;
    }

    switch (scope) {
      case 'all':
        for (const key of this.BACKUP_STORES) {
          if (key !== 'preferences') {
            this.storage.removeItem(key);
          }
        }
        break;

      case 'simulator':
        this.storage.removeItem('exam_active_session');
        this.storage.removeItem('exam_history');
        break;

      case 'study':
        this.storage.removeItem('progress');
        this.storage.removeItem('labs_progress');
        this.storage.removeItem('flashcards_progress');
        break;

      case 'notes':
        this.storage.removeItem('notes');
        break;
    }

    return true;
  }

  isExportReminderDue(): boolean {
    const progress = this.progressService.progress();
    const completedCount = Object.keys(progress.completedSubtopics || {}).length;
    if (completedCount === 0) {
      return false;
    }

    const lastExport = this.preferencesService.preferences().lastExportAt;
    if (!lastExport) {
      return true;
    }

    const lastExportTime = new Date(lastExport).getTime();
    if (isNaN(lastExportTime)) {
      return true;
    }

    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    return this.clock.now() - lastExportTime >= fourteenDaysMs;
  }

  private savePreImportSnapshot(): void {
    const snapshot: Record<string, string> = {};
    for (const key of this.BACKUP_STORES) {
      const val = this.storage.getItem(key);
      if (val !== null) {
        snapshot[key] = val;
      }
    }
    this.storage.setItem(PRE_IMPORT_SNAPSHOT_KEY, JSON.stringify(snapshot));
  }

  private computeDiff(payload: BackupPayload): BackupDiff {
    const backupProgress = this.extractStoreData<Record<string, unknown>>(payload.data['progress']);
    const backupCompleted = Object.keys(backupProgress?.['completedSubtopics'] ?? {}).length;

    const backupExamHistory = this.extractStoreData<{ attempts?: unknown[] }>(payload.data['exam_history']);
    const backupAttempts = (backupExamHistory?.attempts ?? []).length;

    const backupNotes = this.extractStoreData<Record<string, string>>(payload.data['notes']);
    const backupNotesCount = Object.keys(backupNotes ?? {}).length;

    const backupLabs = this.extractStoreData<{ completedSteps?: Record<string, number[]> }>(payload.data['labs_progress']);
    const backupLabsCount = Object.keys(backupLabs?.completedSteps ?? {}).length;

    const backupFlashcards = this.extractStoreData<{ cards?: Record<string, unknown> }>(payload.data['flashcards_progress']);
    const backupFlashcardsCount = Object.keys(backupFlashcards?.cards ?? {}).length;

    // Estadísticas actuales
    const currentProgress = this.progressService.progress();
    const currentCompleted = Object.keys(currentProgress.completedSubtopics || {}).length;

    const currentNotesRaw = this.storage.getItem('notes');
    let currentNotesCount = 0;
    if (currentNotesRaw) {
      try {
        const parsed = JSON.parse(currentNotesRaw);
        currentNotesCount = Object.keys(parsed.data ?? parsed).length;
      } catch {
        // Ignorar
      }
    }

    const currentExamRaw = this.storage.getItem('exam_history');
    let currentAttempts = 0;
    if (currentExamRaw) {
      try {
        const parsed = JSON.parse(currentExamRaw);
        currentAttempts = (parsed.data?.attempts ?? []).length;
      } catch {
        // Ignorar
      }
    }

    const currentLabsRaw = this.storage.getItem('labs_progress');
    let currentLabsCount = 0;
    if (currentLabsRaw) {
      try {
        const parsed = JSON.parse(currentLabsRaw);
        currentLabsCount = Object.keys(parsed.data?.completedSteps ?? {}).length;
      } catch {
        // Ignorar
      }
    }

    const currentFlashcardsRaw = this.storage.getItem('flashcards_progress');
    let currentFlashcardsCount = 0;
    if (currentFlashcardsRaw) {
      try {
        const parsed = JSON.parse(currentFlashcardsRaw);
        currentFlashcardsCount = Object.keys(parsed.data?.cards ?? {}).length;
      } catch {
        // Ignorar
      }
    }

    const hasChanges =
      backupCompleted !== currentCompleted ||
      backupAttempts !== currentAttempts ||
      backupNotesCount !== currentNotesCount ||
      backupLabsCount !== currentLabsCount ||
      backupFlashcardsCount !== currentFlashcardsCount;

    return {
      exportedAt: payload.exportedAt,
      appVersion: payload.appVersion,
      backupStats: {
        completedSubtopicsCount: backupCompleted,
        examAttemptsCount: backupAttempts,
        notesCount: backupNotesCount,
        labsCompletedCount: backupLabsCount,
        flashcardsCount: backupFlashcardsCount
      },
      currentStats: {
        completedSubtopicsCount: currentCompleted,
        examAttemptsCount: currentAttempts,
        notesCount: currentNotesCount,
        labsCompletedCount: currentLabsCount,
        flashcardsCount: currentFlashcardsCount
      },
      hasChanges
    };
  }

  private mergeStores(backupData: Record<string, unknown>): void {
    // 1. Fusionar progreso
    if ('progress' in backupData) {
      const bProgress = this.extractStoreData<Record<string, unknown>>(backupData['progress']);
      const currentRaw = this.storage.getItem('progress');
      let cProgress: Record<string, unknown> = {};
      let cEnvelope: Record<string, unknown> = { schemaVersion: 1, updatedAt: this.clock.nowIso() };

      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw);
          if (parsed && typeof parsed === 'object' && 'data' in parsed) {
            cEnvelope = parsed;
            cProgress = parsed.data;
          } else {
            cProgress = parsed;
          }
        } catch {
          // Fallback
        }
      }

      const mergedCompleted = {
        ...(cProgress['completedSubtopics'] as Record<string, string> ?? {}),
        ...(bProgress?.['completedSubtopics'] as Record<string, string> ?? {})
      };

      const cViewed = (cProgress['viewedSlides'] as Record<string, number[]> ?? {});
      const bViewed = (bProgress?.['viewedSlides'] as Record<string, number[]> ?? {});
      const mergedViewed: Record<string, number[]> = { ...cViewed };
      for (const [subId, slides] of Object.entries(bViewed)) {
        const existing = mergedViewed[subId] ?? [];
        mergedViewed[subId] = Array.from(new Set([...existing, ...slides])).sort((a, b) => a - b);
      }

      const mergedProgress = {
        ...cProgress,
        ...bProgress,
        completedSubtopics: mergedCompleted,
        viewedSlides: mergedViewed,
        totalTimeMinutes: Math.max(
          (cProgress['totalTimeMinutes'] as number) || 0,
          (bProgress?.['totalTimeMinutes'] as number) || 0
        ),
        streakDays: Math.max(
          (cProgress['streakDays'] as number) || 0,
          (bProgress?.['streakDays'] as number) || 0
        )
      };

      this.storage.setItem(
        'progress',
        JSON.stringify({ ...cEnvelope, data: mergedProgress, updatedAt: this.clock.nowIso() })
      );
    }

    // 2. Fusionar notas
    if ('notes' in backupData) {
      const bNotes = this.extractStoreData<Record<string, string>>(backupData['notes']);
      const currentRaw = this.storage.getItem('notes');
      let cNotes: Record<string, string> = {};
      let cEnvelope: Record<string, unknown> = { schemaVersion: 1, updatedAt: this.clock.nowIso() };

      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw);
          if (parsed && typeof parsed === 'object' && 'data' in parsed) {
            cEnvelope = parsed;
            cNotes = parsed.data;
          } else {
            cNotes = parsed;
          }
        } catch {
          // Fallback
        }
      }

      const mergedNotes = { ...cNotes, ...(bNotes ?? {}) };
      this.storage.setItem(
        'notes',
        JSON.stringify({ ...cEnvelope, data: mergedNotes, updatedAt: this.clock.nowIso() })
      );
    }

    // 3. Fusionar historial de exámenes
    if ('exam_history' in backupData) {
      const bHistory = this.extractStoreData<{ attempts?: { id: string }[] }>(backupData['exam_history']);
      const currentRaw = this.storage.getItem('exam_history');
      let cAttempts: { id: string }[] = [];
      let cEnvelope: Record<string, unknown> = { schemaVersion: 1, updatedAt: this.clock.nowIso() };

      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw);
          if (parsed && typeof parsed === 'object' && 'data' in parsed) {
            cEnvelope = parsed;
            cAttempts = parsed.data?.attempts ?? [];
          } else {
            cAttempts = parsed?.attempts ?? [];
          }
        } catch {
          // Fallback
        }
      }

      const bAttempts = bHistory?.attempts ?? [];
      const attemptMap = new Map<string, { id: string }>();
      cAttempts.forEach((a) => attemptMap.set(a.id, a));
      bAttempts.forEach((a) => attemptMap.set(a.id, a));

      const mergedAttempts = Array.from(attemptMap.values());
      this.storage.setItem(
        'exam_history',
        JSON.stringify({
          ...cEnvelope,
          data: { attempts: mergedAttempts },
          updatedAt: this.clock.nowIso()
        })
      );
    }

    // 4. Fusionar laboratorios
    if ('labs_progress' in backupData) {
      const bLabs = this.extractStoreData<{ completedSteps?: Record<string, number[]> }>(backupData['labs_progress']);
      const currentRaw = this.storage.getItem('labs_progress');
      let cSteps: Record<string, number[]> = {};
      let cEnvelope: Record<string, unknown> = { schemaVersion: 1, updatedAt: this.clock.nowIso() };

      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw);
          if (parsed && typeof parsed === 'object' && 'data' in parsed) {
            cEnvelope = parsed;
            cSteps = parsed.data?.completedSteps ?? {};
          }
        } catch {
          // Fallback
        }
      }

      const bSteps = bLabs?.completedSteps ?? {};
      const mergedSteps: Record<string, number[]> = { ...cSteps };
      for (const [labId, steps] of Object.entries(bSteps)) {
        const existing = mergedSteps[labId] ?? [];
        mergedSteps[labId] = Array.from(new Set([...existing, ...steps])).sort((a, b) => a - b);
      }

      this.storage.setItem(
        'labs_progress',
        JSON.stringify({
          ...cEnvelope,
          data: { completedSteps: mergedSteps },
          updatedAt: this.clock.nowIso()
        })
      );
    }

    // 5. Fusionar flashcards
    if ('flashcards_progress' in backupData) {
      const bFlashcards = this.extractStoreData<{ cards?: Record<string, { box: number }> }>(backupData['flashcards_progress']);
      const currentRaw = this.storage.getItem('flashcards_progress');
      let cCards: Record<string, { box: number }> = {};
      let cEnvelope: Record<string, unknown> = { schemaVersion: 1, updatedAt: this.clock.nowIso() };

      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw);
          if (parsed && typeof parsed === 'object' && 'data' in parsed) {
            cEnvelope = parsed;
            cCards = parsed.data?.cards ?? {};
          }
        } catch {
          // Fallback
        }
      }

      const bCards = bFlashcards?.cards ?? {};
      const mergedCards: Record<string, { box: number }> = { ...cCards };
      for (const [cardId, bCard] of Object.entries(bCards)) {
        const cCard = mergedCards[cardId];
        if (!cCard) {
          mergedCards[cardId] = bCard;
        } else {
          mergedCards[cardId] = {
            ...cCard,
            ...bCard,
            box: Math.max(cCard.box, bCard.box)
          };
        }
      }

      this.storage.setItem(
        'flashcards_progress',
        JSON.stringify({
          ...cEnvelope,
          data: { cards: mergedCards },
          updatedAt: this.clock.nowIso()
        })
      );
    }
  }

  private extractStoreData<T>(rawEnvelope: unknown): T | null {
    if (!rawEnvelope || typeof rawEnvelope !== 'object') {
      return null;
    }
    if ('data' in rawEnvelope) {
      return (rawEnvelope as { data: T }).data;
    }
    return rawEnvelope as T;
  }

  private triggerFileDownload(content: string, fileName: string, mimeType: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
