# Notas de Extracción del Manual Oficial LPIC-1 (102-500)

**Documento fuente**: `_legacy/Recurso Final Definitivo/LPI-Learning-Material-102-500-es.pdf`  
**Total de páginas**: 594  
**Fecha de análisis**: 2026-11-01  
**Objetivo**: Especificación técnica para el extractor determinista `scripts/extract-pdf/` (Paso R1).

---

## 1. Análisis de Scripts Previos del Legacy

| Script en `_legacy/` | Qué hace | Qué aprovechamos | Qué NO se copia / Por qué se descarta |
|---|---|---|---|
| `tools/extract_pdf.py` | Vuelca texto plano página a página (`p-XXX.txt`) y rasteriza PNGs a 110 DPI con PyMuPDF. | Uso de `pymupdf` (`fitz`), lectura por páginas, manejo de codificación UTF-8. | Descarte total del volcado plano: no clasifica unidades atómicas (`kind`), pierde tipografía (fuentes, monoespaciado, tamaños), no extrae tokens ni calcula contabilidad de caracteres. |
| `tools/extract_102_questions.py` | Parsea preguntas de simulación de `preguntas 102.html` y las asigna a temas 105-110 con heurísticas por palabras clave. | Mapeo de pesos oficiales de temas y listas de palabras clave para validación cruzada. | El parser era regex ad-hoc sobre HTML intermedio sucio de OCR, no sobre el PDF oficial. |
| `scratch/extract_exercises_102.py` | Inspecciona campos de ejercicios (`steps`, `scenario`, `review`) en JSONs intermedios. | Estructura esperada de ejercicios guiados y exploratorios. | Solo leía JSONs ya compilados del legacy, no extraía del PDF. |

**Conclusión**: Se construye un extractor nuevo, puro, determinista y modular en `scripts/extract-pdf/`, sin dependencias del estado legacy.

---

## 2. Macroestructura del PDF

El PDF consta de 594 páginas distribuidas de la siguiente manera:

1. **Página 1**: Portada principal (imagen completa de 2550x3300 px, 0 caracteres de texto).
2. **Páginas 2 a 10**: Tabla de Contenidos global (`Table of Contents`), 355 entradas estructuradas hasta 5 niveles.
3. **Páginas 11 a 593**: Contenido curricular del Examen 102 (Temas 105 a 110, 19 subtemas).
4. **Página 594**: `Pie de imprenta` (metadatos de edición, licencia CC BY-NC-ND 4.0, fecha de generación del PDF).

### Jerarquía de Temas y Subtemas
Existen exactamente **6 temas** y **19 subtemas / objetivos**, con pesos idénticos a los especificados en `docs/spec/07-curriculo.md`:

| Tema | Título del Tema | Subtema | Título del Subtema | Pág. PDF | Peso PDF | Peso Currículo | Estado |
|---|---|---|---|---|---|---|---|
| **105** | Shells y scripts | 105.1 | Personalizar y usar el entorno de shell | 12 | 4 | 4 | Coincide |
| | | 105.2 | Personalizar y escribir scripts sencillos | 95 | 4 | 4 | Coincide |
| **106** | Interfaces de usuario y escritorios | 106.1 | Instalar y configurar X11 | 133 | 2 | 2 | Coincide |
| | | 106.2 | Escritorios gráficos | 150 | 1 | 1 | Coincide |
| | | 106.3 | Accesibilidad | 165 | 1 | 1 | Coincide |
| **107** | Tareas administrativas | 107.1 | Administrar cuentas de usuario y de grupo | 177 | 5 | 5 | Coincide |
| | | 107.2 | Automatizar tareas administrativas mediante programación de trabajos | 209 | 4 | 4 | Coincide |
| | | 107.3 | Localización e internacionalización | 239 | 3 | 3 | Coincide |
| **108** | Servicios esenciales del sistema | 108.1 | Mantener la hora del sistema | 257 | 3 | 3 | Coincide |
| | | 108.2 | Registros del sistema | 293 | 4 | 4 | Coincide |
| | | 108.3 | Conceptos básicos del MTA | 354 | 3 | 3 | Coincide |
| | | 108.4 | Gestión de la impresión y de las impresoras | 371 | 2 | 2 | Coincide |
| **109** | Fundamentos de redes | 109.1 | Fundamentos de los protocolos de Internet | 394 | 4 | 4 | Coincide |
| | | 109.2 | Configuración de red persistente | 420 | 4 | 4 | Coincide |
| | | 109.3 | Resolución de problemas básicos de red | 449 | 4 | 4 | Coincide |
| | | 109.4 | Configuración DNS en el lado del cliente | 483 | 2 | 2 | Coincide |
| **110** | Seguridad | 110.1 | Tareas de administración de seguridad | 501 | 3 | 3 | Coincide |
| | | 110.2 | Configuración de la seguridad del sistema | 538 | 3 | 3 | Coincide |
| | | 110.3 | Protección de datos mediante cifrado | 555 | 4 | 4 | Coincide |

