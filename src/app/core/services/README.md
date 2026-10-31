# Core Services
Servicios singleton basados en Signals para gestionar el estado, progreso, preferencias y contenido.
Solo `storage.service.ts` tiene permitido acceder directamente a `localStorage`.
Prohibido importar desde `shared` o `features`.

