# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-10-31 · **Última entrada**: C-0004

## Estado
- **Fase actual**: Fase 0 · Andamiaje Angular (esqueleto limpio).
- **Último gate superado**: ninguno (Fase 0 en curso).
- **Trabajo en curso**: Fase 0 · Tarea 5 (AppShell, servicios base, rutas stub y botón único).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
Fase 0 · Tarea 5: Implementar `StorageService`, `ThemeService`, `ContainerComponent`, `ButtonComponent` (`app-button`), `AppShell` y todas las rutas con `NotImplementedPage`.

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
| (se registra en la Tarea 5 de la Fase 0) | |

## Comandos útiles
- `npm run verify`: pipeline completo ordenado.
- `npm run check:tokens`: auditoría de colores literales.
- `npm run check:boundaries`: verificación de fronteras arquitectónicas.
- `npm run check:stubs`: auditoría de páginas pendientes.
- `npm test`: suite completa de tests unitarios (Angular + scripts).

## Deuda conocida
Ninguna.
