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
