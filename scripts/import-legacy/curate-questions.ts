import { Question } from '../../src/app/core/models/index';

/**
 * Mapeo oficial de las 120 preguntas del Examen 101 a sus 23 subtemas reales (101.1 - 104.7).
 */
export const EXAM_101_SUBTOPIC_MAPPING: Record<string, { topicId: string; subtopicId: string }> = {
  // Topic 101 (17 preguntas)
  'q-101-12': { topicId: '101', subtopicId: '101.3' },
  'q-101-13': { topicId: '101', subtopicId: '101.1' },
  'q-101-14': { topicId: '101', subtopicId: '101.2' },
  'q-101-15': { topicId: '101', subtopicId: '101.2' },
  'q-101-16': { topicId: '101', subtopicId: '101.1' },
  'q-101-17': { topicId: '101', subtopicId: '101.2' },
  'q-101-40': { topicId: '103', subtopicId: '103.4' },
  'q-101-43': { topicId: '101', subtopicId: '101.1' },
  'q-101-48': { topicId: '103', subtopicId: '103.6' },
  'q-101-54': { topicId: '101', subtopicId: '101.2' },
  'q-101-55': { topicId: '102', subtopicId: '102.4' },
  'q-101-95': { topicId: '103', subtopicId: '103.4' },
  'q-101-98': { topicId: '101', subtopicId: '101.2' },
  'q-101-99': { topicId: '101', subtopicId: '101.1' },
  'q-101-100': { topicId: '101', subtopicId: '101.1' },
  'q-101-104': { topicId: '104', subtopicId: '104.2' },
  'q-101-106': { topicId: '101', subtopicId: '101.1' },
  'q-101-116': { topicId: '101', subtopicId: '101.2' },
  'q-101-117': { topicId: '101', subtopicId: '101.3' },

  // Topic 102 (24 preguntas)
  'q-102-18': { topicId: '102', subtopicId: '102.4' },
  'q-102-19': { topicId: '102', subtopicId: '102.3' },
  'q-102-20': { topicId: '102', subtopicId: '102.2' },
  'q-102-21': { topicId: '102', subtopicId: '102.5' },
  'q-102-22': { topicId: '102', subtopicId: '102.6' },
  'q-102-23': { topicId: '102', subtopicId: '102.2' },
  'q-102-24': { topicId: '102', subtopicId: '102.1' },
  'q-102-25': { topicId: '102', subtopicId: '102.5' },
  'q-102-26': { topicId: '102', subtopicId: '102.4' },
  'q-102-27': { topicId: '102', subtopicId: '102.5' },
  'q-102-42': { topicId: '103', subtopicId: '103.4' },
  'q-102-45': { topicId: '103', subtopicId: '103.3' },
  'q-102-52': { topicId: '102', subtopicId: '102.5' },
  'q-102-53': { topicId: '102', subtopicId: '102.2' },
  'q-102-56': { topicId: '102', subtopicId: '102.4' },
  'q-102-57': { topicId: '102', subtopicId: '102.6' },
  'q-102-58': { topicId: '102', subtopicId: '102.4' },
  'q-102-60': { topicId: '102', subtopicId: '102.3' },
  'q-102-66': { topicId: '104', subtopicId: '104.5' },
  'q-102-67': { topicId: '104', subtopicId: '104.1' },
  'q-102-72': { topicId: '104', subtopicId: '104.7' },
  'q-102-80': { topicId: '103', subtopicId: '103.5' },
  'q-102-89': { topicId: '103', subtopicId: '103.3' },
  'q-102-96': { topicId: '102', subtopicId: '102.2' },
  'q-102-101': { topicId: '101', subtopicId: '101.3' },
  'q-102-102': { topicId: '102', subtopicId: '102.4' },
  'q-102-105': { topicId: '101', subtopicId: '101.2' },

  // Topic 103 (50 preguntas)
  'q-103-28': { topicId: '103', subtopicId: '103.6' },
  'q-103-30': { topicId: '103', subtopicId: '103.4' },
  'q-103-31': { topicId: '103', subtopicId: '103.8' },
  'q-103-32': { topicId: '103', subtopicId: '103.1' },
  'q-103-33': { topicId: '103', subtopicId: '103.5' },
  'q-103-34': { topicId: '103', subtopicId: '103.8' },
  'q-103-35': { topicId: '103', subtopicId: '103.2' },
  'q-103-36': { topicId: '103', subtopicId: '103.8' },
  'q-103-37': { topicId: '103', subtopicId: '103.4' },
  'q-103-38': { topicId: '103', subtopicId: '103.1' },
  'q-103-39': { topicId: '103', subtopicId: '103.1' },
  'q-103-41': { topicId: '103', subtopicId: '103.5' },
  'q-103-44': { topicId: '103', subtopicId: '103.4' },
  'q-103-47': { topicId: '103', subtopicId: '103.7' },
  'q-103-49': { topicId: '103', subtopicId: '103.7' },
  'q-103-59': { topicId: '102', subtopicId: '102.2' },
  'q-103-61': { topicId: '104', subtopicId: '104.1' },
  'q-103-65': { topicId: '104', subtopicId: '104.3' },
  'q-103-68': { topicId: '104', subtopicId: '104.5' },
  'q-103-73': { topicId: '103', subtopicId: '103.1' },
  'q-103-74': { topicId: '103', subtopicId: '103.1' },
  'q-103-76': { topicId: '103', subtopicId: '103.1' },
  'q-103-78': { topicId: '103', subtopicId: '103.8' },
  'q-103-79': { topicId: '103', subtopicId: '103.7' },
  'q-103-81': { topicId: '103', subtopicId: '103.7' },
  'q-103-82': { topicId: '103', subtopicId: '103.1' },
  'q-103-83': { topicId: '103', subtopicId: '103.4' },
  'q-103-84': { topicId: '103', subtopicId: '103.6' },
  'q-103-86': { topicId: '103', subtopicId: '103.7' },
  'q-103-87': { topicId: '104', subtopicId: '104.7' },
  'q-103-88': { topicId: '103', subtopicId: '103.2' },
  'q-103-90': { topicId: '103', subtopicId: '103.8' },
  'q-103-91': { topicId: '103', subtopicId: '103.5' },
  'q-103-92': { topicId: '103', subtopicId: '103.2' },
  'q-103-93': { topicId: '103', subtopicId: '103.4' },
  'q-103-94': { topicId: '103', subtopicId: '103.6' },
  'q-103-97': { topicId: '101', subtopicId: '101.3' },
  'q-103-109': { topicId: '103', subtopicId: '103.1' },
  'q-103-111': { topicId: '104', subtopicId: '104.5' },
  'q-103-113': { topicId: '103', subtopicId: '103.1' },
  'q-103-114': { topicId: '103', subtopicId: '103.3' },
  'q-103-115': { topicId: '103', subtopicId: '103.5' },
  'q-103-120': { topicId: '103', subtopicId: '103.5' },

  // Topic 104 (29 preguntas)
  'q-104-1': { topicId: '104', subtopicId: '104.1' },
  'q-104-2': { topicId: '104', subtopicId: '104.5' },
  'q-104-3': { topicId: '104', subtopicId: '104.1' },
  'q-104-4': { topicId: '104', subtopicId: '104.3' },
  'q-104-5': { topicId: '104', subtopicId: '104.7' },
  'q-104-6': { topicId: '104', subtopicId: '104.3' },
  'q-104-7': { topicId: '104', subtopicId: '104.3' },
  'q-104-8': { topicId: '104', subtopicId: '104.3' },
  'q-104-9': { topicId: '104', subtopicId: '104.5' },
  'q-104-10': { topicId: '104', subtopicId: '104.6' },
  'q-104-11': { topicId: '104', subtopicId: '104.7' },
  'q-104-29': { topicId: '104', subtopicId: '104.7' },
  'q-104-46': { topicId: '103', subtopicId: '103.2' },
  'q-104-50': { topicId: '104', subtopicId: '104.3' },
  'q-104-51': { topicId: '102', subtopicId: '102.5' },
  'q-104-62': { topicId: '102', subtopicId: '102.1' },
  'q-104-63': { topicId: '104', subtopicId: '104.6' },
  'q-104-64': { topicId: '104', subtopicId: '104.3' },
  'q-104-69': { topicId: '104', subtopicId: '104.6' },
  'q-104-70': { topicId: '104', subtopicId: '104.2' },
  'q-104-71': { topicId: '104', subtopicId: '104.6' },
  'q-104-75': { topicId: '103', subtopicId: '103.4' },
  'q-104-77': { topicId: '103', subtopicId: '103.5' },
  'q-104-85': { topicId: '103', subtopicId: '103.3' },
  'q-104-103': { topicId: '103', subtopicId: '103.7' },
  'q-104-107': { topicId: '102', subtopicId: '102.1' },
  'q-104-108': { topicId: '103', subtopicId: '103.5' },
  'q-104-110': { topicId: '102', subtopicId: '102.5' },
  'q-104-112': { topicId: '103', subtopicId: '103.8' },
  'q-104-118': { topicId: '104', subtopicId: '104.5' },
  'q-104-119': { topicId: '104', subtopicId: '104.6' }
};

