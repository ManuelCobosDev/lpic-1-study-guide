# Mapeo de Identificadores Legacy → Nuevo (`MAPEO_LEGACY.md`)

> Registro trazable de origen y destino de cada recurso importado desde `_legacy/`.  
> Actualizado: Fase 2 (Tajada vertical 103.4 de punta a punta).

---

## 1. Lección 103.4
- **Archivo de origen**: `_legacy/Recurso Final Definitivo/content/t103/103.4.json`
- **Destino**: `content-src/lessons/103.4.json` → `public/content/lessons/103.4.json`
- **Mapeo de diapositivas**:
  - Diapositivas legacy 1..19 → `103.4-slide-1` .. `103.4-slide-19`
  - Bloques nativos tipados: cover, diagramas conceptuales, terminal bash, tablas de operadores, checkpoints quiz-inline, comparativas y resúmenes.

---

## 2. Laboratorio Práctico 103.4
- **Archivo de origen**: `_legacy/Recurso Final Definitivo/practicas-v2/p-103-4-redirecciones-tuberias.md`
- **Destino**: `content-src/labs/103.4.yaml` → `public/content/labs/lab-103-4.json`
- **Mapeo de misiones**:
  - Misión 1 (Separación stdout / stderr) → `mision-1`
  - Misión 2 (Unificación 2>&1 y /dev/null) → `mision-2`
  - Misión 3 (Concatenación >> y entrada <) → `mision-3`
  - Misión 4 (Here Docs << y Here Strings <<<) → `mision-4`
  - Misión 5 (Tuberías | y tee) → `mision-5`
  - Misión 6 (xargs y -print0 / -0) → `mision-6`

---

## 3. Preguntas de Examen (Tema 103)
- **Archivo de origen**: `_legacy/lpic1-slides-publico/simulador/preguntas_101.json` (filtrado por `tema === 103`)
- **Destino**: `content-src/questions/103.yaml` → `public/content/questions/103.json`
- **Total preguntas**: 43 preguntas oficiales
- **Normalización**: Enunciados y opciones traducidos a español neutro; tipado estricto Zod (`single`, `multiple`, `fill`).
- **Mapeo de IDs**: `id: N` en legacy → `id: q-103-N`.

---

## 4. Comandos (≥ 20)
- **Origen**: Inventario de 103.4 (`state/inventario/103.4.md`) y cheatsheet legacy
- **Destino**: `content-src/commands.yaml` → `public/content/commands.json`
- **Comandos importados (25)**: `tee`, `xargs`, `cat`, `head`, `tail`, `wc`, `grep`, `sort`, `uniq`, `tr`, `sed`, `cut`, `paste`, `split`, `od`, `pr`, `tac`, `find`, `echo`, `set`, `zcat`, `bzcat`, `xzcat`, `date`, `uname`.

---

## 5. Glosario de Términos (≥ 20)
- **Origen**: Inventario conceptual de 103.4 (`state/inventario/103.4.md`) y glosario legacy
- **Destino**: `content-src/glossary.yaml` → `public/content/glossary.json`
- **Términos importados (22)**: `stdin`, `stdout`, `stderr`, `descriptor de archivo`, `tubería`, `redirección`, `/dev/null`, `noclobber`, `Here Document`, `Here String`, `bifurcación (tee)`, `sustitución de comandos`, `xargs`, `carácter nulo (-print0)`, `filtro`, `flujo estándar`, `truncamiento`, `concatenación`, `fusión de flujos (2>&1)`, `buffer de E/S`, `pipeline`, `escape de caracteres`.

