# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0037

## Estado
- **Fase actual**: Fase 7 (Laboratorios) en curso.
- **Último gate superado**: Gate 6 (etiqueta `fase-6-ok`).
- **Trabajo en curso**: Fase 7 · Tarea 7.5 (Suite E2E Gate 7, capturas visuales y cierre de fase).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Implementar Tarea 7.5 (C-0038): crear `e2e/fase-7.spec.ts` para verificar todos los criterios de Gate 7:
1. En `/laboratorios/103.4`, marcar 3 pasos de práctica, recargar la página y verificar persistencia en `localStorage`.
2. Copiar un comando escribe en el portapapeles (`navigator.clipboard`).
3. Completar todos los pasos abre el diálogo sobrio de enhorabuena y el catálogo `/laboratorios` marca la práctica como completada.
4. Los filtros del catálogo (Tema, Dificultad, Estado, Búsqueda de texto) funcionan de forma reactiva.
5. Auditoría Axe en modo claro y oscuro sin violaciones críticas o serias.
6. Generación de capturas visuales en `e2e/screenshots/fase-7/` (catálogo y detalle, desktop y móvil, claro y oscuro), inspección con `read_file`, ejecución completa de `npm run verify`, commit y etiquetado `git tag fase-7-ok`.

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
| 7 | Laboratorios | en curso (Tareas 7.1 a 7.4 OK) |
| 8 | Simulador | pendiente |
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
- `npm run test`: suite de tests unitarios (203 tests en verde).
- `npm run check:stubs`: lista de stubs pendientes (13 rutas pendientes, 10 implementadas).

## Deuda conocida
Ninguna.
