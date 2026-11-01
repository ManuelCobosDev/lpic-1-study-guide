# Informe de Limpieza del Repositorio · Fase 5 (Cierre)

> Realizado mediante la skill `/limpiar-repo` en la rama `chore/limpieza-repo`.  
> Todo el proceso se ejecutó de forma reversible con commits atómicos por categoría y cuarentena en `_to_delete/`.

---

## 1. Métricas Cuantitativas: Antes vs. Después

| Métrica | Antes (Línea Base Fase 0) | Después (Fase 4 Verificación) | Variación / Ahorro |
|---|---|---|---|
| **Rama activa** | `development` | `chore/limpieza-repo` | Rama aislada de trabajo |
| **Archivos en Git (`git ls-files`)** | 628 | 628 (25 en `_to_delete/` -> 603 útiles) | -25 archivos útiles fuera de cuarentena |
| **Tamaño `node_modules/`** | 364.16 MB | 305.73 MB | **-58.43 MB (-16.0%)** |
| **Dependencias `package.json`** | 16 prod / 29 dev | 12 prod / 29 dev | -5 dependencias obsoletas, +1 directa explícita |
| **Artefactos locales (`dist/`, `.angular/`, `test-results/`)** | ~14.13 MB | 0 B (limpiados; regenerables) | **-14.13 MB** |
| **Pipeline `npm run verify` (10 etapas)** | 10/10 PASS | 10/10 PASS | **100% verde (0 regresiones)** |
| **Pruebas unitarias Karma** | 389 pasadas (70 archivos) | 389 pasadas (70 archivos) | 100% verde |
| **Pruebas unitarias Vitest** | 46 pasadas (10 archivos) | 46 pasadas (10 archivos) | 100% verde |
| **Pruebas E2E Playwright** | 98 pasadas | 98 pasadas | 100% verde |

---

## 2. Resumen de Acciones Ejecutadas por Lote

### Lote 1 · Restos y Duplicados Clientes (Categoría B)
- **Commit `37eebcf`**: `chore(clean): mover duplicados de categoria B a _to_delete`
  - Movidos 20 ficheros de `round_2/` a `_to_delete/categoria-b/round_2/` (19 eran 100% idénticos a ficheros en `.agents/` y `docs/`; 1 era una plantilla vacía superada de `PROGRESO_R2.md`).
  - Borrada carpeta vacía no rastreada `lpic1-limpieza-pack/`.
  - Movido `content-src/labs/103.4.yaml` a `_to_delete/categoria-b/103.4.yaml`.
- **Commit `3308327`**: `chore(clean): unificar laboratorio 103.4 en formato json canonico con 6 misiones`
  - Unificadas las 6 misiones de `103.4.yaml` en `content-src/labs/103.4.json` (convirtiendo los 42 laboratorios al estándar `.json` homogéneo y resolviendo la suite `e2e/fase-7.spec.ts`).

### Lote 2 · Código Muerto en SPA y Scripts (Categoría C)
- **Commit `d37eb48`**: `chore(clean): mover codigo muerto de categoria C a _to_delete`
  - Movido `scripts/import-legacy/import-103-4.ts` a `_to_delete/categoria-c/import-103-4.ts` (código de importación preliminar de Fase 2, sustituido en Fase 11).
  - Eliminados `src/app/app.css` (0 bytes) y `src/app/app.html` (stub `router-outlet` no utilizado).
  - Movido `src/app/shared/ui/term-link/` a `_to_delete/categoria-c/term-link/` (componente descartado; los enlaces de glosario y Wikipedia se inyectan dinámicamente vía `markdown.engine.ts` con delegación de eventos).
  - Eliminado export huérfano en `src/app/shared/ui/index.ts`.

### Lote 3 · Dependencias en `package.json` (Categoría C)
- **Commit `7c48a32`**: `chore(deps): depurar dependencias sin uso y agregar d3-selection`
  - Desinstaladas 5 dependencias sin uso alguno en el código:
    - `@angular/cdk` (0 referencias en el proyecto)
    - `highlight.js` (0 referencias; formateo de código nativo bash)
    - `lucide-angular` (0 referencias; iconos SVG puros inline)
    - `marked` (0 referencias; motor propio `parseInlineMarkdown` + `DOMPurify`)
    - `@types/dompurify` (redundante; `dompurify` trae sus propios tipos)
  - Añadida dependencia directa `d3-selection` + `@types/d3-selection` requerida por `mind-map-page.component.ts`.

### Lote 4 · Artefactos Locales (Categoría A)
- Purgados directorios locales regenerables: `dist/`, `.angular/cache/`, `test-results/` y `scripts/extract-pdf/__pycache__/`.

---

## 3. Estado de la Cuarentena Reversible (`_to_delete/`)

La carpeta `_to_delete/` contiene exactamente 25 archivos preservados bajo control de Git en la rama `chore/limpieza-repo`:

```
_to_delete/
├── categoria-b/
│   ├── 103.4.yaml (fusionado con 103.4.json)
│   └── round_2/ (20 archivos duplicados del paquete de Ronda 2)
└── categoria-c/
    ├── app.css (0 bytes)
    ├── app.html (18 bytes)
    ├── import-103-4.ts (script de importación legacy reemplazado)
    └── term-link/
        └── term-link.component.ts (componente no utilizado)
```

> **Decisión pendiente del usuario**:
> 1. Si se desea eliminar permanentemente: ejecutar `git rm -r _to_delete` y hacer commit.
> 2. Si se desea mantener la rama como historial de limpieza antes de fusionar en `development`: se puede fusionar con `git merge chore/limpieza-repo` en `development`.
> 3. En ningún caso se realiza `push` ni `merge` sin orden explícita.

---

## 4. Zonas Protegidas

Se verificó mediante `git diff --stat development...HEAD` que:
- `_legacy/` se mantuvo **100% INTACTO**.
- `reference/` se mantuvo **100% INTACTO**.
- Las specs funcionales en `docs/spec/` se mantuvieron **100% INTACTAS**.
