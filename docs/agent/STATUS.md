# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-08 · **Última entrada**: C-0081

## Estado
- **Rama actual**: `development`
- **Versión de la plataforma**: `v0.2.0-preview` (Demo Funcional Pre-Release · Bug Hunting)
- **Fase actual**: Pre-Release 0.2.0 en `development` + Sistema de Validación Masiva PDF (`/validar-temario-pdf`) listo.
- **Último hito superado**: **Skill `/validar-temario-pdf` implementada y verificada (`C-0081`)** con servidor Python, BBDD SQLite (`validation_state.db`) y arquitectura de 3 capas de subagentes (`flash` / `flash_lite`).
- **Trabajo en curso**: Ninguno. Listo para lanzar validación masiva de `101-500` (571 págs) o `102-500` (594 págs).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Ejecutar validación masiva con `/validar-temario-pdf`**: Lanzar el proceso autónomo sobre `LPI-Learning-Material-101-500-es.pdf` o `LPI-Learning-Material-102-500-es.pdf` cuando el usuario lo indique.

## Registro Reciente
- **Skill `/validar-temario-pdf`** (`C-0081`): Servidor Python de APIs por Tema y Sub-APIs por Sección, motor PyMuPDF determinista, BBDD SQLite WAL (`page_ledger` de ~600 páginas) y prompts de 3 capas de subagentes.
- **Versión 0.2.0-preview** (`C-0080`): Bump de versión en `package.json`, footer (`v0.2.0-preview`), acerca-de y sistema de backups desacoplado.
- **Auditoría Integral (O1–O6)** (`C-0074`–`C-0079`): 105 hallazgos resueltos, 0 violaciones WCAG 2.2 AA (Axe), 102 E2E specs y 444 unit tests en verde.

## Comandos útiles
- `python .agents/skills/validar-temario-pdf/scripts/pdf_validation_server.py init --pdf "docs/lpic1-original-content/LPI-Learning-Material-101-500-es.pdf"`: inicializa estructura y BBDD SQLite.
- `python .agents/skills/validar-temario-pdf/scripts/pdf_validation_server.py progress --exam 101-500`: consulta progreso en SQLite.
- `npm run verify`: pipeline completo de 10 etapas en verde.
