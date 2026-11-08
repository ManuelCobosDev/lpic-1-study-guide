# Esquemas de Base de Datos SQLite, Sub-APIs Python y Ficheros de Salida (`/validar-temario-pdf`)

Este documento detalla el modelo de persistencia en SQLite, las rutas dinámicas del servidor Python (`pdf_validation_server.py`) y los esquemas JSON/YAML de extracción y evaluación comparativa.

---

## 1. Base de Datos Local SQLite (`content-src/_extract/validacion-masiva/validation_state.db`)

Configurada en modo `WAL` (`PRAGMA journal_mode=WAL;`) para permitir lecturas y escrituras concurrentes desde múltiples subagentes de Capa 2 y Capa 3 sin bloqueos.

### Tablas de Control de Estado Masivo

1. **`pdf_runs`**: Estado global del PDF en validación (~600 páginas).
   - `exam_id` (`PRIMARY KEY`, ej. `101-500`, `102-500`)
   - `pdf_path`, `total_pages`, `curriculum_start_page`, `curriculum_end_page`
   - `topics_count`, `subtopics_count`, `sections_count`, `structure_json_path`
   - `status` (`INITIALIZED` | `IN_PROGRESS` | `COMPLETED`)

2. **`topics`**: Un registro por Tema detectado (4 en `101-500`; 6 en `102-500`).
   - `topic_id` (`PRIMARY KEY`, ej. `101`..`104`, `105`..`110`)
   - `exam_id`, `title`, `start_page`, `end_page`, `subtopics_count`
   - `api_endpoint` (ej. `/api/topic/101`)
   - `status` (`PENDING` | `VALIDATED`)

3. **`subtopics`**: Un registro por Subtema oficial (23 en `101-500`; 19 en `102-500`).
   - `subtopic_id` (`PRIMARY KEY`, ej. `101.1`)
   - `exam_id`, `topic_id`, `title`, `weight`, `start_page`, `end_page`, `lessons_count`
   - `extraction_status` (`PENDING` | `OK`) — pasa automáticamente a `OK` cuando sus 3 secciones están en `OK`.
   - `comparison_status` (`PENDING` | `OK`) — pasa a `OK` cuando el subagente de Capa 3B guarda el dictamen.
   - `score_total` (`0.0` – `100.0`), `verdict`, `report_json_path`, `report_md_path`

4. **`sections`**: Las 3 Sub-Secciones internas de cada Subtema (69 en `101-500`; 57 en `102-500`).
   - `section_id` (`PRIMARY KEY`, ej. `101.1#teoria_lecciones`)
   - `section_slug` (`metadatos_y_resumen` | `teoria_lecciones` | `ejercicios_y_respuestas`)
   - `api_endpoint` (ej. `/api/topic/101/subtopic/101.1/section/teoria_lecciones`)
   - `status` (`PENDING` | `OK`), `extracted_json_path`, `units_count`, `commands_count`, `terms_count`, `exercises_count`

5. **`page_ledger`**: Contabilidad página a página de las ~600 páginas del PDF.
   - Clave compuesta `(exam_id, page_number)` (desde la página 1 hasta `total_pages`).
   - `page_role`: `FRONT_MATTER` | `TOPIC_COVER` | `CURRICULUM` | `IMPRINT`
   - `extracted_status`: `EXEMPT_FRONT_MATTER` | `EXEMPT_TOPIC_COVER` | `EXEMPT_IMPRINT` | `PENDING` | `EXTRACTED` | `VALIDATED`
   - **Condición de parada (`can_stop == true`)**: `pending_curriculum_pages == 0` y todos los subtemas con `comparison_status == 'OK'`.

6. **`validation_reports`**: Almacén consolidado de puntajes y métricas de cada subtema.
   - `subtopic_id`, `exam_id`, `topic_id`, `score_total`, `score_commands`, `score_definitions`, `score_theory`, `score_exercises`, `verdict`, `missing_items_count`, `extra_items_count`, `distorted_items_count`, `summary_text`, `report_json`

---

## 2. Mapa de APIs HTTP del Servidor Python y Equivalentes CLI

