# Informe de Auditoría A3: Visor de Lecciones y Experiencia de Estudio

- **Agente**: A3 · Visor de lecciones (diapositivas, vista web, imprimir, "Practica lo aprendido")
- **Fecha**: 2026-11-03
- **Fase**: Fase 1 (Solo lectura / Diagnóstico con evidencia objetiva)
- **Ámbito analizado**: Las 42 lecciones del temario LPIC-1 (771 diapositivas en `content-src/lessons/*.json`), visor de diapositivas (`slide-viewer`), visor web continuo (`lesson-web-view`), página de impresión (`lesson-print-page`), y pestaña complementaria (`practice-tab`).
- **Servidor preview**: `http://localhost:4200` (Activo y verificado)

---

## 1. Resumen Ejecutivo (10 líneas)

El visor de lecciones ofrece una sólida arquitectura interactiva (atajos de teclado fluidos, cambio dinámico entre diapositivas/web/imprimir y sincronización de estado de estudio en local), pero arrastra graves vicios de autoría y presentación. En 9 lecciones (108.3, 108.4, 109.1–109.4, 110.1–110.3), 155 diapositivas tienen IDs y `slideNumber` idénticos repetidos, lo que colisiona el tracking de Angular y duplica 18 veces el mismo ID HTML en la vista web. En 76 diapositivas no hay contenido técnico real (53 son esqueletos puros con solo título en 110.1–110.3 y 23 son diapositivas de resumen vacías en el Examen 101). En el 97.5% de diapositivas (752 de 771), el título se renderiza duplicado consecutivamente (cabecera del visor + primer bloque heading), desperdiciando espacio crítico. En modo oscuro, la vista de impresión genera texto blanco invisible sobre folio blanco, inutilizando la exportación a PDF. Todas las 42 lecciones cumplen estrictamente la meta de ≤ 20 diapositivas, pero el 57.3% (442 slides) sufre riesgo de desbordamiento vertical en 16:9 por exceso de texto o tablas masivas. En pantallas móviles (390px), el escalado fijo a 0.25x produce texto ilegible de 3.5px.

---

## 2. Tabla de Hallazgos Detectados

| ID | Sev. | Categoría | Título del Hallazgo | Estado | Semilla | Evidencia Clave |
|---|---|---|---|---|---|---|
| **A3-001** | **P0** | Funcional | IDs de diapositiva y `slideNumber` duplicados en 9 lecciones (155 slides) | `CONFIRMADO` | S-01 | `content-src/lessons/110.1.json`, `slide-viewer.component.ts:310`, `lesson-web-view:24` |
| **A3-002** | **P0** | Contenido | 76 diapositivas esqueleto con solo título y sin contenido pedagógico | `CONFIRMADO` | S-02 | `110.1–110.3.json`, diapositiva 19 en `101.1–104.7.json`, `a3-drilldown.ts` |
| **A3-003** | **P1** | Visual | Duplicación sistemática del título en portada (S-04) y en el 97.5% de diapositivas | `CONFIRMADO` | S-04 | `slide-viewer.component.ts:98-135`, `105.1.json:44,51`, captura `a3-105-1-portada.png` |
| **A3-004** | **P1** | Visual | Riesgo de desbordamiento vertical en 16:9 (442 diapositivas con >140 palabras o tablas >6 filas) | `CONFIRMADO` | — | `101.3` slide 11 (1.390 palabras), `103.4` slide 12 (tabla 12 filas), `a3-analisis-lecciones.json` |
| **A3-005** | **P1** | Funcional | Vista de impresión en tema oscuro genera texto blanco sobre papel e invoca token CSS roto | `CONFIRMADO` | — | `lesson-print-page.component.ts:192,195`, captura `a3-print-dark-mode.png` |
| **A3-006** | **P2** | Visual/A11y | Escalado destructivo en móviles (viewport 390px comprime lienzo a 0.25x, texto de 3-4px) | `CONFIRMADO` | — | `slide-viewer.component.ts:747`, captura `a3-105-1-mobile-390.png`, `scale(0.253)` |
| **A3-007** | **P2** | Contenido | 6 lecciones del examen 102 carecen de resumen oficial y terminan en flashcards o ejercicios | `CONFIRMADO` | — | `108.3, 108.4, 109.1, 109.2, 109.3, 109.4.json` |
| **A3-008** | **P3** | Repo | Propiedad `webDocument` vestigial en los 42 JSON de lecciones sin uso en el código | `CONFIRMADO` | S-16 | `content-src/lessons/*.json`, búsqueda en `src/` (0 apariciones) |
| **A3-009** | **P3** | Visual | Cajón de miniaturas (T) no muestra previsualizaciones gráficas sino lista de texto | `CONFIRMADO` | — | `slide-viewer.component.ts:310-337` (`.thumb-btn`) |
| **A3-010** | **P3** | Funcional | Atajos de teclado implementados (+/- zoom) omitidos en el diálogo de ayuda (?) | `CONFIRMADO` | — | `slide-viewer.component.ts:397-444, 809-816` |

