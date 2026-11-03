# A5 · Exactitud técnica y calidad pedagógica (LPIC-1 v5.0, Debian 12)

Fase 1, solo lectura. Hallazgos en `hallazgos-A5.json` (A5-001 … A5-010).

## Resumen ejecutivo
1. **Claves de examen falsas e invertidas (A5-001, P0)**: En 7 preguntas del simulador (`q-103-82`, `q-103-32`, `q-102-21`, `q-102-8`, `q-102-50`, `q-102-84`, `q-102-85`), la opción marcada en el JSON como correcta es falsa en Linux y contradice la propia explicación pedagógica de la pregunta. Un estudiante que responde con el conocimiento oficial de LPIC-1 es suspendido por el sistema.
2. **Preguntas 'fill' rotas en el motor de puntuación (A5-002, P0)**: 8 preguntas abiertas incluyen texto explicativo en español dentro del array de validación (ej. `['/etc/yum.repos.d (también aceptado /etc/yum.repos.d/ )']`). `scoring.engine.ts` compara directamente la entrada, por lo que **el 100% de los intentos correctos son evaluados como fallos**.
3. **Preguntas mutiladas por parseo ciego de tuberías (A5-003, P0)**: El importador legacy troceó comandos con tuberías (`|`), corrompiendo opciones en `q-103-37`, perdiendo la opción `<` en `q-103-30` (marcando `a` `#>` como correcta) y duplicando opciones idénticas en `q-103-49`.
4. **Lecciones esqueleto sin valor técnico (A5-010, P0)**: 155 diapositivas (108.3 a 110.3) están vacías (solo títulos h2 en 110.x o una frase genérica en 108.3–109.4). El tema 110 tiene 0 términos de glosario.
5. **Pérdida del 95% de erratas oficiales (A5-004, P1)**: De 58 advertencias y erratas críticas del manual oficial LPI documentadas en el proyecto legacy (`_legacy/Recurso Final Definitivo/app/erratas.html`), solo se importaron 3 notas genéricas en `errata.yaml`.
6. **Mutilación y lagunas en `commands.yaml` (A5-005, P1)**: 206 banderas aparecen truncadas como `-` en 76 comandos, 14 subtemas completos carecen de comandos (0 comandos para usuarios, cron, fecha, logs, redes o seguridad) y faltan utilidades obligatorias de 103.2 (`zcat`, `bzcat`, `md5sum`, `split`).
7. **Desubicación masiva de preguntas (A5-006, P1)**: En 101–104 todas las preguntas se asignaron al primer subtema, dejando 19 subtemas vacíos y mostrando preguntas de particiones o permisos en la práctica de hardware y bash.
8. **Promesa falsa de idioma (A5-007, P1)**: 208 de 240 preguntas tienen enunciados en inglés mientras la home promete preguntas "redactadas en español".
9. **Artefactos OCR y tipográficos (A5-008, P2)**: Más de 20 preguntas con palabras partidas por espacios espurios (`th e`, `har d`, `f ile`, `EndSect ion`).
10. **Abuso de emojis y anglicismos (A5-009, P2)**: 3 528 emojis en 34 lecciones y 130 usos del falso amigo «librería» en 102.3 frente al estándar oficial «biblioteca compartida».

---

## Semillas asignadas
| Semilla | Severidad | Estado | Evidencia y notas |
|---|---|---|---|
| **S-02** | P0 | **CONFIRMADA y detallada** | Lecciones 110.1–110.3 tienen 53 slides que son exclusivamente un título `heading` (sin texto, tablas ni código). 108.3–109.4 tienen 1 frase por slide. Labs 108.1–110.3 son stubs. Ver `A5-010` y `hallazgos-A5.json`. |
| **S-03** | P0 | **CONFIRMADA** | Promesa pública en README y home de «100% cobertura real, 0 placeholders» contradice la realidad: 155 slides son esqueletos y 0/240 preguntas están verificadas. Ver `A5-007`, `A5-010`. |
| **S-07** | P1 | **CONFIRMADA** | Títulos genéricos repetidos entre lecciones («Ejercicios guiados oficiales» ×6 y «Retos de exploración del manual oficial» ×5). Cruzado con A4-009. |

---

