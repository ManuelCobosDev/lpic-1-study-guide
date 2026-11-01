# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0072

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R7 (Mapa mental interactivo y robusto, etiqueta `r2-R7-ok`).
- **Trabajo en curso**: Ninguno. Todos los pasos de herramientas R0 a R7 completados al 100%.
- **Fallos pendientes**: 0 (F1, F2, F3, F5, F6 resueltos y promovidos a tests E2E verdes).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Subtema 105.1 · Interfaces de usuario y escritorios** (`/procesar-subtema 105.1` en conversación nueva).

## Ronda 2 · Pasos de Herramientas (Completados 8/8)
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia y referencias contextuales | completado (Gate R3 OK) |
| R4 | Pestaña Practica lo aprendido | completado (Gate R4 OK) |
| R5 | Flashcards masivas (1 182 tarjetas, 100% flags) | completado (Gate R5 OK) |
| R6 | Simulador examen 102 (selector + 120 preguntas) | completado (Gate R6 OK) |
| R7 | Mapa mental interactivo y robusto (498 nodos, zoom) | completado (Gate R7 OK) |

## Mapa mental y resolución de F3 (Gate R7)
- **Fallo F3 resuelto**: `initZoom()` ejecutado en `ngAfterViewInit` con `extent` explícito; zoom fluido con botones (+, -, 1:1, Ajustar) y teclado (+, -, 0, Escape).
- **498 nodos derivados**: 55 base (1 raíz + 2 exámenes + 10 temas + 42 subtemas) + 204 comandos + 239 términos con interruptor "Comandos y términos".
- **Buscador y navegación**: Búsqueda en tiempo real con foco y centrado de vista, filtro "Solo pendientes" y drawer lateral con acción "Ir a estudiar" hacia `/estudiar/:id`.
- **Accesibilidad y presupuesto**: Axe limpio (0 violaciones), contraste WCAG AA, y hoja de estilos contenida en 7.88 kB (< 8 kB budget).
- **Suite E2E y verificación**: Promovido `e2e/ronda2/f3-mapa-mental.spec.ts` (7 tests). `npm run verify` al 100% en verde (10/10 etapas, 98 E2E).

## Comandos útiles
- `npm run verify:coverage -- <id>`: evalúa las 10 reglas de cobertura del subtema.
- `npm run report:coverage -- <id>`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run validation:register -- <id>`: registra hash SHA-256 en `validaciones.json`.
- `npm run verify:validations`: comprueba la integridad criptográfica de subtemas validados.
- `npm run verify`: pipeline completo de 10 etapas en verde (98 E2E specs + 46 Vitest specs + 377 Karma specs).
- `npm run e2e:pendientes`: ejecución de fallos pendientes (reporta 0 fallos pendientes con salida limpia).
