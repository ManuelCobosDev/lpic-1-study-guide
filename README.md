# LPIC-1 Study Guide · Aula Interactiva GNU/Linux

> Aplicación web moderna **100% cliente (SPA en Angular)** para la preparación integral y certificación de los exámenes oficiales del Linux Professional Institute: **LPIC-1 Exam 101-500** y **LPIC-1 Exam 102-500**.

![Licencia](https://img.shields.io/badge/licencia-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-21.1-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Tests](https://img.shields.io/badge/tests-Karma%20%7C%20Vitest%20%7C%20Playwright-brightgreen.svg)
![Accesibilidad](https://img.shields.io/badge/WCAG-2.1%20AA%20(Axe%200%20errores)-success.svg)

---

## 🎯 Características Principales

- **Temario Oficial Completo (100% Cobertura Real, 0 Placeholders)**:
  - **42 subtemas oficiales** distribuidos en 10 temas: 4 temas para el Examen 101 (Temas 101 a 104) y 6 temas para el Examen 102 (Temas 105 a 110).
  - **770 diapositivas interactivas** con diseño 16:9 escalado, bloques didácticos de alta densidad (código con resaltado de sintaxis, terminales simuladas, llamadas de examen, tablas comparativas y diagramas vectoriales).
  - **Triple formato de estudio**: modo Diapositivas con atajos de teclado (`←`, `→`, `F` pantalla completa, `T` miniaturas), vista Web continua de lectura y exportación limpia para impresión / PDF.
  - **Auto-vinculación contextual**: popovers informativos estilo Wikipedia al pulsar sobre comandos y términos técnicos dentro del texto.

- **42 Laboratorios Guiados con Terminal Debian 12**:
  - **131 misiones paso a paso** con instrucciones, órdenes reproducibles para máquina virtual Debian 12 (Bookworm), salidas esperadas y botón de copiado rápido al portapapeles.
  - Seguimiento de progreso por paso, banner descartable de entorno y diálogo de celebración al finalizar la práctica.

- **Simulador Oficial de Examen LPIC-1**:
  - Banco de **240 preguntas reales** (120 de cada examen) con tipología de opción única (`single`), opción múltiple (`multiple`) y respuesta abierta (`fill`).
  - **Modo Oficial Cronometrado**: 60 preguntas ponderadas según pesos del LPI, cuenta atrás sincronizada de 90 minutos y puntuación oficial entre 200 y 800 puntos (aprobado a partir de 500).
  - **Modo Práctica Libre**: sin límite de tiempo, filtros avanzados por tema y justificación didáctica oficial inmediata.
  - Resistencia a recargas: temporizador persistido basado en timestamps reales y posibilidad de reanudar sesiones en curso.

- **Herramientas de Estudio Avanzadas**:
  - **Buscador Global Unificado**: paleta modal accesible (`Ctrl+K` o `/`) y página dedicada `/buscar` con búsqueda difusa sinónima, acentos transparentes y resaltado con `<mark>`.
  - **Catálogo de 193 Comandos**: búsqueda instantánea, filtros por tema/categoría, vista dual (tabla / tarjetas) y paneles expandibles con flags y sintaxis.
  - **Glosario de 230 Términos Técnicos**: navegación alfabética interactiva A-Z con indicador de disponibilidad de términos y enlaces al temario.
  - **42 Mazos de Flashcards**: algoritmo de repetición espaciada Leitner (cajas 1 a 5) con evaluación subjetiva (Bien / Difícil / Repetir) y persistencia local.
  - **Mapa Mental Jerárquico D3**: visualización en árbol SVG con zoom, paneo interactivo, filtro de pendientes y panel lateral de navegación.
  - **Panel de Progreso y Métricas**: tarjetas de estado, desglose por temas con anillos porcentuales, historial de simulacros con gráfica de evolución y mapa de calor de estudio (heatmap de 12 semanas).

- **Persistencia Segura y Privacidad**:
  - **100% del lado del cliente**: sin backend, sin cookies invasivas ni telemetría.
  - Centro de copias de seguridad en `/ajustes`: exportar e importar datos en JSON con verificación de suma de comprobación (SHA-256) y opción de reversión inmediata.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Framework** | Angular (Standalone Components, Signals, OnPush Change Detection, New Control Flow `@if/@for`) |
| **Lenguaje** | TypeScript estricto sin `any` ni `@ts-ignore` |
| **Estilos** | CSS moderno con Custom Properties semánticas, paleta Slate/Azure y soporte Dark/Light Theme |
| **Validación de Datos** | Zod (esquemas de lecciones, labs, preguntas, comandos y glosario) |
| **Visualización** | D3.js (árbol jerárquico SVG y zoom) |
| **Buscador** | MiniSearch (motor de búsqueda en memoria con tokenización en español) |
| **Pruebas Unitarias** | Angular Karma / Jasmin + Vitest para scripts de toolchain |
| **Pruebas E2E & A11y** | Playwright + `@axe-core/playwright` (WCAG 2.1 AA sin violaciones) |

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js versión 20 o superior.
- npm versión 10 o superior.

### 1. Clonar e Instalar
```bash
git clone https://github.com/usuario/lpic-1-study-guide.git
cd lpic-1-study-guide
npm install
```

### 2. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:4200/`.

### 3. Pipeline de Verificación Riguroso (Gate de Calidad)
Ejecuta con un único comando la validación completa en 9 etapas (contenido, tipos, linteo, tokens, fronteras, tests unitarios, build de producción y tests E2E):
```bash
npm run verify
```

---

## 📂 Scripts del Proyecto

| Comando | Propósito |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Angular en `localhost:4200`. |
| `npm run build` | Compila la aplicación para producción en `dist/lpic1-study-guide/browser/` y genera `404.html`. |
| `npm run preview` | Sirve la compilación estática de producción localmente para pruebas de despliegue. |
| `npm run verify` | Ejecuta las 9 etapas de control de calidad obligatorio. |
| `npm run typecheck` | Comprueba tipos estrictos en la aplicación, tests y scripts (`tsc --noEmit`). |
| `npm run lint` | Ejecuta ESLint con reglas de fronteras arquitectónicas. |
| `npm run test` | Ejecuta los tests unitarios con Karma y Vitest. |
| `npm run e2e` | Ejecuta la suite completa de pruebas end-to-end con Playwright. |
| `npm run build:content` | Compila y valida el contenido de `content-src/` hacia `public/content/`. |
| `npm run import:legacy` | Orquestador reproducible e idempotente para reimportar todo el contenido original. |
| `npm run new:subtopic -- <id> "<título>"` | Genera un subtema nuevo y lo compila sin necesidad de tocar componentes Angular. |
| `npm run check:tokens` | Comprueba que ningún color literal escape a los tokens CSS. |
| `npm run check:boundaries` | Verifica que se respeten las fronteras de importación entre capas. |
| `npm run check:stubs` | Audita que no existan páginas pendientes de implementar. |

---

## 📖 Arquitectura y Documentación

Para consultar los detalles técnicos del diseño y desarrollo del proyecto, revisa los manuales canónicos en la carpeta `docs/`:
- **[Arquitectura del Sistema](docs/ARCHITECTURE.md)**: Estructura de capas, inmutabilidad, stores persistidos y motores desacoplados de UI.
- **[Sistema de Diseño](docs/DESIGN_SYSTEM.md)**: Tokens CSS, paleta de colores, primitivas (`app-button`, `app-container`), tipografía y accesibilidad.
- **[Guía de Formato de Contenido](docs/CONTENT_GUIDE.md)**: Especificación y ejemplos copiables de cada bloque didáctico, diapositiva y diagrama vectorial.
- **[Guía de Despliegue Estático](docs/DEPLOY.md)**: Despliegue en GitHub Pages, Netlify, Cloudflare Pages, Vercel o servidores Nginx.
- **[Memoria del Proyecto](docs/agent/STATUS.md)**: Historial de fases, registro de decisiones de arquitectura ([DECISIONS.md](docs/agent/DECISIONS.md)) y changelog acumulativo ([CHANGELOG.md](docs/agent/CHANGELOG.md)).

### 📁 Estructura del Repositorio

- `src/` — Código fuente de la SPA Angular (arquitectura por capas: core, shared, features).
- `public/` — Activos web estáticos y contenido compilado (`public/content/`).
- `content-src/` — Fuente de verdad canónica del currículo (lecciones, labs, preguntas, glosario, comandos).
- `docs/` — Especificaciones funcionales, técnicas (`docs/spec/`) y memoria del agente (`docs/agent/`).
- `scripts/` — Herramientas de toolchain en TypeScript (compilación de contenido, linters, verificadores).
- `e2e/` — Suites de integración E2E con Playwright y capturas de evidencia visual.
- `.agents/` — Reglas y skills operativas del asistente de ingeniería.
- `_legacy/` — Material y manuales oficiales de referencia histórica (solo lectura).

---

## ⚖️ Descargo de Responsabilidad

LPIC-1® y Linux Professional Institute® son marcas registradas de Linux Professional Institute, Inc. Este proyecto es una herramienta de estudio independiente creada con fines pedagógicos y no está patrocinado, avalado ni afiliado oficialmente a Linux Professional Institute.

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).
