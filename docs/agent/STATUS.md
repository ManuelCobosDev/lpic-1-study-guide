# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0032

## Estado
- **Fase actual**: Fase 6 (Buscador global) en curso.
- **Último gate superado**: Gate 5 (etiqueta `fase-5-ok`).
- **Trabajo en curso**: Fase 6 · Tarea 6.5 (Suite E2E de Gate 6, capturas visuales, npm run verify y etiqueta fase-6-ok).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 6.5 (C-0033): crear `e2e/fase-6.spec.ts` cubriendo todos los criterios del Gate 6 (Ctrl+K abre paleta, búsqueda de comando 'tee' devuelve comando/diapositivas/término, búsqueda '103.4' lleva a subtema, búsqueda sin tilde 'tuberias' encuentra 'tuberías', diapositiva abre con ?slide=2&q=tee y <mark>, /buscar?q= pagina a 20 por página, preguntas de simulador ausentes, auditoría Axe en claro/oscuro y capturas visuales en `e2e/screenshots/fase-6/`). Ejecutar `npm run verify`, revisar capturas con `read_file`, registrar C-0033 y sellar con `git tag fase-6-ok`.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | completada (Gate 0 OK) |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | completada (Gate 1 OK) |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | completada (Gate 2 OK) |
| 3 | Sistema de diseño | completada (Gate 3 OK) |
| 4 | Home y Temario | completada (Gate 4 OK) |
| 5 | Lecciones y Estudiar | completada (Gate 5 OK) |
| 6 | Buscador | en curso (Tareas 6.1, 6.2, 6.3 y 6.4 OK) |
| 7 | Laboratorios | pendiente |
| 8 | Simulador | pendiente |
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/laboratorios` · `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (176 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (15 rutas pendientes, 8 implementadas).

## Deuda conocida
Ninguna.
