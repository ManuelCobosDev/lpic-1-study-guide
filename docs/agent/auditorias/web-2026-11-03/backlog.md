# Backlog Priorizado de Corrección · Auditoría Web 2026-11-03

Este backlog organiza los **105 hallazgos** de la auditoría integral en **6 oleadas de ejecución independientes**.  
Cada oleada cuenta con alcance definido, estimación de esfuerzo, archivos afectados, criterios de aceptación verificables y comando de comprobación.

---

## Reglas de Ejecución de la Fase 2

1. **Aprobación explícita requerida**: No se iniciará ninguna oleada sin la orden explícita del usuario: **`APROBADO O<n>`**.
2. **Una rama por oleada**: Cada oleada se implementará en su propia rama `audit/o<n>-<nombre>` partiendo de `development`.
3. **Flujo estricto**: Cada tarea cumplirá `/iniciar-sesion`, commit atómico, y `/cerrar-sesion`.
4. **Regla de oro de fidelidad LPI**: Para la generación o alteración de contenido del examen 102 (Oleada O4), la regla `.agents/rules/40-cobertura-y-fidelidad.md` sigue vigente (requiere `VALIDADO <id>` por subtema).

---

## Resumen de Oleadas

| Oleada | Estado | Nombre | Foco Principal | Hallazgos | Esfuerzo | Riesgo |
|---|:---:|---|---|:---:|:---:|:---:|
| **O1** | **Completada** | **Integridad Estructural y Datos** | IDs de diapositivas y preguntas, bug de backup flashcards, validación en build | 12 | **M** | Medio |
| **O2** | **Completada** | **Honestidad, Navegación y SEO Base** | 404s en enlaces, migas de pan, copy honesto (offline/progreso), SEO (`lang="es"`, metas) | 22 | **S** | Bajo |
| **O3** | **Completada** | **Visor de Lecciones y Sistema Visual** | Bloques `html` invisibles, doble título en portada, desbordes 16:9, cabecera | 24 | **L** | Medio |
| **O4** | **Completada** | **Exactitud Pedagógica y Fidelidad LPI** | Claves de examen invertidas, preguntas `fill` rotas, lecciones/labs esqueleto | 18 | **L** | Alto |
| **O5** | **Completada** | **Accesibilidad, Herramientas y Rendimiento** | WCAG 2.2 AA (Axe), modales con focus-trap, división de flashcards | 18 | **M** | Bajo |
| **O6** | **Completada** | **Higiene del Repositorio y Refactorización** | Eliminación de `round_2/`, limpieza de capturas viejas, división de `home-page` | 11 | **M** | Bajo |

---

## Detalle por Oleada

### O1 · Integridad Estructural y Datos Base

- **Objetivo**: Garantizar que las estructuras de datos no corrompan el estado del usuario ni rompan los componentes en tiempo de ejecución.
- **Hallazgos cubiertos**:
  - `A3-001`, `A4-001` (S-01): 155 diapositivas con IDs repetidos en 108.3–110.3.
  - `A4-005`: Colisión de 27 pares de IDs de preguntas entre temas 102 y 105–110.
  - `A8-001`: Corrección del merge en `BackupService.importBackup` (`data.progress` en vez de `data.cards`).
  - `A8-005`: Recarga de stores en memoria al restaurar o resetear backup.
  - `A4-008`: Limpieza de los 206 flags con guion solitario `-` en `commands.yaml`.
  - `A4-004` (S-03): Contadores de Home y README calculados estrictamente desde `manifest.json`.
- **Archivos principales**:
  - `content-src/lessons/108.3.json` a `110.3.json`
  - `content-src/questions/*.json`
  - `src/app/core/services/backup.service.ts`
  - `src/app/core/services/flashcards.service.ts`
  - `scripts/build-content.ts` (añadir check estricto anti-IDs duplicados)
- **Criterio de Aceptación**:
  - `npm run build:content` falla si detecta diapositivas con IDs duplicados o `slideNumber` no correlativo.
  - El 100% de las 771 diapositivas y 240 preguntas tienen IDs universalmente únicos.
  - Restaurar una copia de seguridad en modo merge no provoca `TypeError` al abrir `/flashcards`.
- **Comando de verificación**:
  `npm run verify`

---

### O2 · Honestidad, Navegación y SEO Base

