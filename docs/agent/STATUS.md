# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0056

## Estado
- **Fase actual**: Fase 10 (Herramientas complementarias, Progreso, Ajustes, Mapa mental, Erratas, Acerca de, 404) COMPLETADA.
- **Último gate superado**: Gate 10 (etiqueta `fase-10-ok`).
- **Trabajo en curso**: ninguno (Fase 10 cerrada, esperando confirmación para Fase 11).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Comenzar la Fase 11: Importación completa del contenido del Examen 102 (Temas 105 a 110, 18 subtemas restantes, validación de laboratorio y preguntas).

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
| 10 | Herramientas complementarias, Ajustes, Progreso, Mapa mental | completada (Gate 10 OK) |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| Ninguna (0 stubs pendientes · 23 de 23 rutas implementadas) | Todas completadas |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (357 unitarios + 62 E2E).
- `npm run test`: suite de tests unitarios (357 tests en verde: 341 Angular + 16 Vitest).
- `npx playwright test e2e/fase-10.spec.ts`: suite E2E de Fase 10 (6 tests en verde).
- `npm run check:stubs`: comprobación de rutas (0 stubs pendientes, 23 implementadas).

## Deuda conocida
Ninguna.
