# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0067

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R2 (Herramientas de cobertura y validación, etiqueta `r2-R2-ok`).
- **Trabajo en curso**: Ninguno. Paso R2 completado con éxito.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Paso R3 · Enlaces tipo Wikipedia** (`/ejecutar-paso-r2 R3` en conversación nueva).

## Ronda 2 · Pasos de Herramientas
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia | pendiente |
| R4 | Pestaña Practica lo aprendido | pendiente |
| R5 | Flashcards masivas | pendiente |
| R6 | Simulador examen 102 | pendiente |
| R7 | Mapa mental interactivo y robusto | pendiente |

## Estadísticas de Extracción Oficial 102 (Gate R1)
- **Manual oficial**: `_legacy/Recurso Final Definitivo/LPI-Learning-Material-102-500-es.pdf` (594 páginas)
- **Unidades atómicas extraídas**: 9,405 (`units.json`, deterministas)
- **Objetivos analizados**: 19 / 19 (pesos 100% coincidentes con `07-curriculo.md`)
- **Contabilidad de caracteres**: 100.0% en las 594 páginas (0 páginas por debajo del 99.5%)
- **Figuras técnicas extraídas**: 4 PNGs nativos con leyendas y accesibilidad
- **Visor interactivo**: `content-src/_extract/102-500/extract-overview.html` y reporte `extraction-report.md`

## Herramientas de Cobertura y Validación (Gate R2)
- **Suite de pruebas**: `scripts/coverage.spec.ts` (14/14 tests Vitest pasando).
- **Herramientas CLI**: `verify:coverage`, `report:coverage`, `progress:r2`, `validation:register`, `verify:validations`.
- **Integridad**: `verify:validations` integrado como etapa oficial en `npm run verify`.
- **Pipeline general**: `npm run verify` verde (9/9 etapas, 75 E2E pasando).
- **Pruebas pendientes Ronda 2**: `npm run e2e:pendientes` (5 fallos esperados verificados).

## Comandos útiles
- `npm run verify:coverage -- <id>`: evalúa las 10 reglas de cobertura del subtema.
- `npm run report:coverage -- <id>`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run validation:register -- <id>`: registra hash SHA-256 en `validaciones.json`.
- `npm run verify:validations`: comprueba la integridad criptográfica de subtemas validados.
- `npm run verify`: pipeline completo de 9 etapas en verde (75 E2E specs + 19 scripts specs).
- `npm run e2e:pendientes`: ejecución de los 5 tests de fallos F1-F6 (en rojo).
