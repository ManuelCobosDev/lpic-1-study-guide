---
name: auditar-web
description: Auditoría integral de lpic1.manuelcobos.dev con un orquestador y 9 subagentes especializados (visual, navegación, visor de diapositivas, integridad de contenido, exactitud técnica LPI, diseño/tokens, a11y/SEO/rendimiento, herramientas interactivas, higiene del repo). Fase 1 es solo lectura y produce informe + backlog priorizado; la Fase 2 (arreglos) exige aprobación explícita por oleada. Úsala en una conversación nueva con "/auditar-web".
---

# /auditar-web · Auditoría integral de la web LPIC-1 Study Guide

Eres el **ORQUESTADOR**. No has escrito esta web y no la defiendes. Tu trabajo es encontrar problemas reales, con evidencia, y entregar un backlog que otro agente pueda ejecutar sin dudas.

## 0. Reglas no negociables

1. **Fase 1 = SOLO LECTURA.** No edites `src/`, `content-src/`, `scripts/`, `docs/spec/`, `e2e/` ni nada existente. Lo único que puedes crear es la carpeta de salida `docs/agent/auditorias/web-AAAA-MM-DD/` (informes, `hallazgos.json`, capturas).
2. **Antes de empezar lee**: `AGENTS.md`, `docs/agent/STATUS.md`, `docs/DESIGN_SYSTEM.md`, `docs/spec/05-diseno.md`, `docs/spec/04-formato-lecciones.md` y `.agents/rules/*` (en especial `20-entorno-windows.md`: usuario en Windows/PowerShell, scripts solo Node/TS vía `npm run`, nada de bash POSIX).
3. **Cero invención.** Cada hallazgo lleva evidencia verificable: `ruta:línea`, captura, o comando + salida. Un problema visual sin captura propia NO es un hallazgo confirmado (márcalo `NO VERIFICADO`). Si dudas de un dato técnico de LPIC-1, no lo "corrijas" de memoria: cita la fuente oficial (objetivos LPI 500, manual en `_legacy/`/PDF) o márcalo `DUDOSO`.
4. **No avances ni valides subtemas del examen 102.** Esa regla (`.agents/rules/40-cobertura-y-fidelidad.md`) sigue vigente: esta auditoría no sustituye a `/auditar-subtema` ni a `VALIDADO <id>`.
5. **No repitas trabajo entre agentes.** Cada agente tiene su alcance; si encuentra algo de otro alcance, lo anota en `cruces` del hallazgo y el orquestador lo deduplica.
6. Si el entorno no permite subagentes, ejecuta A1→A9 en secuencia, cada uno con contexto limpio (relee solo lo que necesite).

## 1. Cómo ejecutar

1. **Preparación (orquestador)**
   - `npm install` si hace falta, `npm run verify` (anota qué etapas fallan; no lo arregles) y `npm run build`.
   - Levanta la app compilada con `npm run preview` (o `npm run dev`) y confirma que carga `http://localhost:4200/`.
   - Crea `docs/agent/auditorias/web-<fecha>/{capturas,}`.
2. **Lanza A1–A9 en paralelo** (los que no dependen entre sí: todos salvo A9, que reutiliza capturas de A1). Cada uno entrega `A<n>-<nombre>.md` y añade sus filas a `hallazgos.json`.
3. **Consolidación (orquestador)**: deduplica, reasigna severidad con la escala de la §4, comprueba al azar el 20 % de hallazgos P0/P1 reproduciéndolos tú mismo, y genera `00-resumen.md` + `backlog.md` (§5).
4. **Detente** y presenta al usuario el resumen (máx. 25 líneas) y la propuesta de oleadas. No empieces la Fase 2 sin `APROBADO <oleada>`.

## 2. Hallazgos ya detectados (semilla) — VERIFICAR, no asumir

Salen de leer el repo (`main`, commit `e2e9d87`) y de capturas antiguas de `e2e/screenshots/` (Oct–1 nov). La web desplegada es una SPA: se ha podido leer el código y el contenido, **no renderizarla**, así que lo visual debe re-confirmarse con A1 sobre la build actual.

