---
name: registrar-decision
description: Registra una decisión de arquitectura, alcance o contenido del proyecto LPIC-1 en DECISIONS.md (formato ADR corto). Úsala cada vez que el usuario decida algo, cuando elijas entre alternativas técnicas, o cuando cambies un test, un gate o una spec con permiso.
---

# /registrar-decision

## Pasos
1. Lee los títulos de `docs/agent/DECISIONS.md` y toma el siguiente número `D-NNN`.
2. **Añade al final** (nunca reescribas decisiones antiguas) una entrada con este formato:

```
## D-005 · 2026-11-03 · <título corto>
- Contexto: <qué problema o pregunta había>
- Opciones: <A … / B … / C …>
- Decisión: <qué se elige> · Decidió: <usuario | agente con visto bueno del usuario>
- Consecuencias: <qué implica, qué queda descartado, qué hay que revisar>
- Revisable si: <condición que haría reabrirla>
```
3. Si una decisión sustituye a otra anterior, no borres la antigua: añade "Sustituye a D-00X" en la nueva y "Sustituida por D-00Y" en una línea nueva al final de la antigua.
4. Menciona el `D-NNN` en la siguiente entrada de CHANGELOG y, si afecta al siguiente paso, en `STATUS.md`.

## Cuándo es obligatorio
- Estrategia de importación del legacy (D-004).
- Cualquier excepción a una regla o spec, o cambio de un test o gate.
- Elección de librería o patrón no previsto en `docs/spec/`.
- Huecos de contenido aprobados por el usuario.
