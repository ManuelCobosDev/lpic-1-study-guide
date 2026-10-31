import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import {
  CurriculumSourceSchema,
  CurriculumManifestSchema,
  LessonSchema,
  LabSchema,
  QuestionSchema,
  TopicQuestionsSchema,
  CommandsListSchema,
  GlossaryListSchema,
  ErrataListSchema
} from '../src/app/core/schemas/index';
import {
  CurriculumManifest,
  Lesson,
  Lab,
  Question,
  Command,
  GlossaryTerm,
  Errata,
  Slide,
  Subtopic,
  Topic
} from '../src/app/core/models/index';

export interface BuildContentOptions {
  validateOnly?: boolean;
  contentSrcDir?: string;
  outputDir?: string;
}

export function generatePlaceholderLesson(subtopic: Subtopic, topic: Topic): Lesson {
  const slides: Slide[] = [
    {
      id: `${subtopic.id}-slide-1`,
      slideNumber: 1,
      title: subtopic.title,
      layout: 'cover',
      blocks: [
        {
          type: 'heading',
          level: 1,
          text: subtopic.title
        },
        {
          type: 'paragraph',
          text: `Objetivo LPIC-1 ${subtopic.id} · Tema ${topic.id}: ${topic.title} · Peso oficial: ${subtopic.weight}`
        },
        {
          type: 'callout',
          calloutType: 'info',
          title: 'Contenido en preparación',
          content: 'Esta lección contiene material provisional generado automáticamente. Estará disponible próximamente.'
        }
      ],
      notes: `Nota de inicio para el subtema ${subtopic.id}.`
    },
    {
      id: `${subtopic.id}-slide-2`,
      slideNumber: 2,
      title: 'Conceptos fundamentales',
      layout: 'content',
      blocks: [
        {
          type: 'heading',
          level: 2,
          text: 'Fundamentos teóricos'
        },
        {
          type: 'paragraph',
          text: `En esta sección exploramos los principios esenciales del objetivo ${subtopic.id}. El conocimiento de estos conceptos es clave para superar el examen LPIC-1.`
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Comprensión de los mecanismos internos y arquitectura estándar de Linux',
            'Sintaxis de configuración y localización de ficheros en el árbol FHS',
            'Buenas prácticas de administración y diagnóstico de incidencias'
          ]
        }
      ]
    },
    {
      id: `${subtopic.id}-slide-3`,
      slideNumber: 3,
      title: 'Comandos y ejecución en terminal',
      layout: 'two-column',
      blocks: [
        {
          type: 'heading',
          level: 3,
          text: 'Invocación estándar'
        },
        {
          type: 'paragraph',
          text: 'Sintaxis habitual del comando y sus parámetros más comunes en entornos GNU/Linux.'
        },
        {
          type: 'code',
          language: 'bash',
          code: `# Ejecución de ejemplo para ${subtopic.id}\nman ${subtopic.id.replace('.', '_')}\nls -la /etc/`,
          title: 'terminal-bash'
        }
      ],
      secondaryBlocks: [
        {
          type: 'terminal',
          lines: [
            { prompt: '$ ', command: 'uname -r', output: '6.8.0-generic' },
            { prompt: '$ ', command: 'systemctl is-active default.target', output: 'active' }
          ]
        }
      ]
    },
    {
      id: `${subtopic.id}-slide-4`,
      slideNumber: 4,
      title: 'Diagrama de flujo del sistema',
      layout: 'diagram',
      blocks: [
        {
          type: 'diagram',
          kind: 'flow',
          title: `Arquitectura del objetivo ${subtopic.id}`,
          alt: `Diagrama conceptual de flujo de trabajo para el subtema ${subtopic.id}`,
          spec: {
            nodes: [
              { id: '1', label: 'Entrada / Configuración', tone: 'neutral' },
              { id: '2', label: 'Procesamiento en Kernel / Espacio de usuario', tone: 'primary' },
              { id: '3', label: 'Salida / Estado verificado', tone: 'success' }
            ],
            edges: [
              { from: '1', to: '2' },
              { from: '2', to: '3' }
            ]
          }
        }
      ]
    },
    {
      id: `${subtopic.id}-slide-5`,
      slideNumber: 5,
      title: 'Comparativa de métodos',
      layout: 'comparison',
      blocks: [
        {
          type: 'heading',
          level: 3,
          text: 'Enfoque convencional'
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Configuración manual de ficheros',
            'Mayor control específico',
            'Requiere reiniciar servicios o releer configuraciones'
          ]
        }
      ],
      secondaryBlocks: [
        {
          type: 'heading',
          level: 3,
          text: 'Enfoque automatizado'
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Uso de herramientas estándar de gestión',
            'Comprobación previa de sintaxis',
            'Menor probabilidad de error humano'
          ]
        }
      ]
    },
    {
      id: `${subtopic.id}-slide-6`,
      slideNumber: 6,
      title: 'Comprobación de conocimientos',
      layout: 'checkpoint',
      blocks: [
        {
          type: 'quiz-inline',
          id: `quiz-check-${subtopic.id}`,
          question: `¿Cuál es el propósito primordial del objetivo ${subtopic.id} en LPIC-1?`,
          options: [
            { key: 'a', text: 'Administrar adecuadamente las funciones del sistema conforme a los estándares LPI' },
            { key: 'b', text: 'Sustituir por completo el núcleo del sistema operativo sin supervisión' },
            { key: 'c', text: 'Deshabilitar los servicios esenciales de red permanentemente' },
            { key: 'd', text: 'Borrar los archivos temporales sin comprobar su contenido' }
          ],
          correct: ['a'],
          explanation: 'La opción A describe con exactitud la meta de competencia evaluada en la certificación LPIC-1.'
        }
      ]
    },
    {
      id: `${subtopic.id}-slide-7`,
      slideNumber: 7,
      title: 'Tabla resumen y sintaxis',
      layout: 'content',
      blocks: [
        {
          type: 'table',
          headers: ['Parámetro', 'Descripción', 'Ámbito'],
          rows: [
            ['-v, --verbose', 'Muestra información detallada durante la ejecución', 'Diagnóstico'],
            ['-h, --help', 'Despliega la ayuda y opciones disponibles', 'General'],
            ['-f, --force', 'Fuerza la operación sin solicitar confirmación interactiva', 'Avanzado']
          ],
          caption: 'Opciones comunes en utilidades GNU/Linux'
        }
      ]
    },
    {
      id: `${subtopic.id}-slide-8`,
      slideNumber: 8,
      title: 'Resumen del subtema',
      layout: 'summary',
      blocks: [
        {
          type: 'callout',
          calloutType: 'exam',
          title: 'Claves para el Examen',
          content: `Recuerda repasar los comandos principales, sus opciones estándar y la sintaxis de ficheros de configuración relativos al tema ${subtopic.id}.`
        },
        {
          type: 'list',
          ordered: false,
          items: [
            `Identificar los comandos clave del objetivo ${subtopic.id}`,
            'Comprobar las salidas en consola y mensajes de error habituales',
            'Realizar la práctica correspondiente para asentar los conceptos'
          ]
        }
      ]
    }
  ];

  return {
    id: subtopic.id,
    topicId: subtopic.topicId,
    examId: topic.examId,
    title: subtopic.title,
    version: '1.0.0',
    language: 'es',
    estimatedMinutes: subtopic.estimatedMinutes,
    objectives: [
      `Dominar los conceptos fundamentales del subtema ${subtopic.id}`,
      `Ejecutar las herramientas de línea de comandos asociadas al objetivo ${subtopic.id}`
    ],
    keyTerms: ['GNU', 'Linux', 'Kernel', 'FHS'],
    commands: ['ls', 'cat', 'man'],
    placeholder: true,
    slides,
    webDocument: [
      {
        id: 'sec-1',
        title: 'Introducción y Fundamentos',
        level: 2,
        blocks: slides[1]?.blocks ?? []
      },
      {
        id: 'sec-2',
        title: 'Comandos y Demostración Práctica',
        level: 2,
        blocks: [...(slides[2]?.blocks ?? []), ...(slides[2]?.secondaryBlocks ?? [])]
      },
      {
        id: 'sec-3',
        title: 'Resumen y Consejos de Examen',
        level: 2,
        blocks: slides[7]?.blocks ?? []
      }
    ],
    wikiReferences: [
      {
        id: 'cmd-ls',
        type: 'command',
        name: 'ls',
        shortDescription: 'Lista el contenido de directorios en sistemas tipo Unix.'
      },
      {
        id: 'term-fhs',
        type: 'term',
        name: 'FHS',
        shortDescription: 'Filesystem Hierarchy Standard: define la estructura de directorios en Linux.'
      }
    ]
  };
}

