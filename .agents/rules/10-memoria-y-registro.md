---
trigger: always_on
---

# Memoria del proyecto y registro de cambios

Tu contexto se pierde entre sesiones y se compacta durante ellas. **La memoria del proyecto está en archivos y en git, no en tu cabeza.** Ante cualquier duda sobre el estado, manda lo que digan los archivos y `git log`, nunca lo que "recuerdes".

## Archivos de memoria (`docs/agent/`)
- `STATUS.md` — foto del estado actual (máx. ~60 líneas): fase actual, último gate, trabajo en curso, **siguiente paso exacto**, bloqueos, tabla de stubs, comandos útiles. Se **reescribe** al cerrar cada tarea.
- `CHANGELOG.md` — registro **solo de añadir** (append-only), una entrada por cambio. Nunca reescribas ni borres entradas antiguas.
- `DECISIONS.md` — decisiones (D-001, D-002…) con contexto, opciones y consecuencias. Usa `/registrar-decision`.
- `BACKLOG.md` — ideas fuera de alcance.

## Cuándo
1. **Al empezar una sesión o tras notar que perdiste contexto**: ejecuta `/iniciar-sesion` (lee `STATUS.md`, las últimas ~40 líneas de `CHANGELOG.md`, `git status` y `git log --oneline -10`) y resume el estado antes de tocar nada.
2. **Al terminar cada tarea** (no solo al final de la sesión): ejecuta `/cerrar-sesion`.
3. **Cada vez que tomes o el usuario tome una decisión de arquitectura, alcance o contenido**: `/registrar-decision`.

## Formato de entrada de `CHANGELOG.md`
```
## C-0007 · 2026-11-02 · Fase 2 · <título corto>
- Qué: <1–3 líneas>
- Por qué: <motivo o requisito (spec / decisión D-00X)>
- Archivos: <rutas principales, no todas si son muchas>
- Verificación: <comando ejecutado y resultado real; o "no ejecutado">
- Pendiente / deuda: <lo que quedó sin hacer>
```
El número `C-NNNN` es correlativo (lee el último y suma 1).

## Git
- Un commit por tarea terminada con verificación al menos de `typecheck` y los tests afectados. Mensaje: `tipo(ámbito): resumen [C-0007]` con tipos `feat|fix|refactor|test|docs|chore`. Así `git log --grep "C-0007"` encuentra la entrada.
- Al cerrar una fase con gate verde: `git tag fase-N-ok`.
- Nunca commits con tests o build rotos. Nunca `git push` salvo petición expresa.