---

## 3. Análisis Cuantitativo de las 42 Lecciones

Se ejecutó el script automatizado de análisis sintáctico y métrico `docs/agent/auditorias/web-2026-11-03/scripts/a3-analisis-lecciones.ts` sobre los 42 archivos de `content-src/lessons/*.json` (771 diapositivas en total).

### 3.1 Identificadores y `slideNumber` (Verificación Semilla S-01)
- **Estado**: `CONFIRMADO (P0)`.
- **Alcance**: 9 lecciones afectadas, sumando 155 diapositivas corruptas:
  - `108.3`: 16 slides con `id: "108.3-slide-108"` y `slideNumber: 108`.
  - `108.4`: 16 slides con `id: "108.4-slide-108"` y `slideNumber: 108`.
  - `109.1`: 18 slides con `id: "109.1-slide-109"` y `slideNumber: 109`.
  - `109.2`: 18 slides con `id: "109.2-slide-109"` y `slideNumber: 109`.
  - `109.3`: 18 slides con `id: "109.3-slide-109"` y `slideNumber: 109`.
  - `109.4`: 16 slides con `id: "109.4-slide-109"` y `slideNumber: 109`.
  - `110.1`: 18 slides con `id: "110.1-slide-110"` y `slideNumber: 110`.
  - `110.2`: 16 slides con `id: "110.2-slide-110"` y `slideNumber: 110`.
  - `110.3`: 19 slides con `id: "110.3-slide-110"` y `slideNumber: 110`.
- **Impacto**:
  1. En `slide-viewer.component.ts`: el bucle `@for (slide of slides(); track slide.slideNumber)` recibe claves idénticas, comprometiendo la reconciliación del DOM y el marcado de diapositivas vistas.
  2. En `lesson-web-view.component.ts`: genera 18 secciones con `id="section-110"`. Esto rompe la validez del DOM de HTML5 y provoca que el índice lateral (TOC) solo pueda saltar a la primera sección.

### 3.2 Diapositivas Esqueleto y Vacías (Verificación Semilla S-02)
- **Estado**: `CONFIRMADO (P0)`.
- **Hallazgo clave**: Existen 76 diapositivas esqueleto en el proyecto:
  - **53 diapositivas en 110.1, 110.2 y 110.3**: El 100% de las diapositivas de estos tres subtemas contienen únicamente un bloque `heading` con el título de la diapositiva y **cero** contenido técnico adicional. Pese a ello, `placeholder: false` figura en el JSON.
  - **23 diapositivas de cierre en el Examen 101 (101.1 a 104.7)**: En **todas** las lecciones del examen 101, la diapositiva número 19 se titula `"Resumen y Claves de Examen: Subtema XXX"` y su propiedad `blocks` contiene únicamente un bloque `heading` con ese mismo título, sin resumen, sin puntos clave y sin viñetas. El estudiante ve una pantalla vacía con un título y el panel de completado.

