# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0050

## Estado
- **Fase actual**: Fase 9 (Comandos, Glosario y Flashcards) COMPLETADA.
- **Último gate superado**: Gate 9 (etiqueta `fase-9-ok`).
- **Trabajo en curso**: Ninguno. Fase 9 cerrada y verificada al 100%.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Esperar confirmación del usuario para arrancar la **Fase 10: Herramientas complementarias** (`/ejecutar-fase 10`), que abarcará `/mapa-mental`, `/progreso`, `/erratas`, `/ajustes`, `/acerca-de` y la página `404` (`**`).

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
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (317 unitarios + 56 E2E).
- `npm run test`: suite de tests unitarios (317 tests en verde: 301 Angular + 16 Vitest).
- `npm run check:stubs`: lista de stubs pendientes (6 rutas pendientes, 17 implementadas).

## Deuda conocida
Ninguna.