| ID | Sev. | Hallazgo | Evidencia de partida | Estado |
|---|---|---|---|---|
| S-01 | P0 | 9 lecciones (108.3, 108.4, 109.1–109.4, 110.1–110.3) tienen **un único `id` de diapositiva repetido** (p. ej. `110.1-slide-110`) y el mismo `slideNumber` en todas. Rompe `track slide.slideNumber`, miniaturas, progreso y enlaces profundos. | `content-src/lessons/*.json` (1 id único por lección) | Confirmado en datos; probar efecto en UI |
| S-02 | P0 | **Lecciones esqueleto**: 110.1–110.3 (53 diapositivas) contienen solo un título; 108.3–109.4 tienen título + 1 párrafo (~5 KB frente a 40–110 KB de 101–104), sin callouts/terminal. Laboratorios de 108.1–108.4, 109.4 y 110.3 pesan ~650 B (stubs). | tamaños y bloques por lección | Confirmado en datos; comprobar el resto de labs 108–110 |
| S-03 | P0 | **Cifras públicas inflan la realidad**: README afirma "100 % cobertura real, 0 placeholders"; `STATUS.md`/`PROGRESO_R2.md` dicen que solo 105.1 está auto-verificado. La home suma `totalSlidesReal + totalSlidesPlaceholder`. README: 770 diapositivas, 193 comandos, 230 términos; datos actuales: 771 / 197 / 238. | `home-page.component.ts:1039`, `README.md`, `commands.yaml`, `glossary.yaml` | Confirmado |
| S-04 | P1 | **Portada de diapositiva con título duplicado** (eyebrow + h1 arriba y otro h2 con subtítulo debajo) y mucho espacio muerto en el slide 1/19. | capturas `r2-R0/f4-…`, `fase-12/lesson-dark.png` | Re-verificar en build actual |
| S-05 | P1 | **258 de 261 bloques `html` con colores hex/rgb literales** (viola la regla R6). Con colores fijos es probable que no respeten el tema oscuro (A1/A6 deben comprobarlo; no se verificó cómo se pinta el bloque `html` con `sanitizedHtml`: el renderer solo muestra un caso `slide-html` con `<iframe>` de 16:9). `check:tokens` solo escanea `.ts/.html/.css/.scss`, no `content-src`. | `content-src/lessons/10*.json`, `slide-html-block.component.ts`, `scripts/check-tokens.ts` | Confirmado en datos; ver efecto en oscuro (A1/A6) |
| S-06 | P1 | **Dos "lenguajes visuales" de lección**: 101–104 usan 5–12 bloques `html` por lección; 105.1 usa 0 y bloques nativos. Solo hay 1 bloque `diagram` en 771 diapositivas pese a prometer diagramas vectoriales. | recuento de tipos de bloque | Confirmado |
| S-07 | P1 | **Títulos genéricos repetidos** entre lecciones: "Ejercicios guiados oficiales (manual LPI)" ×6 y "Retos de exploración del manual oficial" ×5 → ambiguos en miniaturas, buscador y mapa mental. | recuento de títulos | Confirmado |
| S-08 | P1 | **SEO/a11y base**: `index.html` con `lang="en"` (contenido en español), `<title>Lpic1StudyGuide</title>`, sin meta description, Open Graph ni theme-color; no se encontró actualización de `lang` en runtime. | `src/index.html` | Confirmado en código; revisar `DOM` final |
| S-09 | P2 | **Cabecera apretada**: logo "LPIC-1 Aula" y "Mapa mental" saltan a 2 líneas a 1280 px; 8 enlaces + buscador + tema + ajustes. Breadcrumb muestra el slug "Mapa-mental". Banner "Tu progreso se guarda solo…" ocupa espacio en cada página hasta descartarlo. | capturas `r2-R7/01-…`, `fase-12/mobile-…` | Re-verificar |
| S-10 | P2 | **Mapa mental ilegible a 1:1**: texto diminuto, enorme espacio vacío, etiquetas truncadas; minimapa casi vacío. | `r2-R7/01-mapa-base-desktop.png` | Re-verificar |
| S-11 | P2 | **Navegación redundante/expuesta**: 3 CTAs al simulador en la home (hero, tarjeta de herramientas, banda); tarjetas "Diapositivas" y "Subtemas" enlazan ambas a `/temario`; el pie enlaza `/guia-estilos` en producción. | `home-page.component.ts`, `footer.component.ts` | Confirmado en código |
| S-12 | P2 | **Jerga interna filtrada**: las 23 rutas llevan `data.phase: 'Fase N'` (solo lo lee `NotImplementedPageComponent`, que no está enrutada → código muerto). La home de octubre mostraba "Planificado para Fase 11" y Examen 102 "Próximamente". | `app.routes.ts`, `not-implemented-page` | Re-verificar texto actual |
| S-13 | P2 | **Botón único (Regla 30) incumplida**: `<button>` nativos fuera de primitivas en `header`, `app-shell` y `search-palette`. | `grep "<button"` | Confirmado |
| S-14 | P2 | **Componente gigante**: `home-page.component.ts` tiene 1 096 líneas (plantilla + estilos inline). Mantenibilidad y duplicación de estilos. | `wc -l` | Confirmado |
| S-15 | P2 | La FAQ pregunta "¿Puedo estudiar sin conexión?" pero **no hay service worker** (`ngsw`/`provideServiceWorker` ausentes). Comprobar que la respuesta no promete offline. | `grep` | A verificar |
| S-16 | P3 | **Higiene del repo**: `round_2/` es copia del paquete de arranque (AGENTS.md y reglas idénticos a la raíz; `PROGRESO_R2.md` difiere y dice "Siguiente paso: R3" estando R7 hecha); `README.md` con URL de clonado `github.com/usuario/…` y "Karma / Jasmin"; `webDocument` en cada lección parece vestigial (la vista web usa `slides()`); 88 PNG en `e2e/screenshots/` mezclando fases ya obsoletas. | árbol del repo | Confirmado |

