# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-07 · **Última entrada**: C-0078

## Estado
- **Rama actual**: `development` (tras merge de `audit/o5-accesibilidad-herramientas-rendimiento`)
- **Fase actual**: Fase 2 de Auditoría Integral (Oleadas de Corrección).
- **Último hito superado**: **Oleada O5 (Accesibilidad WCAG 2.2 AA, Herramientas Interactivas y Rendimiento)** completada y verificada al 100%.
- **Trabajo en curso**: Ninguno. Oleada O5 concluida con pipeline en verde y capturas registradas.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Aprobación de la siguiente oleada**: Esperar aprobación explícita del usuario (`APROBADO O6`) para iniciar la Oleada O6 (Higiene del Repositorio y Refactorización: eliminación de `round_2/`, depuración de capturas obsoletas, modularización de `home-page.component.ts`).

## Oleada O5 · Logros Verificados
- **Landmark `<main>` único en toda la app** (`A7-006`): corregidas 9 vistas hijas que duplicaban `<main>` anidado.
- **Áreas táctiles y mapa de calor** (`A7-007`): retirados `tabindex="0"` y `role="button"` de las 728 celdas de días en `activity-heatmap`, eliminando violaciones WCAG 2.5.8.
- **Modales accesibles en laboratorios** (`A7-008`): focus trap con `cdkTrapFocus`, cierre por tecla `Escape` y click en backdrop.
- **Estructura ARIA completa en pestañas y visor** (`A7-009`): tabs con `role="tablist"` desacoplado de `<nav>`, `aria-controls` dinámico y carrusel de diapositivas con `role="region" aria-roledescription="carousel"`.
- **Navegación fluida por teclado en Mapa Mental** (`A7-010`): eliminada trampa de foco en nodos hoja limitando tabulación a ramas expandibles.
- **Botón móvil hamburger WCAG AA** (`A7-014`): dimensiones ≥ 44×44px, con `aria-expanded` dinámico y `aria-label`.
- **Ratios de contraste WCAG AA** (`A7-005`): colores semánticos en modo oscuro y badges (`errata-page`, `about-page`, `not-found-page`, `question-card`, `search-page`).
- **Glosario A-Z con grupo `#`** (`A8-007`): soporte y botón para términos que inician con `/` o `.`.
- **Expansión de sinónimos técnicos en búsqueda** (`A8-008`): diccionario `TECHNICAL_SYNONYMS` para términos equivalentes (ej. 'particionar' -> 'fdisk').
- **Consolidación canónica de categorías de comandos** (`A8-011`, D-007): unificadas las 35 categorías a 12 canónicas.
- **Particionado de flashcards** (`A7-011`): división de mazos en `flashcards-101.json` y `flashcards-102.json` cargados bajo demanda.
- **Verificación completa**: `npm run verify` al 100% en verde (10/10 etapas, 102 tests E2E Playwright, 444 unit tests); 4 capturas visuales en `e2e/screenshots/fase-12/o5-*.png`.

## Comandos útiles
- `npm run verify`: pipeline completo de 10 etapas en verde (102 E2E specs + 47 Vitest specs + 397 Karma specs).
- `npm run build:content`: compila currículo, valida integridad y genera `public/sitemap.xml`.
- `npm run preview`: arranca el servidor local de previsualización estática en `http://localhost:4200`.
