# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0052

## Estado
- **Fase actual**: Fase 10 (Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404) EN CURSO.
- **Último gate superado**: Gate 9 (etiqueta `fase-9-ok`).
- **Trabajo en curso**: Tarea 10.3 (Pantalla `/progreso` con StatCards, heatmap interactivo de 26 semanas y gráfica SVG de puntuaciones).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 10.3: Implementar la pantalla `/progreso` en `src/app/features/progress/` con:
   - 4 StatCards de métricas globales (progreso %, racha en días, horas estimadas, mejor resultado 200–800).
   - Heatmap SVG accesible de actividad de 26 semanas con tooltips de minutos/fecha.
   - Gráfica interactiva SVG de línea con historial de simulacros y línea de referencia de aprobado en 500 puntos.
   - Grid inferior con temas débiles detectados (< 70% acierto) y recomendación de siguiente paso.
   - Tabla de desglose de progreso por tema.
   - Reemplazo del stub `/progreso` en `app.routes.ts`, actualización de `check-stubs.ts` y tests unitarios.

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
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | en curso (Tareas 10.1 y 10.2 listas) |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/mapa-mental` · `/progreso` · `/erratas` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (325 unitarios + 56 E2E).
- `npm run test`: suite de tests unitarios (325 tests en verde: 309 Angular + 16 Vitest).
- `npm run check:stubs`: lista de stubs pendientes (5 rutas pendientes, 18 implementadas).

## Deuda conocida
Ninguna.
