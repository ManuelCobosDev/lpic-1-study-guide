# DIAGNÓSTICO Y LÍNEA BASE · RONDA 2 (Paso R0)

**Fecha**: 2026-11-01  
**Objetivo**: Medir con precisión cuantitativa el estado real del repositorio al culminar el MVP e identificar las causas raíz exactas de los 6 fallos observados (F1 a F6), estableciendo la suite de pruebas en rojo y la evidencia visual de partida sin alterar el código de producción.

---

## 1. Tabla de Estado Inicial con Cifras Reales

Todas las cifras han sido extraídas directamente del manifiesto (`public/content/manifest.json`), el sistema de archivos y las fuentes oficiales.

### 1.1 Resumen Global
| Recurso | Cantidad Real | Estado / Observación |
|---|---|---|
| **Exámenes soportados** | 2 | Examen 101-500 y Examen 102-500 |
| **Temas oficiales** | 10 | Temas 101 a 104 (101) y 105 a 110 (102) |
| **Subtemas implementados** | 42 | 23 en Examen 101 · 19 en Examen 102 |
| **Total de diapositivas** | 770 | Entre 15 y 19 diapositivas por subtema (0 placeholders) |
| **Comandos documentados** | 193 | En `content-src/commands.yaml` |
| **Términos de glosario** | 230 | En `content-src/glossary.yaml` |
| **Banco de preguntas oficial** | 240 | 120 (Examen 101) + 120 (Examen 102) |
| **Laboratorios guiados** | 42 | 42/42 subtemas tienen laboratorio asociado |
| **Flashcards activas** | 423 | Generadas en memoria 1:1 desde comandos (193) y glosario (230) |
| **Nodos del mapa mental** | 55 | 1 raíz + 2 exámenes + 10 temas + 42 subtemas |

---

### 1.2 Detalle de los 42 Subtemas (Diapositivas y Laboratorios)

| Subtema | Título / Objetivo | Diapositivas | Peso Oficial | Laboratorio Asociado |
|---|---|---|---|---|
| **101.1** | Identificar y configurar hardware | 19 | 2 | `lab-101-1` |
| **101.2** | Arrancar el sistema | 19 | 3 | `lab-101-2` |
| **101.3** | Cambiar niveles de ejecución / targets | 19 | 3 | `lab-101-3` |
| **102.1** | Diseñar el esquema de particiones | 19 | 2 | `lab-102-1` |
| **102.2** | Instalar un gestor de arranque | 19 | 2 | `lab-102-2` |
| **102.3** | Gestión de bibliotecas compartidas | 19 | 1 | `lab-102-3` |
| **102.4** | Gestión de paquetes Debian | 19 | 3 | `lab-102-4` |
| **102.5** | Gestión de paquetes RPM y YUM | 19 | 3 | `lab-102-5` |
| **102.6** | Linux como invitado de virtualización | 19 | 1 | `lab-102-6` |
| **103.1** | Trabajar en la línea de comandos | 19 | 4 | `lab-103-1` |
| **103.2** | Procesar flujos de texto con filtros | 19 | 3 | `lab-103-2` |
| **103.3** | Gestión básica de archivos | 19 | 4 | `lab-103-3` |
| **103.4** | Usar flujos, tuberías y redirecciones | 19 | 4 | `lab-103-4` |
| **103.5** | Crear, monitorizar y matar procesos | 19 | 4 | `lab-103-5` |
| **103.6** | Modificar prioridades de ejecución de procesos | 18 | 2 | `lab-103-6` |
| **103.7** | Buscar en archivos de texto con regex | 19 | 3 | `lab-103-7` |
| **103.8** | Edición básica de archivos con vi | 19 | 2 | `lab-103-8` |
| **104.1** | Crear particiones y sistemas de archivos | 19 | 2 | `lab-104-1` |
| **104.2** | Mantener la integridad de sistemas de archivos | 19 | 2 | `lab-104-2` |
| **104.3** | Controlar el montaje y desmontaje de FS | 19 | 3 | `lab-104-3` |
| **104.5** | Administrar permisos y propiedades de archivos | 19 | 3 | `lab-104-5` |
| **104.6** | Crear y cambiar enlaces duros y simbólicos | 19 | 2 | `lab-104-6` |
| **104.7** | Encontrar archivos del sistema y ubicaciones | 19 | 2 | `lab-104-7` |
| **105.1** | Personalizar y usar el entorno de shell | 19 | 4 | `lab-105-1` |
| **105.2** | Modificar o escribir scripts simples | 19 | 4 | `lab-105-2` |
| **106.1** | Instalar y configurar X11 | 19 | 2 | `lab-106-1` |
| **106.2** | Escritorios gráficos | 16 | 1 | `lab-106-2` |
| **106.3** | Accesibilidad | 15 | 1 | `lab-106-3` |
| **107.1** | Gestionar cuentas de usuario y grupos | 19 | 5 | `lab-107-1` |
| **107.2** | Automatizar tareas con cron y systemd timers | 19 | 4 | `lab-107-2` |
| **107.3** | Localización e internacionalización | 18 | 3 | `lab-107-3` |
| **108.1** | Mantener la hora del sistema | 16 | 3 | `lab-108-1` |
| **108.2** | Registro del sistema (syslog y journald) | 19 | 4 | `lab-108-2` |
| **108.3** | Fundamentos de Mail Transfer Agent (MTA) | 16 | 3 | `lab-108-3` |
| **108.4** | Gestionar impresoras e impresión | 16 | 2 | `lab-108-4` |
| **109.1** | Fundamentos de protocolos de Internet | 18 | 4 | `lab-109-1` |
| **109.2** | Configuración persistente de red | 18 | 4 | `lab-109-2` |
| **109.3** | Resolución de problemas de red | 18 | 4 | `lab-109-3` |
| **109.4** | Configurar DNS del cliente | 16 | 2 | `lab-109-4` |
| **110.1** | Tareas de administración de seguridad | 18 | 3 | `lab-110-1` |
| **110.2** | Configurar seguridad del host | 16 | 3 | `lab-110-2` |
| **110.3** | Asegurar datos mediante cifrado (GPG y SSH) | 19 | 4 | `lab-110-3` |

