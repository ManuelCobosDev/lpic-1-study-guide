---
name: ejecutar-paso-r2
description: Ejecuta un paso de la Ronda 2 (R0 a R7 o RF) del proyecto LPIC-1 siguiendo docs/spec/10. Úsala cuando el usuario pida "ejecuta el paso R3" o similar. No sirve para subtemas (usa procesar-subtema).
---

# /ejecutar-paso-r2 <R0|R1|…|R7|RF>

1. Ejecuta `/iniciar-sesion`. Lee `docs/agent/PROGRESO_R2.md` y comprueba que **los pasos anteriores están en estado "hecho"** (tabla de pasos). Si no, detente y díselo al usuario.
2. Lee el bloque del paso en `docs/spec/10-ronda2-plan.md` y SOLO las secciones de spec que cite (11, 12, 13, 14). Reformula en 5 líneas qué vas a entregar y cuál es el gate; **espera confirmación** si hay ambigüedad.
3. Crea tareas (lista de tareas) con los subpasos. Trabaja en bloques pequeños; tras cada bloque `npm run typecheck` y los tests afectados.
4. **Test primero**: si el paso resuelve un fallo F1–F6, trabaja contra su spec de `e2e/ronda2/pendientes/`; hazlo pasar y muévelo con `git mv` a `e2e/ronda2/`.
5. Termina con `/verificar-gate <paso>` (criterios de spec 10 y del spec del paso). Sin PASS en todos los criterios no hay paso hecho.
6. Actualiza `docs/agent/PROGRESO_R2.md` (fila del paso: estado, fecha, commit, evidencia), `/cerrar-sesion`, etiqueta `r2-<paso>-ok`.
7. **DETENTE.** Resume: qué se hizo, cifras reales, qué valida el usuario (R1) y el siguiente paso exacto.
