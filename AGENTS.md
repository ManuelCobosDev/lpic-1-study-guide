# LPIC-1 Study Guide · punto de entrada del agente

Web **Angular 100% cliente** para preparar la certificación LPIC-1 (101-500 y 102-500). Este repositorio es nuevo y limpio: aquí solo entra código nuevo y ordenado.

## Lo primero en cada sesión
1. Ejecuta **`/iniciar-sesion`** (lee `docs/agent/STATUS.md`, el final de `docs/agent/CHANGELOG.md`, `git status` y `git log`).
2. Resume el estado al usuario y **confirma la tarea antes de programar**.

## Dónde está cada cosa
| Qué | Dónde |
|---|---|
| Reglas siempre activas | `.agents/rules/` |
| Procedimientos (skills) | `.agents/skills/`: `/iniciar-sesion` · `/ejecutar-fase N` · `/verificar-gate N` · `/cerrar-sesion` · `/inventario-legacy` · `/importar-contenido-legacy` · `/registrar-decision` |
| Especificación (lee SOLO la parte que toque) | `docs/spec/00` … `09` (índice abajo) |
| Memoria del proyecto | `docs/agent/` → `STATUS.md` · `CHANGELOG.md` · `DECISIONS.md` · `BACKLOG.md` |
| Material antiguo del curso (SOLO LECTURA) | `_legacy/` |
| Prototipo v0 descartado (SOLO LECTURA, solo referencia visual) | `reference/` |

## Índice de la especificación
`00-contexto` · `01-stack` · `02-estructura` · `03-dominio` · `04-formato-lecciones` · `05-diseno` · `06a-pantallas-base-y-estudio` · `06b-pantallas-herramientas` · `07-curriculo` · `08-fases` (plan, gates) · `09-aceptacion`.

## Fase actual
Mira `docs/agent/STATUS.md`. No la dupliques aquí.

## Regla de oro
Si dudas del estado del proyecto, manda lo que digan los archivos y `git log`, no tu memoria. Si dudas de qué hacer, pregunta.
