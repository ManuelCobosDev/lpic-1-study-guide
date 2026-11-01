import { DiagramSpec } from '../../models/diagram.model';

export const DIAGRAM_BOOT_SEQUENCE: DiagramSpec = {
  kind: 'flow',
  title: 'Secuencia de Arranque de Linux',
  caption: 'Etapas del proceso de inicialización desde el firmware hasta el espacio de usuario',
  alt: 'Diagrama de flujo de la secuencia de arranque en Linux: firmware UEFI o BIOS carga el gestor GRUB 2, que descomprime el Kernel y la imagen initramfs para transferir el control a systemd.',
  direction: 'horizontal',
  nodes: [
    { id: 'firmware', label: '1. Firmware', sublabel: 'UEFI / BIOS POST', tone: 'neutral', badge: '1' },
    { id: 'bootloader', label: '2. Gestor de arranque', sublabel: 'GRUB 2 (/boot)', tone: 'primary', badge: '2' },
    { id: 'kernel', label: '3. Kernel Linux', sublabel: 'vmlinuz + initramfs', tone: 'success', badge: '3' },
    { id: 'init', label: '4. Init / systemd', sublabel: 'PID 1 (default.target)', tone: 'info', badge: '4' }
  ],
  edges: [
    { from: 'firmware', to: 'bootloader', label: 'Localiza ESP / MBR', primary: true },
    { from: 'bootloader', to: 'kernel', label: 'Carga en memoria RAM', primary: true },
    { from: 'kernel', to: 'init', label: 'Monta raíz e invoca PID 1', primary: true }
  ]
};

export const DIAGRAM_OS_LAYERS: DiagramSpec = {
  kind: 'layers',
  title: 'Capas del Sistema Operativo GNU/Linux',
  caption: 'Jerarquía de abstracción entre el hardware físico y el usuario final',
  alt: 'Diagrama de capas horizontales que muestra de base a cima: hardware del equipo, núcleo Linux en modo kernel, demonios y bibliotecas del sistema, y software de aplicación del usuario.',
  nodes: [
    { id: 'apps', label: 'Aplicaciones de Usuario', sublabel: 'Navegadores, editores, scripts bash', tone: 'info' },
    { id: 'shell', label: 'Entorno de Sistema y Shell', sublabel: 'GNU Coreutils, daemons systemd, bibliotecas glibc', tone: 'primary' },
    { id: 'kernel', label: 'Núcleo Linux (Kernel)', sublabel: 'Controlador de dispositivos, scheduler, memoria virtual', tone: 'warning' },
    { id: 'hardware', label: 'Hardware Físico', sublabel: 'CPU, RAM, discos NVMe/SATA, puertos PCIe', tone: 'neutral' }
  ],
  edges: [
    { from: 'apps', to: 'shell', label: 'Llamadas a funciones de biblioteca' },
    { from: 'shell', to: 'kernel', label: 'Llamadas al sistema (syscalls)' },
    { from: 'kernel', to: 'hardware', label: 'Controladores e interrupciones' }
  ]
};

export const DIAGRAM_FHS_TREE: DiagramSpec = {
  kind: 'tree',
  title: 'Jerarquía del Sistema de Archivos (FHS)',
  caption: 'Estructura estándar de directorios en Linux según la especificación FHS',
  alt: 'Árbol de directorios de Linux partiendo del directorio raíz / hacia directorios estándar: /etc para configuración, /bin para binarios, /home para usuarios, /var para datos variables y /usr para aplicaciones.',
  nodes: [
    { id: 'root', label: '/', sublabel: 'Directorio Raíz', tone: 'primary', shape: 'pill' },
    { id: 'etc', label: '/etc', sublabel: 'Configuración local', tone: 'warning' },
    { id: 'bin', label: '/bin', sublabel: 'Comandos esenciales', tone: 'info' },
    { id: 'home', label: '/home', sublabel: 'Usuarios personales', tone: 'success' },
    { id: 'var', label: '/var', sublabel: 'Logs y datos variables', tone: 'neutral' },
    { id: 'usr', label: '/usr', sublabel: 'Programas compartidos', tone: 'neutral' }
  ],
  edges: [
    { from: 'root', to: 'etc' },
    { from: 'root', to: 'bin' },
    { from: 'root', to: 'home' },
    { from: 'root', to: 'var' },
    { from: 'root', to: 'usr' }
  ]
};

