# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0073

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último hito superado**: Auto-verificación de Cobertura 100% Subtema 105.1 (Estado 4: Auto-verificado).
- **Trabajo en curso**: Ninguno. Subtema 105.1 auto-verificado y detenido para auditoría independiente.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Auditoría independiente de 105.1**: Abrir una conversación nueva y ejecutar `/auditar-subtema 105.1`. (No avanzar a 105.2 ni validar sin `VALIDADO 105.1` explícito del usuario).

## Ronda 2 · Pasos de Herramientas (R0 - R7)
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia y referencias contextuales | completado (Gate R3 OK) |
| R4 | Pestaña Practica lo aprendido | completado (Gate R4 OK) |
| R5 | Flashcards masivas | completado (Gate R5 OK) |
| R6 | Simulador examen 102 | completado (Gate R6 OK) |
| R7 | Mapa mental interactivo y robusto | completado (Gate R7 OK) |

## Subtema 105.1 · Auto-verificado (100% Cobertura)
- **Unidades PDF**: 1606 / 1606 (1576 mapeadas, 30 omitidas con motivo en ledger, 0 sin cubrir).
- **Tokens técnicos**: 2640 / 2640 cubiertos (100%), 2 exenciones justificadas por erratas tipográficas del manual (0.08% << 3% máx).
- **Lección**: 20 diapositivas estructuradas con trazabilidad estricta y presupuestos de densidad respetados.
- **Ejercicios oficiales**: 42 ejercicios guiados y exploratorios con sus respuestas íntegras en `content-src/exercises/105.1.yaml`.
- **Laboratorio**: 5 misiones completas y verificadas en `content-src/labs/105.1.json`.
- **Comandos y glosario**: `source`, `env`, `unset`, `unalias`, `shopt`, `export`, `set` y 8 términos de glosario oficiales.
- **Preguntas**: 12 preguntas oficiales en pool verificado para 105.1.
- **Flashcards**: 20 flashcards específicas en `content-src/flashcards-extra.yaml`.
- **Informe HTML**: generado en `docs/agent/cobertura/105.1.html`.
- **Pipeline maestro**: `npm run verify` verde (10/10 etapas, 98 E2E, 377 Karma + 46 Vitest).

## Comandos útiles
- `npm run verify:coverage -- 105.1`: evalúa las 10 reglas de cobertura del subtema 105.1.
- `npm run report:coverage -- 105.1`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run verify`: pipeline completo de 10 etapas en verde (98 E2E specs + 46 Vitest specs + 377 Karma specs).
