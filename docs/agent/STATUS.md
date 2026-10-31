# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0030

## Estado
- **Fase actual**: Fase 6 (Buscador global) en curso.
- **Último gate superado**: Gate 5 (etiqueta `fase-5-ok`).
- **Trabajo en curso**: Fase 6 · Tarea 6.3 (Paleta de búsqueda modal `SearchPaletteComponent`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 6.3 (C-0031): crear `SearchPaletteComponent` (`src/app/shared/search-palette/search-palette.component.ts`) accesible con `role="dialog"`, input grande, chips de categoría (`Todo`, `Temario`, `Diapositivas`, `Comandos`, `Glosario`, `Prácticas`), navegación por teclado (`↑↓`, `Enter`, `Tab`, `Esc`), historial de búsquedas recientes y enlace a `/buscar?q=...`. Integrar en `HeaderComponent` y `ShellComponent`.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | completada (Gate 4 OK) |
| 5 | Lecciones y Estudiar | completada (Gate 5 OK) |
| 6 | Buscador | en curso (Tareas 6.1 y 6.2 OK) |
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
- `npm run test`: suite de tests unitarios (159 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (16 rutas pendientes, 7 implementadas).

## Deuda conocida
Ninguna.
