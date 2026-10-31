# Arquitectura de la Aplicación

## Principios Fundamentales
- **100% Cliente**: Aplicación Single Page Application (SPA) en Angular sin backend requerido. Toda la persistencia reside en `localStorage`.
- **Angular Moderno**: Standalone components, `ChangeDetectionStrategy.OnPush` en todos los componentes, Signals (`signal`, `computed`, `effect`, `input`, `output`), nuevo control flow (`@if`, `@for`, `@switch`) y sin librerías de componentes externas.
- **Fronteras Estrictas**:
  - `core/engines` y `core/selectors`: TypeScript puro, sin dependencias de `@angular/*`.
  - `core` no importa de `shared` ni de `features`.
  - `shared` no importa de `features`.
  - Ninguna feature importa de otra feature.
  - El acceso a `localStorage` está estrictamente restringido a `StorageService`.
  - Las páginas orquestan servicios; los componentes son puramente presentacionales (`input()` / `output()`).

