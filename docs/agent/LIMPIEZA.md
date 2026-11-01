# Informe de Limpieza del Repositorio · Fase 5 (Cierre)

> Realizado mediante la skill `/limpiar-repo` en la rama `chore/limpieza-repo`.  
> Tras la verificación del pipeline y la aprobación definitiva del usuario, la cuarentena `_to_delete/` ha sido eliminada por completo de Git y del sistema de archivos.

---

## 1. Métricas Cuantitativas: Antes vs. Después

| Métrica | Antes (Línea Base Fase 0) | Después (Cierre Limpieza) | Variación / Ahorro |
|---|---|---|---|
| **Rama de trabajo** | `development` | `chore/limpieza-repo` | Rama aislada lista para merge |
| **Archivos en Git (`git ls-files`)** | 628 | 602 | **-26 archivos eliminados (-4.1%)** |
| **Tamaño `node_modules/`** | 364.16 MB | 305.73 MB | **-58.43 MB (-16.0%)** |
| **Dependencias `package.json`** | 16 prod / 29 dev | 12 prod / 29 dev | **-5 sin uso / +1 explícita** |
| **Artefactos locales (`dist/`, `.angular/`, `test-results/`)** | ~14.13 MB | 0 B (limpios; regenerables) | **-14.13 MB** |
| **Pipeline `npm run verify` (10 etapas)** | 10/10 PASS | 10/10 PASS | **100% verde (0 regresiones)** |
| **Pruebas unitarias Karma** | 389 pasadas (70 archivos) | 389 pasadas (70 archivos) | 100% verde |
| **Pruebas unitarias Vitest** | 46 pasadas (10 archivos) | 46 pasadas (10 archivos) | 100% verde |
| **Pruebas E2E Playwright** | 98 pasadas | 98 pasadas | 100% verde |

---

## 2. Resumen de Acciones Ejecutadas

### Lote 1 · Restos y Duplicados Clientes (Categoría B)
- **20 ficheros redundantes** en `round_2/` eliminados definitivamente (19 eran 100% idénticos a ficheros en `.agents/` y `docs/`; 1 era una plantilla vacía superada de `PROGRESO_R2.md`).
- **Carpeta vacía local** `lpic1-limpieza-pack/` eliminada.
- **Laboratorio 103.4 unificado**: las 6 misiones de `content-src/labs/103.4.yaml` se consolidaron en `content-src/labs/103.4.json`, homogeneizando todos los 42 laboratorios del proyecto al formato `.json` canónico. El archivo redundante `.yaml` fue eliminado.

### Lote 2 · Código Muerto en SPA y Scripts (Categoría C)
- **`scripts/import-legacy/import-103-4.ts`**: eliminado (script preliminar de importación de la Fase 2, sustituido en Fase 11).
- **`src/app/app.css` (0 B)** y **`src/app/app.html` (stub router-outlet)**: eliminados de Git.
- **`src/app/shared/ui/term-link/`**: eliminado (componente no utilizado; los enlaces de glosario y Wikipedia se inyectan dinámicamente vía `markdown.engine.ts` con delegación de eventos).
- **`src/app/shared/ui/index.ts`**: re-export huérfano limpiado.
- **`.postcssrc.json`**: eliminado (duplicado redundante de `postcss.config.js`).

### Lote 3 · Dependencias en `package.json` (Categoría C)
- **Desinstaladas 5 dependencias sin uso alguno**:
  - `@angular/cdk` (0 referencias en el proyecto)
  - `highlight.js` (0 referencias; formateo de código nativo bash)
  - `lucide-angular` (0 referencias; iconos SVG puros inline)
  - `marked` (0 referencias; motor propio `parseInlineMarkdown` + `DOMPurify`)
  - `@types/dompurify` (redundante; `dompurify` trae sus propios tipos)
- **Añadida dependencia directa**: `d3-selection` + `@types/d3-selection` requerida por `mind-map-page.component.ts`.

### Lote 4 · Artefactos Locales (Categoría A)
- Purgados directorios locales regenerables: `dist/`, `.angular/cache/`, `test-results/` y `scripts/extract-pdf/__pycache__/`.
- Añadido `/_to_delete/` a `.gitignore` para prevenir cualquier almacenamiento accidental de cuarentena.

---

## 3. Estado Final del Repositorio

El repositorio queda únicamente con lo esencial:
1. **`src/`**: Aplicación Angular SPA por capas (core, shared, features).
2. **`content-src/`**: Fuente de verdad canónica del currículo (42 lecciones JSON, 42 laboratorios JSON, preguntas JSON, ejercicios YAML, comandos YAML, glosario YAML).
3. **`public/`**: Activos web estáticos esenciales (`favicon.ico`). El contenido derivado `public/content/` se compila bajo demanda con `npm run build:content`.
4. **`e2e/`**: Suites completas de pruebas Playwright y capturas de evidencia de calidad.
5. **`scripts/`**: Toolchain TypeScript reproducible (compilador de contenido, verificador de fronteras, linters y auditoría de cobertura).
6. **`docs/`**: Especificaciones canónicas (00-14) y memoria técnica del proyecto.
7. **`.agents/` & `AGENTS.md`**: Reglas y skills operativas del asistente.
8. **Configuración raíz**: `package.json`, `angular.json`, `tsconfig*.json`, linters y `.gitignore`.

Zonas protegidas verificadas:
- `_legacy/` se mantuvo **100% INTACTO**.
- `reference/` se mantuvo **100% INTACTO**.
- `docs/spec/` se mantuvo **100% INTACTO**.
