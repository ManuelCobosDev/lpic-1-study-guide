# 6 (continuación). ESPECIFICACIÓN FUNCIONAL POR PANTALLA

## 6.6 Laboratorios
- `/laboratorios`: filtros (Tema, Dificultad, Estado: pendiente/en curso/completada), búsqueda y grid 3 columnas de tarjetas (código mono, título, ~30 min, dificultad, estado).
- `/laboratorios/:id`: **LabStepper** vertical a la izquierda con check por paso; paso activo a la derecha con título, instrucción, `CodeBlock` con copiar, **salida esperada plegable**, Callout ámbar "Alerta de examen", Callout azul "Pista", botones "Marcar paso como hecho", "Ver solución" (diálogo) y "Reiniciar práctica". Barra de progreso superior. Al completar todos los pasos: diálogo sobrio de enhorabuena y la práctica queda completada. Aviso inicial descartable "Necesitas una VM Debian 12" con diálogo de guía de preparación. **No hay terminal simulada**: son pasos guiados con comandos copiables. Los pasos completados persisten.

## 6.7 Simulador
- `/simulador`: 2 tarjetas ("Simulacro cronometrado" y "Práctica libre"), "Entrenar por tema" (4 chips), tabla "Últimos intentos" (5 filas: fecha, modo, puntuación 200–800, aprobado/suspendido, enlace a resultados), banner "Retomar simulacro en curso" si lo hay.
- **Selección**: tamaño = `min(60, preguntas reales disponibles)`; tiempo = 1,5 min × nº de preguntas (90 min si son 60). Las preguntas con `placeholder: true` se excluyen salvo que se active "Incluir contenido de ejemplo" en Ajustes. Reparto por subtema proporcional a su peso (método del mayor resto) y **barajado determinista por semilla** (mulberry32).
- `/simulador/examen` (sin sidebar, pantalla completa): **TimerBar** sticky calculada desde `startedAt` persistido (sobrevive a recargas; ámbar a ≤ 10 min, rojo a ≤ 2 min; `aria-live` cada minuto); `QuestionCard` centrada (máx. 760 px) con tipos single (radio), multiple (checkbox, "Elige N") y fill (input); "Marcar para revisar"; Anterior/Siguiente; **QuestionNavigator** en columna derecha con estados (actual, respondida, sin responder, marcada; en móvil, cajón inferior); "Finalizar" con diálogo que lista sin responder y marcadas; fin automático al agotarse el tiempo. Guardado continuo.
- **Puntuación** (`core/engines/scoring`, con tests): acierto = conjunto exacto de respuestas correctas (todo o nada); `fill` compara normalizado (trim, minúsculas, espacios colapsados) con `acceptedAnswers`; puntos por pregunta = peso del subtema ÷ nº de preguntas de ese subtema en el examen; **escala = round(200 + 600 × puntos obtenidos / puntos totales)**; aprobado ≥ 500.
- `/simulador/practica` (`?tema=`): filtros (tema, subtema, tipo, solo falladas, solo marcadas), una pregunta a la vez con "Comprobar" y explicación inmediata, sin tiempo.
- `/simulador/resultados?id=`: anillo con puntuación, aprobado/suspendido, tiempo usado, barras por tema, temas débiles con enlaces a sus subtemas, revisión en acordeón (tu respuesta, la correcta, explicación) con filtros Todas/Falladas/Marcadas, botones "Repetir simulacro" y "Practicar temas débiles".

## 6.8 Comandos, Glosario, Flashcards
- `/comandos`: búsqueda + filtros (categoría, tema) reflejados en la URL, vista tabla/tarjetas, contador "N de M" (M calculado), fila expandible con sinopsis, ejemplos, flags y botón copiar, enlaces a los subtemas donde aparece.
- `/glosario`: búsqueda, **AlphaIndex A–Z sticky** (letras sin términos deshabilitadas), lista agrupada por letra con definición, "Relacionados" (scroll al término) y "Aparece en 103.2" (enlace profundo a diapositivas).
- `/flashcards`: mazos (Glosario, Comandos, Mixto) con "N para hoy"; tarjeta centrada que gira con clic o `Espacio`; botones "Otra vez · Difícil · Bien · Fácil" (atajos `1–4`). **Leitner** (`core/engines/leitner`, con tests): cajas 1–5 con intervalos 0, 1, 3, 7 y 21 días; Otra vez → caja 1; Difícil → misma caja; Bien → +1; Fácil → +2 (máx. 5); límite diario de tarjetas nuevas configurable (20 por defecto); resumen de sesión al terminar.