export function generatePlaceholderLab(subtopicId: string, title: string): Lab {
  return {
    id: `lab-${subtopicId.replace('.', '-')}`,
    subtopicId,
    title: `Laboratorio práctico: ${title}`,
    estimatedMinutes: 20,
    difficulty: 'basic',
    type: 'subtopic',
    placeholder: true,
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Inspección del entorno',
        instruction: 'Abre una terminal y comprueba la versión del sistema y el directorio actual.',
        command: 'uname -a && pwd',
        expectedOutput: 'Linux ... /home/usuario'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Consulta de la documentación man',
        instruction: 'Consulta el manual de ayuda de los comandos principales del objetivo.',
        command: 'man --help',
        hint: 'Puedes presionar "q" para salir de cualquier visor man.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Creación de directorio de trabajo seguro',
        instruction: 'Crea una carpeta temporal para realizar las pruebas sin alterar ficheros del sistema.',
        command: 'mkdir -p ~/lpic1-lab && cd ~/lpic1-lab',
        expectedOutput: ''
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Ejecución del comando clave',
        instruction: 'Ejecuta el comando principal y verifica el código de retorno con echo $?.',
        command: 'echo "Prueba de ejecución LPIC-1" > test.txt && cat test.txt',
        expectedOutput: 'Prueba de ejecución LPIC-1',
        examAlert: 'En el examen LPI se pregunta con frecuencia el significado del valor de salida $? (0 = éxito).'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Limpieza y validación final',
        instruction: 'Elimina los ficheros temporales creados y valida que el entorno queda ordenado.',
        command: 'rm -f ~/lpic1-lab/test.txt && rmdir ~/lpic1-lab',
        hint: 'Usa rm con precaución; nunca utilices rutas raíz en comandos destructivos.'
      }
    ],
    solutionNotes: 'Laboratorio completado con éxito siguiendo los estándares de buenas prácticas de administración.'
  };
}

