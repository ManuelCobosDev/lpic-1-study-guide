---
name: PROGRESO_R2
description: Tablero de progreso de la Ronda 2 (pasos R0-RF y los 19 subtemas del examen 102 con sus 6 estados). Léelo al iniciar cualquier paso de la Ronda 2.
---

# PROGRESO RONDA 2

Reglas: un paso o subtema solo pasa a "hecho" con su gate en PASS (spec 10). Los subtemas se hacen **en orden** y cada uno exige `VALIDADO <id>` del usuario antes de empezar el siguiente. Actualiza esta tabla al cerrar cada paso (la parte AUTO la rellena `npm run progress:r2`).

## Pasos de herramientas
| Paso | Qué | Estado | Fecha | Commit | Evidencia |
|---|---|---|---|---|---|
| R0 | Diagnóstico y línea base | hecho | 2026-11-01 | be19c8a | DIAGNOSTICO_R2.md + 5 tests en rojo |
| R1 | Extracción completa del PDF 102 | hecho | 2026-11-01 | 535d72f | units.json (9405 un), 594 pág (100% contabilidad), 4 figuras, tests Vitest y Python en verde |
| R2 | Herramientas de cobertura y validación | hecho | 2026-11-01 | f12ede6 | CLI cobertura (verify, report, progress, validation:register, verify:validations), 14 tests vitest OK |
| R3 | Enlaces tipo Wikipedia | hecho | 2026-11-01 | c98b648 | Engine autolink (15 tests), preview card interactiva, enlaces contextuales en /comandos y /glosario, E2E f5 promovido a verde (76 E2E) |
| R4 | Pestaña Practica lo aprendido | hecho | 2026-11-01 | cb34a1a | PracticeTabComponent (Bloques A, B, C), fin de slides CTA, insignias y áreas clave en temario, E2E f6 promovido a verde (80 E2E) |
| R5 | Flashcards masivas | pendiente | | | |
| R6 | Simulador examen 102 | pendiente | | | |
| R7 | Mapa mental | pendiente | | | |

## Subtemas del examen 102 (6 estados: 1 Extraído · 2 Trazado · 3 Completado · 4 Auto-verificado · 5 Auditado · 6 Validado)
| Subtema | 1 | 2 | 3 | 4 | 5 | 6 | Notas |
|---|---|---|---|---|---|---|---|
| 105.1 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (1605 unidades) |
| 105.2 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (531 unidades) |
| 106.1 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (244 unidades + 2 figuras) |
| 106.2 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (121 unidades + 2 figuras) |
| 106.3 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (97 unidades) |
| 107.1 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (524 unidades) |
| 107.2 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (433 unidades) |
| 107.3 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (242 unidades) |
| 108.1 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (610 unidades) |
| 108.2 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (1180 unidades) |
| 108.3 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (187 unidades) |
| 108.4 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (300 unidades) |
| 109.1 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (332 unidades) |
| 109.2 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (341 unidades) |
| 109.3 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (568 unidades) |
| 109.4 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (294 unidades) |
| 110.1 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (750 unidades) |
| 110.2 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (290 unidades) |
| 110.3 | ☑ | ☐ | ☐ | ☐ | ☐ | ☐ | Extraído (755 unidades) |

| Cierre | Estado |
|---|---|
| RF Verificación global | pendiente |

## Cifras automáticas
<!-- AUTO:BEGIN -->
| Subtema | Unidades (Map/Tot) | Tokens % | Diapositivas | Preguntas | Flashcards | Validación |
|---|---|---|---|---|---|---|
| 105.1 | 0 / 1606 | 0% | 19 | 0 | 0 | ⏳ Pendiente |
| 105.2 | 0 / 530 | 0% | 19 | 0 | 0 | ⏳ Pendiente |
| 106.1 | 0 / 245 | 0% | 19 | 0 | 0 | ⏳ Pendiente |
| 106.2 | 0 / 121 | 0% | 16 | 0 | 0 | ⏳ Pendiente |
| 106.3 | 0 / 96 | 0% | 15 | 0 | 0 | ⏳ Pendiente |
| 107.1 | 0 / 525 | 0% | 19 | 0 | 0 | ⏳ Pendiente |
| 107.2 | 0 / 433 | 0% | 19 | 0 | 0 | ⏳ Pendiente |
| 107.3 | 0 / 241 | 0% | 18 | 0 | 0 | ⏳ Pendiente |
| 108.1 | 0 / 611 | 0% | 16 | 0 | 0 | ⏳ Pendiente |
| 108.2 | 0 / 1180 | 0% | 19 | 0 | 0 | ⏳ Pendiente |
| 108.3 | 0 / 187 | 0% | 16 | 0 | 0 | ⏳ Pendiente |
| 108.4 | 0 / 299 | 0% | 16 | 0 | 0 | ⏳ Pendiente |
| 109.1 | 0 / 333 | 0% | 18 | 0 | 0 | ⏳ Pendiente |
| 109.2 | 0 / 341 | 0% | 18 | 0 | 0 | ⏳ Pendiente |
| 109.3 | 0 / 568 | 0% | 18 | 0 | 0 | ⏳ Pendiente |
| 109.4 | 0 / 293 | 0% | 16 | 0 | 0 | ⏳ Pendiente |
| 110.1 | 0 / 751 | 0% | 18 | 0 | 0 | ⏳ Pendiente |
| 110.2 | 0 / 290 | 0% | 16 | 0 | 0 | ⏳ Pendiente |
| 110.3 | 0 / 755 | 0% | 19 | 0 | 0 | ⏳ Pendiente |
<!-- AUTO:END -->

## Siguiente paso exacto
R3: abre una conversación nueva y escribe `/ejecutar-paso-r2 R3`.
