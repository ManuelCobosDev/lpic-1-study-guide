---
name: importar-contenido-legacy
description: Importa el contenido real del curso LPIC-1 desde _legacy/ a content-src/ con scripts reproducibles e idempotentes, y mide la cobertura. Úsala en las Fases 2 y 11 o cuando haya que añadir o corregir contenido importado. Requiere que el usuario haya decidido la estrategia (D-004).
---

# /importar-contenido-legacy

## Precondiciones
- Existe `docs/agent/INVENTARIO_LEGACY.md` y la decisión **D-004** (estrategia A, B o C) en `docs/agent/DECISIONS.md`. Si no, **detente** y pide ejecutar la Fase 1.
- Formatos de destino: `docs/spec/03-dominio.md §3.1` y `docs/spec/04-formato-lecciones.md`.

## Reglas
1. **Todo por scripts.** Importadores en `scripts/import-legacy/*.ts` (Node/TS), uno por tipo de contenido, orquestados por `npm run import:legacy`. Prohibido copiar y pegar contenido a mano.
2. **Idempotentes.** Ejecutarlos dos veces produce exactamente el mismo resultado (sin duplicados ni cambios de orden).
3. **El legacy no se toca.** Se lee de `_legacy/` y se escribe solo en `content-src/` y `public/content-assets/`.
4. **Conserva los ids originales** y deja el mapeo en `docs/agent/MAPEO_LEGACY.md` (id legacy → id nuevo, archivo de origen).
5. **Nada se descarta en silencio.** Lo que no se pueda importar se registra en el informe de cobertura con el motivo.
6. **No inventes ni reescribas contenido.** Normaliza solo lo técnico (espacios, codificación, entidades HTML, enlaces internos). Si ves un error de contenido, anótalo como errata candidata en `BACKLOG.md`, no lo corrijas.
7. Valida siempre con `npm run validate:content`; debe pasar.

## Procedimiento
1. **Tajada vertical primero**: importa UN subtema (103.4) completo (lección, práctica, preguntas, comandos y términos relacionados). Ábrelo en la app, captura pantalla y pide validación al usuario antes de seguir.
2. Con el visto bueno, importa **tipo a tipo** (diapositivas, prácticas, preguntas, comandos, glosario, erratas, mapa mental si procede), commit por tipo con su `C-NNNN`.
3. Tras cada tipo, actualiza `docs/agent/COBERTURA_IMPORT.md`.

## Informe de cobertura (`docs/agent/COBERTURA_IMPORT.md`)
| Tipo | Total en legacy | Importado | % | Huecos / motivo |
|---|---|---|---|---|
El total sale del inventario; lo importado lo cuenta el script, no tú. Debajo, lista de ids no importados y errores encontrados.
