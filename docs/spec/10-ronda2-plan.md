# 10. RONDA 2 · PLAN, PASOS Y GATES

## 10.1 Punto de partida y objetivo
La app ya existe y navega (Pack 1). El usuario ha detectado estos fallos, con capturas:

| # | Fallo | Paso que lo resuelve |
|---|---|---|
| F1 | El simulador solo tiene el examen 101; falta el 102 (el legacy lo tenía). | R6 |
| F2 | Solo hay 10 flashcards; faltan cientos. | R5 |
| F3 | El mapa mental no funciona. | R7 |
| F4 | A los subtemas les falta contenido respecto al manual oficial. | R1, R2 y bucle S-xxx |
| F5 | No hay sistema tipo Wikipedia: al pasar el cursor o hacer clic en un comando o término, ir a la sección donde se explica (glosario incluido). | R3 |
| F6 | Cada subtema necesita, tras las diapositivas, una sección "Practica lo aprendido": test rápido (≤ 10 preguntas) y flashcards (≤ 10). | R4 |

**Prioridad absoluta: el Examen 102** (temas 105–110, 19 subtemas). Fuente de verdad del contenido:
`D:\Github\lpic-1-study-guide\_legacy\Recurso Final Definitivo\LPI-Learning-Material-102-500-es.pdf`
(en el repo: `_legacy/Recurso Final Definitivo/LPI-Learning-Material-102-500-es.pdf`). El examen 101 queda fuera de alcance salvo no romperlo.

## 10.2 Principios (no negociables)
1. **Cobertura trazable, no opinión.** Todo hecho técnico del PDF debe poder localizarse en la app, y todo lo que la app diga debe poder localizarse en el PDF (o estar marcado como contenido del autor). Spec 11.
2. **Un subtema no se da por terminado hasta que el USUARIO escribe `VALIDADO <id>`.** Antes de eso: cobertura verde, auditoría independiente APTO e informe HTML entregado. No se pasa al siguiente subtema sin esa validación.
3. **Test primero en los bugs.** Se reproduce, se escribe el test que falla, se arregla, el test pasa (skill `/corregir-bug`).
4. **Un paso = una conversación nueva.** La memoria está en `docs/agent/` y git.
5. **Nunca se declara "100 %" sin evidencia:** el 100 % que se puede afirmar es el medido (unidades mapeadas, tokens técnicos presentes, auditoría) más la validación humana.

## 10.3 Tests pendientes (red de seguridad)
Los tests de los fallos viven en `e2e/ronda2/pendientes/` y **están excluidos de `npm run verify`** (se ejecutan con `npm run e2e:pendientes` y se espera que fallen al principio). Cuando un paso se completa, sus tests se mueven con `git mv` a `e2e/ronda2/` y desde ese momento forman parte de `verify`.

## 10.4 Orden de los pasos
`R0 → R1 → R2 → R3 → R4 → R5 → R6 → R7 → S-105.1 … S-110.3 (19 subtemas, en orden numérico) → RF`.
Las herramientas (R1–R7) van antes del bucle porque el bucle las usa. Cada paso termina con `/verificar-gate <id>` (gate definido aquí), etiqueta `r2-<id>-ok` y actualización de `docs/agent/PROGRESO_R2.md`. Después, DETENTE.

---

## R0 · Diagnóstico y línea base (no se arregla nada)
**Specs**: 00, 10. Objetivo: medir el estado real y dejar los 6 fallos como tests.
- Levanta la app (`npm run build` + `npm run preview`, y también `npm start`) y reproduce F1–F6 con navegador (capturas en `e2e/screenshots/r2-R0/`).
- Escribe `docs/agent/DIAGNOSTICO_R2.md`: (a) tabla de estado inicial con **cifras reales** (lecciones y diapositivas por subtema de los 42; comandos; términos; preguntas por tema 101–110; flashcards; prácticas; nodos del mapa mental; qué subtemas tienen laboratorio); (b) por cada fallo: cómo se reproduce, evidencia, **causa raíz probable** con archivo y línea; (c) qué contenido del legacy para el 102 existe y no se ha importado (preguntas del simulador, flashcards, mapa mental de ~475 nodos, etc.); (d) lista de PDFs presentes en `_legacy/Recurso Final Definitivo/` y confirmación de que el del 102 se puede abrir (nº de páginas).
- Crea en `e2e/ronda2/pendientes/` un spec por fallo (`f1-simulador-102.spec.ts`, `f2-flashcards-masivas.spec.ts`, `f3-mapa-mental.spec.ts`, `f5-enlaces-wikipedia.spec.ts`, `f6-practica-subtema.spec.ts`) con las aserciones de los gates de R3–R7. **Deben fallar ahora** y fallar por el motivo correcto (no por un error de sintaxis del test).
- Crea `docs/agent/PROGRESO_R2.md` si no existe (ya viene con el paquete) y rellena la línea base.
**Gate R0**: `DIAGNOSTICO_R2.md` completo con evidencia; 5 tests en rojo por la razón esperada; `git diff` solo toca `e2e/` y `docs/`; `npm run verify` sigue verde.

