---
name: limpiar-repo
description: Audita y limpia el repositorio LPIC-1 de ficheros residuales, duplicados, artefactos de build y código muerto, con lista de protegidos, cuarentena reversible y aprobación del usuario. Úsala con "/limpiar-repo" cuando se pida ordenar el repo.
---

# /limpiar-repo

Objetivo: dejar solo (1) código de la app, (2) contenido fuente, (3) skills/reglas/docs del agente y (4) configuración. **Nada se borra sin tu aprobación, y todo es reversible** (rama + cuarentena + commits pequeños).

## Zona PROTEGIDA (nunca tocar sin orden explícita)
`src/`, `public/`, `content-src/`, `scripts/`, `e2e/`, `docs/`, `.agents/`, `AGENTS.md`, `README.md`, `.vscode/` (solo si está versionado y es útil), archivos de configuración raíz (`package.json`, `package-lock.json`, `angular.json`, `tsconfig*.json`, `eslint.config.js`, `playwright.config.ts`, `vitest.config.ts`, `postcss*`, `.editorconfig`, `.gitattributes`, `.gitignore`).
**`_legacy/` es intocable hasta cerrar la Ronda 2** (contiene el PDF oficial y las fuentes del legacy). `reference/` (prototipo v0, solo referencia visual) se conserva hasta RF salvo que el usuario diga otra cosa. Si `docs/agent/PROGRESO_R2.md` indica que RF no está hecho, mantén ambos.

## Fase 0 · Preparación (sin cambios)
1. `git status`: si hay cambios sin commitear, para y pide que se confirmen o guarden. Crea rama `chore/limpieza-repo`.
2. Anota tamaño y nº de archivos por carpeta de primer nivel (PowerShell: `Get-ChildItem -Directory | ForEach-Object { ... }`, o un script Node en `scripts/`), y `git ls-files | wc` equivalente con `git ls-files | Measure-Object`.

## Fase 1 · Inventario (solo lectura) → `docs/agent/LIMPIEZA.md`
Clasifica TODO lo de primer nivel y lo que cuelgue sospechoso, en una tabla `ruta · tamaño · ¿versionado? · categoría · propuesta · motivo`. Categorías:
- **A. Artefactos generados** (deben estar en `.gitignore` y fuera del índice): `dist/`, `.angular/`, `node_modules/`, `test-results/`, `playwright-report/`, `coverage/`, `*.tsbuildinfo`, capturas temporales, `content-src/_extract/`, `docs/agent/cobertura/`, `.venv-extract/`.
  Detecta los que están versionados: `git ls-files dist .angular test-results node_modules` y propón `git rm -r --cached` + añadir al `.gitignore`.
- **B. Duplicados o restos de instalación**: carpetas como `round_2/` u otras copias de paquetes descomprimidos, `*.zip`, `*(1)*`, `copia`, `old`, `backup`, `tmp`, `.bak`, `.orig`. **Compara con diff** contra el original antes de proponer borrar; si tiene algo que no está en su sitio real, propón fusionarlo, no borrarlo.
- **C. Código muerto**: archivos no importados, exports sin uso y dependencias sin uso. Usa `npx knip` (o `depcheck` + `ts-prune` si knip no encaja) y revisa cada hallazgo a mano (rutas dinámicas, componentes cargados por router, scripts de `package.json`, e2e). Los falsos positivos se anotan, no se borran.
- **D. Documentación obsoleta o repetida**: markdowns de prompts antiguos, planes ya cumplidos (el histórico vive en CHANGELOG), READMEs vacíos. Propón archivar o borrar solo si su contenido ya está en `docs/spec` o `docs/agent`.
- **E. Contenido huérfano**: entradas en `content-src/` o `public/content` no referenciadas por el índice o el build; imágenes/figuras sin uso (`grep` por nombre).
- **F. Scripts**: `scripts/` que no estén en `package.json` ni documentados, scripts experimentales, scripts del legacy copiados.
- **G. Raíz desordenada**: archivos sueltos que deberían estar en `docs/`, `scripts/` o `e2e/`.
Cada fila trae **evidencia** (salida de comando o búsqueda). Sin evidencia → "dudoso: preguntar".

## Fase 2 · Plan y APROBACIÓN
Presenta el plan agrupado por categoría con tamaño ahorrado y riesgo (bajo/medio/alto). **Detente** y espera que el usuario conteste por categoría: `aprobado A`, `aprobado B salvo X`, etc. Lo "dudoso" no se toca sin respuesta explícita.

## Fase 3 · Ejecución reversible
Para cada categoría aprobada, un commit propio:
1. Artefactos ya versionados: `git rm -r --cached <ruta>` + entradas en `.gitignore`. (Las carpetas locales se pueden borrar a mano o con `Remove-Item` en PowerShell solo si el usuario lo aprueba; se regeneran con `npm run build`.)
2. Resto de archivos aprobados: **muévelos con `git mv` a `_to_delete/<categoría>/`** (carpeta ignorada o no, según el usuario) en vez de borrar. Tras la verificación de abajo, el usuario decide si se elimina `_to_delete/` definitivamente.
3. Código muerto: elimina en commits pequeños, un grupo por commit, ejecutando `npm run typecheck` y `npm test` entre grupos.

## Fase 4 · Verificación (obligatoria)
`npm ci` (o `npm install`) limpio, `npm run verify` completo, `npm run build`, `npm run e2e`. Todo en verde, igual que antes de empezar (compara con la línea base de la Fase 0; ejecútala antes si no existe). Revisa que `_legacy/`, `reference/` y la zona protegida no cambiaron (`git diff --stat main...`). Si algo falla, revierte el último commit y anota el motivo.

## Fase 5 · Cierre
Actualiza `docs/agent/LIMPIEZA.md` (qué se eliminó, qué se archivó, cifras antes/después), `.gitignore` y, si procede, una sección "Estructura del repo" en `README.md`. `/cerrar-sesion`. Informa de tamaño y nº de archivos antes/después y de lo que queda en `_to_delete/`. **No hagas push ni fusiones la rama:** lo decide el usuario.

## Prohibido
Borrar con `rm -rf`/`Remove-Item -Recurse` algo versionado sin pasar por git; tocar la zona protegida; eliminar algo "porque parece viejo" sin evidencia; reescribir historial; modificar `docs/agent/CHANGELOG.md` salvo añadir la entrada nueva.
