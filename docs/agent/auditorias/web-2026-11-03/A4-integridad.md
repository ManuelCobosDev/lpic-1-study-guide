# A4 · Integridad y duplicados de contenido

Fase 1, solo lectura sobre `content-src/` y manifiesto compilado. Hallazgos estructurados en `hallazgos-A4.json` (A4-001 … A4-015). Scripts de auditoría reproducibles en `docs/agent/auditorias/web-2026-11-03/scripts/`.

## Resumen
1. **S-01 CONFIRMADA (A4-001, P0)**: 155 diapositivas (20,1 % del total) en 9 lecciones (108.3, 108.4, 109.1–109.4, 110.1–110.3) tienen un único `id` repetido (`<lección>-slide-<núm>`) y el mismo `slideNumber` en todas sus diapositivas.
2. **S-02 CONFIRMADA y ampliada (A4-002, A4-003, P0)**: Lecciones esqueleto: 110.1–110.3 (53 diapositivas) contienen únicamente un bloque `heading`; 108.3–109.4 (102 diapositivas) contienen solo `heading` + 1 párrafo de una frase. Los laboratorios stub son **11** (108.1 a 110.3), no 6: todos pesan ~650 B, tienen 1 único paso con la orden ficticia `man 108_1`...`man 110_3` y están marcados `placeholder: false`.
3. **S-03 CONFIRMADA (A4-004, P0)**: El README afirma «100% Cobertura Real, 0 Placeholders» y cifras fijas desfasadas (770/193/230 vs 771/197/238 reales). En `curriculum.yaml` 41 de 42 subtemas tienen `placeholder: true`. En preguntas, 0 de 240 están verificadas (`verified: false`). `manifest.json` y la home computan los 155 esqueletos y los 11 labs stub como contenido real (`totalSlidesPlaceholder: 0`, `totalLabsPlaceholder: 0`).
4. **Colisión crítica de preguntas (A4-005, P1)**: 27 pares de preguntas distintas comparten el mismo identificador (`q-102-18` a `q-102-105`), duplicados entre `102.json` (Examen 101) y `105`–`110.json` (Examen 102). Solo hay 213 IDs únicos para 240 preguntas.
5. **Idioma de preguntas (A4-006, P1)**: El 100 % (240/240) de los enunciados de examen están en inglés, pese a que la home promete «preguntas reales redactadas en español».
6. **Asimetría de preguntas (A4-007, P1)**: 19 subtemas del Examen 101 tienen 0 preguntas (las 120 preguntas de los temas 101–104 están asociadas exclusivamente al primer subtema `.1`). En 105.1, 5 de sus 12 preguntas corresponden temáticamente a otros subtemas.
7. **Flags rotos en comandos (A4-008, P1)**: 206 flags en 76 de los 197 comandos tienen como nombre un guion solitario (`flag: '-'`), perdiendo la opción de la orden en la interfaz.
8. **S-07 CONFIRMADA (A4-009, P1)**: Títulos genéricos idénticos repetidos: «Ejercicios Guiados Oficiales (Manual LPI)» ×6 (slides idénticas en 108.3–109.4) y «Retos de Exploración del Manual Oficial» ×5 (en 101.1, 101.2, 101.3, 102.2, 102.3).
9. **S-06 CONFIRMADA (A4-010, P1)**: Dos lenguajes visuales disjuntos: 101–104 usan 5–12 bloques `html` por lección (233 bloques con colores literales); 105.1 usa 0 bloques `html` y 100 % bloques nativos; 108.3–110.3 son esqueletos. Solo existe 1 bloque `diagram` en todo el curso (en 103.4).
10. **Trazabilidad y ejercicios (A4-011, P2)**: Solo 1 subtema (105.1) dispone de fichero en `content-src/exercises/` (42 ejercicios) y campo `src` de trazabilidad en sus 20 diapositivas. Las otras 751 diapositivas tienen 0 `src`.

---

## Verificación de Semillas Asignadas

