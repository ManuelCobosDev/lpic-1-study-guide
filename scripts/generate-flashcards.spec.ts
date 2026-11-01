import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import { generateFlashcards } from './generate-flashcards';
import { FlashcardItemSchema } from '../src/app/core/schemas/flashcard.schema';

describe('generateFlashcards (Ronda 2 · R5)', () => {
  const rootDir = process.cwd();
  const cards = generateFlashcards(rootDir);

  it('debe generar más de 1 000 flashcards deterministas', () => {
    expect(cards.length).toBeGreaterThanOrEqual(1000);
  });

  it('el total de tarjetas debe ser mayor o igual que totalComandos + totalTerminos', () => {
    const cmds = (yaml.load(fs.readFileSync(path.join(rootDir, 'content-src/commands.yaml'), 'utf-8')) as unknown[]) || [];
    const glo = (yaml.load(fs.readFileSync(path.join(rootDir, 'content-src/glossary.yaml'), 'utf-8')) as unknown[]) || [];
    expect(cards.length).toBeGreaterThanOrEqual(cmds.length + glo.length);
  });

  it('cada uno de los 42 subtemas debe tener al menos 10 tarjetas asociadas', () => {
    const cur = yaml.load(fs.readFileSync(path.join(rootDir, 'content-src/curriculum.yaml'), 'utf-8')) as {
      subtopics: Array<{ id: string }>;
    };

    const counts: Record<string, number> = {};
    for (const s of cur.subtopics) {
      counts[s.id] = 0;
    }

    for (const card of cards) {
      for (const sid of card.subtopicIds) {
        if (counts[sid] !== undefined) {
          counts[sid]++;
        }
      }
    }

    const under10 = Object.entries(counts).filter(([, count]) => count < 10);
    expect(under10).toEqual([]);
  });

  it('todas las tarjetas deben cumplir estrictamente el esquema Zod FlashcardItemSchema', () => {
    for (const card of cards) {
      const res = FlashcardItemSchema.safeParse(card);
      expect(res.success).toBe(true);
    }
  });

  it('no deben existir identificadores duplicados', () => {
    const idSet = new Set<string>();
    for (const card of cards) {
      expect(idSet.has(card.id)).toBe(false);
      idSet.add(card.id);
    }
  });

  it('las longitudes de anverso y reverso deben respetar los límites de calidad', () => {
    for (const card of cards) {
      expect(card.frontTitle.length).toBeLessThanOrEqual(140);
      expect(card.backDescription.length).toBeLessThanOrEqual(400);
    }
  });

  it('debe existir tarjeta para al menos el 95% de las opciones/flags documentadas con nombre', () => {
    const cmds = (yaml.load(fs.readFileSync(path.join(rootDir, 'content-src/commands.yaml'), 'utf-8')) as Array<{
      flags?: Array<{ flag: string }>;
    }>) || [];

    let totalNamedFlags = 0;
    for (const cmd of cmds) {
      if (Array.isArray(cmd.flags)) {
        for (const f of cmd.flags) {
          if (f.flag && f.flag.trim() !== '-' && f.flag.trim() !== '') {
            totalNamedFlags++;
          }
        }
      }
    }

    const flagCards = cards.filter((c) => c.kind === 'opcion' || c.type === 'flag');
    expect(flagCards.length).toBeGreaterThanOrEqual(Math.floor(totalNamedFlags * 0.95));
  });
});

