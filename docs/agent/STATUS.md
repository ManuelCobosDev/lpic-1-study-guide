# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-07 · **Última entrada**: C-0077

## Estado
- **Rama actual**: `development` (tras merge de `audit/o4-fidelidad-lpi`)
- **Fase actual**: Fase 2 de Auditoría Integral (Oleadas de Corrección).
- **Último hito superado**: **Oleada O4 (Exactitud Pedagógica y Fidelidad LPI)** completada y verificada al 100%.
- **Trabajo en curso**: Ninguno. Oleada O4 concluida con pipeline en verde y capturas registradas.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Aprobación de la siguiente oleada**: Esperar aprobación explícita del usuario (`APROBADO O5`) para iniciar la Oleada O5 (Accesibilidad, Herramientas y Rendimiento: WCAG 2.2 AA en badges/modales, focus trap, chunking diferido de flashcards, grupo '#' en glosario).

## Oleada O4 · Logros Verificados
- **Claves de examen invertidas o erróneas corregidas**: `q-103-82`, `q-103-32`, `q-102-80` (SIGTSTP), `q-107-21`, `q-109-8`, `q-110-50`, `q-110-84`, `q-110-85`.
- **Saneamiento de preguntas fill**: limpieza de notas parentéticas editoriales, normalización de diacríticos/tildes en `scoring.engine.ts`, y tolerancia estricta de rutas con y sin barra `/`.
- **Sintaxis de tuberías y opciones restaurada**: `q-103-30` (`<`, `2>&1`), `q-103-37` (`foo | tee /tmp/foodata`), y deduplicación en `q-103-49`.
- **Reclasificación íntegra del Examen 101**: 120 preguntas distribuidas honestamente entre los 23 subtemas reales (101.1–104.7), habilitando la práctica interactiva en todas las lecciones del 101.
- **Transparencia en placeholders**: lecciones 108.3–110.3 y laboratorios 108.1–110.3 marcados honestamente con `placeholder: true`, badges accesibles en catálogo y banners informativos en detalle.
- **Verificación completa**: `npm run verify` al 100% en verde (10/10 etapas, 101 tests E2E Playwright, 442 unit tests); 4 capturas visuales en `e2e/screenshots/fase-12/o4-*.png`.

## Comandos útiles
- `npm run verify`: pipeline completo de 10 etapas en verde (101 E2E specs + 47 Vitest specs + 395 Karma specs).
- `npm run build:content`: compila currículo, valida integridad y genera `public/sitemap.xml`.
- `npm run preview`: arranca el servidor local de previsualización estática en `http://localhost:4200`.
