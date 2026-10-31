# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0043

## Estado
- **Fase actual**: Fase 8 (Simulador) en curso.
- **Último gate superado**: Gate 7 (etiqueta `fase-7-ok`).
- **Trabajo en curso**: Fase 8 · Tarea 8.6 (Suite E2E Gate 8, capturas y cierre de fase).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 8.6 (C-0044):
1. Crear suite E2E `e2e/fase-8.spec.ts` validando de forma objetiva:
   - Iniciar simulacro, responder preguntas, marcar para revisión, **recargar la página y verificar que se reanuda con el tiempo restante correcto y las respuestas persistidas**.
   - Finalizar el examen produce puntuación oficial 200–800 y resultados por tema en `/simulador/resultados?id=…` **que también funciona tras recargar**.
   - En modo práctica (`/simulador/practica`), la explicación aparece al comprobar.
   - `canStartExamGuard` bloquea o redirige si no hay preguntas.
   - Auditoría Axe en modo claro y oscuro limpia de violaciones críticas/serias.
   - Generación de capturas visuales en `e2e/screenshots/fase-8/`.
2. Inspeccionar capturas con `read_file` (Regla R5).
3. Ejecutar `npm run verify` completo (las 9 etapas en verde).
4. Registrar en CHANGELOG/STATUS, crear commit, tag `git tag fase-8-ok` y **DETENERSE**.

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
| 8 | Simulador | en curso (Tareas 8.1 a 8.5 OK) |
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
- `npm run verify`: pipeline completo de 9 etapas en verde.
- `npm run test`: suite de tests unitarios (262 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (9 rutas pendientes, 14 implementadas).

## Deuda conocida
Ninguna.
