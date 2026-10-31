# Arquitectura del Sistema · LPIC-1 Study Guide

## 1. Principios Fundamentales

- **100% Cliente (Zero-Backend SPA)**: Toda la lógica de negocio, cálculo de progreso, evaluación de exámenes y generación de reportes se ejecuta en el navegador del usuario. No requiere APIs de backend, bases de datos remotas ni servidores dedicados.
- **Persistencia Aislada y Transparente**: Todo el progreso del usuario, notas personales, tarjetas Leitner, historial de simulacros e historial de preferencias se almacena en `localStorage` a través del patrón `PersistedStore`.
- **Angular Moderno y Reactivo**:
  - Componentes exclusivamente **Standalone** sin módulos `NgModule`.
  - Estrategia de detección de cambios **`ChangeDetectionStrategy.OnPush`** en el 100% de los componentes.
  - Gestión de estado basada en **Angular Signals** (`signal()`, `computed()`, `effect()`, `input()`, `output()`).
  - Uso estricto del nuevo flujo de control declarativo de plantillas (`@if`, `@for`, `@switch`).
- **Fronteras Arquitectónicas Estrictas** (Auditadas automáticamente por `scripts/check-boundaries.ts`):
  - `core/engines` y `core/selectors`: TypeScript puro, sin dependencias del framework `@angular/*`.
  - `core/models` y `core/schemas`: Definiciones de datos agnósticas a la presentación.
  - `core` nunca importa código de `shared` ni de `features`.
  - `shared` nunca importa código de `features`.
  - Ninguna feature importa código de otra feature (comunicación desacoplada a través del router y servicios de `core`).
  - Los componentes presentacionales son puros: solo reciben `input()` y emiten `output()`. Las páginas orquestan servicios y estado.

---

## 2. Mapa de Capas y Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                    FEATURES (Páginas)                       │
│  curriculum · study · labs · simulator · commands ·         │
│  glossary · flashcards · mind-map · progress · settings     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      SHARED (Reutilizable)   │ │       CORE (Servicios)     │
│  ui/ (Button, Container...)  │ │  Content, Progress, Exam,  │
│  content-blocks/ (Renderer)  │ │  Storage, Preferences...   │
└──────────────────────────────┘ └─────────────┬──────────────┘
                                               │
               ┌───────────────────────────────┴──────────────┐
               ▼                                              ▼
┌──────────────────────────────┐              ┌────────────────────────────┐
│    CORE (Motores Puros)      │              │       CORE (Estado)        │
│  Scoring · Leitner · Search  │              │  PersistedStore<T>         │
│  (100% TypeScript puro)      │              │  (Inmutable + LocalStorage)│
└──────────────────────────────┘              └────────────────────────────┘
```

---

## 3. Motores Puros Desacoplados (`src/app/core/engines/`)

Los algoritmos complejos están aislados en funciones puras para garantizar testeabilidad unitaria sin dependencias del DOM ni de Angular:

1. **Motor de Puntuación (`scoring/scoring.engine.ts`)**:
   - Algoritmo oficial LPIC-1 de selección proporcional de preguntas ponderadas por tema y subtema.
   - Puntuación lineal oficial escalada entre 200 y 800 puntos (umbral de aprobado: 500 puntos).
   - Generador determinista de números pseudoaleatorios con semilla (PRNG).
2. **Motor de Búsqueda (`search/search.engine.ts`)**:
   - Búsqueda difusa indexada en memoria con MiniSearch.
   - Normalización de acentos, sinónimos técnicos y compatibilidad con términos entrecomillados.
3. **Motor Leitner (`leitner/leitner.engine.ts`)**:
   - Algoritmo de repetición espaciada con 5 cajas progresivas.
   - Clasificación de respuestas ("Fácil", "Regular", "Difícil") y cálculo de intervalos de repaso.
4. **Motor de Jerarquía D3 (`mind-map/`)**:
   - Transformación de datos de currículo en grafos jerárquicos de nodos y ramas con D3.js.

---

## 4. Gestión de Estado y Persistencia (`PersistedStore`)

La reactividad se estructura a través de instancias de `PersistedStore<T>`:
- Cada módulo de estado posee una clave versionada en `localStorage` (`exam_progress_v1`, `study_preferences_v1`, etc.).
- Las mutaciones son inmutables: generan un nuevo objeto de estado y emiten una señal que actualiza la UI al instante.
- Métodos `flush()` y sincronización segura contra caídas de pestañas o recargas accidentales.
- Centro de respaldo con cálculo de hash SHA-256 para importaciones íntegras sin corrupción de datos.

---

## 5. Extensibilidad Orientada a Datos

El diseño del sistema permite añadir o modificar contenido (nuevos temas, subtemas, lecciones o preguntas) sin alterar ni compilar componentes de interfaz:
- Los contadores de la interfaz se derivan automáticamente del manifiesto generado (`stats` en `public/content/manifest.json`). Cero cifras escritas a mano (Regla R6).
- El comando `npm run new:subtopic -- <id> "<título>"` inserta el subtema en `curriculum.yaml`, genera la lección base con Zod y recompila los manifiestos, reflejándose inmediatamente en temario, árbol lateral, buscador global y mapa mental.
