---
name: procesar-subtema
description: Completa un subtema del examen 102 hasta cobertura verificada del 100% del manual oficial (lección con trazabilidad, ejercicios, laboratorio, comandos, glosario, preguntas y flashcards) y se detiene para auditoría. Úsala con "/procesar-subtema 105.1".
---

# /procesar-subtema <id>   (por ejemplo 105.1)

## 0. Precondiciones (si falla una, DETENTE y dilo)
- R1 y R2 hechos en `PROGRESO_R2.md`; existe `content-src/_extract/102-500/units.json` con el objetivo `<id>`.
- **El subtema anterior del orden (spec 10 §bucle) figura en `docs/agent/validaciones.json`.** Para 105.1 no hay anterior. Sin validación del anterior, **te niegas a empezar**.
- Trabajas solo en este subtema; no toques otros salvo para corregir un fallo suyo detectado.

## 1. Análisis de brechas
Lee SOLO las unidades del objetivo `<id>` y el contenido actual (`content-src/lessons/<id>.md`, ejercicios, laboratorio, comandos/glosario ligados, preguntas, flashcards). Produce `docs/agent/cobertura/<id>-brechas.md` (no versionado): tabla unidad → ¿está? → dónde → qué falta. Anota además lo existente que NO está en el PDF (candidato a `autor` o a eliminar).

## 2. Plan de diapositivas (spec 12 §12.1)
Plantilla fija: portada → áreas clave → lista parcial → contenido en orden del PDF → resumen. **≤ 20 diapositivas**, las que hagan falta sin repetir. Si no cabe sin saturar (≤ 140 palabras, ≤ 14 líneas de código, ≤ 7 viñetas por diapositiva), **detente y presenta las opciones A/B/C** de §12.1; no decidas tú.
Muestra el plan (título de cada diapositiva y unidades que cubre) al usuario como parte del informe final.

## 3. Escritura
- `lessons/<id>.md` con `<!-- src: … -->` en cada diapositiva. Conserva el contenido legacy que sea correcto; corrige lo que contradiga al PDF; marca `autor` lo que no tenga respaldo.
- `exercises/<id>.yaml`: TODOS los ejercicios guiados y exploratorios del PDF y sus respuestas, sin resumir.
- Laboratorio: revisa el existente contra el PDF; corrige comandos o salidas erróneas; añade lo que falte para que cada comando del subtema se pueda practicar.
- `commands.yaml` y `glossary.yaml`: todo comando/término del subtema, con `short`, `aliases` y opciones documentadas; `explainedIn` se calcula en el build (spec 13).
- Preguntas: conserva y verifica las del legacy (cada clave contra el PDF) y completa hasta el pool mínimo de spec 12 §12.6. `status: verificada` solo tras comprobar.
- Flashcards: `flashcards-extra.yaml` según spec 12 §12.6.
- Ledger `content-src/coverage/<id>.ledger.yaml` solo con omisiones legítimas (cabeceras, repeticiones literales) y motivo.

## 4. Verificación propia
`/verificar-cobertura <id>` hasta exit 0 + `npm run verify` verde + `npm run build:content` sin avisos. Genera el informe HTML.

## 5. Cierre del paso (y DETENTE)
`/cerrar-sesion` (commit `feat(contenido): <id> cobertura completa [C-NNNN]`; estado en PROGRESO_R2: "Auto-verificado"). Entrega al usuario: cifras reales, ruta del informe HTML, plan de diapositivas, lista de exenciones/`autor`, y las instrucciones EXACTAS del siguiente paso: abrir **una conversación nueva** y ejecutar `/auditar-subtema <id>`. **No declares el subtema terminado ni pases al siguiente.**
