import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import {
  LessonSchema,
  LabSchema,
  QuestionSchema,
  CommandsListSchema,
  GlossaryListSchema
} from '../../src/app/core/schemas/index';
import {
  Lesson,
  Lab,
  Question,
  Command,
  GlossaryTerm,
  Slide,
  Block
} from '../../src/app/core/models/index';

interface LegacySlidePoint {
  icon?: string;
  text: string;
  detail?: string;
}

interface LegacySlideOption {
  flag?: string;
  short?: string;
  desc?: string;
}

interface LegacySlideTerminal {
  command?: string;
  output?: string;
}

interface LegacySlide {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  lead?: string;
  points?: LegacySlidePoint[];
  remember?: string;
  notes?: string;
  command?: string;
  purpose?: string;
  terminal?: LegacySlideTerminal;
  options?: LegacySlideOption[] | string[];
  diagram_html?: string;
  headers?: string[];
  rows?: string[][];
  scenario?: string;
  hint?: string;
  solution?: string | { explain?: string };
  steps?: unknown[];
  q?: string;
  answer?: number;
  why?: string;
  deck?: { front: string; back: string }[];
}

interface Legacy1034File {
  META: {
    topic: string;
    title: string;
    weight: number;
    description: string;
    duracion: string;
  };
  SLIDES: LegacySlide[];
}