### 3.3 Número de Diapositivas por Lección (Meta ≤ 20 Diapositivas)
- **Estado**: `CUMPLIDO AL 100%`.
- **Métrica**:
  - Máximo número de diapositivas observado: **20 diapositivas** (en 105.1).
  - Mínimo número de diapositivas observado: **16 diapositivas** (en 108.3, 108.4, 109.4, 110.2).
  - Promedio: **18.35 diapositivas por lección**.
  - **Lecciones que superan 20 diapositivas**: **0 lecciones** (0%).
  - La meta estricta de la Spec 12 §12.1 (máximo 20 diapositivas por subtema) se cumple en la totalidad de los 42 subtemas.

### 3.4 Desbordamientos y Densidad en Lienzo 16:9
El lienzo lógico mide 1280×720px. Descontando la cabecera fija (~80px), el relleno (~96px) y el pie (~40px), quedan aproximadamente 500px de altura vertical neta.
- **Diapositivas con riesgo de desbordamiento (overflow vertical)**: **442 de 771 (57.3%)**.
- **Diapositivas que exceden el límite de 140 palabras (Spec 12 §12.1)**: **399 diapositivas**.
  - *Casos extremos*:
    - `101.3` Diapositiva 11: **1.390 palabras** (17.155 caracteres en 4 bloques masivos).
    - `102.1` Diapositiva 8: **1.280 palabras** (13.500 caracteres).
    - `102.1` Diapositiva 5: **1.163 palabras** (13.124 caracteres).
    - `102.1` Diapositiva 7: **972 palabras** (10.701 caracteres).
- **Tablas con > 6 filas (riesgo de corte vertical)**: **41 diapositivas**.
  - *Casos destacados*:
    - `103.4` Diapositiva 12: Tabla maestra de operadores de redirección con **12 filas y 4 columnas**.
    - `107.1` Diapositiva 7: Tabla de opciones de `useradd` con **9 filas**.
    - `104.3` Diapositiva 4: Tabla de opciones de montaje con **8 filas**.
- **Líneas de código/terminal > 14 líneas**: **6 diapositivas**.
  - *Casos destacados*:
    - `108.2` Diapositiva 17: Reto práctico de auditoría de logs con **30 líneas de script/terminal**.
    - `107.1` Diapositiva 17: Reto práctico de auditoría corporativa con **20 líneas**.
    - `108.1` Diapositiva 14: Reto práctico de Chrony con **19 líneas**.

---

## 4. Inspección en Navegador y Comportamiento Funcional

Se ejecutaron pruebas dinámicas mediante Playwright en `http://localhost:4200` (script `docs/agent/auditorias/web-2026-11-03/scripts/a3-browser-inspect.ts`).

### 4.1 Atajos de Teclado
- `ArrowRight` / `ArrowLeft`: Avanza y retrocede correctamente entre diapositivas.
- `Space` / `PageDown` / `PageUp`: Navegación rápida operativa.
- `F`: Alterna la clase `.fullscreen-active` en el contenedor y escala el lienzo para ocupar la pantalla completa.
- `T`: Abre y cierra el cajón lateral de miniaturas/índice.
- `N`: Despliega el panel inferior de notas del instructor con fondo translúcido.
- `?`: Muestra el modal accesible de atajos de teclado.
- `Escape`: Cierra en cascada el modal de ayuda, las notas, las miniaturas o la pantalla completa.
- `Teclas 1..9`: Salto directo instantáneo a las diapositivas 1 a 9.
- *Deficiencia menor (A3-010)*: Las teclas `+` y `-` (ajuste fino de zoom de texto) funcionan en el código pero no se encuentran explicadas en la tarjeta de ayuda `?`.

### 4.2 Pantalla Completa y Auto-ocultación de Controles
- En pantalla completa se activa una barra superior oscura con el subtema actual, título truncado, contador `N / Total` y botón `Salir (Esc)`.
- Si el usuario deja de mover el ratón durante 2.5 segundos, los controles se ocultan suavemente mediante transición de opacidad (`opacity-0 pointer-events-none`) y el cursor se oculta (`cursor-none`). Cualquier movimiento reactiva la visibilidad.