/**
 * Limpia y normaliza respuestas aceptadas de preguntas tipo fill.
 */
export function cleanFillQuestionAnswers(q: Question): void {
  if (q.type !== 'fill') return;

  const answers = new Set<string>();
  const candidates = [q.correct[0], ...(q.acceptedAnswers || [])];

  for (const raw of candidates) {
    if (!raw) continue;
    let clean = raw.trim();
    // Eliminar notas editoriales entre paréntesis: ej. "newaliases (también aceptado...)"
    if (clean.includes('(')) {
      clean = clean.replace(/\s*\([^)]*\)/g, '').trim();
    }
    // Eliminar prefijo de prompt bash '$'
    if (clean.startsWith('$')) {
      clean = clean.replace(/^\$\s*/, '').trim();
    }
    if (!clean) continue;

    answers.add(clean);
    // Si es una ruta absoluta, admitir variante con y sin barra final
    if (clean.startsWith('/')) {
      const noSlash = clean.replace(/\/+$/, '');
      if (noSlash) {
        answers.add(noSlash);
        answers.add(noSlash + '/');
      }
    }
  }

  q.acceptedAnswers = Array.from(answers);
  const primary = q.correct[0];
  if (primary && !q.acceptedAnswers.includes(primary)) {
    q.acceptedAnswers.unshift(primary);
  }
}

