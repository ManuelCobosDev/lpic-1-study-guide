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