## 3. Subagentes

Todos: usan la escala de §4, el formato de §6 y escriben `A<n>-<nombre>.md` con (a) resumen de 10 líneas, (b) tabla de hallazgos, (c) qué **no** pudieron comprobar.

### A1 · Auditor visual (capturas)
- **Alcance**: aspecto real de la app. Genera con Playwright (el repo ya lo usa; reutiliza `playwright.config.ts`) capturas de página completa de: `/`, `/temario`, `/temario/101`, `/temario/102`, un tema, `/estudiar/<id>` (modo diapositivas, web y `/imprimir`), `/laboratorios`, un lab, `/simulador` (+ examen, práctica, resultados), `/comandos`, `/glosario`, `/flashcards`, `/mapa-mental`, `/buscar`, `/progreso`, `/erratas`, `/ajustes`, `/acerca-de`, 404.
- **Matriz**: viewports 390×844, 768×1024, 1280×800, 1920×1080 × tema claro/oscuro. Lecciones de muestra: **101.1, 102.1, 103.4, 105.1** (completas), **106.2, 108.2** (medias), **108.3, 109.1, 110.1** (esqueleto).
- **Busca**: desbordes horizontales, texto cortado o solapado, saltos de línea feos (logo, nav), espacios muertos, bloques que no cambian de tema (iframes), imágenes/SVG que se salen, tablas que no hacen scroll, contraste dudoso, estados vacíos mal resueltos, jerarquía visual débil, inconsistencias de espaciado/radios/sombras entre pantallas.
- **Entrega**: `capturas/<ruta>-<viewport>-<tema>.png` + índice con enlace desde cada hallazgo. Compara con `e2e/screenshots/` solo para detectar regresiones, no como verdad.

### A2 · Navegación, arquitectura de la información y copy
- Rastrea **todos** los `routerLink`/`href` (código y contenido) y comprueba que resuelven; enlaces rotos entre lecciones, glosario, comandos y mapa.
- Revisa cabecera, menú móvil (¿le falta Buscar/Ajustes?), breadcrumbs (slug sin formatear), pie, banner persistente, CTAs duplicados, orden lógico del menú (¿Temario → Laboratorios → Simulador… refleja el flujo de estudio?), nombre de marca ("Aula" vs "Study Guide"), páginas huérfanas (`/guia-estilos`).
- Copy: textos desfasados ("Próximamente", "Fase N"), cifras hardcodeadas vs calculadas, promesas que el producto no cumple (offline, "100 %"), tono y tuteo coherentes, tildes y ortografía en toda la UI.
- Propón un **mapa de navegación objetivo** (qué se queda, se fusiona o se elimina de la home).

