---
name: corregir-bug
description: Procedimiento para corregir un fallo funcional con método (reproducir, causa raíz, test que falla, corrección, test en verde). Úsala para el mapa mental roto, el simulador, las flashcards o cualquier bug que reporte el usuario.
---

# /corregir-bug <descripción>

1. **Reproduce** en `npm start` y en el build de producción (`npm run build` + `npm run preview`). Captura errores de consola, de red y de aserciones. Guarda capturas en `e2e/screenshots/`.
2. **Causa raíz**: localiza archivo y línea con evidencia (no un síntoma). Si hay varias causas, lístalas.
3. **Test que falla primero**: escríbelo (unit o e2e) y ejecútalo en rojo por el motivo correcto.
4. **Corrige** lo mínimo en el origen (no con parches ni `try/catch` que oculten el error).
5. Ejecuta el test en verde, en desarrollo y en producción, y `npm run verify`.
6. Registra en `CHANGELOG.md` causa raíz + test que lo protege (y en `DECISIONS.md` si cambió un diseño).
Prohibido: desactivar el test, bajar un umbral o dejar un `skip`.