---

### 1.3 Banco de Preguntas por Tema (101 a 110)

| Tema | Examen | Preguntas Actuales | Distribución y Observaciones |
|---|---|---|---|
| **101** | 101-500 | 19 | Arquitectura del sistema |
| **102** | 101-500 | 27 | Instalación de Linux y gestión de paquetes |
| **103** | 101-500 | 43 | Comandos GNU y Unix |
| **104** | 101-500 | 31 | Dispositivos, sistemas de archivos Linux, FHS |
| *Subtotal 101* | **101-500** | **120** | **Total Examen 101: 120 preguntas** |
| **105** | 102-500 | 49 | Shells y secuencias de comandos |
| **106** | 102-500 | 6 | Interfaces de usuario y escritorios (déficit crítico) |
| **107** | 102-500 | 24 | Tareas administrativas |
| **108** | 102-500 | 15 | Servicios esenciales del sistema |
| **109** | 102-500 | 24 | Fundamentos de redes |
| **110** | 102-500 | 2 | Seguridad (déficit crítico) |
| *Subtotal 102* | **102-500** | **120** | **Total Examen 102: 120 preguntas (distribución desbalanceada)** |
| **Total Global** | **LPIC-1** | **240** | **240 preguntas en total** |

---

## 2. Diagnóstico de los 6 Fallos (F1 a F6)

### Fallo F1 · El simulador solo tiene el Examen 101; falta el 102
- **Cómo se reproduce**: Navegar a `/simulador`. La cabecera indica genéricamente "Simulador de examen LPIC-1", pero la tarjeta de simulacro cronometrado no ofrece selector de examen (101 vs 102). Al pulsar "Comenzar simulacro", se lanzan preguntas de todo el pool o sin segmentación por examen 102, y los resultados no desglosan los temas 105–110.
- **Evidencia visual**: `e2e/screenshots/r2-R0/f1-simulador-hub.png`.
- **Causa raíz probable**:
  - `src/app/features/simulator/pages/simulator-hub-page.component.html` (líneas 66-120): No implementa el selector por pestañas o radio para alternar entre "Examen 101-500" y "Examen 102-500".
  - `src/app/features/simulator/pages/simulator-hub-page.component.ts` (líneas 62-71): `startTimedExam()` invoca `examService.startExam({ mode: 'exam' })` sin propagar `examId: '101' | '102'`.
  - `src/app/core/services/exam.service.ts` (líneas 74-121): Si no se pasa un `topicId`, carga todos los temas del currículo juntos sin filtrar por el examen seleccionado.
  - `src/app/features/simulator/pages/simulator-results-page.component.ts`: No desglosa el informe oficial para los temas 105 a 110.

