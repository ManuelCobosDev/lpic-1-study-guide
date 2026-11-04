# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-04 · **Última entrada**: C-0075

## Estado
- **Rama actual**: `audit/o2-navegacion-seo`
- **Fase actual**: Fase 2 de Auditoría Integral (Oleadas de Corrección).
- **Último hito superado**: **Oleada O2 (Honestidad, Navegación y SEO Base)** completada y verificada.
- **Trabajo en curso**: Ninguno. Oleada O2 concluida con pipeline en verde y capturas registradas.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Aprobación de la siguiente oleada**: Esperar aprobación explícita del usuario (`APROBADO O3`) para iniciar la Oleada O3 (Visor de Lecciones y Sistema Visual: bloques `html` invisibles, doble título en portada de diapositivas, prevención de overflows 16:9, responsive de cabecera en 768px/1280px).

## Oleada O2 · Logros Verificados
- **0 Enlaces rotos / 404s corregidos**: erratas enlazadas a `/estudiar/:id`, misión integradora en topic-detail enlazada al primer lab real del tema, redirección `/estudiar` -> `/temario`.
- **Wiki-popover sin codificación URL residual**: desacoplados `targetPath` y `queryParams`, eliminando `%3F` y `%3D` en los enlaces de comandos y glosario.
- **Migas de pan humanizadas**: diccionario `KNOWN_LABELS`, formateo automático de identificadores (`Lab 101.1`, `Subtema 105.1`), y reescritura de `/estudiar` como enlace navegable a "Temario".
- **Home y Temario honestos**: tarjeta del Examen 102 plenamente activa con progreso dinámico y enlace al temario; eliminada jerga interna ("Fase N", "Planificado para Fase 11"); selector del simulador con los 10 temas oficiales (101-110).
- **Copy honesto de almacenamiento y privacidad**: FAQ y Ajustes clarifican el uso de LocalStorage del navegador y carga dinámica de paquetes bajo demanda de red (sin prometer PWA/offline 100%).
- **SEO Base y Rastreo**: `lang="es"` en `src/index.html`, meta description y etiquetas Open Graph / Twitter Card completas; generación automática de `public/robots.txt` y `public/sitemap.xml` con los 42 subtemas.
- **Higiene de enlaces**: `/guia-estilos` retirado del pie de página público.
- **Pipeline y visual**: `npm run verify` verde (10/10 etapas, 99 E2E, 396 unit tests); 4 capturas visuales en `docs/agent/auditorias/web-2026-11-03/capturas/o2-after/`.

## Comandos útiles
- `npm run verify`: pipeline completo de 10 etapas en verde (99 E2E specs + 47 Vitest specs + 396 Karma specs).
- `npm run build:content`: compila currículo, valida integridad y genera `public/sitemap.xml`.
- `npm run preview`: arranca el servidor local de previsualización estática en `http://localhost:4200`.
