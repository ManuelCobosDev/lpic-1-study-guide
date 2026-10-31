# CHANGELOG · historial de cambios del agente

> **Solo se añade al final. Nunca se reescribe ni se borra.** Una entrada por cambio (tarea terminada). Formato y reglas en `.agents/rules/10-memoria-y-registro.md`. Los commits llevan el ID entre corchetes: `git log --grep "C-0007"`.

## C-0000 · 2026-10-31 · Paquete de arranque
- Qué: añadidas reglas (`.agents/rules/`), skills (`.agents/skills/`), especificación (`docs/spec/`) y plantillas de memoria (`docs/agent/`).
- Por qué: dar al agente reglas, procedimientos y memoria persistente antes de escribir código (D-001, D-003).
- Archivos: `AGENTS.md`, `.agents/**`, `docs/**`, `.gitignore`, `.gitattributes`.
- Verificación: no aplica (solo documentación).
- Pendiente / deuda: ninguna.

## C-0001 · 2026-10-31 · Fase 0 · Andamiaje Angular base y configuración de herramientas
- Qué: inicialización del proyecto Angular con TypeScript estricto, Angular CLI, Vitest, Playwright, ESLint con soporte de plantillas y componentes, PostCSS con Tailwind v4, y dependencias completas del stack.
- Por qué: requisito base de la Fase 0 y especificación 01-stack.md y 02-estructura.md.
- Archivos: package.json, angular.json, tsconfig*.json, eslint.config.js, playwright.config.ts, postcss.config.js, vitest.config.ts, src/**.
- Verificación: npm run typecheck (código 0), npm run lint (código 0), npm test (2 tests pasando en Vitest).
- Pendiente / deuda: estructura completa de carpetas con READMEs (Tarea 2), tokens CSS (Tarea 3), scripts de calidad (Tarea 4).

## C-0002 · 2026-10-31 · Fase 0 · Estructura exacta de directorios, READMEs de fronteras y documentación base
- Qué: creación de la jerarquía completa de carpetas según 02-estructura.md, README.md en cada directorio principal con sus responsabilidades y prohibiciones, y documentos de arquitectura, sistema de diseño, contenido y despliegue en docs/.
- Por qué: consolidar las fronteras arquitectónicas y documentar responsabilidades antes de implementar lógica (02-estructura.md, Gate 0).
- Archivos: src/app/core/**/README.md, src/app/shared/**/README.md, src/app/features/README.md, scripts/README.md, content-src/README.md, e2e/README.md, docs/ARCHITECTURE.md, docs/DESIGN_SYSTEM.md, docs/CONTENT_GUIDE.md, docs/DEPLOY.md.
- Verificación: npm run typecheck (código 0), npm run lint (código 0), npm test (2 tests pasando).
- Pendiente / deuda: tokens CSS y temas (Tarea 3), scripts de calidad (Tarea 4).

## C-0003 · 2026-10-31 · Fase 0 · Tokens CSS, temas claro/oscuro y hojas de estilo base
- Qué: implementación completa de src/styles/tokens.css (paleta Azure, Slate, Emerald, Amber, Rose, Sky, radios, sombras, z-index), themes.css (tokens semánticos claro/oscuro), typography.css, slides.css y print.css integrados con Tailwind CSS v4.
- Por qué: base de diseño y regla R6 (cero colores fuera de tokens, 05-diseno.md).
- Archivos: src/styles/tokens.css, src/styles/themes.css, src/styles/typography.css, src/styles/slides.css, src/styles/print.css, src/styles.css.
- Verificación: npm run typecheck (código 0), npm run lint (código 0), npm test (2 tests pasando), npx ng build (código 0, bundle inicial de estilos 31.49 kB).
- Pendiente / deuda: scripts de validación y calidad (Tarea 4), AppShell y stubs (Tarea 5).

