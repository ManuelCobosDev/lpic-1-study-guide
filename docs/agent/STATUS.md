# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0055

## Estado
- **Fase actual**: Fase 10 (Herramientas complementarias, Progreso, Ajustes, Mapa mental, Erratas, Acerca de, 404) EN CURSO.
- **Último gate superado**: Gate 9 (etiqueta `fase-9-ok`).
- **Trabajo en curso**: Tarea 10.6 (Suite E2E de Gate 10 `e2e/fase-10.spec.ts`, capturas visuales, `npm run verify` y cierre de Fase 10).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 10.6: Implementar `e2e/fase-10.spec.ts` validando los criterios objetivos de Gate 10:
   - Ciclo de backup completo: exportar backup JSON -> comprobar descarga -> resetear escribiendo "BORRAR" -> comprobar datos a cero -> importar backup -> verificar que todo se restaura.
   - Rechazo de checksum adulterado y rollback de importación.
   - Mapa mental: interacción de zoom, filtro "Solo pendientes" y panel lateral de detalle.
   - Progreso: renderizado de 4 StatCards, heatmap interactivo y gráfica de puntuaciones con línea de aprobado en 500.
   - Navegación a `/erratas`, `/acerca-de` y ruta inexistente `/ruta-inexistente` que carga el 404.
   - Auditoría de accesibilidad Axe limpia en modo claro y oscuro.
   - Generación de capturas de pantalla en `e2e/screenshots/fase-10/` e inspección visual (R5).
   - Ejecución de `npm run verify` (9 etapas en verde), commit `[C-0056]`, tag `fase-10-ok` y DETENERSE.

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
| 10 | Herramientas complementarias, Ajustes, Progreso, Mapa mental | en curso (Tareas 10.1 a 10.5 listas) |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| Ninguna (0 stubs pendientes · 23 de 23 rutas implementadas) | Todas completadas |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (357 unitarios + 56 E2E).
- `npm run test`: suite de tests unitarios (357 tests en verde: 341 Angular + 16 Vitest).
- `npm run check:stubs`: lista de stubs pendientes (0 rutas pendientes, 23 implementadas).

## Deuda conocida
Ninguna.