El servidor se levanta en `http://127.0.0.1:8765` con:
```powershell
python .agents/skills/validar-temario-pdf/scripts/pdf_validation_server.py serve --port 8765
```

| Nivel | Ruta HTTP | Comando CLI Equivalente | Quién la consume |
|---|---|---|---|
| **Raíz (Init)** | `POST /api/init` `{"pdf_path": "..."}` | `init --pdf "<ruta_pdf>"` | Capa 1 (Orquestador) |
| **Raíz (Estructura)** | `GET /api/exam/<exam_id>/structure` | Lee `structure-input.json` | Capa 1 (Orquestador) |
| **Raíz (Progreso BBDD)** | `GET /api/exam/<exam_id>/progress` | `progress --exam <exam_id>` | Capa 1 y Capa 2 |
| **API por Tema** | `GET /api/topic/<topic_id>` | `progress --exam <exam_id>` | Capa 2 (`coordinador-tema`) |
| **Sub-API Sección (Extracción)** | `GET /api/topic/<tid>/subtopic/<sid>/section/<slug>` | `extract-section --exam <id> --subtopic <sid> --section <slug>` | Capa 3A (`extractor-seccion-pdf`) |
| **Sub-API Pre-Comparación** | `GET /api/topic/<tid>/subtopic/<sid>/pre-compare` | `pre-compare --exam <id> --subtopic <sid>` | Capa 3B (`validador-comparador-web`) |
| **Sub-API Guardar Puntaje** | `POST /api/topic/<tid>/subtopic/<sid>/save-comparison` | `save-comparison --exam <id> --subtopic <sid> --input-json <path>` | Capa 3B (`validador-comparador-web`) |
| **Informe Maestro** | *(Consolidación final)* | `master-report --exam <exam_id>` | Capa 1 (Orquestador) |

---

## 3. Rúbrica de Puntaje (0 a 100) y Veredictos

Cada subtema recibe un puntaje ponderado sobre 100 puntos:

$$\text{Score Total} = 0.30 \times S_{\text{comandos}} + 0.20 \times S_{\text{definiciones}} + 0.25 \times S_{\text{teoría}} + 0.25 \times S_{\text{prácticas}}$$

1. **`commands_flags_paths` (30%)**:
   - Evalúa que ningún comando, opción/flag (`-a`, `--long`), ruta del sistema (`/etc/...`, `/proc/...`, `/sys/...`), fichero de configuración o variable de entorno (`$PATH`, `HISTControl`, etc.) citado en el PDF se haya escapado en la lección web, laboratorio o `commands.yaml`.
2. **`definitions_glossary` (20%)**:
   - Evalúa que todos los términos en negrita/cursiva del PDF, siglas y elementos de la *"Lista parcial de archivos, términos y utilidades"* estén definidos en la lección o en `glossary.yaml`.
3. **`theory_statements` (25%)**:
   - Evalúa que todas las *"Áreas de conocimiento clave"* y las explicaciones conceptuales de las Lecciones 1..N del PDF estén explicadas sin recortes ni distorsiones en `content-src/lessons/<id>.json`. Si la lección tiene `placeholder: true` o es un esqueleto ($\le 3$ diapositivas), recibe máximo `15/100`.
4. **`exercises_practical` (25%)**:
   - Evalúa que tanto los **Ejercicios Guiados** como los **Ejercicios Exploratorios** (y sus respuestas oficiales) del PDF estén cubiertos en las diapositivas de práctica de la lección o en `content-src/labs/<id>.json`. Si el laboratorio es un esqueleto (`placeholder: true`), recibe máximo `10/100`.

### Escala de Veredictos
- **`EXCELENTE` ($\ge 95.0$)**: Fidelidad total o casi total al manual oficial LPI.
- **`APTO_CON_HUECOS` ($80.0 - 94.9$)**: Buena base teórica/práctica, pero faltan flags, rutas o ejercicios puntuales.
- **`INCOMPLETO` ($50.0 - 79.9$)**: Cobertura parcial; requiere ampliar diapositivas, comandos o ejercicios del manual.
- **`CRITICO_ESQUELETO` ($< 50.0$)**: Lección o laboratorio en estado esqueleto/stub o con graves omisiones.
