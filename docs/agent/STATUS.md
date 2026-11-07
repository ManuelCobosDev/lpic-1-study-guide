# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-08 · **Última entrada**: C-0080

## Estado
- **Rama actual**: `development`
- **Versión de la plataforma**: `v0.2.0-preview` (Demo Funcional Pre-Release · Bug Hunting)
- **Fase actual**: Pre-Release 0.2.0 en `development` para testeo y detección de fallos.
- **Último hito superado**: **Versión 0.2.0-preview publicada en `development`** con toda la suite de auditoría y controles en verde.
- **Trabajo en curso**: Ninguno. Listo para pruebas de usuario.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Testeo interactivo y búsqueda de bugs**: Recoger feedback de navegación, uso del simulador, visor de diapositivas y herramientas en la versión `0.2.0-preview`.

## Registro Reciente
- **Versión 0.2.0-preview** (`C-0080`): Bump de versión en `package.json`, footer (`v0.2.0-preview`), acerca-de y sistema de backups desacoplado.
- **Oleada O6 completada** (`C-0079`): Higiene de repo, CI GitHub Actions, cabeceras CSP, supresión de `round_2/` y modularización de Home.
- **Auditoría Integral (O1–O6)**: 105 hallazgos resueltos, 0 violaciones WCAG 2.2 AA (Axe), 102 E2E specs y 444 unit tests en verde.

## Comandos útiles
- `npm run verify`: pipeline completo de 10 etapas en verde (102 E2E specs + 47 Vitest specs + 397 Karma specs).
- `npm run build:content`: compila currículo, valida integridad y genera `public/sitemap.xml`.
- `npm run dev`: arranca el servidor local de desarrollo en `http://localhost:4200`.
- `npm run preview`: previsualización de producción en `http://localhost:4200`.
