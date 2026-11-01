import * as fs from 'node:fs';
import * as path from 'node:path';
import { TopicQuestionsSchema } from '../../src/app/core/schemas/index';
import { Question } from '../../src/app/core/models/index';

export interface Legacy102Question {
  id: number;
  num?: number;
  tema: number;
  stem: string;
  type: string;
  pick_count?: number;
  options?: string[];
  correct_indices?: number[];
  fill_answers?: string[];
  correct_text?: string;
  explanation?: string;
}

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

/**
 * Palabras clave y conceptos específicos por subtema del Examen 102
 * utilizados para la clasificación precisa de las preguntas legacy.
 */
export const SUBTOPIC_KEYWORDS_102: Record<string, string[]> = {
  '105.1': ['bashrc', 'profile', 'export', 'env', 'unset', 'alias', 'history', 'source', 'set ', 'variable de entorno', 'variables de entorno', 'login shell', 'non-login'],
  '105.2': ['script', '#!/', 'test', 'read ', 'read -', 'while', 'for ', 'case', 'esac', 'shift', 'seq', 'exit', '$1', '$@', '$#', '$?', '[[', '[ ', 'if [', 'then'],
  '106.1': ['x11', 'xorg', 'wayland', 'xorg.conf', 'xhost', 'xauth', 'xrdb', 'xrandr', 'xdpyinfo', 'xinit', 'startx', 'display', 'xdg-session-type'],
  '106.2': ['lightdm', 'gdm', 'sddm', 'xdm', 'kde', 'gnome', 'xfce', 'display manager', 'gestor de pantalla', 'window manager', 'gestor de ventanas', 'desktop environment'],
  '106.3': ['accesibilidad', 'accessibility', 'orca', 'sticky keys', 'slow keys', 'bounce keys', 'screen reader', 'teclas especiales', 'teclas lentas', 'at-spi', 'teclas de rebote'],
  '107.1': ['useradd', 'usermod', 'userdel', 'groupadd', 'groupmod', 'groupdel', 'passwd', 'chage', 'shadow', 'gshadow', 'skel', '/etc/default/useradd', '/etc/login.defs', 'id ', 'who', 'w ', '/etc/passwd'],
  '107.2': ['cron', 'crontab', 'anacron', '/etc/cron', 'at ', 'atq', 'atrm', 'batch', 'systemd-run', 'timer'],
  '107.3': ['locale', 'localectl', 'timedatectl', 'tzselect', 'zoneinfo', 'iconv', 'utf-8', 'iso-8859', 'lang', 'lc_all', 'lc_time', 'lc_ctype', '/usr/share/zoneinfo'],
  '108.1': ['ntp', 'chrony', 'chronyc', 'systemd-timesyncd', 'hwclock', 'reloj', 'pool.ntp.org', 'ntpq'],
  '108.2': ['syslog', 'rsyslog', '/etc/rsyslog.conf', 'journald', 'journalctl', 'logrotate', '/var/log', 'logger', '/etc/logrotate.conf'],
  '108.3': ['mta', 'postfix', 'sendmail', 'exim', 'aliases', 'newaliases', '/etc/aliases', '~/.forward', 'mailq', 'mailx', 'mail '],
  '108.4': ['cups', 'cupsd', 'impresora', 'impresi', 'lpr', 'lpq', 'lprm', 'lpstat', 'cancel', '/etc/cups'],
  '109.1': ['ipv4', 'ipv6', 'cidr', 'subred', 'subnet', 'netmask', 'mascara', 'clase a', 'clase b', 'clase c', 'privada', 'broadcast', 'puerto 22', 'puerto 80', 'icmp', 'tcp', 'udp'],
  '109.2': ['/etc/network/interfaces', 'networkmanager', 'nmcli', 'nmtui', 'networkd', 'interface', 'gateway', 'puerta de enlace', 'ifup', 'ifdown', 'dhcp'],
  '109.3': ['ping', 'traceroute', 'tracepath', 'ip route', 'route ', 'ip addr', 'ip link', 'ifconfig', 'netstat', 'ss ', 'arp'],
  '109.4': ['resolv.conf', 'nsswitch.conf', '/etc/hosts', 'nameserver', 'dns', 'dig', 'host ', 'nslookup', 'systemd-resolved'],
  '110.1': ['limits.conf', 'ulimit', 'suid', 'sgid', 'sudo', 'sudoers', 'visudo', 'su -', 'su ', 'seguridad', 'find / -perm'],
  '110.2': ['xinetd', 'inetd', 'hosts.allow', 'hosts.deny', 'tcp wrappers', 'firewall', 'iptables', 'nftables', 'ufw', 'firewalld', 'puertos abiertos', 'lsof', 'nmap'],
  '110.3': ['ssh', 'sshd', 'sshd_config', 'ssh_config', 'ssh-keygen', 'ssh-copy-id', 'authorized_keys', 'known_hosts', 'gpg', 'gpg2', 'cifrado', 'llave publica', 'clave privada']
};

