---
name: inventario-legacy
description: Hace un inventario de solo lectura del material antiguo del curso LPIC-1 en _legacy/ (HTML compilado, fuentes, scripts Python) y propone estrategias de importación. Úsala en la Fase 1, antes de escribir ningún importador, o cuando haya dudas sobre el formato del contenido original.
---

# /inventario-legacy

Solo lectura. No escribas código de la app ni modifiques nada en `_legacy/`. Salida única: `docs/agent/INVENTARIO_LEGACY.md`.

## Qué investigar (con evidencia: rutas y fragmentos reales)
1. **Mapa**: árbol de `_legacy/` a 3 niveles, tamaño por carpeta, tipos de archivo (extensión → nº y tamaño), carpetas ajenas al curso (basura, backups, node_modules, `__pycache__`).
2. **Cómo se genera lo publicado**: qué script Python o herramienta produce `slides-publico/` a partir de `recurso-final/` (entrada → proceso → salida), con el comando para reproducirlo si se deduce.
3. **Por cada tipo de contenido** (diapositivas, prácticas de laboratorio, comandos, glosario, preguntas del simulador, mapa mental, notas/erratas, diagramas, imágenes): dónde vive en el fuente y en lo compilado, **formato real** (HTML, JSON, Python, Markdown, PNG…), 2 ejemplos reales citados por ruta, y cómo se enlazan entre sí (ids, códigos de subtema).
4. **Diapositivas en concreto**: ¿cada una es un HTML, una imagen, un bloque dentro de un HTML grande? Resolución, dependencias de CSS/JS/fuentes, si el texto es seleccionable, peso medio, si se pueden aislar en un `<iframe>` autocontenido.
5. **Recuento real vs esperado** (tabla): 437 diapositivas · 23/23 subtemas del 101 · 27 prácticas (23 + 4 globales) · 126 comandos · 116 términos · 120 preguntas · 21 erratas · 475 nodos del mapa mental. Indica discrepancias.
6. **Calidad**: ids duplicados o inconsistentes, textos rotos, enlaces rotos, contenido duplicado, mezcla de idiomas, huecos (subtemas sin práctica, etc.).
7. **Examen 102**: ¿hay contenido o solo planificación?

## Estrategias de importación a evaluar (para ESTE material)
- **A · Convertir** todo a Markdown/bloques/YAML nativos (máxima limpieza y búsqueda; más esfuerzo; riesgo de pérdida visual).
- **B · Incrustar** las diapositivas HTML tal cual en un `<iframe sandbox>` escalado (rápido y fiel; menos integrable con búsqueda/vista web/PDF).
- **C · Híbrida**: texto estructurado extraído para búsqueda/web/PDF + visual original incrustado en la vista de diapositivas.
Para cada una: pros, contras, esfuerzo estimado (S/M/L), riesgo y cómo afecta al buscador, la vista web y el PDF. Termina con **tu recomendación razonada**.

## Cierre
- Lista de **preguntas abiertas** para el usuario (máx. 8, concretas).
- **DETENTE** y espera la decisión. Cuando el usuario decida, registra con `/registrar-decision` como D-004.