### 4.3 Cajón de Miniaturas (Thumbnails Drawer)
- Al pulsar `T`, se despliega un panel lateral derecho de 256px de ancho.
- *Problema visual (A3-009)*: No renderiza miniaturas visuales del lienzo, sino botones con el número y el título de cada diapositiva y una marca `✓ Vista`.
- *Prueba con lección corrupta 110.1*: Se listaron 18 botones; al hacer clic en el botón 3, la llamada a `goToSlide(3)` navegó correctamente al índice 3 a pesar de que todas las diapositivas tenían `slideNumber: 110` en el JSON. Sin embargo, el estado activo (`idx === currentIndex()`) se apoya en el índice numérico del bucle, mitigando el fallo visual en diapositivas aunque no en la vista web.

### 4.4 Vista Web Continua (`vista=web`)
- En `/estudiar/:id?vista=web`, el documento se transforma en una columna de lectura continua de 760px con índice lateral derecho sticky (TOC) y scrollspy.
- Cada sección dispone de un botón `Ver en diapositiva ↗` que commuta inmediatamente al modo `slides` en esa diapositiva exacta.
- *Grave defecto en 108.3–110.3*: Debido a que todas las diapositivas tienen el mismo `slideNumber`, los atributos `id="section-110"` colisionan, impidiendo que el TOC desplace la página a ninguna sección distinta de la primera.

### 4.5 Vista de Impresión / PDF (`/estudiar/:id/imprimir`)
- Permite seleccionar entre formato `Documento A4 continuo` y `Diapositivas (1 por página)` mediante selector nativo.
- Permite alternar la inclusión de notas didácticas del instructor.
- *Defecto P1 (A3-005)*: Al emular `@media print` en modo oscuro, el texto computado de `h1` es `rgb(230, 237, 247)` sobre fondo `rgba(0, 0, 0, 0)`. Como la impresora o el exportador de PDF de Chromium no imprimen el fondo oscuro de la pantalla por defecto, el documento resultante contiene texto blanco sobre papel blanco (completamente invisible).
- Además, en la línea 192 de `lesson-print-page.component.ts` se usa `background: var(--background);`, token inexistente en `themes.css`.

### 4.6 Pestaña "Practica lo Aprendido" (`practice-tab`)
- **Bloque A (Test rápido)**: Carga correctamente un subconjunto de preguntas acotado a ≤ 10 (`questions().slice(0, 10)`). Al marcar una opción y pulsar `Comprobar respuesta`, muestra panel de retroalimentación inmediata (éxito en verde / fallo en rojo) con explicación detallada y botón `📖 Ver en diapositiva N`.
- **Bloque B (Mini-flashcards)**: Carga ≤ 10 tarjetas mediante `flashcardsService.getSubtopicCards(data.id, 10)`. Soporta volteo interactivo de tarjeta y calificación Leitner (1 a 4).
- **Bloque C (Ejercicios oficiales)**: Acordeón interactivo con distinción de ejercicios `Guiados` y de `Exploración`. Permite revelar la respuesta contrastada del manual oficial.
- **Acceso directo desde última diapositiva**: Al llegar a la diapositiva 20 de `105.1`, aparece el panel de completado `🎉 Has terminado las diapositivas` con el botón `Practica lo aprendido →`. Al hacer clic, hace scroll suave hacia la pestaña de práctica y transfiere el foco.

### 4.7 Enlaces Profundos (Deep Links)
- La URL `/estudiar/105.1?slide=7&vista=slides` abre de forma precisa la diapositiva 7.
- Al avanzar con teclado o controles, la URL se actualiza instantáneamente con `slide=8` mediante `router.navigate([], { queryParams: { slide }, queryParamsHandling: 'merge', replaceUrl: true })`.
- El parámetro `?vista=web` abre de forma directa el modo de lectura continua.
- El parámetro `?q=termino` resalta el término con `<mark>` amarillo en los títulos.

### 4.8 Escalado en Dispositivos Móviles (Viewport 390×844)
- En un viewport de 390px, el cálculo `(390 - 32) / 1280` resulta en una escala de **0.253**.
- El lienzo de 1280×720px se reduce a un rectángulo de 323×182px. La tipografía estándar de 16px se convierte en texto de 4px, resultando completamente ilegible.
- Dado que la vista web (`vista=web`) es 100% responsiva y legible en móvil, forzar la vista de diapositivas por defecto en móviles penaliza innecesariamente a los usuarios de teléfonos.

