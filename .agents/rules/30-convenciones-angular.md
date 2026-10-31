---
trigger: model_decision
description: Convenciones de código Angular, estructura de carpetas, fronteras de importación, tokens de diseño y botón único del proyecto. Cárgala antes de crear o modificar componentes, servicios, rutas, estilos o scripts.
---

# Convenciones Angular del proyecto

Detalle completo en `docs/spec/01-stack.md`, `02-estructura.md` y `05-diseno.md`.

## Código
- Angular standalone, **signals**, `@if/@for/@switch`, `inject()`, `ChangeDetectionStrategy.OnPush` en todos los componentes, `input()/output()/model()/computed()`. `effect()` solo para persistencia o sincronizar con el DOM. `host: {}` en vez de `@HostBinding/@HostListener`. `track` obligatorio en `@for`.
- TypeScript estricto, sin `any`. Selectores con prefijo `app-`. Plantillas externas a partir de ~15 líneas. Nombres de archivo según el generador de la CLI de la versión instalada, aplicados con coherencia.
- Rutas lazy (`loadComponent`/`loadChildren`) con `title` y `data.breadcrumb`.

## Fronteras (las hace cumplir `check:boundaries` y ESLint)
- `core/engines/**` y `core/selectors/**`: TypeScript puro, sin `@angular/*`.
- `core` no importa de `shared` ni de `features`. `shared` no importa de `features`. Una feature no importa de otra.
- Solo `core/services/storage.service.ts` toca `localStorage`.
- Las páginas (`pages/`) orquestan servicios; los componentes reciben `input()` y emiten `output()`, sin inyectar servicios de dominio.

## Diseño
- Colores solo por variables CSS de `tokens.css`/`themes.css`. Semántica: azul acción · verde completado/correcto · ámbar simulador/aviso · rojo error/destructivo · sky información · gris pendiente.
- **Un único `app-button`** (variantes primary, secondary, ghost, warning, destructive, link; tamaños sm 32, md 40, lg 48, icon 40). Ningún botón ad hoc.
- **Un único `Container`** para header, breadcrumbs, contenido y footer (1200 px; 1440 px en estudiar y mapa mental).
- Texto mínimo 12 px. Ningún título truncado con puntos suspensivos. Tarjetas hermanas de igual altura.
- Antes de crear un componente comprueba si ya existe en `shared/ui`. No dupliques.
