# Informe de Auditoría A7 · Accesibilidad, SEO y Rendimiento

**Agente**: A7 (Accesibilidad, SEO y Rendimiento)  
**Fecha**: 2026-11-03  
**Entorno de prueba**: Preview local `http://localhost:4200` (build de producción `dist/lpic1-study-guide/browser`)  
**Archivos generados**: `docs/agent/auditorias/web-2026-11-03/hallazgos-A7.json`, `docs/agent/auditorias/web-2026-11-03/a7-axe-raw.json`, scripts en `docs/agent/auditorias/web-2026-11-03/scripts/`

---

## 1. Resumen Ejecutivo (10 líneas)

Se ha auditado la totalidad de las 22 rutas principales del aplicativo web en una matriz combinada de 2 viewports (escritorio 1280×800 y móvil 390×844) y 2 temas (claro y oscuro) mediante `@axe-core/playwright`, inspección de DOM/red y análisis estático de assets compilados.
El bundle inicial JS+CSS es ligero (~150 KB sin comprimir, ~45 KB gzip) y la carga inicial es rápida con fuentes locales sin dependencias a CDNs externos.
Sin embargo, se han confirmado deficiencias estructurales críticas: la FAQ promete falsamente estudio 100% offline cuando carece de Service Worker (P0, S-15).
En SEO y accesibilidad base (P1, S-08), `src/index.html` declara `lang="en"` para contenido en español, carece totalmente de `meta description`, Open Graph, `robots.txt` y `sitemap.xml`.
Axe-core detectó 82 violaciones de contraste de color (concentradas en modo oscuro y badges), 6 páginas con `<main>` anidados duplicados y 728 celdas interactivas en `/progreso` de tamaño inferior a 24 px.
Asimismo, los modales de laboratorio carecen de trampa de foco y atajo Escape, y el mapa mental atrapa la navegación por teclado con cientos de nodos `tabindex="0"` de texto ilegible (10-11 px).
En contenido masivo, `flashcards.json` descarga 875 KB en una sola petición sin persistencia en caché.
En total se registran 15 hallazgos confirmados: 1 P0, 6 P1, 7 P2 y 1 P3.

---

## 2. Tabla Consolidada de Hallazgos

| ID | Sev. | Categoría | Título | Estado | Cruces | Semilla |
|---|---|---|---|---|---|---|
| **A7-001** | **P0** | a11y / veracidad | Promesa falsa de soporte 100% offline sin Service Worker | CONFIRMADO | A2 | S-15 |
| **A7-002** | **P1** | seo / a11y | Atributo `lang="en"` en `index.html` con app 100% en español | CONFIRMADO | A2 | S-08 |
| **A7-003** | **P1** | seo | Ausencia total de `meta description` y etiquetas Open Graph / Twitter | CONFIRMADO | A2 | S-08 |
| **A7-004** | **P1** | seo | Inexistencia de archivos `robots.txt` y `sitemap.xml` | CONFIRMADO | A9 | — |
| **A7-005** | **P1** | a11y | Contraste de color insuficiente (< 4.5:1) en tema oscuro y badges | CONFIRMADO | A1, A6 | — |
| **A7-006** | **P1** | a11y | Duplicación e inclusión de múltiples landmarks `<main>` anidados | CONFIRMADO | A6 | — |
| **A7-007** | **P1** | a11y | Celdas interactivas con tamaño táctil menor a 24 px en `/progreso` (WCAG 2.5.8) | CONFIRMADO | A1, A6 | — |
| **A7-008** | **P2** | a11y | Modales de laboratorio sin trampa de foco (`focus trap`) ni cierre por Escape | CONFIRMADO | A6, A8 | — |
| **A7-009** | **P2** | a11y | Estructura ARIA incompleta en visor de diapositivas y pestañas | CONFIRMADO | A3 | — |
| **A7-010** | **P2** | a11y | Mapa mental: cientos de nodos en orden de tabulación y fuentes de 10-11 px | CONFIRMADO | A8 | S-10 |
| **A7-011** | **P2** | rendimiento | Descarga monolítica de `flashcards.json` (875 KB) sin caché persistente | CONFIRMADO | A4, A8 | — |
| **A7-012** | **P2** | rendimiento | Inyección excesiva de fuentes inlined no utilizadas en HTML inicial (19.5 KB) | CONFIRMADO | A6 | — |
| **A7-013** | **P2** | seo | Títulos estáticos genéricos en rutas dinámicas de temario y laboratorios | CONFIRMADO | A2 | — |
| **A7-014** | **P2** | a11y | Botón de menú móvil sin `aria-expanded` y con tamaño táctil de 40×40 px | CONFIRMADO | A2, A6 | — |
| **A7-015** | **P3** | a11y | Salto irregular en jerarquía de encabezados (`h1` a `h3/h4`) en 6 páginas | CONFIRMADO | A6 | — |

