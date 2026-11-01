# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0069

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R4 (Pestaña "Practica lo aprendido", etiqueta `r2-R4-ok`).
- **Trabajo en curso**: Ninguno. Paso R4 completado con éxito.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Paso R5 · Flashcards masivas (F2)** (`/ejecutar-paso-r2 R5` en conversación nueva).

## Ronda 2 · Pasos de Herramientas
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia y referencias contextuales | completado (Gate R3 OK) |
| R4 | Pestaña Practica lo aprendido | completado (Gate R4 OK) |
| R5 | Flashcards masivas | pendiente |
| R6 | Simulador examen 102 | pendiente |
| R7 | Mapa mental interactivo y robusto | pendiente |

## Pestaña Practica lo Aprendido (Gate R4)
- **Persistencia reactiva**: `PracticeService` (`practice_progress` en `localStorage`) con gestión de récords de test rápido, notas de ejercicios y completados.
- **Componente 4ª pestaña**: `PracticeTabComponent` con Bloque A (Test rápido ≤ 10 preguntas, feedback inmediato y pantalla de puntuación), Bloque B (Mini-flashcards Leitner ≤ 10 tarjetas, volteo y botones 1-4) y Bloque C (Acordeón de ejercicios oficiales con respuesta revelable y notas personales).
- **Fin de lección**: Banner accesible en `SlideViewerComponent` al terminar diapositivas con botón directo a práctica.
- **Temario**: Desplegables de áreas de conocimiento clave (`data-testid="key-areas-dropdown"`) e insignia de test rápido (`data-testid="practice-quiz-badge"`) en `/temario/:examen/:tema`.
- **E2E F6 promovido**: `e2e/ronda2/f6-practica-subtema.spec.ts` 100% verde (4 tests); suite de fallos pendientes reducida a 3 (F1, F2, F3).
- **Pipeline general**: `npm run verify` verde (10/10 etapas, 80 tests E2E, 377 Karma + 36 Vitest).

## Comandos útiles
- `npm run verify:coverage -- <id>`: evalúa las 10 reglas de cobertura del subtema.
- `npm run report:coverage -- <id>`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run validation:register -- <id>`: registra hash SHA-256 en `validaciones.json`.
- `npm run verify:validations`: comprueba la integridad criptográfica de subtemas validados.
- `npm run verify`: pipeline completo de 10 etapas en verde (80 E2E specs + 36 Vitest specs + 377 Karma specs).
- `npm run e2e:pendientes`: ejecución de los 3 tests de fallos restantes F1, F2, F3 (en rojo).
