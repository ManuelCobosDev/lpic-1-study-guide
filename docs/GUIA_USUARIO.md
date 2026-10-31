# Guía paso a paso (para ti, Manuel)

Esta guía es para ti, no para el agente. Explica cómo preparar el repo, configurar Antigravity y en qué orden darle los prompts.

## 1. Qué trae este paquete

| Pieza | Para qué sirve |
|---|---|
| `AGENTS.md` | Punto de entrada que el agente lee siempre. Corto: dice dónde está todo. |
| `.agents/rules/` (4 reglas) | Normas siempre activas: `00` reglas no negociables · `10` memoria y registro · `20` entorno Windows · `30` convenciones Angular (se carga solo cuando toca código). |
| `.agents/skills/` (7 skills) | Procedimientos que se invocan con `/nombre`: `/iniciar-sesion` · `/cerrar-sesion` · `/ejecutar-fase N` · `/verificar-gate N` · `/inventario-legacy` · `/importar-contenido-legacy` · `/registrar-decision`. |
| `docs/spec/` (11 archivos) | La especificación completa, partida por temas para que el agente lea solo lo que toque. |
| `docs/agent/` | Memoria del proyecto: `STATUS.md` (foto actual), `CHANGELOG.md` (historial de cada cambio, solo se añade), `DECISIONS.md`, `BACKLOG.md`. |
| `.gitignore` / `.gitattributes` | Excluyen `_legacy/` y `reference/` del repo; finales de línea LF. |

**Por qué está partido así**: Antigravity trunca cada regla a 24.000 bytes y reparte un presupuesto de 20.000 tokens entre todas las reglas siempre activas. El prompt maestro de 58 KB no cabía. Ahora las reglas son cortas y la especificación se lee bajo demanda. Además, los *workflows* de Antigravity dejaron de funcionar el 19 de octubre de 2026; los procedimientos son skills y se invocan igual, con `/nombre`.

## 2. Preparar las carpetas (PowerShell, una sola vez)

```powershell
# 1) Desempaqueta el paquete en el repo nuevo
Expand-Archive "$env:USERPROFILE\Downloads\lpic1-starter-pack.zip" -DestinationPath "D:\Github\lpic-1-study-guide" -Force

# 2) COPIA (no muevas) el material antiguo dentro de _legacy
robocopy "D:\Github\LPIC-1\lpic1-slides-publico" "D:\Github\lpic-1-study-guide\_legacy\slides-publico" /E /XD node_modules .git __pycache__
robocopy "D:\Github\LPIC-1\Recurso Final Definitivo" "D:\Github\lpic-1-study-guide\_legacy\recurso-final" /E /XD node_modules .git __pycache__ .venv venv

# 3) Prototipo v0 como referencia visual
New-Item -ItemType Directory "D:\Github\lpic-1-study-guide\reference\v0-react" -Force | Out-Null
Expand-Archive "C:\Users\Manuel\Downloads\arquitectura-lpic-1-web.zip" -DestinationPath "D:\Github\lpic-1-study-guide\reference\v0-react" -Force

# 4) Primer commit
cd D:\Github\lpic-1-study-guide
git status          # NO debe aparecer _legacy ni reference/v0-react
git add .
git commit -m "chore: paquete de arranque del agente [C-0000]"
```

