---
trigger: always_on
---

# Reglas no negociables (siempre activas)

Proyecto: web Angular 100% cliente para preparar LPIC-1. Especificación completa en `docs/spec/` (lee solo la parte que toque). Si rompes una de estas reglas, la tarea no cuenta como hecha.

## Calidad
- **R1. Nada de maquetas.** Si una ruta existe, funciona con las interacciones especificadas. Una pantalla con plantilla genérica o botones sin acción no está implementada. La única excepción son los *stubs* de la Fase 0: usan `NotImplementedPage`, están en la tabla de stubs de `docs/agent/STATUS.md` y nunca se disfrazan de página real.
- **R2. Gate obligatorio.** Cada fase termina con `/verificar-gate`. Si algo falla, se arregla; no se avanza. Tras un gate en verde, DETENTE y espera al usuario.
- **R3. Prohibido debilitar controles.** Sin `any`, `@ts-ignore`, `eslint-disable` (salvo una línea justificada), sin `skipLibCheck`/`ignoreBuildErrors` ni flags equivalentes para tapar errores propios, sin `--force`. No modifiques un test para que pase salvo que el test sea incorrecto, y entonces lo explicas en `DECISIONS.md`.
- **R4. Veracidad.** Nunca afirmes que algo funciona sin haberlo ejecutado en esta sesión. Cada afirmación de `STATUS.md` enlaza a un archivo y a un test. Si un comando no existe o falla, el resultado es FALLO, no "pendiente".
- **R5. Mira el resultado.** Antes de dar una tarea de UI por hecha, ábrela en el navegador (herramienta de navegador o Playwright con captura) y revisa la imagen. Los tests en verde no sustituyen a mirar.
- **R6. Cero cifras escritas a mano.** Todo contador sale del manifiesto generado. Cero colores literales fuera de `src/styles/tokens.css` y `themes.css`.

## Alcance y seguridad
- **R7. Alcance MVP.** Haz lo especificado y nada más. Ideas extra → `docs/agent/BACKLOG.md`.
- **R8. Zonas protegidas.** `_legacy/` y `reference/` son SOLO LECTURA: nunca crees, edites ni borres nada ahí. No edites `.agents/` ni `docs/spec/` salvo petición expresa del usuario.
- **R9. Comandos peligrosos.** Pide confirmación antes de `rm -rf`/`Remove-Item -Recurse`, `git reset --hard`, `git clean`, `git push --force`, instalar herramientas globales o tocar algo fuera de este repositorio. Nunca hagas `git push` sin que te lo pidan.
- **R10. Si te bloqueas** (dependencia que no instala, versión incompatible, contenido ambiguo), detente, descríbelo en `STATUS.md` y pregunta. No sustituyas funcionalidad por una maqueta ni inventes contenido.
- **R11. Contenido.** El contenido del curso se **importa** del legacy con scripts reproducibles; no se inventa ni se copia a mano. Lo que falte se rellena con `placeholder: true` visible.

## Idioma y formato de informe
- Interfaz en español; código e identificadores en inglés; comentarios breves en español.
- Al terminar una fase informa SIEMPRE así: (1) qué se hizo, (2) salida resumida de `npm run verify`, (3) rutas de las capturas, (4) qué NO está hecho o es deuda conocida.
