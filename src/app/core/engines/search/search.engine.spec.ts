import { describe, it, expect, beforeEach } from 'vitest';
import {
  SearchEngine,
  normalizeSearchText,
  highlightTextSnippet
} from './search.engine';
import { SearchIndexSource } from '../../models/search.model';

describe('SearchEngine (Gate 6)', () => {
  let engine: SearchEngine;

  const mockIndexSource: SearchIndexSource = {
    subtopics: [
      {
        id: '103.4',
        topicId: '103',
        examId: '101',
        title: 'Uso de tuberías, flujos y filtros',
        objectives: [
          'Redirigir flujos estándar stdin, stdout y stderr',
          'Enviar salida a archivo y pantalla simultáneamente con tee'
        ],
        keyTerms: ['stdin', 'stdout', 'stderr', 'tubería', 'tee', 'xargs'],
        commands: ['tee', 'xargs', 'grep', 'wc']
      },
      {
        id: '103.1',
        topicId: '103',
        examId: '101',
        title: 'Trabajo en la línea de comandos',
        objectives: ['Comandos bash básicos'],
        keyTerms: ['shell', 'bash'],
        commands: ['echo', 'pwd']
      }
    ],
    slides: [
      {
        subtopicId: '103.4',
        topicId: '103',
        slideNumber: 1,
        title: 'Uso de flujos, tuberías y redirecciones',
        headings: ['Flujos estándar', 'Tuberías y pipes'],
        text: 'Los pipes conectan la salida estándar de un proceso con la entrada de otro comando.',
        code: ['cat file | grep error | tee log.txt'],
        notes: 'Enfatizar la diferencia entre tee y la redirección normal.'
      },
      {
        subtopicId: '103.4',
        topicId: '103',
        slideNumber: 2,
        title: 'Bifurcación con tee',
        headings: ['El comando tee'],
        text: 'El comando tee lee de la entrada estándar y escribe en la salida estándar y en archivos al mismo tiempo.',
        code: ['ls -la | tee listado.txt']
      }
    ],
    commands: [
      {
        name: 'tee',
        summary: 'Lee de la entrada estándar y escribe en la salida estándar y en archivos',
        description: 'Bifurca el flujo de datos para guardar logs y verlos en pantalla simultáneamente.',
        flags: ['-a', '-i'],
        subtopicId: '103.4'
      },
      {
        name: 'grep',
        summary: 'Imprime líneas que coinciden con un patrón',
        flags: ['-i', '-v', '-n'],
        subtopicId: '103.4'
      }
    ],
    terms: [
      {
        term: 'tubería',
        definition: 'Mecanismo de comunicación entre procesos (|) que canaliza la salida de un programa hacia la entrada de otro.',
        subtopicId: '103.4'
      },
      {
        term: 'tee',
        definition: 'Comando que recibe su nombre de las tuberías en forma de T de fontanería.',
        subtopicId: '103.4'
      }
    ],
    labs: [
      {
        id: '103.4',
        subtopicId: '103.4',
        title: 'Práctica de Redirecciones y Tuberías',
        summary: 'Dominar el uso de stdin, stdout, tee y pipes en bash.',
        commands: ['tee', 'grep', 'wc']
      }
    ]
  };

  beforeEach(() => {
    engine = new SearchEngine();
    engine.indexAll(mockIndexSource);
  });

  describe('normalizeSearchText', () => {
    it('debe convertir a minúsculas y remover acentos y diacríticos', () => {
      expect(normalizeSearchText('Tuberías')).toBe('tuberias');
      expect(normalizeSearchText('Redirección estándar')).toBe('redireccion estandar');
      expect(normalizeSearchText('ÁÉÍÓÚ ñ')).toBe('aeiou n');
    });
  });

  describe('highlightTextSnippet', () => {
    it('debe envolver los términos con <mark> y respetar mayúsculas originales', () => {
      const text = 'El comando tee permite bifurcar la salida estándar hacia un archivo.';
      const snippet = highlightTextSnippet(text, 'tee');
      expect(snippet).toContain('<mark>tee</mark>');
    });

    it('debe resaltar incluso si la búsqueda no tiene tilde y el texto sí', () => {
      const text = 'Uso avanzado de tuberías en entornos Linux.';
      const snippet = highlightTextSnippet(text, 'tuberias');
      expect(snippet).toContain('<mark>tuberías</mark>');
    });
  });

  describe('SearchEngine.search', () => {
    it('debe devolver resultados vacíos para consultas vacías o solo espacios', () => {
      expect(engine.search('')).toEqual([]);
      expect(engine.search('   ')).toEqual([]);
    });

    it('buscar un comando ("tee") devuelve el comando, diapositivas y término de glosario (Gate 6)', () => {
      const results = engine.search('tee');
      expect(results.length).toBeGreaterThan(0);

      const types = results.map((r) => r.type);
      expect(types).toContain('command');
      expect(types).toContain('slide');
      expect(types).toContain('term');

      const cmdMatch = results.find((r) => r.type === 'command' && r.title === 'tee');
      expect(cmdMatch).toBeDefined();
      expect(cmdMatch?.url).toContain('/comandos');

      const slideMatch = results.find((r) => r.type === 'slide');
      expect(slideMatch).toBeDefined();
      expect(slideMatch?.url).toContain('/estudiar/103.4?slide=');
    });

    it('buscar código exacto ("103.4") lleva prioritariamente al subtema (Gate 6)', () => {
      const results = engine.search('103.4');
      expect(results.length).toBeGreaterThan(0);

      const first = results[0]!;
      expect(first.type).toBe('curriculum');
      expect(first.url).toBe('/estudiar/103.4');
      expect(first.exactMatch).toBe(true);
    });

    it('buscar sin tilde ("tuberias") encuentra la palabra con tilde (Gate 6)', () => {
      const results = engine.search('tuberias');
      expect(results.length).toBeGreaterThan(0);

      const hasTuberia = results.some(
        (r) => r.title.toLowerCase().includes('tubería') || r.snippet.toLowerCase().includes('tubería')
      );
      expect(hasTuberia).toBe(true);
    });

    it('debe filtrar adecuadamente por tipo si se especifica en options.filter', () => {
      const onlyCommands = engine.search('tee', { filter: 'command' });
      expect(onlyCommands.length).toBeGreaterThan(0);
      expect(onlyCommands.every((r) => r.type === 'command')).toBe(true);

      const onlySlides = engine.search('tee', { filter: 'slide' });
      expect(onlySlides.length).toBeGreaterThan(0);
      expect(onlySlides.every((r) => r.type === 'slide')).toBe(true);
    });

    it('las preguntas del simulador NO deben existir en el índice de búsqueda (Gate 6)', () => {
      // Intentar buscar palabras que solo estarían en un simulador
      const results = engine.search('pregunta simulador opciones respuesta');
      const questionResults = results.filter((r) => (r.type as string) === 'question');
      expect(questionResults).toHaveLength(0);
    });
  });
});
