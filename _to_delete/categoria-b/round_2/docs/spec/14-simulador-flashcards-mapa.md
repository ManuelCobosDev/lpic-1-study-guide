# 14. SIMULADOR 102, FLASHCARDS MASIVAS Y MAPA MENTAL

## 14.1 Simulador del examen 102 (F1)
**Datos**
- Inventaria en el legacy el banco de preguntas del 102 (dónde está, formato, nº por tema) y se **importa con un script reproducible** (`scripts/import-legacy/questions-102.ts`) a `content-src/questions/105.yaml … 110.yaml`, conservando ids, mapeando cada pregunta a su subtema y marcando `status: pendiente-verificacion` hasta que el bucle S-xxx la verifique contra el PDF (spec 12 §12.6). Nada se descarta en silencio: las no importables van a un informe con motivo.
**Aplicación**
- `/simulador` muestra un selector **Examen 101-500 | Examen 102-500** (por defecto el último usado). "Entrenar por tema" muestra los chips del examen elegido (101–104 o 105–110).
- `/simulador/examen?exam=102` (y `/simulador/practica?exam=102&tema=105`): selección de `min(60, preguntas disponibles)` solo de los temas 105–110, repartidas por peso de subtema (8/4/12/12/14/10), barajado con semilla, 1,5 min por pregunta (90 min si son 60). El intento guarda `examId`; la tabla "Últimos intentos" y los resultados lo muestran; la puntuación escalada 200–800 y el aprobado ≥ 500 se calculan con los pesos del examen correspondiente.
- Mientras haya preguntas `pendiente-verificacion`, `/simulador` muestra un aviso discreto "Banco en revisión: N de M verificadas" y un ajuste "Usar solo preguntas verificadas" (desactivado por defecto para que el simulador funcione desde ya).
- El simulador 101 no cambia su comportamiento.
**Criterios (e2e f1)**: iniciar un simulacro del 102; las preguntas pertenecen solo a 105–110 y el reparto por tema es proporcional (tolerancia ±1); el temporizador arranca en 90:00 (o 1,5 min × nº); recargar a mitad reanuda con el tiempo correcto; los resultados muestran el desglose por temas 105–110 con sus nombres; `?exam=102` funciona por enlace directo; hay ≥ 1 pregunta por cada uno de los 19 subtemas (si no, el informe lo lista y el gate falla); el 101 sigue pasando sus tests.

## 14.2 Flashcards masivas (F2)
**Generador** `scripts/generate-flashcards.ts` (determinista, `npm run build:content` lo ejecuta), a partir de:
- `commands.yaml`: por comando una tarjeta "¿Qué hace `cmd`?" (reverso: `short` + sinopsis) y una por **cada opción/flag documentado** ("¿Qué hace `-R` en `chmod`?").
- `glossary.yaml`: una tarjeta por término (anverso: término o definición, alternando los dos sentidos solo si hay `short`).
- `flashcards-extra.yaml`: tarjetas por archivo/ruta de la lista parcial, áreas de conocimiento clave y conceptos del PDF (`source` obligatorio).
- Reglas de calidad en spec 12 §12.6 (sin duplicados, longitudes, sin respuesta en el anverso). El generador emite un informe con el nº de tarjetas por tipo, subtema y examen.
**Página `/flashcards`**
- Mazos: Todo · por examen · por tema · por subtema · Solo comandos · Solo glosario · Vencidas hoy; con contadores "N para hoy · M nuevas · T totales".
- Sesión con tope diario de tarjetas nuevas configurable (20 por defecto) y tope de repaso; Leitner con cajas 1–5 (0, 1, 3, 7 y 21 días); progreso persistente; atajos 1–4 y Espacio.
- Explorador del mazo (lista paginada o virtualizada, con búsqueda) que soporta **≥ 2 000 tarjetas** sin bloquear la interfaz.
**Criterios (e2e f2)**: el total de tarjetas es ≥ nº de comandos + nº de términos (calculado del manifiesto, no escrito a mano); existe tarjeta de al menos el 95 % de las opciones documentadas; cada subtema tiene ≥ 10 tarjetas; una sesión con las 4 valoraciones persiste las cajas tras recargar; el explorador abre un mazo de ≥ 1 000 tarjetas en < 1 s y permite buscar; los contadores de la Home y de `/flashcards` coinciden con el manifiesto.

## 14.3 Mapa mental (F3)
**Método (`/corregir-bug`)**: reproducir en `npm start` y en el build de producción; capturar errores de consola y de red; identificar la causa raíz con archivo y línea; escribir el test e2e que falla; corregir; comprobar que pasa en ambos modos.
**Comportamiento requerido**
- Jerarquía: raíz LPIC-1 → exámenes (2) → temas (10) → subtemas (42) y, con el interruptor **"Mostrar comandos y términos"**, los comandos y términos clave de cada subtema (esto sustituye a los ~475 nodos del mapa legacy: se inventaría qué contenía y se reproduce derivado del contenido actual).
- Layout jerárquico izquierda→derecha determinista; pan (arrastrar), zoom (rueda, pellizco y botones), "Ajustar a pantalla", minimapa, buscador de nodos, filtro "Solo pendientes", expandir/colapsar ramas.
- Color por estado (verde completado, azul actual, gris pendiente) leído del progreso real; clic en un nodo abre un panel con descripción, peso, estado y "Ir a estudiar" (profundo, `explainedIn` para comandos/términos).
- Teclado (flechas para moverse entre nodos, Enter abre el panel, `+`/`-` zoom), `aria-label` por nodo; usable en 390 px.
- El contador de nodos se calcula del contenido.
**Criterios (e2e f3)**: la ruta carga en < 2 s sin errores de consola en desarrollo y en producción; se pintan 1 + 2 + 10 + 42 nodos; con el interruptor activado aparecen los nodos de comandos y términos (nº = calculado); zoom y arrastre cambian la transformación; "Ajustar a pantalla" deja todos los nodos visibles; el buscador centra un nodo; el filtro oculta los completados; marcar un subtema como completado lo pinta de verde al volver al mapa; clic → "Ir a estudiar" abre el subtema correcto; funciona en móvil 390 px y axe no da violaciones serias.
