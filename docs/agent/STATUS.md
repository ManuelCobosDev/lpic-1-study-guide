# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0058

## Estado
- **Fase actual**: Fase 11 (Importación completa del legacy) EN CURSO.
- **Último gate superado**: Gate 10 (etiqueta `fase-10-ok`).
- **Trabajo en curso**: Tarea 11.3 (Importación del banco de 240 preguntas del simulador para Exámenes 101 y 102).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 11.3: Implementar `scripts/import-legacy/import-questions.ts` para importar y normalizar las 120 preguntas de `preguntas_101.json` y 120 preguntas de `preguntas_102.json` hacia `content-src/questions/tema-XXX.json` (Temas 101 a 110), validando con `QuestionListSchema`.
2. Ejecutar `npm run build:content` y verificar `totalQuestionsReal = 240`.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | completada (Gate 4 OK) |
| 5 | Lecciones y Estudiar | completada (Gate 5 OK) |
| 6 | Buscador | completada (Gate 6 OK) |
| 7 | Laboratorios | completada (Gate 7 OK) |
| 8 | Simulador | completada (Gate 8 OK) |
| 9 | Comandos, Glosario y Flashcards | completada (Gate 9 OK) |
| 10 | Herramientas complementarias, Ajustes, Progreso, Mapa mental | completada (Gate 10 OK) |
| 11 | Importación completa del legacy | en curso (Tareas 11.1 y 11.2 listas · 42 lecciones y 42 labs reales) |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| Ninguna (0 stubs pendientes · 23 de 23 rutas implementadas) | Todas completadas |

## Comandos útiles
- `npm run build:content`: genera manifiesto y valida contenido (770 slides reales, 42 labs reales).
- `npx tsx scripts/import-legacy/import-lessons.ts`: importa las 42 lecciones.
- `npx tsx scripts/import-legacy/import-labs.ts`: importa los 42 laboratorios.
- `npm run verify`: pipeline completo de 9 etapas en verde.

## Deuda conocida
Ninguna.