### A3 · Visor de lecciones (diapositivas, vista web, imprimir, "Practica lo aprendido")
- Para **cada una de las 42 lecciones** comprueba mediante script (Node/TS, solo lectura): ids/`slideNumber` únicos, orden, diapositivas sin contenido, nº de diapositivas (objetivo ≤ 20), tamaño de cada slide (riesgo de overflow en 16:9: nº de bloques, filas de tabla, líneas de código), portada, cierre/CTA.
- En navegador: atajos (`←` `→` `F` `T`), pantalla completa, miniaturas, escalado a 390 px, coherencia entre modo diapositivas / web / imprimir (¿muestran lo mismo?), PDF de impresión (saltos de página, colores), pestaña de práctica (test ≤ 10, flashcards ≤ 10), progreso al navegar, deep links.
- Evalúa la **portada duplicada** (S-04) y el espacio muerto; propón una plantilla de portada y de cierre únicas.
- Define una **plantilla canónica de diapositiva** (cuántos bloques, qué jerarquía) y mide cuántas de las 771 la incumplen.

### A4 · Integridad y duplicados de contenido (scripts, sin juicio pedagógico)
- Escribe scripts en `docs/agent/auditorias/web-<fecha>/scripts/` (no en `scripts/` del repo) que calculen:
  - ids/títulos duplicados dentro y entre lecciones; bloques idénticos o casi idénticos (hash + similitud) repetidos entre lecciones; diapositivas "resumen" que repiten otras.
  - Duplicados y cuasi-duplicados en `glossary.yaml`, `commands.yaml`, `flashcards-extra.yaml`, `questions/*.json` (mismo enunciado con distinto id, mismas opciones permutadas).
  - Referencias cruzadas rotas: `subtopicIds`, `related`, `commands` de cada lección vs `commands.yaml`, términos clave vs glosario, `curriculum.yaml` (42 subtemas, pesos 101/102 sumando 60+60).
  - Campos vacíos o stubs: `placeholder`, textos tipo "TODO/lorem/pendiente", labs de ~650 B, preguntas sin explicación, flashcards sin respuesta.
  - Cobertura por subtema: diapositivas, lab, preguntas, flashcards, comandos, glosario → matriz 42 × recursos (los huecos son el backlog de contenido).
- Contrasta cifras mostradas en la UI/README con el recuento real.

### A5 · Exactitud técnica y calidad pedagógica (LPIC-1 v5.0, Debian 12)
- Muestreo estratificado: **todas** las lecciones de 101–104 al menos por una pasada rápida (son las más antiguas), más una selección de 105.2–108.2. Prioriza tablas de opciones, sintaxis, rutas (`/etc/...`), valores por defecto, versiones.
- Contrasta con objetivos oficiales LPI 101-500/102-500 y el manual; marca `ERROR`, `IMPRECISO`, `OBSOLETO` o `DUDOSO` con la cita de la fuente. **No corrijas de memoria.**
- Revisa coherencia terminológica (mismos términos en lección, glosario, preguntas), nivel de dificultad, "trampas de examen" correctas, preguntas con más de una respuesta defendible, explicaciones que no justifican la respuesta.
- Coteja `errata.yaml` con lo realmente corregido en lecciones; ¿las erratas siguen vigentes?
- Estilo: ortografía/tildes, mezcla español/inglés, emojis decorativos en texto técnico, longitud de párrafos.

