# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0054

## Estado
- **Fase actual**: Fase 10 (Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404) EN CURSO.
- **Último gate superado**: Gate 9 (etiqueta `fase-9-ok`).
- **Trabajo en curso**: Tarea 10.5 (Pantallas `/erratas`, `/acerca-de` y página 404 `NotFoundPageComponent`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 10.5: Implementar las pantallas restantes de la Fase 10:
   - `/erratas` en `src/app/features/support/pages/errata-page.component.ts`: catálogo de fe de erratas filtrable por gravedad y subtema con enlace a GitHub.
   - `/acerca-de` en `src/app/features/support/pages/about-page.component.ts`: créditos, aviso legal no oficial LPI, versión y guía pedagógica.
   - 404 `NotFoundPageComponent` en `src/app/shared/layout/not-found-page/not-found-page.component.ts`: página no encontrada amigable con enlaces a Home, Temario y Buscador.
   - Reemplazo de los últimos 3 stubs en `app.routes.ts`, actualización de `check-stubs.ts` (0 stubs pendientes) y tests unitarios.

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
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | en curso (Tareas 10.1, 10.2, 10.3 y 10.4 listas) |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/erratas` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (344 unitarios + 56 E2E).
- `npm run test`: suite de tests unitarios (344 tests en verde: 328 Angular + 16 Vitest).
- `npm run check:stubs`: lista de stubs pendientes (3 rutas pendientes, 20 implementadas).

## Deuda conocida
Ninguna.
