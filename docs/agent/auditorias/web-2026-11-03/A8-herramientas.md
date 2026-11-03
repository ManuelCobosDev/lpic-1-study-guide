# A8 · Herramientas Interactivas

Fase 1, solo lectura. Hallazgos en `hallazgos-A8.json` (A8-001 … A8-011).

## Resumen
1. **Hallazgo crítico de corrupción (A8-001, P0)**: `BackupService` asume erróneamente la clave `cards` en vez de `progress` para las flashcards. Al importar en modo fusión, borra `data.progress`, dejando el estado como `undefined` y provocando un `TypeError` fatal en `/flashcards`.
2. **S-02 confirmada en laboratorios (A8-002, P0)**: Los 11 laboratorios de 108.1 a 110.3 son stubs vacíos de 1 solo paso con el comando falso `man 108_X`, pero declaran falsamente `placeholder: false`. Permanecen dos laboratorios de test en producción (`lab-103-9` y `lab-103-99`).
3. **S-10 confirmada en mapa mental (A8-006, P2)**: `fitToScreen` calcula una escala de 0.25 en escritorio y 0.14 en móvil, reduciendo las fuentes a 1.5–4 px físicos, lo que hace el mapa completamente ilegible sin zoom manual forzado.
4. **Sorteo de Examen 101 sesgado (A8-003, P1)**: Las 120 preguntas de 101–104 están marcadas artificialmente con el subtema `.1`, anulando los pesos oficiales del temario y sacando proporciones incorrectas por tema.
5. **Corrección de respuestas abiertas (A8-004, P1)**: Notas editoriales y símbolos `$` contaminaron los arrays de respuestas válidas de 9 preguntas, haciendo que respuestas correctas como `/etc/yum.repos.d/` fallen.
6. **Desconexión tras restaurar backups (A8-005, P1)**: Los servicios singleton en memoria no se enteran de las importaciones o reinicios de datos en `localStorage`, sobreescribiendo los datos recuperados si no se recarga manualmente el navegador.
7. **Glosario A-Z (A8-007, P2)**: El índice alfabético carece del grupo `#`, dejando huérfanos 30 términos técnicos que empiezan por rutas o puntos (`/etc/passwd`, `.deb`, etc.). Además, los 238 términos tienen `related: []` vacío.
8. **Buscador (A8-008, P2)**: No existe expansión de sinónimos técnicos en MiniSearch; búsquedas conceptuales en lenguaje natural no localizan sus comandos asociados.
9. **Flashcards Leitner y Temporizador**: El algoritmo de 5 cajas Leitner, el barajado determinista Mulberry32 y la sincronización horaria del examen tras recarga funcionan de manera precisa y robusta.

## Semillas
| Semilla | Estado | Evidencia |
|---|---|---|
| S-02 | CONFIRMADA (P0) | 11 laboratorios oficiales (108.1 a 110.3) pesan ~650 B, tienen 1 paso con `man 108_X` y `placeholder: false`. Ver A8-002. |
| S-10 | CONFIRMADA (P2) | `fitToScreen` escala a 0.25 en monitor y 0.14 en móvil; etiquetas SVG de 1.5–4 px ilegibles. Minimapa con constantes 800x600 fijas. Ver A8-006. |

## Tabla de hallazgos
| ID | Sev. | Título | Estado |
|---|---|---|---|
| A8-001 | P0 | `BackupService` corrompe el progreso de flashcards al importar (usa `cards` en vez de `progress`) | CONFIRMADO |
| A8-002 | P0 | 11 laboratorios (108.1 a 110.3) son stubs de 650 B con comando ficticio `man 108_X` y `placeholder: false` | CONFIRMADO |
| A8-003 | P1 | Banco de preguntas del Examen 101 etiqueta todas las preguntas con `subtopicId: ".1"`, falseando el sorteo | CONFIRMADO |
| A8-004 | P1 | Preguntas abiertas (fill) contienen notas editoriales en `acceptedAnswers` y rechazan respuestas válidas | CONFIRMADO |
| A8-005 | P1 | Almacenes reactivos en memoria no se recargan tras importar, deshacer o reiniciar backups | CONFIRMADO |
| A8-006 | P2 | Ajuste automático (`fitToScreen`) del mapa mental reduce el texto a 1.5–4 px, resultando ilegible | CONFIRMADO |
| A8-007 | P2 | El índice alfabético A-Z del glosario no incluye `#` y deja huérfanos 30 términos técnicos clave | CONFIRMADO |
| A8-008 | P2 | El buscador global (Ctrl+K y `/buscar`) carece de diccionario y expansión de sinónimos | CONFIRMADO |
| A8-009 | P2 | Discrepancia de corrección fill-in entre el modo práctica y el motor de examen | CONFIRMADO |
| A8-010 | P2 | Falta de sincronización reactiva entre pestañas concurrentes en `StorageService` | CONFIRMADO |
| A8-011 | P2 | El filtro de categorías de comandos está fragmentado en 35 variantes casi duplicadas | CONFIRMADO |

---

## Detalle por herramienta evaluada

