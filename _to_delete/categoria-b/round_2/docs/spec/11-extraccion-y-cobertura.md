# 11. EXTRACCIÓN DEL PDF Y SISTEMA DE COBERTURA

Objetivo: poder afirmar con evidencia que **todo** lo que dice el manual oficial está en la app y que la app **no dice nada** que el manual no respalde (o que está marcado como del autor).

## 11.1 Herramienta de extracción
- Script en `scripts/extract-pdf/` con **Python + PyMuPDF** (`fitz`), invocado por `npm run extract:pdf` (en Windows: `py -3`; entorno virtual `.venv-extract/`, en `.gitignore`; si no está instalado, pide confirmación antes de `pip install pymupdf`). Alternativa de reserva: `pdfjs-dist` en Node. El PDF es de texto (no escaneado); no se necesita OCR.
- Entrada: `_legacy/Recurso Final Definitivo/LPI-Learning-Material-102-500-es.pdf`. Salida en `content-src/_extract/102-500/`. **Esta carpeta no se versiona** (texto derivado de un material con licencia; se regenera con el comando).
- Usa la información tipográfica de cada span (fuente monoespaciada → código o comando; negrita/cursiva → término; tamaño → jerarquía de títulos) para reconstruir la estructura. No uses solo texto plano.
- Determinismo: misma entrada → mismos bytes de salida (ordena, no uses fechas ni rutas absolutas en los archivos).

## 11.2 Estructura esperada del manual (confírmala, no la supongas)
Los LPI Learning Materials suelen organizarse en Tema → Objetivo → Lecciones, y cada objetivo suele traer: áreas de conocimiento clave, lista parcial de archivos, términos y utilidades usados, el contenido por lecciones, **ejercicios guiados**, **ejercicios exploratorios**, **resumen** y **respuestas** a ambos tipos de ejercicios. El extractor debe descubrir la estructura real y documentar en `extraction-report.md` cualquier desviación.

## 11.3 Archivos de salida
**`units.json`** — array de unidades en orden de lectura:
```json
{ "id": "105.1#u014", "objective": "105.1", "topic": "105",
  "kind": "heading|paragraph|list-item|table|code|figure|callout|key-knowledge|key-files|exercise-guided|exercise-explor|answer-guided|answer-explor|summary|other",
  "lesson": "Lección 1", "section": "Variables de entorno", "page": 112, "order": 14,
  "text": "…", "format": { "mono": false, "bold": [], "italic": [] },
  "tokens": { "commands": [], "flags": [], "paths": [], "vars": [], "numbers": [], "terms": [], "acronyms": [] },
  "figure": { "file": "figures/105.1-p112-f1.png", "caption": "…" } }
```
**`objectives.json`** — por objetivo: id, título, peso (si aparece), páginas, qué secciones se encontraron y nº de unidades por tipo. Se compara con `docs/spec/07-curriculo.md` y las diferencias se listan.
**`pages.json`** — por página: caracteres totales, caracteres asignados a unidades, y exclusiones reconocidas con su patrón (cabeceras, pies, nº de página). **Contabilidad ≥ 99,5 %** por página; las páginas por debajo se listan para revisión.
**`figures/`** — cada figura del PDF como PNG con su pie de figura; las figuras sin texto alternativo se marcan para describirlas.
**`extraction-report.md` y `extract-overview.html`** — resumen navegable: páginas, objetivos, unidades por tipo, anomalías.

## 11.4 Tokens técnicos (qué se comprueba en la cobertura)
Por cada unidad se extraen, y se normalizan (NFC, espacios colapsados):
| Tipo | Regla de extracción | Comparación |
|---|---|---|
| commands | spans monoespaciados que parecen comando, más cualquier nombre de `commands.yaml` que aparezca | sensible a mayúsculas |
| flags | `(?<![\w-])--?[A-Za-z][\w-]*(=\S+)?` | sensible |
| paths | `(~\|\.{1,2})?/[\w.\-/{}*~$]+` y nombres de archivo de configuración (`*.conf`, `*.cfg`, `.bashrc`…) | sensible |
| vars | `\$[A-Za-z_]\w*` y nombres de variables de entorno en mayúsculas (PATH, LANG, LC_ALL…) | sensible |
| numbers | solo en monoespaciado, con unidad, en tablas o como modo octal/puerto/señal | exacta |
| terms | texto en negrita/cursiva y los términos de la lista parcial | insensible a mayúsculas y tildes |
| acronyms | `\b[A-Z]{2,}[a-z]?\b` (se excluyen códigos de subtema y numerales romanos) | sensible |

