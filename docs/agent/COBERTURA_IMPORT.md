# Cobertura de Importación Legacy (`COBERTURA_IMPORT.md`)

> Informe de progreso de la importación desde `_legacy/` hacia `content-src/`.  
> Actualizado: Fase 11 (Importación completa de todo el material del curso LPIC-1).

---

## Tabla de Cobertura Global

| Tipo de contenido | Total en legacy | Importado real | % | Huecos / Motivo |
|---|---|---|---|---|
| **Subtemas con lección real** | 23 (101) + 19 (102) = 42 | 42 | 100,0 % | Todos los 42 subtemas oficiales importados con datos reales. |
| **Diapositivas** | 747 en subtemas + repasos | 770 | 100,0 % | 770 diapositivas estructuradas reales importadas (0 placeholders). |
| **Laboratorios / Prácticas** | 42 de subtemas (+ globales) | 42 | 100,0 % | 42 laboratorios con 131 misiones paso a paso reales importadas. |
| **Preguntas de Simulador** | 120 (101) + 120 (102) = 240 | 240 | 100,0 % | 240 preguntas (120 de Examen 101 y 120 de Examen 102) validadas. |
| **Comandos** | 119 en cheatsheet + slides | 146 | 100,0 % | 146 comandos únicos con sintaxis, sinopsis y banderas (Exámenes 101 y 102). |
| **Términos de Glosario** | 116 en glosario + slides | 230 | 100,0 % | 230 términos técnicos con definición y referencias cruzadas. |
| **Erratas del manual** | 21 | 21 | 100,0 % | 21 erratas registradas en `errata.yaml`. |

---

## Estado Final de la Cobertura
- **Cobertura Global**: 100% de todo el material importable del curso LPIC-1.
- **Lecciones**: 42 lecciones en `content-src/lessons/` (770 diapositivas enriquecidas).
- **Laboratorios**: 42 laboratorios en `content-src/labs/` (131 misiones paso a paso con comandos y salidas).
- **Preguntas**: 240 preguntas en `content-src/questions/` (120 del 101 y 120 del 102).
- **Comandos**: 146 comandos en `content-src/commands.yaml`.
- **Glosario**: 230 términos en `content-src/glossary.yaml`.
- **Erratas**: 21 erratas oficiales en `content-src/errata.yaml`.
- **Placeholder en el manifiesto**: **0** (cero placeholders en toda la plataforma).
