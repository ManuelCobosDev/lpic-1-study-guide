# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0066

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R1 (Extracción completa del PDF 102, etiqueta `r2-R1-ok`).
- **Trabajo en curso**: Ninguno. Paso R1 completado con éxito.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Paso R2 · Herramientas de cobertura y validación** (`/ejecutar-paso-r2 R2` en conversación nueva).

## Ronda 2 · Pasos de Herramientas
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | pendiente |
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

## Comandos útiles
- `npm run extract:pdf`: ejecuta el extractor determinista en Python con PyMuPDF.
- `npm run verify`: pipeline completo de 9 etapas en verde (75 E2E specs + 18 scripts specs).
- `npm run e2e:pendientes`: ejecución de los 5 tests de fallos F1-F6 (en rojo).
