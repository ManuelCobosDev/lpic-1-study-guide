# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0026

## Estado
- **Fase actual**: Fase 5 (Lecciones y Estudiar) en curso.
- **Último gate superado**: Gate 4 (etiqueta `fase-4-ok`).
- **Trabajo en curso**: Fase 5 · Tarea 5.5 (Página principal de estudio `/estudiar/:subtema`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 5.5 (C-0027): crear `LessonPageComponent` (`/estudiar/:subtema`) con barra de navegación por migas, selector de vistas reactivo (Diapositivas 16:9 | Web continua | PDF / Imprimir), toggle verde "Marcar como completado" sincronizado con `progressService`, pestañas secundarias (Laboratorio, Notas personales con autoguardado en `localStorage`, Comandos y Glosario filtrados), navegación al subtema anterior/siguiente, popover de referencias Wikipedia y enriquecer `103.4.json` con el bloque de diagrama SVG `streams`.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | completada (Gate 4 OK) |
| 5 | Lecciones y Estudiar | en curso (Tareas 5.1, 5.2, 5.3 y 5.4 OK) |
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
| `/estudiar/:subtema` | Fase 5 |
| `/buscar` | Fase 6 |
| `/laboratorios` · `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (136 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (17 rutas pendientes, 6 implementadas).

## Deuda conocida
Ninguna.
