# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0049

## Estado
- **Fase actual**: Fase 9 (Comandos, Glosario y Flashcards) EN CURSO.
- **Último gate superado**: Gate 8 (etiqueta `fase-8-ok`).
- **Trabajo en curso**: Tarea 9.6 (Suite E2E de Gate 9, capturas visuales, `npm run verify` completo y etiqueta `fase-9-ok`).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
1. Tarea 9.6: Implementar la suite de pruebas E2E `e2e/fase-9.spec.ts` validando:
   - Filtros de comandos reflejados en URL y conservados tras recargar la página.
   - Fila y tarjeta expandible con opciones y copiado funcional al portapapeles.
   - AlphaIndex en `/glosario` con salto suave a letra y deshabilitación accesible de letras vacías.
   - Sesión de flashcards con las 4 valoraciones persistiendo el estado de las cajas Leitner tras recarga.
   - Pruebas unitarias de Leitner ejecutadas y en verde.
   - Auditoría de accesibilidad Axe limpia en las 3 vistas (modo claro y oscuro).
   - Generación de capturas visuales en `e2e/screenshots/fase-9/` inspeccionadas según Regla R5.
   - `npm run verify` completo en verde y sellado con `git tag fase-9-ok`.

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
| 9 | Comandos, Glosario y Flashcards | en curso (Tareas 9.1 a 9.5 listas) |
| 10 | Mapa mental, Progreso, Ajustes, Erratas, Acerca de, 404 | pendiente |
| 11 | Importación completa del legacy | pendiente |
| 12 | Pulido, accesibilidad, rendimiento y documentación | pendiente |

## Stubs (páginas aún no implementadas)
| Ruta | Se implementa en |
|---|---|
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo de 9 etapas en verde (317 unitarios + 50 E2E).
- `npm run test`: suite de tests unitarios (317 tests en verde: 301 Angular + 16 Vitest).
- `npm run check:stubs`: lista de stubs pendientes (6 rutas pendientes, 17 implementadas).

## Deuda conocida
Ninguna.
