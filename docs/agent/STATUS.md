# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0070

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R5 (Flashcards masivas, etiqueta `r2-R5-ok`).
- **Trabajo en curso**: Ninguno. Paso R5 completado con éxito.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Paso R6 · Simulador examen 102 (F1)** (`/ejecutar-paso-r2 R6` en conversación nueva).

## Ronda 2 · Pasos de Herramientas
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia y referencias contextuales | completado (Gate R3 OK) |
| R4 | Pestaña Practica lo aprendido | completado (Gate R4 OK) |
| R5 | Flashcards masivas | completado (Gate R5 OK) |
| R6 | Simulador examen 102 | pendiente |
| R7 | Mapa mental interactivo y robusto | pendiente |

## Flashcards Masivas y Explorador de Biblioteca (Gate R5)
- **Generador masivo**: `scripts/generate-flashcards.ts` genera 1 182 tarjetas deterministas en `public/content/flashcards.json`.
- **Cobertura 100% flags y subtemas**: 684 flags de comandos con nombre cubiertas al 100% y los 42 subtemas cuentan con ≥ 10 tarjetas (0 subtemas con < 10 tarjetas).
- **Explorador y biblioteca `/flashcards`**: Buscador instantáneo en tiempo real (< 1 s sobre 1 182 tarjetas), filtros por tipo y caja Leitner, paginación client-side y desplegable de reverso.
- **Sesión de estudio Leitner**: 5 cajas espaciadas, volteo 3D y atajos 1-4 con persistencia en `localStorage` (`lpic1.v1.flashcards_progress`).
- **Coherencia**: Contador de tarjetas dinámico en Home (`/`) y `/flashcards` exactamente idéntico al manifiesto (`1182`).
- **E2E F2 promovido**: `e2e/ronda2/f2-flashcards-masivas.spec.ts` 100% verde (4 tests); suite de fallos pendientes reducida a 2 (F1 y F3).
- **Pipeline general**: `npm run verify` verde (10/10 etapas, 84 tests E2E, 377 Karma + 43 Vitest).

## Comandos útiles
- `npm run verify:coverage -- <id>`: evalúa las 10 reglas de cobertura del subtema.
- `npm run report:coverage -- <id>`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run validation:register -- <id>`: registra hash SHA-256 en `validaciones.json`.
- `npm run verify:validations`: comprueba la integridad criptográfica de subtemas validados.
- `npm run verify`: pipeline completo de 10 etapas en verde (84 E2E specs + 43 Vitest specs + 377 Karma specs).
- `npm run e2e:pendientes`: ejecución de los 2 tests de fallos restantes F1 y F3 (en rojo).