- **Objetivo**: Eliminar enlaces rotos hacia páginas 404, corregir afirmaciones no respaldadas por la tecnología actual y dotar a la web de identidad SEO sólida.
- **Hallazgos cubiertos**:
  - `A2-001`: Corrección de ruta `['/leccion', id]` por `['/estudiar', id]` en `errata-page.component.html`.
  - `A2-002`: Sustituir enlace inválido `/laboratorios/tema-101` por enlace al laboratorio del primer subtema en `topic-detail-page.component.ts`.
  - `A2-003`: Corregir miga de pan para no enlazar al segmento virtual `/estudiar`.
  - `A2-004`: Corregir `wiki-popover` para pasar `queryParams` como objeto en vez de cadena concatenada en `routerLink`.
  - `A2-005`, `A7-001` (S-15): Corregir FAQ y Ajustes: explicar con honestidad el funcionamiento de caché actual sin prometer PWA/offline 100%.
  - `A2-006` (S-12): Retirar `phase: 'Fase N'` de las rutas y textos obsoletos ("Planificado para Fase 11", "Próximamente").
  - `A2-011`: Retirar enlace de `/guia-estilos` del footer público y asociarlo a entornos no productivos.
  - `A7-002`: Cambiar `lang="en"` a `lang="es"` en `src/index.html`.
  - `A7-003`, `A7-004`: Añadir `<meta name="description">`, Open Graph tags base, `robots.txt` y `sitemap.xml` en `public/`.
- **Archivos principales**:
  - `src/index.html`
  - `src/app/app.routes.ts`
  - `src/app/shared/components/breadcrumbs/breadcrumbs.component.ts`
  - `src/app/shared/components/wiki-popover/wiki-popover.component.ts`
  - `src/app/features/errata/pages/errata-page.component.html`
  - `src/app/features/curriculum/pages/topic-detail-page.component.ts`
  - `src/app/features/home/pages/home-page.component.ts`
  - `public/robots.txt`, `public/sitemap.xml`
- **Criterio de Aceptación**:
  - 0 enlaces rotos rastreados en toda la web (crawler E2E limpio).
  - `src/index.html` cuenta con `lang="es"` y metadatos sociales.
  - Ningún texto visible contiene jerga de desarrollo ("Fase N").
- **Comando de verificación**:
  `npx playwright test e2e/fase-12.spec.ts`

---

### O3 · Visor de Lecciones y Sistema Visual

- **Objetivo**: Renderizar el contenido técnico invisible, eliminar la redundancia de títulos en portadas y asegurar legibilidad en ratios 16:9, modo oscuro y dispositivos móviles.
- **Hallazgos cubiertos**:
  - `A6-001`, `A1-001` (S-05): Añadir soporte `@case ('html')` o migrar bloques a componentes nativos en `BlockRendererComponent`.
  - `A3-003`, `A1-002` (S-04): Eliminar la duplicación de títulos consecutivos en el 97.5% de diapositivas mediante plantilla canónica de portada.
  - `A3-004`: Prevenir overflows en diapositivas con tablas extensas o más de 140 palabras (scroll controlado o partición).
  - `A3-005`: Corregir estilos `@media print` en modo oscuro para que el texto sea negro legible sobre papel blanco.
  - `A1-004`, `A2-009` (S-09): Reestructurar la cabecera en 768px y 1280px para evitar roturas de línea en el logo y mapa mental.
  - `A1-003`, `A8-006` (S-10): Ajustar escala inicial del mapa mental a 1:1 legible centrado en el tema actual con tipografía mínima de 12px.
  - `A1-006`: Procesar Markdown crudo (`**`, enlaces) en bloques de lista (`list`).
- **Archivos principales**:
  - `src/app/shared/content-blocks/block-renderer.component.ts`
  - `src/app/features/study/components/slide-viewer/slide-viewer.component.ts`
  - `src/app/features/study/components/slide-viewer/slide-viewer.component.css`
  - `src/app/shared/layout/header/header.component.html`
  - `src/app/shared/layout/header/header.component.css`
  - `src/app/features/mindmap/pages/mindmap-page.component.ts`
- **Criterio de Aceptación**:
  - Los diagramas de 4 capas y bloques HTML de 101.1–104.7 se visualizan en pantalla.
  - Las portadas no repiten el título principal dos veces.
  - El logo y menú no se parten a 2/3 líneas en anchos de 768px ni 1280px.
- **Comando de verificación**:
  `npm run verify` + capturas Playwright de muestra.

---

### O4 · Exactitud Pedagógica y Fidelidad LPI

- **Objetivo**: Corregir errores técnicos en preguntas de certificación oficiales que suspenden al estudiante y tratar con honestidad las lecciones esqueleto.
- **Hallazgos cubiertos**:
  - `A5-001`: Corregir las claves de respuesta falsas en `q-103-82`, `q-103-32`, `q-102-21`, `q-102-8`, `q-102-50`, `q-102-84`, `q-102-85` y `q-102-80`.
  - `A5-002`, `A8-004`: Limpiar notas editoriales entre paréntesis en el array `correct` de las 8 preguntas tipo `fill` (`q-102-52`, etc.) y normalizar prompts con `$`.
  - `A5-003`: Corregir opciones corrompidas por parseo de pipes `|` en `q-103-37`, `q-103-30` y `q-103-49`.
  - `A5-006`, `A8-003`: Reubicar las preguntas asignadas masivamente a `.1` hacia sus subtemas reales para no sesgar el simulador.
  - `A4-002`, `A5-010` (S-02): Marcar con `placeholder: true` explícito y visible las lecciones 108.3–110.3 y los 11 laboratorios cascarón hasta que se ejecute su `/procesar-subtema` individual con el PDF oficial.
