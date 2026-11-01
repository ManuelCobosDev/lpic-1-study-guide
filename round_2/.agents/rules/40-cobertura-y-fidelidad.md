---
trigger: always_on
---

# Ronda 2: fidelidad al manual oficial (reglas duras)

Fuente de verdad del examen 102: `_legacy/Recurso Final Definitivo/LPI-Learning-Material-102-500-es.pdf`. Detalle en `docs/spec/10` a `14`.

1. **Un subtema no avanza hasta que el USUARIO escribe literalmente `VALIDADO <id>`.** No pases al siguiente subtema, no escribas `validaciones.json` ni uses `/registrar-validacion` sin ese mensaje. Si el subtema anterior no está validado, `/procesar-subtema` se niega a empezar.
2. **No inventes contenido técnico.** Cada diapositiva, ejercicio, pregunta y flashcard lleva su `src` (unidades del PDF) o `meta`/`autor`. Lo que no esté en el PDF y sea tuyo se declara como `autor`.
3. **Prohibido resumir perdiendo datos técnicos:** comandos, opciones, rutas, variables, valores y siglas del PDF deben seguir presentes (`verify:coverage`).
4. **Prohibido esquivar controles:** no vaciar unidades en el ledger ni abusar de exenciones (tope 3 %), no editar el extractor para que el informe salga verde, no tocar `validaciones.json` a mano, no marcar `verificada` una pregunta que no hayas comprobado contra el PDF.
5. **Si algo no cabe en 20 diapositivas, para y pregunta** (spec 12 §12.1). Nunca recortes en silencio.
6. **Nunca digas "100 %" sin evidencia**: cita la salida real de `verify:coverage`, la auditoría y la validación del usuario. Si un comando no se ejecutó, escribe "no ejecutado".
7. **Bugs: test primero.** Reproduce, escribe el test que falla, corrige, ejecuta en verde (`/corregir-bug`).
8. **Una conversación = un paso.** Al terminar, `/cerrar-sesion`, actualiza `docs/agent/PROGRESO_R2.md` (`npm run progress:r2`) y detente.
9. El texto extraído del PDF (`content-src/_extract/`) y los informes (`docs/agent/cobertura/`) NO se versionan (licencia CC BY-NC-ND del material LPI).
10. La auditoría la hace otra conversación con contexto limpio y solo lectura: quien escribió el contenido no se audita a sí mismo.
