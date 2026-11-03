# A6 · Sistema de diseño, CSS y tokens

Fase 1, solo lectura. Hallazgos en `hallazgos-A6.json` (A6-001 … A6-010).

## Resumen
1. **Hallazgo mayor (A6-001, P0)**: `BlockRenderer` no tiene caso para `html`. Los 261 bloques `html` de diapositivas probablemente no se pintan. Falta confirmación visual (A1).
2. S-05 confirmada en cifras: 258 de 261 bloques `html` de slides llevan colores literales (234 de 237 en `webDocument`), en 32 lecciones. `check:tokens` no mira `content-src`.
3. S-13 confirmada y mayor de lo dicho: 132 `<button>` fuera de `shared/ui`, en 28 ficheros.
4. S-14 confirmada: `home-page.component.ts` tiene 1096 líneas.
5. S-12 confirmada: 23 rutas con `phase`, `NotImplementedPage` sin enrutar, y quedan textos «Planificado para Fase 11» y «Próximamente».
6. S-11 confirmada en código (ver abajo).
7. Hay 63 usos de texto por debajo de 12 px y 17 valores Tailwind arbitrarios.
8. En `src/` (fuera de `src/styles`) no hay colores literales: R6 se cumple en código.

## Semillas
| Semilla | Estado | Evidencia |
|---|---|---|
| S-05 | CONFIRMADA y reencuadrada | 258/261; ver A6-001 y A6-002; `scripts/check-tokens.ts:37,58` |
| S-11 | CONFIRMADA (código) | Home: CTAs al simulador en `home-page.component.ts:67`, `:296` (tarjeta) y `:404-407` (banda). Tarjetas de métricas a `/temario` en `:132` y `:137`. Pie `footer.component.ts:24` enlaza `/guia-estilos`; también aparece en `search.service.ts:133` y `app.routes.ts:212` |
| S-12 | CONFIRMADA | A6-008, A6-007 |
| S-13 | CONFIRMADA, ampliada | A6-003 |
| S-14 | CONFIRMADA | A6-006 |
| S-16 | Ver A9 | `A9-repo.md` |

## Tabla de hallazgos
| ID | Sev. | Título | Estado |
|---|---|---|---|
| A6-001 | P0 | Bloques `html` sin renderizador | CONFIRMADO |
| A6-002 | P1 | 258/261 bloques `html` con colores literales | CONFIRMADO |
| A6-003 | P1 | 132 `<button>` nativos fuera de `shared/ui` | CONFIRMADO |
| A6-004 | P2 | 63 usos de texto < 12 px | CONFIRMADO |
| A6-005 | P2 | 17 valores Tailwind arbitrarios | CONFIRMADO |
| A6-006 | P2 | Componentes gigantes | CONFIRMADO |
| A6-007 | P2 | Tarjeta Examen 102 hardcodeada y desfasada | CONFIRMADO |
| A6-008 | P2 | `phase` muerto y textos de fase | CONFIRMADO |
| A6-009 | P2 | Iframe `slide-html` con sandbox permisivo (sin uso) | CONFIRMADO |
| A6-010 | P2 | Contenedor único | NO_VERIFICADO |

## No pude comprobar
- Cómo se ve nada (no se abrió navegador): modo oscuro, SVG del mapa mental, iframes e imágenes con fondo blanco, y si los bloques `html` salen vacíos.
- Duplicados funcionales de tarjetas, chips y badges (inventario de `shared/ui` y estilos repetidos entre `home`, `curriculum` y `labs`).
- Si cada uno de los 132 `<button>` es legítimo (chips o tabs) o un botón ad hoc.
- Uso de `app-container` por ruta y anchos 1200/1440 px.
- Propuesta de tokens nuevos: no la hice, porque no demostré duplicación.
- Los números de línea de los hallazgos de contenido se calcularon con un script puntual; no está guardado en el repo.