/**
 * Aplica curación pedagógica y correcciones de fidelidad LPI a las preguntas del Examen 101.
 */
export function curate101Questions(questions: Question[]): Record<string, Question[]> {
  const result: Record<string, Question[]> = {
    '101': [],
    '102': [],
    '103': [],
    '104': []
  };

  for (const q of questions) {
    const map = EXAM_101_SUBTOPIC_MAPPING[q.id];
    if (map) {
      q.topicId = map.topicId;
      q.subtopicId = map.subtopicId;
    }

    // A5-001: Corrección de claves falsas o invertidas
    if (q.id === 'q-103-82') {
      q.correct = ['a', 'd'];
    } else if (q.id === 'q-103-32') {
      q.correct = ['a', 'd'];
    } else if (q.id === 'q-102-80') {
      const optC = q.options?.find((o) => o.id === 'c');
      if (optC) optC.text = 'SIGTSTP';
      q.correct = ['c'];
      q.explanation =
        'En entornos interactivos de terminal, la pulsación de la combinación de teclas Ctrl+Z genera la señal SIGTSTP (Terminal Stop, señal 20), suspendiendo temporalmente el proceso en ejecución y devolviendo el control a la shell.';
    }

    // A5-003: Opciones corruptas por separación errónea
    else if (q.id === 'q-103-30') {
      q.options = [
        { id: 'a', text: '<' },
        { id: 'b', text: '#>' },
        { id: 'c', text: '%>' },
        { id: 'd', text: '>>>' },
        { id: 'e', text: '2>&1' }
      ];
      q.correct = ['a', 'e'];
      q.explanation =
        'En Bash (man 1 bash), < es el operador estándar de redirección de entrada estándar (descriptor 0), y 2>&1 redirige el descriptor de archivo 2 (standard error) al mismo destino que el descriptor 1 (standard output). Los operadores #>, %> y >>> no son operadores de redirección estándar en Bash.';
    } else if (q.id === 'q-103-37') {
      q.options = [
        { id: 'a', text: 'foo | less /tmp/foodata' },
        { id: 'b', text: 'foo | cp /tmp/foodata' },
        { id: 'c', text: 'foo > /tmp/foodata' },
        { id: 'd', text: 'foo | tee /tmp/foodata' },
        { id: 'e', text: 'foo > stdout >> /tmp/foodata' }
      ];
      q.correct = ['d'];
      q.explanation =
        'El comando tee (man 1 tee) lee de la entrada estándar y escribe simultáneamente tanto en la salida estándar (pantalla) como en el archivo especificado (/tmp/foodata). La sintaxis correcta usando una canalización es foo | tee /tmp/foodata.';
    } else if (q.id === 'q-103-49') {
      q.options = [
        { id: 'a', text: "grep -E ':08:[0-9]+:[0-9]+' loga.log" },
        { id: 'b', text: "grep -E ':08:[0-9]+' loga.log" },
        { id: 'c', text: "grep -E loga.log ':08:[0-9]+:[0-9]+'" },
        { id: 'd', text: "grep loga.log ':08:[0-9]:[0-9]'" },
        { id: 'e', text: "grep ':08:[0-9]+:[0-9]+' loga.log" }
      ];
      q.correct = ['a'];
    }

    // A5-002 / A8-004: Correcciones de preguntas fill
    else if (q.id === 'q-102-52') {
      q.correct = ['/etc/yum.repos.d'];
      q.acceptedAnswers = ['/etc/yum.repos.d', '/etc/yum.repos.d/'];
    } else if (q.id === 'q-102-72') {
      q.correct = ['/usr/local/bin'];
      q.acceptedAnswers = ['/usr/local/bin', '/usr/local/bin/'];
    } else if (q.id === 'q-104-64') {
      q.correct = ['/proc/mounts'];
      q.acceptedAnswers = ['/proc/mounts', '/proc/self/mounts'];
    }

    cleanFillQuestionAnswers(q);
    result[q.topicId]?.push(q);
  }

  return result;
}