---

## 5. Evaluación de la Portada Duplicada (S-04) y Espacio Muerto

### 5.1 Diagnóstico del Problema S-04
En las 42 lecciones, la diapositiva 1 presenta una redundancia severa:
1. El componente `slide-viewer.component.ts` (líneas 100-108) renderiza:
   ```html
   <div class="cover-eyebrow">Objetivo Oficial LPIC-1 105.1</div>
   <h1 class="text-4xl lg:text-5xl ...">105.1 Personalizar y usar el entorno de shell</h1>
   ```
2. A continuación, el bucle de bloques renderiza `blocks[0]`:
   ```html
   <app-heading-block><h1>105.1 Personalizar y usar el entorno de shell</h1></app-heading-block>
   ```
3. A continuación, `blocks[1]` es un párrafo con la descripción del tema.
4. El resultado visual son **tres encabezados consecutivos** para el mismo contenido: un eyebrow, un H1 de 48px y otro H1 de 36px, dejando la mitad inferior del lienzo 16:9 completamente vacía o con un callout descolgado (captura `docs/agent/auditorias/web-2026-11-03/capturas/a3-105-1-portada.png`).

### 5.2 Propuesta de Portada Canónica Única
Eliminar el bloque `heading` redundante del cuerpo de la diapositiva y diseñar una cabecera de portada rica en metadatos oficiales:
```
┌────────────────────────────────────────────────────────────────────────┐
│ LPIC-1 · EXAMEN 102 · TEMA 105 · PESO 4 · TIEMPO ESTIMADO ~45 MIN     │ (Píldora / Eyebrow)
│                                                                        │
│ Personalizar y usar el entorno de shell                                │ (H1 Titular, 44px)
│ Subtema Oficial 105.1                                                  │ (Subtítulo tenue, 20px)
├────────────────────────────────────────────────────────────────────────┤
│ 🎯 OBJETIVOS DE CERTIFICACIÓN EVALUADOS POR LPI:                       │
│ • Establecer variables de entorno al inicio de sesión o nuevo shell    │ (Caja estructurada
│ • Escribir funciones de shell para secuencias comunes de comandos      │  de 2 columnas
│ • Mantener los esqueletos de shell (/etc/skel) para nuevos usuarios    │  con tokens nativos)
│ • Configurar la ruta de búsqueda de ejecutables en PATH                │
│                                                                        │
│ 💻 COMANDOS CLAVE: source, alias, unalias, env, export, set, unset    │ (Badges mono)
└────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Propuesta de Diapositiva de Cierre Canónica (Slide 20 / Resumen)
Reemplazar las diapositivas de resumen vacías o con flashcards por una diapositiva canónica estructurada:
```
┌────────────────────────────────────────────────────────────────────────┐
│ SUBTEMA 105.1 · SÍNTESIS OFICIAL                                       │ (Eyebrow)
│ Resumen y Conceptos Clave de Examen                                    │ (H2 Titular, 32px)
├────────────────────────────────────────────────────────────────────────┤
│ 📌 PUNTOS ESENCIALES PARA RECORDAR:                                    │
│ • Ficheros login (~/.bash_profile, /etc/profile) vs non-login (~/.bashrc)│
│ • Variables locales no se heredan; 'export' las propaga a subprocesos   │ (Lista con viñetas
│ • 'source' o '.' ejecuta en el entorno actual sin crear subshell       │  de síntesis LPI)
│ • '/etc/skel' provee la plantilla inicial para 'useradd -m'            │
│ • Alias no aceptan parámetros; usar funciones de shell con $1..$9      │
├────────────────────────────────────────────────────────────────────────┤
│ 🎉 ¡Has completado la teoría de este subtema!                          │
│ [ Practica lo aprendido: Test rápido, flashcards y ejercicios → ]      │ (Panel CTA integrado)
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Definición de la Plantilla Canónica de Diapositiva y Auditoría de Cumplimiento