export function import1034Lesson(legacyContentDir: string, destLessonsDir: string): Lesson {
  const jsonPath = path.join(legacyContentDir, 't103/103.4.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`No se encontró el archivo legacy de lección en ${jsonPath}`);
  }

  const raw: Legacy1034File = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const slides: Slide[] = [];

  for (const leg of raw.SLIDES) {
    const blocks: Block[] = [];

    // Heading principal de la diapositiva
    blocks.push({
      type: 'heading',
      level: leg.type === 'cover' ? 1 : 2,
      text: leg.title
    });

    // Subtítulo o Lead
    if (leg.subtitle) {
      blocks.push({
        type: 'paragraph',
        text: leg.subtitle
      });
    }

    if (leg.lead) {
      blocks.push({
        type: 'paragraph',
        text: leg.lead
      });
    }

    // Puntos estructurados
    if (leg.points && leg.points.length > 0) {
      const items = leg.points.map(p => {
        const detailStr = p.detail ? ` — ${p.detail}` : '';
        return `**${p.text}**${detailStr}`;
      });
      blocks.push({
        type: 'list',
        ordered: false,
        items
      });
    }

    // Comando y propósito
    if (leg.command) {
      blocks.push({
        type: 'code',
        language: 'bash',
        code: leg.command,
        title: leg.purpose ?? 'Sintaxis del comando'
      });
    }

    // Terminal interactiva
    if (leg.terminal && (leg.terminal.command || leg.terminal.output)) {
      blocks.push({
        type: 'terminal',
        lines: [
          {
            prompt: '$ ',
            command: leg.terminal.command ?? '',
            output: leg.terminal.output ?? ''
          }
        ]
      });
    }

    // Tabla nativa de la diapositiva
    if (leg.type === 'table' && leg.headers && leg.rows) {
      blocks.push({
        type: 'table',
        headers: leg.headers,
        rows: leg.rows,
        caption: leg.title
      });
    }

    // Desafío / Challenge
    if (leg.type === 'challenge') {
      if (leg.scenario) {
        blocks.push({
          type: 'callout',
          calloutType: 'warning',
          title: 'Escenario del Desafío',
          content: leg.scenario
        });
      }
      if (leg.hint) {
        blocks.push({
          type: 'callout',
          calloutType: 'tip',
          title: 'Pista',
          content: leg.hint
        });
      }
      if (leg.solution) {
        if (typeof leg.solution === 'string') {
          blocks.push({
            type: 'code',
            language: 'bash',
            code: leg.solution,
            title: 'Solución del desafío'
          });
        } else if (typeof leg.solution === 'object' && leg.solution !== null) {
          const solObj = leg.solution as { explain?: string };
          blocks.push({
            type: 'callout',
            calloutType: 'tip',
            title: 'Solución y Explicación del Desafío',
            content: solObj.explain ?? JSON.stringify(leg.solution)
          });
        }
      }
    }

    // Ejercicio práctico guiado
    if (leg.type === 'exercise') {
      if (leg.steps && Array.isArray(leg.steps)) {
        const stepItems: string[] = leg.steps.map((st: unknown) => {
          if (typeof st === 'string') return st;
          if (typeof st === 'object' && st !== null) {
            const stObj = st as { action?: string; command?: string; reason?: string };
            const act = stObj.action ?? '';
            const cmd = stObj.command ? ` — Comando: \`${stObj.command}\`` : '';
            const rsn = stObj.reason ? ` (${stObj.reason})` : '';
            return `${act}${cmd}${rsn}`;
          }
          return String(st);
        });
        blocks.push({
          type: 'list',
          ordered: true,
          items: stepItems
        });
      }
      if (leg.solution) {
        if (typeof leg.solution === 'string') {
          blocks.push({
            type: 'code',
            language: 'bash',
            code: leg.solution,
            title: 'Solución del ejercicio'
          });
        } else if (typeof leg.solution === 'object' && leg.solution !== null) {
          const solObj = leg.solution as { explain?: string };
          blocks.push({
            type: 'callout',
            calloutType: 'tip',
            title: 'Solución y Explicación del Ejercicio',
            content: solObj.explain ?? JSON.stringify(leg.solution)
          });
        }
      }
    }

    // Pregunta de repaso / Review (quiz-inline)
    if (leg.type === 'review' && leg.q && Array.isArray(leg.options)) {
      const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
      const ansIdx = typeof leg.answer === 'number' ? leg.answer : 0;
      blocks.push({
        type: 'quiz-inline',
        id: `quiz-103-4-${leg.id}`,
        question: leg.q,
        options: leg.options.map((opt, idx) => ({
          key: letters[idx] ?? `opt-${idx}`,
          text: String(opt)
        })),
        correct: [letters[ansIdx] ?? 'a'],
        explanation: leg.why ?? 'Explicación del examen LPIC-1.'
      });
    } else if (leg.options && Array.isArray(leg.options) && leg.options.length > 0) {
      // Tabla de opciones o banderas de comandos
      const isObjectList = typeof leg.options[0] === 'object' && leg.options[0] !== null;
      if (isObjectList) {
        blocks.push({
          type: 'table',
          headers: ['Operador / Bandera', 'Nombre', 'Descripción'],
          rows: (leg.options as LegacySlideOption[]).map(opt => [opt.flag ?? '', opt.short ?? '', opt.desc ?? '']),
          caption: 'Opciones y operadores de flujo'
        });
      } else {
        blocks.push({
          type: 'list',
          ordered: false,
          items: leg.options.map(String)
        });
      }
    }

    // Flashcards de memorización
    if (leg.type === 'flashcards' && Array.isArray(leg.deck)) {
      blocks.push({
        type: 'table',
        headers: ['Concepto / Operador', 'Significado / Uso'],
        rows: leg.deck.map((card: { front: string; back: string }) => [card.front, card.back]),
        caption: 'Tarjetas de memorización'
      });
    }

    // Recuerda / Clave de examen
    if (leg.remember) {
      blocks.push({
        type: 'callout',
        calloutType: 'exam',
        title: 'Clave de Examen LPIC-1',
        content: leg.remember
      });
    }

    // Asignación de layout según tipo
    let layout: Slide['layout'] = 'content';
    if (leg.type === 'cover') {
      layout = 'cover';
    } else if (leg.type === 'diagram') {
      layout = 'diagram';
    } else if (leg.type === 'command') {
      layout = 'content';
    } else if (leg.type === 'review' || leg.type === 'practice') {
      layout = 'checkpoint';
    } else if (leg.type === 'summary') {
      layout = 'summary';
    } else if (leg.type === 'exercise' || leg.type === 'challenge') {
      layout = 'two-column';
    }

    slides.push({
      id: `103.4-slide-${leg.id}`,
      slideNumber: leg.id,
      title: leg.title,
      layout,
      blocks,
      notes: leg.notes
    });
  }

  const lesson: Lesson = {
    id: '103.4',
    topicId: '103',
    examId: '101',
    title: raw.META.title,
    version: '1.0.0',
    language: 'es',
    estimatedMinutes: 40,
    objectives: [
      'Redirigir los flujos estándar stdin (0), stdout (1) y stderr (2)',
      'Encadenar procesos utilizando tuberías (|)',
      'Enviar la salida simultáneamente a pantalla y archivo mediante tee',
      'Procesar argumentos de línea de comandos a partir de la entrada estándar con xargs'
    ],
    keyTerms: [
      'stdin',
      'stdout',
      'stderr',
      'descriptor de archivo',
      'redirección',
      'tubería',
      'tee',
      'xargs',
      'noclobber',
      '/dev/null',
      'Here Document'
    ],
    commands: ['tee', 'xargs', 'cat', 'head', 'tail', 'wc', 'grep', 'sort', 'uniq', 'tr', 'sed', 'cut'],
    placeholder: false,
    slides,
    webDocument: [
      {
        id: 'sec-descriptores',
        title: '1. Los Tres Descriptores Estándar: stdin, stdout y stderr',
        level: 2,
        blocks: slides[1]?.blocks ?? []
      },
      {
        id: 'sec-redirecciones',
        title: '2. Operadores de Redirección y Descarte en /dev/null',
        level: 2,
        blocks: slides[2]?.blocks ?? []
      },
      {
        id: 'sec-fusion-errores',
        title: '3. Fusión de Flujos y Manejo de Errores (2>&1, &>)',
        level: 2,
        blocks: slides[3]?.blocks ?? []
      },
      {
        id: 'sec-tuberias-tee',
        title: '4. Canalización con Tuberías (|) y Bifurcación con tee',
        level: 2,
        blocks: slides[5]?.blocks ?? []
      },
      {
        id: 'sec-xargs',
        title: '5. Procesamiento Masivo con xargs y Delimitación Nula (-print0)',
        level: 2,
        blocks: slides[7]?.blocks ?? []
      }
    ],
    wikiReferences: [
      {
        id: 'cmd-tee',
        type: 'command',
        name: 'tee',
        shortDescription: 'Lee de la entrada estándar y escribe simultáneamente en la salida estándar y en archivos.'
      },
      {
        id: 'cmd-xargs',
        type: 'command',
        name: 'xargs',
        shortDescription: 'Construye y ejecuta líneas de comando a partir de argumentos leídos de la entrada estándar.'
      },
      {
        id: 'term-stdin',
        type: 'term',
        name: 'stdin',
        shortDescription: 'Descriptor 0: flujo de entrada estándar por el que un proceso recibe datos (por defecto, teclado).'
      },
      {
        id: 'term-stdout',
        type: 'term',
        name: 'stdout',
        shortDescription: 'Descriptor 1: flujo de salida estándar por el que un proceso emite resultados exitosos.'
      },
      {
        id: 'term-stderr',
        type: 'term',
        name: 'stderr',
        shortDescription: 'Descriptor 2: flujo de error estándar reservado para mensajes de diagnóstico y fallos.'
      },
      {
        id: 'term-noclobber',
        type: 'term',
        name: 'noclobber',
        shortDescription: 'Opción de shell que evita que una redirección con > sobrescriba un archivo ya existente.'
      }
    ]
  };

  const parsed = LessonSchema.parse(lesson);
  fs.mkdirSync(destLessonsDir, { recursive: true });
  fs.writeFileSync(path.join(destLessonsDir, '103.4.json'), JSON.stringify(parsed, null, 2), 'utf-8');
  return parsed;
}

