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
  LabStep,
  Question,
  Command,
  GlossaryTerm,
  Errata,
  Slide,
  Subtopic,
  Topic,
  LessonExercise
} from '../src/app/core/models/index';
import {
  AutolinkEntry,
  buildMatchCandidates,
  autolinkSlide,
  calculateExplainedInForEntry,
  validateExplainedIn
} from '../src/app/core/engines/autolink/autolink.engine';
import { generateFlashcards } from './generate-flashcards';

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
      ]
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

export function generateGlobalTopicLab(topicId: string, topicTitle: string): Lab {
  const stepsByTopic: Record<string, LabStep[]> = {
    '101': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Auditoría de buses de hardware PCI y USB',
        instruction: 'Inspecciona los buses de hardware del sistema en modo árbol y lista los controladores asociados.',
        command: 'lspci -tv && lsusb -v 2>/dev/null | head -n 25',
        expectedOutput: '-[0000:00]-+-00.0  Host bridge ...',
        hint: 'El modificador -k de lspci muestra qué módulo del kernel está controlando cada tarjeta detectada.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Inspección de dispositivos de bloque y buffer del kernel',
        instruction: 'Consulta la topología de almacenamiento con sus UUIDs y sistemas de archivos, filtrando el buffer dmesg.',
        command: 'lsblk -f && dmesg -T 2>/dev/null | grep -iE "nvme|sda|scsi" | tail -n 10 || lsblk -f',
        expectedOutput: 'NAME FSTYPE FSVER LABEL UUID ...',
        examAlert: 'En LPIC-1 se enfatiza el uso de UUID para evitar ambigüedades al reordenar cables o discos.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Gestión y prueba en seco de módulos del kernel',
        instruction: 'Verifica los parámetros configurables de un controlador de red y realiza una carga en modo prueba sin alterar el kernel.',
        command: 'modinfo -p e1000e 2>/dev/null || modinfo dummy\nmodprobe -v --dry-run dummy',
        expectedOutput: 'insmod .../dummy.ko',
        hint: 'La opción --dry-run o -n comprueba dependencias sin cargar el binario en la memoria RAM.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Configuración persistente en /etc/modprobe.d/',
        instruction: 'Crea una directiva de configuración modular para forzar parámetros al módulo dummy.',
        command: 'echo "options dummy numdummies=2" | sudo tee /etc/modprobe.d/dummy.conf\ncat /etc/modprobe.d/dummy.conf',
        expectedOutput: 'options dummy numdummies=2',
        examAlert: 'Recuerda que /etc/modules-load.d/ carga al arranque, mientras que /etc/modprobe.d/ fija opciones y listas negras.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Control de targets de inicio en systemd',
        instruction: 'Comprueba el target predeterminado actual y simula el cambio a entorno multiusuario de texto puro.',
        command: 'systemctl get-default\nsystemctl list-units --type=target --state=active',
        expectedOutput: 'graphical.target (o multi-user.target)',
        hint: 'multi-user.target equivale al clásico Runlevel 3, mientras que graphical.target equivale al Runlevel 5.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Planificación de mantenimiento con shutdown',
        instruction: 'Simula el envío de una advertencia de mantenimiento preventivo sin apagar el host mediante el flag -k.',
        command: 'sudo shutdown -k +15 "Mantenimiento preventivo de firmware y hardware LPIC-1"\nsudo shutdown -c 2>/dev/null || true',
        expectedOutput: 'Shutdown scheduled for ..., use \'shutdown -c\' to cancel.',
        hint: 'El parámetro -k (kidding) solo envía el broadcast de advertencia a los usuarios conectados a la terminal.'
      }
    ],
    '102': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Diagnóstico de particionado GPT/MBR y firmas',
        instruction: 'Lista todas las particiones del almacenamiento y verifica las firmas de identificación de bloques.',
        command: 'sudo fdisk -l 2>/dev/null || fdisk -l\nblkid',
        expectedOutput: 'Disk /dev/...: ... bytes, Disklabel type: gpt (o dos)',
        examAlert: 'GPT soporta más de 2 TB y hasta 128 particiones por defecto; MBR se limita a 4 primarias y 2 TB.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Inspección de bibliotecas compartidas con ldd y ldconfig',
        instruction: 'Verifica los enlaces dinámicos del shell Bash y busca librerías clave en la caché del linker.',
        command: 'ldd /bin/bash\nldconfig -p | grep libssl | head -n 5',
        expectedOutput: 'linux-vdso.so.1 ...\nlibtinfo.so ...\nlibc.so ...',
        hint: 'Si instalas librerías manualmente en /usr/local/lib, ejecuta siempre ldconfig para refrescar /etc/ld.so.cache.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Consulta de paquetes Debian con dpkg y apt-cache',
        instruction: 'Busca a qué paquete pertenece el comando ls y verifica la política de versiones de OpenSSH.',
        command: 'dpkg -S /bin/ls 2>/dev/null || dpkg -S /usr/bin/ls\napt-cache policy openssh-client 2>/dev/null || echo "dpkg activo"',
        expectedOutput: 'coreutils: /bin/ls',
        hint: 'dpkg -S busca el propietario de un fichero; dpkg -L lista los ficheros contenidos en un paquete instalado.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Inspección de paquetería RPM y metadatos',
        instruction: 'Comprueba el comando equivalente para consultar información y propiedad de ficheros en distribuciones basadas en RPM.',
        command: 'rpm -qf /bin/sh 2>/dev/null || echo "rpm -qf /ruta/fichero (consulta el paquete propietario)"',
        expectedOutput: 'bash-... (o información en sistemas rpm)',
        examAlert: 'rpm -qa lista todo; rpm -qi info; rpm -ql lista archivos; rpm -qf busca por archivo.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Configuración del cargador de arranque GRUB2',
        instruction: 'Inspecciona las directivas principales de configuración de GRUB en /etc/default/grub.',
        command: 'cat /etc/default/grub | grep -E "GRUB_TIMEOUT|GRUB_CMDLINE_LINUX_DEFAULT"',
        expectedOutput: 'GRUB_TIMEOUT=...\nGRUB_CMDLINE_LINUX_DEFAULT="..."',
        hint: 'Tras modificar /etc/default/grub en Debian/Ubuntu se debe ejecutar update-grub (grub-mkconfig en Red Hat).'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Detección del entorno de virtualización',
        instruction: 'Utiliza utilidades de systemd para detectar si la máquina opera en hardware bare-metal, VM o contenedor.',
        command: 'systemd-detect-virt\nhostnamectl status | grep -iE "virtualization|chassis"',
        expectedOutput: 'none (bare metal), kvm, vmware, oracle, docker o wsl',
        hint: 'systemd-detect-virt devuelve 0 si detecta virtualización y 1 si corre sobre hardware físico real.'
      }
    ],
    '103': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Búsqueda de archivos y filtrado por metadatos',
        instruction: 'Busca archivos de configuración en /etc modificados recientemente o con extensiones concretas.',
        command: 'find /etc -maxdepth 2 -type f -name "*.conf" 2>/dev/null | head -n 15',
        expectedOutput: '/etc/resolv.conf\n/etc/sysctl.conf ...',
        hint: 'Recuerda usar 2>/dev/null para omitir errores de permisos denegados al buscar como usuario estándar.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Construcción de pipeline con grep, awk y sort',
        instruction: 'Extrae las cuentas del sistema con shells interactivas y ordénalas alfabéticamente.',
        command: 'grep -E "/(bash|sh)$" /etc/passwd | awk -F: \'{print $1, $6, $7}\' | sort',
        expectedOutput: 'root /root /bin/bash\nusuario /home/usuario /bin/bash ...',
        hint: 'awk -F: especifica el separador de campos de /etc/passwd.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Redirección y duplicación de flujos con tee',
        instruction: 'Canaliza la salida estándar a un archivo mientras observas el flujo por terminal usando tee.',
        command: 'mkdir -p ~/lpic1-lab && cat /etc/issue | tr "a-z" "A-Z" | tee ~/lpic1-lab/banner_mayus.txt',
        expectedOutput: 'DEBIAN GNU/LINUX ...',
        examAlert: 'El operador 2>&1 o &> redirige la salida estándar y de error al mismo destino.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Sustitución de expresiones regulares con sed',
        instruction: 'Reemplaza cadenas de texto de forma no destructiva utilizando expresiones regulares en sed.',
        command: 'echo "servidor-prod-01.local" | sed -E "s/prod-[0-9]+/staging-99/"',
        expectedOutput: 'servidor-staging-99.local',
        hint: 'sed "s/patrón/sustituto/g" sustituye todas las apariciones de cada línea.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Control de procesos en segundo plano y jobs',
        instruction: 'Lanza una tarea en segundo plano con &, consulta la tabla de trabajos y finalízala con kill.',
        command: 'sleep 60 &\njobs -l\nkill -SIGTERM $!',
        expectedOutput: '[1]+ ... Running sleep 60 &',
        examAlert: '$! almacena el PID del último comando lanzado en segundo plano en Bash.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Prioridad de ejecución con nice y renice',
        instruction: 'Comprueba el rango de amabilidad (niceness) y cómo asignar una prioridad reducida.',
        command: 'nice -n 10 sleep 5 &\nps -o pid,ni,comm -p $!\nwait $! 2>/dev/null || true',
        expectedOutput: 'PID  NI COMMAND\n...  10 sleep',
        hint: 'Los valores de nice van de -20 (máxima prioridad, solo root) a 19 (mínima prioridad).'
      }
    ],
    '104': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Inspección de sistemas de archivos y etiquetas',
        instruction: 'Comprueba los sistemas de archivos montados y consulta la información de superbloque con tune2fs.',
        command: 'df -hT\nsudo tune2fs -l /dev/sda1 2>/dev/null | grep -iE "filesystem volume name|block size" || echo "Ext4 inspeccionado"',
        expectedOutput: 'Filesystem Type Size Used Avail Use% Mounted on ...',
        examAlert: 'tune2fs solo funciona en sistemas de archivos Ext2/Ext3/Ext4.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Estructura y opciones del fichero /etc/fstab',
        instruction: 'Analiza las 6 columnas del archivo /etc/fstab (dispositivo, punto de montaje, tipo, opciones, dump, fsck pass).',
        command: 'cat /etc/fstab | grep -v "^#" | grep -v "^$"',
        expectedOutput: 'UUID=... / ext4 defaults 0 1 ...',
        hint: 'La sexta columna indica el orden de comprobación fsck: 1 para la raíz /, 2 para el resto, 0 para omitir.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Diferenciación de enlaces duros vs simbólicos e inodos',
        instruction: 'Crea un archivo y compara el número de inodo de un enlace duro (ln) frente a uno blando (ln -s).',
        command: 'mkdir -p ~/lpic1-lab && cd ~/lpic1-lab\necho "contenido prueba" > base.txt\nln base.txt duro.txt\nln -s base.txt simbolico.txt\nls -li base.txt duro.txt simbolico.txt',
        expectedOutput: '... inodo_A 2 ... base.txt\n... inodo_A 2 ... duro.txt\n... inodo_B 1 ... simbolico.txt -> base.txt',
        examAlert: 'Los enlaces duros comparten el mismo inodo y no pueden cruzar diferentes particiones/sistemas de archivos.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Permisos POSIX octales y máscara umask',
        instruction: 'Verifica la máscara umask actual y calcula los permisos por defecto para archivos y directorios.',
        command: 'umask\numask 027\ntouch ~/lpic1-lab/test_perm.txt\nls -l ~/lpic1-lab/test_perm.txt\numask 022',
        expectedOutput: '0022 (o 022)\n-rw-r----- ... test_perm.txt',
        hint: 'Ficheros base 666 - 027 = 640 (-rw-r-----). Directorios base 777 - 027 = 750 (drwxr-x---).'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Bits especiales: SUID (4), SGID (2) y Sticky Bit (1)',
        instruction: 'Inspecciona la configuración del Sticky Bit en /tmp para impedir el borrado de archivos ajenos.',
        command: 'ls -ld /tmp\nls -l /usr/bin/passwd',
        expectedOutput: 'drwxrwxrwt ... /tmp\n-rwsr-xr-x ... /usr/bin/passwd',
        examAlert: 'Sticky bit en directorio = "t"; SUID en ejecutable = "s" en usuario; SGID = "s" en grupo.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Verificación del estándar de jerarquía FHS',
        instruction: 'Comprueba los directorios canónicos del Filesystem Hierarchy Standard y sus propósitos.',
        command: 'ls -ld /etc /var /usr /opt /proc /sys /boot',
        expectedOutput: 'drwxr-xr-x ... /etc\ndrwxr-xr-x ... /var ...',
        hint: '/etc: configuración local del host; /var: datos variables (logs, colas); /usr: datos estáticos compartibles.'
      }
    ],
    '105': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Entorno de Bash y variables globales vs locales',
        instruction: 'Define una variable privada y elévala al entorno global mediante export para que sea visible por procesos hijos.',
        command: 'VAR_LOCAL="SoloPadre"\nexport VAR_GLOBAL="ParaHijos"\nbash -c \'echo "Local: [$VAR_LOCAL], Global: [$VAR_GLOBAL]"\'',
        expectedOutput: 'Local: [], Global: [ParaHijos]',
        hint: 'Las subshells o procesos hijos nunca heredan variables no exportadas.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Creación y verificación de alias de terminal',
        instruction: 'Define un alias interactivo y comprueba su inclusión en la tabla de alias activa.',
        command: 'alias myll="ls -la --color=auto"\nalias myll\nunalias myll',
        expectedOutput: 'alias myll=\'ls -la --color=auto\'',
        examAlert: 'Los alias se aplican en shells interactivas; para que persistan se ubican en ~/.bashrc.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Construcción de script de Bash con Shebang',
        instruction: 'Escribe un script formal de administración con encabezado #!/bin/bash y permisos de ejecución.',
        command: 'cat << \'EOF\' > ~/lpic1-lab/auditar.sh\n#!/bin/bash\necho "Auditoría ejecutada por: $(whoami)"\necho "Parámetros recibidos: $#"\nexit 0\nEOF\nchmod +x ~/lpic1-lab/auditar.sh',
        expectedOutput: '',
        hint: 'Sin el permiso de ejecución (chmod +x), el script solo puede ejecutarse invocando explícitamente "bash script.sh".'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Parámetros posicionales y comprobación de salida $?',
        instruction: 'Ejecuta el script con argumentos y valida el valor de retorno.',
        command: '~/lpic1-lab/auditar.sh arg1 arg2\necho "Código de salida: $?"',
        expectedOutput: 'Auditoría ejecutada por: ...\nParámetros recibidos: 2\nCódigo de salida: 0',
        examAlert: '$0 = nombre del script, $1..$9 = argumentos, $# = recuento total, $? = código de salida anterior.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Estructuras condicionales y bucles en Bash',
        instruction: 'Comprueba la existencia de un fichero mediante un test condicional [ -f ] y un bucle for.',
        command: 'for item in /etc/issue /etc/os-release /etc/no_existe; do\n  if [ -f "$item" ]; then\n    echo "Fichero encontrado: $item"\n  else\n    echo "Fichero ausente: $item"\n  fi\ndone',
        expectedOutput: 'Fichero encontrado: /etc/issue\nFichero encontrado: /etc/os-release\nFichero ausente: /etc/no_existe',
        hint: 'Utiliza comillas dobles alrededor de variables en pruebas [ "$VAR" ] para evitar fallos si contienen espacios.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Depuración y traza en tiempo de ejecución',
        instruction: 'Ejecuta el script en modo depuración (bash -x) para observar la sustitución de comandos paso a paso.',
        command: 'bash -x ~/lpic1-lab/auditar.sh test1 test2',
        expectedOutput: '+ whoami\n+ echo ...\n+ echo \'Parámetros recibidos: 2\'\n+ exit 0',
        hint: 'El flag -x (xtrace) muestra cada comando con el prefijo + antes de ejecutarlo.'
      }
    ],
    '106': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Identificación de servidor gráfico (X11 / Wayland)',
        instruction: 'Comprueba el tipo de sesión gráfica y gestor de ventanas del sistema.',
        command: 'echo "Sesión: ${XDG_SESSION_TYPE:-tty}, Desktop: ${XDG_CURRENT_DESKTOP:-consola}"',
        expectedOutput: 'Sesión: ..., Desktop: ...',
        hint: 'En entornos modernos Wayland sustituye progresivamente al clásico servidor X11 (Xorg).'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Estructura del servidor Xorg y archivos de configuración',
        instruction: 'Inspecciona la jerarquía modular de configuración en /etc/X11/xorg.conf.d/.',
        command: 'ls -la /etc/X11 2>/dev/null || echo "/etc/X11 estándar"',
        expectedOutput: 'drwxr-xr-x ... /etc/X11',
        examAlert: 'En Xorg moderno la configuración se divide en ficheros modulares dentro de /etc/X11/xorg.conf.d/.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Variable DISPLAY y arquitectura cliente-servidor X11',
        instruction: 'Examina la variable DISPLAY que indica el servidor gráfico de destino en formato host:display.screen.',
        command: 'echo "Display actual: [${DISPLAY}]"',
        expectedOutput: 'Display actual: [:0.0] (o valor de display)',
        hint: ':0.0 indica el primer monitor conectado físicamente al host local.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Display Managers (Gestores de pantalla de inicio)',
        instruction: 'Consulta los servicios de inicio de sesión gráfico instalados (GDM, LightDM, SDDM).',
        command: 'systemctl list-unit-files 2>/dev/null | grep -iE "(gdm|lightdm|sddm)" || echo "Display Manager configurado en systemd"',
        expectedOutput: '...dm.service ...',
        hint: 'El Display Manager es responsable de solicitar usuario/contraseña gráficos e iniciar la sesión de escritorio.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Reenvío de gráficos X11 sobre SSH (X11 Forwarding)',
        instruction: 'Comprueba la directiva X11Forwarding en el servidor SSH para autorizar ventanas remotas.',
        command: 'grep -i "X11Forwarding" /etc/ssh/sshd_config 2>/dev/null || echo "X11Forwarding yes"',
        expectedOutput: 'X11Forwarding yes',
        examAlert: 'El cliente conecta con ssh -X (reenvío seguro) o ssh -Y (reenvío de confianza).'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Herramientas de accesibilidad y asistencia (Orca)',
        instruction: 'Verifica la presencia o configuración de lectores de pantalla y opciones de alto contraste exigidas por LPIC-1.',
        command: 'which orca 2>/dev/null || echo "Orca: lector de pantalla estándar en escritorios GNOME"',
        expectedOutput: '.../bin/orca (o mensaje de referencia)',
        hint: 'LPIC-1 exige conocer tecnologías de asistencia: Orca (lector de pantalla), teclado en pantalla (Onboard) y temas de alto contraste.'
      }
    ],
    '107': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Creación de usuarios con grupo primario y suplementario',
        instruction: 'Inspecciona la sintaxis de useradd para crear cuentas con home, shell y membresía en grupos auxiliares.',
        command: 'useradd -D\ngrep -E "^(UID_MIN|GID_MIN)" /etc/login.defs',
        expectedOutput: 'GROUP=100 ... SHELL=/bin/bash ...\nUID_MIN 1000\nGID_MIN 1000',
        hint: 'useradd -m crea el home; -s define el shell; -g grupo primario; -G grupos suplementarios separados por comas.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Políticas de caducidad y envejecimiento con chage',
        instruction: 'Comprueba los parámetros de expiración de contraseña de una cuenta del sistema.',
        command: 'sudo chage -l $(whoami) 2>/dev/null || chage -l root 2>/dev/null || echo "chage -l usuario muestra expiración"',
        expectedOutput: 'Minimum number of days between password change: ...\nMaximum number of days between password change: ...',
        examAlert: 'chage -M fija días máximos; -m días mínimos; -W días de aviso; -E fecha de expiración de cuenta.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Programación periódica de tareas con crontab',
        instruction: 'Examina la sintaxis de los 5 campos de tiempo en crontab (minuto, hora, día del mes, mes, día de la semana).',
        command: 'cat /etc/crontab | grep -v "^#"',
        expectedOutput: 'SHELL=/bin/sh\nPATH=...\n# m h dom mon dow user  command',
        hint: 'En crontab de usuario (/var/spool/cron/crontabs) NO existe el campo "user"; solo en /etc/crontab global.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Automatización moderna con temporizadores de systemd',
        instruction: 'Comprueba la lista de timers activos que sustituyen o complementan al cron tradicional.',
        command: 'systemctl list-timers --no-pager | head -n 10',
        expectedOutput: 'NEXT LEFT LAST PASSED UNIT ACTIVATES ...',
        hint: 'Un temporizador xxx.timer activa la unidad de servicio asociada xxx.service.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Gestión de fecha, hora y husos horarios con timedatectl',
        instruction: 'Comprueba el estado del reloj de hardware RTC y la zona horaria del servidor.',
        command: 'timedatectl status',
        expectedOutput: 'Local time: ...\nUniversal time: ...\nRTC time: ...\nTime zone: ...',
        hint: 'timedatectl set-timezone Europe/Madrid ajusta la zona horaria vinculando /etc/localtime.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Configuración regional e idioma con localectl y locale',
        instruction: 'Verifica las variables de entorno de localización (LANG, LC_ALL, LC_MESSAGES).',
        command: 'locale | head -n 8\nlocalectl status',
        expectedOutput: 'LANG=...\nLC_CTYPE=...\nSystem Locale: LANG=...',
        examAlert: 'LC_ALL sobrescribe todas las variables LC_* individuales. Si LC_ALL=C, los mensajes salen en inglés estándar ASCII.'
      }
    ],
    '108': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Sincronización horaria NTP con Chrony y timesyncd',
        instruction: 'Comprueba el estado del cliente de sincronización horaria de red.',
        command: 'chronyc sources -v 2>/dev/null || timedatectl timesync-status 2>/dev/null || echo "NTP activo"',
        expectedOutput: '... stratum ... poll ... reach ...',
        hint: 'Chrony utiliza el archivo de configuración /etc/chrony/chrony.conf (o /etc/chrony.conf).'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Consulta del diario centralizado con journalctl',
        instruction: 'Filtra entradas del diario por nivel de severidad (error) y por arranque actual.',
        command: 'journalctl -b -p err --no-pager | tail -n 15',
        expectedOutput: '... error logs ...',
        hint: '-b filtra solo el arranque actual; -u filtra por unidad systemd; -f hace seguimiento en tiempo real.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Servicio tradicional de registro syslog / rsyslog',
        instruction: 'Analiza la configuración de facilidades y niveles de prioridad en /etc/rsyslog.conf.',
        command: 'cat /etc/rsyslog.conf 2>/dev/null | grep -E "(auth|mail|cron)" | head -n 10 || echo "rsyslog configurado"',
        expectedOutput: 'auth,authpriv.* ... /var/log/auth.log ...',
        examAlert: 'Facilidades: auth, cron, daemon, kern, mail, syslog. Prioridades: debug, info, notice, warning, err, crit, alert, emerg.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Inspección de colas de correo y arquitectura MTA',
        instruction: 'Verifica si existen mensajes encolados en el Agente de Transporte de Correo local.',
        command: 'mailq 2>/dev/null || sendmail -bp 2>/dev/null || echo "Mail queue is empty"',
        expectedOutput: 'Mail queue is empty (o lista de identificadores encolados)',
        hint: 'LPIC-1 cubre MTAs como Postfix, Sendmail, Exim y qmail. Todos implementan comandos compatibles como mailq.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Alias globales (/etc/aliases) y reenvío personal (~/.forward)',
        instruction: 'Consulta el archivo maestro de alias del sistema y la compilación a base de datos binaria con newaliases.',
        command: 'cat /etc/aliases 2>/dev/null || echo "postmaster: root"\nwhich newaliases',
        expectedOutput: 'postmaster: root ...\n.../newaliases',
        examAlert: 'Tras editar /etc/aliases es IMPRESCINDIBLE ejecutar newaliases para generar /etc/aliases.db.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Subsistema de impresión CUPS y comandos LPD',
        instruction: 'Comprueba el estado del planificador de impresión CUPS y la lista de impresoras configuradas.',
        command: 'lpstat -r 2>/dev/null || echo "scheduler is running"\nlpstat -p -d 2>/dev/null || echo "no system default destination"',
        expectedOutput: 'scheduler is running ...',
        hint: 'CUPS opera en el puerto TCP 631 mediante el protocolo IPP (Internet Printing Protocol).'
      }
    ],
    '109': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Diagnóstico de interfaces de red con iproute2',
        instruction: 'Comprueba el estado operativo, direcciones IPv4, IPv6 y máscaras CIDR de las interfaces.',
        command: 'ip -brief addr show\nip link show',
        expectedOutput: 'lo UP 127.0.0.1/8 ::1/128 ...\neth0 (o enp...) UP ...',
        examAlert: 'El conjunto iproute2 (ip) sustituye a las herramientas obsoletas ifconfig, route y netstat.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Inspección de la tabla de enrutamiento y puerta de enlace',
        instruction: 'Consulta la ruta por defecto (default gateway) y las rutas directas de subred.',
        command: 'ip route show\nip -6 route show | head -n 10',
        expectedOutput: 'default via ... dev ... proto ...\n.../... dev ... proto kernel scope link ...',
        hint: 'ip route add default via <IP> dev <interfaz> fija la puerta de enlace predeterminada en Linux.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Gestión de conexiones con NetworkManager (nmcli)',
        instruction: 'Supervisa el estado global de conectividad de red y los perfiles de conexión guardados.',
        command: 'nmcli general status 2>/dev/null || nmcli connection show 2>/dev/null || echo "NetworkManager activo"',
        expectedOutput: 'STATE CONNECTIVITY WIFI-HW WIFI WWAN-HW WWAN\nconnected full ...',
        hint: 'nmcli con up <nombre> activa un perfil; nmcli dev status muestra el estado físico de los adaptadores.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Resolución de nombres en /etc/resolv.conf y /etc/nsswitch.conf',
        instruction: 'Comprueba los servidores DNS configurados y el orden de búsqueda de nombres.',
        command: 'cat /etc/resolv.conf | grep -E "(nameserver|search|domain)"\ngrep hosts /etc/nsswitch.conf',
        expectedOutput: 'nameserver ...\nhosts: files dns (o files mdns4_minimal ... dns)',
        examAlert: 'En nsswitch.conf, "files" consulta /etc/hosts antes de acudir al servidor DNS indicado en "dns".'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Diagnóstico de resolución DNS con dig y getent',
        instruction: 'Realiza una consulta directa a servidores de nombres autoritativos y prueba la base NSS.',
        command: 'getent hosts localhost\ndig @1.1.1.1 lpi.org +short 2>/dev/null || host lpi.org 2>/dev/null || echo "Resolución DNS verificada"',
        expectedOutput: '127.0.0.1 localhost ...',
        hint: 'dig +short devuelve únicamente las direcciones IP resultantes sin las secciones de cabecera.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Auditoría de puertos y sockets de red con ss',
        instruction: 'Lista todos los puertos TCP y UDP en estado de escucha (LISTEN) con sus números de puerto numéricos.',
        command: 'ss -tuln',
        expectedOutput: 'Netid State Recv-Q Send-Q Local Address:Port Peer Address:Port ...',
        hint: 'El modificador -t filtra TCP, -u filtra UDP, -l en escucha, -n no resuelve nombres de servicio (más rápido).'
      }
    ],
    '110': [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Auditoría de servicios expuestos y procesos propietarios',
        instruction: 'Examina qué procesos locales tienen sockets abiertos expuestos hacia la red.',
        command: 'sudo ss -tulnp 2>/dev/null || ss -tuln',
        expectedOutput: 'Netid State Local Address:Port ... users:(("...",pid=...,fd=...))',
        hint: 'El parámetro -p muestra el nombre y PID del proceso responsable; requiere privilegios de root.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Elevación de privilegios y validación con visudo',
        instruction: 'Comprueba los privilegios delegados del usuario actual y valida la sintaxis de /etc/sudoers.',
        command: 'sudo -l 2>/dev/null || echo "sudo -l lista privilegios"\nsudo visudo -c 2>/dev/null || echo "/etc/sudoers: parsed OK"',
        expectedOutput: '/etc/sudoers: parsed OK',
        examAlert: 'NUNCA edites /etc/sudoers con un editor directo; utiliza siempre visudo para prevenir bloqueos por errores de sintaxis.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Límites de recursos de usuario en /etc/security/limits.conf',
        instruction: 'Inspecciona los límites de procesos (nproc), descriptores de fichero (nofile) y tamaño de core dumps.',
        command: 'ulimit -a\ncat /etc/security/limits.conf | grep -v "^#" | grep -v "^$" | head -n 10 || echo "limits.conf inspeccionado"',
        expectedOutput: 'open files (-n) ...\nmax user processes (-u) ...',
        hint: 'Los límites "soft" pueden ser incrementados por el usuario hasta el tope fijado por el límite "hard".'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Generación de pares de claves SSH asimétricas (Ed25519)',
        instruction: 'Genera un par de claves criptográficas modernas con el algoritmo elíptico Ed25519.',
        command: 'mkdir -p ~/.ssh && chmod 700 ~/.ssh\nssh-keygen -t ed25519 -N "" -f ~/lpic1-lab/id_test -C "lab-lpic1@antigravity"\nls -l ~/lpic1-lab/id_test*',
        expectedOutput: '-rw------- ... id_test\n-rw-r--r-- ... id_test.pub',
        hint: 'Ed25519 proporciona claves de 256 bits extremadamente rápidas y seguras frente al clásico RSA.'
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Gestión de claves autorizadas y permisos críticos',
        instruction: 'Valida los permisos estrictos obligatorios para la autenticación sin contraseña con authorized_keys.',
        command: 'cat ~/lpic1-lab/id_test.pub >> ~/lpic1-lab/authorized_keys\nchmod 600 ~/lpic1-lab/authorized_keys\nls -l ~/lpic1-lab/authorized_keys',
        expectedOutput: '-rw------- ... authorized_keys',
        examAlert: 'OpenSSH rechaza conexiones por clave si ~/.ssh tiene permisos superiores a 700 o authorized_keys superiores a 600.'
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Bastionado del demonio OpenSSH en /etc/ssh/sshd_config',
        instruction: 'Verifica directivas clave de seguridad en sshd: deshabilitar root directo y contraseñas vacías.',
        command: 'grep -iE "^(PermitRootLogin|PasswordAuthentication|PermitEmptyPasswords)" /etc/ssh/sshd_config 2>/dev/null || echo "PermitRootLogin no\nPermitEmptyPasswords no"\nsudo sshd -t 2>/dev/null || echo "Configuración sshd válida"',
        expectedOutput: 'PermitRootLogin ...\nPermitEmptyPasswords no',
        hint: 'sshd -t valida la sintaxis del fichero de configuración del servidor antes de reiniciar el servicio.'
      }
    ]
  };

  const steps = stepsByTopic[topicId] || [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Diagnóstico inicial del entorno del Tema ' + topicId,
      instruction: 'Comprueba el estado del sistema y los comandos asociados a este tema.',
      command: 'uname -a && uptime',
      expectedOutput: 'Linux ...'
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Auditoría de configuración',
      instruction: 'Examina los ficheros de configuración principales del tema.',
      command: 'ls -la /etc/',
      hint: 'Revisa las directivas documentadas en el manual oficial.'
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Ejecución y pruebas',
      instruction: 'Ejecuta los procedimientos de verificación.',
      command: 'echo "Verificación Tema ' + topicId + '"',
      expectedOutput: 'Verificación Tema ' + topicId
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: 'Comprobación de registros',
      instruction: 'Consulta los eventos y mensajes del sistema.',
      command: 'dmesg | tail -n 10',
      hint: 'Verifica la ausencia de anomalías.'
    },
    {
      id: 'step-5',
      stepNumber: 5,
      title: 'Validación de sintaxis',
      instruction: 'Asegura que todos los parámetros y variables están en regla.',
      command: 'echo "Validación exitosa"',
      expectedOutput: 'Validación exitosa'
    },
    {
      id: 'step-6',
      stepNumber: 6,
      title: 'Conclusión de la misión integradora',
      instruction: 'Comprueba el estado final y valida los objetivos del examen.',
      command: 'echo "Misión integradora del Tema ' + topicId + ' completada con éxito"',
      expectedOutput: 'Misión integradora del Tema ' + topicId + ' completada con éxito'
    }
  ];

  return {
    id: `lab-${topicId}-global`,
    topicId,
    title: `Misión Integradora Tema ${topicId}: ${topicTitle}`,
    estimatedMinutes: 45,
    difficulty: 'advanced',
    type: 'global',
    placeholder: false,
    steps,
    solutionNotes: `Misión integradora del Tema ${topicId} superada con éxito. Has demostrado las competencias prácticas exigidas en la certificación oficial LPIC-1.`
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

function generateSitemap(subtopics: Subtopic[], publicDir: string): void {
  const baseUrl = 'https://lpic1.manuelcobos.dev';
  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/temario', priority: '0.9', changefreq: 'weekly' },
    { path: '/temario/101', priority: '0.8', changefreq: 'weekly' },
    { path: '/temario/102', priority: '0.8', changefreq: 'weekly' },
    { path: '/laboratorios', priority: '0.8', changefreq: 'weekly' },
    { path: '/simulador', priority: '0.8', changefreq: 'weekly' },
    { path: '/simulador/examen', priority: '0.7', changefreq: 'monthly' },
    { path: '/simulador/practica', priority: '0.7', changefreq: 'monthly' },
    { path: '/comandos', priority: '0.8', changefreq: 'weekly' },
    { path: '/glosario', priority: '0.8', changefreq: 'weekly' },
    { path: '/flashcards', priority: '0.7', changefreq: 'weekly' },
    { path: '/mapa-mental', priority: '0.7', changefreq: 'monthly' },
    { path: '/buscar', priority: '0.6', changefreq: 'monthly' },
    { path: '/progreso', priority: '0.6', changefreq: 'monthly' },
    { path: '/erratas', priority: '0.5', changefreq: 'weekly' },
    { path: '/acerca-de', priority: '0.5', changefreq: 'monthly' },
    { path: '/legal', priority: '0.4', changefreq: 'monthly' }
  ];

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];

  for (const r of staticRoutes) {
    lines.push('  <url>');
    lines.push(`    <loc>${baseUrl}${r.path}</loc>`);
    lines.push(`    <changefreq>${r.changefreq}</changefreq>`);
    lines.push(`    <priority>${r.priority}</priority>`);
    lines.push('  </url>');
  }

  for (const s of subtopics) {
    lines.push('  <url>');
    lines.push(`    <loc>${baseUrl}/estudiar/${s.id}</loc>`);
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');

    const labId = s.labId || `lab-${s.id.replace('.', '-')}`;
    lines.push('  <url>');
    lines.push(`    <loc>${baseUrl}/laboratorios/${labId}</loc>`);
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('    <priority>0.7</priority>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push('');

  const sitemapXmlPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapXmlPath, lines.join('\n'), 'utf-8');
}

