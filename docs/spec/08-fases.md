# 8. PLAN POR FASES Y GATES

**Reglas de todas las fases**: (a) lee solo las specs que la fase indica; (b) trabaja en tareas pequeñas y registra cada una con `/cerrar-sesion`; (c) al final ejecuta `/verificar-gate`; (d) si el gate está verde: etiqueta `fase-N-ok`, actualiza `STATUS.md` y **DETENTE**; (e) nunca empieces la fase siguiente sin que el usuario lo pida.

**Todos los gates incluyen**: `npm run verify` en verde (desde la Fase 0 existe), capturas en `e2e/screenshots/fase-N/` (claro y oscuro, escritorio 1440 y móvil 390) **revisadas por ti**, `STATUS.md` actualizado, informe en formato R10 y commit.

---

## FASE 0 · Andamiaje Angular (esqueleto limpio)
**Specs**: 01, 02, 05 (§5.1–5.4), 06a (§6.1). **Skills**: ejecutar-fase, verificar-gate.
Crear el proyecto Angular con la estructura **exacta** de `02-estructura.md`, **todas las carpetas creadas** y un `README.md` de 3–6 líneas en cada carpeta principal (`core/*`, `shared/*`, `features/*`, `scripts/`, `content-src/`, `e2e/`) que explique qué va ahí y qué está prohibido. Toolchain completa: TypeScript/Angular estrictos, ESLint con reglas de fronteras, Vitest, Playwright + axe, presupuestos de bundle, todos los scripts npm de `01-stack.md` (los que dependan de fases posteriores existen y fallan con mensaje claro "no implementado" **solo** si se ejecutan antes de su fase; `verify` debe pasar en esta fase con lo que exista). `check-tokens` y `check-boundaries` con tests propios que demuestren que detectan violaciones. `tokens.css` y `themes.css` completos. AppShell: header, footer, `Container`, `ThemeToggle` persistente, skip-link. **Todas las rutas de `03-dominio.md §3.4` declaradas con `loadComponent` lazy** apuntando a `NotImplementedPage` (con la fase en que se implementarán) y registradas en la tabla de stubs. `scripts/check-stubs.ts`. `.gitignore` y `.gitattributes` **ya existen**: amplíalos si hace falta, sin borrar lo que hay. **El repositorio no está vacío** (contiene `AGENTS.md`, `.agents/`, `docs/`): genera el proyecto con `ng new` en una carpeta temporal (por ejemplo `_tmp-ng/`, nombre de paquete `lpic1-study-guide`, sin git), mueve su contenido a la raíz **sin sobrescribir** `AGENTS.md`, `.agents/`, `docs/`, `.gitignore` ni `.gitattributes` (fusiona lo que traiga el generador) y borra la carpeta temporal.
**Gate 0 (e2e + unit)**: la shell carga sin errores de consola; el tema oscuro persiste tras `reload`; axe sin violaciones serias/críticas; todas las rutas responden con su stub etiquetado y ninguna da 404; `check-tokens` falla al introducir `#fff` en un componente (test); `check-boundaries` falla al importar `features` desde `core` (test); `npm run build` genera `dist` y `postbuild` crea `404.html`.

## FASE 1 · Inventario del contenido legacy (SOLO LECTURA)
**Skills**: inventario-legacy, registrar-decision.
Ejecuta `/inventario-legacy`. No se escribe código de la app. Salida: `docs/agent/INVENTARIO_LEGACY.md`. **Tras entregarlo, DETENTE y espera la decisión del usuario**, que se registra con `/registrar-decision` como D-004 (estrategia de importación A, B o C).
**Gate 1**: el informe cubre todos los tipos de contenido con ejemplos reales citados por ruta, contrasta recuento real vs esperado (`07-curriculo.md §7.1`), lista inconsistencias y recomienda estrategia con pros/contras/esfuerzo; no se modificó nada en `_legacy/` (`git status` limpio de cambios ajenos a `docs/agent`).

## FASE 2 · Currículo, pipeline de contenido y dominio + tajada vertical real
**Specs**: 03, 04 (§4.1–4.2), 07. **Skills**: importar-contenido-legacy.
`curriculum.yaml` (sección 7), `build-content.ts` con validación Zod y generación de relleno, modelos, `StorageService`, `PersistedStore`, `ProgressService`, `PreferencesService`, `ClockService`, `ContentService`, selectores. **Importador del subtema 103.4 de punta a punta** (lección, práctica, preguntas, ≥ 20 comandos y ≥ 20 términos relacionados) con `scripts/import-legacy/`, que sirve de prueba de la estrategia D-004 y de base para el resto.
**Gate 2 (unit)**: manifiesto con 10 temas, 42 subtemas, pesos 60/60 y títulos exactos de la sección 7; contadores derivados; progreso por subtema/tema/examen (casos límite); persistencia y migración de `PersistedStore`; fallback en memoria si `localStorage` lanza; `validate:content` falla con un archivo malformado (test); el importador es idempotente (ejecutarlo dos veces no cambia nada).

## FASE 3 · Sistema de diseño
**Specs**: 05. Todas las primitivas de `shared/ui`, `app-button` con variantes/estados y `/guia-estilos`.
**Gate 3 (e2e)**: `/guia-estilos` renderiza las 6 variantes × 4 tamaños de botón y sus estados; los badges miden 24 px de alto; no hay colores literales; axe limpio en ambos temas.