| Semilla | Severidad | Descripción de partida | Estado A4 | Datos y evidencia exacta |
|---|---|---|---|---|
| **S-01** | **P0** | 9 lecciones (108.3, 108.4, 109.1–109.4, 110.1–110.3) con un único id y slideNumber repetido en todas sus diapositivas. | **CONFIRMADO** | 155 diapositivas (20,1 % de las 771) afectadas. 108.3 (16 slides, todas id `108.3-slide-108`, slideNumber 108); 108.4 (16 slides, id `108.4-slide-108`, num 108); 109.1 (18 slides, id `109.1-slide-109`, num 109); 109.2 (18 slides, id `109.2-slide-109`, num 109); 109.3 (18 slides, id `109.3-slide-109`, num 109); 109.4 (16 slides, id `109.4-slide-109`, num 109); 110.1 (18 slides, id `110.1-slide-110`, num 110); 110.2 (16 slides, id `110.2-slide-110`, num 110); 110.3 (19 slides, id `110.3-slide-110`, num 110). Las otras 33 lecciones tienen IDs únicos y numeración secuencial 1..N. |
| **S-02** | **P0** | Lecciones esqueleto (110.1–110.3 solo título; 108.3–109.4 título + 1 párrafo); laboratorios de ~650 B. | **CONFIRMADO y ampliado** | 110.1–110.3 (53 diapositivas) contienen exclusivamente 1 bloque `heading` por diapositiva (0 párrafos, 0 terminales, 0 callouts; tamaño 8,5–9,8 KB). 108.3–109.4 (102 diapositivas) contienen exactamente 1 `heading` + 1 `paragraph` de una sola línea (tamaño 12,4–13,4 KB, corrigen la estimación de ~5 KB). **Los laboratorios stub son 11** (108.1 a 110.3, ambos inclusive): pesan entre 647 y 669 bytes, constan de 1 único paso con el comando inexistente `man <subtema_con_guionbajo>` (ej. `man 108_1`) y salida genérica. Todas tienen `placeholder: false`. |
| **S-03** | **P0** | Cifras públicas inflan la realidad: README dice «100% Cobertura Real, 0 Placeholders» vs STATUS y datos reales. | **CONFIRMADO** | `README.md:15` promete «100% Cobertura Real, 0 Placeholders». `README.md:17,33,34` cita 770 diapositivas, 193 comandos y 230 términos (los reales son 771, 197 y 238). `STATUS.md` reconoce que solo 105.1 está auto-verificado. `curriculum.yaml` marca `placeholder: true` en 41 de los 42 subtemas (solo 103.4 es false). `public/content/manifest.json` reporta `totalSlidesPlaceholder: 0` y `totalLabsPlaceholder: 0`, ocultando los esqueletos. `home-page.component.ts:1039,1050` suma reales y placeholders para mostrar el total. En preguntas, 0 de 240 tienen `verified: true`. |
| **S-06** | **P1** | Dos lenguajes visuales de lección (html masivo vs nativo); solo 1 bloque diagram. | **CONFIRMADO** | Recuento global de 2.705 bloques: `heading`: 771, `callout`: 531, `paragraph`: 527, `html`: 261, `table`: 203, `code`: 158, `terminal`: 133, `list`: 102, `quiz-inline`: 37, `diagram`: 1 (únicamente en `103.4.json` slide 10). Las lecciones 101.1–104.7 concentran 233 bloques `html` (5–12 por lección); 105.1 tiene 0 bloques `html` (100 % nativo); 105.2–108.2 tienen 2–5 bloques `html`; 108.3–110.3 tienen 0 bloques `html` por ser esqueletos. |
| **S-07** | **P1** | Títulos genéricos repetidos entre lecciones. | **CONFIRMADO** | Exactamente dos títulos se repiten entre lecciones distintas: (1) «Ejercicios Guiados Oficiales (Manual LPI)» aparece en 6 lecciones (108.3 slide 108, 108.4 slide 108, 109.1–109.4 slide 109; las 6 diapositivas completas son clones idénticos); (2) «Retos de Exploración del Manual Oficial» aparece en 5 lecciones (101.1 slide 16, 101.2 slide 15, 101.3 slide 16, 102.2 slide 15, 102.3 slide 15). Cero repeticiones adicionales inter-lección. |
| **S-15** | **P2** | FAQ promete offline sin service worker. | **CONFIRMADO (cruce)** | `home-page.component.ts:976-977` afirma que la web funciona sin conexión. No existe `@angular/service-worker`, `ngsw-config.json` ni registro de service worker en `app.config.ts`. Cruce con A2/A7. |

