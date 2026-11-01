# 13. ENLACES TIPO WIKIPEDIA (comandos y términos)

Comportamiento buscado: donde aparezca un comando o un término del glosario, al **pasar el cursor** se ve una tarjeta con su definición y al **hacer clic** se va a la sección (diapositiva) donde se explica. En el glosario y en el catálogo de comandos, cada entrada muestra y enlaza "Se explica en".

## 13.1 Datos
- Cada entrada de `commands.yaml` y `glossary.yaml` tiene: `short` (definición breve, ≤ 280 caracteres, obligatoria), `aliases?` (variantes: "pipe", "tubería"), y `explainedIn` (lista de ubicaciones `"<subtema>#<diapositiva>"`, la primera es la principal).
- **`explainedIn` se calcula en el build** (`build-content`) con esta puntuación para cada diapositiva que contenga el término: +100 si está en el título o en un encabezado · +50 si aparece en negrita o en un bloque de definición · +30 si está en las listas `keyTerms`/`commands` de su lección · +10 si es la primera aparición en el subtema. Gana la mayor puntuación; en empate, la diapositiva más temprana. Se admite sobrescritura manual (`explainedIn: ["105.2#4"]`).
- **Validación**: la diapositiva indicada debe contener realmente el término; si un término/comando no tiene ubicación y no lleva `sinExplicacion: "<motivo>"`, el build falla.

## 13.2 Autoenlazado (motor puro `core/engines/autolink`, se ejecuta en el build)
Produce nodos `termref { ref: "cmd:chmod" | "term:stdout", text }` dentro de la lección ya parseada. Así el resultado es determinista y testeable, y la vista PDF/impresión puede degradarlo a texto plano.
Reglas:
1. Coincidencia por palabra completa y la más larga primero ("redirección de salida" antes que "redirección"). Comandos: sensibles a mayúsculas. Términos: insensibles a mayúsculas y tildes; se reconocen `aliases` y plural simple.
2. **Solo la primera aparición por diapositiva.**
3. **No se enlaza**: dentro de bloques `code` y `terminal` (sí en `código inline` de un comando), en títulos, en la diapositiva que es la `explainedIn` principal del propio término, ni dentro de otro enlace.
4. **No se aplica** en: enunciados y opciones de preguntas (examen y test rápido) antes de responder, reverso/anverso de flashcards, ni en la vista de impresión.
5. Sí se aplica en: diapositivas, vista Web, instrucciones de laboratorio, ejercicios del manual, descripciones del catálogo de comandos y del glosario, explicaciones de preguntas ya respondidas y panel del mapa mental.

## 13.3 Componente `app-term-link`
- Es un `<a>` real (`href` a la ubicación principal), por tanto funciona con teclado, clic central y "abrir en pestaña nueva".
- **Tarjeta de vista previa** (máx. 320 px): nombre (mono si es comando), categoría, `short`, y los botones "**Se explica en: 105.2 · Diapositiva 4 · «título»**" y "Ver en glosario". Si hay varias ubicaciones, lista hasta 3.
- Interacción: apertura al pasar el cursor tras 250 ms y cierre a los 150 ms (permanece abierta si el cursor entra en la tarjeta); `focus` también la abre; `Esc` la cierra; `aria-describedby` apunta a la tarjeta; en táctil, el primer toque abre la tarjeta y el botón navega. Respeta `prefers-reduced-motion`. Posicionamiento con CDK Overlay (flip si no cabe).
- Estilo discreto: subrayado punteado con `--primary-text`, sin cambiar el color del texto del código; foco visible.

## 13.4 Navegación al hacer clic
Va a `/estudiar/<subtema>?vista=<preferida>&slide=N&q=<término>` y **resalta el término** (`<mark>`). Si ya se está en esa diapositiva, solo se resalta y se enfoca. En la vista Web va a la sección equivalente.

## 13.5 Glosario y catálogo de comandos
- Cada entrada muestra chips "Se explica en 103.4 · Diap. 6" (enlaces profundos), sus términos relacionados como `app-term-link`, y el `short`.
- El catálogo de comandos añade la columna/fila "Se explica en".
- Si una entrada no tiene `explainedIn` por `sinExplicacion`, muestra el motivo en lugar del enlace.

## 13.6 Rendimiento y accesibilidad
Sin saltos de layout; la tarjeta se monta bajo demanda; una lección de 20 diapositivas con 100 enlaces no degrada el desplazamiento (medido). axe sin violaciones serias; contraste AA de los enlaces en ambos temas.

## 13.7 Criterios de aceptación de R3 (e2e + unit)
1. En una diapositiva con un comando enlazado, pasar el cursor abre la tarjeta en ≤ 400 ms con definición y "Se explica en"; `Esc` la cierra; con teclado (Tab) también se abre.
2. Clic → llega a la diapositiva correcta (`?slide=`), el término queda resaltado y el historial del navegador permite volver.
3. En `/glosario` y `/comandos` toda entrada tiene "Se explica en" que **abre una diapositiva que contiene el término** (test recorre todas las entradas).
4. No hay enlaces dentro de `code`/`terminal`, ni autoenlaces en la propia diapositiva de definición, ni más de uno por término y diapositiva (unit del motor con casos: palabra más larga, plural, tildes, alias, mayúsculas en comandos).
5. El build falla con un término sin ubicación (test) y con una ubicación que no contiene el término (test).
6. Los enunciados del simulador y del test rápido no contienen enlaces.