## Tabla de hallazgos
| ID | Sev. | Categoría | Título | Estado |
|---|---|---|---|---|
| **A5-001** | **P0** | `tecnico-lpi` | Claves de respuesta erróneas o invertidas en el banco de preguntas del simulador | CONFIRMADO |
| **A5-002** | **P0** | `funcional` | Preguntas de tipo 'fill' con texto aclaratorio incrustado provocan fallo del 100% en el motor de puntuación | CONFIRMADO |
| **A5-003** | **P0** | `contenido` | Corrupción de opciones de preguntas por parseo ciego de tuberías (\|) y caracteres (<) | CONFIRMADO |
| **A5-004** | **P1** | `contenido` | Pérdida del 95% del repositorio de erratas técnicas y trampas de examen oficiales | CONFIRMADO |
| **A5-005** | **P1** | `tecnico-lpi` | `commands.yaml` tiene 206 flags truncados como '-' y 14 subtemas completos sin comandos | CONFIRMADO |
| **A5-006** | **P1** | `contenido` | Asignación defectuosa de subtemas en el banco de preguntas destruye el modo práctica | CONFIRMADO |
| **A5-007** | **P1** | `contenido` | Enunciados de preguntas en inglés contradicen la promesa de la portada 'redactadas en español' | CONFIRMADO |
| **A5-008** | **P2** | `contenido` | Artefactos tipográficos y OCR en textos de examen degradan la calidad del curso | CONFIRMADO |
| **A5-009** | **P2** | `tecnico-lpi` | Abuso de 3 528 emojis decorativos y mezcla del falso amigo 'librería' vs 'biblioteca compartida' | CONFIRMADO |
| **A5-010** | **P0** | `contenido` | Lecciones esqueleto 108.3 a 110.3 carecen de contenido pedagógico y técnico real | CONFIRMADO |

---

## Análisis técnico y pedagógico en profundidad

### 1. El banco de preguntas: claves erróneas y preguntas rotas
El análisis estático de las 240 preguntas en `content-src/questions/` detectó inconsistencias graves que invalidan la función examinadora del simulador:

#### Claves que penalizan la respuesta correcta (A5-001):
1. **`q-103-82` (`103.json`)**:
   - *Pregunta*: *Which of the following commands print the current working directory when using a Bash shell? (Choose two.)*
   - *Opciones*: `a: echo "${PWD}"`, `b: echo "${WD}"`, `c: printwd`, `d: pwd`, `e: echo "${pwd}"`.
   - *Clave actual*: `["a", "e"]`.
   - *Fallo*: En Bash las variables son sensibles a mayúsculas; `${pwd}` en minúsculas está vacía. La respuesta correcta es `pwd` (`d`) junto a `${PWD}` (`a`). La explicación cita textualmente `pwd`, pero la clave marca `e`.
2. **`q-103-32` (`103.json`)**:
   - *Pregunta*: *...directly execute the instructions from the file /usr/local/bin/runme.sh without starting a subshell? (Choose two.)*
   - *Opciones*: `a: source ...`, `b: /usr/local/bin/runme.sh`, `c: /bin/bash ...`, `d: . /usr/local/bin/runme.sh`, `e: run ...`.
   - *Clave actual*: `["a", "b"]`.
   - *Fallo*: La invocación directa `b` crea un proceso hijo (subshell). Los dos comandos que ejecutan en la shell actual son `source` (`a`) y el comando interno punto `.` (`d`). La clave marcó `b` en vez de `d`.
3. **`q-102-21` (`107.json`)**:
   - *Pregunta*: *What is true about the file /etc/localtime?*
   - *Clave actual*: `["a"]` (*It is a plain text file containing a string such as Europe/Berlin*).
   - *Fallo*: `/etc/localtime` es un archivo binario en formato TZif (o un enlace simbólico a `/usr/share/zoneinfo/`), nunca un archivo de texto plano. La opción correcta es la `e` (*It is either a symlink to or a copy of a timezone information file...*). La explicación afirma que es binario y desmiente `a`, pero la clave tiene `a`.