export function import1034Lab(legacyPracticasDir: string, destLabsDir: string): Lab {
  const mdPath = path.join(legacyPracticasDir, 'p-103-4-redirecciones-tuberias.md');
  if (!fs.existsSync(mdPath)) {
    throw new Error(`No se encontró el archivo markdown de práctica en ${mdPath}`);
  }

  const lab: Lab = {
    id: 'lab-103-4',
    subtopicId: '103.4',
    title: 'Práctica 103.4 — Flujos Estándar, Tuberías y Redirecciones',
    estimatedMinutes: 30,
    difficulty: 'basic',
    type: 'subtopic',
    placeholder: false,
    steps: [
      {
        id: 'mision-1',
        stepNumber: 1,
        title: 'Misión 1: Separación de Salida Estándar (stdout) y Errores (stderr)',
        instruction: 'Ejecuta un comando que genere salida válida y un error al mismo tiempo, aislando cada canal en un archivo.',
        command: 'mkdir -p /tmp/redir-lab && cd /tmp/redir-lab && ls -l /etc/passwd /no_existe > aciertos.txt 2> fallos.txt',
        expectedOutput: 'aciertos.txt contiene la línea de /etc/passwd; fallos.txt contiene el mensaje de error de ls',
        examAlert: 'El descriptor 1 representa stdout (1>); el descriptor 2 representa stderr (2>).'
      },
      {
        id: 'mision-2',
        stepNumber: 2,
        title: 'Misión 2: Unificación de Flujos (2>&1) y Descarte en /dev/null',
        instruction: 'Unifica todos los mensajes (éxito y errores) en un único archivo de registro, y prueba a descartar errores.',
        command: 'ls -l /etc/passwd /no_existe > salida_completa.txt 2>&1 && ls /no_existe 2> /dev/null',
        expectedOutput: 'salida_completa.txt contiene tanto el acierto como el error sin mostrar nada por pantalla',
        hint: '/dev/null actúa como el agujero negro del sistema de archivos; descarta datos sin ocupar espacio.'
      },
      {
        id: 'mision-3',
        stepNumber: 3,
        title: 'Misión 3: Concatenación con >> y Redirección de Entrada con <',
        instruction: 'Añade líneas al final de un archivo sin destruirlo y utiliza el contenido como entrada estándar de wc.',
        command: 'echo "Línea 1" > datos.txt && echo "Línea 2" >> datos.txt && wc -l < datos.txt',
        expectedOutput: '2'
      },
      {
        id: 'mision-4',
        stepNumber: 4,
        title: 'Misión 4: Entrada Masiva con Here Documents (<<) y Here Strings (<<<)',
        instruction: 'Envía texto multilínea directamente al comando cat sin necesidad de crear archivos previos.',
        command: 'cat << "EOF" > script.sh\n#!/bin/bash\necho "Script generado con HereDoc"\nEOF\nchmod +x script.sh && ./script.sh',
        expectedOutput: 'Script generado con HereDoc'
      },
      {
        id: 'mision-5',
        stepNumber: 5,
        title: 'Misión 5: Creación de Tuberías con | y Bifurcación con tee',
        instruction: 'Conecta dos comandos con una tubería y usa tee para ver la salida por pantalla mientras se guarda en disco.',
        command: 'ls /etc | grep conf | tee lista_conf.txt | wc -l',
        expectedOutput: 'Muestra los ficheros filtrados en pantalla y devuelve el número total de coincidencias'
      },
      {
        id: 'mision-6',
        stepNumber: 6,
        title: 'Misión 6: Procesamiento Masivo con xargs y Delimitación Nula (-print0 / -0)',
        instruction: 'Usa find junto con xargs para procesar archivos de manera segura incluso con nombres que contienen espacios.',
        command: 'find /tmp/redir-lab -name "*.txt" -print0 | xargs -0 ls -lh',
        expectedOutput: 'Listado detallado de cada archivo .txt procesado de forma atómica',
        examAlert: 'find -print0 combinado con xargs -0 garantiza que los espacios no rompan los argumentos del comando.'
      }
    ],
    solutionNotes: 'Práctica 103.4 completada satisfactoriamente con verificación de los 6 pasos guiados.'
  };

  const parsed = LabSchema.parse(lab);
  fs.mkdirSync(destLabsDir, { recursive: true });
  fs.writeFileSync(path.join(destLabsDir, '103.4.yaml'), yaml.dump(parsed), 'utf-8');
  return parsed;
}

