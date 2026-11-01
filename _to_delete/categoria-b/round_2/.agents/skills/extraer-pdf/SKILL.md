---
name: extraer-pdf
description: Extrae y contabiliza el contenido completo de un PDF oficial de LPI (units.json, objectives.json, pages.json, figuras e informe) con PyMuPDF. Úsala en el paso R1 o cuando haya que regenerar o depurar la extracción del manual 102.
---

# /extraer-pdf

Spec 11 §11.1–11.3 es el contrato. Entrada: `_legacy/Recurso Final Definitivo/LPI-Learning-Material-102-500-es.pdf`. Salida: `content-src/_extract/102-500/` (NO versionada).

## Método
1. Antes de programar, **inspecciona el PDF**: nº de páginas, marcadores/outline, fuentes usadas (nombres y tamaños por rol: título de tema, de objetivo, de lección, cuerpo, código, pie), cabeceras y pies repetidos, cómo se marcan ejercicios, respuestas y resumen. Escribe lo observado en `docs/agent/EXTRACCION_NOTAS.md`. No supongas la estructura.
2. Lee los scripts del legacy relacionados con extracción o generación de contenido y anota qué aprovechas. No copies a ciegas.
3. Entorno: `.venv-extract/` con `pymupdf` (pide confirmación antes de instalar). Se invoca con `py -3` desde `npm run extract:pdf`.
4. Reconstruye jerarquía con la tipografía de cada span (spec 11 §11.1). Detecta tablas, listas y bloques de código. Extrae figuras a PNG con su pie.
5. Clasifica cada unidad (`kind`) y extrae tokens (spec 11 §11.4). Guarda determinista (orden estable, sin fechas ni rutas absolutas).
6. **Contabilidad de páginas**: por página, texto total frente a texto asignado; lo no asignado debe coincidir con patrones de exclusión explícitos (cabecera, pie, nº de página). Objetivo ≥ 99,5 %; las páginas por debajo se listan en `extraction-report.md` con el motivo.
7. Compara `objectives.json` con `docs/spec/07-curriculo.md` (6 temas, 19 objetivos, pesos) y lista diferencias.
8. Genera `extract-overview.html` (doble clic) con nº de páginas, objetivos, unidades por tipo y anomalías.

## Pruebas (obligatorias)
Tests del tokenizador con casos reales del PDF; test de determinismo (dos ejecuciones, mismo hash); test de que cada objetivo tiene áreas clave y lista parcial.

## Prohibido
Retocar a mano `units.json`; bajar el umbral de contabilidad para que pase; ignorar una página rara. Si algo no se puede extraer bien (tabla compleja, figura), márcalo en el informe como anomalía para revisión humana.
