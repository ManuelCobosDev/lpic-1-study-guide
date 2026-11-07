# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-04 · **Última entrada**: C-0076

## Estado
- **Rama actual**: `development`
- **Fase actual**: Fase 2 de Auditoría Integral (Oleadas de Corrección).
- **Último hito superado**: **Oleada O3 (Visor de Lecciones y Sistema Visual)** completada y verificada.
- **Trabajo en curso**: Ninguno. Oleada O3 concluida con pipeline en verde y capturas registradas.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Aprobación de la siguiente oleada**: Esperar aprobación explícita del usuario (`APROBADO O4`) para iniciar la Oleada O4 (Exactitud Pedagógica y Fidelidad LPI: corrección de claves de preguntas de examen invertidas, limpieza de preguntas fill, delimitadores de pipes corruptos, y marcado visible con `placeholder: true` en lecciones y laboratorios esqueleto).

## Oleada O3 · Logros Verificados
- **Renderizado de bloques HTML y contenido técnico**: componente `html-block` con DOMPurify seguro y soporte de estilos en línea; sandboxing seguro en iframes de `slide-html-block` (`sandbox="allow-scripts"` sin `allow-same-origin`).
- **Bloques de lista enriquecidos**: componente `list-block` con soporte de markdown (negrita, cursiva, monoespaciado) y referencias reactivas a Comandos y Glosario.
- **Deduplicación canónica de títulos**: `getVisibleSlideBlocks` filtra encabezados idénticos al título de diapositiva (en 752 diapositivas), eliminando títulos duplicados en portadas y recuperando espacio vertical.
- **Control de desbordes 16:9 y densidad**: `max-h-[380px]` con scroll y cabecera pegajosa en `table-block`; reducción de padding en `slide-viewer` para acomodar tablas grandes y diapositivas densas.
- **Impresión en modo oscuro**: corrección de `--bg-app` y sobreescritura de estilos `@media print` para garantizar fondo blanco y texto oscuro nítido sobre papel.
- **Cabecera responsive sólida**: navegación de escritorio reservada a ≥1024px (`lg:flex`), evitando rotura de elementos en 768px; logo responsive "LPIC-1 Study Guide" / "LPIC-1".
- **Mapa mental mejorado**: escala mínima de zoom acotada a 0.55, tipografía mínima de nodos a 12px y enlaces directos al temario desde el cajón lateral.
- **Pipeline y visual**: `npm run verify` verde (10/10 etapas, 100 tests Playwright E2E, 441 unit tests); 6 capturas visuales en `docs/agent/auditorias/web-2026-11-03/capturas/o3-after/`.

## Comandos útiles
- `npm run verify`: pipeline completo de 10 etapas en verde (100 E2E specs + 47 Vitest specs + 394 Karma specs).
- `npm run build:content`: compila currículo, valida integridad y genera `public/sitemap.xml`.
- `npm run preview`: arranca el servidor local de previsualización estática en `http://localhost:4200`.
