---
name: ejecutar-fase
description: Ejecuta una fase concreta del plan del proyecto LPIC-1 (por ejemplo "ejecutar-fase 0"). Lee solo las specs de esa fase, planifica, implementa en tareas pequeñas registrando cada una, pasa el gate y se detiene. Úsala cuando el usuario pida empezar o continuar una fase.
---

# /ejecutar-fase N

El número de fase lo da el usuario. Si no lo da, pregunta; no lo supongas.

## Pasos
1. Ejecuta `/iniciar-sesion` y confirma que la fase N es la siguiente según `STATUS.md` (la anterior debe tener su etiqueta `fase-(N-1)-ok`). Si no lo es, avisa y espera instrucciones.
2. Abre `docs/spec/08-fases.md` y lee **solo la sección de la fase N**. Lee únicamente las specs que esa sección lista (por ejemplo `docs/spec/04-formato-lecciones.md`). No leas el resto.
3. Carga la regla `30-convenciones-angular` si vas a tocar código.
4. **Plan**: escribe un plan de tareas pequeñas (cada una verificable y commiteable) y muéstralo al usuario. Espera su visto bueno si el modo de trabajo lo exige.
5. **Implementa tarea a tarea.** Después de cada tarea: `/cerrar-sesion` (entrada de CHANGELOG + STATUS + commit). No acumules varias tareas sin registrar.
6. **Gate**: cuando todas las tareas estén hechas, ejecuta `/verificar-gate N`. Si algo falla, arréglalo y repite; no avances.
7. Con el gate en verde: `git tag fase-N-ok`, actualiza `STATUS.md` (fase N completada, siguiente fase propuesta, stubs restantes).
8. **DETENTE.** Entrega el informe en el formato R10 (hecho · salida de `verify` · rutas de capturas · qué NO está hecho) y espera instrucciones. No empieces la fase N+1.

## No hagas
- No implementes nada que no esté en la fase (va a `BACKLOG.md`).
- No toques `_legacy/`, `reference/`, `.agents/` ni `docs/spec/`.
- No cambies el gate para que pase.
