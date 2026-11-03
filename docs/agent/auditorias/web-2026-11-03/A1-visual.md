# A1 · Informe de Auditoría Visual (Capturas y Fidelidad Gráfica)

**Fecha:** 2026-11-03  
**Agente:** A1 (Auditor visual)  
**Alcance:** Matriz completa de vistas × viewports (390×844, 768×1024, 1280×800, 1920×1080) × temas (claro/oscuro) + lecciones de muestra.  
**Entregables:** `A1-visual.md`, `hallazgos-A1.json` (A1-001 … A1-012) y 352 capturas en `docs/agent/auditorias/web-2026-11-03/capturas/`.

---

## 1. Resumen Ejecutivo (10 líneas)

1. Se ejecutó la matriz sistemática completa: 44 vistas/estados × 4 viewports × 2 temas = 352 capturas de página completa en disco.
2. **S-05 / A6-001 CONFIRMADO (P0):** Los 258 bloques `html` en temas 101–104 no se renderizan; `BlockRendererComponent` no tiene `@case ('html')`, dejando vacíos masivos y omitiendo diagramas clave del manual.
3. **S-04 CONFIRMADO (P1):** La portada de diapositivas duplica el título (eyebrow + `<h1>` arriba y otro `<h1>/<h2>` idéntico inmediatamente debajo) con >60% de espacio muerto.
4. **S-09 CONFIRMADO (P1):** La cabecera colapsa en 768px (logo roto en 3 líneas: "LPIC-", "1", "Aula") y en 1280px (logo roto en 2 líneas: "LPIC-1", "Aula"; "Mapa mental" roto en 2 líneas).
5. **S-10 CONFIRMADO (P1):** El mapa mental a escala 1:1 inicial se pinta como un racimo vertical diminuto e ilegible en medio de un 90% de vacío, con minimapa descentrado.
6. **S-02 CONFIRMADO (P0):** Lecciones esqueleto (110.1, 108.3, etc.) se presentan como válidas sin aviso de esqueleto; en la vista web son 18 tarjetas consecutivas vacías con solo títulos repetidos.
7. **Nuevo hallazgo A1-006 (P1):** Los bloques de lista (`list`) renderizan Markdown crudo (`**negrita**`) y sintaxis wikilink (`[BIOS](term:bios)`) como texto plano sin procesar.
8. En móviles (390px): colisiones de badges en temario, texto solapado en notas ("caracterescierres") y catálogo de comandos en tabla deformado verticalmente.
9. En Simulador y Laboratorios existen migas de pan duplicadas (barra global del shell + barra interna local en inglés "Home").
10. El modo oscuro funciona bien en componentes nativos de Angular, pero el footer mantiene expuesta la `/guia-estilos` de desarrollo en producción.

---

## 2. Comprobaciones Específicas Solicitadas

### 1. A6-001 / S-05: En `/estudiar/101.1` ¿se renderizan los bloques HTML o quedan vacíos/rotos?
* **Resultado:** **NO SE RENDERIZAN EN ABSOLUTO (QUEDAN VACÍOS / OMITIDOS)**.
* **Causa Raíz:** En `src/app/shared/content-blocks/block-renderer.component.ts` (líneas 33–110), la directiva `@switch (block().type)` contempla: `heading`, `paragraph`, `code`, `terminal`, `callout`, `steps`, `table`, `diagram`, `quiz-inline`, `slide-html` y `list`. **No existe `@case ('html')`**.
* **Impacto en UI:**
  - En la diapositiva 2 de 101.1 (Arquitectura de 4 Capas), entre la lista de capas y el callout de examen debería figurar un diagrama interactivo horizontal de 4 cajas (BIOS, Kernel, /sys, udev). La captura demuestra que entre la lista y el callout hay un espacio en blanco y el diagrama nunca aparece.
  - Esto afecta a las tres vistas: diapositivas (`slide-viewer`), documento web continuo (`lesson-web-view`) e impresión (`lesson-print`), pues todas delegan en `<app-block-renderer>`.