## C-0004 · 2026-10-31 · Fase 0 · Scripts de validación, pipeline mínimo y tests unitarios de reglas
- Qué: implementación de scripts en TypeScript para Windows/Node: check-tokens (con tests), check-boundaries (con tests), check-stubs, build-content (con --validate), postbuild (copia a 404.html), new-subtopic, import-legacy, preview y verify.
- Por qué: automatización de controles de calidad y cumplimiento estricto de reglas R3, R4, R6 y R8 antes de construir UI.
- Archivos: scripts/check-tokens.ts, scripts/check-tokens.spec.ts, scripts/check-boundaries.ts, scripts/check-boundaries.spec.ts, scripts/check-stubs.ts, scripts/build-content.ts, scripts/postbuild.ts, scripts/verify.ts, scripts/preview.ts, scripts/new-subtopic.ts, scripts/import-legacy/index.ts, src/app/app.html, src/app/app.spec.ts, src/styles/print.css.
- Verificación: npm run typecheck (código 0), npm run lint (código 0), npm test (8 tests pasando: 2 Angular + 2 tokens + 4 boundaries), npm run check:tokens (código 0), npm run check:boundaries (código 0), npm run build:content y validate:content (código 0).
- Pendiente / deuda: AppShell, botón único, Container, servicios base y rutas stub (Tarea 5).

## C-0005 · 2026-10-31 · Fase 0 · AppShell, botón único, Container, servicios base y rutas stub
- Qué: implementación de StorageService (acceso exclusivo a localStorage con fallback en memoria), ThemeService (claro/oscuro/sistema reactivo y persistente), ContainerComponent, ButtonComponent (único app-button con 6 variantes y 4 tamaños), HeaderComponent, BreadcrumbsComponent, FooterComponent, AppShellComponent con banner de privacidad descartable y skip-link, y registro lazy de las 23 rutas con NotImplementedPageComponent.
- Por qué: esqueleto navegable completo según 01-stack.md, 03-dominio.md §3.4, 05-diseno.md §5.3-5.4 y 06a-pantallas-base-y-estudio.md §6.1.
- Archivos: src/app/core/services/storage.service.ts, src/app/core/services/theme.service.ts, src/app/shared/ui/container/container.component.ts, src/app/shared/ui/button/button.component.ts, src/app/shared/layout/header/header.component.ts, src/app/shared/layout/breadcrumbs/breadcrumbs.component.ts, src/app/shared/layout/footer/footer.component.ts, src/app/shared/layout/app-shell/app-shell.component.ts, src/app/shared/layout/not-implemented-page/not-implemented-page.component.ts, src/app/app.ts, src/app/app.routes.ts, src/app/app.config.ts, src/app/app.spec.ts.
- Verificación: npm run typecheck (código 0), npm run lint (código 0), npm run check:tokens (código 0), npm run check:boundaries (código 0), npm test (7 tests pasando), ng build (código 0, bundle inicial 290.70 kB) y postbuild (404.html generado).
- Pendiente / deuda: tests E2E con Playwright + Axe, capturas de pantalla y verificación del Gate 0 (Tarea 6).

