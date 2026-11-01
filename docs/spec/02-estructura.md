# 2. ESTRUCTURA DE DIRECTORIOS (créala exactamente así)

```
lpic-1-study-guide/
├─ AGENTS.md                       ← punto de entrada del agente (corto)
├─ .agents/rules/ · .agents/skills/ ← reglas y procedimientos del agente (ya existen; no tocar sin pedirlo)
├─ _legacy/                        ← SOLO LECTURA · material antiguo copiado por el usuario · en .gitignore
├─ angular.json · package.json · tsconfig*.json · eslint.config.js · playwright.config.ts
├─ reference/                      ← SOLO LECTURA (prototipo v0 y capturas) · en .gitignore salvo las capturas
├─ docs/
│  ├─ agent/   STATUS.md · CHANGELOG.md · DECISIONS.md · BACKLOG.md (+ INVENTARIO_LEGACY.md, MAPEO_LEGACY.md, COBERTURA_IMPORT.md cuando existan)
│  ├─ spec/    especificación (ya existe)
│  ├─ ARCHITECTURE.md · DESIGN_SYSTEM.md · CONTENT_GUIDE.md · DEPLOY.md
├─ scripts/
│  ├─ build-content.ts             ← lee content-src → valida (zod) → genera public/content/**
│  ├─ new-subtopic.ts              ← plantilla de subtema nuevo
│  ├─ import-legacy/               ← importadores idempotentes _legacy → content-src (Node/TS)
│  ├─ check-stubs.ts               ← lista las páginas aún no implementadas (Fase final: debe haber 0)
│  ├─ check-tokens.ts              ← falla si hay colores literales fuera de tokens
│  ├─ check-boundaries.ts          ← falla si se rompen las fronteras de importación
│  └─ postbuild.ts
├─ content-src/                    ← LO ÚNICO QUE EDITA EL AUTOR
│  ├─ curriculum.yaml              ← exámenes, temas, subtemas, pesos (sección 7)
│  ├─ lessons/103.4.md             ← una lección por subtema (formato sección 4)
│  ├─ labs/103.4.yaml              ← una práctica por subtema + global-101..104.yaml
│  ├─ questions/103.yaml           ← preguntas por tema
│  ├─ commands.yaml · glossary.yaml · errata.yaml
├─ public/
│  ├─ content/                     ← GENERADO (manifest.json, search-index.json, lessons/*.json…) · en .gitignore
│  └─ content-assets/<subtema>/…   ← imágenes y PDFs opcionales por subtema
├─ e2e/                            ← *.spec.ts de Playwright y screenshots/fase-N/
└─ src/
   ├─ main.ts · index.html · styles.css
   ├─ styles/ tokens.css · themes.css · typography.css · slides.css · print.css
   └─ app/
      ├─ app.ts · app.config.ts · app.routes.ts
      ├─ core/
      │  ├─ models/     *.model.ts (curriculum, lesson, slide, block, diagram, lab, question, command, glossary, errata, attempt, flashcard, activity, preferences, search-doc, backup)
      │  ├─ schemas/    *.schema.ts (zod; los usa build-content y el importador de backups)
      │  ├─ services/   content · progress · labs · simulator · flashcards · activity · notes · preferences · search · backup · storage · clock · theme · shortcuts · announcer
      │  ├─ state/      persisted-store.ts (helper: signal + persistencia versionada)
      │  ├─ engines/    diagram/ · search/ · scoring/ · leitner/ · markdown/ (puros, sin Angular)
      │  ├─ selectors/  funciones puras de progreso (porcentajes, siguiente subtema, temas débiles)
      │  ├─ guards/ · resolvers/ · config/ (site, routes meta, navigation) · i18n/es.ts
      ├─ shared/
      │  ├─ ui/         button · badge · chip · card · input · select · textarea · tabs · segmented-control · dialog · sheet · tooltip · toast · progress-bar · progress-ring · skeleton · accordion · menu · kbd · empty-state · stat-card · code-block · callout · data-table · pagination · icon · container
      │  ├─ layout/     app-shell · header · sidebar-tree · mobile-nav · footer · breadcrumbs · page-header
      │  ├─ diagram/    diagram-view (renderiza DiagramScene en SVG)
      │  ├─ directives/ · pipes/ · utils/
      └─ features/
         ├─ home · curriculum · study · labs · simulator · commands · glossary · flashcards · mindmap · search · progress · errata · settings · about · design-system
         └─ (cada una: pages/ · components/ · <feature>.routes.ts)
```

## 2.1 Fronteras de importación (las hace cumplir `check:boundaries` y ESLint)
- `core/engines/**` y `core/selectors/**`: TypeScript puro; no importan `@angular/*`.
- `core` no importa de `shared` ni de `features`.
- `shared` no importa de `features`; solo de `core/models` y `core/utils`.
- Una feature no importa de otra feature (si necesitan compartir algo, va a `shared` o `core`).
- Solo `core/services/storage.service.ts` toca `localStorage`.
- Las páginas (`pages/`) orquestan servicios; los componentes (`components/` y `shared/`) reciben `input()` y emiten `output()`, sin inyectar servicios de dominio.

## 2.2 Estilo de código Angular
Un componente por archivo con su plantilla y sus estilos, nombres según el generador de la CLI de la versión instalada, aplicados con coherencia. Selectores con prefijo `app-`. Plantillas externas a partir de ~15 líneas. Sin lógica pesada en plantillas (usar `computed`). `track` obligatorio en `@for`. Nada de `any`, nada de `ViewChild` sin necesidad (preferir señales de consulta). `host: {}` en vez de `@HostBinding/@HostListener`.

---
