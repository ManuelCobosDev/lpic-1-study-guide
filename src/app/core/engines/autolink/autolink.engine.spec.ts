import { describe, it, expect } from 'vitest';
import {
  AutolinkEntry,
  buildMatchCandidates,
  autolinkText,
  autolinkSlide,
  calculateExplainedInForEntry,
  validateExplainedIn
} from './autolink.engine';
import { Slide } from '../../models/slide.model';
import { Lesson } from '../../models/lesson.model';

describe('AutolinkEngine (Spec 13)', () => {
  const sampleEntries: AutolinkEntry[] = [
    {
      id: 'chmod',
      nameOrTerm: 'chmod',
      type: 'command',
      explainedIn: ['105.1#2'],
      short: 'Cambia los permisos de acceso a ficheros.'
    },
    {
      id: 'chown',
      nameOrTerm: 'chown',
      type: 'command',
      explainedIn: ['105.1#5'],
      short: 'Cambia el propietario de un fichero.'
    },
    {
      id: 'redireccion-salida',
      nameOrTerm: 'redirección de salida',
      type: 'term',
      aliases: ['redirección estándar de salida'],
      explainedIn: ['105.2#4'],
      short: 'Envía la salida estándar a un archivo mediante > o >>.'
    },
    {
      id: 'redireccion',
      nameOrTerm: 'redirección',
      type: 'term',
      explainedIn: ['105.2#3'],
      short: 'Mecanismo para desviar canales de entrada/salida.'
    },
    {
      id: 'pipe',
      nameOrTerm: 'tubería',
      aliases: ['pipe'],
      type: 'term',
      explainedIn: ['105.2#6'],
      short: 'Canal de comunicación unidireccional entre procesos mediante |.'
    }
  ];

  const candidates = buildMatchCandidates(sampleEntries);

  describe('Regla 1: Coincidencia más larga primero, mayúsculas, tildes y plurales', () => {
    it('debe priorizar la frase más larga ("redirección de salida" antes que "redirección")', () => {
      const text = 'Utilice la redirección de salida para volcar datos a un archivo.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 1 });
      expect(res).toContain('[redirección de salida](term:redireccion-salida)');
      expect(res).not.toContain('[redirección](term:redireccion)');
    });

    it('los comandos deben ser sensibles a mayúsculas (CHMOD no debe enlazarse)', () => {
      const text = 'Ejecute chmod para cambiar permisos, pero CHMOD en mayúsculas no es un comando.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 1 });
      expect(res).toContain('[chmod](cmd:chmod)');
      expect(res).not.toContain('[CHMOD](cmd:chmod)');
    });

    it('los términos deben ser insensibles a mayúsculas y acentos', () => {
      const text = 'Una REDIRECCION sin tilde y en mayúsculas sigue siendo válida.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 1 });
      expect(res).toContain('[REDIRECCION](term:redireccion)');
    });

    it('debe reconocer aliases de términos ("pipe" para "tubería")', () => {
      const text = 'Conecte comandos mediante un pipe de shell.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 1 });
      expect(res).toContain('[pipe](term:pipe)');
    });

    it('debe reconocer plurales simples en términos ("tuberías")', () => {
      const text = 'El sistema admite múltiples tuberías encadenadas.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 1 });
      expect(res).toContain('[tuberías](term:pipe)');
    });
  });

  describe('Regla 2: Solo una primera aparición por diapositiva', () => {
    it('no debe enlazar la segunda aparición del mismo término en la misma diapositiva', () => {
      const text = 'El comando chmod es vital. Recuerde que chmod requiere permisos adecuados.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 1 });
      const count = (res.match(/\[chmod\]\(cmd:chmod\)/g) || []).length;
      expect(count).toBe(1);
      expect(res).toContain('Recuerde que chmod requiere');
    });
  });

  describe('Regla 3: Restricciones de contexto (code, terminal, enlaces existentes y diapositiva principal)', () => {
    it('NO debe enlazar dentro de un enlace markdown existente', () => {
      const text = 'Consulte [manual de chmod](https://man7.org) en línea.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 1 });
      expect(res).toBe(text); // Sin modificar
    });

    it('NO debe enlazar un término en la diapositiva que es su explainedIn principal', () => {
      // chmod tiene explainedIn: ['105.1#2']
      const text = 'Definición de chmod y su sintaxis.';
      const res = autolinkText(text, candidates, { subtopicId: '105.1', slideNumber: 2 });
      expect(res).not.toContain('[chmod](cmd:chmod)');
      expect(res).toBe(text);
    });

    it('autolinkSlide NO debe modificar bloques de tipo code ni terminal', () => {
      const slide: Slide = {
        id: '105.1-s1',
        slideNumber: 1,
        title: 'Gestión de Permisos',
        layout: 'content',
        blocks: [
          {
            type: 'paragraph',
            text: 'Modifique permisos con chmod en consola.'
          },
          {
            type: 'code',
            code: 'chmod 755 script.sh\nchown root script.sh',
            language: 'bash'
          },
          {
            type: 'terminal',
            lines: [{ command: 'chmod +x test.sh', output: '' }]
          }
        ]
      };

      const result = autolinkSlide(slide, '105.1', candidates);

      // Párrafo enlazado
      expect(result.blocks[0]).toMatchObject({
        type: 'paragraph',
        text: 'Modifique permisos con [chmod](cmd:chmod) en consola.'
      });

      // Code intacto
      expect(result.blocks[1]).toMatchObject({
        type: 'code',
        code: 'chmod 755 script.sh\nchown root script.sh'
      });

      // Terminal intacto
      expect(result.blocks[2]).toMatchObject({
        type: 'terminal',
        lines: [{ command: 'chmod +x test.sh', output: '' }]
      });
    });
  });

  describe('calculateExplainedInForEntry (Puntuación Spec 13 §13.1)', () => {
    const mockLessons: Lesson[] = [
      {
        id: '105.1',
        topicId: '105',
        examId: '102',
        title: 'Shell',
        version: '1.0.0',
        language: 'es',
        estimatedMinutes: 40,
        objectives: [],
        keyTerms: [],
        commands: ['grep'],
        placeholder: false,
        slides: [
          {
            id: 's1',
            slideNumber: 1,
            title: 'Introducción a la shell',
            layout: 'content',
            blocks: [{ type: 'paragraph', text: 'Aquí usamos grep casualmente.' }]
          },
          {
            id: 's2',
            slideNumber: 2,
            title: 'El comando grep y expresiones regulares', // +100
            layout: 'content',
            blocks: [
              { type: 'heading', level: 2, text: 'Sintaxis de grep' }, // +100
              { type: 'paragraph', text: 'El comando **grep** busca patrones.' } // +50
            ]
          }
        ]
      }
    ];

    it('debe puntuar más alto la diapositiva con título/encabezado y negrita', () => {
      const entry: AutolinkEntry = {
        id: 'grep',
        nameOrTerm: 'grep',
        type: 'command',
        subtopicIds: ['105.1']
      };

      const locs = calculateExplainedInForEntry(entry, mockLessons);
      expect(locs.length).toBeGreaterThan(0);
      expect(locs[0]).toBe('105.1#2');
    });

    it('debe respetar explainedIn ya definido manualmente', () => {
      const entry: AutolinkEntry = {
        id: 'grep',
        nameOrTerm: 'grep',
        type: 'command',
        explainedIn: ['105.1#99']
      };
      const locs = calculateExplainedInForEntry(entry, mockLessons);
      expect(locs).toEqual(['105.1#99']);
    });
  });

  describe('validateExplainedIn (Spec 13 §13.7 Criterio 5)', () => {
    const validLessons: Lesson[] = [
      {
        id: '105.1',
        topicId: '105',
        examId: '102',
        title: 'Shell',
        version: '1.0.0',
        language: 'es',
        estimatedMinutes: 40,
        objectives: [],
        keyTerms: [],
        commands: ['grep'],
        placeholder: false,
        slides: [
          {
            id: 's1',
            slideNumber: 1,
            title: 'El comando grep',
            layout: 'content',
            blocks: [{ type: 'paragraph', text: 'Uso del comando grep para filtrar.' }]
          }
        ]
      }
    ];

    it('debe pasar si el término existe en la diapositiva indicada', () => {
      const entries: AutolinkEntry[] = [
        {
          id: 'grep',
          nameOrTerm: 'grep',
          type: 'command',
          explainedIn: ['105.1#1']
        }
      ];

      const res = validateExplainedIn(entries, validLessons);
      expect(res.valid).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('debe fallar si un término no tiene ubicación y carece de sinExplicacion', () => {
      const entries: AutolinkEntry[] = [
        {
          id: 'unknown-cmd',
          nameOrTerm: 'unknown-cmd',
          type: 'command'
          // sin explainedIn y sin sinExplicacion
        }
      ];

      const res = validateExplainedIn(entries, validLessons);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('no tiene ubicación en explainedIn ni motivo en sinExplicacion');
    });

    it('debe pasar si un término no tiene ubicación pero lleva sinExplicacion justificada', () => {
      const entries: AutolinkEntry[] = [
        {
          id: 'unknown-cmd',
          nameOrTerm: 'unknown-cmd',
          type: 'command',
          sinExplicacion: 'Comando complementario de laboratorio'
        }
      ];

      const res = validateExplainedIn(entries, validLessons);
      expect(res.valid).toBe(true);
    });

    it('debe fallar si la ubicación indicada no contiene realmente el término', () => {
      const entries: AutolinkEntry[] = [
        {
          id: 'sed',
          nameOrTerm: 'sed',
          type: 'command',
          explainedIn: ['105.1#1'] // La diapositiva solo habla de grep, no de sed
        }
      ];

      const res = validateExplainedIn(entries, validLessons);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('no contiene realmente el término o comando "sed"');
    });
  });
});

