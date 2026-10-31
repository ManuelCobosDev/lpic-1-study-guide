# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0044

## Estado
- **Fase actual**: Fase 8 (Simulador) COMPLETADA.
- **Último gate superado**: Gate 8 (etiqueta `fase-8-ok`).
- **Trabajo en curso**: Esperando confirmación del usuario para iniciar Fase 9 (Comandos, Glosario y Flashcards).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Iniciar Fase 9 (Comandos, Glosario y Flashcards con motor Leitner):
1. Tarea 9.1: Implementar el motor de repetición espaciada `LeitnerEngine` en `src/app/core/engines/leitner/leitner.engine.ts` (cajas 1 a 5, intervalos de días, límite diario, atajos de teclado 1-4) con suite de pruebas unitarias puras.
2. Tarea 9.2: Servicio `FlashcardService`, `GlossaryService` y `CommandService` con persistencia en `StorageService`.
3. Tarea 9.3: Página `/comandos` con tabla/tarjetas, búsqueda textual y filtros reflejados en la URL, vista detallada expandible y comandos copiables.
4. Tarea 9.4: Página `/glosario` con AlphaIndex sticky A-Z accesible y deep links a lecciones.
5. Tarea 9.5: Página `/flashcards` con giro animado, interacción por teclado y feedback Leitner.
6. Tarea 9.6: Suite E2E de Gate 9, capturas visuales, `npm run verify` completo y etiqueta `fase-9-ok`.

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
| 9 | Comandos, Glosario y Flashcards | pendiente |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (262 unitarios + 50 E2E).
- `npm run test`: suite de tests unitarios (262 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (9 rutas pendientes, 14 implementadas).

## Deuda conocida
Ninguna.
