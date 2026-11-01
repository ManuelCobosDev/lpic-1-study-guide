import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('R1 · Extracción oficial del PDF (102-500)', () => {
  const extractDir = path.resolve('content-src/_extract/102-500');

  it('debe existir el directorio y los archivos principales de extracción', () => {
    expect(fs.existsSync(extractDir)).toBe(true);
    expect(fs.existsSync(path.join(extractDir, 'units.json'))).toBe(true);
    expect(fs.existsSync(path.join(extractDir, 'objectives.json'))).toBe(true);
    expect(fs.existsSync(path.join(extractDir, 'pages.json'))).toBe(true);
    expect(fs.existsSync(path.join(extractDir, 'extraction-report.md'))).toBe(true);
    expect(fs.existsSync(path.join(extractDir, 'extract-overview.html'))).toBe(true);
  });

  it('debe contener exactamente 19 objetivos con los pesos oficiales de 07-curriculo.md', () => {
    const raw = fs.readFileSync(path.join(extractDir, 'objectives.json'), 'utf-8');
    const objectives = JSON.parse(raw);

    expect(objectives.length).toBe(19);

    const expectedWeights: Record<string, number> = {
      '105.1': 4, '105.2': 4,
      '106.1': 2, '106.2': 1, '106.3': 1,
      '107.1': 5, '107.2': 4, '107.3': 3,
      '108.1': 3, '108.2': 4, '108.3': 3, '108.4': 2,
      '109.1': 4, '109.2': 4, '109.3': 4, '109.4': 2,
      '110.1': 3, '110.2': 3, '110.3': 4
    };

    for (const obj of objectives) {
      expect(expectedWeights[obj.id]).toBeDefined();
      expect(obj.weight).toBe(expectedWeights[obj.id]);
      expect(obj.lessons.length).toBeGreaterThanOrEqual(1);
      expect(obj.unitsCount).toBeGreaterThan(20);
      expect(obj.unitsByKind['heading']).toBeGreaterThan(0);
      expect(obj.unitsByKind['paragraph']).toBeGreaterThan(0);
      expect(obj.unitsByKind['key-knowledge']).toBeGreaterThan(0);
      expect(obj.unitsByKind['key-files']).toBeGreaterThan(0);
    }
  });

  it('debe registrar 594 páginas con contabilidad >= 99.5% en todas ellas', () => {
    const raw = fs.readFileSync(path.join(extractDir, 'pages.json'), 'utf-8');
    const pages = JSON.parse(raw);

    expect(pages.length).toBe(594);
    const belowThreshold = pages.filter((p: { coveragePercent: number }) => p.coveragePercent < 99.5);
    expect(belowThreshold.length).toBe(0);
  });

  it('debe extraer las 4 figuras técnicas en resolución original', () => {
    const figDir = path.join(extractDir, 'figures');
    const expected = [
      '106.1-p135-f1.png',
      '106.1-p137-f1.png',
      '106.2-p155-f1.png',
      '106.2-p155-f2.png'
    ];
    for (const f of expected) {
      const p = path.join(figDir, f);
      expect(fs.existsSync(p)).toBe(true);
      expect(fs.statSync(p).size).toBeGreaterThan(5000);
    }
  });

  it('las unidades atómicas deben tener formato y tokens válidos según Spec 11', () => {
    const raw = fs.readFileSync(path.join(extractDir, 'units.json'), 'utf-8');
    const units = JSON.parse(raw);

    expect(units.length).toBeGreaterThan(9000);

    const first = units[0];
    expect(first.id).toMatch(/^\d{3}\.\d#u\d{3}$/);
    expect(first.objective).toBeDefined();
    expect(first.topic).toBeDefined();
    expect(first.kind).toBeDefined();
    expect(first.format).toBeDefined();
    expect(first.tokens).toBeDefined();
    expect(Array.isArray(first.tokens.commands)).toBe(true);
    expect(Array.isArray(first.tokens.flags)).toBe(true);
    expect(Array.isArray(first.tokens.paths)).toBe(true);
    expect(Array.isArray(first.tokens.vars)).toBe(true);
    expect(Array.isArray(first.tokens.numbers)).toBe(true);
    expect(Array.isArray(first.tokens.terms)).toBe(true);
    expect(Array.isArray(first.tokens.acronyms)).toBe(true);
  });
});

