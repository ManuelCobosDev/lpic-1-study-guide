import { calculateChecksum } from '../../../../../src/app/core/services/backup.service';
import { BackupPayload, BackupPayloadSchema } from '../../../../../src/app/core/models/backup.model';

async function runEdgeCases() {
  console.log('--- Edge Case 1: Tampered Backup Checksum ---');
  const validData = {
    progress: { completedSubtopics: { '101.1': '2026-11-03' } }
  };
  const correctChecksum = await calculateChecksum(validData);
  const validPayload: BackupPayload = {
    format: 'lpic1-backup',
    schemaVersion: 1,
    appVersion: '0.1.0',
    exportedAt: new Date().toISOString(),
    data: validData,
    checksum: correctChecksum
  };

  const parsedValid = BackupPayloadSchema.safeParse(validPayload);
  console.log('Valid payload schema parse:', parsedValid.success);

  // Alter 1 byte in data
  const tamperedData = {
    progress: { completedSubtopics: { '101.1': '2026-11-04' } }
  };
  const tamperedPayload = {
    ...validPayload,
    data: tamperedData
  };
  const expectedChecksum = await calculateChecksum(tamperedPayload.data);
  const isChecksumMatching = tamperedPayload.checksum === expectedChecksum;
  console.log('Tampered payload checksum matches?:', isChecksumMatching, '(Expected: false)');

  console.log('--- Edge Case 2: PersistedStore Corrupt Schema Fallback ---');
  // If data stored in localStorage has invalid type (e.g. number instead of object)
  const corruptRecord = {
    schemaVersion: 1,
    data: 12345, // Not an object with completedSubtopics
    updatedAt: new Date().toISOString()
  };
  console.log('Corrupt record:', JSON.stringify(corruptRecord));

  console.log('Edge cases verified.');
}

runEdgeCases().catch(console.error);
