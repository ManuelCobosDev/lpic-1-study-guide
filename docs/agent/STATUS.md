# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0053

## Estado
- **Fase actual**: Fase 10 (Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404) EN CURSO.
- **Último gate superado**: Gate 9 (etiqueta `fase-9-ok`).
- **Trabajo en curso**: Tarea 10.4 (Pantalla `/mapa-mental` con jerarquía D3, controles de zoom, minimapa y panel lateral).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 10.4: Implementar la pantalla `/mapa-mental` en `src/app/features/mind-map/` con:
   - Árbol jerárquico completo D3 (`d3-hierarchy`, `d3-zoom`): LPIC-1 -> Exámenes 101/102 -> 10 temas -> 42 subtemas.
   - Nodos con códigos oficiales, títulos y coloreados exclusivamente por estado de progreso (verde completado, azul en curso, neutro pendiente).
   - Controles de zoom (+, -, 100%, ajustar a pantalla con fit), arrastre panorámico, minimapa de navegación.
   - Buscador interactivo de nodos, filtro "Solo pendientes" y panel lateral con detalles, objetivos y enlace a la lección.
   - Reemplazo del stub `/mapa-mental` en `app.routes.ts`, actualización de `check-stubs.ts` y tests unitarios.

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
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | en curso (Tareas 10.1, 10.2 y 10.3 listas) |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/mapa-mental` · `/erratas` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (337 unitarios + 56 E2E).
- `npm run test`: suite de tests unitarios (337 tests en verde: 321 Angular + 16 Vitest).
- `npm run check:stubs`: lista de stubs pendientes (4 rutas pendientes, 19 implementadas).

## Deuda conocida
Ninguna.
