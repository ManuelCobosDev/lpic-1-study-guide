# Mapeo de Identificadores Legacy → Nuevo (`MAPEO_LEGACY.md`)

> Registro trazable de origen y destino de cada recurso importado desde `_legacy/`.  
> Actualizado: Fase 11 (Importación completa de los 42 subtemas de los Exámenes 101-500 y 102-500).

---

## 1. Lecciones y Diapositivas (42 Subtemas)
- **Origen**: `_legacy/Recurso Final Definitivo/content/t<tema>/<subtema>.json`
- **Destino**: `content-src/lessons/<subtema>.json` → `public/content/lessons/<subtema>.json`
- **Mapeo de identificadores**:
  - Examen 101 (23 subtemas):
    - Tema 101: `101.1`, `101.2`, `101.3` (desde `content/t101/`)
    - Tema 102: `102.1` a `102.6` (desde `content/t102/`)
    - Tema 103: `103.1` a `103.8` (desde `content/t103/`)
    - Tema 104: `104.1`, `104.2`, `104.3`, `104.5`, `104.6`, `104.7` (desde `content/t104/`)
  - Examen 102 (19 subtemas):
    - Tema 105: `105.1`, `105.2` (desde `content/t105/`)
    - Tema 106: `106.1`, `106.2`, `106.3` (desde `content/t106/`)
    - Tema 107: `107.1`, `107.2`, `107.3` (desde `content/t107/`)
    - Tema 108: `108.1` a `108.4` (desde `content/t108/`)
    - Tema 109: `109.1` a `109.4` (desde `content/t109/`)
    - Tema 110: `110.1`, `110.2`, `110.3` (desde `content/t110/`)
- **Diapositivas**: 770 diapositivas mapeadas con formato `<subtema>-slide-<id>` (bloques nativos tipados: cover, diagramas sanitizados, código bash, terminales, tablas de parámetros, retos y quizzes).

---

## 2. Laboratorios Prácticos (42 Laboratorios)
- **Origen**: `_legacy/Recurso Final Definitivo/practicas-v2/p-<subtema>-*.md`
- **Destino**: `content-src/labs/<subtema>.json` → `public/content/labs/lab-<subtema>.json`
- **Identificadores**: `lab-<subtema_con_guiones>` (ej. `lab-101-1`, `lab-103-4`, `lab-110-3`)
- **Misiones**: 131 misiones paso a paso con ID `step-<subtema>-<N>` que incluyen comando real en terminal, salida esperada, contexto e instrucción.

---

## 3. Banco de Preguntas del Simulador (240 Preguntas)
- **Origen Examen 101**: `_legacy/lpic1-slides-publico/simulador/preguntas_101.json` (120 preguntas)
- **Origen Examen 102**: `_legacy/lpic1-slides-publico/simulador/preguntas_102.json` (120 preguntas)
- **Destino**: `content-src/questions/<tema>.json` → `public/content/questions/<tema>.json`
- **Identificadores**: `q-<tema>-<id_legacy>` (ej. `q-101-1`, `q-103-83`, `q-110-83`)
- **Distribución por temas**:
  - Tema 101: 19 preguntas
  - Tema 102: 27 preguntas
  - Tema 103: 43 preguntas
  - Tema 104: 31 preguntas
  - Tema 105: 49 preguntas
  - Tema 106: 6 preguntas
  - Tema 107: 24 preguntas
  - Tema 108: 15 preguntas
  - Tema 109: 24 preguntas
  - Tema 110: 2 preguntas

---

## 4. Catálogo de Comandos (146 Comandos)
- **Origen**: `_legacy/lpic1-slides-publico/comandos.html` (119 filas) + extracción automática de comandos de las diapositivas de los 19 subtemas del Examen 102.
- **Destino**: `content-src/commands.yaml` → `public/content/commands.json`
- **Identificadores**: slug del nombre del comando (ej. `lspci`, `tee`, `xargs`, `useradd`, `ip`, `ss`, `crontab`, etc.).

---

## 5. Glosario Oficial (230 Términos)
- **Origen**: `_legacy/lpic1-slides-publico/glosario.html` (116 términos) + sección `GLOSARIO` de los archivos JSON de subtemas.
- **Destino**: `content-src/glossary.yaml` → `public/content/glossary.json`
- **Identificadores**: slug en kebab-case del término técnico en español/inglés.

---

## 6. Fe de Erratas (21 Erratas)
- **Origen**: `_legacy/lpic1-slides-publico/erratas.html`
- **Destino**: `content-src/errata.yaml` → `public/content/errata.json`
- **Identificadores**: `ERR-001` a `ERR-021`.