export function generatePlaceholderQuestions(topicId: string): Question[] {
  return [
    {
      id: `q-${topicId}-1`,
      topicId,
      subtopicId: `${topicId}.1`,
      type: 'single',
      prompt: `¿Cuál de las siguientes afirmaciones describe mejor una buena práctica de administración para el Tema ${topicId}?`,
      options: [
        { id: 'a', text: 'Validar la sintaxis de configuración antes de reiniciar los servicios asociados.' },
        { id: 'b', text: 'Modificar ficheros del sistema binario con un editor de texto convencional.' },
        { id: 'c', text: 'Ejecutar todas las tareas rutinarias como usuario root sin utilizar sudo.' },
        { id: 'd', text: 'Desactivar el registro de eventos para ahorrar espacio en disco.' }
      ],
      correct: ['a'],
      explanation: 'Verificar la configuración previamente previene caídas inesperadas del servicio en producción.',
      difficulty: 'easy',
      placeholder: true
    },
    {
      id: `q-${topicId}-2`,
      topicId,
      subtopicId: `${topicId}.1`,
      type: 'multiple',
      prompt: `¿Cuáles de los siguientes comandos o utilidades se emplean habitualmente para tareas de inspección en el Tema ${topicId}? (Selecciona DOS respuestas)`,
      options: [
        { id: 'a', text: 'cat' },
        { id: 'b', text: 'format C:' },
        { id: 'c', text: 'grep' },
        { id: 'd', text: 'del /s /q' }
      ],
      correct: ['a', 'c'],
      explanation: 'cat y grep son herramientas estándar fundamentales en entornos GNU/Linux.',
      difficulty: 'medium',
      placeholder: true
    },
    {
      id: `q-${topicId}-3`,
      topicId,
      subtopicId: `${topicId}.2`,
      type: 'fill',
      prompt: '¿Qué comando estándar de shell se utiliza para concatenar y visualizar el contenido de archivos de texto en la salida estándar?',
      correct: ['cat'],
      acceptedAnswers: ['cat', '/bin/cat'],
      explanation: 'El comando "cat" (concatenate) vuelca el contenido del archivo indicado directamente a stdout.',
      difficulty: 'easy',
      placeholder: true
    },
    {
      id: `q-${topicId}-4`,
      topicId,
      subtopicId: `${topicId}.2`,
      type: 'single',
      prompt: '¿Qué código de salida ($?) devuelve un comando en Linux para indicar que finalizó sin errores?',
      options: [
        { id: 'a', text: '0' },
        { id: 'b', text: '1' },
        { id: 'c', text: '127' },
        { id: 'd', text: '255' }
      ],
      correct: ['a'],
      explanation: 'Por convención POSIX, el código 0 representa terminación exitosa; cualquier valor distinto de 0 indica error.',
      difficulty: 'easy',
      placeholder: true
    }
  ];
}