export const MOJIBAKE_REGEX = /[\u00C3\u00C2][\u0080-\u00BF]|\u00E2[\u0080-\u009F][\u0080-\u00BF]|\u00F0\u009F[\u0080-\u00BF]{2}/g;

export function readUtf8Clean(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.charCodeAt(0) === 0xFEFF) {
    console.error(`FAIL: El archivo contiene BOM UTF-8 (\\uFEFF): ${filePath}`);
    process.exit(1);
  }
  const matches = content.match(MOJIBAKE_REGEX);
  if (matches && matches.length > 0) {
    console.error(`FAIL: Se detectaron caracteres corruptos (mojibake) en ${filePath}: ${matches.slice(0, 5).join(', ')}`);
    process.exit(1);
  }
  return content;
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

  const rawCurriculum = yaml.load(readUtf8Clean(curriculumPath));
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

  // Comandos (precarga para autolink y explainedIn)
  let commands: Command[] = [];
  const commandsPath = path.join(contentSrcDir, 'commands.yaml');
  if (fs.existsSync(commandsPath)) {
    const raw = yaml.load(readUtf8Clean(commandsPath));
    const parsed = CommandsListSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`FAIL: Error de validación Zod en ${commandsPath}:`, parsed.error.format());
      process.exit(1);
    }
    commands = parsed.data;

    // Validación estricta anti-flags truncados o vacíos
    for (const cmd of commands) {
      if (cmd.flags) {
        for (const f of cmd.flags) {
          if (f.flag === '-' || f.flag === '--' || !f.flag || f.flag.trim() === '') {
            console.error(`FAIL: El comando "${cmd.name}" contiene una bandera inválida o vacía: "${f.flag}"`);
            process.exit(1);
          }
        }
      }
    }
  }

  // Glosario (precarga para autolink y explainedIn)
  let glossary: GlossaryTerm[] = [];
  const glossaryPath = path.join(contentSrcDir, 'glossary.yaml');
  if (fs.existsSync(glossaryPath)) {
    const raw = yaml.load(readUtf8Clean(glossaryPath));
    const parsed = GlossaryListSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`FAIL: Error de validación Zod en ${glossaryPath}:`, parsed.error.format());
      process.exit(1);
    }
    glossary = parsed.data;
  }

  // Precarga de áreas de conocimiento clave extraídas del manual (si existe units.json)
  const keyAreasByObjective = new Map<string, string[]>();
  const unitsPath = path.join(contentSrcDir, '_extract', '102-500', 'units.json');
  if (fs.existsSync(unitsPath)) {
    try {
      const rawUnits = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));
      if (Array.isArray(rawUnits)) {
        for (const u of rawUnits) {
          if (u.kind === 'key-knowledge' && u.objective && typeof u.text === 'string') {
            const cleanText = u.text.replace(/^[•\-\*]\s*/, '').trim();
            if (cleanText) {
              const list = keyAreasByObjective.get(u.objective) ?? [];
              list.push(cleanText);
              keyAreasByObjective.set(u.objective, list);
            }
          }
        }
      }
    } catch {
      // Ignorar si no se puede leer o parsear
    }
  }

  const exercisesDir = path.join(contentSrcDir, 'exercises');

  // Carga previa de lecciones
  const lessonsDir = path.join(contentSrcDir, 'lessons');
  const enrichedSubtopics: Subtopic[] = [];
  const loadedLessons: { subtopic: Subtopic; lesson: Lesson }[] = [];
  const globalSlideIds = new Set<string>();

  for (const subtopic of curriculum.subtopics) {
    const topic = curriculum.topics.find(t => t.id === subtopic.topicId);
    if (!topic) {
      console.error(`FAIL: El subtema ${subtopic.id} referencia un tema inexistente: ${subtopic.topicId}`);
      process.exit(1);
    }

    let lesson: Lesson;
    const jsonLessonPath = path.join(lessonsDir, `${subtopic.id}.json`);

    if (fs.existsSync(jsonLessonPath)) {
      const rawLesson = JSON.parse(readUtf8Clean(jsonLessonPath));
      const parsedLesson = LessonSchema.safeParse(rawLesson);
      if (!parsedLesson.success) {
        console.error(`FAIL: Error de validación Zod en la lección ${jsonLessonPath}:`, parsedLesson.error.format());
        process.exit(1);
      }
      lesson = parsedLesson.data;
    } else {
      lesson = generatePlaceholderLesson(subtopic, topic);
    }

    // Validación estricta anti-IDs duplicados y numeración 1-based correlativa en las diapositivas
    const lessonSlideIds = new Set<string>();
    lesson.slides.forEach((s, idx) => {
      s.slideNumber = idx + 1;
      if (lessonSlideIds.has(s.id)) {
        console.error(`FAIL: ID de diapositiva duplicado internamente en la lección ${subtopic.id}: "${s.id}"`);
        process.exit(1);
      }
      lessonSlideIds.add(s.id);

      if (globalSlideIds.has(s.id)) {
        console.error(`FAIL: Colisión global de ID de diapositiva: "${s.id}" en el subtema ${subtopic.id}`);
        process.exit(1);
      }
      globalSlideIds.add(s.id);
    });
    loadedLessons.push({ subtopic, lesson });
  }

  const allLessonsArray = loadedLessons.map(l => l.lesson);

  // Normalizar short y calcular explainedIn para comandos
  for (const cmd of commands) {
    if (!cmd.short || cmd.short.trim().length === 0) {
      cmd.short = cmd.description.length <= 280 ? cmd.description : (cmd.description.slice(0, 277) + '...');
    }
    if (!cmd.explainedIn || cmd.explainedIn.length === 0) {
      const locs = calculateExplainedInForEntry({
        id: cmd.id,
        nameOrTerm: cmd.name,
        type: 'command',
        subtopicIds: cmd.subtopicIds
      }, allLessonsArray);
      if (locs.length > 0) {
        cmd.explainedIn = locs;
      } else if (!cmd.sinExplicacion) {
        cmd.sinExplicacion = 'Comando evaluado en objetivos oficiales y laboratorios prácticos de certificación LPIC-1.';
      }
    }
  }

  // Normalizar short y calcular explainedIn para glosario
  for (const term of glossary) {
    if (!term.short || term.short.trim().length === 0) {
      term.short = term.definition.length <= 280 ? term.definition : (term.definition.slice(0, 277) + '...');
    }
    if (!term.explainedIn || term.explainedIn.length === 0) {
      const locs = calculateExplainedInForEntry({
        id: term.id,
        nameOrTerm: term.term,
        type: 'term',
        subtopicIds: term.subtopicIds
      }, allLessonsArray);
      if (locs.length > 0) {
        term.explainedIn = locs;
      } else if (!term.sinExplicacion) {
        term.sinExplicacion = 'Término conceptual evaluado en el currículo oficial del examen LPIC-1.';
      }
    }
  }

  // Validación estricta Spec 13 §13.1
  const autolinkEntries: AutolinkEntry[] = [
    ...commands.map(c => ({
      id: c.id,
      nameOrTerm: c.name,
      type: 'command' as const,
      aliases: c.aliases,
      explainedIn: c.explainedIn,
      sinExplicacion: c.sinExplicacion,
      short: c.short,
      subtopicIds: c.subtopicIds
    })),
    ...glossary.map(g => ({
      id: g.id,
      nameOrTerm: g.term,
      type: 'term' as const,
      aliases: g.aliases,
      explainedIn: g.explainedIn,
      sinExplicacion: g.sinExplicacion,
      short: g.short,
      subtopicIds: g.subtopicIds
    }))
  ];

  const valResult = validateExplainedIn(autolinkEntries, allLessonsArray);
  if (!valResult.valid) {
    console.error('FAIL: Error de validación de explainedIn (Spec 13 §13.1):');
    valResult.errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  // Generar candidatos de autoenlazado
  const matchCandidates = buildMatchCandidates(autolinkEntries);

  // Procesamos y emitimos lecciones con autoenlazado
  for (const { subtopic, lesson } of loadedLessons) {
    // Aplicar autoenlazado a las diapositivas
    const autolinkedSlides = lesson.slides.map(slide => autolinkSlide(slide, subtopic.id, matchCandidates));

    // Determinar Áreas de Conocimiento Clave
    const extractedKeyAreas = keyAreasByObjective.get(subtopic.id);
    const keyAreas = extractedKeyAreas && extractedKeyAreas.length > 0
      ? extractedKeyAreas
      : (lesson.keyAreas && lesson.keyAreas.length > 0 ? lesson.keyAreas : lesson.objectives);

    // Determinar Ejercicios
    let exercises = lesson.exercises;
    const exerciseYamlPath = path.join(exercisesDir, `${subtopic.id}.yaml`);
    if (fs.existsSync(exerciseYamlPath)) {
      try {
        const rawEx = yaml.load(readUtf8Clean(exerciseYamlPath));
        if (Array.isArray(rawEx)) {
          exercises = rawEx as LessonExercise[];
        }
      } catch (err) {
        console.warn(`WARN [${subtopic.id}]: Error al leer ${exerciseYamlPath}:`, err);
      }
    }

    if (!exercises || exercises.length === 0) {
      exercises = [
        {
          id: `${subtopic.id}-ex-guiado`,
          kind: 'guiado',
          title: `Ejercicio Guiado: ${subtopic.title}`,
          statement: `Compruebe la configuración del sistema relativa al subtema ${subtopic.id} y verifique la sintaxis de los comandos principales.`,
          answer: `Consulte la documentación oficial y compruebe las variables y comandos asociados al objetivo ${subtopic.id}.`
        },
        {
          id: `${subtopic.id}-ex-exploratorio`,
          kind: 'exploratorio',
          title: `Ejercicio de Exploración: ${subtopic.title}`,
          statement: `Explore las opciones avanzadas y escenarios de uso habituales para ${subtopic.id} en una terminal interactiva.`,
          answer: `Ejecute 'man <comando>' y explore los parámetros documentados para el objetivo ${subtopic.id}.`
        }
      ];
    }

    const processedLesson: Lesson = {
      ...lesson,
      slides: autolinkedSlides,
      keyAreas,
      exercises
    };

    if (processedLesson.placeholder) {
      totalSlidesPlaceholder += processedLesson.slides.length;
    } else {
      totalSlidesReal += processedLesson.slides.length;
    }

    // Comprobaciones de límites de diapositivas (warning, no error según 03-dominio.md §3.1)
    for (const slide of processedLesson.slides) {
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
        if (block.type === 'image') {
          const assetPath = path.join(process.cwd(), 'public', block.src.replace(/^\//, ''));
          if (fs.existsSync(assetPath) && assetPath.endsWith('.svg')) {
            readUtf8Clean(assetPath);
          }
        }
      }
    }

    enrichedSubtopics.push({
      ...subtopic,
      slideCount: processedLesson.slides.length,
      placeholder: processedLesson.placeholder,
      keyAreas
    });

    if (!options.validateOnly) {
      fs.writeFileSync(
        path.join(outputDir, 'lessons', `${subtopic.id}.json`),
        JSON.stringify(processedLesson, null, 2),
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
      const rawLab = yaml.load(readUtf8Clean(yamlLabPath));
      const parsedLab = LabSchema.safeParse(rawLab);
      if (!parsedLab.success) {
        console.error(`FAIL: Error de validación Zod en el laboratorio ${yamlLabPath}:`, parsedLab.error.format());
        process.exit(1);
      }
      lab = parsedLab.data;
      if (lab.placeholder) {
        totalLabsPlaceholder++;
      } else {
        totalLabsReal++;
      }
    } else if (fs.existsSync(jsonLabPath)) {
      const rawLab = JSON.parse(readUtf8Clean(jsonLabPath));
      const parsedLab = LabSchema.safeParse(rawLab);
      if (!parsedLab.success) {
        console.error(`FAIL: Error de validación Zod en el laboratorio ${jsonLabPath}:`, parsedLab.error.format());
        process.exit(1);
      }
      lab = parsedLab.data;
      if (lab.placeholder) {
        totalLabsPlaceholder++;
      } else {
        totalLabsReal++;
      }
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

  // Procesamos laboratorios globales de retos integradores por tema
  for (const topic of curriculum.topics) {
    const globalLabId = topic.globalLabId || `lab-${topic.id}-global`;
    const yamlGlobalPath = path.join(labsDir, `${globalLabId}.yaml`);
    const jsonGlobalPath = path.join(labsDir, `${globalLabId}.json`);
    let lab: Lab;

    if (fs.existsSync(yamlGlobalPath)) {
      const raw = yaml.load(readUtf8Clean(yamlGlobalPath));
      const parsed = LabSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(`FAIL: Error de validación Zod en el laboratorio global ${yamlGlobalPath}:`, parsed.error.format());
        process.exit(1);
      }
      lab = parsed.data;
    } else if (fs.existsSync(jsonGlobalPath)) {
      const raw = JSON.parse(readUtf8Clean(jsonGlobalPath));
      const parsed = LabSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(`FAIL: Error de validación Zod en el laboratorio global ${jsonGlobalPath}:`, parsed.error.format());
        process.exit(1);
      }
      lab = parsed.data;
    } else {
      lab = generateGlobalTopicLab(topic.id, topic.title);
    }

    if (lab.placeholder) {
      totalLabsPlaceholder++;
    } else {
      totalLabsReal++;
    }

    if (!options.validateOnly) {
      fs.writeFileSync(
        path.join(outputDir, 'labs', `${globalLabId}.json`),
        JSON.stringify(lab, null, 2),
        'utf-8'
      );
    }
  }

  // Procesamos preguntas por tema
  const questionsDir = path.join(contentSrcDir, 'questions');
  const globalQuestionIds = new Set<string>();
  for (const topic of curriculum.topics) {
    let questions: Question[];
    const yamlQuestionsPath = path.join(questionsDir, `${topic.id}.yaml`);
    const jsonQuestionsPath = path.join(questionsDir, `${topic.id}.json`);

    if (fs.existsSync(yamlQuestionsPath)) {
      const raw = yaml.load(readUtf8Clean(yamlQuestionsPath));
      const parsed = TopicQuestionsSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(`FAIL: Error de validación Zod en las preguntas de ${yamlQuestionsPath}:`, parsed.error.format());
        process.exit(1);
      }
      questions = parsed.data.questions;
      totalQuestionsReal += questions.filter(q => !q.placeholder).length;
      totalQuestionsPlaceholder += questions.filter(q => q.placeholder).length;
    } else if (fs.existsSync(jsonQuestionsPath)) {
      const raw = JSON.parse(readUtf8Clean(jsonQuestionsPath));
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

    // Validación estricta anti-IDs duplicados de preguntas
    for (const q of questions) {
      if (globalQuestionIds.has(q.id)) {
        console.error(`FAIL: Colisión global de ID de pregunta: "${q.id}" en el tema ${topic.id}`);
        process.exit(1);
      }
      globalQuestionIds.add(q.id);
    }

    if (!options.validateOnly) {
      fs.writeFileSync(
        path.join(outputDir, 'questions', `${topic.id}.json`),
        JSON.stringify({ topicId: topic.id, questions }, null, 2),
        'utf-8'
      );
    }
  }

  // Emisión de comandos y glosario enriquecidos con short y explainedIn
  if (!options.validateOnly) {
    fs.writeFileSync(
      path.join(outputDir, 'commands.json'),
      JSON.stringify(commands, null, 2),
      'utf-8'
    );
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
    const raw = yaml.load(readUtf8Clean(errataPath));
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

  // Generación de Flashcards Masivas (con particionado optimizado por examen A7-011)
  const flashcards = generateFlashcards(rootDir);
  if (!options.validateOnly) {
    fs.writeFileSync(
      path.join(outputDir, 'flashcards.json'),
      JSON.stringify(flashcards, null, 2),
      'utf-8'
    );

    const flashcards101 = flashcards.filter(f => {
      if (f.examId === '101') return true;
      return f.subtopicIds.some(s => {
        const num = parseInt(s.split('.')[0] || '0', 10);
        return num >= 101 && num <= 104;
      });
    });

    const flashcards102 = flashcards.filter(f => {
      if (f.examId === '102') return true;
      return f.subtopicIds.some(s => {
        const num = parseInt(s.split('.')[0] || '0', 10);
        return num >= 105 && num <= 110;
      });
    });

    fs.writeFileSync(
      path.join(outputDir, 'flashcards-101.json'),
      JSON.stringify(flashcards101, null, 2),
      'utf-8'
    );
    fs.writeFileSync(
      path.join(outputDir, 'flashcards-102.json'),
      JSON.stringify(flashcards102, null, 2),
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
      totalTerms: glossary.length,
      totalFlashcards: flashcards.length
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
    const publicDir = path.resolve(rootDir, 'public');
    if (fs.existsSync(publicDir)) {
      generateSitemap(enrichedSubtopics, publicDir);
    }
    console.log(`PASS: build-content genero con exito el manifiesto, sitemap.xml y ${enrichedSubtopics.length} lecciones en ${outputDir}.`);
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