### 6.1 Reglas de la Plantilla Canónica de Diapositiva (16:9)

Para garantizar legibilidad pedagógica sin scroll en un lienzo de 1280×720px:

1. **Jerarquía sin duplicidades**: La cabecera del visor muestra el contexto (`Subtema X · Slide N/M`) y el título del slide (`slide.title`). El cuerpo de la diapositiva **nunca** debe comenzar con un bloque `heading` que repita el mismo título. Los subtítulos internos solo se admiten para dividir secciones (nivel H3 o H4).
2. **Contenido no vacío**: Prohibidas las diapositivas esqueleto (con 0 bloques de contenido o solo un encabezado).
3. **Límite de bloques**: Máximo **3 bloques** por diapositiva (por ejemplo: párrafo + tabla + callout; o diagrama + párrafo explicativo).
4. **Límites estrictos de densidad (Spec 12 §12.1)**:
   - Texto total por diapositiva: **≤ 140 palabras**.
   - Código / Terminal: **≤ 14 líneas**.
   - Tablas: **≤ 6 filas** y **≤ 4 columnas**.
   - Listas: **≤ 6 viñetas**.
   - Callouts: **≤ 1 callout** por diapositiva, máximo 250 caracteres.
5. **Identidad íntegra**: Cada diapositiva debe tener un `id` único (`<subtema>-slide-<N>`) y `slideNumber` consecutivo coincidente con su posición ordinal.

### 6.2 Medición del Incumplimiento en las 771 Diapositivas

| Criterio de la Plantilla Canónica | Diapositivas Incumplidoras | Porcentaje |
|---|---|---|
| **Regla 1: Título duplicado en bloques (`heading` repite `slide.title`)** | **752 diapositivas** | **97.5%** |
| **Regla 2: Diapositiva esqueleto sin contenido útil** | **76 diapositivas** | **9.9%** |
| **Regla 3: Exceso de bloques (> 3 bloques por diapositiva)** | **374 diapositivas** | **48.5%** |
| **Regla 4a: Exceso de palabras (> 140 palabras en el slide)** | **399 diapositivas** | **51.8%** |
| **Regla 4b: Exceso de filas en tablas (> 6 filas)** | **41 diapositivas** | **5.3%** |
| **Regla 4c: Exceso de líneas de código (> 14 líneas)** | **6 diapositivas** | **0.8%** |
| **Regla 5: IDs repetidos o slideNumbers no correlativos** | **155 diapositivas** | **20.1%** |
| **TOTAL DIAPOSITIVAS QUE INCUMPLEN AL MENOS UNA REGLA CANÓNICA** | **753 diapositivas** | **97.7%** |
| **Diapositivas 100% conformes con la plantilla canónica** | **18 diapositivas** | **2.3%** |

*Conclusión*: Prácticamente la totalidad del contenido actual (97.7%) infringe la plantilla canónica debido a la duplicación sistemática del título introducida en la fase de autoría o importación inicial.

---

## 7. Declaración de Limitaciones (Lo que NO se pudo comprobar)

1. **Comportamiento en navegadores móviles reales iOS Safari / Android Chrome**: Se evaluó mediante emulación de viewport móvil (390×844px) en Chromium sin emular el motor WebKit móvil real ni el comportamiento de gestos táctiles (swipe para pasar de diapositiva).
2. **Impresión física en papel real**: Se verificó la emulación de `@media print` en Chromium y los estilos computados del DOM, confirmando el texto blanco `rgb(230, 237, 247)` sobre fondo blanco; no se generó salida física en hardware de impresión.
3. **Persistencia de sesión entre diferentes orígenes de dominio**: La auditoría se ejecutó exclusivamente sobre `http://localhost:4200` y no sobre el dominio de producción `https://lpic1.manuelcobos.dev`.
4. **Navegación mediante lectores de pantalla reales (NVDA / VoiceOver)**: Se comprobó que el contenedor incluye la región viva accesible `<div class="sr-only" aria-live="polite">{{ ariaAnnouncement() }}</div>`, pero no se realizó una sesión de navegación asistida con sintetizador de voz en tiempo real.