export function buildContent(options: BuildContentOptions = {}): CurriculumManifest {
  const rootDir = process.cwd();
  const contentSrcDir = options.contentSrcDir ?? path.resolve(rootDir, 'content-src');
  const outputDir = options.outputDir ?? path.resolve(rootDir, 'public/content');

  const curriculumPath = path.join(contentSrcDir, 'curriculum.yaml');
  if (!fs.existsSync(curriculumPath)) {
    console.error(`FAIL: No se encontró el currículo oficial en ${curriculumPath}`);
    process.exit(1);
  }

  const rawCurriculum = yaml.load(fs.readFileSync(curriculumPath, 'utf-8'));
  const curriculumResult = CurriculumSourceSchema.safeParse(rawCurriculum);

  if (!curriculumResult.success) {
    console.error('FAIL: El archivo curriculum.yaml no cumple el esquema Zod:', curriculumResult.error.format());
    process.exit(1);
  }

  const curriculum = curriculumResult.data;

  // Validaciones del curriculo oficial
  for (const exam of curriculum.exams) {
    const examTopics = curriculum.topics.filter(t => t.examId === exam.id);
    const sumTopicWeights = examTopics.reduce((acc, t) => acc + t.weight, 0);
    if (sumTopicWeights !== exam.weight) {
      console.error(`FAIL: La suma de pesos de los temas (${sumTopicWeights}) no coincide con el peso del examen ${exam.id} (${exam.weight})`);
      process.exit(1);
    }
  }

  // Preparamos directorios de salida
  if (!options.validateOnly) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'lessons'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'labs'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'questions'), { recursive: true });
  }

  let totalSlidesReal = 0;
  let totalSlidesPlaceholder = 0;
  let totalLabsReal = 0;
  let totalLabsPlaceholder = 0;
  let totalQuestionsReal = 0;
  let totalQuestionsPlaceholder = 0;

  // Procesamos lecciones
  const lessonsDir = path.join(contentSrcDir, 'lessons');
  const enrichedSubtopics: Subtopic[] = [];

  for (const subtopic of curriculum.subtopics) {
    const topic = curriculum.topics.find(t => t.id === subtopic.topicId);
    if (!topic) {
      console.error(`FAIL: El subtema ${subtopic.id} referencia un tema inexistente: ${subtopic.topicId}`);
      process.exit(1);
    }

    let lesson: Lesson;
    const jsonLessonPath = path.join(lessonsDir, `${subtopic.id}.json`);

    if (fs.existsSync(jsonLessonPath)) {
      const rawLesson = JSON.parse(fs.readFileSync(jsonLessonPath, 'utf-8'));
      const parsedLesson = LessonSchema.safeParse(rawLesson);
      if (!parsedLesson.success) {
        console.error(`FAIL: Error de validación Zod en la lección ${jsonLessonPath}:`, parsedLesson.error.format());
        process.exit(1);
      }
      lesson = parsedLesson.data;
      if (lesson.placeholder) {
        totalSlidesPlaceholder += lesson.slides.length;
      } else {
        totalSlidesReal += lesson.slides.length;
      }
    } else {
      // Generación determinista de lección de relleno
      lesson = generatePlaceholderLesson(subtopic, topic);
      totalSlidesPlaceholder += lesson.slides.length;
    }

    // Comprobaciones de límites de diapositivas (warning, no error según 03-dominio.md §3.1)
    for (const slide of lesson.slides) {
      for (const block of slide.blocks) {
        if (block.type === 'list' && block.items.length > 7) {
          console.warn(`WARN [${subtopic.id}]: La diapositiva "${slide.title}" tiene más de 7 viñetas (${block.items.length}).`);
        }
        if (block.type === 'code' && block.code.split('\n').length > 14) {
          console.warn(`WARN [${subtopic.id}]: La diapositiva "${slide.title}" tiene un bloque de código de más de 14 líneas.`);
        }
        if (block.type === 'diagram' && block.spec['nodes'] && Array.isArray(block.spec['nodes']) && block.spec['nodes'].length > 12) {
          console.warn(`WARN [${subtopic.id}]: El diagrama en "${slide.title}" supera los 12 nodos.`);
        }
      }
    }

    enrichedSubtopics.push({
      ...subtopic,
      slideCount: lesson.slides.length,
      placeholder: lesson.placeholder
    });

    if (!options.validateOnly) {
      fs.writeFileSync(
        path.join(outputDir, 'lessons', `${subtopic.id}.json`),
        JSON.stringify(lesson, null, 2),
        'utf-8'
      );
    }
  }

  // Procesamos laboratorios
  const labsDir = path.join(contentSrcDir, 'labs');
  for (const subtopic of curriculum.subtopics) {
    let lab: Lab;
    const yamlLabPath = path.join(labsDir, `${subtopic.id}.yaml`);
    const jsonLabPath = path.join(labsDir, `${subtopic.id}.json`);

    if (fs.existsSync(yamlLabPath)) {
      const rawLab = yaml.load(fs.readFileSync(yamlLabPath, 'utf-8'));
      const parsedLab = LabSchema.safeParse(rawLab);
      if (!parsedLab.success) {
        console.error(`FAIL: Error de validación Zod en el laboratorio ${yamlLabPath}:`, parsedLab.error.format());
        process.exit(1);
      }
      lab = parsedLab.data;
      totalLabsReal++;
    } else if (fs.existsSync(jsonLabPath)) {
      const rawLab = JSON.parse(fs.readFileSync(jsonLabPath, 'utf-8'));
      const parsedLab = LabSchema.safeParse(rawLab);
      if (!parsedLab.success) {
        console.error(`FAIL: Error de validación Zod en el laboratorio ${jsonLabPath}:`, parsedLab.error.format());
        process.exit(1);
      }
      lab = parsedLab.data;
      totalLabsReal++;
    } else {
      lab = generatePlaceholderLab(subtopic.id, subtopic.title);
      totalLabsPlaceholder++;
    }

    if (!options.validateOnly) {
      const labFilename = `lab-${subtopic.id.replace('.', '-')}.json`;
      fs.writeFileSync(
        path.join(outputDir, 'labs', labFilename),
        JSON.stringify(lab, null, 2),
        'utf-8'
      );
    }
  }

  // Procesamos preguntas por tema
  const questionsDir = path.join(contentSrcDir, 'questions');
  for (const topic of curriculum.topics) {
    let questions: Question[];
    const yamlQuestionsPath = path.join(questionsDir, `${topic.id}.yaml`);
    const jsonQuestionsPath = path.join(questionsDir, `${topic.id}.json`);

    if (fs.existsSync(yamlQuestionsPath)) {
      const raw = yaml.load(fs.readFileSync(yamlQuestionsPath, 'utf-8'));
      const parsed = TopicQuestionsSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(`FAIL: Error de validación Zod en las preguntas de ${yamlQuestionsPath}:`, parsed.error.format());
        process.exit(1);
      }
      questions = parsed.data.questions;
      totalQuestionsReal += questions.filter(q => !q.placeholder).length;
      totalQuestionsPlaceholder += questions.filter(q => q.placeholder).length;
    } else if (fs.existsSync(jsonQuestionsPath)) {
      const raw = JSON.parse(fs.readFileSync(jsonQuestionsPath, 'utf-8'));
      const parsed = TopicQuestionsSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(`FAIL: Error de validación Zod en las preguntas de ${jsonQuestionsPath}:`, parsed.error.format());
        process.exit(1);
      }
      questions = parsed.data.questions;
      totalQuestionsReal += questions.filter(q => !q.placeholder).length;
      totalQuestionsPlaceholder += questions.filter(q => q.placeholder).length;
    } else {
      questions = generatePlaceholderQuestions(topic.id);
      totalQuestionsPlaceholder += questions.length;
    }

    if (!options.validateOnly) {
      fs.writeFileSync(
        path.join(outputDir, 'questions', `${topic.id}.json`),
        JSON.stringify({ topicId: topic.id, questions }, null, 2),
        'utf-8'
      );
    }
  }

  // Comandos
  let commands: Command[] = [];
  const commandsPath = path.join(contentSrcDir, 'commands.yaml');
  if (fs.existsSync(commandsPath)) {
    const raw = yaml.load(fs.readFileSync(commandsPath, 'utf-8'));
    const parsed = CommandsListSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`FAIL: Error de validación Zod en ${commandsPath}:`, parsed.error.format());
      process.exit(1);
    }
    commands = parsed.data;
  }

  if (!options.validateOnly) {
    fs.writeFileSync(
      path.join(outputDir, 'commands.json'),
      JSON.stringify(commands, null, 2),
      'utf-8'
    );
  }

  // Glosario
  let glossary: GlossaryTerm[] = [];
  const glossaryPath = path.join(contentSrcDir, 'glossary.yaml');
  if (fs.existsSync(glossaryPath)) {
    const raw = yaml.load(fs.readFileSync(glossaryPath, 'utf-8'));
    const parsed = GlossaryListSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`FAIL: Error de validación Zod en ${glossaryPath}:`, parsed.error.format());
      process.exit(1);
    }
    glossary = parsed.data;
  }

  if (!options.validateOnly) {
    fs.writeFileSync(
      path.join(outputDir, 'glossary.json'),
      JSON.stringify(glossary, null, 2),
      'utf-8'
    );
  }

  // Erratas
  let errata: Errata[] = [];
  const errataPath = path.join(contentSrcDir, 'errata.yaml');
  if (fs.existsSync(errataPath)) {
    const raw = yaml.load(fs.readFileSync(errataPath, 'utf-8'));
    const parsed = ErrataListSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`FAIL: Error de validación Zod en ${errataPath}:`, parsed.error.format());
      process.exit(1);
    }
    errata = parsed.data;
  }

  if (!options.validateOnly) {
    fs.writeFileSync(
      path.join(outputDir, 'errata.json'),
      JSON.stringify(errata, null, 2),
      'utf-8'
    );
  }

  // Construcción del Manifiesto
  const availableSubtopics = enrichedSubtopics.filter(s => s.status === 'available').length;
  const plannedSubtopics = enrichedSubtopics.filter(s => s.status === 'planned').length;

  const manifest: CurriculumManifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    stats: {
      totalExams: curriculum.exams.length,
      totalTopics: curriculum.topics.length,
      totalSubtopics: enrichedSubtopics.length,
      availableSubtopics,
      plannedSubtopics,
      totalSlidesReal,
      totalSlidesPlaceholder,
      totalLabsReal,
      totalLabsPlaceholder,
      totalQuestionsReal,
      totalQuestionsPlaceholder,
      totalCommands: commands.length,
      totalTerms: glossary.length
    },
    exams: curriculum.exams,
    topics: curriculum.topics,
    subtopics: enrichedSubtopics
  };

  const manifestResult = CurriculumManifestSchema.safeParse(manifest);
  if (!manifestResult.success) {
    console.error('FAIL: El manifiesto generado no cumple el esquema Zod:', manifestResult.error.format());
    process.exit(1);
  }

  if (!options.validateOnly) {
    fs.writeFileSync(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
    console.log(`PASS: build-content genero con exito el manifiesto y ${enrichedSubtopics.length} lecciones en ${outputDir}.`);
  } else {
    console.log('PASS: validate:content valido correctamente todo el contenido del curriculo.');
  }

  return manifest;
}

// Invocacion CLI directa
const isMain = process.argv[1]?.includes('build-content');
if (isMain) {
  const isValidate = process.argv.includes('--validate');
  buildContent({ validateOnly: isValidate });
}