### Fallo F2 · Solo hay 10 flashcards; faltan cientos
- **Cómo se reproduce**: Navegar a `/flashcards`. El selector superior únicamente muestra tres mazos estáticos: "Mixto (Comandos + Glosario)", "Solo Comandos" y "Solo Glosario". No existen filtros por Examen 101/102, ni por tema, ni por subtema, ni mazo de "Vencidas hoy". Tampoco existe un explorador o biblioteca para consultar las tarjetas fuera de la sesión de estudio.
- **Evidencia visual**: `e2e/screenshots/r2-R0/f2-flashcards-deck.png`.
- **Causa raíz probable**:
  - `src/app/core/services/flashcards.service.ts` (líneas 51-81, 136-164): Las tarjetas se sintetizan al vuelo exclusivamente 1:1 por comando (193) y por término (230). No se generan tarjetas para flags/opciones individuales (ej. `chmod -R`), rutas del FHS, conceptos ni archivos clave.
  - `scripts/build-content.ts`: No existe un paso de compilación para pregenerar un catálogo masivo determinista de flashcards (`flashcards-extra.yaml`).
  - `src/app/features/flashcards/pages/flashcards-page.component.html`: Falta la interfaz del explorador de tarjetas (búsqueda y paginación para miles de tarjetas) y los selectores de mazo avanzados.

### Fallo F3 · El mapa mental no funciona
- **Cómo se reproduce**: Navegar a `/mapa-mental`. Al hacer clic en los controles de zoom (`+`, `-`, `1:1`, `Ajustar`), la escala de la visualización SVG no se modifica en absoluto. Arrastrar (pan) tampoco desplaza el lienzo.
- **Evidencia visual**: `e2e/screenshots/r2-R0/f3-mapa-mental.png`.
- **Causa raíz probable**:
  - `src/app/features/mind-map/pages/mind-map-page.component.ts` (líneas 65, 277-291): El método `initZoom()` que enlaza D3 Zoom (`select(svgEl).call(this.zoomBehavior)`) está definido pero **nunca es invocado** (ni en `ngOnInit`, ni en `ngAfterViewInit`, ni en el template).
  - Como resultado, `this.zoomBehavior` permanece perpetuamente `undefined`.
  - Las funciones `zoomIn()`, `zoomOut()`, `resetZoom()` y `fitToScreen()` (líneas 294, 300, 306, 312) ejecutan `if (!this.svgContainerRef || !this.zoomBehavior) return;`, fallando en silencio.
  - Además, el componente no implementa el interruptor "Mostrar comandos y términos" para desplegar la jerarquía completa de ~475 nodos del legacy.

### Fallo F4 · A los subtemas les falta contenido respecto al manual oficial
- **Cómo se reproduce**: Abrir un subtema como `/estudiar/105.1`. La lección proviene de la importación legacy de diapositivas HTML y carece de las áreas de conocimiento clave oficiales, la lista parcial de archivos y términos completa, los ejercicios guiados y exploratorios del PDF con sus soluciones, y la trazabilidad `<!-- src: ... -->`.
- **Evidencia visual**: `e2e/screenshots/r2-R0/f4-subtema-105-1-slides.png`.
- **Causa raíz probable**:
  - `content-src/lessons/105.1.md` a `110.3.md`: Fueron generadas sin contrastar contra el manual oficial `LPI-Learning-Material-102-500-es.pdf` (594 páginas).
  - Ausencia de herramientas de extracción tipográfica determinista (`units.json`, `pages.json`) y de ledger de cobertura (`.ledger.yaml`).

### Fallo F5 · No hay sistema tipo Wikipedia (hover y clic en comandos/términos)
- **Cómo se reproduce**: En cualquier diapositiva de `/estudiar/:subtema`, los comandos y términos aparecen como texto o código estático sin enlaces ni tarjetas flotantes al pasar el cursor. En `/glosario` y `/comandos`, no hay enlaces "Se explica en:" que lleven a la diapositiva específica.
- **Evidencia visual**: `e2e/screenshots/r2-R0/f5-enlaces-ausentes.png`.
- **Causa raíz probable**:
  - `src/app/features/study/pages/lesson-page.component.ts` (línea 383): Declara `<app-wiki-popover />` de forma huérfana sin enlazarle datos (`data` no está enlazado).
  - No existe el componente de enlace `app-term-link` ni el motor de autoenlazado `core/engines/autolink` en el parser de lecciones.
  - `content-src/commands.yaml` y `content-src/glossary.yaml` carecen de los campos `short`, `aliases` y `explainedIn`.

