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

## D-004 · (pendiente) · Estrategia de importación del contenido legacy
- Se decide tras la Fase 1 (`/inventario-legacy`): A convertir · B incrustar HTML · C híbrida.