### A6 · Sistema de diseño, CSS y tokens
- Verifica el cumplimiento real de `DESIGN_SYSTEM.md`: colores literales **también en `content-src`** (S-05), `<button>` nativos (S-13), uso mezclado de Tailwind vs CSS propio, tamaños/radios/sombras fuera de tokens, `app-container` en todas las vistas.
- Inventario de componentes UI y duplicados funcionales (tarjetas, chips, badges, callouts con variantes casi iguales); estilos repetidos entre `home-page`, `curriculum`, `labs`, etc.; componentes > 500 líneas (S-14) con propuesta de división.
- Dark mode: lista de elementos que no respetan tokens (iframes, SVG de mapa mental, diagramas, imágenes con fondo blanco).
- Propón **tokens y componentes nuevos** solo si eliminan duplicación demostrada; no rediseñar por gusto.

### A7 · Accesibilidad, SEO y rendimiento
- Ejecuta `@axe-core/playwright` en **todas** las rutas × tema × móvil/escritorio (no solo las del E2E actual); registra violaciones por regla.
- Revisión manual: orden de foco, `skip-link`, trampas de foco en diálogo/paleta/visor, `aria-*` del visor de diapositivas y pestañas, `prefers-reduced-motion`, objetivos táctiles ≥ 44 px, legibilidad del mapa mental (texto mínimo), contraste en oscuro.
- SEO/compartir: `lang`, `<title>` y `description` por ruta, Open Graph/Twitter, favicon/manifest, `robots`/`sitemap` (con Cloudflare + `not_found_handling = single-page-application`, ¿las rutas profundas devuelven 200 y metadatos útiles?).
- Rendimiento: Lighthouse (móvil y escritorio) en home, lección y mapa; peso del bundle inicial y de los JSON de contenido (771 diapositivas), carga diferida de iframes, CLS por iframes 16:9, fuentes. Cifras antes/después.
- Offline: confirma si la FAQ promete algo que no existe (S-15).

### A8 · Herramientas interactivas
- **Simulador** (101 y 102): sorteo ponderado, temporizador persistente tras recarga, puntuación 200–800, tipos `single/multiple/fill`, corrección de respuestas abiertas (¿acentos, mayúsculas, espacios?), resultados, filtro por tema.
- **Flashcards (Leitner)**, **comandos** (filtros, tabla/tarjetas, popovers tipo Wikipedia), **glosario A–Z**, **buscador** (Ctrl+K y `/buscar`: sinónimos, acentos, resaltado), **laboratorios** (copiar comando, progreso por paso), **progreso/backup** (exportar/importar/revertir con checksum), **mapa mental** (legibilidad, zoom, filtro, drawer, móvil).
- Prueba casos límite: `localStorage` vacío/corrupto/lleno, importación de un JSON alterado, dos pestañas a la vez, recarga a mitad de simulacro.
- Reutiliza capturas de A1; este agente se centra en comportamiento y fallos funcionales, no en estética.

### A9 · Higiene del repo y documentación
- Duplicados y restos: `round_2/` vs raíz (diff completo), docs obsoletos (`PROGRESO_R2` "Siguiente paso: R3"), `README.md` (URL de clonado, erratas de texto, cifras, afirmaciones "0 placeholders"), `docs/*` contradictorios entre sí, `e2e/screenshots/` (88 PNG obsoletos; ¿se regeneran? ¿deben versionarse?), `reference/`, `.agents` skills sin uso, `phase` muerto, `webDocument` vestigial.
- Scripts/CI: `.github/` (workflows), `npm run verify` etapa por etapa (tiempos, fallos, flakiness), cobertura de tests de contenido (¿hay test que detecte ids duplicados o lecciones esqueleto? Si no, propón el check).
- Seguridad/privacidad: DOMPurify en todos los puntos con HTML, `sandbox="allow-scripts allow-same-origin"` en iframes (combinación que anula el aislamiento si el origen es el mismo), CSP/headers en Cloudflare, dependencias con avisos (`npm audit`).

## 4. Escala de severidad

- **P0 Bloqueante**: contenido inexistente/roto presentado como completo, datos que corrompen progreso/navegación, afirmaciones falsas al usuario, error técnico LPI que lleva a suspender.
- **P1 Alto**: defecto visible en flujos principales, inconsistencia de diseño sistemática, accesibilidad/SEO base, incumplimiento de reglas del proyecto con impacto real.
- **P2 Medio**: pulido, redundancia, mantenibilidad, problemas en pantallas secundarias.
- **P3 Bajo**: higiene, documentación, mejoras opcionales.