## FASE 4 · Home y Temario
**Specs**: 06a (§6.1–6.3).
**Gate 4 (e2e)**: con progreso vacío **ningún subtema muestra check** y la Home dice "0 %"; las 4 tarjetas del 101 tienen igual altura; ningún título truncado; Home → Temario → Tema → Subtema funciona; los 23 subtemas del 101 y los 19 del 102 existen y enlazan; cifras de la Home = manifiesto; el árbol lateral marca el subtema actual.

## FASE 5 · Lecciones y Estudiar
**Specs**: 04, 05 (diagramas en 04 §4.3), 06a (§6.4). Parser de lecciones, bloques, motor de diagramas y su vista, las tres vistas (diapositivas con pantalla completa, web, PDF + `/imprimir`), atajos, deep links, progreso y notas. Aplica la estrategia D-004 para mostrar las diapositivas legacy.
**Gate 5 (e2e, `/estudiar/103.4`)**: `Siguiente` y `→` cambian de diapositiva sin clic previo; `F` entra en pantalla completa y `Esc` sale; `?slide=5` abre la 5; marcar completado + escribir una nota + **`reload` → ambos persisten**; cambiar a Web conserva la sección; la vista PDF abre `/imprimir` e invoca `window.print` (stub); hay ≥ 1 `svg[role=img]` con `<title>` (si la lección tiene diagramas); el HTML con `<script>` se sanitiza (unit). Tests unitarios del layout de diagramas.

## FASE 6 · Buscador
**Specs**: 06a (§6.5).
**Gate 6 (e2e)**: `Ctrl+K` abre la paleta; buscar un comando devuelve comando, diapositivas y término; buscar `103.4` lleva al subtema; buscar sin tilde encuentra la palabra con tilde; abrir una diapositiva resultado navega con `?slide=` y `<mark>` resalta el término; `/buscar?q=` pagina; las preguntas del simulador **no** aparecen. Unit del motor.

## FASE 7 · Laboratorios
**Specs**: 06b (§6.6).
**Gate 7 (e2e)**: marcar 3 pasos, **recargar y siguen marcados**; copiar un comando escribe en el portapapeles; completar todos los pasos abre el diálogo de enhorabuena y el catálogo marca "completada"; los filtros funcionan.

## FASE 8 · Simulador
**Specs**: 06b (§6.7). `scoring` con tests.
**Gate 8 (e2e + unit)**: iniciar simulacro, responder, marcar, **recargar y se reanuda con el tiempo restante correcto**; finalizar produce puntuación 200–800 y resultados por tema en `/simulador/resultados?id=…` **que también funciona tras recargar**; en práctica la explicación aparece al comprobar; `canStartExamGuard` bloquea si faltan preguntas. Unit: todo o nada, `fill` normalizado, escala 200–800 (500 = aprobado), selección ponderada determinista por semilla.

## FASE 9 · Comandos, Glosario y Flashcards
**Specs**: 06b (§6.8). Leitner con tests.
**Gate 9 (e2e + unit)**: filtros de comandos reflejados en la URL y restaurados al recargar; fila expandible y copiar; AlphaIndex salta a la letra y deshabilita las vacías; una sesión de flashcards con las 4 valoraciones persiste las cajas tras recargar. Unit: Leitner (intervalos, caja máx. 5, límite diario).

## FASE 10 · Mapa mental, Progreso, Ajustes (exportar/importar), Erratas, Acerca de, 404
**Specs**: 06b (§6.9–6.12).
**Gate 10 (e2e)**: **exportar → borrar todo (escribiendo BORRAR) → importar → todo vuelve** (completados, notas, intentos, cajas); importación con checksum alterado o versión futura rechazada con mensaje; "Fusionar" conserva lo más reciente; "Deshacer importación" restaura; el mapa mental pinta 10 temas + 42 subtemas con estados correctos y el filtro "Solo pendientes" funciona; `/progreso` refleja una sesión real (heatmap, gráfica).

## FASE 11 · Importación completa del legacy
**Skills**: importar-contenido-legacy. Importar **todo** lo que el inventario marcó como importable, tipo a tipo, con informe `docs/agent/COBERTURA_IMPORT.md` (importado / total por tipo y lista de huecos).
**Gate 11**: cobertura = 100 % de lo importable (o cada hueco justificado y aprobado por el usuario en `DECISIONS.md`); `validate:content` en verde; `npm run import:legacy` re-ejecutable sin cambios; la app muestra los contadores reales (sin cifras a mano); `INVENTARIO` vs `COBERTURA` coherentes.

## FASE 12 · Pulido, accesibilidad, rendimiento y documentación
`README`, `ARCHITECTURE`, `DESIGN_SYSTEM`, `CONTENT_GUIDE` (ejemplo copiable de cada bloque y cada diagrama), `DEPLOY`, `STATUS` final honesto, `check:stubs` = 0.
**Gate 12 (e2e)**: **crawler**: visita todas las rutas y sigue todos los `a[href]` internos; cero 404, cero `console.error`; axe sin violaciones serias/críticas en las rutas principales en ambos temas; sin scroll horizontal a 390 px; presupuestos de bundle respetados; `npm run new:subtopic -- 103.9 "Prueba"` aparece en temario, árbol, buscador y mapa mental sin tocar componentes (y se revierte); y pasa `e2e/demo.spec.ts` (`09-aceptacion.md`).
