# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0036

## Estado
- **Fase actual**: Fase 7 (Laboratorios) en curso.
- **Último gate superado**: Gate 6 (etiqueta `fase-6-ok`).
- **Trabajo en curso**: Fase 7 · Tarea 7.4 (Vista de práctica guiada `/laboratorios/:id`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 7.4 (C-0037): crear `LabDetailPageComponent` en `src/app/features/labs/pages/lab-detail-page.component.ts` (HTML y CSS) para la ruta `/laboratorios/:id`. Integrar barra de progreso sticky superior, banner descartable de advertencia "Necesitas una VM Debian 12" con modal explicativo, distribución en 2 columnas con `LabStepperComponent` a la izquierda y el detalle de la misión/paso activo a la derecha con comandos copiables (`app-code-block`), salida esperada plegable, callouts de pistas/examen, botones de marcar como hecho, ver solución y reiniciar práctica, y diálogo sobrio de felicitación al completar todos los pasos. Reemplazar el stub en `app.routes.ts`, actualizar `scripts/check-stubs.ts` y tests unitarios en `lab-detail-page.component.spec.ts`.

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
| 7 | Laboratorios | en curso (Tareas 7.1, 7.2 y 7.3 OK) |
| 8 | Simulador | pendiente |
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (195 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (14 rutas pendientes, 9 implementadas).

## Deuda conocida
Ninguna.