* **Evidencias fotográficas:**
  - `capturas/s05-html-block-101-1-slide2-1280x800-claro.png`
  - `capturas/s05-html-block-101-1-slide2-1280x800-oscuro.png`
  - `capturas/estudiar-101-1-web-1280x800-claro.png`
  - `capturas/estudiar-101-1-imprimir-1280x800-claro.png`

### 2. S-04: Portada de diapositiva con título duplicado y espacio muerto
* **Resultado:** **CONFIRMADO**.
* **Detalle visual:**
  - En `101.1` slide 1: En la zona superior de la diapositiva se lee: `OBJETIVO OFICIAL LPIC-1 101.1` seguido de `Ajustes de hardware del sistema` (en negrita grande). Inmediatamente debajo se vuelve a leer `Ajustes de hardware del sistema` (en negrita grande), seguido de la línea "Determinación, configuración y gestión de periféricos en Linux (Modo Examen)". El resto del lienzo 16:9 (más del 60% vertical) queda completamente en blanco.
  - En `105.1` slide 1: Ocurre exactamente lo mismo con `105.1 Personalizar y usar el entorno de shell`, repetido en dos cabeceras consecutivas.
  - En `103.4` slide 1: Se repite `Uso de flujos, tuberías y redirecciones` dos veces.
  - En la diapositiva 2 de `101.1` también se produce duplicación: el header de la diapositiva imprime `¿Cómo interactúa Linux con el Hardware? (Arquitectura de 4 Capas)` y el primer bloque de contenido vuelve a inyectar un `<h2>` con el mismo texto.
* **Evidencias fotográficas:**
  - `capturas/s04-cover-duplicate-101-1-slide1-1280x800-claro.png`
  - `capturas/s04-cover-duplicate-105-1-slide1-1280x800-claro.png`
  - `capturas/s04-cover-duplicate-101-1-slide1-390x844-claro.png`

### 3. S-09: Cabecera apretada y rotura de líneas en logo o mapa mental a 1280px
* **Resultado:** **CONFIRMADO Y AGRAVADO EN TABLET (768px)**.
* **Detalle visual:**
  - **A 1280px (laptop):** El contenedor `app-container` tiene `max-w-7xl` con padding lateral, dejando ~1216px utilizables. Los 8 enlaces (`Temario`, `Laboratorios`, `Simulador`, `Comandos`, `Glosario`, `Flashcards`, `Mapa mental`, `Progreso`) más el botón "Buscar... Ctrl K", el selector de tema y el botón de ajustes ocupan demasiado ancho. El flexbox colapsa y provoca que:
    1. El logo salte a dos líneas: `LPIC-1` (línea 1) y `Aula` (línea 2).
    2. El enlace de navegación salte a dos líneas: `Mapa` (línea 1) y `mental` (línea 2).
  - **A 768px (tablet):** Es crítico. La clase `md:flex` activa la barra horizontal completa en vez del menú hamburguesa. El espacio es tan insuficiente que el logo salta a **3 líneas** (`LPIC-` / `1` / `Aula`) y `Mapa mental` salta a 2 líneas.
  - **A 390px (móvil):** El menú hamburguesa se activa, pero la presencia de los 3 botones de acción (búsqueda corta, tema, ajustes) junto al botón de menú fuerza al logo a partirse en 2 líneas.
* **Evidencias fotográficas:**
  - `capturas/home-1280x800-claro.png` (cabecera con logo y mapa mental partidos)
  - `capturas/temario-768x1024-claro.png` (cabecera colapsada a 3 líneas)
  - `capturas/home-390x844-claro.png` (cabecera móvil apretada)

### 4. S-10: Mapa mental a 1:1 (legibilidad, vacío)
* **Resultado:** **CONFIRMADO**.
* **Detalle visual:**
  - Al acceder a `/mapa-mental`, la vista inicial (zoom por defecto / escala 1:1 calculada) ubica el árbol jerárquico como una franja central muy angosta y comprimida verticalmente.
  - Las etiquetas de texto de los 55 nodos están a una escala tan reducida que son ilegibles (incluso en pantallas 1920×1080).
  - Alrededor del árbol hay un enorme espacio muerto (más del 85% de la superficie útil del lienzo).
  - El minimapa de la esquina inferior derecha renderiza un marco de viewport azul desfasado respecto a la nube de puntos.
