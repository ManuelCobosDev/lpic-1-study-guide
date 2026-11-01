# STATUS · foto del estado actual

> Se reescribe al cerrar cada tarea (`/cerrar-sesion`). Máx. ~60 líneas. El historial completo está en `CHANGELOG.md` y en `git log`.

**Última actualización**: 2026-11-01 · **Última entrada**: C-0074

## Estado
- **Fase actual**: Ronda 2 (Fidelidad y Cobertura Oficial Examen 102).
- **Último hito superado**: Limpieza integral y definitiva del repositorio (`/limpiar-repo`) en rama `chore/limpieza-repo` (cuarentena `_to_delete` purgada).
- **Trabajo en curso**: Ninguno. Repositorio limpio con solo lo esencial.
- **Bloqueos**: ninguno.

## Siguiente paso exacto
- **Fusión en `development`**: Fusionar la rama limpia `chore/limpieza-repo` en `development` cuando el usuario lo autorice.
- **Auditoría independiente de 105.1**: Abrir una conversación nueva y ejecutar `/auditar-subtema 105.1`. (No avanzar a 105.2 ni validar sin `VALIDADO 105.1` explícito del usuario).

## Ronda 2 · Pasos de Herramientas (R0 - R7)
| Paso | Descripción | Estado |
|---|---|---|
| R0 | Diagnóstico, línea base y tests pendientes | completado (Gate R0 OK) |
| R1 | Extracción completa del PDF 102 | completado (Gate R1 OK) |
| R2 | Herramientas de cobertura y validación | completado (Gate R2 OK) |
| R3 | Enlaces tipo Wikipedia y referencias contextuales | completado (Gate R3 OK) |
| R4 | Pestaña Practica lo aprendido | completado (Gate R4 OK) |
| R5 | Flashcards masivas | completado (Gate R5 OK) |
| R6 | Simulador examen 102 | completado (Gate R6 OK) |
| R7 | Mapa mental interactivo y robusto | completado (Gate R7 OK) |

## Limpieza del Repositorio (C-0074)
- **Archivos rastreados en Git**: 602 (26 eliminados entre código muerto, duplicados y configuración redundante).
- **Espacio ahorrado**: -58.4 MB en `node_modules` y -14 MB en artefactos locales.
- **Dependencias**: 5 paquetes obsoletos eliminados (`@angular/cdk`, `highlight.js`, `lucide-angular`, `marked`, `@types/dompurify`), +1 directo explícito (`d3-selection`).
- **Pipeline de verificación**: 10/10 etapas en verde (389 Karma, 46 Vitest, 98 E2E).

## Comandos útiles
- `npm run verify:coverage -- 105.1`: evalúa las 10 reglas de cobertura del subtema 105.1.
- `npm run report:coverage -- 105.1`: genera informe HTML autónomo con lista de verificación.
- `npm run progress:r2`: recalcula y actualiza la tabla de cobertura en `PROGRESO_R2.md`.
- `npm run verify`: pipeline completo de 10 etapas en verde (98 E2E specs + 46 Vitest specs + 389 Karma specs).