---

## 3. Detalle por Áreas de Auditoría

### 3.1. Accesibilidad Automatizada (`@axe-core/playwright`)

Se ejecutó el conjunto de reglas WCAG 2.0, 2.1, 2.2 (niveles A y AA) y mejores prácticas sobre 88 combinaciones de ruta, viewport y tema.

```
Total violaciones detectadas por tipo de regla:
  - color-contrast (SERIOUS): 82 nodos afectados (en tema oscuro y badges de /erratas, /simulador/practica, /buscar, /progreso).
  - target-size (SERIOUS): 728 nodos afectados en /progreso (celdas interactivas de mapa de calor diario < 24 px).
  - landmark-no-duplicate-main / landmark-main-is-top-level (MODERATE): 24 nodos en 6 rutas.
  - landmark-unique (MODERATE): 16 nodos en 4 rutas.
  - heading-order (MODERATE): 24 nodos en 6 rutas.
  - label-content-name-mismatch (SERIOUS): 4 nodos en /simulador/practica (.flag-button).
  - scrollable-region-focusable (SERIOUS): 2 nodos en móvil /404 (<pre> sin tabindex).
  - aria-allowed-role (MINOR): 4 nodos en /laboratorios (.labs-grid).
```

### 3.2. Accesibilidad Manual y de Interacción por Teclado

1. **Orden de foco y Skip-Link**:
   - `app-shell` incluye `<a href="#main-content">Saltar al contenido</a>`. Se vuelve visible al recibir foco (`focus:not-sr-only`) y `#main-content` recibe el salto adecuadamente con `tabindex="-1"`.
   - Sin embargo, las vistas hijas que declaran su propio `<main>` rompen la jerarquía de landmarks para los usuarios de lectores de pantalla.
2. **Trampas de foco y Diálogos**:
   - **Paleta de búsqueda (`Ctrl+K`)**: Abre el modal y enfoca el `input`. Al pulsar `Tab` navega por los filtros y sugerencias, pero carece de trampa dura con `cdkTrapFocus`; además, no restaura el foco al botón disparador al cerrarse.
   - **Modales de laboratorio (`lab-detail-page`)**: Cuatro modales de interacción clave no utilizan la primitiva `app-dialog`. Carecen de trampa de foco (la tecla `Tab` sale a la página de fondo), carecen de listener para la tecla `Escape` y no devuelven el foco al cerrarse.
3. **Visor de diapositivas y Pestañas de Lección**:
   - El visor de diapositivas anuncia el cambio de diapositiva con `aria-live="polite"`. No obstante, el contenedor carece de `role="region"` y `aria-roledescription="carousel"`, y los botones de miniaturas y notas no tienen `aria-expanded`.
   - `app-tabs` utiliza `<nav role="tablist">` (colisión semántica de landmark `navigation` con `tablist`). No admite navegación por flechas de teclado y los paneles mostrados en `/estudiar` carecen de `role="tabpanel"` y `aria-labelledby`.
4. **Mapa Mental**:
   - Cada nodo del árbol SVG incluye `role="button" tabindex="0"`. Al activar "Comandos y términos", se incorporan cientos de nodos al orden de tabulación secuencial, obligando al usuario a tabular interminablemente.
   - El tamaño de texto de los comandos y términos es de 10 px y 11 px, lo que a resolución estándar 1:1 resulta ilegible.
5. **Objetivos Táctiles (Target Size)**:
   - El mapa de calor de `/progreso` tiene 728 celdas interactivas de ~10-12 px.
   - En `/comandos` (674 elementos) y `/glosario` (577 elementos), los chips y controles miden entre 24 y 32 px de altura, por debajo de los 44 px recomendados para pantallas táctiles.
   - El botón de menú hamburguesa móvil mide 40×40 px (debe ser ≥ 44×44 px).

---

### 3.3. SEO y Metadatos

1. **Idioma**: `src/index.html` declara `<html lang="en">` en un producto 100% en español. Viola WCAG 3.1.1 y penaliza el posicionamiento geográfico/lingüístico en motores de búsqueda.
2. **Meta Description y Redes Sociales**:
   - Ninguna de las 22 rutas auditadas contiene `<meta name="description">`.
   - Cero etiquetas Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) y Twitter Cards.
   - En Cloudflare Pages (`wrangler.toml: not_found_handling = "single-page-application"`), los bots de redes sociales (que no ejecutan JS) reciben siempre el `index.html` básico sin descripción ni previsualización.
