---
name: registrar-validacion
description: Registra la validación humana de un subtema del 102 (hash, validaciones.json, etiqueta) SOLO después de que el usuario escriba literalmente "VALIDADO <id>". Úsala únicamente en ese caso.
---

# /registrar-validacion <id>

## Condiciones (todas, o te niegas)
1. El mensaje del usuario en esta conversación contiene literalmente `VALIDADO <id>`. Un "vale", "ok" o "sigue" no cuentan. Ante la duda, pídelo.
2. Existe `docs/agent/auditorias/<id>.md` con veredicto **APTO** y la auditoría es posterior al último commit que toca el subtema (comprueba con `git log`).
3. `npm run verify:coverage -- <id>` da exit 0 ahora mismo y `npm run verify` está verde.

## Pasos
1. `npm run validation:register -- <id>` (calcula el hash y escribe `docs/agent/validaciones.json`). No edites ese archivo a mano.
2. Añade una línea a `docs/agent/VALIDACIONES.md`: id · fecha · commit · exenciones y contenido `autor` aprobados por el usuario.
3. `npm run progress:r2`; `/cerrar-sesion`; etiqueta `sub-<id>-ok`.
4. Indica el siguiente subtema del orden y el comando exacto (`/procesar-subtema <siguiente>` en conversación nueva). Si era 110.3, indica que toca el paso RF.