export const DIAGRAM_DISK_PARTITIONS: DiagramSpec = {
  kind: 'segments',
  title: 'Esquema de Particionado de Disco (GPT)',
  caption: 'Distribución de particiones típicas en una tabla GPT de instalación moderna',
  alt: 'Barra segmentada de particiones de disco /dev/sda que muestra /dev/sda1 (EFI de 512 MB), /dev/sda2 (/boot de 1 GB), /dev/sda3 (/ raíz de 40 GB en ext4) y /dev/sda4 (área de intercambio swap de 4 GB).',
  nodes: [
    { id: 'sda1', label: 'sda1: EFI', sublabel: 'vfat (512 MB)', tone: 'info', size: 10 },
    { id: 'sda2', label: 'sda2: /boot', sublabel: 'ext4 (1 GB)', tone: 'neutral', size: 15 },
    { id: 'sda3', label: 'sda3: / (Raíz)', sublabel: 'ext4 (40 GB)', tone: 'primary', size: 60 },
    { id: 'sda4', label: 'sda4: swap', sublabel: 'swap (4 GB)', tone: 'warning', size: 15 }
  ]
};

export const DIAGRAM_STREAMS_PIPES: DiagramSpec = {
  kind: 'streams',
  title: 'Flujos Estándar, Redirecciones y Tuberías',
  caption: 'Manejo de canales 0 (stdin), 1 (stdout) y 2 (stderr) en un comando Linux',
  alt: 'Diagrama de flujos de E/S donde el teclado envía datos por stdin descriptor 0 hacia el proceso; el proceso envía salida normal por stdout descriptor 1 y errores por stderr descriptor 2.',
  nodes: [
    { id: 'stdin', label: '0: stdin', sublabel: 'Entrada estándar', tone: 'neutral', badge: '0' },
    { id: 'proc', label: 'Proceso Linux', sublabel: 'grep / awk / sed', tone: 'primary', shape: 'box' },
    { id: 'stdout', label: '1: stdout', sublabel: 'Salida normal (>)', tone: 'success', badge: '1' },
    { id: 'stderr', label: '2: stderr', sublabel: 'Errores (2>)', tone: 'danger', badge: '2' }
  ],
  edges: [
    { from: 'stdin', to: 'proc', label: 'Canal 0 (<)' },
    { from: 'proc', to: 'stdout', label: 'Canal 1 (>)', tone: 'success' },
    { from: 'proc', to: 'stderr', label: 'Canal 2 (2>)', tone: 'danger' }
  ]
};

export const DIAGRAM_PROCESS_STATES: DiagramSpec = {
  kind: 'states',
  title: 'Ciclo de Vida y Estados de un Proceso',
  caption: 'Transiciones principales de estados de procesos según el planificador del kernel',
  alt: 'Diagrama de estados de un proceso: Running (R, ejecutando), Sleeping (S, esperando E/S), Stopped (T, detenido por señal) y Zombie (Z, terminado esperando lectura del padre).',
  nodes: [
    { id: 'running', label: 'Running (R)', sublabel: 'En CPU o cola', tone: 'success' },
    { id: 'sleeping', label: 'Sleeping (S/D)', sublabel: 'Espera evento o E/S', tone: 'info' },
    { id: 'stopped', label: 'Stopped (T)', sublabel: 'Señal SIGSTOP/SIGTSTP', tone: 'warning' },
    { id: 'zombie', label: 'Zombie (Z)', sublabel: 'Terminado sin recolectar', tone: 'danger' }
  ],
  edges: [
    { from: 'running', to: 'sleeping', label: 'Espera E/S' },
    { from: 'sleeping', to: 'running', label: 'Interrupción lista' },
    { from: 'running', to: 'stopped', label: 'Ctrl+Z / SIGSTOP' },
    { from: 'running', to: 'zombie', label: 'exit()' }
  ]
};