- **Archivos principales**:
  - `content-src/questions/*.json`
  - `content-src/curriculum.yaml`
  - `content-src/lessons/*.json`
  - `content-src/labs/*.json`
- **Criterio de Aceptación**:
  - Las 240 preguntas del banco tienen claves de respuesta validadas técnicamente contra Debian 12 / LPIC-1 v5.0.
  - Ninguna pregunta tipo `fill` exige texto explicativo para ser calificada como correcta.
  - Las lecciones en preparación no engañan al alumno simulando estar completas.
- **Comando de verificación**:
  `npx tsx docs/agent/auditorias/web-2026-11-03/scripts/a8-test-scoring.ts`

---

### O5 · Accesibilidad, Herramientas y Rendimiento

- **Objetivo**: Cumplir con WCAG 2.2 Nivel AA, optimizar la carga de datos masivos y pulir la interactividad de las herramientas.
- **Hallazgos cubiertos**:
  - `A7-005`: Corregir ratios de contraste (< 4.5:1) en tema oscuro (badges de erratas, simulador y progreso).
  - `A7-006`: Eliminar etiquetas `<main>` anidadas/duplicadas en las 6 rutas señaladas.
  - `A7-007`: Ampliar área táctil en el mapa de calor de `/progreso` (mínimo 24px según Criterio 2.5.8).
  - `A7-008`: Implementar foco accesible (`focus trap`, tecla Escape, foco inicial) en modales de laboratorio.
  - `A7-010`: Retirar `tabindex="0"` de los nodos hoja del mapa mental para evitar trampas de navegación secuencial por teclado.
  - `A7-011`: Carga diferida o por temas del catálogo monolítico de flashcards (875 KB).
  - `A8-007`: Añadir el grupo `#` en el índice alfabético del Glosario A–Z para conceptos de rutas y archivos ocultos (`/etc/passwd`, `~/.bashrc`).
- **Archivos principales**:
  - `src/styles/tokens.css`
  - `src/app/shared/layout/app-shell/app-shell.component.html`
  - `src/app/features/progress/pages/progress-page.component.css`
  - `src/app/features/labs/pages/lab-detail-page.component.ts`
  - `src/app/features/glossary/pages/glossary-page.component.ts`
  - `src/app/core/services/flashcards.service.ts`
- **Criterio de Aceptación**:
  - 0 violaciones graves o críticas en auditorías completas con `@axe-core/playwright`.
  - Navegación fluida por teclado (Tab) sin trampas en el mapa mental ni modales.
  - Glosario permite saltar a términos que inician por `/` o `.`.
- **Comando de verificación**:
  `npx playwright test e2e/fase-12.spec.ts`

---

### O6 · Higiene del Repositorio y Refactorización

- **Objetivo**: Limpiar deuda técnica, archivos residuales, afirmaciones desfasadas en documentación y modularizar componentes monolíticos.
- **Hallazgos cubiertos**:
  - `A9-001` (S-16): Eliminar la carpeta residual `round_2/` que duplica la raíz del repositorio.
  - `A9-002`: Purgar o archivar los 88 PNG obsoletos de `e2e/screenshots/`.
  - `A9-003`: Corregir en `README.md` la URL de clonado `usuario/...` y menciones desfasadas de Karma/Jasmine por Vitest.
  - `A9-004`, `A3-008`: Retirar la clave vestigial `webDocument` en los esquemas y ficheros de lecciones.
  - `A6-003` (S-14): Descomponer `home-page.component.ts` (1.096 líneas) en componentes especializados (`HomeHeroComponent`, `HomeMetricsComponent`, `HomeFaqComponent`).
  - `A6-002` (S-13): Sustituir botones `<button>` nativos dispersos por componentes de botón compartidos (`AppButtonComponent`).
- **Archivos principales**:
  - `round_2/` (eliminar con confirmación)
  - `README.md`
  - `src/app/features/home/`
  - `content-src/schemas/lesson.schema.ts`
- **Criterio de Aceptación**:
  - Repositorio libre de duplicados de configuración y capturas huérfanas.
  - `home-page.component.ts` con menos de 400 líneas.
  - Suite `npm run verify` impecable tras la refactorización.
- **Comando de verificación**:
  `npm run verify`

