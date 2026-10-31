---
name: cerrar-sesion
description: Registra el trabajo realizado en el historial del proyecto LPIC-1 (CHANGELOG.md, STATUS.md) y hace commit. Úsala al terminar CADA tarea (no solo al final de la sesión) y antes de que se acabe el contexto, para no perder memoria.
---

# /cerrar-sesion

Objetivo: dejar el proyecto en un estado que otra sesión (u otro agente) pueda retomar sin preguntar nada.

## Pasos
1. `git status --short`. Si hay archivos que no pertenecen a la tarea, no los incluyas en el commit y menciónalos.
2. Ejecuta la verificación mínima: `npm run typecheck` y los tests que afecten a lo cambiado. Anota el resultado **real**. Si no se ejecutó, escribe "no ejecutado" (nunca "ok").
3. Lee la última entrada de `docs/agent/CHANGELOG.md` para obtener el siguiente número `C-NNNN`.
4. **Añade** (al final, sin tocar lo anterior) una entrada con el formato de `.agents/rules/10-memoria-y-registro.md`: Qué · Por qué · Archivos · Verificación · Pendiente/deuda.
5. **Reescribe** `docs/agent/STATUS.md` (máx. ~60 líneas) con: fase actual, último gate, trabajo en curso, **siguiente paso exacto** (comando o tarea concreta), bloqueos, tabla de stubs actualizada y comandos útiles.
6. Commit del código: `tipo(ámbito): resumen [C-NNNN]`. Después, si cambiaron solo los docs de memoria, un segundo commit `docs(agent): registro C-NNNN`.
7. Si cierras una fase con gate verde: `git tag fase-N-ok`.

## Salida (máx. 8 líneas)
- ID de la entrada y hash del commit.
- Qué quedó hecho y qué no.
- Siguiente paso exacto para la próxima sesión.

## No hagas
- No borres ni reescribas entradas antiguas del CHANGELOG.
- No hagas `git push`.
- No marques como hecho algo cuya verificación falló.
