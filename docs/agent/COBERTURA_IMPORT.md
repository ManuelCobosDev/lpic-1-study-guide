# Cobertura de Importación Legacy (`COBERTURA_IMPORT.md`)

> Informe de progreso de la importación desde `_legacy/` hacia `content-src/`.  
> Actualizado: Fase 2 (Tajada vertical 103.4 de punta a punta).

---

## Tabla de Cobertura Global

| Tipo de contenido | Total en legacy | Importado real | % | Huecos / Motivo |
|---|---|---|---|---|
| **Subtemas con lección real** | 23 (101) + 19 (102) = 42 | 1 (103.4) | 2,4 % | Resto con relleno determinista hasta Fase 11 (importación completa). |
| **Diapositivas** | 437 (101) | 19 (103.4) | 4,3 % | Resto con relleno determinista (328 diapositivas) hasta Fase 11. |
| **Laboratorios / Prácticas** | 27 (23 subtema + 4 globales) | 1 (103.4) | 3,7 % | Resto con relleno determinista (41 prácticas) hasta Fase 11. |
| **Preguntas de Simulador** | 120 (101) | 43 (Tema 103) | 35,8 % | 43 preguntas del Tema 103 importadas y 100% en español; resto en Fase 11. |
| **Comandos** | 126 | 25 | 19,8 % | 25 comandos asociados al subtema 103.4 importados; resto en Fase 11. |
| **Términos de Glosario** | 116 | 22 | 18,9 % | 22 términos clave asociados al 103.4 importados; resto en Fase 11. |
| **Erratas del manual** | 21 | 0 | 0 % | Se importan en la Fase 10/11. |

---

## Estado de la Tajada Vertical 103.4
- **Lección**: 103.4 importada con 19 diapositivas estructuradas, documento web continuo y referencias wiki integradas.
- **Laboratorio**: 103.4 importado con 6 misiones guiadas paso a paso con comandos, salidas esperadas y avisos de examen.
- **Preguntas**: 43 preguntas del Tema 103 importadas y normalizadas con Zod en español.
- **Comandos**: 25 comandos catalogados con banderas, sinopsis y ejemplos.
- **Glosario**: 22 términos definidos con referencias cruzadas.
- **Idempotencia**: Verificada mediante test automatizado (`scripts/import-idempotent.spec.ts`).