/**
 * Aplica curación pedagógica y correcciones de fidelidad LPI a las preguntas del Examen 102.
 */
export function curate102Questions(
  questionsByTopic: Record<string, Question[]>
): Record<string, Question[]> {
  const result: Record<string, Question[]> = {
    '105': [],
    '106': questionsByTopic['106'] ?? [],
    '107': questionsByTopic['107'] ?? [],
    '108': questionsByTopic['108'] ?? [],
    '109': questionsByTopic['109'] ?? [],
    '110': questionsByTopic['110'] ?? []
  };

  // Reubicar las 5 preguntas erróneamente catalogadas en el tema 105 en el legacy
  const source105 = questionsByTopic['105'] ?? [];
  for (const q of source105) {
    if (q.id === 'q-105-25') {
      q.id = 'q-107-25';
      q.topicId = '107';
      q.subtopicId = '107.1';
      (result['107'] ??= []).push(q);
    } else if (q.id === 'q-105-72') {
      q.id = 'q-108-72';
      q.topicId = '108';
      q.subtopicId = '108.1';
      (result['108'] ??= []).push(q);
    } else if (q.id === 'q-105-104') {
      q.id = 'q-109-104';
      q.topicId = '109';
      q.subtopicId = '109.1';
      (result['109'] ??= []).push(q);
    } else if (q.id === 'q-105-106') {
      q.id = 'q-107-106';
      q.topicId = '107';
      q.subtopicId = '107.3';
      (result['107'] ??= []).push(q);
    } else if (q.id === 'q-105-107') {
      q.id = 'q-107-107';
      q.topicId = '107';
      q.subtopicId = '107.1';
      q.correct = ['-m'];
      q.acceptedAnswers = ['-m', '--create-home'];
      (result['107'] ??= []).push(q);
    } else {
      (result['105'] ??= []).push(q);
    }
  }

  // Curar temas 105 a 110
  for (const topicId of ['105', '106', '107', '108', '109', '110']) {
    for (const q of result[topicId] ?? []) {
      // A5-001: Corrección de claves en 107, 109, 110
      if (q.id === 'q-107-21') {
        q.correct = ['e'];
        const optD = q.options?.find((o) => o.id === 'd');
        if (optD) optD.text = optD.text.replace('fil e', 'file');
        const optE = q.options?.find((o) => o.id === 'e');
        if (optE) optE.text = optE.text.replace('tim ezone', 'timezone').replace('f ile', 'file');
      } else if (q.id === 'q-109-8') {
        q.correct = ['e'];
        const optC = q.options?.find((o) => o.id === 'c');
        if (optC) optC.text = optC.text.replace('n etwork', 'network');
        const optE = q.options?.find((o) => o.id === 'e');
        if (optE) optE.text = optE.text.replace('worki ng', 'working');
      } else if (q.id === 'q-110-50') {
        q.correct = ['c', 'd', 'e'];
      } else if (q.id === 'q-110-84') {
        q.correct = ['e'];
        const optE = q.options?.find((o) => o.id === 'e');
        if (optE) optE.text = optE.text.replace('connectio ns.', 'connections.');
      } else if (q.id === 'q-110-85') {
        q.correct = ['b', 'd'];
        const optE = q.options?.find((o) => o.id === 'e');
        if (optE) optE.text = optE.text.replace('mus t', 'must').replace('serv er.', 'server.');
      }

      // A5-002 / A8-004: Fill questions en 108, 109, 110
      else if (q.id === 'q-108-34') {
        q.correct = ['/etc/cups'];
        q.acceptedAnswers = ['/etc/cups', '/etc/cups/'];
      } else if (q.id === 'q-108-37') {
        q.correct = ['server'];
        q.acceptedAnswers = ['server', 'pool'];
      } else if (q.id === 'q-109-1') {
        q.correct = ['hostname'];
        q.acceptedAnswers = ['hostname', 'hostnamectl'];
      } else if (q.id === 'q-110-88') {
        q.correct = ['/etc/xinetd.d'];
        q.acceptedAnswers = ['/etc/xinetd.d', '/etc/xinetd.d/'];
      }

      cleanFillQuestionAnswers(q);
    }
  }

  return result;
}