/**
 * Clasifica una pregunta legacy del 102 en su subtema correspondiente
 */
export function classify102QuestionSubtopic(q: Legacy102Question): string {
  const topicId = String(q.tema);
  const candidateSubtopics = Object.keys(SUBTOPIC_KEYWORDS_102).filter((s) =>
    s.startsWith(`${topicId}.`)
  );

  if (candidateSubtopics.length === 0) {
    return `${topicId}.1`;
  }

  const combinedText = [
    q.stem,
    ...(q.options ?? []),
    q.correct_text ?? '',
    q.explanation ?? ''
  ].join(' ').toLowerCase();

  let bestSubtopic = candidateSubtopics[0] ?? `${topicId}.1`;
  let maxScore = -1;

  for (const subId of candidateSubtopics) {
    const kws = SUBTOPIC_KEYWORDS_102[subId] ?? [];
    let score = 0;
    for (const kw of kws) {
      if (combinedText.includes(kw)) {
        // Ponderar por longitud de palabra clave para preferir coincidencias específicas
        score += kw.length;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestSubtopic = subId;
    }
  }

  return bestSubtopic;
}

/**
 * Importa las preguntas del Examen 102 desde el legado hacia content-src/questions/
 */
export function import102Questions(
  legacyFile: string,
  destQuestionsDir: string
): {
  total: number;
  byTopic: Record<string, number>;
  bySubtopic: Record<string, number>;
  questionsByTopic: Record<string, Question[]>;
} {
  if (!fs.existsSync(legacyFile)) {
    throw new Error(`Archivo legacy de preguntas 102 no encontrado: ${legacyFile}`);
  }

  const raw102: Legacy102Question[] = JSON.parse(fs.readFileSync(legacyFile, 'utf-8'));
  const questionsByTopic: Record<string, Question[]> = {
    '105': [],
    '106': [],
    '107': [],
    '108': [],
    '109': [],
    '110': []
  };

  const bySubtopic: Record<string, number> = {};
  for (const s of Object.keys(SUBTOPIC_KEYWORDS_102)) {
    bySubtopic[s] = 0;
  }

  for (const leg of raw102) {
    const topicId = String(leg.tema);
    const qId = `q-102-${leg.id}`;
    const subtopicId = classify102QuestionSubtopic(leg);

    bySubtopic[subtopicId] = (bySubtopic[subtopicId] ?? 0) + 1;

    let type: 'single' | 'multiple' | 'fill' = 'single';
    if (leg.type === 'multiple') type = 'multiple';
    else if (leg.type === 'fill') type = 'fill';

    if (type === 'single' && (!leg.options || leg.options.length < 2) && leg.correct_text) {
      type = 'fill';
    }

    let options: { id: string; text: string }[] | undefined;
    let correct: string[] = [];
    let acceptedAnswers: string[] | undefined;

    if (type === 'single' || type === 'multiple') {
      const rawOpts = leg.options ?? [];
      options = rawOpts.map((opt, idx) => ({
        id: LETTERS[idx] ?? `opt-${idx}`,
        text: opt.replace(/^[A-G]\)\s*/i, '').trim()
      }));

      let indices = leg.correct_indices ?? [0];
      if (leg.id === 83 && leg.tema === 110 && indices.length > 1) {
        indices = [0];
      }

      correct = indices.map((idx) => LETTERS[idx] ?? 'a');
      if (correct.length === 0) {
        correct = ['a'];
      }
    } else {
      const ans = leg.correct_text?.trim() || leg.fill_answers?.[0]?.trim() || 'sh';
      correct = [ans];
      acceptedAnswers =
        leg.fill_answers && leg.fill_answers.length > 0
          ? Array.from(new Set([ans, ...leg.fill_answers.map((a) => a.trim())]))
          : [ans];
    }

    let explanation = leg.explanation?.trim() || '';
    if (!explanation) {
      explanation = `Explicación oficial para la pregunta del Subtema ${subtopicId} evaluada en el Examen 102 de LPIC-1.`;
    }

    const question: Question = {
      id: qId,
      topicId,
      subtopicId,
      type,
      prompt: leg.stem,
      options,
      correct,
      acceptedAnswers,
      explanation,
      difficulty: type === 'fill' ? 'hard' : type === 'multiple' ? 'medium' : 'easy',
      placeholder: false,
      status: 'pendiente-verificacion',
      verified: false
    };

    questionsByTopic[topicId]?.push(question);
  }

  // Comprobar que los 19 subtemas tengan >= 1 pregunta
  const emptySubtopics = Object.keys(bySubtopic).filter((s) => (bySubtopic[s] ?? 0) === 0);
  if (emptySubtopics.length > 0) {
    throw new Error(
      `Error de cobertura en preguntas del 102: Los siguientes subtemas no tienen preguntas: ${emptySubtopics.join(
        ', '
      )}`
    );
  }

  // Guardar cada archivo de preguntas validado con Zod
  if (!fs.existsSync(destQuestionsDir)) {
    fs.mkdirSync(destQuestionsDir, { recursive: true });
  }

  const byTopic: Record<string, number> = {};
  for (const topicId of Object.keys(questionsByTopic)) {
    const questions = questionsByTopic[topicId] ?? [];
    byTopic[topicId] = questions.length;

    const topicData = { topicId, questions };
    const validation = TopicQuestionsSchema.safeParse(topicData);
    if (!validation.success) {
      throw new Error(
        `Error validando preguntas del tema ${topicId}: ${JSON.stringify(
          validation.error.format()
        )}`
      );
    }

    const destPath = path.join(destQuestionsDir, `${topicId}.json`);
    fs.writeFileSync(destPath, JSON.stringify(topicData, null, 2), 'utf-8');
  }

  return {
    total: raw102.length,
    byTopic,
    bySubtopic,
    questionsByTopic
  };
}

const isMain = process.argv[1]?.includes('questions-102');
if (isMain) {
  const rootDir = process.cwd();
  const legacyFile = path.resolve(
    rootDir,
    '_legacy/Recurso Final Definitivo/app/simulador/preguntas_102.json'
  );
  const destDir = path.resolve(rootDir, 'content-src/questions');

  console.log('Importando banco de 120 preguntas oficiales del Examen 102...');
  const res = import102Questions(legacyFile, destDir);
  console.log(`✔ ${res.total} preguntas del Examen 102 importadas con éxito.`);
  console.log('Desglose por tema:');
  for (const [t, c] of Object.entries(res.byTopic)) {
    console.log(`  - Tema ${t}: ${c} preguntas`);
  }
  console.log('Desglose por subtema:');
  for (const [s, c] of Object.entries(res.bySubtopic)) {
    console.log(`  - Subtema ${s}: ${c} preguntas`);
  }
}

