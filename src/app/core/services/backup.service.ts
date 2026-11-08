import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { PreferencesService } from './preferences.service';
import { ProgressService } from './progress.service';
import { ClockService } from './clock.service';
import { ContentService } from './content.service';
import { PersistedStore } from '../state/persisted-store';
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

  async printProgressReport(): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

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

    const examHistoryRaw = this.storage.getItem('exam_history');
    let examCount = 0;
    let avgScore = 0;
    let passRate = 0;
    if (examHistoryRaw) {
      try {
        const parsed = JSON.parse(examHistoryRaw);
        const attempts = Array.isArray(parsed) ? parsed : (parsed.data ?? []);
        examCount = attempts.length;
        if (examCount > 0) {
          const totalScore = attempts.reduce((acc: number, a: { score?: number }) => acc + (a.score ?? 0), 0);
          avgScore = Math.round(totalScore / examCount);
          const passedCount = attempts.filter((a: { passed?: boolean }) => a.passed).length;
          passRate = Math.round((passedCount / examCount) * 100);
        }
      } catch {
        // Ignorar
      }
    }

    const flashcardsRaw = this.storage.getItem('flashcards_progress');
    let masteredCards = 0;
    let totalCards = 0;
    if (flashcardsRaw) {
      try {
        const parsed = JSON.parse(flashcardsRaw);
        const cards = (parsed.cards ?? parsed.data?.cards ?? {}) as Record<string, { box?: number }>;
        const cardEntries = Object.values(cards);
        totalCards = cardEntries.length;
        masteredCards = cardEntries.filter((c) => c.box === 5).length;
      } catch {
        // Ignorar
      }
    }

    const completedSubsCount = Object.keys(progress.completedSubtopics || {}).length;
    const totalSubsCount = manifest?.subtopics?.length || 42;
    const completionPct = totalSubsCount > 0 ? Math.round((completedSubsCount / totalSubsCount) * 100) : 0;
    
    const dateSet = new Set<string>();
    for (const d of Object.values(progress.completedSubtopics || {})) {
      if (d) dateSet.add(d.slice(0, 10));
    }
    for (const d of Object.values(progress.completedLabs || {})) {
      if (d) dateSet.add(d.slice(0, 10));
    }
    const activeStudyDays = dateSet.size;

    const dateFormatted = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(new Date());

    const escape = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let tableRowsHtml = '';
    if (manifest && manifest.subtopics) {
      for (const sub of manifest.subtopics) {
        const completedDate = progress.completedSubtopics[sub.id];
        const isDone = Boolean(completedDate);
        const note = notesMap[sub.id];
        const formattedDate = completedDate
          ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(completedDate))
          : '—';

        tableRowsHtml += `
          <tr>
            <td class="font-mono text-center font-bold">${escape(sub.id)}</td>
            <td><strong>${escape(sub.title)}</strong></td>
            <td class="text-center font-mono">Tema ${escape(sub.topicId)}</td>
            <td class="text-center font-mono">Peso ${sub.weight}</td>
            <td class="text-center">
              <span class="badge ${isDone ? 'badge-completed' : 'badge-pending'}">
                ${isDone ? 'Completado' : 'Pendiente'}
              </span>
            </td>
            <td class="text-center font-mono text-sm">${escape(formattedDate)}</td>
            <td class="text-sm">${note ? escape(note.slice(0, 50) + (note.length > 50 ? '...' : '')) : '<span class="text-muted">Sin notas</span>'}</td>
          </tr>
        `;
      }
    }

    const reportHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>LPIC-1 Study Guide · Informe de Progreso</title>
  <style>
    @page {
      margin: 14mm;
      size: A4 portrait;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 16px;
      font-size: 10pt;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title {
      font-size: 18pt;
      font-weight: 700;
      color: #1e3a8a;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 9.5pt;
      color: #475569;
      margin-top: 3px;
    }
    .meta-box {
      text-align: right;
      font-size: 8.5pt;
      color: #64748b;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .stat-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      background: #f8fafc;
    }
    .stat-label {
      font-size: 8pt;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 2px;
    }
    .stat-value {
      font-size: 15pt;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-sub {
      font-size: 8pt;
      color: #475569;
      margin-top: 2px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      color: #1e293b;
      margin: 16px 0 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 7px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-sm { font-size: 8pt; }
    .text-muted { color: #94a3b8; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-completed {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .badge-pending {
      background-color: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    .footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
      tr { break-inside: avoid; page-break-inside: avoid; }
      .header, .stats-grid { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">LPIC-1 Study Guide</h1>
      <p class="subtitle">Informe Oficial de Progreso y Preparación para la Certificación Linux</p>
    </div>
    <div class="meta-box">
      <div><strong>Emisión:</strong> ${escape(dateFormatted)}</div>
      <div><strong>Exámenes:</strong> 101-500 y 102-500</div>
      <div><strong>Versión:</strong> v${APP_VERSION} (Temario completo)</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Lecciones completadas</div>
      <div class="stat-value">${completedSubsCount} / ${totalSubsCount}</div>
      <div class="stat-sub">${completionPct}% del temario oficial</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Simulacros de examen</div>
      <div class="stat-value">${examCount}</div>
      <div class="stat-sub">Media: ${avgScore} pts · ${passRate}% aprobados</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Repaso Leitner</div>
      <div class="stat-value">${masteredCards} dominadas</div>
      <div class="stat-sub">${totalCards} tarjetas en estudio activo</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Días de estudio activo</div>
      <div class="stat-value">${activeStudyDays} días</div>
      <div class="stat-sub">Registros de actividad local</div>
    </div>
  </div>

  <h2 class="section-title">Desglose Detallado de Subtemas LPIC-1</h2>
  <table>
    <thead>
      <tr>
        <th class="text-center" style="width: 55px;">Subtema</th>
        <th>Título Oficial</th>
        <th class="text-center" style="width: 75px;">Tema</th>
        <th class="text-center" style="width: 65px;">Peso</th>
        <th class="text-center" style="width: 85px;">Estado</th>
        <th class="text-center" style="width: 80px;">Fecha</th>
        <th>Notas de estudio</th>
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <span>LPIC-1 Study Guide · Aula Virtual Cliente</span>
    <span>Documento de seguimiento personal generado localmente</span>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(reportHtml);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1500);
      }, 250);
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
      const firstError = parseResult.error.issues[0]?.message ?? 'Estructura de copia de seguridad no válida.';
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

    // Recarga todos los almacenes reactivos en memoria para evitar estados sucios
    PersistedStore.reloadAll();
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
      PersistedStore.reloadAll();
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

    PersistedStore.reloadAll();
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

    const backupFlashcards = this.extractStoreData<{ progress?: Record<string, unknown>; cards?: Record<string, unknown> }>(payload.data['flashcards_progress']);
    const backupCards = backupFlashcards?.progress ?? backupFlashcards?.cards ?? {};
    const backupFlashcardsCount = Object.keys(backupCards).length;

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
        const cData = parsed.data ?? parsed;
        const cards = cData?.progress ?? cData?.cards ?? {};
        currentFlashcardsCount = Object.keys(cards).length;
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
      const bFlashcards = this.extractStoreData<{ progress?: Record<string, { box: number }>; cards?: Record<string, { box: number }> }>(backupData['flashcards_progress']);
      const currentRaw = this.storage.getItem('flashcards_progress');
      let cCards: Record<string, { box: number }> = {};
      let cEnvelope: Record<string, unknown> = { schemaVersion: 1, updatedAt: this.clock.nowIso() };

      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw);
          if (parsed && typeof parsed === 'object' && 'data' in parsed) {
            cEnvelope = parsed;
            const cData = parsed.data;
            cCards = cData?.progress ?? cData?.cards ?? {};
          }
        } catch {
          // Fallback
        }
      }

      const bCards = bFlashcards?.progress ?? bFlashcards?.cards ?? {};
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
          data: { progress: mergedCards },
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