## C-0006 · 2026-10-31 · Fase 0 · Tests E2E con Playwright, accesibilidad axe, capturas y superación de Gate 0
- Qué: implementación de suite e2e/fase-0.spec.ts (consola limpia, persistencia de tema oscuro tras reload, auditoría a11y axe en claro y oscuro con 0 violaciones graves, navegación de las 23 rutas stub sin 404, y generación de 4 capturas visuales en escritorio y móvil). Ajustes de dimensiones explícitas en SVG y utilidades de accesibilidad en src/styles.css. Superación de todas las etapas de npm run verify y Gate 0.
- Por qué: requisito obligatorio de cierre de la Fase 0 (08-fases.md, Gate 0).
- Archivos: e2e/fase-0.spec.ts, e2e/screenshots/fase-0/*.png, .postcssrc.json, src/styles.css, src/app/shared/layout/header/header.component.ts, src/app/shared/layout/not-implemented-page/not-implemented-page.component.ts, src/app/shared/ui/button/button.component.ts.
- Verificación: npm run verify (9 etapas en verde: build:content, validate:content, typecheck, lint, check:tokens, check:boundaries, test con 7 unitarios, build y e2e con 5 tests Playwright pasando). Inspección visual de capturas aprobada.
- Pendiente / deuda: ninguna para la Fase 0. Siguiente fase: Fase 1 (Inventario del contenido legacy).

## C-0007 · 2026-10-31 · Fase 1 · Inventario de solo lectura del material legacy y registro de decisión D-004
- Qué: realización del inventario exhaustivo de _legacy/ (INVENTARIO_LEGACY.md). Descubrimiento de fuentes JSON limpias en Recurso Final Definitivo/content/ y contenido completo existente para el Examen 102. Registro formal de la decisión D-004 (Estrategia C híbrida, esquema JSON global de lecciones, auto-vinculación de glosario/comandos estilo Wikipedia, idioma 100% en español, estructura de 5 bloques por tema y Examen 102 en Fase 11).
- Por qué: requisito obligatorio de la Fase 1 y Gate 1 (08-fases.md).
- Archivos: docs/agent/INVENTARIO_LEGACY.md, docs/agent/DECISIONS.md.
- Verificación: auditoría de rutas y recuentos en _legacy/ completada; verificación de que _legacy/ permaneció 100% en modo solo lectura (git status limpio); Gate 1 superado.
- Pendiente / deuda: ninguna para la Fase 1. Siguiente fase: Fase 2 (Currículo, pipeline de contenido, dominio + tajada vertical 103.4).

## C-0008 · 2026-10-31 · Fase 2 · Modelos de dominio, esquemas Zod y currículo oficial LPIC-1
- Qué: definición completa de modelos TypeScript en src/app/core/models/ (curriculum, block con unión discriminada, slide con 9 layouts, lesson con esquema predefinido global para doble vista y Wikipedia-style refs, lab, question en español, command, glossary, errata, preferences, progress, attempt). Esquemas de validación Zod en src/app/core/schemas/. Currículo oficial en content-src/curriculum.yaml con los 10 temas y 42 subtemas exactos de 07-curriculo.md (pesos 60/60, omisión de 104.4, referencias a globalLabId y summarySubtopicId). Suite scripts/curriculum.spec.ts con 7 tests unitarios.
- Por qué: base de dominio y fuente de verdad para el pipeline de contenido y el Gate 2 (03-dominio.md, 07-curriculo.md, 08-fases.md, D-004).
- Archivos: content-src/curriculum.yaml, src/app/core/models/*.ts, src/app/core/schemas/*.ts, scripts/curriculum.spec.ts, tsconfig.scripts.json.
- Verificación: npm run typecheck (0 errores con TypeScript estricto), npm run test (13/13 tests pasando, incluidos los 7 tests de currículo), npm run lint, npm run check:tokens, npm run check:boundaries en verde.
- Pendiente / deuda: Tarea 2.2 (C-0009: PersistedStore, ClockService, PreferencesService, ProgressService y selectores puros de progreso).

## C-0009 · 2026-10-31 · Fase 2 · PersistedStore, servicios de estado y selectores puros de progreso
- Qué: implementación de ClockService inyectable, PersistedStore<T> con señal reactiva, debounce 300 ms en guardado, flush() y soporte de migración de esquema. Creación de PreferencesService y ProgressService conectados a PersistedStore y StorageService. Implementación de selectores puros en src/app/core/selectors/progress.selectors.ts (selectSubtopicProgress con cap 99/100, selectTopicProgress ponderado por minutos, selectExamProgress ponderado por peso LPI, selectNextRecommendedSubtopic priorizando subtemas en curso y selectWeakTopics). Suites de tests unitarios exhaustivos en persisted-store.spec.ts y progress.selectors.spec.ts.
- Por qué: requisitos de persistencia, reactividad y dominio para Gate 2 (03-dominio.md §3.3, 08-fases.md).
- Archivos: src/app/core/services/clock.service.ts, src/app/core/state/persisted-store.ts, src/app/core/services/preferences.service.ts, src/app/core/services/progress.service.ts, src/app/core/selectors/progress.selectors.ts, src/app/core/state/persisted-store.spec.ts, src/app/core/selectors/progress.selectors.spec.ts.
- Verificación: npm run typecheck (0 errores), npm run test (31/31 unit tests pasando, 12 en progress.selectors y 5 en persisted-store), npm run lint, check:tokens y check:boundaries en verde.
- Pendiente / deuda: Tarea 2.3 (C-0010: Pipeline de contenido build-content.ts, relleno determinista y ContentService).

## C-0010 · 2026-10-31 · Fase 2 · Pipeline de contenido build-content, relleno determinista y ContentService
- Qué: actualización completa de scripts/build-content.ts con validación Zod de currículo y recursos, generador determinista de lecciones de relleno (8 diapositivas con diversos layouts y bloques, webDocument estructurado y referencias wiki), prácticas de relleno de 5 pasos y preguntas de relleno en español. Cálculo dinámico de contadores en public/content/manifest.json. Implementación de ContentService en src/app/core/services/content.service.ts con carga perezosa y cacheada. Suites de tests unitarios en build-content.spec.ts y content.service.spec.ts.
- Por qué: requisitos de pipeline y arquitectura de contenido para Gate 2 (03-dominio.md §3.1, §3.3, 08-fases.md).
- Archivos: scripts/build-content.ts, scripts/build-content.spec.ts, src/app/core/services/content.service.ts, src/app/core/services/content.service.spec.ts.
- Verificación: npm run typecheck (0 errores), npm run test (35/35 tests unitarios en verde, incluidos los tests de validación y simulación de fallo con process.exit), npm run lint, check:tokens, check:boundaries y validate:content en verde.
- Pendiente / deuda: Tarea 2.4 (C-0011: Importador idempotente del subtema 103.4 de punta a punta con auto-vinculación estilo Wikipedia).

## C-0011 · 2026-10-31 · Fase 2 · Importador idempotente y tajada vertical real 103.4 de punta a punta
- Qué: implementación del importador reproducible e idempotente scripts/import-legacy/ (import-103-4.ts e index.ts). Importación completa de la tajada vertical del subtema 103.4: lección real con 19 diapositivas estructuradas, documento web continuo y referencias wiki en content-src/lessons/103.4.json; laboratorio práctico con 6 misiones guiadas en content-src/labs/103.4.yaml; 43 preguntas oficiales del Tema 103 con enunciados y opciones 100% en español y validadas con Zod en content-src/questions/103.yaml; 25 comandos catalogados en content-src/commands.yaml y 22 términos de glosario en content-src/glossary.yaml. Creación de MAPEO_LEGACY.md y COBERTURA_IMPORT.md. Suite de test scripts/import-idempotent.spec.ts verificando que la doble ejecución genera hashes de archivo idénticos.
- Por qué: requisito de tajada vertical, prueba de la estrategia D-004 e idempotencia para Gate 2 (08-fases.md, D-004, regla R11).
- Archivos: scripts/import-legacy/import-103-4.ts, scripts/import-legacy/index.ts, scripts/import-idempotent.spec.ts, content-src/lessons/103.4.json, content-src/labs/103.4.yaml, content-src/questions/103.yaml, content-src/commands.yaml, content-src/glossary.yaml, docs/agent/MAPEO_LEGACY.md, docs/agent/COBERTURA_IMPORT.md.
- Verificación: npm run import:legacy ejecutado con éxito, npm run typecheck (0 errores), npm run test (36/36 tests unitarios pasando, incluido el test de idempotencia con doble hash), npm run lint, check:tokens y check:boundaries en verde.
- Pendiente / deuda: Tarea 2.5 (C-0012: Verificación de Gate 2, pipeline npm run verify al 100%, etiqueta fase-2-ok y detención obligatoria).

## C-0012 · 2026-10-31 · Fase 2 · Verificación formal de Gate 2 y etiquetado fase-2-ok
- Qué: ejecución y superación formal de todos los criterios de Gate 2. Validación de las 9 etapas de npm run verify al 100% (build:content, validate:content, typecheck, lint, check:tokens, check:boundaries, test con 36 tests unitarios, build de producción y e2e con Playwright). Verificación de idoneidad del manifiesto (10 temas, 42 subtemas, pesos 60/60, títulos oficiales exactos, contadores derivados), cálculo de progreso por subtema/tema/examen, persistencia y migración en PersistedStore, fallback en memoria, idempotencia del importador comprobada y cero atajos prohibidos. Creación de la etiqueta git tag fase-2-ok.
- Por qué: finalización formal de la Fase 2 según docs/spec/08-fases.md y reglas R2, R3, R4.
- Archivos: docs/agent/CHANGELOG.md, docs/agent/STATUS.md, e2e/screenshots/fase-0/shell-desktop-dark.png.
- Verificación: npm run verify (9/9 etapas en verde), 36 tests unitarios pasando, auditoría de atajos prohibidos con 0 coincidencias, zonas protegidas intactas.
- Pendiente / deuda: ninguna para la Fase 2. Siguiente fase: Fase 3 (Sistema de diseño, primitivas de shared/ui y /guia-estilos).

## C-0013 · 2026-10-31 · Fase 3 · Primitivas Badge, Chip, Kbd, ProgressBar y StatCard
- Qué: implementación de primitivas de UI en src/app/shared/ui/: BadgeComponent (altura exacta 24 px h-[24px] min-h-[24px] max-h-[24px], 6 variantes, dot opcional), ChipComponent (altura 28 px, modo seleccionable y removible con eventos chipToggle y chipRemove), KbdComponent (tecla mono accesible), ProgressBarComponent (altura 6 px con atributos ARIA y variantes) y StatCardComponent (tarjeta de métricas con badge y etiqueta). Barrel export en src/app/shared/ui/index.ts. Suites de tests unitarios en badge.component.spec.ts y progress-bar.component.spec.ts.
- Por qué: requisitos de primitivas de diseño para Fase 3 (05-diseno.md, 08-fases.md, Gate 3).
- Archivos: src/app/shared/ui/badge/badge.component.ts, src/app/shared/ui/badge/badge.component.spec.ts, src/app/shared/ui/chip/chip.component.ts, src/app/shared/ui/kbd/kbd.component.ts, src/app/shared/ui/progress-bar/progress-bar.component.ts, src/app/shared/ui/progress-bar/progress-bar.component.spec.ts, src/app/shared/ui/stat-card/stat-card.component.ts, src/app/shared/ui/index.ts.
- Verificación: npm run typecheck (0 errores), npm run test (42/42 tests pasando, 26 Angular + 16 Vitest), npm run lint, check:tokens y check:boundaries en verde.
- Pendiente / deuda: Tarea 3.2 (C-0014: Primitivas Card, Callout, Tabs, CodeBlock y EmptyState).

## C-0014 · 2026-10-31 · Fase 3 · Primitivas Card, Callout, Tabs, CodeBlock y EmptyState
- Qué: implementación de primitivas de UI en `src/app/shared/ui/`: `CardComponent` (borde 1 px, radio 16, padding 24, variante interactiva con hover y soporte de teclado), `CalloutComponent` (barra lateral de 3 px, 5 tipos semánticos tip/info/warning/exam/danger y accesibilidad role alert/note), `TabsComponent` (subrayado activo de 2 px, contador badge opcional y roles tablist/tab), `CodeBlockComponent` (fuente mono, metadatos de archivo/lenguaje, botón de copiar accesible con feedback temporal y estilos semánticos) y `EmptyStateComponent` (icono centrado, H3, descripción y proyección de acciones). Barrel export actualizado en `src/app/shared/ui/index.ts`. Pruebas unitarias completas en `card.component.spec.ts`, `callout.component.spec.ts`, `tabs.component.spec.ts` y `code-block.component.spec.ts`.
- Por qué: especificación de componentes del sistema de diseño (05-diseno.md §5.3, §5.5, 08-fases.md).
- Archivos: src/app/shared/ui/card/card.component.ts, src/app/shared/ui/card/card.component.spec.ts, src/app/shared/ui/callout/callout.component.ts, src/app/shared/ui/callout/callout.component.spec.ts, src/app/shared/ui/tabs/tabs.component.ts, src/app/shared/ui/tabs/tabs.component.spec.ts, src/app/shared/ui/code-block/code-block.component.ts, src/app/shared/ui/code-block/code-block.component.spec.ts, src/app/shared/ui/empty-state/empty-state.component.ts, src/app/shared/ui/index.ts.
- Verificación: npm run typecheck (0 errores), npm run test (51/51 tests pasando, 35 Angular + 16 Vitest), npm run lint, check:tokens y check:boundaries en verde.
- Pendiente / deuda: Tarea 3.3 (C-0015: Primitivas de formulario Input/Select/Textarea, Dialog modal accesible y Skeleton).

## C-0015 · 2026-10-31 · Fase 3 · Formularios Input, Select, Textarea, Dialog modal accesible y Skeleton
- Qué: implementación de controles de formulario y modales en `src/app/shared/ui/`: `InputComponent` (altura 40 px, radio 12, foco con ring, estado de error con mensaje accesible y aria-invalid), `SelectComponent` (altura 40 px, radio 12, chevron integrado y opciones tipadas), `TextareaComponent` (radio 12, redimensionable verticalmente, estados reactivos), `DialogComponent` (modal accesible según spec con backdrop blur, botón accesible para cierre, tecla Escape mediante host listener `(window:keydown.escape)` y slots de título, cuerpo y acciones) y `SkeletonComponent` (animación de pulso, radios configurables y aria-hidden). Actualización de tokens con `--dialog-backdrop` en temas claro y oscuro. Suites de pruebas unitarias en `input.component.spec.ts`, `dialog.component.spec.ts` y `skeleton.component.spec.ts`.
- Por qué: especificación de componentes de interfaz y accesibilidad para Fase 3 (05-diseno.md §5.3, §5.5, 08-fases.md).
- Archivos: src/app/shared/ui/form/input.component.ts, src/app/shared/ui/form/input.component.spec.ts, src/app/shared/ui/form/select.component.ts, src/app/shared/ui/form/textarea.component.ts, src/app/shared/ui/dialog/dialog.component.ts, src/app/shared/ui/dialog/dialog.component.spec.ts, src/app/shared/ui/skeleton/skeleton.component.ts, src/app/shared/ui/skeleton/skeleton.component.spec.ts, src/app/shared/ui/index.ts, src/styles/themes.css.
- Verificación: npm run typecheck (0 errores), npm run test (59/59 tests pasando, 43 Angular + 16 Vitest), npm run lint (0 errores), check:tokens y check:boundaries en verde.
- Pendiente / deuda: Tarea 3.4 (C-0016: Página completa /guia-estilos y reemplazo del stub).

## C-0016 · 2026-10-31 · Fase 3 · Página /guia-estilos y reemplazo de stub
- Qué: implementación de la página `StyleGuidePageComponent` en `src/app/features/style-guide/pages/style-guide-page.component.ts`. Catálogo exhaustivo de diseño: tokens de color semántico con su propósito, escala tipográfica completa (Display a Caption), 6 variantes × 4 tamaños de `app-button` en todos sus estados (normal, deshabilitado y carga), badges de 24 px fijos con y sin dot, chips interactivos, kbd, tarjetas pasivas e interactivas con elevación, avisos callout de 5 tipos, tabs navegables con badges, bloque de código bash con botón de copiado, formularios con validación y errores accesibles, diálogo modal y métricas de estudio con StatCard y ProgressBar. Conexión de ruta perezosa en `src/app/app.routes.ts`, corrección de resolución relativa en `scripts/check-boundaries.ts`, y actualización de `scripts/check-stubs.ts` marcando `/guia-estilos` como implementada (los stubs pendientes bajan de 23 a 22). Pruebas unitarias en `style-guide-page.component.spec.ts`.
- Por qué: requisito de catálogo de diseño y reemplazo de stub para Fase 3 (05-diseno.md §5.5, 08-fases.md, Gate 3).
- Archivos: src/app/features/style-guide/pages/style-guide-page.component.ts, src/app/features/style-guide/pages/style-guide-page.component.spec.ts, src/app/app.routes.ts, scripts/check-stubs.ts, scripts/check-boundaries.ts.
- Verificación: npm run typecheck (0 errores), npm run test (62/62 tests pasando, 46 Angular + 16 Vitest), npm run lint (0 errores), check:tokens y check:boundaries en verde, check:stubs (22 pendientes, 1 implementada).
- Pendiente / deuda: Tarea 3.5 (C-0017: Suite E2E e2e/fase-3.spec.ts, capturas en claro/oscuro, auditoría Axe y Gate 3).

## C-0017 · 2026-10-31 · Fase 3 · Verificación formal de Gate 3, suite E2E y etiquetado fase-3-ok
- Qué: implementación de la suite de pruebas E2E `e2e/fase-3.spec.ts` con Playwright. Verificación exhaustiva de Gate 3: carga limpia de `/guia-estilos` sin errores en consola, renderizado completo de las 6 variantes × 4 tamaños de botón en todos sus estados, comprobación micrométrica en el DOM de que los badges miden exactamente 24 px de alto (`Math.round(box.height) === 24`), interacciones reactivas de pestañas, tarjetas y diálogos modales accesibles, auditoría de accesibilidad Axe en modo claro y en modo oscuro sin violaciones críticas ni serias (resuelto anidamiento interactivo en chips, ARIA controls en tabs y contrastes en tema oscuro), y generación de capturas de pantalla de alta fidelidad en `e2e/screenshots/fase-3/` revisadas visualmente. Pipeline completo `npm run verify` superado al 100% con sus 9 etapas en verde. Creación de la etiqueta git `fase-3-ok`.
- Por qué: finalización formal de la Fase 3 según docs/spec/05-diseno.md, docs/spec/08-fases.md y reglas R2, R4, R5.
- Archivos: e2e/fase-3.spec.ts, e2e/fase-0.spec.ts, e2e/screenshots/fase-3/, src/app/shared/ui/badge/badge.component.ts, src/app/shared/ui/chip/chip.component.ts, src/app/shared/ui/tabs/tabs.component.ts, src/app/shared/ui/button/button.component.ts, src/styles/themes.css, scripts/check-boundaries.ts, src/app/features/style-guide/pages/style-guide-page.component.ts.
- Verificación: npm run verify (9/9 etapas en verde: build:content, validate:content, typecheck, lint, check:tokens, check:boundaries, 62 tests unitarios, build y 11 tests e2e), auditoría Axe 100% limpia en temas claro y oscuro, cero atajos prohibidos.
- Pendiente / deuda: ninguna para la Fase 3. Siguiente fase: Fase 4 (Home y Temario).

## C-0018 · 2026-10-31 · Fase 4 · Componentes weight-meter, progress-ring y curriculum-tree-sidebar
- Qué: implementación de componentes transversales para el temario y layout en `src/app/shared/`: `WeightMeterComponent` (medidor gráfico de peso oficial LPI con barra 48×4 px y atributos ARIA de meter), `ProgressRingComponent` (anillo SVG circular de progreso de 96 px con trazo dinámico, porcentaje mono y clase de completitud al 100%), y `CurriculumTreeSidebarComponent` (árbol lateral de 280 px Examen → Tema → Subtema con códigos mono, títulos a 2 líneas sin elipsis arbitraria, resalte de subtema activo y check verde condicional que no se muestra con progreso vacío según Gate 4). Barrel exports actualizados en `src/app/shared/ui/index.ts`. Pruebas unitarias completas en `weight-meter.component.spec.ts`, `progress-ring.component.spec.ts` y `curriculum-tree.component.spec.ts`.
- Por qué: requisitos de visualización de progreso y navegación del temario para Fase 4 (06a-pantallas-base-y-estudio.md §6.1, §6.3, 08-fases.md).
- Archivos: src/app/shared/ui/weight-meter/weight-meter.component.ts, src/app/shared/ui/weight-meter/weight-meter.component.spec.ts, src/app/shared/ui/progress-ring/progress-ring.component.ts, src/app/shared/ui/progress-ring/progress-ring.component.spec.ts, src/app/shared/layout/curriculum-tree/curriculum-tree.component.ts, src/app/shared/layout/curriculum-tree/curriculum-tree.component.spec.ts, src/app/shared/ui/index.ts.
- Verificación: npm run typecheck (0 errores), npm run test (70/70 tests pasando, 54 Angular + 16 Vitest), npm run lint, check:tokens y check:boundaries en verde.
- Pendiente / deuda: Tarea 4.2 (C-0019: Página Home / con Hero dinámico, métricas del manifiesto, 6 herramientas, banda simulador y reemplazo del stub).


## C-0019 · 2026-10-31 · Fase 4 · Página Home / con Hero dinámico, métricas del manifiesto y FAQ en acordeón
- Qué: implementación de la página `HomePageComponent` en `src/app/features/home/pages/home-page.component.ts`. Hero con grid de 12 columnas (7:5 en desktop), CTAs primario y secundario reactivos al progreso del usuario (`Empezar por el Tema 101 →` o `Continuar...`), tarjeta de progreso con anillo de 96 px y barras de los exámenes 101 y 102. Franja de 5 métricas dinámicas 100% calculadas desde el manifiesto (diapositivas, subtemas, prácticas, comandos, términos) cumpliendo la regla R6. 3 pasos del método "Cómo funciona", 2 tarjetas de exámenes (101 disponible con 4 temas y 102 planificado), grid 3x2 de herramientas complementarias con badges informativos, banda oscura de entrenamiento de simulador con chips de filtro por tema y acordeón de 5 preguntas frecuentes accesible con teclado y lectores de pantalla. Conexión de ruta perezosa en `src/app/app.routes.ts` y actualización de `scripts/check-stubs.ts` marcando `/` como implementada (los stubs bajan de 22 a 21). Suite de pruebas unitarias en `home-page.component.spec.ts` verificando renderizado, estado con progreso vacío y con progreso previo, cálculo estricto de métricas del manifiesto y comportamiento del acordeón FAQ.
- Por qué: requisitos de la pantalla de inicio para la Fase 4 (06a-pantallas-base-y-estudio.md §6.1, 08-fases.md, reglas R1, R6).
- Archivos: src/app/features/home/pages/home-page.component.ts, src/app/features/home/pages/home-page.component.spec.ts, src/app/app.routes.ts, scripts/check-stubs.ts.
- Verificación: npm run typecheck (0 errores), npm run test (75/75 tests unitarios en verde, 59 Angular + 16 Vitest), npm run lint (0 errores), check:tokens, check:boundaries y check:stubs (21 pendientes, 2 implementadas).
- Pendiente / deuda: Tarea 4.3 (C-0020: Temario General /temario y por Examen /temario/:examen con CurriculumCardComponent y alturas igualadas).