## R1 · Extracción completa del PDF 102
**Specs**: 11 (§11.1–11.3). **Skill**: `/extraer-pdf`.
- Antes de escribir nada, revisa los scripts del legacy (`_legacy/Recurso Final Definitivo/`) que extraigan o generen contenido y resume en `docs/agent/EXTRACCION_NOTAS.md` qué hacen y qué se reutiliza (ideas, no copiar a ciegas). El extractor nuevo debe funcionar solo y ser determinista.
- Crea `scripts/extract-pdf/` (Python con PyMuPDF; ver regla 20) y `npm run extract:pdf`. Salida en `content-src/_extract/102-500/` (formato en spec 11): `units.json`, `objectives.json`, `pages.json`, `figures/`, `extraction-report.md`, `extract-overview.html`.
- Añade a `.gitignore`: `content-src/_extract/` y `docs/agent/cobertura/` (texto derivado del PDF con licencia; reproducible con `npm run extract:pdf`).
**Gate R1**: 6 temas y 19 objetivos detectados con títulos y pesos coincidentes con `07-curriculo.md` (diferencias listadas); cada objetivo tiene áreas de conocimiento clave, lista parcial de archivos/términos/utilidades, contenido, y (si el PDF los trae) ejercicios guiados, exploratorios, resumen y respuestas; **contabilidad de páginas ≥ 99,5 %** (todo el texto de cada página está en una unidad o en una lista de exclusiones reconocidas: cabeceras, pies, números de página); ejecutar la extracción dos veces da hashes idénticos (test); tests unitarios del tokenizador. **El usuario valida** `extract-overview.html` (nº de páginas, objetivos, unidades por objetivo y 5 unidades al azar contra el PDF).

## R2 · Herramientas de cobertura y validación
**Specs**: 11 (§11.4–11.8). **Skill**: `/verificar-cobertura` (uso).
Scripts (Node/TS) con tests sobre un **fixture sintético**: `verify:coverage -- <id>`, `report:coverage -- <id>`, `progress:r2`, `validation:register -- <id>`, `verify:validations`, y la sintaxis `<!-- src: … -->` en el parser de lecciones (el build ignora los comentarios de trazabilidad en el render pero los conserva en el JSON).
**Gate R2**: los tests demuestran que se detecta: unidad sin mapear, token técnico ausente, bloque sin fuente, `src` con id inexistente, >20 diapositivas, pregunta sin fuente, y que **cambiar un archivo de un subtema validado invalida su validación**. El informe HTML se genera con rojo/verde sobre el fixture. `verify:validations` forma parte de `npm run verify`.

## R3 · Enlaces tipo Wikipedia
**Specs**: 13. Resuelve F5. **Gate R3**: criterios de spec 13 §13.7 con e2e (`f5-…` pasa a `e2e/ronda2/`).

## R4 · Pestaña "Practica lo aprendido"
**Specs**: 12 (§12.3–12.6). Resuelve F6. Incluye mostrar en `/temario/:examen/:tema` las áreas de conocimiento clave de cada subtema (desplegable). **Gate R4**: criterios de spec 12 §12.8 con e2e (`f6-…`).

## R5 · Flashcards masivas
**Specs**: 14 (§14.2). Resuelve F2. **Gate R5**: criterios de spec 14 §14.2 con e2e (`f2-…`).

## R6 · Simulador del examen 102
**Specs**: 14 (§14.1). Resuelve F1. **Gate R6**: criterios de spec 14 §14.1 con e2e (`f1-…`).

## R7 · Mapa mental
**Specs**: 14 (§14.3). **Skill**: `/corregir-bug`. Resuelve F3. **Gate R7**: criterios de spec 14 §14.3 con e2e (`f3-…`), probado en `npm start` **y** en el build de producción servido con `npm run preview`.

---

## Bucle por subtema S-105.1 … S-110.3
**Specs**: 11, 12. **Skills**: `/procesar-subtema`, `/auditar-subtema`, `/registrar-validacion`. Orden: 105.1, 105.2, 106.1, 106.2, 106.3, 107.1, 107.2, 107.3, 108.1, 108.2, 108.3, 108.4, 109.1, 109.2, 109.3, 109.4, 110.1, 110.2, 110.3.
Cada subtema recorre **6 estados**, y no avanza de estado ni de subtema sin cumplir el anterior:

| Estado | Lo hace | Condición para pasar |
|---|---|---|
| 1 Extraído | `/extraer-pdf` (R1) | Unidades del objetivo presentes |
| 2 Trazado | `/procesar-subtema` | Brechas analizadas, plan de diapositivas ≤ 20 |
| 3 Completado | `/procesar-subtema` | Lección, ejercicios, laboratorio, comandos, glosario, preguntas y flashcards escritos con `src` |
| 4 Auto-verificado | `npm run verify:coverage -- <id>` | 0 errores (100 % unidades mapeadas, 100 % tokens presentes o con exención aprobada, 0 bloques sin fuente) y `npm run verify` verde |
| 5 Auditado | `/auditar-subtema` (conversación nueva) | Veredicto APTO: 0 omisiones, 0 distorsiones, 0 claves de respuesta erróneas |
| 6 Validado | **el usuario** + `/registrar-validacion` | El usuario escribe literalmente `VALIDADO <id>` tras revisar el informe HTML |

**Gate del subtema S-xxx**: estados 1–6 completos; `docs/agent/validaciones.json` contiene el id con su hash; etiqueta `sub-<id>-ok`; `PROGRESO_R2.md` actualizado. Si el subtema anterior no está validado, `/procesar-subtema` **se niega a empezar**.

## RF · Verificación global y cierre
- `npm run verify:validations` y `npm run verify:coverage -- --all-102` en verde (19/19 subtemas validados y sin cambios desde su validación).
- `PROGRESO_R2.md` al 100 % para el 102; contadores de la app coherentes con el contenido (sin cifras a mano).
- Regresión: el examen 101 sigue funcionando (simulador, flashcards, lecciones). Crawler sin 404 ni `console.error`. axe sin violaciones serias. Presupuestos de bundle.
- Documentación actualizada (`CONTENT_GUIDE.md`: cómo trazar `src`, cómo añadir preguntas y flashcards). Etiqueta `ronda2-ok`.
- Entrega de un resumen para el usuario con las cifras finales y la lista de exenciones y de contenido `autor` aprobados.
