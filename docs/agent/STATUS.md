# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0035

## Estado
- **Fase actual**: Fase 7 (Laboratorios) en curso.
- **Último gate superado**: Gate 6 (etiqueta `fase-6-ok`).
- **Trabajo en curso**: Fase 7 · Tarea 7.3 (Catálogo de laboratorios `/laboratorios`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 7.3 (C-0036): crear `LabsPageComponent` en `src/app/features/labs/pages/labs-page.component.ts` con filtros reactivos (Tema, Dificultad, Estado), búsqueda rápida, grid de 3 columnas de tarjetas responsivas con badges de estado y dificultad, y enlace a `/laboratorios/:id`. Reemplazar el stub en `app.routes.ts`, actualizar `scripts/check-stubs.ts` e `implementedRoutes` en `e2e/fase-0.spec.ts`. Crear suite de pruebas unitarias en `labs-page.component.spec.ts`.

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
| 7 | Laboratorios | en curso (Tareas 7.1 y 7.2 OK) |
| 8 | Simulador | pendiente |
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/laboratorios` · `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (188 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (15 rutas pendientes, 8 implementadas).

## Deuda conocida
Ninguna.
