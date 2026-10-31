# DECISIONS · registro de decisiones

> Solo se añade al final. Formato y cuándo usarlo: skill `/registrar-decision`.

## D-001 · 2026-10-31 · Angular, 100% cliente, y descartar el prototipo v0
- Contexto: el prototipo React generado con v0 resultó ser una maqueta (progreso en memoria, 10 de 14 rutas genéricas, currículo incorrecto, controles de calidad huecos).
- Opciones: A) migrarlo a Angular · B) construir desde cero en Angular usando v0 solo como referencia visual.
- Decisión: B · Decidió: usuario.
- Consecuencias: no se copia código de `reference/`. Sin backend; todo el estado en `localStorage` con exportar/importar.
- Revisable si: se decide añadir cuentas o sincronización entre dispositivos.

## D-002 · 2026-10-31 · El contenido sale del material legacy
- Contexto: el contenido completo del curso ya existe en dos carpetas (HTML compilado limpio y código fuente/scripts sucios).
- Opciones: A) reescribir contenido · B) importarlo con scripts reproducibles.
- Decisión: B · Decidió: usuario.
- Consecuencias: el contenido no se inventa; la estrategia concreta de importación se decide tras el inventario (D-004, Fase 1).
- Revisable si: el inventario demuestra que el material no es importable de forma fiable.

## D-003 · 2026-10-31 · Memoria del agente en archivos y git
- Contexto: el agente pierde contexto entre sesiones y al compactarse.
- Decisión: `STATUS.md` (foto), `CHANGELOG.md` (append-only), `DECISIONS.md`, commits con `[C-NNNN]` y etiquetas `fase-N-ok`; skills `/iniciar-sesion` y `/cerrar-sesion` obligatorias. Decidió: usuario.
- Consecuencias: cada tarea termina con registro y commit; ante dudas manda lo que digan los archivos y git.

## D-004 · 2026-10-31 · Estrategia C de importación híbrida y arquitectura enriquecida de contenido
- Contexto: El inventario de la Fase 1 demostró que en `_legacy/Recurso Final Definitivo/content/` ya existen 52 archivos JSON limpios con la estructura de diapositivas, notas y diagramas, y en `practicas-v2/` 70 archivos Markdown de prácticas.
- Opciones: A) Convertir todo a Markdown/YAML puro · B) Incrustar HTML compilado en `<iframe>` · C) Enfoque híbrido estructurado directo desde los JSON/MD fuente hacia esquemas JSON/Zod de dominio Angular con renderizado nativo.
- Decisión: C (Híbrida estructurada) · Decidió: usuario.
- Consecuencias:
  1. Se definirá un esquema JSON global predefinido y versionado para cada subtema (`Lesson`), apto para futuras traducciones o exportaciones.
  2. Cada subtema ofrecerá vista interactiva de Diapositivas (lienzo escalado) y vista Web continua en texto estructurado.
  3. Sistema de auto-vinculación estilo Wikipedia: referencias internas automáticas en el texto a comandos y términos de glosario (con tooltip/popover descriptivo al interactuar).
  4. Idioma 100% en español: todos los enunciados de preguntas del simulador y explicaciones se normalizan al español.
  5. Organización interna de cada tema: teoría por subtemas, sección de prácticas de subtema, práctica global integradora, cuestionario del tema extraído del banco de preguntas y subtema extra de resumen completo del tema (`repaso-grafico`).
  6. Examen 102: se mantiene como "planificado" para las fases iniciales de desarrollo modular (Fases 2–10) y se importará de forma completa, limpia y ordenada en la Fase 11 a partir de su contenido existente en el legacy.
- Revisable si: los requerimientos de la certificación LPI introducen cambios en la estructura de objetivos.