## 6.9 Mapa mental
Generado desde el manifiesto: raíz LPIC-1 → exámenes → temas → subtemas. Layout jerárquico izquierda→derecha con `d3-hierarchy`, SVG propio con pan/zoom (`d3-zoom`). Nodos coloreados **solo por estado** (verde completado, azul actual, gris pendiente). Controles de zoom, "Ajustar a pantalla", minimapa, buscador de nodos, filtro "Solo pendientes", panel lateral al seleccionar (descripción, peso, estado, "Ir a estudiar"). Contador de nodos calculado. Carga diferida con skeleton.

## 6.10 Progreso (`/progreso`)
4 StatCards (progreso global, racha actual, horas estudiadas, mejor puntuación) · grid 2 col: **mapa de calor** de 26 semanas (tooltip con minutos) y **gráfica de puntuaciones** (línea; referencia de aprobado en 500) · grid 2 col: temas débiles (peor % de acierto) y "Siguiente paso recomendado" · tabla de progreso por tema con barras · botón "Exportar copia de seguridad" arriba a la derecha. Estados vacíos amables.

## 6.11 Exportar / importar / reiniciar (`/ajustes` y `/progreso`)
- **Exportar** → `lpic1-backup-YYYY-MM-DD.json` con `{ format:"lpic1-aula-backup", schemaVersion, appVersion, exportedAt, data:{…todos los stores, incluidas notas y preferencias}, checksum }` (SHA-256 de `data` con `crypto.subtle`). También "Exportar resumen CSV" (una fila por subtema) e "Imprimir informe de progreso".
- **Importar** (asistente de 3 pasos en diálogo): (1) elegir archivo (arrastrar o botón); (2) validar con Zod + checksum + `schemaVersion` (rechaza versiones futuras con mensaje claro) y **vista previa** (subtemas completados, intentos, notas, fecha, diferencias con lo actual); (3) modo **Reemplazar** o **Fusionar** (lo más reciente por marca de tiempo; une diapositivas vistas y notas) y confirmar. Antes de aplicar guarda instantánea en `lpic1.v1.backup.pre-import`; toast con "Deshacer" 30 s y botón "Deshacer última importación" en Ajustes.
- **Recordatorio**: si hay progreso y han pasado ≥ 14 días desde `lastExportAt`, banner descartable.
- **Reiniciar**: diálogo que exige escribir `BORRAR`, con selector de qué borrar (todo / simulador / estudio / notas) y oferta de exportar antes.

## 6.12 Resto
`/ajustes` (Apariencia: tema, densidad, tamaño de texto · Estudio: vista por defecto, tarjetas nuevas/día, notas del instructor, incluir contenido de ejemplo · Datos · Atajos · Privacidad), `/erratas` (lista filtrable por gravedad), `/acerca-de` (qué es, aviso no oficial, créditos, cómo añadir contenido → `CONTENT_GUIDE.md`, versión), 404.
Toda vista tiene estados de carga (skeleton), vacío (EmptyState con acción) y error. Metadatos `title` por ruta.

## 6.13 Accesibilidad, responsive y rendimiento
- AA en claro y oscuro; navegación completa por teclado en visor, paleta, simulador y flashcards; foco visible; estado nunca solo por color; `aria-live` en cambio de diapositiva/pregunta/resultados/temporizador (cada minuto).
- Responsive: ≥1280 layout completo · 1024–1279 sidebar visible · 768–1023 sidebar en Sheet y grids a 2 col · <768 una columna, hamburguesa, CTAs apilados a ancho completo, QuestionNavigator en cajón, miniaturas ocultas, tablas con scroll horizontal contenido. Sin scroll horizontal de página en 390 px. Objetivos táctiles ≥ 44 px.
- Rendimiento: carga diferida de MiniSearch, highlight.js, mapa mental, visor a pantalla completa y cada lección; imágenes con ancho/alto; sin saltos de layout.

---
