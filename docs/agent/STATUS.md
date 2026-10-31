# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0019

## Estado
- **Fase actual**: Fase 4 (Home y Temario) en curso.
- **Último gate superado**: Gate 3 (etiqueta `fase-3-ok`).
- **Trabajo en curso**: Fase 4 · Tarea 4.3 (Temario General `/temario` y por Examen `/temario/:examen`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 4.3 (C-0020): crear `CurriculumCardComponent` en `src/app/features/curriculum/components/curriculum-card/curriculum-card.component.ts` (grid stretch, altura igualada de tarjetas, chips mono de 52 px, títulos en 2 líneas sin elipsis, botón lab de 32 px y botón ancho de práctica global con trofeo), `CurriculumPageComponent` en `src/app/features/curriculum/pages/curriculum-page.component.ts`, `ExamPageComponent` para `/temario/:examen`, conectar rutas en `app.routes.ts`, actualizar `check-stubs.ts` y añadir pruebas unitarias.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | en curso (Tareas 4.1 y 4.2 OK) |
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
| `/temario` · `/temario/:examen` · `/temario/:examen/:tema` | Fase 4 |
| `/estudiar/:subtema` · `/estudiar/:subtema/imprimir` | Fase 5 |
| `/buscar` | Fase 6 |
| `/laboratorios` · `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo en verde (9 etapas).
- `npm run test`: suite de tests unitarios (75 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (21 rutas).

## Deuda conocida
Ninguna.
