# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-07 · **Última entrada**: C-0079

## Estado
- **Rama actual**: `development` (tras merge de `audit/o6-higiene-repo-refactorizacion`)
- **Fase actual**: Auditoría Integral Web (Completada al 100% las 6 oleadas O1–O6).
- **Último hito superado**: **Oleada O6 (Higiene del Repositorio y Refactorización)** completada y verificada al 100%.
- **Trabajo en curso**: Ninguno. Auditoría integral completada con pipeline en verde en todas las etapas.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Confirmación con el usuario**: Notificar la conclusión total de las 6 oleadas de la Auditoría Integral y consultar la siguiente dirección del proyecto (ej. reanudar la Ronda 2 de subtemas LPI 102 o preparar el despliegue).

## Oleada O6 · Logros Verificados
- **Eliminación de `round_2/` residual** (`A9-001`, S-16): suprimidos los 20 archivos que duplicaban la raíz del proyecto.
- **Exclusión de capturas huérfanas** (`A9-002`, `A9-005`): añadido `/e2e/screenshots/` a `.gitignore` y desversionados 97 archivos PNG obsoletos del historial de git.
- **Integración Continua y cabeceras de seguridad** (`A9-003`): workflow `.github/workflows/ci.yml` configurado con pipeline completo y `public/_headers` con CSP y cabeceras Cloudflare Pages.
- **README actualizado y honesto** (`A9-004`): corregidas menciones a Karma/Jasmine por Angular CLI + Vitest, 10 etapas del gate y estadísticas sincronizadas desde el manifiesto.
- **Supresión de `webDocument` vestigial** (`A9-004`, `A3-008`, `A9-006`): eliminada clave redundante en esquemas, modelos, build y 41 archivos JSON de lecciones, ahorrando ~1.5 MB.
- **Descomposición modular de `home-page.component.ts`** (`A6-003`, S-14): modularizado en `HomeHeroComponent`, `HomeMetricsComponent` y `HomeFaqComponent`, reduciendo el componente principal de 1.096 a 150 líneas.
- **Verificación completa**: `npm run verify` al 100% en verde (10/10 etapas, 102 tests E2E Playwright, 444 tests unitarios).

## Comandos útiles
- `npm run verify`: pipeline completo de 10 etapas en verde (102 E2E specs + 47 Vitest specs + 397 Karma specs).
- `npm run build:content`: compila currículo, valida integridad y genera `public/sitemap.xml`.
- `npm run preview`: arranca el servidor local de previsualización estática en `http://localhost:4200`.
