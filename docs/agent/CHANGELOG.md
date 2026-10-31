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