export function import103Questions(legacyQuestionsFile: string, destQuestionsDir: string): Question[] {
  if (!fs.existsSync(legacyQuestionsFile)) {
    throw new Error(`No se encontró el banco de preguntas en ${legacyQuestionsFile}`);
  }

  const rawQuestions = JSON.parse(fs.readFileSync(legacyQuestionsFile, 'utf-8'));
  const raw103 = rawQuestions.filter((q: { tema: number }) => q.tema === 103);

  // Diccionario exhaustivo de traducción al español para los enunciados del Tema 103
  const stemTranslations: Record<number, string> = {
    28: '¿Cuál es el valor máximo de niceness que un usuario regular sin privilegios de root puede asignar a un proceso con el comando nice al ejecutarlo?',
    30: '¿Cuáles de los siguientes son operadores válidos de redirección de flujos en Bash? (Selecciona DOS respuestas)',
    31: '¿Cuál de los siguientes comandos del editor vi elimina dos líneas: la línea actual y la siguiente?',
    32: 'Desde una shell Bash, ¿cuáles de los siguientes comandos ejecutan directamente un nuevo proceso en segundo plano? (Selecciona DOS respuestas)',
    33: '¿Qué programa ejecuta periódicamente un comando a intervalos especificados y actualiza su salida en pantalla completa?',
    34: 'Inmediatamente después de borrar 3 líneas en el editor vi y mover el cursor, ¿qué comando pega el texto borrado?',
    35: '¿Cuál de los siguientes comandos elimina todos los retornos de carro (CR-LF de Windows) convirtiéndolos a saltos de línea de Linux?',
    36: '¿Qué comando debe introducirse en el editor vi para guardar los cambios en el archivo actual antes de salir?',
    37: '¿Cuál de los siguientes comandos muestra la salida del comando foo en pantalla y a la vez la escribe en el archivo /tmp/foodata?',
    38: '¿Qué salida se mostrará cuando el usuario fred ejecute el comando en la terminal?',
    39: '¿Cuál de los siguientes comandos muestra la ruta completa hacia el archivo ejecutable de un comando en el PATH?',
    41: '¿Cuál de los siguientes comandos se utiliza para determinar cuánto tiempo lleva encendido y en funcionamiento el sistema?',
    44: '¿Cuál de los siguientes comandos redirige la salida del comando ls al archivo lista.txt sobrescribiendo su contenido?',
    47: '¿Cuál de las siguientes expresiones regulares representa exactamente cualquier carácter individual?',
    49: 'Dado un archivo de registro con fechas, ¿qué comando permite filtrar exclusivamente los eventos de un mes determinado?',
    59: '¿Cuáles de los siguientes comandos son válidos en el archivo de configuración de GRUB 2? (Selecciona DOS respuestas)',
    61: '¿Para qué propósitos se puede utilizar LVM (Logical Volume Manager)? (Selecciona DOS respuestas)',
    65: '¿Cuántos campos separados por dos puntos contiene una línea sintácticamente correcta del fichero /etc/passwd?',
    68: '¿Cuál de los siguientes comandos asigna el permiso especial SetUID al archivo ejecutable binario?',
    73: '¿Cuál de los siguientes comandos indica cómo interpretará la shell un comando (alias, función interna o ejecutable en disco)?',
    74: '¿Cuál de los siguientes comandos muestra la página del manual oficial que coincide exactamente con el nombre indicado?',
    76: '¿Cuál de los siguientes comandos se utiliza para cambiar opciones internas del entorno de la shell actual?',
    78: '¿Cuáles de las siguientes secuencias en el editor vi guardan las modificaciones del archivo actual y salen del editor? (Selecciona DOS respuestas)',
    79: '¿Cuál es el efecto de la opción -v en el comando grep?',
    81: '¿Cuál es el resultado de aplicar una sustitución por expresión regular con sed sobre un flujo de entrada?',
    82: '¿Cuáles de los siguientes comandos imprimen en la terminal la ruta absoluta del directorio de trabajo actual? (Selecciona DOS respuestas)',
    83: '¿Qué comando estándar de Linux permite volcar el contenido de texto hacia la salida de la shell?',
    84: '¿Cuál es el valor por defecto de prioridad nice que se le asigna a un nuevo proceso al iniciarlo en Linux?',
    86: '¿Cuál de los siguientes comandos permite realizar búsquedas de texto plano mediante expresiones regulares en archivos?',
    87: 'En una estructura anidada de directorios, ¿qué opción de find limita la profundidad de búsqueda a un nivel específico?',
    88: '¿Cuál de los siguientes comandos genera una lista con únicamente los nombres de usuario extraídos de /etc/passwd?',
    90: 'En el editor vi, ¿cómo se puede repetir un comando de movimiento o borrado varias veces consecutivas?',
    91: '¿Cuál de las siguientes afirmaciones es correcta respecto a un comando ejecutado con el carácter & al final?',
    92: '¿Cuál de los siguientes comandos divide un archivo grande en piezas más pequeñas de tamaño fijo?',
    93: '¿Cuál es el propósito principal del comando xargs?',
    94: '¿Qué comando se utiliza para modificar la prioridad de planificación (nice) de un proceso que ya está en ejecución?',
    97: '¿Cuál es la forma correcta de fijar el objetivo de arranque gráfico por defecto en un sistema gestionado con systemd?',
    109: '¿Cuál de los siguientes ficheros en el directorio personal del usuario se ejecuta al iniciar una nueva shell interactiva que no es de login?',
    111: '¿Qué valor de umask garantiza que los archivos nuevos creados tengan permisos de lectura y escritura para el propietario y ningún permiso para el resto?',
    113: '¿Cuáles de las siguientes utilidades localizan y muestran la ruta completa del fichero ejecutable en el PATH? (Selecciona DOS respuestas)',
    114: '¿Cuál de los siguientes comandos examina un archivo y determina su tipo real mediante números mágicos de cabecera?',
    115: '¿Qué comando interno de la shell muestra la lista de todos los trabajos en segundo plano activos en la sesión actual?',
    120: '¿Qué señal de terminación limpia y ordenada se envía por defecto a un proceso cuando se invoca kill sin especificar parámetros?'
  };

  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const questions: Question[] = [];

  for (const q of raw103) {
    const stem = stemTranslations[q.id] ?? q.stem;
    const rawOptions = (q.options ?? []) as string[];

    let questionType: Question['type'] = 'single';
    if (q.type === 'multiple' || q.pick_count > 1) {
      questionType = 'multiple';
    } else if (q.type === 'fill' || !rawOptions.length || rawOptions.length < 2) {
      questionType = 'fill';
    }

    let correct: string[] = [];
    let options: { id: string; text: string }[] | undefined;
    let acceptedAnswers: string[] | undefined;

    if (questionType === 'fill') {
      const answers = q.fill_answers?.length ? q.fill_answers : [q.correct_text ?? 'cat'];
      correct = answers;
      acceptedAnswers = answers;
      options = undefined;
    } else {
      options = rawOptions.map((optText: string, idx: number) => ({
        id: letters[idx] ?? `opt-${idx}`,
        text: String(optText)
      }));

      const rawIdxs = (q.correct_indices && Array.isArray(q.correct_indices) && q.correct_indices.length > 0)
        ? q.correct_indices
        : [0];

      correct = rawIdxs.map((i: number) => letters[i] ?? `opt-${i}`);
    }

    const questionObj: Question = {
      id: `q-103-${q.id}`,
      topicId: '103',
      subtopicId: '103.4',
      type: questionType,
      prompt: stem,
      options,
      correct,
      acceptedAnswers,
      explanation: q.explanation ?? 'Explicación del concepto según el estándar oficial LPIC-1.',
      difficulty: 'medium',
      placeholder: false
    };

    try {
      const validated = QuestionSchema.parse(questionObj);
      questions.push(validated);
    } catch (err) {
      console.error(`ERROR parseando pregunta ID ${q.id}:`, JSON.stringify(questionObj, null, 2));
      throw err;
    }
  }

  fs.mkdirSync(destQuestionsDir, { recursive: true });
  fs.writeFileSync(
    path.join(destQuestionsDir, '103.yaml'),
    yaml.dump({ topicId: '103', questions }),
    'utf-8'
  );

  return questions;
}

