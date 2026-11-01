---
name: verificar-gate
description: Verifica de forma objetiva que una fase del proyecto LPIC-1 está terminada. Ejecuta npm run verify, los e2e de la fase, genera capturas, las revisa visualmente y busca atajos prohibidos. Úsala al final de cada fase o cuando el usuario pida comprobar que algo funciona de verdad.
---

# /verificar-gate N | R0…R7 | S-<id> | RF

Un gate no es una opinión: es un conjunto de comandos con resultado. Nunca marques PASS sin haber ejecutado el comando en esta sesión.

## Pasos
1. Lee los criterios exactos: para una fase numérica, el bloque "Gate N" de `docs/spec/08-fases.md`; para ids que empiezan por `R` o `S-`, el bloque del paso en `docs/spec/10-ronda2-plan.md` y los criterios del spec que cite (11–14). En pasos de la Ronda 2 añade siempre `npm run verify:validations`, `npm run e2e:pendientes` (los tests del paso ya movidos a `e2e/ronda2/` deben pasar en `verify`) y, si es un subtema, `npm run verify:coverage -- <id>` y la comprobación de `validaciones.json` y de la auditoría.
2. Ejecuta `npm run verify` y registra cada etapa (build:content, validate:content, typecheck, lint, check:tokens, check:boundaries, test, build, e2e) con su resultado. Si un script no existe todavía, es **FALLO** ("no implementado").
3. Ejecuta los e2e específicos del gate (`e2e/fase-N.spec.ts`, `e2e/ronda2/…` o el que corresponda). Si el e2e del criterio no existe, **escríbelo ahora**; un criterio sin test no está verificado.
4. Genera capturas en `e2e/screenshots/fase-N/`: claro y oscuro, escritorio 1440 y móvil 390, de cada pantalla tocada en la fase.
5. **Mira las capturas** (abre las imágenes). Anota defectos visuales: elementos deformados (badges, píldoras), desalineaciones entre breadcrumbs y contenido, títulos truncados, desbordes horizontales, texto ilegible en oscuro.
6. Búsqueda de atajos prohibidos en `src/` y configuración (anota cada coincidencia con archivo y línea): `@ts-ignore`, `: any`, `as any`, `eslint-disable`, `skipLibCheck`, `ignoreBuildErrors`, colores `#hex`/`rgb(` fuera de `tokens.css` y `themes.css`, `localStorage` fuera de `storage.service.ts`, `console.log` olvidados.
7. `npm run check:stubs` y compara con la tabla de `STATUS.md`.
8. Comprueba que no se modificó `_legacy/`, `reference/`, `.agents/` ni `docs/spec/` (`git diff --stat` contra la etiqueta anterior).

## Informe (tabla)
| Comprobación | Resultado (PASS/FAIL) | Evidencia |
|---|---|---|
Una fila por etapa de `verify`, por criterio del gate, por revisión visual, por búsqueda de atajos y por zona protegida. Debajo: lista de defectos visuales y deuda conocida. **Si hay algún FAIL, el gate no se supera**: dilo y propón la corrección.
