# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0063

## Estado
- **Fase actual**: Fase 12 (Pulido final, accesibilidad, rendimiento y documentación) COMPLETADA · **MVP LPIC-1 100% CULMINADO**.
- **Último gate superado**: Gate 12 (etiqueta `fase-12-ok`).
- **Trabajo en curso**: Ninguno. Todas las 12 fases del proyecto han sido implementadas y verificadas.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- DETENERSE según la Regla R2 (Gate obligatorio) y esperar instrucciones del usuario tras la entrega completa del MVP.

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
| 11 | Importación completa del legacy | completada (Gate 11 OK) |
| 12 | Pulido, accesibilidad, rendimiento y documentación | completada (Gate 12 OK) |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| Ninguna (0 stubs pendientes · 23 de 23 rutas reales implementadas) | Todas completadas (check:stubs = 0) |

## Estadísticas del Manifiesto Oficial (100% Real, 0 Placeholders)
- **Subtemas oficiales disponibles**: 42 / 42 (Examen 101: 23, Examen 102: 19)
- **Diapositivas reales**: 770 (0 placeholders)
- **Laboratorios con misiones paso a paso**: 42 (131 misiones reales para Debian 12)
- **Banco de preguntas oficial**: 240 (120 del Examen 101, 120 del Examen 102)
- **Catálogo de comandos**: 193
- **Términos de glosario técnico**: 230
- **Bundle inicial en producción**: 108.09 kB gzip (límite presupuesto: 350 kB gzip)

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (74 E2E specs + 17 scripts specs).
- `npm run demo`: ejecución de la suite de aceptación completa (`npx playwright test e2e/demo.spec.ts`).
- `npm run preview`: servidor estático local de producción.
