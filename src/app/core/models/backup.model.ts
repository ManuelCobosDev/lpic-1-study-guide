import { z } from 'zod';
import { APP_VERSION } from '../constants/version';

export { APP_VERSION };
export const BACKUP_FORMAT = 'lpic1-aula-backup';
export const CURRENT_SCHEMA_VERSION = 1;

export const BackupPayloadSchema = z.object({
  format: z.literal(BACKUP_FORMAT, {
    message: 'Formato de archivo no válido. Se esperaba una copia de seguridad oficial de LPIC-1 Study Guide.'
  }),
  schemaVersion: z.number().int().min(1),
  appVersion: z.string(),
  exportedAt: z.string(),
  data: z.record(z.string(), z.unknown()),
  checksum: z.string().length(64, { message: 'El checksum SHA-256 debe tener exactamente 64 caracteres hexadecimales.' })
});

export type BackupPayload = z.infer<typeof BackupPayloadSchema>;

export type ImportMode = 'replace' | 'merge';
export type ResetScope = 'all' | 'simulator' | 'study' | 'notes';

export interface BackupDiff {
  exportedAt: string;
  appVersion: string;
  backupStats: {
    completedSubtopicsCount: number;
    examAttemptsCount: number;
    notesCount: number;
    labsCompletedCount: number;
    flashcardsCount: number;
  };
  currentStats: {
    completedSubtopicsCount: number;
    examAttemptsCount: number;
    notesCount: number;
    labsCompletedCount: number;
    flashcardsCount: number;
  };
  hasChanges: boolean;
}

export type BackupValidationResult =
  | { valid: true; payload: BackupPayload; diff: BackupDiff }
  | { valid: false; error: string };

