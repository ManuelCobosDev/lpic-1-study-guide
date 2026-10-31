# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0041

## Estado
- **Fase actual**: Fase 8 (Simulador) en curso.
- **Último gate superado**: Gate 7 (etiqueta `fase-7-ok`).
- **Trabajo en curso**: Fase 8 · Tarea 8.4 (Páginas /simulador y /simulador/practica).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 8.4 (C-0042):
1. `SimulatorHubPageComponent` (`src/app/features/simulator/pages/simulator-hub-page.component.ts`):
   - Banner "Retomar simulacro en curso" si hay sesión activa en `ExamService`.
   - Tarjetas principales "Simulacro cronometrado" (iniciar examen de 60 preguntas o disponibles, 90 min) y "Práctica libre" (sin límite de tiempo).
   - Sección "Entrenar por tema" (chips para los 4 temas LPIC-1 con enlace directo a `/simulador/practica?tema=...`).
   - Tabla "Últimos intentos" (5 filas: fecha, modo, puntuación oficial 200–800, badge Aprobado/Suspendido, enlace a resultados).
2. `SimulatorPracticePageComponent` (`src/app/features/simulator/pages/simulator-practice-page.component.ts`):
   - Práctica libre filtrable por tema, subtema, tipo, navegación pregunta a pregunta con botón "Comprobar respuesta" y retroalimentación pedagógica inmediata.
3. Conectar rutas en `src/app/app.routes.ts` y suites unitarias para ambas páginas.

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
| 8 | Simulador | en curso (Tareas 8.1, 8.2 y 8.3 OK) |
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
- `npm run test`: suite de tests unitarios (243 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (13 rutas pendientes, 10 implementadas).

## Deuda conocida
Ninguna.
