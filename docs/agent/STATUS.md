# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0040

## Estado
- **Fase actual**: Fase 8 (Simulador) en curso.
- **Último gate superado**: Gate 7 (etiqueta `fase-7-ok`).
- **Trabajo en curso**: Fase 8 · Tarea 8.3 (Componentes de UI del simulador).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 8.3 (C-0041): crear los componentes presentacionales accesibles del simulador en `src/app/features/simulator/components/`:
1. `TimerBarComponent` (`timer-bar/`): barra sticky superior con minutos:segundos, cambio de color semántico (ámbar a ≤ 10 min, rojo a ≤ 2 min), botón "Finalizar examen", y `aria-live`.
2. `QuestionCardComponent` (`question-card/`): tarjeta centrada (máx 760 px) para tipos `single`, `multiple` (con aviso "Elige N respuestas") y `fill` (input normalizado), botón "Marcar para revisar", y modo práctica con solución/explicación inmediata.
3. `QuestionNavigatorComponent` (`question-navigator/`): panel con selector numerado por pregunta con estados accesibles (actual, respondida, sin responder, marcada), adaptativo (columna en desktop, cajón en móvil).
Suites de pruebas unitarias para cada componente.

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
| 8 | Simulador | en curso (Tareas 8.1 y 8.2 OK) |
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
- `npm run test`: suite de tests unitarios (228 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (13 rutas pendientes, 10 implementadas).

## Deuda conocida
Ninguna.