---

## Matriz de Cobertura: 42 Subtemas × Recursos

Columnas:
- **Subtema / Examen / Peso**: Identificador, examen LPIC-1 (101 o 102) y peso oficial LPI (suma 60 por examen).
- **Slides**: Diapositivas en la lección, tamaño en disco (KB) y número total de bloques.
- **IDs únicos**: Comprueba si cada diapositiva tiene ID y `slideNumber` propios e incrementales (1..N).
- **Tipo de lección**: Completa, Esqueleto h+p (heading + 1 frase), Esqueleto solo-h (solo título) o Prototipo R2 (trazabilidad oficial).
- **HTML**: Bloques de tipo `html` con colores fijos en la lección.
- **Lab**: Pasos del laboratorio, peso en disco y detección de stub genérico (`man <subtema>`).
- **Preguntas (Q / Q Ver)**: Preguntas asociadas al subtema y preguntas con `verified: true`.
- **Flash**: Flashcards en `flashcards-extra.yaml`.
- **Comandos (yaml / lec)**: Comandos en `commands.yaml` asociados al subtema vs listados en el campo `commands` de la lección.
- **Glosario (yaml / lec)**: Términos en `glossary.yaml` asociados al subtema vs `keyTerms` de la lección.
- **Ejercicios**: Presencia de ejercicios en `content-src/exercises/<id>.yaml`.

