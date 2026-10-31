# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0022

## Estado
- **Fase actual**: Fase 4 (Home y Temario) COMPLETADA con éxito.
- **Último gate superado**: Gate 4 (etiqueta `fase-4-ok`).
- **Trabajo en curso**: ninguno (fase cerrada y verificada).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Esperar confirmación del usuario para arrancar la Fase 5 (Lecciones y Estudiar: `/estudiar/:subtema` con visor interactivo de diapositivas, documento continuo tipo web, glosario interactivo integrado y vista de impresión `/estudiar/:subtema/imprimir`).

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | completada (Gate 4 OK) |
| 5 | Lecciones y Estudiar | pendiente |
| 6 | Buscador | pendiente |
| 7 | Laboratorios | pendiente |
| 8 | Simulador | pendiente |
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/estudiar/:subtema` · `/estudiar/:subtema/imprimir` | Fase 5 |
| `/buscar` | Fase 6 |
| `/laboratorios` · `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo en verde (9 etapas, 93 tests unitarios, 20 E2E).
- `npm run test`: suite de tests unitarios (93 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (18 rutas pendientes, 5 implementadas).

## Deuda conocida
Ninguna.
