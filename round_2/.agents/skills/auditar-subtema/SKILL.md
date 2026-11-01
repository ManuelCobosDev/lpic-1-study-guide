---
name: auditar-subtema
description: Audita de forma independiente (solo lectura, contexto limpio) que un subtema del 102 refleja fielmente el manual oficial, comparando hechos atómicos del PDF con la app. Úsala en una conversación nueva con "/auditar-subtema 105.1" después de procesar-subtema.
---

# /auditar-subtema <id>

Eres un auditor externo. **No has escrito este contenido y no lo defiendes.** Solo lectura: no edites lecciones, preguntas, ledger ni verificadores. Solo puedes crear `docs/agent/auditorias/<id>.md` y `docs/agent/auditorias/<id>-evidencias/` si hace falta.

## Método
1. Ejecuta `npm run verify:coverage -- <id>` (debe dar exit 0; si no, veredicto NO APTO inmediato).
2. Lee el PDF del objetivo directamente (páginas indicadas en `objectives.json`; puedes rasterizar páginas para ver tablas y figuras) y descompón su contenido en **hechos atómicos** (una afirmación comprobable cada uno: un comando y su función, una opción, una ruta, un valor, una regla, un paso de ejercicio, un término y su definición).
3. Para CADA hecho busca en la app (lección, ejercicios, laboratorio, comandos, glosario) si aparece con el mismo significado. Registra: hecho · página PDF · dónde en la app · OK / OMITIDO / DISTORSIONADO.
4. **Dirección inversa**: recorre cada diapositiva, ejercicio y entrada de comandos/glosario y comprueba que no afirma nada que contradiga o no esté en el PDF (salvo `autor` declarado). Anota INVENTADO / CONTRADICE.
5. Preguntas y flashcards: toma TODAS las preguntas `verificada` y comprueba su clave contra el PDF; revisa que no haya duplicados ni respuestas dobles. Revisa las flashcards (reverso correcto).
6. Muestreo extra: elige 10 pasajes al azar del PDF (con una semilla anotada) y compruébalos palabra por palabra.
7. Revisa que los ejercicios del manual están completos (enunciado + respuesta) y que el laboratorio ejecuta lo que dice (comandos con sintaxis correcta).

## Salida: `docs/agent/auditorias/<id>.md`
- Resumen: nº de hechos revisados, OK, omitidos, distorsionados, inventados; nº de preguntas/flashcards revisadas y erróneas.
- Tabla de hallazgos con severidad (bloqueante/menor).
- **Veredicto: APTO** (0 omisiones, 0 distorsiones, 0 inventados no declarados, 0 claves erróneas) **o NO APTO** con la lista exacta de correcciones.
- Limitaciones: qué no pudiste verificar (figuras ambiguas, tablas complejas).
Si es NO APTO: el usuario volverá a `/procesar-subtema <id>` en otra conversación para corregir y luego a auditar de nuevo. No arregles tú.
