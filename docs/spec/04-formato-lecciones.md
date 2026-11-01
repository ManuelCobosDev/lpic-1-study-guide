# 4. FORMATO DE AUTORÍA DE LECCIONES (Markdown, un archivo por subtema)

El autor escribe `content-src/lessons/<id>.md`. **Una sola fuente alimenta las tres vistas** (diapositivas, web, PDF). Nunca se duplica texto.

## 4.1 Sintaxis
~~~markdown
---
id: "103.4"
title: Uso de secuencias, tuberías y redirecciones
estimatedMinutes: 40
objectives: [Redirigir stdin, stdout y stderr, Encadenar comandos con tuberías]
keyTerms: [stdin, stdout, stderr, tubería]
commands: [tee, xargs, cat]
---

<!-- layout: cover -->
# Uso de secuencias, tuberías y redirecciones
Objetivo LPI 103.4 · peso 4

---
<!-- layout: content -->
## Los tres flujos estándar
Texto con **negrita**, `código inline` y [enlace a comando](cmd:tee) o [término](term:stdout).
- Viñeta uno
- Viñeta dos

> [!TIP]
> Consejo (también [!INFO], [!WARNING], [!EXAM])

```bash {title="Ejemplo" highlight="2"}
ls /etc > lista.txt
cat lista.txt | wc -l
```

```terminal
$ ls /etc | head -3
adduser.conf
alternatives
```

```diagram
kind: streams
alt: Descripción accesible del diagrama
nodes: [...]
```

```quiz
question: ¿Qué operador añade al final de un archivo sin sobrescribir?
options: {a: ">", b: ">>", c: "|", d: "<"}
correct: [b]
explanation: ">>" abre el archivo en modo append.
```

:::notes
Nota del instructor (solo visible en vista web y en panel de notas).
:::
~~~

Reglas: el separador de diapositivas es una línea con solo `---` (la primera pareja delimita el frontmatter). La regla horizontal dentro de una diapositiva se escribe `***`. `<!-- layout: x -->` es opcional (por defecto `content`). Se admite HTML crudo, **siempre sanitizado con DOMPurify** (sin scripts, iframes ni manejadores de eventos). Imágenes: `![alt](content-assets/103.4/figura.png "pie")`.

## 4.2 Bloques soportados (se renderizan igual en las 3 vistas)
`heading` · `paragraph` (con enlaces internos `cmd:` y `term:`) · `list` · `steps` (lista numerada con insignia 24px) · `code` (lenguaje, título, líneas resaltadas, copiar) · `terminal` (prompt, comando, salida atenuada; copiar solo comandos) · `callout` (tip | info | warning | exam) · `table` · `image` · `diagram` · `keyterm` · `command-ref` · `kbd` · `quiz-inline` (comprobación inmediata; el resultado se guarda como checkpoint) · `html` · `slide-html` (**solo importación legacy, estrategia B o C**: diapositiva completa en HTML autocontenido servida desde `public/content-assets/<id>/`, mostrada en un `<iframe sandbox>` escalada desde su tamaño original, p. ej. 1920×1080, con título y texto indexables para la búsqueda). La estrategia concreta se decide tras el inventario (ver `docs/agent/DECISIONS.md`).

## 4.3 Motor de diagramas (`core/engines/diagram`, TypeScript puro + `shared/diagram/diagram-view`)
Los diagramas se describen con datos (YAML), nunca con SVG a mano. `layoutDiagram(spec, options) → DiagramScene` es determinista y puro; `diagram-view` solo pinta la escena con tokens CSS.
- **Tipos (`kind`)**: `flow` (secuencia/flujo), `layers` (pila de capas), `tree` (árbol de directorios), `segments` (barra segmentada proporcional: particiones, disco), `streams` (stdin/stdout/stderr, tuberías y redirecciones), `matrix` (rejilla, p. ej. bits rwx), `states` (máquina de estados).
- **`DiagramSpec`**: `{ kind, title?, caption?, alt (OBLIGATORIO), direction?, nodes, edges?, groups?, legend?, size? }`.
- **Reglas visuales idénticas en todos**: rejilla de 8 px; nodo mínimo 128×48, radio 8, borde 1,5 px, relleno `--<tono>-soft`, borde `--<tono>`, texto `--<tono>-text`; etiqueta 14/600, subetiqueta 12/400, rutas y comandos en JetBrains Mono 13; tonos permitidos únicamente `neutral | primary | success | warning | danger | info` (prohibido pasar colores crudos); separación 48 px horizontal y 32 px vertical; máx. 6 nodos por fila y 12 por diagrama; aristas ortogonales con esquinas redondeadas, trazo 1,5 px (2,5 px y `--primary` para la ruta principal), flecha 8×6, punteada para opcional; etiquetas de arista sobre píldora con fondo de superficie; grupos con borde discontinuo y etiqueta arriba a la izquierda; pasos numerados con insignia circular 20 px; leyenda automática si hay más de 2 tonos; título (H3) arriba y pie (caption) abajo fuera del SVG; mínimo 12 px de texto.
- **Accesibilidad**: `role="img"`, `<title>`, `<desc>` (del `alt`) y lista ordenada oculta visualmente con los nodos y aristas.
- **Modo oscuro por tokens**; **impresión vectorial** con tema claro forzado.
- **Entregable**: ≥ 8 diagramas reales (secuencia de arranque, capas del SO, árbol FHS, MBR/GPT, stdin/stdout/stderr con tubería, estados de un proceso, bits de permisos, enlace duro vs simbólico, targets de systemd) y tests unitarios del layout (sin solapamientos, texto dentro de su nodo, determinismo).

---