* **Evidencias fotográficas:**
  - `capturas/mapa-mental-1280x800-claro.png`
  - `capturas/mapa-mental-1920x1080-claro.png`
  - `capturas/mapa-mental-1280x800-oscuro.png`

---

## 3. Tabla Completa de Hallazgos Visuales

| ID | Sev. | Categoría | Título | Estado | Evidencia Principal | Semilla / Cruces |
|---|---|---|---|---|---|---|
| **A1-001** | P0 | visual | Bloques HTML no se renderizan (quedan invisibles) | CONFIRMADO | `s05-html-block-101-1-slide2-1280x800-claro.png` | S-05, A6-001 |
| **A1-002** | P1 | visual | Portada duplica título con >60% de espacio muerto | CONFIRMADO | `s04-cover-duplicate-101-1-slide1-1280x800-claro.png` | S-04, A3-002 |
| **A1-003** | P1 | visual | Cabecera colapsa en 2 y 3 líneas en 768px y 1280px | CONFIRMADO | `temario-768x1024-claro.png`, `home-1280x800-claro.png` | S-09, A2-003 |
| **A1-004** | P1 | visual | Mapa mental ilegible a escala 1:1 con 90% de vacío | CONFIRMADO | `mapa-mental-1280x800-claro.png` | S-10, A8-004 |
| **A1-005** | P0 | visual | Lecciones esqueleto sin aviso y 18 tarjetas vacías en web | CONFIRMADO | `estudiar-110-1-web-1280x800-claro.png` | S-02, A2-001 |
| **A1-006** | P1 | visual | Bloques de lista muestran Markdown y wikilinks en crudo | CONFIRMADO | `s05-html-block-101-1-slide2-1280x800-claro.png` | S-05, A3-004 |
| **A1-007** | P2 | visual | Solapamiento de badge y texto deforme en notas (390px) | CONFIRMADO | `temario-390x844-claro.png`, `s05-...-390x844-claro.png` | S-09, A6-005 |
| **A1-008** | P2 | visual | Doble barra de migas de pan en Simulador y Labs | CONFIRMADO | `simulador-resultados-1280x800-claro.png` | S-09, A2-005 |
| **A1-009** | P2 | visual | Truncamiento masivo con `...` en tarjetas de labs y temario | CONFIRMADO | `laboratorios-1280x800-claro.png` | S-07, A2-006 |
| **A1-010** | P2 | visual | Tabla de comandos deformada en móvil en columna infinita | CONFIRMADO | `comandos-390x844-claro.png` | S-08, A8-006 |
| **A1-011** | P3 | visual | Breadcrumb muestra slugs crudos (`Mapa-mental`, `Acerca-de`) | CONFIRMADO | `mapa-mental-1280x800-claro.png` | S-09, A2-007 |
| **A1-012** | P3 | visual | Enlace a `/guia-estilos` expuesto en footer en producción | CONFIRMADO | `home-1280x800-claro.png` | S-11, A2-008 |

---

## 4. Matriz de Cobertura Visual Ejecutada

Se capturaron **352 archivos PNG** que cubren todas las combinaciones exigidas:
* **Viewports:**
  - `390x844` (Móvil / iPhone 12/13/14)
  - `768x1024` (Tablet / iPad Mini/Air portrait)
  - `1280x800` (Laptop estándar / Chromebook / WXGA)
  - `1920x1080` (Desktop Full HD)
* **Temas:**
  - `claro` (`data-theme="light"`, `colorScheme: 'light'`)
  - `oscuro` (`data-theme="dark"`, `colorScheme: 'dark'`)
* **Páginas base evaluadas (21):**
  - `/` (`home`), `/temario`, `/temario/101`, `/temario/102`, `/temario/101/101` (`tema-101`)
  - `/laboratorios`, `/laboratorios/101.1` (`lab-101-1`)
  - `/simulador`, `/simulador/examen`, `/simulador/practica`, `/simulador/resultados`
  - `/comandos`, `/glosario`, `/flashcards`, `/mapa-mental`, `/buscar`, `/progreso`, `/erratas`, `/ajustes`, `/acerca-de`, `/404`
