# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0039

## Estado
- **Fase actual**: Fase 8 (Simulador) en curso.
- **Último gate superado**: Gate 7 (etiqueta `fase-7-ok`).
- **Trabajo en curso**: Fase 8 · Tarea 8.2 (Servicio `ExamService` y guard `canStartExamGuard`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 8.2 (C-0040): crear `ExamService` en `src/app/core/services/exam.service.ts` sobre `PersistedStore` en `localStorage` (`exam_active_session` y `exam_history`), cálculo dinámico de tiempo restante basado en `startedAt` persistido (a prueba de recargas), persistencia de respuestas y marcas, guardado de intentos completados, y el guard `canStartExamGuard` (`src/app/features/simulator/guards/can-start-exam.guard.ts`). Suites de tests unitarios en `exam.service.spec.ts` y `can-start-exam.guard.spec.ts`.

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
| 8 | Simulador | en curso (Tarea 8.1 OK) |
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (217 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (13 rutas pendientes, 10 implementadas).

## Deuda conocida
Ninguna.