| Subtema | Ex | Peso | Slides | KB | Blks | IDs únicos | Tipo de Lección | HTML | Lab (pasos, KB, stub) | Q (Ver) | Flash | Cmds (cat/lec) | Glos (cat/lec) | Ejercicios |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **101.1** | 101 | 2 | 19 | 160 | 86 | OK (19) | Completa | 12 | 4 pasos (3.3 KB) | 19 (0) | 0 | 5 / 4 | 6 / 6 | NO |
| **101.2** | 101 | 3 | 19 | 140 | 81 | OK (19) | Completa | 11 | 4 pasos (3.2 KB) | **0** (0) | 0 | 5 / 3 | 9 / 9 | NO |
| **101.3** | 101 | 3 | 19 | 175 | 77 | OK (19) | Completa | 12 | 4 pasos (3.2 KB) | **0** (0) | 0 | 7 / 3 | 4 / 4 | NO |
| **102.1** | 101 | 2 | 19 | 217 | 63 | OK (19) | Completa | 10 | 4 pasos (2.7 KB) | 27 (0) | 4 | 4 / 2 | 4 / 4 | NO |
| **102.2** | 101 | 2 | 19 | 139 | 66 | OK (19) | Completa | 11 | 4 pasos (3.1 KB) | **0** (0) | 4 | 4 / 2 | 4 / 4 | NO |
| **102.3** | 101 | 1 | 19 | 145 | 64 | OK (19) | Completa | 11 | 4 pasos (3.1 KB) | **0** (0) | 4 | 1 / 1 | 5 / 5 | NO |
| **102.4** | 101 | 3 | 19 | 165 | 65 | OK (19) | Completa | 12 | 4 pasos (3.3 KB) | **0** (0) | 0 | 5 / 0 | 5 / 5 | NO |
| **102.5** | 101 | 3 | 19 | 182 | 77 | OK (19) | Completa | 11 | 4 pasos (4.2 KB) | **0** (0) | 0 | 9 / 4 | 5 / 2 | NO |
| **102.6** | 101 | 1 | 19 | 166 | 75 | OK (19) | Completa | 12 | 4 pasos (3.5 KB) | **0** (0) | 0 | 8 / 4 | 5 / 2 | NO |
| **103.1** | 101 | 4 | 19 | 106 | 73 | OK (19) | Completa | 11 | 4 pasos (3.2 KB) | 43 (0) | 0 | 7 / 3 | 6 / 2 | NO |
| **103.2** | 101 | 3 | 19 | 103 | 83 | OK (19) | Completa | 12 | 4 pasos (3.1 KB) | **0** (0) | 0 | 17 / 8 | 6 / 2 | NO |
| **103.3** | 101 | 4 | 19 | 119 | 83 | OK (19) | Completa | 12 | 4 pasos (3.5 KB) | **0** (0) | 0 | 17 / 8 | 5 / 2 | NO |
| **103.4** | 101 | 4 | 19 | 120 | 93 | OK (19) | Completa | 10 | 4 pasos (3.5 KB) | **0** (0) | 0 | 15 / 6 | 4 / 5 | NO |
| **103.5** | 101 | 4 | 19 | 117 | 92 | OK (19) | Completa | 12 | 4 pasos (3.3 KB) | **0** (0) | 0 | 16 / 8 | 7 / 7 | NO |
| **103.6** | 101 | 2 | 18 | 90 | 77 | OK (18) | Completa | 9 | 4 pasos (3.0 KB) | **0** (0) | 0 | 8 / 4 | 4 / 4 | NO |
| **103.7** | 101 | 3 | 19 | 98 | 88 | OK (19) | Completa | 5 | 4 pasos (3.4 KB) | **0** (0) | 0 | 12 / 3 | 4 / 4 | NO |
| **103.8** | 101 | 2 | 19 | 88 | 87 | OK (19) | Completa | 7 | 4 pasos (3.3 KB) | **0** (0) | 0 | 11 / 5 | 3 / 3 | NO |
| **104.1** | 101 | 2 | 19 | 131 | 83 | OK (19) | Completa | 10 | 4 pasos (3.6 KB) | 31 (0) | 0 | 7 / 1 | 5 / 2 | NO |
| **104.2** | 101 | 2 | 19 | 100 | 86 | OK (19) | Completa | 9 | 4 pasos (3.1 KB) | **0** (0) | 0 | 10 / 3 | 5 / 2 | NO |
| **104.3** | 101 | 3 | 19 | 92 | 80 | OK (19) | Completa | 8 | 4 pasos (3.3 KB) | **0** (0) | 0 | 6 / 1 | 5 / 2 | NO |
| **104.5** | 101 | 3 | 19 | 98 | 76 | OK (19) | Completa | 8 | 4 pasos (3.6 KB) | **0** (0) | 0 | 5 / 2 | 5 / 2 | NO |
| **104.6** | 101 | 2 | 19 | 81 | 76 | OK (19) | Completa | 7 | 4 pasos (2.9 KB) | **0** (0) | 0 | 6 / 3 | 5 / 2 | NO |
| **104.7** | 101 | 2 | 19 | 78 | 74 | OK (19) | Completa | 6 | 4 pasos (3.5 KB) | **0** (0) | 0 | 6 / 3 | 5 / 2 | NO |
| **105.1** | 102 | 4 | 20 | 90 | 59 | OK (20) | **R2 Prototipo** | 0 | 5 pasos (5.3 KB) | 12 (0) | 20 | 11 / 8 | 16 / 10 | **SÍ (42)** |
| **105.2** | 102 | 4 | 19 | 58 | 69 | OK (19) | Completa | 4 | 5 pasos (6.0 KB) | 6 (0) | 5 | 2 / 2 | 4 / 4 | NO |
| **106.1** | 102 | 2 | 19 | 54 | 74 | OK (19) | Completa | 3 | 4 pasos (4.8 KB) | 8 (0) | 4 | 5 / 5 | 4 / 4 | NO |
| **106.2** | 102 | 1 | 16 | 37 | 55 | OK (16) | Completa | 2 | 3 pasos (3.5 KB) | 3 (0) | 4 | 2 / 2 | 5 / 5 | NO |
| **106.3** | 102 | 1 | 15 | 36 | 52 | OK (15) | Completa | 2 | 3 pasos (4.1 KB) | 1 (0) | 4 | 2 / 2 | 5 / 5 | NO |
| **107.1** | 102 | 5 | 19 | 75 | 76 | OK (19) | Completa | 4 | 3 pasos (3.6 KB) | 6 (0) | 3 | **0** / 0 | 9 / 9 | NO |
| **107.2** | 102 | 4 | 19 | 65 | 72 | OK (19) | Completa | 4 | 3 pasos (3.8 KB) | 10 (0) | 3 | **0** / 0 | 8 / 8 | NO |
| **107.3** | 102 | 3 | 18 | 63 | 70 | OK (18) | Completa | 5 | 3 pasos (3.5 KB) | 4 (0) | 2 | **0** / 0 | 9 / 9 | NO |
| **108.1** | 102 | 3 | 16 | 61 | 62 | OK (16) | Completa | 4 | **1 paso (0.6 KB, STUB)** | 8 (0) | 3 | **0** / 0 | 8 / 8 | NO |
| **108.2** | 102 | 4 | 19 | 64 | 73 | OK (19) | Completa | 5 | **1 paso (0.6 KB, STUB)** | 7 (0) | 3 | **0** / 0 | 8 / 8 | NO |
| **108.3** | 102 | 3 | 16 | 12 | 32 | **1 ID (1/16)** | **Esqueleto (h+p)** | 0 | **1 paso (0.6 KB, STUB)** | 4 (0) | 0 | **0** / 0 | 10 / 10 | NO |
| **108.4** | 102 | 2 | 16 | 13 | 32 | **1 ID (1/16)** | **Esqueleto (h+p)** | 0 | **1 paso (0.6 KB, STUB)** | 3 (0) | 0 | **0** / 0 | 10 / 10 | NO |
| **109.1** | 102 | 4 | 18 | 13 | 36 | **1 ID (1/18)** | **Esqueleto (h+p)** | 0 | **1 paso (0.6 KB, STUB)** | 8 (0) | 0 | **0** / 0 | 10 / 10 | NO |
| **109.2** | 102 | 4 | 18 | 13 | 36 | **1 ID (1/18)** | **Esqueleto (h+p)** | 0 | **1 paso (0.6 KB, STUB)** | 11 (0) | 0 | **0** / 0 | 10 / 10 | NO |
| **109.3** | 102 | 4 | 18 | 13 | 36 | **1 ID (1/18)** | **Esqueleto (h+p)** | 0 | **1 paso (0.6 KB, STUB)** | 4 (0) | 0 | **0** / 0 | 10 / 10 | NO |
| **109.4** | 102 | 2 | 16 | 12 | 32 | **1 ID (1/16)** | **Esqueleto (h+p)** | 0 | **1 paso (0.6 KB, STUB)** | 4 (0) | 0 | **0** / 0 | 10 / 10 | NO |
| **110.1** | 102 | 3 | 18 | 9 | 18 | **1 ID (1/18)** | **Esqueleto (solo-h)** | 0 | **1 paso (0.7 KB, STUB)** | 10 (0) | 10 | **0** / 0 | **0** / 6 | NO |
| **110.2** | 102 | 3 | 16 | 9 | 16 | **1 ID (1/16)** | **Esqueleto (solo-h)** | 0 | **1 paso (0.7 KB, STUB)** | 5 (0) | 10 | **0** / 0 | **0** / 5 | NO |
| **110.3** | 102 | 4 | 19 | 10 | 19 | **1 ID (1/19)** | **Esqueleto (solo-h)** | 0 | **1 paso (0.6 KB, STUB)** | 6 (0) | 12 | **0** / 0 | **0** / 7 | NO |