export const DIAGRAM_PERMISSIONS_MATRIX: DiagramSpec = {
  kind: 'matrix',
  title: 'Matriz de Permisos Clásicos (rwx)',
  caption: 'Valores octales y simbólicos para Propietario, Grupo y Otros',
  alt: 'Matriz de permisos en Linux que cruza Propietario (u), Grupo (g) y Otros (o) con Lectura (r=4), Escritura (w=2) y Ejecución (x=1).',
  nodes: [
    { id: 'u_r', label: 'u: r (4)', sublabel: 'Lectura dueño', tone: 'primary', row: 0, col: 0 },
    { id: 'u_w', label: 'u: w (2)', sublabel: 'Escritura dueño', tone: 'primary', row: 0, col: 1 },
    { id: 'u_x', label: 'u: x (1)', sublabel: 'Ejecución dueño', tone: 'primary', row: 0, col: 2 },
    { id: 'g_r', label: 'g: r (4)', sublabel: 'Lectura grupo', tone: 'info', row: 1, col: 0 },
    { id: 'g_w', label: 'g: w (2)', sublabel: 'Escritura grupo', tone: 'info', row: 1, col: 1 },
    { id: 'g_x', label: 'g: x (1)', sublabel: 'Ejecución grupo', tone: 'info', row: 1, col: 2 },
    { id: 'o_r', label: 'o: r (4)', sublabel: 'Lectura otros', tone: 'neutral', row: 2, col: 0 },
    { id: 'o_w', label: 'o: w (2)', sublabel: 'Escritura otros', tone: 'neutral', row: 2, col: 1 },
    { id: 'o_x', label: 'o: x (1)', sublabel: 'Ejecución otros', tone: 'neutral', row: 2, col: 2 }
  ]
};

export const DIAGRAM_HARD_VS_SOFT_LINK: DiagramSpec = {
  kind: 'flow',
  title: 'Enlace Duro (Hard Link) vs Simbólico (Symlink)',
  caption: 'Diferencia estructural a nivel de inodo y puntero en el sistema de archivos',
  alt: 'Diagrama comparativo donde dos nombres de archivo comparten el mismo número de inodo (enlace duro), mientras que un enlace simbólico posee un inodo propio que almacena como texto la ruta hacia el archivo destino.',
  direction: 'horizontal',
  nodes: [
    { id: 'name1', label: 'archivo.txt', sublabel: 'Nombre en dentry', tone: 'neutral' },
    { id: 'inode1', label: 'Inodo 1042', sublabel: 'Metadatos + Bloques', tone: 'primary', shape: 'cylinder' },
    { id: 'name2', label: 'hardlink.txt', sublabel: 'Mismo inodo 1042', tone: 'neutral' },
    { id: 'symlink', label: 'softlink.txt', sublabel: 'Inodo 5891', tone: 'warning' },
    { id: 'target', label: 'Ruta destino', sublabel: '"archivo.txt"', tone: 'info' }
  ],
  edges: [
    { from: 'name1', to: 'inode1', label: 'Apunta a' },
    { from: 'name2', to: 'inode1', label: 'Comparte inodo' },
    { from: 'symlink', to: 'target', label: 'Guarda ruta', style: 'dashed' }
  ]
};

export const ALL_OFFICIAL_DIAGRAMS: DiagramSpec[] = [
  DIAGRAM_BOOT_SEQUENCE,
  DIAGRAM_OS_LAYERS,
  DIAGRAM_FHS_TREE,
  DIAGRAM_DISK_PARTITIONS,
  DIAGRAM_STREAMS_PIPES,
  DIAGRAM_PROCESS_STATES,
  DIAGRAM_PERMISSIONS_MATRIX,
  DIAGRAM_HARD_VS_SOFT_LINK
];

