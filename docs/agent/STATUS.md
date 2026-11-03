# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-03 · **Última entrada**: C-0074

## Estado
- **Rama actual**: `audit/o1-integridad`
- **Fase actual**: Fase 2 de Auditoría Integral (Oleadas de Corrección).
- **Último hito superado**: **Oleada O1 (Integridad Estructural y Datos Base)** completada y verificada.
- **Trabajo en curso**: Ninguno. Oleada O1 concluida con pipeline en verde y capturas registradas.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Aprobación de la siguiente oleada**: Esperar aprobación explícita del usuario (`APROBADO O2`) para iniciar la Oleada O2 (Honestidad, Navegación y SEO Base: 404s en erratas/topic-detail/breadcrumbs, copy offline honesto, lang="es", metas).

## Oleada O1 · Logros Verificados
- **100% IDs únicos de diapositivas**: 771/771 diapositivas con identificadores y `slideNumber` correlativos 1..N (resuelto en 108.3–110.3).
- **100% IDs únicos de preguntas**: 240/240 preguntas con namespace canónico (`q-101-X` a `q-110-X`), eliminadas 27 colisiones con Tema 102.
- **Flashcards y persistencia**: `BackupService` fusiona bajo `data.progress` (fin al `TypeError` por `data.cards`); nuevo `PersistedStore.reloadAll()` para refresco reactivo en memoria sin requerir F5.
- **Comandos oficiales íntegros**: 186 banderas técnicas recuperadas en `commands.yaml`, eliminados todos los flags vacíos o con `-`.
- **Validaciones automáticas en CI**: `build-content` falla de inmediato ante diapositivas/preguntas con IDs duplicados o banderas vacías.
- **Pipeline maestro**: `npm run verify` verde (10/10 etapas, 98 E2E, 390 Karma + 47 Vitest).
- **Capturas visuales**: generadas en `docs/agent/auditorias/web-2026-11-03/capturas/o1-after/`.

## Comandos útiles
- `npm run verify`: pipeline completo de 10 etapas en verde (98 E2E specs + 47 Vitest specs + 390 Karma specs).
- `npm run build:content`: compila y valida la integridad estricta del currículo y sus recursos.
- `npm run preview`: arranca el servidor local de previsualización estática en `http://localhost:4200`.