---

## Hallazgos de Integridad Estructural

### 1. Diapositivas y Lecciones
- **Total de diapositivas**: 771 diapositivas en 42 lecciones. Ninguna supera las 20 diapositivas reglamentarias (rango: 15 a 20).
- **Diapositivas solo-título**: 76 en total. 23 corresponden a la diapositiva de portada (slide 1) de las lecciones completas 101.1 a 104.7. Las otras 53 corresponden a la totalidad de las diapositivas de las lecciones 110.1 (18/18), 110.2 (16/16) y 110.3 (19/19), que carecen por completo de contenido.
- **Falsos positivos de búsqueda de TODO**: El análisis inicial detectó coincidencias de `\bTODO\b` insensible a mayúsculas que corresponden a la palabra española ordinaria «todo» (ej. «Borra TODO tu archivo crontab», «TODO el sistema»). Se verificó que **no existen comentarios TODO/FIXME ni stubs de desarrollador** olvidados en el texto.
- **Diapositivas duplicadas entre lecciones**: Se identificó 1 grupo de 6 diapositivas con bloques de texto idénticos en las lecciones 108.3, 108.4, 109.1, 109.2, 109.3 y 109.4 («Ejercicios Guiados Oficiales (Manual LPI)»).

### 2. Laboratorios
- **Total de laboratorios**: 42 ficheros para los 42 subtemas.
- **Laboratorios reales**: 31 laboratorios (101.1 a 107.3) cuentan con 3 a 5 pasos reales y tamaños entre 2,7 y 6,0 KB.
- **Laboratorios stub**: 11 laboratorios (108.1 a 110.3) cuentan con exactamente 1 paso ficticio (`man 108_1`... `man 110_3`) y un peso ínfimo (~650 bytes).
- **Ficheros duplicados**: El subtema 103.4 contiene en disco simultáneamente `content-src/labs/103.4.json` y `content-src/labs/103.4.yaml`.