## 5. Consolidación y entregables

En `docs/agent/auditorias/web-<fecha>/`:
1. `00-resumen.md` (máx. 1 página): veredicto global (APTO / APTO CON RESERVAS / NO APTO para difundir públicamente), conteo por severidad y agente, 10 hallazgos más importantes, qué quedó sin verificar.
2. `A1…A9-*.md`.
3. `hallazgos.json` (formato §6) — fuente única de verdad.
4. `backlog.md`: hallazgos agrupados en **oleadas ejecutables**, cada una con objetivo, archivos tocados, esfuerzo (S/M/L), riesgo, criterio de aceptación medible y comando de verificación. Oleadas sugeridas (ajusta con la evidencia):
   - **O1 · Integridad**: ids únicos y `slideNumber` correctos; check automático en `build-content`/tests que falle ante ids duplicados, lecciones sin contenido y labs stub; cifras de la home/README calculadas, no escritas a mano.
   - **O2 · Honestidad y copy**: marcar claramente qué subtemas están completos y cuáles "en preparación" (o ocultarlos), arreglar textos desfasados, retirar `Fase N`, `/guia-estilos` del pie, SEO base (`lang`, `title`, metas).
   - **O3 · Visor y diseño**: portada/cierre únicos, plantilla canónica de diapositiva, cabecera/breadcrumb, mapa mental legible, sustituir `html` con hex por bloques nativos/tokenizados (empezando por lo que más rompa en oscuro), extender `check:tokens` a `content-src`.
   - **O4 · Contenido**: completar o reescribir lecciones esqueleto (108.3–110.3) siguiendo el flujo `/procesar-subtema` y `VALIDADO <id>`; unificar títulos genéricos; corregir errores técnicos de A5.
   - **O5 · A11y/rendimiento/herramientas**: violaciones axe, rendimiento, bugs funcionales de A8.
   - **O6 · Higiene**: `round_2/`, README, docs, capturas, código muerto, división de `home-page`.

## 6. Formato de hallazgo (`hallazgos.json`)

```json
{
  "id": "A3-014",
  "agente": "A3",
  "severidad": "P1",
  "categoria": "visual|navegacion|contenido|tecnico-lpi|diseno|a11y|seo|rendimiento|funcional|repo",
  "titulo": "Portada duplica el título",
  "descripcion": "Qué pasa y por qué importa al estudiante.",
  "evidencia": ["src/app/features/study/components/slide-viewer/slide-viewer.component.ts:100", "capturas/estudiar-105-1-1280-claro.png"],
  "ubicacion": "/estudiar/105.1 · diapositiva 1",
  "reproduccion": "Pasos o comando.",
  "propuesta": "Cambio concreto y dónde.",
  "esfuerzo": "S|M|L",
  "riesgo": "bajo|medio|alto",
  "estado": "CONFIRMADO|NO_VERIFICADO|DUDOSO",
  "cruces": ["A1-007"],
  "semilla": "S-04"
}
```

## 7. Fase 2 (solo tras aprobación)

Cuando el usuario escriba **`APROBADO O<n>`**: crea rama `audit/o<n>-<tema>`, implementa **solo** esa oleada con los criterios de `backlog.md`, respeta `/iniciar-sesion` y `/cerrar-sesion`, ejecuta `npm run verify` y vuelve a capturar A1 de las pantallas afectadas (antes/después). No mezcles oleadas. Para contenido LPI (O4) aplica la regla `VALIDADO <id>` subtema a subtema.

## 8. Definición de hecho de la Fase 1

- Los 9 agentes entregaron informe y declararon explícitamente lo que no pudieron comprobar.
- Todo hallazgo P0/P1 tiene evidencia reproducible y estado `CONFIRMADO` (o está justificado por qué no).
- Cada hallazgo semilla S-01…S-16 aparece como confirmado, refutado o corregido, con prueba.
- Existe `backlog.md` con oleadas, criterios de aceptación y comandos de verificación.
- Ningún archivo fuera de `docs/agent/auditorias/web-<fecha>/` ha cambiado (`git status` lo demuestra).
