# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0031

## Estado
- **Fase actual**: Fase 6 (Buscador global) en curso.
- **Último gate superado**: Gate 5 (etiqueta `fase-5-ok`).
- **Trabajo en curso**: Fase 6 · Tarea 6.4 (Página completa de búsqueda `/buscar?q=` con paginación y filtros).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 6.4 (C-0032): crear `SearchPageComponent` (`src/app/features/search/pages/search-page.component.ts`) conectado con query params `q`, `tipo` y `pagina`, paginado a 20 resultados por página con componente de paginación interactivo, chips de filtro con recuento, navegación directa a diapositivas con `?slide=N&q=término`, estado vacío y sugerencias. Reemplazar el stub en `app.routes.ts`, actualizar `scripts/check-stubs.ts` e `implementedRoutes` en `e2e/fase-0.spec.ts`.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | completada (Gate 4 OK) |
| 5 | Lecciones y Estudiar | completada (Gate 5 OK) |
| 6 | Buscador | en curso (Tareas 6.1, 6.2 y 6.3 OK) |
| 7 | Laboratorios | pendiente |
| 8 | Simulador | pendiente |
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/buscar` | Fase 6 |
| `/laboratorios` · `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (168 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (16 rutas pendientes, 7 implementadas).

## Deuda conocida
Ninguna.
