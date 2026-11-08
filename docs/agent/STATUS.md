# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-08 · **Última entrada**: C-0082

## Estado
- **Rama actual**: `development`
- **Versión de la plataforma**: `v0.2.0-preview` (Demo Funcional Pre-Release · Bug Hunting)
- **Fase actual**: Pre-Release 0.2.0 en `development` + Sistema de Validación Masiva Paralela (`/validar-temario-pdf`) listo.
- **Último hito superado**: **Paralelismo Hardware-Aware por Oleadas implementado en `/validar-temario-pdf` (`C-0082`)** (auto-detección de 16 CPUs / 31.34 GB RAM → 14 hilos Python, 4 Coordinadores de Tema en paralelo y oleadas de 3 subtemas simultáneos por tema).
- **Trabajo en curso**: Ninguno. Listo para lanzar validación masiva en paralelo de `101-500` (571 págs) o `102-500` (594 págs).
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Ejecutar validación masiva paralela con `/validar-temario-pdf`**: Lanzar el proceso autónomo sobre `LPI-Learning-Material-101-500-es.pdf` o `LPI-Learning-Material-102-500-es.pdf` cuando el usuario lo indique.

## Registro Reciente
- **Paralelismo Hardware-Aware en `/validar-temario-pdf`** (`C-0082`): `ThreadPoolExecutor` multihilo, planificador de oleadas (`next-wave`, `extract-wave-parallel`, `pre-compare-wave-parallel`), regex C-level vectorizado y transacciones SQLite con backoff.
- **Skill `/validar-temario-pdf` base** (`C-0081`): Servidor Python de APIs por Tema y Sub-APIs por Sección, motor PyMuPDF y BBDD SQLite WAL.
- **Versión 0.2.0-preview** (`C-0080`): Bump de versión en `package.json`, footer (`v0.2.0-preview`), acerca-de y sistema de backups desacoplado.

## Comandos útiles
- `python .agents/skills/validar-temario-pdf/scripts/pdf_validation_server.py hardware-plan`: inspecciona CPU/RAM y límites de concurrencia.
- `python .agents/skills/validar-temario-pdf/scripts/pdf_validation_server.py init --pdf "docs/lpic1-original-content/LPI-Learning-Material-101-500-es.pdf"`: inicializa estructura y oleadas paralelas.
- `npm run verify`: pipeline completo de 10 etapas en verde.