### 1. Simulador (101 y 102)
- **Sorteo ponderado**: Correcto para el Examen 102. En el Examen 101 está comprometido por el etiquetado artificial de todas las preguntas bajo `.1` (A8-003). El algoritmo matemático (método del mayor resto + Mulberry32) es sólido y no genera duplicados en 100 semillas evaluadas.
- **Temporizador tras recarga**: Implementado con cálculo de tiempo relativo `Date.now() - startedAt`. Si la pestaña se recarga o se cierra y abre antes de agotar el tiempo, recupera los segundos exactos. Si expira fuera de pantalla, al recargar auto-finaliza y puntúa.
- **Puntuación oficial 200–800**: Función `calculateExamScore` probada: 0 aciertos devuelve 200 puntos, 100% devuelve 800 puntos, y 50% de aciertos ponderados alcanza 500 puntos (aprobado exacto). El desglose detecta correctamente temas débiles (< 70%).
- **Tipos de preguntas**: `single` y `multiple` funcionan según la regla oficial LPI de "todo o nada". Las preguntas `fill` presentan problemas de datos en `acceptedAnswers` y normalización (A8-004, A8-009).
- **Filtros por tema y modo práctica**: `/simulador/practica` filtra reactivamente por examen (101/102), tema (101 a 110), dificultad, tipo de pregunta y marcadas con bandera.

### 2. Flashcards (Leitner)
- **Cajas 1 a 5**: Algoritmo espaciado riguroso (intervalos 0, 1, 3, 7 y 21 días; promociones `good` +1, `easy` +2; degradaciones `again` reinicia a 1, `hard` mantiene).
- **Persistencia**: Se almacena en `lpic1.v1.flashcards_progress`. Funciona de forma aislada, pero es vulnerable al importador de backup (A8-001).
- **Selector de mazos**: 7 mazos rápidos (`all`, `exam-101`, `exam-102`, `commands`, `flags`, `glossary`, `due-today`) más mazos específicos por tema y subtema. 1 225 tarjetas en catálogo con paginación reactiva en el explorador.
- **Atajos de teclado**: Espacio para voltear; 1, 2, 3 y 4 para calificar rápidamente.

### 3. Comandos
- **Filtros**: Búsqueda textual insensible a mayúsculas y acentos (`normalize`). Selector de temas 101 a 110 funcional. El selector de categorías está contaminado con 35 variantes redundantes (A8-011).
- **Vistas**: Alternador entre tabla densa y tarjetas visuales. Copia de sinopsis y ejemplos con portapapeles y feedback visual.
- **Popovers tipo Wikipedia**: Soportado vía `WikiRefService` en lecciones y diapositivas de estudio con autolink reactivo (`AutolinkEngine`).

### 4. Glosario A–Z
- **Navegación**: `scrollToLetter` y resaltado temporal `highlight-flash` al saltar a un término.
- **Deficiencias**: Falta el ancla `#` para los 30 términos que inician con `/`, `.` o `~` (A8-007). Todos los términos tienen `related: []`, dejando inerte la sección de conceptos relacionados.

### 5. Buscador (Ctrl+K y `/buscar`)
- **Atajos**: `Ctrl+K`, `Cmd+K`, `/` y `Escape` registrados globalmente en `SearchService`.
- **Indexación y acentos**: MiniSearch indexa lecciones, comandos, glosario, erratas y páginas (excluyendo estrictamente las preguntas de examen). Normaliza acentos y genera snippets con resaltado `<mark>`.
- **Sinónimos**: Ausentes (A8-008).

### 6. Laboratorios
- **Interacción**: Checkbox por paso con persistencia en `labs_progress`, botón de copiar comando (`navigator.clipboard`), cálculo de porcentaje y modal de éxito al completar el último paso.
- **Contenido stub (S-02)**: Los laboratorios de los temas 108, 109 y 110 son cascarones de 1 paso con instrucciones ficticias (A8-002).

### 7. Progreso y Backup
- **Seguridad**: Hash SHA-256 sobre el payload JSON que detecta cualquier manipulación de datos o corrupción de bits.
- **Deshacer**: Instantánea previa (`backup.pre-import`) antes de sobreescribir.
- **Fallos detectados**: Corrupción de flashcards por discordancia de clave `cards`/`progress` (A8-001) y falta de sincronización de señales en memoria tras restaurar o reiniciar (A8-005).

### 8. Mapa mental
- **Interacción**: Zoom suave con rueda/botones, paneo, centrado `1:1`, búsqueda de nodos y panel lateral (drawer) con metadatos y enlaces directos a la lección.
- **Legibilidad (S-10)**: La vista general ajustada a pantalla (`fitToScreen`) genera factores de escala minúsculos (0.14 a 0.3) que convierten el texto en manchas ilegibles (A8-006).

### 9. Casos límite
- **`localStorage` vacío**: Comportamiento limpio sin excepciones; inicializa valores por defecto.
- **`localStorage` corrupto**: `PersistedStore` captura errores de sintaxis JSON y regresa a `initialValue`. Sin embargo, si la sintaxis es válida pero la estructura interna difiere, no valida con Zod y puede lanzar errores de acceso a propiedades no definidas.
- **`localStorage` lleno**: `StorageService` captura el error de cuota y conmuta transparentemente a `memoryStorage` en memoria volátil.
- **Concurrencia multiextensión / dos pestañas**: No existe comunicación reactiva cruzada; las pestañas abiertas sobrescriben mutuamente su progreso (A8-010).

---

## No pude comprobar
- Impresión en papel físico de los reportes de progreso (se verificó el diálogo nativo `window.print()` en código).
- Portapapeles en navegadores antiguos sin `navigator.clipboard` (se verificó que el bloque `try/catch` previene caídas).
- Comportamiento ante cuotas de almacenamiento de Safari en modo incógnito estricto (probado con simulación estándar de `StorageService`).
