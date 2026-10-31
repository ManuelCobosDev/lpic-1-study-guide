# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0061

## Estado
- **Fase actual**: Fase 11 (Importación completa del legacy) EN CURSO.
- **Último gate superado**: Gate 10 (etiqueta `fase-10-ok`).
- **Trabajo en curso**: Tarea 11.6 (Gate 11: Suite E2E de contenido real, capturas visuales, `npm run verify` y tag `fase-11-ok`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 11.6: Implementar `e2e/fase-11.spec.ts` validando los criterios objetivos de Gate 11:
   - Cobertura 100% de los 42 subtemas oficiales disponibles (Exámenes 101 y 102).
   - Comprobación de que la app muestra los contadores dinámicos calculados (42 subtemas, 770 diapositivas, 42 laboratorios, 240 preguntas).
   - Navegación a lecciones y laboratorios del Examen 102 (ej. 105.1, 107.1, 110.3).
   - El simulador permite iniciar exámenes tanto del 101 como del 102.
   - Generación de capturas visuales en `e2e/screenshots/fase-11/` e inspección con `read_file` (R5).
   - `npm run verify` íntegro en verde, commit `[C-0062]`, tag `fase-11-ok` y DETENERSE.

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
| 11 | Importación completa del legacy | en curso (Tareas 11.1 a 11.5 listas · 100% contenido real e idempotente) |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| Ninguna (0 stubs pendientes · 23 de 23 rutas implementadas) | Todas completadas |

## Comandos útiles
- `npm run import:legacy`: importación reproducible e idempotente de todo el contenido.
- `npm run build:content`: genera manifiesto y valida contenido (100% real).
- `npm run verify`: pipeline completo de 9 etapas en verde.

## Deuda conocida
Ninguna.
