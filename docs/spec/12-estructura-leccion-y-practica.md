# 12. ESTRUCTURA DE LA LECCIÓN, "PRACTICA LO APRENDIDO", PREGUNTAS Y FLASHCARDS

## 12.1 Plantilla obligatoria de una lección de subtema
Orden fijo de las diapositivas (máx. **20 en total**, portada y resumen incluidos; pueden ser menos: las que haga falta sin repetir contenido):
1. **Portada**: título del objetivo, código LPI, peso, tiempo estimado (`src: meta`).
2. **Áreas de conocimiento clave** del objetivo, tal cual el PDF.
3. **Archivos, términos y utilidades clave** (lista parcial del PDF), tal cual.
4. **Contenido**, en el **mismo orden que el PDF** (lección por lección), con los comandos, opciones, rutas, tablas y ejemplos del manual. Los diagramas del PDF se reproducen con el motor de diagramas (preferido) o como imagen extraída con texto alternativo.
5. **Resumen**, fiel al resumen del PDF.
Después de la última diapositiva, el visor muestra automáticamente un panel "Has terminado las diapositivas" con acceso directo a **Practica lo aprendido** (no se escribe a mano).
**Fidelidad**: no se inventan datos técnicos; se conserva la terminología del manual; si se resume, todos los tokens técnicos de la unidad siguen presentes (spec 11 §11.4). Densidad por diapositiva: ≤ 140 palabras, ≤ 14 líneas de código, ≤ 7 viñetas.
**Si el contenido no cabe en 20 diapositivas sin saturarlas, NO se recorta ni se excede el límite en silencio.** Se detiene el trabajo y se propone al usuario: (A) subir el límite para ese subtema, (B) mover material a "detalle ampliado" (visible en vista Web/PDF y en el panel de notas, no en el lienzo de la diapositiva), (C) llevar los ejercicios a la pestaña Práctica. La elección se registra con `/registrar-decision`.

## 12.2 Ejercicios del manual
Todos los ejercicios guiados y exploratorios del PDF, y sus respuestas, se trasladan **sin resumir** a `content-src/exercises/<id>.yaml`:
```yaml
- id: "105.1-eg-03"
  kind: guiado          # guiado | exploratorio
  statement: "…"
  answer: "…"
  source: ["105.1#u201", "105.1#u233"]
```
Se muestran en la pestaña Práctica (§12.5, bloque C).

## 12.3 Pestañas bajo la lección
Orden: **Mis notas personales · Laboratorio práctico · Comandos y glosario · Practica lo aprendido**.

## 12.4 Practica lo aprendido · Bloque A: test rápido
- Hasta **10 preguntas** (o menos si el banco es menor) extraídas del banco del subtema. Estratificado: al menos una pregunta por área de conocimiento clave mientras el banco lo permita; mezcla de tipos (single, multiple, fill).
- Una pregunta cada vez, **comprobación inmediata** con la respuesta correcta, la explicación y el enlace "ver en la diapositiva N" (`explainedIn`). Sin límite de tiempo.
- Resumen final con puntuación; se guarda `practice.quick[<id>] = { best, last, attempts, date }` y se muestra como insignia ("Test 8/10") en la fila del subtema del temario. "Repetir" prioriza las falladas y las no vistas.
- Los enlaces tipo Wikipedia (spec 13) **no** se aplican al enunciado ni a las opciones antes de responder; sí a la explicación.

## 12.5 Practica lo aprendido · Bloques B y C
**B. Mini-flashcards**: hasta **10 tarjetas** del banco del subtema (primero las vencidas según Leitner, luego las nuevas), con los mismos botones y atajos (1–4) que las flashcards globales y el mismo almacén de progreso. Enlace "Ver todas las tarjetas de este subtema" (mazo global filtrado).
**C. Ejercicios del manual**: acordeón con todos los ejercicios (guiados y exploratorios); cada uno con campo de respuesta opcional (se guarda en local) y botón "Ver respuesta" que muestra la respuesta oficial; marca de "hecho".

## 12.6 Reglas de calidad y mínimos
**Preguntas** (`content-src/questions/<tema>.yaml`), campos: `id, topicId, subtopicId, type, prompt, options?, correct, acceptedAnswers?, explanation, areaClave: [índices], source: [unidades], status: pendiente-verificacion | verificada, origin: legacy | pdf-ejercicio | generada`.
- Pool mínimo por subtema: **max(10, 3 × peso)**; cada área clave ≥ 2 preguntas.
- Cada respuesta correcta se comprueba contra el PDF y se anota en `source`; solo entonces `status: verificada`.
- Una única respuesta correcta inequívoca; distractores plausibles tomados de términos del propio manual; sin "todas las anteriores"; la posición de la respuesta correcta varía; en `multiple` se indica "Elige N".
- Las preguntas del legacy se **conservan y verifican**; las erróneas se corrigen o eliminan dejando constancia en el CHANGELOG. Las nuevas (`origin: generada`) se basan exclusivamente en el contenido del PDF.
**Flashcards** (`content-src/flashcards-extra.yaml` + las generadas de comandos/glosario), campos: `id, subtopicId, kind: comando|opcion|termino|archivo|concepto|areaClave, front, back, source, hint?`.
- Pool mínimo por subtema: una tarjeta por cada elemento de la lista parcial, por cada área clave y por cada opción/flag que el PDF documente para los comandos del subtema (mínimo absoluto 10).
- Sin duplicados; el anverso nunca contiene la respuesta; longitud: anverso ≤ 140 caracteres, reverso ≤ 400.

## 12.7 Lista de comprobación del usuario (va al final de cada informe HTML)
1. Abre el informe: **0 unidades en rojo**; revisa las naranjas (omitidas/exentas) y las amarillas (contenido del autor): ¿las apruebas?
2. Elige **3 párrafos al azar del PDF** y búscalos en las diapositivas con el buscador del informe: ¿dicen lo mismo?
3. Recorre las diapositivas en la app (modo pantalla completa): ¿falta algo que recuerdes del manual? ¿hay algo raro o incorrecto?
4. Entra en "Practica lo aprendido": haz el test y las flashcards; abre un par de ejercicios del manual.
5. Lee el veredicto de la auditoría (`docs/agent/auditorias/<id>.md`): debe ser APTO y sin hallazgos abiertos.
6. Si todo está bien, escribe literalmente: `VALIDADO <id>`.

## 12.8 Criterios de aceptación de R4 (e2e)
En `/estudiar/105.2` (y en un subtema del 101): la pestaña "Practica lo aprendido" existe y es la cuarta; el test muestra ≤ 10 preguntas, da feedback inmediato y guarda la puntuación (**persiste tras recargar** y aparece como insignia en el temario); las mini-flashcards muestran ≤ 10 tarjetas y respetan Leitner; el acordeón de ejercicios revela respuestas; tras la última diapositiva aparece el panel con acceso directo; funciona con bancos pequeños mostrando un aviso; axe sin violaciones serias; `/temario/:examen/:tema` muestra las áreas de conocimiento clave de cada subtema (desplegable).
