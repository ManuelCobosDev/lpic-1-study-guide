import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildContent } from './build-content';

describe('build-content pipeline (Gate 2: generación y validación)', () => {
  const tmpDir = path.resolve(process.cwd(), 'tmp-test-build-content');
  const tmpSrc = path.join(tmpDir, 'content-src');
  const tmpOut = path.join(tmpDir, 'public/content');

  beforeEach(() => {
    fs.mkdirSync(tmpSrc, { recursive: true });
    fs.mkdirSync(tmpOut, { recursive: true });
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Limpieza silenciosa
    }
  });

  it('debe generar el manifiesto con contadores derivados exactos y archivos por recurso', () => {
    const manifest = buildContent({
      contentSrcDir: path.resolve(process.cwd(), 'content-src'),
      outputDir: tmpOut
    });

    expect(manifest.version).toBe('1.0.0');
    expect(manifest.exams).toHaveLength(2);
    expect(manifest.topics).toHaveLength(10);
    expect(manifest.subtopics).toHaveLength(42);

    expect(manifest.stats.totalExams).toBe(2);
    expect(manifest.stats.totalTopics).toBe(10);
    expect(manifest.stats.totalSubtopics).toBe(42);
    expect(manifest.stats.availableSubtopics).toBe(42);
    expect(manifest.stats.plannedSubtopics).toBe(0);

    // Archivos generados en disco
    expect(fs.existsSync(path.join(tmpOut, 'manifest.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpOut, 'lessons/101.1.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpOut, 'labs/lab-101-1.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpOut, 'questions/101.json'))).toBe(true);
  });

  it('debe fallar (process.exit) si el curriculo esta malformado segun Zod (peso negativo o campo ausente)', () => {
    const invalidCurriculum = `
exams:
  - id: "101"
    code: "101-500"
    title: "Invalido"
    description: "Test"
    status: "available"
    weight: -60 # Invalido segun Zod (positive)
    topicIds: []
topics: []
subtopics: []
`;
    fs.writeFileSync(path.join(tmpSrc, 'curriculum.yaml'), invalidCurriculum, 'utf-8');

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('PROCESS_EXIT_CALLED');
    }) as unknown as (code?: string | number | null | undefined) => never);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      buildContent({
        contentSrcDir: tmpSrc,
        outputDir: tmpOut
      });
    }).toThrow('PROCESS_EXIT_CALLED');

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

