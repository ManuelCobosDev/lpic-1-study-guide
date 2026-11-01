import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { evaluateCoverage } from './coverage/verify-coverage';
import { generateCoverageHtml } from './coverage/report-coverage';
import { registerValidation } from './coverage/validation-register';
import { verifyValidations } from './coverage/verify-validations';
import { computeSubtopicHash } from './coverage/hash-utils';
import { parseSrcString } from './coverage/parser-utils';
import { ExtractedUnit, Ledger } from './coverage/types';
import { Slide } from '../src/app/core/models/slide.model';

describe('R2 · Herramientas de cobertura y validación', () => {
  const tempFixtureDir = path.resolve('scripts/coverage/__test_fixtures__');
  const syntheticSubtopic = '999.1';

  const syntheticUnits: ExtractedUnit[] = [
    {
      id: '999.1#u001',
      objective: '999.1',
      topic: '999',
      kind: 'heading',
      lesson: 'Lección 1',
      section: 'Introducción',
      page: 10,
      order: 1,
      text: 'Introducción a FooBar',
      format: { mono: false, bold: ['FooBar'], italic: [] },
      tokens: {
        commands: ['foocmd'],
        flags: ['-a', '--verbose'],
        paths: ['/etc/foobar.conf'],
        vars: ['$FOO_VAR'],
        numbers: ['8080'],
        terms: ['servicio seguro'],
        acronyms: ['TLS']
      }
    },
    {
      id: '999.1#u002',
      objective: '999.1',
      topic: '999',
      kind: 'paragraph',
      lesson: 'Lección 1',
      section: 'Configuración',
      page: 11,
      order: 2,
      text: 'Explicación del servicio seguro y variables de entorno.',
      format: { mono: false, bold: [], italic: [] },
      tokens: {
        commands: ['barcmd'],
        flags: ['-b'],
        paths: ['/var/log/foobar.log'],
        vars: [],
        numbers: [],
        terms: [],
        acronyms: []
      }
    },
    {
      id: '999.1#u003',
      objective: '999.1',
      topic: '999',
      kind: 'other',
      lesson: 'Lección 1',
      section: 'Detalle secundario',
      page: 12,
      order: 3,
      text: 'Cabecera de página repetida',
      format: { mono: false, bold: [], italic: [] },
      tokens: { commands: [], flags: [], paths: [], vars: [], numbers: [], terms: [], acronyms: [] }
    }
  ];

  const createValidSlides = (): Slide[] => [
    {
      id: '999.1-s1',
      slideNumber: 1,
      title: 'Portada FooBar',
      layout: 'cover',
      src: 'meta',
      blocks: [
        { type: 'heading', level: 1, text: 'Bienvenida FooBar' }
      ]
    },
    {
      id: '999.1-s2',
      slideNumber: 2,
      title: 'Uso de foocmd',
      layout: 'content',
      src: '999.1#u001',
      blocks: [
        {
          type: 'paragraph',
          text: 'Ejecute foocmd con flags -a y --verbose configurando /etc/foobar.conf. Expone puerto 8080 con $FOO_VAR y servicio seguro con TLS.'
        }
      ]
    },
    {
      id: '999.1-s3',
      slideNumber: 3,
      title: 'Uso de barcmd',
      layout: 'content',
      src: '999.1#u002',
      blocks: [
        {
          type: 'paragraph',
          text: 'El comando barcmd usa el flag -b y registra en /var/log/foobar.log.'
        }
      ]
    }
  ];

  beforeEach(() => {
    fs.mkdirSync(tempFixtureDir, { recursive: true });
    // Guardar ledger que omite 999.1#u003
    const ledgerYaml = `
objective: "999.1"
omit:
  999.1#u003: "Cabecera de página no técnica"
tokenWaivers: []
authorContent: []
`;
    fs.writeFileSync(path.join(tempFixtureDir, '999.1.ledger.yaml'), ledgerYaml, 'utf-8');
  });

  afterEach(() => {
    if (fs.existsSync(tempFixtureDir)) {
      fs.rmSync(tempFixtureDir, { recursive: true, force: true });
    }
  });

  describe('parser-utils', () => {
    it('debe expandir rangos de unidades src correctamente', () => {
      const res = parseSrcString('105.1#u014-u017, 105.1#u020');
      expect(res.unitIds).toEqual([
        '105.1#u014',
        '105.1#u015',
        '105.1#u016',
        '105.1#u017',
        '105.1#u020'
      ]);
      expect(res.isMeta).toBe(false);
      expect(res.isAutor).toBe(false);
    });

    it('debe reconocer valores especiales meta y autor', () => {
      expect(parseSrcString('<!-- src: meta -->').isMeta).toBe(true);
      expect(parseSrcString('src: autor').isAutor).toBe(true);
    });
  });

  describe('verify:coverage (10 Reglas de Spec 11 §11.6)', () => {
    it('fixture válido con todas las unidades y tokens cubiertos o justificados debe pasar', () => {
      const slides = createValidSlides();
      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      expect(report.failures.length).toBe(0);
      expect(report.passed).toBe(true);
      expect(report.mappedUnitsCount).toBe(2);
      expect(report.omittedUnitsCount).toBe(1);
    });

    it('debe detectar unidad sin mapear ni omitir (Regla 1)', () => {
      // Dejamos ledger vacío sin omitir u003
      fs.writeFileSync(path.join(tempFixtureDir, '999.1.ledger.yaml'), 'objective: "999.1"\n', 'utf-8');
      const slides = createValidSlides();
      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      expect(report.passed).toBe(false);
      const r1 = report.failures.find(f => f.rule === 1);
      expect(r1).toBeDefined();
      expect(r1?.message).toContain('sin mapear en lección ni omitidas en el ledger');
    });

    it('debe detectar token técnico ausente en el texto destino (Regla 2)', () => {
      const slides = createValidSlides();
      // Omitimos el token $FOO_VAR del texto
      slides[1]!.blocks[0] = {
        type: 'paragraph',
        text: 'Ejecute foocmd con flags -a y --verbose configurando /etc/foobar.conf. Expone puerto 8080 y servicio seguro con TLS.'
      };

      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      expect(report.passed).toBe(false);
      const r2 = report.failures.find(f => f.rule === 2);
      expect(r2).toBeDefined();
      expect(r2?.title).toContain('Tokens técnicos ausentes');
    });

    it('debe aceptar exención justificada en el ledger (tokenWaivers)', () => {
      const slides = createValidSlides();
      slides[1]!.blocks[0] = {
        type: 'paragraph',
        text: 'Ejecute foocmd con flags -a y --verbose configurando /etc/foobar.conf. Expone puerto 8080 y servicio seguro con TLS.'
      };

      // Añadimos exención con motivo
      const ledgerWithWaiver = `
objective: "999.1"
omit:
  999.1#u003: "Cabecera repetida"
tokenWaivers:
  - token: "$FOO_VAR"
    unit: "999.1#u001"
    reason: "Se ejemplifica como variable genérica en el laboratorio"
`;
      fs.writeFileSync(path.join(tempFixtureDir, '999.1.ledger.yaml'), ledgerWithWaiver, 'utf-8');

      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      expect(report.failures.filter(f => f.rule === 2).length).toBe(0);
    });

    it('debe rechazar exenciones que superen el 3% de los tokens (Regla 10)', () => {
      const ledgerExcessWaivers = `
objective: "999.1"
omit:
  999.1#u003: "Cabecera"
tokenWaivers:
  - { token: "foocmd", unit: "999.1#u001", reason: "w1" }
  - { token: "-a", unit: "999.1#u001", reason: "w2" }
  - { token: "--verbose", unit: "999.1#u001", reason: "w3" }
`;
      fs.writeFileSync(path.join(tempFixtureDir, '999.1.ledger.yaml'), ledgerExcessWaivers, 'utf-8');

      const slides = createValidSlides();
      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      const r10 = report.failures.find(f => f.rule === 10);
      expect(r10).toBeDefined();
      expect(r10?.message).toContain('El límite estricto es 3.0%');
    });

    it('debe detectar bloques sin fuente de trazabilidad (Regla 3)', () => {
      const slides = createValidSlides();
      delete slides[1]!.src; // Sin src en diapositiva ni en bloque

      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      const r3 = report.failures.find(f => f.rule === 3);
      expect(r3).toBeDefined();
      expect(r3?.message).toContain('bloques sin anotación de trazabilidad');
    });

    it('debe detectar referencias src a unidades inexistentes (Regla 4)', () => {
      const slides = createValidSlides();
      slides[1]!.src = '999.1#u999'; // No existe en units

      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      const r4 = report.failures.find(f => f.rule === 4);
      expect(r4).toBeDefined();
      expect(r4?.message).toContain('referencias de src erróneas');
    });

    it('debe detectar lecciones con más de 20 diapositivas (Regla 5)', () => {
      const slides = createValidSlides();
      while (slides.length < 22) {
        slides.push({
          id: `999.1-s${slides.length + 1}`,
          slideNumber: slides.length + 1,
          title: `Diapositiva extra ${slides.length + 1}`,
          layout: 'content',
          src: 'meta',
          blocks: [{ type: 'paragraph', text: 'Extra' }]
        });
      }

      const report = evaluateCoverage(syntheticSubtopic, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      const r5 = report.failures.find(f => f.rule === 5);
      expect(r5).toBeDefined();
      expect(r5?.message).toContain('máximo permitido: 20');
    });
  });

  describe('report:coverage (Informe HTML Navegable)', () => {
    it('debe generar el HTML con clases de estado, métricas y lista de comprobación', () => {
      const slides = createValidSlides();
      const htmlOut = path.join(tempFixtureDir, '999.1.html');

      const html = generateCoverageHtml(syntheticSubtopic, htmlOut, {
        unitsOverride: syntheticUnits,
        slidesOverride: slides,
        ledgerOverrideDir: tempFixtureDir,
        skipPoolCheck: true
      });

      expect(fs.existsSync(htmlOut)).toBe(true);
      expect(html).toContain('Cobertura Oficial · Subtema 999.1');
      expect(html).toContain('unit-card covered');
      expect(html).toContain('unit-card omitted');
      expect(html).toContain('Lista de Comprobación para Validación Humana');
    });
  });

  describe('validaciones.json y verify:validations (Spec 11 §11.8)', () => {
    const testSubtopicId = 'test-subtopic';
    const testDir = path.resolve('scripts/coverage/__test_val_env__');

    beforeEach(() => {
      fs.mkdirSync(path.join(testDir, 'content-src/lessons'), { recursive: true });
      fs.mkdirSync(path.join(testDir, 'docs/agent'), { recursive: true });

      // Archivo de lección inicial
      fs.writeFileSync(
        path.join(testDir, `content-src/lessons/${testSubtopicId}.json`),
        JSON.stringify({ title: 'Lección Original', slides: [] }),
        'utf-8'
      );
    });

    afterEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('calcular hash debe ser determinista para el mismo contenido', () => {
      const h1 = computeSubtopicHash(testSubtopicId, testDir);
      const h2 = computeSubtopicHash(testSubtopicId, testDir);
      expect(h1).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(h1).toBe(h2);
    });

    it('registrar validación y verificar debe pasar con éxito', () => {
      const reg = registerValidation(testSubtopicId, testDir);
      expect(reg.success).toBe(true);
      expect(reg.hash).toMatch(/^sha256:[a-f0-9]{64}$/);

      const check = verifyValidations(testDir);
      expect(check.passed).toBe(true);
      expect(check.mismatches.length).toBe(0);
    });

    it('modificar un archivo de un subtema validado DEBE invalidar su validación', () => {
      registerValidation(testSubtopicId, testDir);

      // Modificamos el contenido de la lección tras haber sido validada
      fs.writeFileSync(
        path.join(testDir, `content-src/lessons/${testSubtopicId}.json`),
        JSON.stringify({ title: 'Lección Modificada Arbitrariamente', slides: [] }),
        'utf-8'
      );

      const check = verifyValidations(testDir);
      expect(check.passed).toBe(false);
      expect(check.mismatches.length).toBe(1);
      expect(check.mismatches[0]).toContain(`Subtema ${testSubtopicId}: hash registrado`);
    });
  });
});