### 3. Banco de Preguntas
- **Total de preguntas**: 240 preguntas en disco (120 de Examen 101, 120 de Examen 102).
- **Colisión crítica de IDs**: 27 identificadores duplicados entre temas (`q-102-18` a `q-102-105`). En `102.json` (Tema 102 de Examen 101) y en los ficheros de Examen 102 (`105.json` a `110.json`), existen preguntas completamente diferentes que comparten el mismo ID. Esto reduce los IDs únicos globales a 213, con grave riesgo de colisión en progreso y simulador.
- **Idioma**: El 100 % (240/240) de los enunciados de las preguntas están redactados en inglés (ej. «Which of the following...»). Solo las explicaciones están en español.
- **Estado de verificación**: 0 de 240 preguntas tienen `verified: true`. Las 120 preguntas de Examen 102 tienen `status: "pendiente-verificacion"`; las 120 de Examen 101 no tienen campo `status`. La afirmación de `STATUS.md` sobre «12 preguntas oficiales en pool verificado para 105.1» es inexacta.
- **Integridad interna**: 0 preguntas sin explicación; 0 preguntas sin respuesta correcta; 0 preguntas con opciones huérfanas; 0 preguntas con `subtopicId` inexistente.

### 4. Catálogo de Comandos y Glosario
- **Comandos (`commands.yaml`)**: 197 comandos. 76 comandos contienen un total de 206 flags cuyo nombre es un guion aislado (`flag: '-'`), resultado de un truncado en la importación legacy. Los 14 subtemas de los temas 107, 108, 109 y 110 tienen 0 comandos asociados en el catálogo (`subtopicIds`).
- **Glosario (`glossary.yaml`)**: 238 términos. No hay identificadores ni términos duplicados. Los subtemas 110.1, 110.2 y 110.3 tienen 0 términos vinculados en el fichero. No hay referencias rotas en el campo `related`.
- **Mojibake**: 0 caracteres corruptos detectados en glosario, comandos o flashcards.

---

## Tabla de Hallazgos (A4-001 … A4-015)

Todos los hallazgos han sido exportados a `docs/agent/auditorias/web-2026-11-03/hallazgos-A4.json` siguiendo estrictamente la especificación §6.