---

## 3. Jerarquía Tipográfica y Roles

PyMuPDF extrae los bloques con información de fuente (`font`), tamaño (`size`), banderas (`flags`) y caja de límites (`bbox`). El sistema tipográfico oficial utiliza la familia **Noto** de Google con roles estrictos:

| Rol Semántico | Fuente | Tamaño (pt) | Flags | Identificación y Uso |
|---|---|---|---|---|
| **Título de Lección** | `NotoSans-Bold` | 25.0 | 20 (bold) | `105.1 Lección 1`, `108.2 Lección 2` |
| **Sección Principal** | `NotoSans-Bold` | 19.0 | 20 (bold) | `Introducción`, `Ejercicios guiados`, `Ejercicios de exploración`, `Resumen`, `Respuestas a los ejercicios guiados`, `Respuestas a los ejercicios de exploración` |
| **Sección de Nivel 1** | `NotoSans-Bold` | 16.0 | 20 (bold) | Título de sección dentro de la lección |
| **Título de Tema/Intro** | `NotoSans-Bold` | 14.0 | 20 (bold) | Portadas de tema (`Tema 105:...`) y de subtema (`105.1:...`) |
| **Sección de Nivel 2** | `NotoSans-Bold` / `NotoSansMono-Bold` | 13.0 | 20 (bold) | Subtítulos de sección. En código/comandos usa la variante Mono 13.0. |
| **Títulos de Metadatos** | `NotoSerif-Bold` | 11.0 | 20 (bold) | `Referencia al objetivo del LPI`, `Importancia`, `Áreas de conocimiento clave`, `Lista parcial de archivos...` |
| **Cuerpo de Texto** | `NotoSerif` | 11.0 | 4 (regular) | Párrafos normales y descripciones. |
| **Término / Énfasis** | `NotoSerif-Bold` / `NotoSerif-Italic` | 11.0 | 20 / 6 | Términos clave o nombres de herramientas en texto fluido. |
| **Código en Línea** | `NotoSansMono-Regular` | 11.0 | 4 (mono) | Variables, rutas y comandos dentro de párrafos. |
| **Bloque de Código** | `NotoSansMono-Regular` / `Bold` | 9.0 | 4 / 20 | Fragmentos de código, salidas de terminal y comandos completos (frecuentemente sobre rectángulo gris). |
| **Cabecera de Página** | `NotoSans-Regular` / `Bold` | 7.0 | 4 / 20 | `LPIC-1 (102) (Versión 5.0) \| ...` en `y <= 55`. |
| **Pie de Página** | `NotoSans-Regular` / `Bold` | 7.0 | 4 / 20 | Número de página, licencia CC, `learning.lpi.org`, fecha en `y >= 735`. |

---

## 4. Estructura de Secciones por Subtema

Cada uno de los 19 subtemas incluye obligatoriamente:
1. **Página de portada del objetivo**:
   - `Referencia al objetivo del LPI`
   - `Importancia` (peso del 1 al 5)
   - `Áreas de conocimiento clave` (lista con viñetas `•`)
   - `Lista parcial de archivos, términos y utilidades` (lista con viñetas `•`)