* **Muestras de lecciones evaluadas (10):**
  - **Completas:** 101.1 (slides, web, imprimir), 102.1 (slides, web), 103.4 (slides, web), 105.1 (slides, web, imprimir)
  - **Medias:** 106.2 (slides, web), 108.2 (slides, web)
  - **Esqueleto:** 108.3 (slides, web), 109.1 (slides, web), 110.1 (slides, web)
* **Capturas de diagnóstico específico:**
  - `s05-html-block-101-1-slide2` (slide 2 con bloque HTML omitido)
  - `s04-cover-duplicate-101-1-slide1` (portada duplicada 101.1)
  - `s04-cover-duplicate-105-1-slide1` (portada duplicada 105.1)

Todas las capturas se encuentran almacenadas y referenciables en `docs/agent/auditorias/web-2026-11-03/capturas/`.

---

## 5. Análisis Detallado de Otros Problemas Visuales Detectados

### A. Fallos en el formateo de contenido didáctico (A1-006)
Al auditar las lecciones completas (101.1 y 103.4), se descubrió que los bloques `list` no pasan sus elementos por ningún parser de Markdown ni por el motor de wikilinks (`autolink.engine.ts`). 
En la diapositiva 2 de 101.1 se lee literalmente:
```text
**1. Firmware del Sistema ([BIOS](term:bios) / [UEFI](term:uefi))** — Inicializa los chips...
**2. Kernel y Módulos Dinámicos (/lib/modules)** — ... (drivers)[.](cmd:source)
```
Esto deteriora gravemente la estética y la experiencia de estudio, mostrando sintaxis de código cruda en medio de una presentación formal.

### B. Inconsistencias de interfaz móvil a 390px (A1-007, A1-010)
1. **Página de comandos:** La vista por defecto es una tabla de 680px de ancho mínimo. En vez de comportarse de manera adaptativa, la primera columna colapsa comprimiendo los botones de comando y estirando la página verticalmente a lo largo de miles de píxeles sin mostrar el resto de columnas.
2. **Cuadro de notas personales:** En el pie del componente de notas bajo la diapositiva, el texto de conteo de caracteres (`0 caracteres`) y la nota de persistencia (`Las notas se conservan aunque cierres o recargues el navegador`) no tienen separación flex-col en pantallas pequeñas, provocando la fusión tipográfica `caracterescierres`.
3. **Página de Temario:** El badge superior `CERTIFICACIÓN OFICIAL` invade directamente el texto de versión situado a su derecha, provocando un solapamiento ilegible.

### C. Duplicidad de componentes estructurales (A1-008)
El diseño arquitectónico de la aplicación provee un componente global de migas de pan en `AppShellComponent`. Sin embargo, páginas como `/simulador`, `/simulador/resultados` y `/laboratorios/:id` vuelven a renderizar dentro de su propio contenedor un `<nav class="breadcrumbs">`. Esto causa un efecto visual de doble barra apilada con estilos dispares (una con `Inicio` y otra con `Home`).

---

## 6. Lo que NO se pudo comprobar

1. **Interacciones táctiles reales y gestos gestuales swipe en móviles físicos:** Se comprobó la adaptación responsive y el layout con emulación de viewport en Playwright/Chromium, pero no eventos touch nativos en hardware iOS/Android real.
2. **Animaciones CSS y transiciones durante navegación:** Las capturas son estáticas tras estabilizarse la página (`domcontentloaded` + timeout); no se evaluó la fluidez visual de transiciones de diapositivas o apertura de popovers.
3. **Renderizado de fuentes en sistemas Apple/macOS y Safari (WebKit):** Las pruebas se ejecutaron sobre motor Chromium en entorno Windows; el antialiasing de fuentes y renderizado de emojis puede diferir levemente en Safari/macOS.
4. **Flujo completo interactivo del simulador cronometrado:** Se capturó el hub, el estado de inicio y la pantalla de resultados con datos sembrados, pero no la interacción pregunta a pregunta durante los 90 minutos de cuenta regresiva (alcance asignado a A8).
5. **Comportamiento visual de impresión física en papel o diálogo real del SO:** Se auditó la página `/imprimir` renderizada en el navegador (formato visual A4 en pantalla), pero no la salida generada por el driver de impresión de la impresora física del sistema operativo.
