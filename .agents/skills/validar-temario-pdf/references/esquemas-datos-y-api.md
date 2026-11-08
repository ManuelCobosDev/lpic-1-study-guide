# Esquemas de Base de Datos SQLite WAL, Planificador Hardware-Aware y Sub-APIs Paralelas (`/validar-temario-pdf`)

Este documento detalla el modelo de persistencia concurrente en SQLite, el motor de auto-detección de hardware y planificación de oleadas paralelas (`concurrency_plan`), las rutas dinámicas del servidor Python (`pdf_validation_server.py`) y los esquemas JSON/YAML de extracción y evaluación comparativa.

---

## 1. Auto-Detector de Hardware y Planificador de Concurrencia (`concurrency_plan`)

El motor [`detect_hardware_profile()`](file:///d:/Github/lpic-1-study-guide/.agents/skills/validar-temario-pdf/scripts/pdf_validation_server.py#L118-L176) y [`compute_concurrency_plan()`](file:///d:/Github/lpic-1-study-guide/.agents/skills/validar-temario-pdf/scripts/pdf_validation_server.py#L179-L234) inspeccionan el hardware físico de la máquina (CPUs lógicos vía `os.cpu_count()` y RAM total/libre vía `GlobalMemoryStatusEx` en Windows) y calculan los límites óptimos de paralelismo:

| Parámetro Calculado | Máquina 16 CPUs / 32 GB RAM (`HIGH_END_WORKSTATION`) | Máquina 8 CPUs / 16 GB RAM (`MID_RANGE_MULTI_CORE`) | Máquina $\le 4$ CPUs / 8 GB RAM (`CONSERVATIVE_LOW_RAM`) |
|---|---:|---:|---:|
| `python_thread_pool_workers` | **14 hilos CPU** | 6 hilos CPU | 2–4 hilos CPU |
| `max_parallel_layer2_topic_agents` | **4–6 temas simultáneos** | 3 temas simultáneos | 2 temas simultáneos |
| `max_global_layer3_subagents` | **12 subagentes simultáneos** | 6 subagentes simultáneos | 4 subagentes simultáneos |
| `max_parallel_layer3_subagents_per_topic` | **3 por tema** | 2 por tema | 2 por tema |
| `subtopics_per_wave_per_topic` | **3 subtemas por oleada** | 2 subtemas por oleada | 2 subtemas por oleada |

Cada subtema recibe automáticamente un `wave_index` (`1, 2, 3...`) dentro de su Tema en `structure-input.json` y en la tabla SQLite `subtopics`.

---

## 2. Base de Datos Local SQLite (`content-src/_extract/validacion-masiva/validation_state.db`)

Configurada en modo `WAL` (`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=45000;`) y protegida por `DB_WRITE_LOCK` + reintento con backoff exponencial (`run_db_write_transaction`) para soportar escrituras concurrentes de múltiples hilos Python y subagentes sin errores `database is locked`.

### Tablas de Control de Estado Masivo

1. **`pdf_runs`**: Estado global del PDF en validación (~600 páginas) y el `concurrency_plan_json` detectado.
2. **`topics`**: Un registro por Tema detectado (`101`..`104` o `105`..`110`), incluyendo `waves_count` y `api_endpoint` (`/api/topic/<id>`).
3. **`subtopics`**: Un registro por Subtema oficial (`23` en 101-500; `19` en 102-500), con `wave_index`, `extraction_status`, `comparison_status`, `score_total` y rutas de reportes.
4. **`sections`**: Las 3 Sub-Secciones internas de cada Subtema (`metadatos_y_resumen`, `teoria_lecciones`, `ejercicios_y_respuestas`).
5. **`page_ledger`**: Contabilidad página a página de las ~600 páginas del PDF (`FRONT_MATTER`, `TOPIC_COVER`, `CURRICULUM`, `IMPRINT`).
   - **Condición de parada (`can_stop == true`)**: `pending_curriculum_pages == 0` y todos los subtemas con `comparison_status == 'OK'`.
6. **`validation_reports`**: Almacén consolidado de puntajes y métricas de cada subtema.

---

## 3. Mapa de APIs HTTP Multihilo y Equivalentes CLI Paralelos

| Nivel | Ruta HTTP | Comando CLI Equivalente | Quién la consume |
|---|---|---|---|
| **Hardware Plan** | `GET /api/hardware-plan` | `hardware-plan` | Capa 1 (Orquestador) |
| **Raíz (Init + Waves)** | `POST /api/init` `{"pdf_path": "..."}` | `init --pdf "<ruta_pdf>"` | Capa 1 (Orquestador) |
| **Raíz (Estructura)** | `GET /api/exam/<exam_id>/structure` | Lee `structure-input.json` | Capa 1 (Orquestador) |
| **Raíz (Progreso BBDD)** | `GET /api/exam/<exam_id>/progress` | `progress --exam <exam_id>` | Capa 1 y Capa 2 |
| **API por Tema** | `GET /api/topic/<topic_id>` | `next-wave --topic <topic_id>` | Capa 2 (`coordinador-tema`) |
| **Siguiente Oleada Paralela** | `GET /api/topic/<topic_id>/next-wave` | `next-wave --topic <topic_id>` | Capa 2 (`coordinador-tema`) |
| **Extracción Paralela Oleada** | `POST /api/topic/<tid>/extract-wave` | `extract-wave-parallel --exam <id> --subtopics s1,s2,s3` | Capa 2 / Capa 3A |
| **Pre-Comparación Paralela Oleada** | `POST /api/topic/<tid>/pre-compare-wave` | `pre-compare-wave-parallel --exam <id> --subtopics s1,s2,s3` | Capa 2 / Capa 3B |
| **Sub-API Sección Individual** | `GET /api/topic/<tid>/subtopic/<sid>/section/<slug>` | `extract-section --exam <id> --subtopic <sid> --section <slug>` | Capa 3A (`extractor-seccion-pdf`) |
| **Sub-API Pre-Comparación** | `GET /api/topic/<tid>/subtopic/<sid>/pre-compare` | `pre-compare --exam <id> --subtopic <sid>` | Capa 3B (`validador-comparador-web`) |
| **Sub-API Guardar Puntaje** | `POST /api/topic/<tid>/subtopic/<sid>/save-comparison` | `save-comparison --exam <id> --subtopic <sid> --input-json <path>` | Capa 3B (`validador-comparador-web`) |
| **Informe Maestro** | *(Consolidación final)* | `master-report --exam <exam_id>` | Capa 1 (Orquestador) |

---

## 4. Rúbrica de Puntaje (0 a 100) y Veredictos

$$\text{Score Total} = 0.30 \times S_{\text{comandos}} + 0.20 \times S_{\text{definiciones}} + 0.25 \times S_{\text{teoría}} + 0.25 \times S_{\text{prácticas}}$$

- **`EXCELENTE` ($\ge 95.0$)**: Fidelidad total o casi total al manual oficial LPI.
- **`APTO_CON_HUECOS` ($80.0 - 94.9$)**: Buena base teórica/práctica, pero faltan flags, rutas o ejercicios puntuales.
- **`INCOMPLETO` ($50.0 - 79.9$)**: Cobertura parcial; requiere ampliar diapositivas, comandos o ejercicios del manual.
- **`CRITICO_ESQUELETO` ($< 50.0$)**: Lección o laboratorio en estado esqueleto/stub o con graves omisiones.
