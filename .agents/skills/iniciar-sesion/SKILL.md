---
name: iniciar-sesion
description: Recupera el estado del proyecto LPIC-1 al empezar una sesión nueva o cuando se haya perdido contexto. Lee STATUS.md, el final de CHANGELOG.md, git status y git log, y resume dónde estamos y cuál es el siguiente paso. Úsala siempre antes de programar en una sesión nueva.
---

# /iniciar-sesion

Objetivo: reconstruir el contexto desde los archivos, sin modificar nada.

## Pasos
1. Lee `docs/agent/STATUS.md` entero.
2. Lee las **últimas ~40 líneas** de `docs/agent/CHANGELOG.md` y los títulos de `docs/agent/DECISIONS.md`.
3. Ejecuta `git status --short` y `git log --oneline -10`.
4. Comprueba la coherencia y señala cualquier discrepancia:
   - El último `C-NNNN` del CHANGELOG debe aparecer en algún mensaje de commit (`git log --grep "C-NNNN"`).
   - Si hay cambios sin commitear, indica cuáles y de qué tarea parecen.
   - La fase de `STATUS.md` debe coincidir con la última etiqueta `fase-N-ok` (`git tag --list "fase-*"`).
5. Si falta contexto (por ejemplo, un documento que `STATUS.md` menciona y no existe), dilo; no lo inventes.

## Salida (máx. 15 líneas, en este orden)
- **Fase actual** y último gate superado.
- **Trabajo en curso** (o "ninguno").
- **Discrepancias** detectadas (o "ninguna").
- **Decisiones pendientes** del usuario.
- **Siguiente paso propuesto** (el de `STATUS.md`) y pregunta de confirmación.

## No hagas
- No edites ningún archivo ni ejecutes instalaciones o builds.
- No empieces a programar hasta que el usuario confirme la tarea.
