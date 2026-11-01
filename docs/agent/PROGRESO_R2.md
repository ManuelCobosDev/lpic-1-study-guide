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
| R2 | Herramientas de cobertura y validación | pendiente | | | |
| R3 | Enlaces tipo Wikipedia | pendiente | | | |
| R4 | Pestaña Practica lo aprendido | pendiente | | | |
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
(sin datos: ejecuta `npm run progress:r2` cuando existan las herramientas del paso R2)
<!-- AUTO:END -->

## Siguiente paso exacto
R1: abre una conversación nueva y escribe `/ejecutar-paso-r2 R1`.
