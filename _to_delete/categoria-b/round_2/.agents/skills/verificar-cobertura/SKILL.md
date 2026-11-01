---
name: verificar-cobertura
description: Usa las herramientas de cobertura (verify:coverage, report:coverage, progress:r2, verify:validations) para medir qué parte del PDF oficial está reflejada en un subtema. Úsala siempre que haya que demostrar o comprobar cobertura, nunca a ojo.
---

# /verificar-cobertura <id | --all-102>

1. `npm run extract:pdf` si no existe `content-src/_extract/102-500/units.json`.
2. `npm run verify:coverage -- <id>` y copia la **salida real** (unidades totales/mapeadas, tokens totales/presentes, exenciones, bloques sin fuente, nº de diapositivas, pool de preguntas y flashcards).
3. Si hay errores: clasifícalos (unidad sin mapear · token ausente · bloque sin fuente · `src` inválido · >20 diapositivas · pool insuficiente · `explainedIn` ausente) y corrige el contenido, NO el verificador ni el ledger para esquivarlo. Las exenciones y omisiones exigen motivo concreto y no pueden superar el 3 %.
4. Repite hasta exit 0. Después `npm run report:coverage -- <id>` y `npm run progress:r2`.
5. Informa al usuario en una tabla: unidades X/X, tokens Y/Y, exenciones n (con motivos), contenido autor n, diapositivas n, preguntas n (verificadas m), flashcards n.
Si el verificador te parece incorrecto, para y avisa: no lo modifiques dentro de un paso de subtema.