### Fallo F6 · Falta la sección "Practica lo aprendido" en los subtemas
- **Cómo se reproduce**: En `/estudiar/:subtema`, la sección inferior de pestañas solo cuenta con 3 opciones: "Laboratorio práctico", "Mis notas personales" y "Comandos y glosario". Falta la cuarta pestaña esencial: "Practica lo aprendido".
- **Evidencia visual**: `e2e/screenshots/r2-R0/f6-pestana-faltante.png`.
- **Causa raíz probable**:
  - `src/app/features/study/pages/lesson-page.component.ts` (líneas 240-352): La configuración `secondaryTabs` omite la pestaña `practice`.
  - No están implementados los componentes del Bloque A (Test rápido de ≤ 10 preguntas con corrección inmediata y persistencia), Bloque B (Mini-flashcards con Leitner) ni Bloque C (Acordeón de ejercicios oficiales con respuesta).

---

## 3. Inventario del Material Legacy 102 Pendiente de Importar

En `_legacy/Recurso Final Definitivo/` se encuentran activos los siguientes recursos del Examen 102 que no han sido trasladados o están desaprovechados:

1. **Banco de Preguntas del Examen 102**:
   - `_legacy/Recurso Final Definitivo/app/simulador/preguntas_102.json`: Contiene las **120 preguntas completas** del Examen 102 con enunciados, opciones y explicaciones originales.
   - `_legacy/Recurso Final Definitivo/preguntas 102.html` y scripts de extracción asociados (`tools/extract_102_questions.py`, `tools/build_simulador_102_data.py`).
2. **Mapa Mental Legacy**:
   - Estructura jerárquica con **~475 nodos** que incluía ramas detalladas para comandos y términos de cada subtema, pendiente de sintetizar para resolver F3.
3. **Ejercicios y Soluciones del Manual**:
   - Cientos de ejercicios guiados y exploratorios contenidos en el PDF del 102 sin trasladar a archivos de datos estructurados.

---

## 4. Verificación de los Manuales Oficiales (PDFs)

Comprobación realizada mediante Python y PyMuPDF (`fitz`):

| Archivo PDF en `_legacy/Recurso Final Definitivo/` | Tamaño (bytes) | Páginas Reales | Estado |
|---|---|---|---|
| `LPI-Learning-Material-101-500-es.pdf` | 8.725.188 | **571 páginas** | Verificado y accesible |
| `LPI-Learning-Material-102-500-es.pdf` | 9.776.921 | **594 páginas** | **Verificado y accesible (Fuente de verdad de R2)** |

El documento del Examen 102 (594 páginas) contiene los 6 temas (105 a 110) y 19 objetivos requeridos para el proceso de extracción en el paso R1.

---

## 5. Suite de Tests Pendientes (`e2e/ronda2/pendientes/`)

Se han creado los 5 specs en `e2e/ronda2/pendientes/` reflejando los criterios de los gates R3 a R7. Ejecutados mediante `npm run e2e:pendientes`, los 5 tests fallan de forma limpia por la ausencia funcional de cada característica:

1. `f1-simulador-102.spec.ts` -> **FALLA** (`expect(exam102Selector).toBeVisible()` falló al no existir selector para Examen 102).
2. `f2-flashcards-masivas.spec.ts` -> **FALLA** (`expect(deckExam102).toBeVisible()` falló al no existir mazos por examen).
3. `f3-mapa-mental.spec.ts` -> **FALLA** (`expect(newTransform).not.toBe(initialTransform)` falló porque el zoom no se ejecuta).
4. `f5-enlaces-wikipedia.spec.ts` -> **FALLA** (`expect(termLink).toBeVisible()` falló al no existir autoenlaces interactivos).
5. `f6-practica-subtema.spec.ts` -> **FALLA** (`expect(practiceTab).toBeVisible()` falló al no existir la 4ª pestaña).

Al mismo tiempo, la suite principal `npm run e2e` ejecutó **74 tests, resultando los 74 en verde** gracias a la exclusión controlada de `pendientes`.