3. **Indexación y Rastreo**:
   - No existen `robots.txt` ni `sitemap.xml` en `public/`.
   - Rutas dinámicas como `/temario/101`, `/temario/101/101` y `/laboratorios/101.1` muestran títulos estáticos genéricos ("Examen LPIC-1", "Tema de Estudio", "Práctica de Laboratorio") sin aprovechar el servicio `Title` de Angular.

---

### 3.4. Rendimiento y Assets

1. **Bundle Inicial**:
   - `styles-5ID7TG5D.css`: 66.5 KB.
   - `main-UMGAJRZZ.js`: 32.4 KB.
   - Chunks precargados (`chunk-*.js`): ~50 KB.
   - Total inicial sin comprimir: ~149 KB (estimado en gzip: ~42 KB). Carga inicial sobresaliente.
2. **JSONs de Contenido**:
   - Directorio `public/content/`: 101 archivos, 5.47 MB totales.
   - `flashcards.json`: 875 KB en un único archivo que se descarga íntegramente al abrir `/flashcards`.
   - `commands.json`: 264 KB.
   - Lecciones individuales: entre 50 KB y 223 KB.
   - No existe persistencia en Cache API o IndexedDB; al recargar la página se repiten las transferencias por HTTP.
3. **Fuentes Web**:
   - Fuentes auto-alojadas con `@fontsource-variable/inter` y `@fontsource/jetbrains-mono`, con `font-display: swap` y sin llamadas externas a Google Fonts (positivo).
   - Inlining excesivo: `index.html` incluye 12 bloques `@font-face` con alfabetos cirílico, griego y vietnamita no utilizados, inflando el HTML a 19.5 KB.
4. **CLS e Iframes**:
   - `SlideHtmlBlockComponent` usa `aspect-video` (`aspect-ratio: 16 / 9`), previniendo saltos de diseño (CLS) en navegadores modernos. No obstante, los 261 bloques `html` ni siquiera se renderizan por falta de manejador en `BlockRendererComponent`.

---

### 3.5. Comprobación del Modo Offline (Semilla S-15)

- **Afirmación en FAQ (`home-page.component.ts:976-977`)**:
  > *"¿Puedo estudiar sin conexión a Internet (offline)? Sí. Una vez cargada la aplicación, todos los contenidos, lecciones teóricas, comandos y preguntas quedan en caché en el navegador para permitir el estudio completo sin conexión."*
- **Afirmación en Ajustes (`settings-page.component.html:450`)**:
  > *"Sin dependencias de nube: puedes estudiar sin conexión a internet tras la carga inicial."*
- **Afirmación en `docs/DEPLOY.md:123`**:
  > *"El navegador almacena en caché los assets HTTP, permitiendo estudiar de forma autónoma sin conexión permanente a internet."*
- **Realidad Técnica**:
  - `package.json` y `app.config.ts` no registran `@angular/service-worker` ni `provideServiceWorker`.
  - No existe `ngsw-config.json` ni archivo `ngsw-worker.js`.
  - Al simular modo sin conexión (`Offline` en DevTools), cualquier navegación a una lección no precargada falla de inmediato con error de red (`net::ERR_INTERNET_DISCONNECTED`) al intentar descargar el chunk JS y el archivo `content/lessons/<id>.json`.
- **Conclusión**: El hallazgo semilla **S-15 queda CONFIRMADO como P0**. La afirmación es objetivamente falsa y debe ser corregida de inmediato para no inducir a error al usuario o implementar un Service Worker real.

---

## 4. Qué NO se pudo comprobar

1. **Lighthouse en entorno de producción real con CDN**: La auditoría se ejecutó sobre el servidor de vista previa local (`http://localhost:4200`); no se midió latencia real de red ni tiempos de compresión Brotli/Gzip de Cloudflare en un dominio público real.
2. **Lectores de pantalla en hardware físico variado**: Las pruebas de accesibilidad se realizaron mediante el motor Axe-core, Playwright y el árbol de accesibilidad del navegador, sin contrastar directamente el comportamiento auditivo nativo en lectores de pantalla comerciales como JAWS o NVDA sobre Windows ni VoiceOver sobre macOS/iOS.
3. **Comportamiento en navegadores antiguos sin soporte de `aspect-ratio`**: No se verificó el CLS de los iframes en versiones de navegadores anteriores a 2021 que no implementan `aspect-ratio` nativo en CSS.
