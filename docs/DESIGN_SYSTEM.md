# Sistema de Diseño · LPIC-1 Study Guide

## 1. Filosofía y Reglas Fundamentales

- **Cero Colores Literales (Regla R6)**: Prohibido el uso de colores en formato `#HEX`, `rgb()`, `hsl()` o nombres literales de color fuera de `src/styles/tokens.css` y `src/styles/themes.css`. Todos los componentes consumen variables CSS semánticas. La herramienta `npm run check:tokens` valida este cumplimiento de forma continua.
- **Botón Único del Proyecto (Regla 30)**: Todos los botones de la interfaz utilizan exclusivamente el componente `<app-button>`. No se admiten elementos `<button>` nativos salvo casos excepcionales de bajo nivel dentro de primitivas accesibles.
- **Contenedor Canónico (`<app-container>`)**: Toda vista se envuelve en un contenedor único que controla anchos máximos y márgenes laterales homogéneos en escritorio y móvil.
- **Tipografía**:
  - Inter Variable (`@fontsource-variable/inter`) para todo el texto de interfaz y didáctico.
  - JetBrains Mono (`@fontsource/jetbrains-mono`) para código bash, comandos, rutas, opciones de terminal y claves técnicas.

---

## 2. Paleta de Color y Tokens Semánticos

### Escalas Base (`src/styles/tokens.css`)
- **Slate (50–950)**: Neutros para fondos, superficies elevadas, bordes y tipografía.
- **Azure (50–950)**: Color de acento primario para enlaces, acciones principales, selección y estados activos.
- **Emerald (50–950)**: Indicadores de éxito, pasos completados y respuestas correctas.
- **Amber (50–950)**: Identidad visual del simulador de examen, temporizadores y llamadas de advertencia.
- **Rose (50–950)**: Respuestas incorrectas, errores y acciones destructivas de borrado.
- **Sky (50–950)**: Notas técnicas y avisos informativos.

### Mapeo Semántico (`src/styles/themes.css`)

| Token Semántico | Modo Claro (Light) | Modo Oscuro (Dark) | Uso Principal |
|---|---|---|---|
| `--bg` | `slate-50` | `slate-950` | Fondo general de la aplicación |
| `--surface` | `#ffffff` | `slate-900` | Tarjetas, paneles elevados y diálogos |
| `--surface-muted` | `slate-100` | `slate-800` | Fondos de chips, bloques inactivos y cabeceras |
| `--text` | `slate-900` | `slate-50` | Texto principal de alto contraste (WCAG AAA) |
| `--text-muted` | `slate-600` | `slate-400` | Subtítulos, metadatos y descripciones secundarias |
| `--border` | `slate-200` | `slate-800` | Separadores y bordes de componentes |
| `--border-strong`| `slate-300` | `slate-700` | Bordes interactivos y cajas de código |
| `--primary` | `azure-600` | `azure-500` | Botones primarios y elementos activos |
| `--primary-text` | `azure-700` | `azure-400` | Texto primario accesible |
| `--success` | `emerald-600`| `emerald-500`| Estados completados |
| `--warning` | `amber-500`  | `amber-400`  | Simuladores y cuentas atrás |
| `--danger` | `rose-600`   | `rose-500`   | Errores y acciones irreversibles |

---

## 3. Catálogo de Componentes UI (`src/app/shared/ui/`)

### 1. Botón Único (`app-button`)
Componente accesible con variantes visuales y tamaños normalizados:
- **Variantes**:
  - `primary`: Acción principal azul con texto blanco.
  - `secondary`: Superficie neutra con borde sutil.
  - `ghost`: Sin borde ni fondo hasta el hover.
  - `warning`: Botón ámbar para inicio de simulacros.
  - `destructive`: Botón rojo para reseteo o borrado de progreso.
  - `link`: Aspecto textual para enlaces inline.
- **Tamaños**:
  - `sm`: Altura 32 px (acciones en tablas o barras de herramientas).
  - `md`: Altura 40 px (tamaño predeterminado).
  - `lg`: Altura 48 px (botones de llamada a la acción principales).
  - `icon`: 40 × 40 px (botones de icono cuadrado accesible).
- **Estados**:
  - `loading`: Muestra un spinner animado e inhabilita clics.
  - `disabled`: Reducción de opacidad y `pointer-events: none`.

### 2. Contenedor (`app-container`)
- `size="normal"`: Ancho máximo de 1200 px con padding horizontal adaptativo.
- `size="wide"`: Ancho máximo de 1440 px para visor de diapositivas 16:9 y mapa mental.

### 3. Insignia (`app-badge`)
- Altura fija inmutable de **24 px**.
- Variantes: `primary`, `success`, `warning`, `danger`, `info`, `neutral`.
- Parámetro `[dot]="true"` para mostrar indicador de estado circular.

### 4. Pestañas (`app-tabs`)
- Componente de navegación accesible por teclado (soporte de flechas `←` y `→`).
- Respeto del atributo `aria-selected` y gestión de foco nativo.

### 5. Tarjetas y Paneles
- Elevación mediante sombras sutiles tokenizadas (`--shadow-xs`, `--shadow-md`).
- Borde estándar de 1 px con radio consistente (`--radius-xl` a `--radius-2xl`).

---

## 4. Accesibilidad (A11y - WCAG 2.1 AA)

- **Contraste de Color**: Mínimo 4.5:1 para texto normal y 3:1 para controles e iconos, verificado automáticamente por `@axe-core/playwright`.
- **Foco Visible**: Todos los elementos interactivos disponen de un contorno de foco de alto contraste (`:focus-visible`) que nunca es suprimido.
- **Navegación por Teclado**:
  - Atajo global `Ctrl+K` o `/` para abrir la paleta de búsqueda.
  - Flechas de teclado para cambiar diapositivas (`←` y `→`).
  - Tecla `F` para activar pantalla completa y `Escape` para cerrarla.
  - Enlaces de salto directo al contenido principal (`.skip-link`).
- **Respeto a Preferencias**: Detección automática del tema del sistema (`prefers-color-scheme`) y persistencia de elección manual en `localStorage`.
