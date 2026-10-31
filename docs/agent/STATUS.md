# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0005

## Estado
- **Fase actual**: Fase 0 · Andamiaje Angular (esqueleto limpio).
- **Último gate superado**: ninguno (Fase 0 en curso).
- **Trabajo en curso**: Fase 0 · Tarea 6 (E2E, capturas y verificación del Gate 0).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Fase 0 · Tarea 6: Escribir `e2e/fase-0.spec.ts` (consola limpia, persistencia de tema oscuro tras reload, auditoría axe a11y, navegación de todas las rutas stub, 4 capturas en `e2e/screenshots/fase-0/`) y ejecutar `/verificar-gate 0`.

## Fases
| Fase | Descripción | Estado |
|---|---|---|
| 0 | Andamiaje Angular (esqueleto limpio) | en curso |
| 1 | Inventario del legacy (solo lectura) + decisión D-004 | pendiente |
| 2 | Currículo, pipeline de contenido, dominio + tajada vertical 103.4 | pendiente |
| 3 | Sistema de diseño | pendiente |
| 4 | Home y Temario | pendiente |
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
| `/` · `/temario` · `/temario/:examen` · `/temario/:examen/:tema` | Fase 4 |
| `/estudiar/:subtema` · `/estudiar/:subtema/imprimir` | Fase 5 |
| `/buscar` | Fase 6 |
| `/laboratorios` · `/laboratorios/:id` | Fase 7 |
| `/simulador` · `/simulador/examen` · `/simulador/practica` · `/simulador/resultados` | Fase 8 |
| `/comandos` · `/glosario` · `/flashcards` | Fase 9 |
| `/guia-estilos` | Fase 3 |
| `/mapa-mental` · `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `**` (404) | Fase 10 |

## Comandos útiles
- `npm run verify`: pipeline completo ordenado.
- `npm test`: suite completa de tests unitarios (Angular + scripts).
- `npm run check:tokens`: auditoría de colores literales.
- `npm run check:boundaries`: verificación de fronteras arquitectónicas.
- `npm run check:stubs`: lista de páginas pendientes.

## Deuda conocida
Ninguna.