Notas:
- `robocopy` devuelve códigos 0–7 cuando todo va bien (no es un error).
- Los originales no se tocan. Si el tamaño de `_legacy` es enorme (más de 1 GB), avisa antes de seguir.
- Si `D:\Github\lpic-1-study-guide` aún no es un repositorio git, ejecuta `git init` antes del paso 4.
- Opcional: copia tus 4 capturas a `reference\screens\` (esa carpeta sí se versiona).

## 3. Configurar Antigravity (una vez)

1. Abre **solo** `D:\Github\lpic-1-study-guide` como workspace.
2. Comprueba que ve las reglas y skills: en el panel del agente abre el menú `…` → **Customizations**, o pregúntale "¿Qué skills tienes?". Debes ver las 7 skills y las reglas. Si una regla no aparece, su cabecera (`---` / `trigger:`) está mal: según la documentación, una regla con frontmatter inválido se descarta en silencio.
3. Si el agente dice que no ve `_legacy/`, es porque está en `.gitignore`: busca en los ajustes la opción de acceso del agente a archivos ignorados por git (el nombre exacto puede variar) y actívala.
4. Recomendado al principio: ejecución de comandos de terminal **pidiendo confirmación** (no "siempre proceder") hasta que veas cómo se porta; modo **Planning** para las fases; y el navegador conectado para que pueda abrir la app y mirar capturas.
5. Usa el modelo más capaz disponible en las fases grandes (0, 2, 5, 8) y uno rápido para tareas pequeñas.
6. **Una conversación nueva por fase.** La memoria no depende de la conversación, sino de los archivos.

## 4. Cómo se mantiene la memoria

El agente pierde contexto entre conversaciones y al compactarse. Por eso hay cuatro mecanismos:

1. **`STATUS.md`**: foto del estado (fase, siguiente paso exacto, stubs, bloqueos). Se reescribe tras cada tarea.
2. **`CHANGELOG.md`**: una entrada `C-NNNN` por cada tarea (qué, por qué, archivos, verificación real, deuda). Solo se añade; nunca se reescribe.
3. **Git**: un commit por tarea con `[C-NNNN]` en el mensaje y una etiqueta `fase-N-ok` por fase superada. Recuperar una entrada: `git log --grep "C-0007"`.
4. **Skills `/iniciar-sesion` y `/cerrar-sesion`**: leer la memoria al empezar y escribirla al terminar. La regla `10` obliga al agente a usarlas.

Tu comprobación de 30 segundos tras cada sesión:
```powershell
git log --oneline -10
Get-Content docs\agent\CHANGELOG.md -Tail 15
```
Si el agente hizo cosas y no hay entrada ni commit, dile: `/cerrar-sesion`.

## 5. Orden de los prompts (copia y pega)

### Prompt 0 · Esqueleto Angular (Fase 0)
```
Ejecuta /iniciar-sesion. Después ejecuta /ejecutar-fase 0.
Antes de programar enséñame el plan de tareas. Al terminar cada tarea usa /cerrar-sesion; al final usa /verificar-gate 0 y detente.
```
**Tú compruebas (5 min)**: `npm install` → `npm run verify` (verde) → `npm start`. En el navegador: se ve el header y el footer; el botón de tema oscuro funciona y **sigue oscuro al recargar**; cada ruta del menú abre una página que dice "Pendiente: Fase N" (ninguna da 404). Mira el árbol de carpetas: cada carpeta principal tiene su `README.md`. Mira `CHANGELOG.md` y `git log`.

### Prompt 1 · Inventario del material antiguo (Fase 1)
```
Nueva sesión. Ejecuta /iniciar-sesion y después /ejecutar-fase 1 (inventario del legacy, solo lectura).
No escribas código de la app. Cuando termines dame el informe y tus preguntas abiertas.
```
**Tú haces**: lees `docs/agent/INVENTARIO_LEGACY.md`, respondes a sus preguntas y eliges la estrategia (A convertir / B incrustar HTML / C híbrida). Después:
```
Registra mi decisión con /registrar-decision como D-004: <tu decisión y tus razones>. Después /cerrar-sesion.
```

### Prompts siguientes (Fases 2 a 12)
Todos con la misma plantilla, **uno por conversación nueva y solo cuando hayas validado la fase anterior**:
```
Nueva sesión. /iniciar-sesion y después /ejecutar-fase N.
```

| Fase | Qué construye | Tú compruebas en 2 minutos |
|---|---|---|
| 2 | Currículo, pipeline de contenido, dominio, tajada real 103.4 | `npm run build:content` genera el manifiesto; existe el subtema 103.4 con contenido tuyo; ejecutar el importador dos veces no cambia nada (`git status`). |
| 3 | Sistema de diseño | Abre `/guia-estilos`: botones, badges (no deformados), tarjetas, claro y oscuro. |
| 4 | Home y Temario | Con el navegador vacío, ningún subtema tiene check verde; los títulos no se cortan; 23 + 19 subtemas. |
| 5 | Lecciones y Estudiar | En `/estudiar/103.4`: flechas del teclado, `F` pantalla completa, vistas Diapositivas/Web/PDF, marcar completado y recargar. |
| 6 | Buscador | `Ctrl+K`, buscar un comando y un código ("103.4"); abre la diapositiva con el término resaltado. |
| 7 | Laboratorios | Marcar pasos, recargar, siguen marcados; copiar comando. |
| 8 | Simulador | Empezar, recargar a mitad (el reloj sigue), finalizar, ver resultados por tema. |
| 9 | Comandos, Glosario, Flashcards | Filtros en la URL; índice A–Z; sesión de flashcards. |
| 10 | Mapa mental, Progreso, Ajustes | **Exportar → borrar todo → importar → todo vuelve.** |
| 11 | Importación completa | `docs/agent/COBERTURA_IMPORT.md` al 100 % o huecos justificados. |
| 12 | Pulido y documentación | `npm run verify` verde, `check:stubs --strict` sin pendientes, guion de demo. |

## 6. Si algo sale mal

| Síntoma | Qué decirle / hacer |
|---|---|
| Dice que terminó pero no funciona | `/verificar-gate N y enséñame la tabla PASS/FAIL con la evidencia.` |
| Hace cosas que no tocaban | `Para. Revierte lo que está fuera del alcance de la fase N (git restore) y anótalo en BACKLOG.md.` |
| Se pierde, repite o contradice lo hecho | Conversación nueva → `/iniciar-sesion`. |
| Tocó `_legacy/`, `reference/`, `.agents/` o `docs/spec/` | `git status`, `git restore <ruta>` y recordarle la regla R8. |
| Desactiva un test o un lint para pasar | Rechaza el cambio: exige `/registrar-decision` con justificación o que arregle la causa (regla R3). |
| Una regla o skill no se aplica | Menú `…` → Customizations; revisa que aparezca. Cabecera inválida = se ignora en silencio. |

## 7. Límites de este paquete (honestidad)

- Lo validé en formato y tamaño (frontmatter correcto, reglas muy por debajo de 24 KB), siguiendo la documentación de Antigravity consultada el 31 de octubre de 2026. **No he podido ejecutarlo dentro de Antigravity.** Si una skill no aparece o falla, dime exactamente qué ves y lo ajusto.
- Antigravity cambia rápido (hace dos semanas retiró los workflows). Si cambia la carpeta de skills o reglas, el contenido sigue sirviendo: solo habría que moverlo.
- No conozco el formato del material antiguo. Por eso la Fase 1 es un inventario y la estrategia de importación se decide con datos, no a ciegas.
