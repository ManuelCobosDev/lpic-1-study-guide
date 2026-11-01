import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { Ledger } from './types';

export function loadLedger(subtopicId: string, baseDir = 'content-src/coverage'): Ledger {
  const ledgerPath = path.resolve(baseDir, `${subtopicId}.ledger.yaml`);
  if (!fs.existsSync(ledgerPath)) {
    return {
      objective: subtopicId,
      omit: {},
      tokenWaivers: [],
      authorContent: []
    };
  }

  try {
    const raw = fs.readFileSync(ledgerPath, 'utf-8');
    const data = yaml.load(raw) as Partial<Ledger>;
    return {
      objective: data?.objective || subtopicId,
      omit: data?.omit || {},
      tokenWaivers: data?.tokenWaivers || [],
      authorContent: data?.authorContent || []
    };
  } catch (err) {
    console.warn(`[ledger] Error al leer ${ledgerPath}:`, err);
    return {
      objective: subtopicId,
      omit: {},
      tokenWaivers: [],
      authorContent: []
    };
  }
}