## 11.5 Trazabilidad en las lecciones
En `content-src/lessons/<id>.md`, cada diapositiva (o cada bloque) lleva un comentario con las unidades que cubre:
```markdown
<!-- src: 105.1#u014-u019, 105.1#u022 -->
```
Valores especiales: `src: meta` (portada, transiciones, sin hechos técnicos) y `src: autor` (contenido propio del autor sin respaldo en el PDF; **se lista en el informe y requiere aprobación del usuario al validar**). Lo mismo en `exercises/<id>.yaml`, `labs/<id>.yaml`, `questions/*.yaml` y `flashcards-extra.yaml` (campo `source`).
El parser conserva `src` en el JSON generado y lo omite del render.

## 11.6 Qué cuenta como "destino" y como "cubierto"
**Destino** de un subtema = texto de: diapositivas (incluidas notas y detalle), ejercicios del manual, laboratorio, entradas de comandos y glosario ligadas al subtema. **No cuentan** las preguntas ni las flashcards (no son el material de estudio).
**`verify:coverage -- <id>` falla (exit ≠ 0) si:**
1. Alguna unidad del objetivo no aparece en ningún `src` ni en el `ledger` como omitida con motivo.
2. Falta algún token técnico de una unidad cubierta en el texto destino, salvo exención con motivo.
3. Hay bloques, preguntas o flashcards sin `src` (distinto de `meta` / `autor` declarado).
4. Un `src` apunta a una unidad que no existe o de otro objetivo.
5. La lección supera **20 diapositivas** (portada y resumen incluidos) sin una decisión registrada en `DECISIONS.md`.
6. Algún ejercicio guiado/exploratorio o su respuesta del PDF no está en `exercises/<id>.yaml`.
7. Algún elemento de "Áreas de conocimiento clave" no tiene ≥ 2 preguntas, o algún elemento de "Lista parcial de archivos, términos y utilidades" no está en comandos, glosario o flashcards.
8. Algún comando o término del subtema no tiene `explainedIn` válido (spec 13).
9. El pool de preguntas o de flashcards no cumple los mínimos de spec 12 §12.6.
10. Las exenciones superan el **3 %** de los tokens del objetivo (señal de que se está esquivando el control: parar y preguntar).

**Ledger** (`content-src/coverage/<id>.ledger.yaml`, se versiona):
```yaml
objective: "105.1"
omit:            # unidades que no se trasladan, con motivo
  105.1#u003: "Cabecera de página"
tokenWaivers:    # tokens que no aplican, con motivo
  - { token: "$HOME", unit: "105.1#u031", reason: "Aparece como ejemplo en una figura que se reproduce como diagrama con el mismo texto" }
authorContent:   # contenido sin respaldo en el PDF que se conserva (aprobar al validar)
  - { slide: 12, reason: "Ejemplo práctico del autor del legacy" }
```
Toda omisión o exención aparece en naranja en el informe HTML.

## 11.7 Informe HTML (`npm run report:coverage -- <id>`)
Genera `docs/agent/cobertura/<id>.html` (no se versiona) con: cabecera con las cifras (unidades, tokens, % cubierto, exenciones, contenido autor, nº de diapositivas, preguntas, flashcards); a la izquierda el texto de cada unidad del PDF **en verde** (cubierta, con enlace a la diapositiva), **en rojo** (sin cubrir, con los tokens ausentes marcados) o **en naranja** (omitida o exenta con motivo); a la derecha el contenido de la app con los bloques **en amarillo** si son del autor; filtro "solo problemas"; y al final la **lista de comprobación del usuario** (spec 12 §12.7). Debe abrirse con doble clic, sin servidor.

## 11.8 Validación y detección de cambios
- `docs/agent/validaciones.json` (se versiona): `{ "<id>": { "validadoPor": "usuario", "fecha": "…", "commit": "…", "hash": "sha256…" } }`.
- El hash cubre: lección, ejercicios, laboratorio, ledger, preguntas y flashcards con `subtopicId` = id, y las entradas de comandos y glosario que lo referencian (contenido normalizado, sin comentarios de formato).
- `npm run verify:validations` recalcula los hashes y **falla si un subtema validado ha cambiado**; para corregirlo hay que volver a validarlo. Está incluido en `npm run verify`.
- `validation:register -- <id>` solo lo ejecuta `/registrar-validacion` y **solo** tras el mensaje literal `VALIDADO <id>` del usuario. Nadie edita `validaciones.json` a mano.
- `npm run progress:r2` actualiza el bloque automático de `docs/agent/PROGRESO_R2.md` (por subtema: unidades mapeadas / totales, % de tokens, diapositivas, preguntas, flashcards, estado de auditoría y de validación).
