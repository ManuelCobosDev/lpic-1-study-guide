# A9 · Higiene del repo, documentación y seguridad

Fase 1, solo lectura. Hallazgos en `hallazgos-A9.json` (A9-001 … A9-007).

## Resumen
1. S-16 confirmada: `round_2/` tiene 20 ficheros, 19 idénticos por hash y uno distinto (`PROGRESO_R2.md`). Dice «Siguiente paso: R0», la raíz dice R3 y `STATUS.md` marca R7 completado.
2. README: URL `github.com/usuario/...` (l.68), «Karma / Jasmin» (l.55), «100% Cobertura Real, 0 Placeholders» (l.15) y cifras a mano (l.17, 33, 34).
3. `e2e/screenshots`: 88 PNG en disco, 89 ficheros versionados, sin entrada en `.gitignore`.
4. `webDocument` parece vestigial: solo está en modelo, schema y build; ningún componente lo lee (DUDOSO hasta revisar `lesson-web-view`).
5. No hay CI (`.github/` solo tiene plantillas de issues), ni `_headers`, ni CSP en `wrangler.toml`. `public/` solo versiona `favicon.ico`.
6. `npm audit`: 33 moderados, 0 high, 0 critical (cadena `@angular-eslint`/eslint, herramientas de desarrollo).
7. Seguridad HTML: DOMPurify se usa en `markdown.engine.ts` con lista de etiquetas y atributos (sin `style`). Hay `bypassSecurityTrustHtml` en `paragraph-block.component.ts:52` y un `<mark>` añadido tras sanitizar. El fallback sin `window` es una regex. Sin XSS demostrado.
8. `sandbox="allow-scripts allow-same-origin"` en `slide-html-block.component.ts:14`: ningún contenido usa `slide-html` (0 ficheros), riesgo latente.

## Semilla S-16
| Punto | Estado |
|---|---|
| `round_2/` copia del paquete de arranque | CONFIRMADO (A9-001) |
| README con URL `usuario` y «Karma / Jasmin» | CONFIRMADO (A9-004) |
| `webDocument` vestigial | DUDOSO (A9-006) |
| 88 PNG obsoletos | CONFIRMADO en cantidad (A9-005); «obsoletos» no se comprobó captura a captura |

## Tabla de hallazgos
| ID | Sev. | Título | Estado |
|---|---|---|---|
| A9-001 | P2 | `round_2/` duplica la raíz | CONFIRMADO |
| A9-002 | P2 | `bypassSecurityTrustHtml` y fallback débil | DUDOSO |
| A9-003 | P2 | Sin CI ni cabeceras de seguridad | CONFIRMADO |
| A9-004 | P3 | README: URL, errores y cifras | CONFIRMADO |
| A9-005 | P3 | Capturas e2e versionadas | CONFIRMADO |
| A9-006 | P3 | `webDocument` vestigial | DUDOSO |
| A9-007 | P3 | `npm audit`: 33 moderados | CONFIRMADO |

## Nota para el orquestador
`git status` muestra `content-src/curriculum.yaml` modificado y `content-src/lessons/103.99.json` sin versionar. No son míos: solo escribí en `docs/agent/auditorias/web-2026-11-03/`. Conviene averiguar su origen antes de dar la Fase 1 por «sin cambios fuera de la carpeta».

## No pude comprobar
- Etapas de `npm run verify` (tiempos, fallos, flakiness): prohibido ejecutarlo.
- Cabeceras reales de Cloudflare en producción: no hay red ni acceso; solo vi el repo.
- Si `.agents` tiene skills sin uso, `reference/` y la contradicción entre `docs/*`.
- Si hay tests de contenido que detecten ids duplicados o lecciones esqueleto (no revisé `scripts/*.spec`).
- Si los avisos de `npm audit` afectan a dependencias de runtime.
- Que `lesson-web-view` no lea `webDocument` por otra vía.
- Payloads XSS reales contra `paragraph-block`.
- Los recuentos 771/197/238 de la seed no los verifiqué.
