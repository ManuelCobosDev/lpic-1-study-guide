# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0024

## Estado
- **Fase actual**: Fase 5 (Lecciones y Estudiar) en curso.
- **Último gate superado**: Gate 4 (etiqueta `fase-4-ok`).
- **Trabajo en curso**: Fase 5 · Tarea 5.3 (Visor de Diapositivas 16:9 interactivo).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 5.3 (C-0025): crear `SlideViewerComponent` (`features/study/components/slide-viewer/`) con lienzo escalado 1280×720 con ResizeObserver, layouts de diapositiva (`cover`, `content`, `two-column`, `diagram`, `checkpoint`, `summary`), atajos de teclado globales sin foco previo (`→`, `←`, `Espacio`, `AvPág`, `RePág`, `Inicio`, `Fin`, `1-9`), pantalla completa con `F`, salida con `Esc`, controles flotantes auto-ocultables, cajón de miniaturas (`T`), deep links `?slide=N` y registro de diapositiva vista tras 2 s.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | completada (Gate 4 OK) |
| 5 | Lecciones y Estudiar | en curso (Tareas 5.1 y 5.2 OK) |
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
- `npm run verify`: pipeline completo en verde (9 etapas, 119 tests unitarios, 20 E2E).
- `npm run test`: suite de tests unitarios (119 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (18 rutas pendientes, 5 implementadas).

## Deuda conocida
Ninguna.
