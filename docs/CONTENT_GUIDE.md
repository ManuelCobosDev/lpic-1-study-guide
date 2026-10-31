# Guía de Contenido

## Estructura del Contenido (`content-src/`)
- `curriculum.yaml`: Exámenes (101 y 102), temas (101–110), subtemas y pesos oficiales del LPI.
- `lessons/<subtema>.md`: Lección con metadatos y colección de diapositivas en formatos estructurados.
- `labs/<id>.yaml`: Prácticas por subtema y misiones integradoras globales.
- `questions/<tema>.yaml`: Preguntas tipo test (`single`, `multiple`, `fill`) para simulacro y práctica.
- `commands.yaml`, `glossary.yaml`, `errata.yaml`: Comandos con flags, términos del glosario y fe de erratas.

## Pipeline y Validación
El script `scripts/build-content.ts` valida cada archivo contra esquemas Zod rigurosos y compila los manifiestos e índices en `public/content/`.
Cualquier contenido ausente se rellena de forma determinista con `placeholder: true`.

