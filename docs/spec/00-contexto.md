# 0. CONTEXTO Y OBJETIVO

## 0.1 Qué se construye
Una web en **Angular, 100% cliente** (sin backend, sin cuentas) para que cualquier persona se prepare la certificación **LPIC-1** (exámenes 101-500 y 102-500): temario en diapositivas (con pantalla completa), la misma lección en vista web y PDF, laboratorios guiados, simulador de examen, comandos, glosario, flashcards, mapa mental, buscador global y progreso guardado en el navegador y exportable. Debe ser un **MVP funcional y demostrable de principio a fin**, con una arquitectura limpia y escalable.

Este repositorio (`lpic-1-study-guide`) es **nuevo y limpio**: aquí solo entra código nuevo y ordenado.

## 0.2 De dónde viene el contenido (importante)
El contenido del curso **ya existe**, hecho por el autor, en dos carpetas que se han copiado en `_legacy/` (solo lectura):
- `_legacy/slides-publico/` → el HTML y los recursos ya compilados, limpios.
- `_legacy/recurso-final/` → el código fuente, scripts Python, etc. (sucio).
El contenido **no se inventa ni se reescribe**: se **importa** con scripts reproducibles. La fase 1 hace un inventario y el usuario decide la estrategia de importación antes de escribir ningún importador.

## 0.3 El prototipo v0 (descartado)
Existe un prototipo en React generado por otra IA (`reference/`). **No se migra ni se copia código de él.** Sirve solo como referencia visual (colores, tipografía, disposición de la Home). Fallos que ya se midieron y **no deben repetirse**:

1. Estado en memoria que se pierde al recargar (ni siquiera usaba `localStorage`).
2. Enlaces a rutas inexistentes (404) y atajos de teclado que no funcionaban.
3. 10 de 14 rutas eran la misma plantilla genérica.
4. Currículo incorrecto (títulos de subtemas rotando en un array) y cifras escritas a mano.
5. Un check verde en todos los subtemas aunque nada estuviera completado.
6. Controles de calidad huecos (`ignoreBuildErrors`, scripts "test" que no probaban nada, ESLint sin configurar).
7. Documentación que afirmaba funcionalidades inexistentes.
8. Píldoras deformadas y breadcrumbs desalineados con el contenido.

## 0.4 Cómo se trabaja
- Las **reglas siempre activas** están en `.agents/rules/`. Los **procedimientos** (iniciar y cerrar sesión, ejecutar una fase, verificar un gate, inventario e importación del legacy, registrar decisiones) están en `.agents/skills/`.
- La **memoria del proyecto** vive en archivos, no en tu contexto: `docs/agent/STATUS.md`, `CHANGELOG.md`, `DECISIONS.md`, `BACKLOG.md`. Git es el historial definitivo.
- El trabajo se hace por **fases con gate** (`08-fases.md`). Tras cada gate te detienes.

## 0.5 Páginas pendientes (stubs): permitidas solo con etiqueta
En la Fase 0 todas las rutas existen para que la navegación y el esqueleto estén completos, pero las que aún no tienen su funcionalidad muestran el componente `NotImplementedPage` ("Pendiente: Fase N") y figuran en la tabla de stubs de `STATUS.md`. `npm run check:stubs` las lista. **Un stub nunca se disfraza de página real**, y la fase de cierre exige 0 stubs.
