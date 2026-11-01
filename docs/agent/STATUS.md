# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0068

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R3 (Enlaces tipo Wikipedia y referencias contextuales, etiqueta `r2-R3-ok`).
- **Trabajo en curso**: Ninguno. Paso R3 completado con éxito.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Paso R4 · Pestaña Practica lo aprendido (F6)** (`/ejecutar-paso-r2 R4` en conversación nueva).

## Ronda 2 · Pasos de Herramientas
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia y referencias contextuales | completado (Gate R3 OK) |
| R4 | Pestaña Practica lo aprendido | pendiente |
| R5 | Flashcards masivas | pendiente |
| R6 | Simulador examen 102 | pendiente |
| R7 | Mapa mental interactivo y robusto | pendiente |

## Enlaces Tipo Wikipedia y Referencias Contextuales (Gate R3)
- **Motor autolink**: `src/app/core/engines/autolink/` con 15 tests unitarios cubriendo todas las reglas de la Spec 13 §13.2 y §13.7 (longitud descendente, case sensitive para comandos, case/accent insensitive para términos con plurales, no-anidamiento, exclusión de bloques terminal/code, exclusión en diapositiva principal `explainedIn`).
- **Cálculo y validación en build-content**: asignación por puntuación (+100 heading, +50 bold/def, +30 key list, +10 aparición), normalización de `short` (≤280 chars), verificación estricta de ubicaciones y autoenlazado en diapositivas compiladas.
- **Tarjeta flotante y componente UI**: `WikiPopoverComponent` (`.term-link-card .preview-card`, `role="dialog"`, `aria-label`, delays 250ms enter / 150ms leave, `keepOpen`, teclado Esc/Tab) y `app-term-link` interactivo.
- **Badges de ubicación oficial**: `.explained-in-badge` (`data-testid="explained-in"`) en `/comandos` y `/glosario` con enlaces profundos a diapositivas y resaltado `?q=`.
- **E2E F5 promovido**: `e2e/ronda2/f5-enlaces-wikipedia.spec.ts` 100% verde; suite pendiente reducida a 4 fallos (F1, F2, F3, F6).
- **Pipeline general**: `npm run verify` verde (9/9 etapas, 76 E2E pasando, 372 unitarios Karma + 36 Vitest).

## Comandos útiles
- `npm run verify:coverage -- <id>`: evalúa las 10 reglas de cobertura del subtema.
- `npm run report:coverage -- <id>`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run validation:register -- <id>`: registra hash SHA-256 en `validaciones.json`.
- `npm run verify:validations`: comprueba la integridad criptográfica de subtemas validados.
- `npm run verify`: pipeline completo de 9 etapas en verde (76 E2E specs + 36 Vitest specs + 372 Karma specs).
- `npm run e2e:pendientes`: ejecución de los 4 tests de fallos restantes F1, F2, F3, F6 (en rojo).
