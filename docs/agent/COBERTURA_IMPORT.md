# Cobertura de Importación Legacy (`COBERTURA_IMPORT.md`)

> Informe de progreso de la importación desde `_legacy/` hacia `content-src/`.  
> Actualizado: Fase 11 (Importación completa de lecciones, laboratorios y banco de preguntas).

---

## Tabla de Cobertura Global

| Tipo de contenido | Total en legacy | Importado real | % | Huecos / Motivo |
|---|---|---|---|---|
| **Subtemas con lección real** | 23 (101) + 19 (102) = 42 | 42 | 100,0 % | Todos los 42 subtemas oficiales importados con datos reales. |
| **Diapositivas** | 747 en subtemas + repasos | 770 | 100,0 % | 770 diapositivas estructuradas reales importadas (0 placeholders). |
| **Laboratorios / Prácticas** | 42 de subtemas (+ globales) | 42 | 100,0 % | 42 laboratorios con 131 misiones paso a paso reales importadas. |
| **Preguntas de Simulador** | 120 (101) + 120 (102) = 240 | 240 | 100,0 % | 240 preguntas (120 de Examen 101 y 120 de Examen 102) validadas. |
| **Comandos** | 119 | 25 | 21,0 % | 25 comandos, catálogo completo en Tarea 11.4. |
| **Términos de Glosario** | 116 | 22 | 19,0 % | 22 términos, glosario completo en Tarea 11.4. |
| **Erratas del manual** | 21 | 21 | 100,0 % | 21 erratas registradas en `errata.yaml`. |

---

## Estado de la Importación de Preguntas (Tarea 11.3)
- **Examen 101**: 120 preguntas oficiales distribuidas en Temas 101 (19), 102 (27), 103 (43) y 104 (31).
- **Examen 102**: 120 preguntas oficiales distribuidas en Temas 105 (49), 106 (6), 107 (24), 108 (15), 109 (24) y 110 (2).
- **Total Preguntas**: 240 preguntas completas con opciones, respuestas correctas, dificultad y explicaciones oficiales.
- **Validación**: 100% conformes con `TopicQuestionsSchema` y `QuestionSchema` (Zod). Manifiesto generado con `totalQuestionsPlaceholder = 0`.