| ID | Sev. | Categoría | Título | Estado | Semilla | Cruces |
|---|---|---|---|---|---|---|
| **A4-001** | **P0** | `contenido` | 9 lecciones con un único id/slideNumber de diapositiva repetido (155 diapositivas) | CONFIRMADO | S-01 | A3 |
| **A4-002** | **P0** | `contenido` | Lecciones esqueleto 108.3–110.3 presentadas como completas (155 diapositivas sin contenido real) | CONFIRMADO | S-02 | A3, A9 |
| **A4-003** | **P0** | `contenido` | Laboratorios 108.1–110.3 son stubs de 1 paso (`man 108_1`) | CONFIRMADO | S-02 | - |
| **A4-004** | **P0** | `contenido` | Cifras y afirmaciones públicas inconsistentes con los datos y con STATUS | CONFIRMADO | S-03 | A2, A9 |
| **A4-005** | **P1** | `contenido` | 27 ids de pregunta duplicados entre ficheros (preguntas distintas con el mismo id) | CONFIRMADO | - | A8 |
| **A4-006** | **P1** | `contenido` | 240/240 enunciados de preguntas están en inglés (la home promete «redactadas en español») | CONFIRMADO | - | A2, A5 |
| **A4-007** | **P1** | `contenido` | Preguntas mal repartidas por subtema: 19 subtemas con 0 y etiquetado dudoso en 105.1 | CONFIRMADO | - | A3, A5, A8 |
| **A4-008** | **P1** | `contenido` | commands.yaml: 206 flags con nombre "-" en 76 de 197 comandos | CONFIRMADO | - | A5, A8 |
| **A4-009** | **P1** | `contenido` | Títulos genéricos repetidos entre lecciones | CONFIRMADO | S-07 | A3, A8 |
| **A4-010** | **P1** | `diseno` | Dos lenguajes de lección (html masivo / nativo / vacío) y un solo diagrama | CONFIRMADO | S-06 | A3, A6 |
| **A4-011** | **P2** | `contenido` | Cobertura desigual de recursos por subtema | CONFIRMADO | - | A8 |
| **A4-012** | **P2** | `contenido` | curriculum.yaml marca placeholder:true en 41/42 subtemas pero lecciones y labs dicen false | CONFIRMADO | - | A8 |
| **A4-013** | **P2** | `contenido` | Diapositivas de relleno repetidas entre lecciones | CONFIRMADO | - | A3 |
| **A4-014** | **P3** | `repo` | Datos redundantes: lab 103.4 en JSON y YAML; webDocument en 41 lecciones | DUDOSO | - | A9 |
| **A4-015** | **P2** | `navegacion` | La FAQ de la home promete estudio offline sin service worker | CONFIRMADO | S-15 | A2, A7 |

---

## No Pude Comprobar (Límites de A4)

1. **Renderizado en navegador**: No se abrió navegador ni se ejecutó el servidor de desarrollo (`npm run preview`/`npm run dev`). No se comprobó el impacto visual directo de tener diapositivas con IDs repetidos en el DOM de Angular ni si los bloques `html` salen en blanco en runtime (alcance A1/A3/A6).
2. **Impacto funcional de colisiones en localStorage**: No se probó de forma interactiva si responder `q-102-18` en el Examen 101 sobreescribe el estado de la pregunta homónima del Examen 102 en el simulador o en el historial Leitner (alcance A8).
3. **Calidad y exactitud técnica LPI**: No se validó si las respuestas correctas de las 240 preguntas o el contenido de las diapositivas son técnicamente rigurosos según los objetivos oficiales de LPI 500 (alcance de A5).
4. **Comprobación de compilación**: No se ejecutaron `npm run build`, `npm run verify` ni `npm run preview` por orden directa de la instrucción.
5. **Precedencia de ficheros de laboratorio en runtime**: No se comprobó si Angular carga `103.4.json` o `103.4.yaml` al navegar a `/laboratorios/103.4`.
6. **Consumo de `webDocument`**: No se auditó si `lesson-web-view.component.ts` utiliza o ignora el árbol `webDocument` presente en 41 de las 42 lecciones (cruce con A3/A9).
