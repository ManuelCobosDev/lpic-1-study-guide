# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0071

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último gate superado**: Gate R6 (Simulador examen 102, etiqueta `r2-R6-ok`).
- **Trabajo en curso**: Ninguno. Paso R6 completado con éxito.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Paso R7 · Mapa mental interactivo y robusto (F3)** (`/ejecutar-paso-r2 R7` en conversación nueva).

## Ronda 2 · Pasos de Herramientas
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia y referencias contextuales | completado (Gate R3 OK) |
| R4 | Pestaña Practica lo aprendido | completado (Gate R4 OK) |
| R5 | Flashcards masivas | completado (Gate R5 OK) |
| R6 | Simulador examen 102 | completado (Gate R6 OK) |
| R7 | Mapa mental interactivo y robusto | pendiente |

## Simulador Examen 102 y Selector de Examen (Gate R6)
- **Banco oficial 102**: 120 preguntas importadas en `content-src/questions/105.json … 110.json` con `status: 'pendiente-verificacion'`. Cobertura total de los 19 subtemas (105.1 a 110.3 con ≥ 1 pregunta, 0 vacíos).
- **Selector en `/simulador`**: Tabs accesibles Examen 101-500 y Examen 102-500 con persistencia en `localStorage` (`lpic1.v1.simulator_exam_id`).
- **Entrenar por tema**: Los chips se filtran dinámicamente según el examen elegido (101–104 o 105–110).
- **Aviso de revisión**: Banner discreto "Banco en revisión: N de M verificadas" con toggle "Usar solo preguntas verificadas".
- **Motor oficial 102**: Selección de 60 preguntas proporcional a los pesos oficiales (8/4/12/12/14/10), temporizador de 90:00 (5 400 s) sincronizado tras recarga, escala 200–800 y desglose de resultados por temas 105–110.
- **Enlaces directos**: `/simulador/examen?exam=102` y `/simulador/practica?exam=102&tema=105` operativos.
- **E2E F1 promovido**: `e2e/ronda2/f1-simulador-102.spec.ts` 100% verde (5 tests). Fallos pendientes reducidos a 1 (F3).
- **Pipeline general**: `npm run verify` verde (10/10 etapas, 90 tests E2E, 377 Karma + 46 Vitest).

## Comandos útiles
- `npm run verify:coverage -- <id>`: evalúa las 10 reglas de cobertura del subtema.
- `npm run report:coverage -- <id>`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run validation:register -- <id>`: registra hash SHA-256 en `validaciones.json`.
- `npm run verify:validations`: comprueba la integridad criptográfica de subtemas validados.
- `npm run verify`: pipeline completo de 10 etapas en verde (90 E2E specs + 46 Vitest specs + 377 Karma specs).
- `npm run e2e:pendientes`: ejecución del único test de fallo pendiente restante: F3 mapa mental (en rojo).
