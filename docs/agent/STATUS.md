# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0042

## Estado
- **Fase actual**: Fase 8 (Simulador) en curso.
- **Último gate superado**: Gate 7 (etiqueta `fase-7-ok`).
- **Trabajo en curso**: Fase 8 · Tarea 8.5 (Páginas /simulador/examen y /simulador/resultados).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 8.5 (C-0043):
1. `SimulatorExamPageComponent` (`src/app/features/simulator/pages/simulator-exam-page.component.ts`):
   - Pantalla completa sin sidebar, integración de `TimerBar`, `QuestionCard` y `QuestionNavigator`.
   - Cuenta atrás sincronizada con `startedAt` persistido (sobrevive a recargas con tiempo exacto).
   - Guardado continuo de respuestas y marcas para revisión en `ExamService`.
   - Diálogo modal de confirmación al pulsar "Finalizar examen" que advierte sobre preguntas sin responder o marcadas.
   - Finalización automática al agotarse el tiempo y redirección a `/simulador/resultados?id=...`.
2. `SimulatorResultsPageComponent` (`src/app/features/simulator/pages/simulator-results-page.component.ts`):
   - Carga del intento mediante query param `?id=...` desde el historial persistido (funciona tanto al terminar como tras recarga de página).
   - Anillo con puntuación oficial LPI 200–800, badge Aprobado (≥ 500) o Suspendido, y tiempo total invertido.
   - Desglose por tema con barras de acierto y detección de temas débiles (< 70%) con deep links al temario.
   - Acordeón de revisión de preguntas con filtros Todas / Falladas / Marcadas, mostrando respuesta dada, respuesta correcta y explicación oficial.
3. Conexión de rutas en `app.routes.ts` con `canStartExamGuard`, actualización de `scripts/check-stubs.ts` (stubs bajan a 9) y `e2e/fase-0.spec.ts`.

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
| 8 | Simulador | en curso (Tareas 8.1, 8.2, 8.3 y 8.4 OK) |
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/simulador/examen` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (251 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (11 rutas pendientes, 12 implementadas).

## Deuda conocida
Ninguna.
