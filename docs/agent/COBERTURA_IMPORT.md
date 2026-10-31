# Cobertura de Importación Legacy (`COBERTURA_IMPORT.md`)

> Informe de progreso de la importación desde `_legacy/` hacia `content-src/`.  
> Actualizado: Fase 11 (Importación completa de lecciones y laboratorios).

---

## Tabla de Cobertura Global

| Tipo de contenido | Total en legacy | Importado real | % | Huecos / Motivo |
|---|---|---|---|---|
| **Subtemas con lección real** | 23 (101) + 19 (102) = 42 | 42 | 100,0 % | Todos los 42 subtemas oficiales importados con datos reales. |
| **Diapositivas** | 747 en subtemas + repasos | 770 | 100,0 % | 770 diapositivas estructuradas reales importadas (0 placeholders). |
| **Laboratorios / Prácticas** | 42 de subtemas (+ globales) | 42 | 100,0 % | 42 laboratorios con 131 misiones paso a paso reales importadas. |
| **Preguntas de Simulador** | 120 (101) + 120 (102) = 240 | 43 (Tema 103) | 17,9 % | 43 preguntas del Tema 103, resto en Tarea 11.3. |
| **Comandos** | 119 | 25 | 21,0 % | 25 comandos, catálogo completo en Tarea 11.4. |
| **Términos de Glosario** | 116 | 22 | 19,0 % | 22 términos, glosario completo en Tarea 11.4. |
| **Erratas del manual** | 21 | 21 | 100,0 % | 21 erratas registradas en `errata.yaml`. |

---

## Estado de la Importación de Laboratorios (Tarea 11.2)
- **Subtemas Examen 101**: 23 laboratorios en `content-src/labs/` (101.1 a 104.7).
- **Subtemas Examen 102**: 19 laboratorios en `content-src/labs/` (105.1 a 110.3).
- **Total Misiones**: 131 misiones guiadas con comandos reales de terminal, salidas esperadas y avisos de examen.
- **Validación**: 100% conformes con `LabSchema` (Zod). Manifiesto generado con `totalLabsPlaceholder = 0`.