2. **Lecciones** (entre 1 y 3 lecciones por subtema):
   - Metadatos de la lección (Certificación, Versión, Tema, Objetivo, Lección X de Y)
   - `Introducción`
   - Bloques de contenido explicativo (párrafos, listas, tablas, ejemplos de terminal)
   - `Ejercicios guiados`
   - `Ejercicios de exploración`
   - `Resumen`
   - `Respuestas a los ejercicios guiados` (o variante singular `Respuesta a los ejercicios guiados`)
   - `Respuestas a los ejercicios de exploración`

---

## 5. Figuras y Recursos Gráficos

El manual contiene imágenes recurrentes de plantilla y figuras técnicas:
- **Imágenes de plantilla (excluidas de las figuras del temario)**:
  - Logotipo LPI en cabeceras de inicio de tema/subtema: dimensiones originales 1810x672 px.
  - Icono de licencia Creative Commons en pies de página: dimensiones originales 1810x672 px en bbox `~34x12 pt`.
- **Figuras técnicas reales extraídas**:
  1. `figures/106.1-p135-f1.png`: Arquitectura de sistema X Window (dim 1320x1020).
  2. `figures/106.1-p137-f1.png`: Ejemplo de configuración en pantalla (dim 1086x341).
  3. `figures/106.2-p155-f1.png`: Figure 1. Configuraciones KDE GTK (dim 1280x720).
  4. `figures/106.2-p155-f2.png`: Figure 2. Escritorio de Xfce (dim 1280x720).

---

## 6. Reglas de Contabilidad de Caracteres (Spec 11 §11.3)

Para garantizar la meta de contabilidad de caracteres **≥ 99,5%** por página:
- **Texto Asignado a Unidades**: Todo bloque de texto entre `y > 55` y `y < 735` en las páginas de contenido (11 a 593), y el texto de TOC en páginas 2-10 y pie de imprenta en 594.
- **Exclusiones Reconocidas**:
  - `header`: Texto con `bbox[3] <= 55` con patrón `^LPIC-1 \(102\) \(Versi[oó]n 5\.0\)`
  - `footer`: Texto con `bbox[1] >= 735` con patrones `learning\.lpi\.org`, `CC BY-NC-ND 4\.0`, `Version: \d{4}-\d{2}-\d{2}`
  - `page-number`: Números de página aislados en pie (izq en pares, der en impares)
- La suma de `caracteres_asignados + caracteres_excluidos` respecto a `caracteres_totales` de cada página debe ser `>= 99.5%`.

---

## 7. Tokens Técnicos (Spec 11 §11.4)

Cada unidad extraída procesará sus tokens según las siguientes reglas exactas:
- **commands**: Nombres de comandos desde spans monoespaciados y cruce con lista de comandos del currículo.
- **flags**: Opciones con patrón `(?<![\w-])--?[A-Za-z][\w-]*(=\S+)?`.
- **paths**: Rutas absolutas o relativas con patrón `(~|\.{1,2})?/[\w.\-/{}*~$]+` y archivos de configuración habituales (`*.conf`, `*.cfg`, `.bashrc`, etc.).
- **vars**: Variables shell con `$([A-Za-z_]\w*)` y variables de entorno reconocidas (`PATH`, `LANG`, `LC_*`, `DISPLAY`, `HOME`, etc.).
- **numbers**: Números relevantes en código, modos octales (`0755`), puertos de red (`22`, `53`), o señales (`15`, `9`).
- **terms**: Términos resaltados en negrita o cursiva (`NotoSerif-Bold`, `NotoSerif-Italic`) y los de la lista parcial de términos.
- **acronyms**: Siglas técnicas de 2 o más letras mayúsculas (`\b[A-Z]{2,}[a-z]?\b`) excluyendo números romanos y códigos de subtema.
Normalización: Unicode NFC y espacios colapsados.