4. **`q-102-8` (`109.json`)**:
   - *Pregunta*: *...the route command takes a long time before printing out the routing table. Which of the following errors does that indicate?*
   - *Clave actual*: `["a"]` (*The local routing information may be corrupted and must be re-validated...*).
   - *Fallo*: La demora se debe a que `route` intenta por defecto resolver los nombres de host de las IPs vía DNS inverso (PTR) y entra en timeout si el DNS no responde (opción `e`). La explicación explica la opción `e`, pero la clave tiene `a`.
5. **`q-102-50` (`110.json`)**:
   - *Pregunta*: *Jane ANY=NOPASSWD: /bin/kill, /bin/id, PASSWD: /sbin/fdisk. Which of the following statements are true? (Choose three.)*
   - *Clave actual*: `["b", "d", "e"]`.
   - *Fallo*: La opción `b` dice que Jane debe especificar la contraseña de root (*after specifying root's password*). En sudo, el comportamiento estándar con `PASSWD:` exige la contraseña del propio usuario invocador (*her password*, opción `c`). La explicación dice expresamente que pide la propia contraseña, pero la clave tiene `b`.
6. **`q-102-84` (`110.json`)**:
   - *Pregunta*: *After editing the TCP wrapper configuration... when do these changes become effective?*
   - *Clave actual*: `["b"]` (*at the next system reboot*).
   - *Fallo*: `libwrap` comprueba los archivos dinámicamente en cada nueva conexión entrante (opción `e`: *immediately for all new connections*). La explicación dice que surte efecto inmediato sin reiniciar, pero la clave tiene `b`.
7. **`q-102-85` (`110.json`)**:
   - *Pregunta*: *What is true regarding public and private SSH keys? (Choose two.)*
   - *Clave actual*: `["b", "c"]`.
   - *Fallo*: La opción `c` afirma falsamente que se pueden generar varias claves públicas distintas para una misma clave privada. La opción correcta es la `d` (*To maintain the private key's confidentiality, the SSH key pair must be created by its owner*). La explicación describe `b` y `d`, pero la clave tiene `c`.
8. **`q-102-80` (`102.json`)**:
   - *Pregunta*: *Which of the following signals is sent to a process when the key combination Ctrl+Z is pressed on the keyboard?*
   - *Clave actual*: `["c"]` (`SIGSTOP`).
   - *Fallo*: El controlador de terminal envía la señal interactiva `SIGTSTP` (Terminal Stop, 20), no `SIGSTOP` (19). La opción SIGTSTP ni siquiera existe en la lista de opciones y la pregunta está mal ubicada en el subtema 102.1 de particionado en lugar de 103.5 de procesos.

#### Preguntas 'fill' contaminadas que rompen el motor (A5-002):
En `src/app/core/engines/scoring/scoring.engine.ts:66-76`:
```typescript
const acceptedList = [
  ...(question.acceptedAnswers ?? []),
  ...question.correct
].map((ans) => normalizeAnswer(ans));

return acceptedList.some((accepted) => accepted === userText);
```
Al tener elementos como:
- `['/etc/yum.repos.d (también aceptado /etc/yum.repos.d/ )']`
- `['-m (o --create-home )']`
- `['/proc/mounts (también es válido /proc/self/mounts )']`
- `['hostname (también válido en entornos modernos: hostnamectl )']`

Cualquier alumno que escriba `/etc/yum.repos.d`, `-m` o `hostname` recibe una evaluación de **fallo**.

#### Opciones mutiladas por split('|') en el importador (A5-003):
En `q-103-37`, la pregunta original contenía opciones compuestas como `foo | tee /tmp/foodata` y `foo | less /tmp/foodata`. Al hacer `split('|')`, el importador descompuso los comandos, produciendo 3 opciones con texto `"foo"`, una opción `"opt-7"` y una opción correcta mutilada `"tee /tmp/foodata"` sin el pipe. En `q-103-30`, se eliminó el carácter `<` de las opciones al sanitizar tags HTML, marcando `#>` como correcta.

---

### 2. Pérdida del repositorio de erratas técnicas (A5-004)
En la versión original (`_legacy/Recurso Final Definitivo/app/erratas.html`), el curso contaba con **58 fichas críticas** que contrastaban lo que afirma erróneamente el manual oficial de LPI con la realidad técnica de Linux y cómo debe responderse en el examen.

Ejemplos de advertencias de alto valor pedagógico que fueron eliminadas en la migración a `content-src/errata.yaml`:
- **`ERR-102.1-01`**: El manual afirma que `fdisk` solo soporta MBR; para el examen LPIC-1 debe asociarse `fdisk` con MBR y `gdisk`/`parted` con GPT, aunque `fdisk` moderno soporte GPT.
- **`ERR-102.2-01`**: `grub-install /dev/sda1` instala en el VBR de la partición, no en el MBR del disco (`/dev/sda`).
- **`ERR-102.3-01`**: `ldconfig` lee `/etc/ld.so.conf` y sus subdirectorios para regenerar la caché binaria `/etc/ld.so.cache`; **nunca modifica `/etc/ld.so.conf`**.
- **`ERR-102.4-01`**: `dpkg -r` conserva archivos de configuración; solo `dpkg -P` (`--purge`) los elimina.
- **`ERR-102.6-01`**: En Linux, KVM opera como hipervisor Tipo 1 gracias al módulo del kernel `kvm.ko`.
- **`E-007`**: El manual asocia `zcat` con el método `xz`, cuando `zcat` descomprime con `gzip` (`xzcat` es para `xz`).

En su lugar, `content-src/errata.yaml` tiene 3 fichas genéricas e incompletas (`err-001` a `err-003`).

---

### 3. Integridad de comandos y diccionario técnico (A5-005)
En `content-src/commands.yaml`:
- **206 banderas con nombre `-`**: En 76 comandos (38% del catálogo), las opciones reales se perdieron durante la importación. Por ejemplo, en `lspci`, `-s` y `-d` aparecen como `flag: '-'`; en `systemctl`, los subcomandos (`start`, `stop`, `restart`) aparecen como `flag: '-'`.
- **14 subtemas sin ningún comando**: Del subtema 107.1 al 110.3, ningún comando tiene `subtopicIds` asociado. El estudiante no puede filtrar comandos de administración de usuarios, tareas programadas, localización, sincronización horaria, registros, redes ni seguridad.
- **Comandos oficiales omitidos**: En el objetivo 103.2 de procesamiento de textos faltan utilidades que entran explícitamente en el examen LPIC-1 v5.0: `zcat`, `bzcat`, `xzcat`, `md5sum`, `sha512sum`, `nl`, `pr` y `split`.

---

### 4. Coherencia pedagógica, estilo y lenguaje (A5-008, A5-009)
- **Emojis desmedidos**: Se contabilizaron **3 528 emojis** en 34 lecciones. Lecciones como 102.1 contienen 214 emojis decorativos (📍, 🧠, 🔄, ➔, 🎯, 💻, 🟢, 🔵, 🏢, 🧩). Aunque algunos callouts pueden usar iconos visuales, saturar títulos y explicaciones técnicas con emojis infantiles resta seriedad a un manual de certificación.
- **Falsos amigos terminológicos**: En `102.3.json` se utiliza la palabra **«librería»** 130 veces para referirse a bibliotecas de enlace dinámico. El término oficial del Linux Professional Institute en español es **«biblioteca compartida»** (*shared library*).
- **Artefactos OCR**: Abundancia de espacios espurios en palabras clave de preguntas de examen (`witheach`, `th e`, `har d`, `fil e`, `EndSect ion`, `X1 1`).

---

## Lo que no se pudo comprobar
1. **Comportamiento interactivo real en el navegador**: No se ejecutaron navegadores ni previsualización en vivo (regla de Fase 1), por lo que la visualización exacta de las preguntas en la UI del simulador se dedujo del código fuente de `scoring.engine.ts` y de los componentes Angular.
2. **Examen 102 en el simulador completo**: Al tener preguntas pendientes de verificación y 120 preguntas con claves mixtas, no se pudo simular una sesión de examen completa de 60 preguntas para auditar la distribución de pesos del algoritmo de sorteo ponderado en runtime.
3. **Lecciones 108.3 a 110.3**: Al ser meros esqueletos vacíos, no contienen afirmaciones técnicas que puedan auditarse frente al manual de LPI.
4. **Verificación visual del renderizado de bloques HTML**: No se comprobó en pantalla si los 261 bloques HTML de las diapositivas se muestran en blanco o fallan en modo oscuro (asignado a A1/A6).