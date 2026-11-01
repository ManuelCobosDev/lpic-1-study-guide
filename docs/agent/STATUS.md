# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0065

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R0 (Diagnóstico y línea base, etiqueta `r2-R0-ok`).
- **Trabajo en curso**: Ninguno. Paso R0 completado con éxito.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Paso R1 · Extracción completa del PDF 102** (`/ejecutar-paso-r2 R1` en conversación nueva).

## Ronda 2 · Pasos de Herramientas
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | pendiente |
| R2 | Herramientas de cobertura y validación | pendiente |
| R3 | Enlaces tipo Wikipedia | pendiente |
| R4 | Pestaña Practica lo aprendido | pendiente |
| R5 | Flashcards masivas | pendiente |
| R6 | Simulador examen 102 | pendiente |
| R7 | Mapa mental interactivo y robusto | pendiente |

## Estadísticas del Manifiesto Oficial (Línea Base R0)
- **Subtemas oficiales disponibles**: 42 / 42 (Examen 101: 23, Examen 102: 19)
- **Diapositivas reales**: 770 (0 placeholders)
- **Laboratorios con misiones paso a paso**: 42 (131 misiones reales para Debian 12)
- **Banco de preguntas oficial**: 240 (120 del Examen 101, 120 del Examen 102)
- **Catálogo de comandos**: 193
- **Términos de glosario técnico**: 230
- **Nodos del mapa mental**: 55 (1 raíz + 2 exámenes + 10 temas + 42 subtemas)
- **Tests pendientes Ronda 2**: 5 specs en rojo funcional (`e2e/ronda2/pendientes/`)

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (75 E2E specs + 17 scripts specs).
- `npm run e2e:pendientes`: ejecución de los 5 tests de fallos F1-F6 (en rojo).
- `npm run preview`: servidor estático local de producción.
