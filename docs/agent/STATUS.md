# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0060

## Estado
- **Fase actual**: Fase 11 (Importación completa del legacy) EN CURSO.
- **Último gate superado**: Gate 10 (etiqueta `fase-10-ok`).
- **Trabajo en curso**: Tarea 11.5 (Orquestador global `npm run import:legacy`, MAPEO_LEGACY.md y verificación de idempotencia).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 11.5: Actualizar `scripts/import-legacy/index.ts` para orquestar la importación completa (lecciones, labs, preguntas, comandos y glosario) y asegurar que `npm run import:legacy` sea 100% re-ejecutable e idempotente.
2. Actualizar `docs/agent/MAPEO_LEGACY.md`.
3. Ejecutar test de idempotencia y verificar que git status permanece limpio tras re-ejecución.

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
| 11 | Importación completa del legacy | en curso (Tareas 11.1 a 11.4 listas · 100% contenido real) |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| Ninguna (0 stubs pendientes · 23 de 23 rutas implementadas) | Todas completadas |

## Comandos útiles
- `npm run build:content`: genera manifiesto (770 slides, 42 labs, 240 preguntas, 146 comandos, 230 términos).
- `npm run import:legacy`: orquestador de importación completa.
- `npm run verify`: pipeline completo de 9 etapas en verde.

## Deuda conocida
Ninguna.