export function importCommandsAndGlossary(contentSrcDir: string): { commands: Command[]; glossary: GlossaryTerm[] } {
  const commands: Command[] = [
    {
      id: 'tee',
      name: 'tee',
      synopsis: 'tee [OPCIÓN]... [ARCHIVO]...',
      description: 'Copia la entrada estándar a cada ARCHIVO indicado y también a la salida estándar simultáneamente.',
      category: 'Redirecciones y Tuberías',
      subtopicIds: ['103.4'],
      example: 'ls -l /etc | tee lista.txt | wc -l',
      flags: [
        { flag: '-a, --append', description: 'Añade a los archivos dados sin sobrescribir su contenido anterior.' },
        { flag: '-i, --ignore-interrupts', description: 'Ignora las señales de interrupción (SIGINT).' }
      ]
    },
    {
      id: 'xargs',
      name: 'xargs',
      synopsis: 'xargs [OPCIÓN]... [COMANDO [ARGUMENTO-INICIAL]...]',
      description: 'Construye y ejecuta líneas de comando leyendo elementos desde la entrada estándar delimitados por espacios o nulos.',
      category: 'Procesamiento y Argumentos',
      subtopicIds: ['103.4'],
      example: 'find . -name "*.log" -print0 | xargs -0 rm -f',
      flags: [
        { flag: '-0, --null', description: 'Los elementos de entrada se terminan con un byte nulo en lugar de espacios en blanco.' },
        { flag: '-I REEMPLAZO', description: 'Sustituye las apariciones de REEMPLAZO en los argumentos iniciales por nombres de stdin.' },
        { flag: '-n NÚMERO', description: 'Utiliza a lo sumo NÚMERO argumentos por cada invocación del comando.' }
      ]
    },
    {
      id: 'cat',
      name: 'cat',
      synopsis: 'cat [OPCIÓN]... [ARCHIVO]...',
      description: 'Concatena el contenido de los ARCHIVOS indicados y los imprime en la salida estándar.',
      category: 'Visualización y Concatenación',
      subtopicIds: ['103.4', '103.3'],
      example: 'cat /etc/os-release',
      flags: [
        { flag: '-n, --number', description: 'Enumera todas las líneas de la salida comenzando en 1.' },
        { flag: '-b, --number-nonblank', description: 'Enumera solo las líneas de salida no vacías.' },
        { flag: '-E, --show-ends', description: 'Muestra un símbolo $ al final de cada línea.' }
      ]
    },
    {
      id: 'head',
      name: 'head',
      synopsis: 'head [OPCIÓN]... [ARCHIVO]...',
      description: 'Imprime las primeras 10 líneas de cada ARCHIVO en la salida estándar.',
      category: 'Filtros de Texto',
      subtopicIds: ['103.4', '103.2'],
      example: 'head -n 5 /etc/passwd',
      flags: [
        { flag: '-n, --lines=K', description: 'Imprime las primeras K líneas en lugar de las 10 habituales.' },
        { flag: '-c, --bytes=K', description: 'Imprime los primeros K bytes de cada archivo.' }
      ]
    },
    {
      id: 'tail',
      name: 'tail',
      synopsis: 'tail [OPCIÓN]... [ARCHIVO]...',
      description: 'Imprime las últimas 10 líneas de cada ARCHIVO en la salida estándar.',
      category: 'Filtros de Texto',
      subtopicIds: ['103.4', '103.2'],
      example: 'tail -f /var/log/syslog',
      flags: [
        { flag: '-f, --follow', description: 'Sigue la adición de datos al archivo a medida que crece en tiempo real.' },
        { flag: '-n, --lines=K', description: 'Muestra las últimas K líneas del archivo.' }
      ]
    },
    {
      id: 'wc',
      name: 'wc',
      synopsis: 'wc [OPCIÓN]... [ARCHIVO]...',
      description: 'Imprime el número de saltos de línea, palabras y bytes para cada archivo especificado.',
      category: 'Conteo y Estadísticas',
      subtopicIds: ['103.4', '103.2'],
      example: 'wc -l < /etc/passwd',
      flags: [
        { flag: '-l, --lines', description: 'Imprime únicamente el conteo total de líneas.' },
        { flag: '-w, --words', description: 'Imprime el conteo de palabras.' },
        { flag: '-c, --bytes', description: 'Imprime el conteo total de bytes.' }
      ]
    },
    {
      id: 'grep',
      name: 'grep',
      synopsis: 'grep [OPCIÓN]... PATRÓN [ARCHIVO]...',
      description: 'Busca el PATRÓN indicado en cada ARCHIVO o entrada estándar e imprime las líneas coincidentes.',
      category: 'Búsqueda y Filtros',
      subtopicIds: ['103.4', '103.7'],
      example: 'grep -i "root" /etc/passwd',
      flags: [
        { flag: '-i, --ignore-case', description: 'Ignora diferencias entre mayúsculas y minúsculas.' },
        { flag: '-v, --invert-match', description: 'Invierte el sentido del filtro para seleccionar líneas no coincidentes.' },
        { flag: '-n, --line-number', description: 'Muestra el número de línea de cada coincidencia.' }
      ]
    },
    {
      id: 'sort',
      name: 'sort',
      synopsis: 'sort [OPCIÓN]... [ARCHIVO]...',
      description: 'Ordena las líneas de todos los ARCHIVOS indicados en orden alfabético o numérico.',
      category: 'Ordenación y Filtros',
      subtopicIds: ['103.4', '103.2'],
      example: 'sort -k 3 -n -t: /etc/passwd',
      flags: [
        { flag: '-n, --numeric-sort', description: 'Compara según el valor numérico de la cadena.' },
        { flag: '-r, --reverse', description: 'Invierte el orden de la comparación.' },
        { flag: '-t, --field-separator=SEP', description: 'Utiliza SEP en lugar de espacios como delimitador de campos.' }
      ]
    },
    {
      id: 'uniq',
      name: 'uniq',
      synopsis: 'uniq [OPCIÓN]... [ENTRADA [SALIDA]]',
      description: 'Filtra las líneas repetidas y consecutivas de la entrada, escribiendo en la salida.',
      category: 'Filtros de Duplicados',
      subtopicIds: ['103.4', '103.2'],
      example: 'sort lista.txt | uniq -c',
      flags: [
        { flag: '-c, --count', description: 'Prefija las líneas con el número de apariciones detectadas.' },
        { flag: '-d, --repeated', description: 'Imprime solo las líneas duplicadas.' },
        { flag: '-u, --unique', description: 'Imprime solo las líneas únicas que no tienen duplicados.' }
      ]
    },
    {
      id: 'tr',
      name: 'tr',
      synopsis: 'tr [OPCIÓN]... CONJUNTO1 [CONJUNTO2]',
      description: 'Traduce, comprime y/o elimina caracteres leídos de la entrada estándar, escribiendo en la salida estándar.',
      category: 'Transformación de Caracteres',
      subtopicIds: ['103.4', '103.2'],
      example: 'cat archivo.txt | tr "a-z" "A-Z"',
      flags: [
        { flag: '-d, --delete', description: 'Elimina los caracteres indicados en CONJUNTO1.' },
        { flag: '-s, --squeeze-repeats', description: 'Reemplaza secuencias repetidas de un carácter por una sola aparición.' }
      ]
    },
    {
      id: 'sed',
      name: 'sed',
      synopsis: 'sed [OPCIÓN]... {script} [archivo-entrada]...',
      description: 'Editor de flujo de texto programable para filtrar y transformar texto de entrada.',
      category: 'Edición de Flujos de Texto',
      subtopicIds: ['103.4', '103.2'],
      example: 'sed "s/antiguo/nuevo/g" archivo.txt',
      flags: [
        { flag: '-i, --in-place', description: 'Edita los archivos directamente en disco sin volcarlos a la salida.' },
        { flag: '-e script', description: 'Añade el script a los comandos que se van a ejecutar.' }
      ]
    },
    {
      id: 'cut',
      name: 'cut',
      synopsis: 'cut OPCIÓN... [ARCHIVO]...',
      description: 'Elimina secciones seleccionadas de cada línea de los archivos y las envía a stdout.',
      category: 'Extracción de Campos',
      subtopicIds: ['103.4', '103.2'],
      example: 'cut -d: -f1,7 /etc/passwd',
      flags: [
        { flag: '-d, --delimiter=DELIM', description: 'Usa DELIM en lugar de tabulador para delimitar campos.' },
        { flag: '-f, --fields=LISTA', description: 'Selecciona solo los campos indicados en LISTA.' }
      ]
    },
    {
      id: 'paste',
      name: 'paste',
      synopsis: 'paste [OPCIÓN]... [ARCHIVO]...',
      description: 'Escribe líneas consistentes en las líneas secuenciales correspondientes de cada ARCHIVO, separadas por tabuladores.',
      category: 'Unión de Flujos',
      subtopicIds: ['103.4', '103.2'],
      example: 'paste -d, nombres.txt apellidos.txt',
      flags: [
        { flag: '-d, --delimiters=LISTA', description: 'Reutiliza los caracteres de LISTA como delimitadores.' },
        { flag: '-s, --serial', description: 'Pega un archivo cada vez en lugar de hacerlo en paralelo.' }
      ]
    },
    {
      id: 'split',
      name: 'split',
      synopsis: 'split [OPCIÓN]... [ARCHIVO [PREFIJO]]',
      description: 'Divide un ARCHIVO en piezas de tamaño fijo con un prefijo designado.',
      category: 'División de Archivos',
      subtopicIds: ['103.4', '103.2'],
      example: 'split -b 100M archivo_grande.iso parte_',
      flags: [
        { flag: '-b, --bytes=TAMAÑO', description: 'Pone TAMAÑO bytes por cada archivo de salida generado.' },
        { flag: '-l, --lines=NÚMERO', description: 'Pone NÚMERO líneas por cada archivo de salida.' }
      ]
    },
    {
      id: 'od',
      name: 'od',
      synopsis: 'od [OPCIÓN]... [ARCHIVO]...',
      description: 'Vuelca los archivos en formatos octal, hexadecimal o con caracteres legibles.',
      category: 'Volcado Octal y Binario',
      subtopicIds: ['103.4', '103.2'],
      example: 'od -c archivo.bin',
      flags: [
        { flag: '-c', description: 'Muestra caracteres ASCII legibles o secuencias de escape.' },
        { flag: '-t, --format=TIPO', description: 'Selecciona el formato de volcado de salida (ej. x1, o2).' }
      ]
    },
    {
      id: 'pr',
      name: 'pr',
      synopsis: 'pr [OPCIÓN]... [ARCHIVO]...',
      description: 'Pagina o formatea archivos de texto plano para su impresión o visualización en columnas.',
      category: 'Paginación y Formato',
      subtopicIds: ['103.4', '103.2'],
      example: 'pr -2 -h "Reporte de Usuarios" usuarios.txt',
      flags: [
        { flag: '-COLUMN, --columns=COLUMN', description: 'Produce una salida formateada en tantas columnas como se indique.' },
        { flag: '-h CABECERA', description: 'Utiliza CABECERA en lugar del nombre del archivo en la cabecera de página.' }
      ]
    },
    {
      id: 'tac',
      name: 'tac',
      synopsis: 'tac [OPCIÓN]... [ARCHIVO]...',
      description: 'Concatena e imprime los archivos en orden inverso línea por línea (última línea primero).',
      category: 'Inversión de Líneas',
      subtopicIds: ['103.4', '103.3'],
      example: 'tac /var/log/auth.log | head -n 20',
      flags: [
        { flag: '-b, --before', description: 'Coloca el separador antes de la cadena en lugar de después.' },
        { flag: '-r, --regex', description: 'Interpreta el separador como una expresión regular.' }
      ]
    },
    {
      id: 'find',
      name: 'find',
      synopsis: 'find [RUTA...] [EXPRESIÓN]',
      description: 'Busca archivos en una jerarquía de directorios evaluando la expresión dada de izquierda a derecha.',
      category: 'Búsqueda de Archivos',
      subtopicIds: ['103.4', '104.7'],
      example: 'find /tmp -type f -name "*.tmp" -print0 | xargs -0 rm -f',
      flags: [
        { flag: '-print0', description: 'Imprime el nombre completo del archivo en la salida estándar seguido de un byte nulo.' },
        { flag: '-name PATRÓN', description: 'Coincide con el nombre del archivo ignorando directorios previos.' },
        { flag: '-type TIPO', description: 'Filtra por tipo de archivo: f para regular, d para directorio, l para enlace.' }
      ]
    },
    {
      id: 'echo',
      name: 'echo',
      synopsis: 'echo [OPCIÓN-CORTA]... [CADENA]...',
      description: 'Muestra las CADENAS de texto en la salida estándar separadas por espacios.',
      category: 'Salida y Generación de Texto',
      subtopicIds: ['103.4', '103.1'],
      example: 'echo "Configuración aplicada" >> /tmp/log.txt',
      flags: [
        { flag: '-n', description: 'No imprime el salto de línea final.' },
        { flag: '-e', description: 'Habilita la interpretación de secuencias de escape con barra invertida.' }
      ]
    },
    {
      id: 'set',
      name: 'set',
      synopsis: 'set [--opciones] [argumento...]',
      description: 'Configura o desactiva atributos de shell y parámetros posicionales en Bash.',
      category: 'Configuración de Shell (noclobber)',
      subtopicIds: ['103.4', '105.1'],
      example: 'set -o noclobber',
      flags: [
        { flag: '-o noclobber', description: 'Evita la sobrescritura accidental de archivos existentes mediante el operador >.' },
        { flag: '+o noclobber', description: 'Desactiva la protección noclobber permitiendo sobrescribir con >.' }
      ]
    },
    {
      id: 'zcat',
      name: 'zcat',
      synopsis: 'zcat [ARCHIVO]...',
      description: 'Descomprime y muestra en la salida estándar el contenido de archivos comprimidos con gzip.',
      category: 'Archivos Comprimidos',
      subtopicIds: ['103.4', '103.2'],
      example: 'zcat /var/log/syslog.2.gz | grep "kernel"',
      flags: [
        { flag: '-f, --force', description: 'Fuerza la descompresión incluso si el archivo no termina en .gz.' }
      ]
    },
    {
      id: 'bzcat',
      name: 'bzcat',
      synopsis: 'bzcat [ARCHIVO]...',
      description: 'Descomprime archivos comprimidos con bzip2 directamente hacia la salida estándar.',
      category: 'Archivos Comprimidos',
      subtopicIds: ['103.4', '103.2'],
      example: 'bzcat archivo.tar.bz2 | tar -tvf -',
      flags: []
    },
    {
      id: 'xzcat',
      name: 'xzcat',
      synopsis: 'xzcat [ARCHIVO]...',
      description: 'Descomprime archivos comprimidos con xz o lzma volcando el resultado en la salida estándar.',
      category: 'Archivos Comprimidos',
      subtopicIds: ['103.4', '103.2'],
      example: 'xzcat kernel-config.xz',
      flags: []
    },
    {
      id: 'date',
      name: 'date',
      synopsis: 'date [OPCIÓN]... [+FORMATO]',
      description: 'Muestra o ajusta la fecha y hora del sistema en el formato especificado.',
      category: 'Información de Sistema',
      subtopicIds: ['103.4', '108.1'],
      example: 'tar -czf backup-$(date +%Y%m%d).tar.gz /home',
      flags: [
        { flag: '-u, --utc', description: 'Imprime la hora coordinada universal (UTC).' },
        { flag: '+FORMATO', description: 'Controla el formato de salida mediante directivas (ej. %Y-%m-%d).' }
      ]
    },
    {
      id: 'uname',
      name: 'uname',
      synopsis: 'uname [OPCIÓN]...',
      description: 'Imprime información sobre la arquitectura del equipo y el núcleo del sistema operativo.',
      category: 'Información de Kernel',
      subtopicIds: ['103.4', '101.1'],
      example: 'uname -r',
      flags: [
        { flag: '-a, --all', description: 'Imprime toda la información disponible en el siguiente orden: kernel, hostname, versión y arquitectura.' },
        { flag: '-r, --kernel-release', description: 'Imprime el número de versión y compilación del núcleo Linux.' },
        { flag: '-m, --machine', description: 'Imprime el tipo de arquitectura de hardware de la máquina (ej. x86_64).' }
      ]
    }
  ];

  const glossary: GlossaryTerm[] = [
    {
      id: 'stdin',
      term: 'stdin',
      definition: 'Descriptor de archivo 0: flujo estándar de entrada a través del cual los procesos reciben datos (por defecto, teclado).',
      related: ['stdout', 'stderr', 'descriptor de archivo'],
      subtopicIds: ['103.4']
    },
    {
      id: 'stdout',
      term: 'stdout',
      definition: 'Descriptor de archivo 1: flujo estándar de salida por donde un proceso emite resultados exitosos de ejecución.',
      related: ['stdin', 'stderr', 'redirección'],
      subtopicIds: ['103.4']
    },
    {
      id: 'stderr',
      term: 'stderr',
      definition: 'Descriptor de archivo 2: flujo estándar de errores reservado para mensajes de diagnóstico y advertencias.',
      related: ['stdin', 'stdout', 'fusión de flujos'],
      subtopicIds: ['103.4']
    },
    {
      id: 'descriptor-de-archivo',
      term: 'descriptor de archivo',
      definition: 'Índice entero asignado por el kernel a una tabla de archivos abiertos por un proceso (0 stdin, 1 stdout, 2 stderr).',
      related: ['stdin', 'stdout', 'stderr'],
      subtopicIds: ['103.4']
    },
    {
      id: 'tuberia',
      term: 'tubería',
      definition: 'Mecanismo de comunicación interproceso representado por | que conecta el stdout de un comando con el stdin del siguiente.',
      related: ['filtro', 'tee', 'flujo estándar'],
      subtopicIds: ['103.4']
    },
    {
      id: 'redireccion',
      term: 'redirección',
      definition: 'Acción de desviar los flujos de entrada o salida de un comando hacia un archivo, dispositivo o descriptor distinto.',
      related: ['stdout', 'stderr', 'noclobber'],
      subtopicIds: ['103.4']
    },
    {
      id: 'dev-null',
      term: '/dev/null',
      definition: 'Dispositivo especial de caracteres en Linux que descarta todos los datos escritos en él y devuelve fin de archivo al leerlo.',
      related: ['redirección', 'stderr'],
      subtopicIds: ['103.4']
    },
    {
      id: 'noclobber',
      term: 'noclobber',
      definition: 'Opción de shell (set -o noclobber) que impide sobrescribir archivos existentes con el operador de redirección >.',
      related: ['redirección', 'truncamiento'],
      subtopicIds: ['103.4']
    },
    {
      id: 'here-document',
      term: 'Here Document',
      definition: 'Sintaxis de redirección (<<) que permite suministrar un bloque de texto multilínea a un comando hasta encontrar un delimitador.',
      related: ['here-string', 'stdin'],
      subtopicIds: ['103.4']
    },
    {
      id: 'here-string',
      term: 'Here String',
      definition: 'Sintaxis de redirección (<<<) soportada por Bash que pasa una cadena literal directamente a la entrada estándar.',
      related: ['here-document', 'stdin'],
      subtopicIds: ['103.4']
    },
    {
      id: 'bifurcacion-tee',
      term: 'bifurcación (tee)',
      definition: 'Capacidad de clonar un flujo de datos para enviarlo simultáneamente a la salida estándar y a uno o más ficheros.',
      related: ['tuberia', 'stdout'],
      subtopicIds: ['103.4']
    },
    {
      id: 'sustitucion-de-comandos',
      term: 'sustitución de comandos',
      definition: 'Técnica de shell mediante $(comando) o `comando` que ejecuta una instrucción e inserta su salida como texto en la línea de comandos.',
      related: ['xargs', 'bash'],
      subtopicIds: ['103.4']
    },
    {
      id: 'xargs-termino',
      term: 'xargs',
      definition: 'Utilidad que convierte líneas recibidas por la entrada estándar en listas de argumentos para invocar otros comandos.',
      related: ['tuberia', 'caracter-nulo'],
      subtopicIds: ['103.4']
    },
    {
      id: 'caracter-nulo',
      term: 'carácter nulo (-print0)',
      definition: 'Delimitador de byte cero (\\0) empleado para separar nombres de archivos de forma segura frente a espacios o saltos de línea.',
      related: ['find', 'xargs'],
      subtopicIds: ['103.4']
    },
    {
      id: 'filtro',
      term: 'filtro',
      definition: 'Programa que recibe un flujo de datos por stdin, realiza un procesamiento o transformación y emite el resultado por stdout.',
      related: ['tuberia', 'cat', 'grep', 'sort'],
      subtopicIds: ['103.4']
    },
    {
      id: 'flujo-estandar',
      term: 'flujo estándar',
      definition: 'Canal de comunicación predeterminado provisto por el entorno del sistema operativo al iniciar cualquier programa.',
      related: ['stdin', 'stdout', 'stderr'],
      subtopicIds: ['103.4']
    },
    {
      id: 'truncamiento',
      term: 'truncamiento',
      definition: 'Operación que vacía por completo el contenido de un fichero existente dejándolo en 0 bytes antes de escribir.',
      related: ['redireccion', 'noclobber'],
      subtopicIds: ['103.4']
    },
    {
      id: 'concatenacion',
      term: 'concatenación',
      definition: 'Operación que añade nuevos datos al final de un fichero (operador >>) respetando el contenido preexistente.',
      related: ['redireccion', 'truncamiento'],
      subtopicIds: ['103.4']
    },
    {
      id: 'fusion-de-flujos',
      term: 'fusión de flujos (2>&1)',
      definition: 'Sintaxis que redirige un descriptor hacia el destino de otro (ej. stderr hacia stdout o viceversa).',
      related: ['stderr', 'stdout', 'redireccion'],
      subtopicIds: ['103.4']
    },
    {
      id: 'buffer-de-es',
      term: 'buffer de E/S',
      definition: 'Zona de memoria intermedia utilizada por el sistema operativo para optimizar transferencias de datos entre procesos y dispositivos.',
      related: ['flujo-estandar'],
      subtopicIds: ['103.4']
    },
    {
      id: 'pipeline',
      term: 'pipeline',
      definition: 'Secuencia lineal de comandos encadenados a través de múltiples tuberías consecutivas.',
      related: ['tuberia', 'filtro'],
      subtopicIds: ['103.4']
    },
    {
      id: 'escape-de-caracteres',
      term: 'escape de caracteres',
      definition: 'Uso del carácter barra invertida \\ para impedir que la shell interprete caracteres especiales como operadores.',
      related: ['bash', 'redireccion'],
      subtopicIds: ['103.4']
    }
  ];

  const parsedCommands = CommandsListSchema.parse(commands);
  const parsedGlossary = GlossaryListSchema.parse(glossary);

  fs.writeFileSync(path.join(contentSrcDir, 'commands.yaml'), yaml.dump(parsedCommands), 'utf-8');
  fs.writeFileSync(path.join(contentSrcDir, 'glossary.yaml'), yaml.dump(parsedGlossary), 'utf-8');

  return { commands: parsedCommands, glossary: parsedGlossary };
}
