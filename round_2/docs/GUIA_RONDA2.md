# GUÍA RONDA 2 (para ti, Manuel)

Objetivo: arreglar los 6 fallos que viste y dejar el **examen 102 cubierto al 100 % medido** contra `LPI-Learning-Material-102-500-es.pdf`, subtema a subtema, sin avanzar hasta que tú des el visto bueno.

## Qué significa "100 %" aquí (honestidad)
Ninguna herramienta puede garantizar que un resumen "dice lo mismo" que el original. Lo que SÍ se garantiza y se mide:
1. Cada unidad de texto del PDF está mapeada a una diapositiva/ejercicio/laboratorio (o omitida con motivo visible).
2. Cada comando, opción, ruta, variable, valor y sigla del PDF aparece en la app.
3. Una **auditoría independiente** (otra conversación, solo lectura) compara hecho a hecho y da APTO / NO APTO.
4. **Tú** lo revisas con una lista de 5 minutos y escribes `VALIDADO <id>`. Si luego alguien toca ese subtema, la validación se invalida sola.

## 0. Instalar el paquete (una vez)
1. Descomprime `lpic1-ronda2-pack.zip` **encima de la raíz del repo** `D:\Github\lpic-1-study-guide`.
2. **NO sobrescribas** `docs/agent/STATUS.md`, `docs/agent/CHANGELOG.md` ni `docs/agent/DECISIONS.md` (el zip no los trae; si tu descompresor pregunta algo, di que no). Sí está bien sobrescribir `AGENTS.md`, `.agents/rules/20-entorno-windows.md` y `.agents/skills/verificar-gate/SKILL.md`.
3. Comprueba que existe `_legacy/Recurso Final Definitivo/LPI-Learning-Material-102-500-es.pdf`.
4. Instala Python 3 si no lo tienes (se usa solo para leer el PDF). Haz commit: `git add -A && git commit -m "chore: paquete ronda 2"`.
5. **Antes de publicar la web**: el material de LPI tiene licencia CC BY-NC-ND 4.0 (sin obras derivadas ni uso comercial). Úsalo en privado/educación y consulta con learning@lpi.org antes de una publicación pública; el pack ya evita versionar el texto extraído del PDF.

## 1. Cómo trabajar
- **Una conversación nueva por paso.** Empieza siempre con el prompt de abajo. El agente lee su memoria en `docs/agent/`.
- Mira `docs/agent/PROGRESO_R2.md`: es tu tablero.
- Si el agente propone saltarse algo, di "no, sigue la regla 40".

## 2. Pasos de herramientas (en este orden)
Prompts exactos (uno por conversación nueva):
| Paso | Prompt | Qué haces tú al terminar |
|---|---|---|
| R0 | `/ejecutar-paso-r2 R0` | Leer `docs/agent/DIAGNOSTICO_R2.md` |
| R1 | `/ejecutar-paso-r2 R1` | **Validar** `content-src/_extract/102-500/extract-overview.html`: nº de páginas, 6 temas, 19 objetivos y 5 unidades al azar contra el PDF |
| R2 | `/ejecutar-paso-r2 R2` | Nada (son herramientas con tests) |
| R3 | `/ejecutar-paso-r2 R3` | Probar los enlaces (cursor sobre un comando; clic en glosario) |
| R4 | `/ejecutar-paso-r2 R4` | Abrir un subtema y probar "Practica lo aprendido" |
| R5 | `/ejecutar-paso-r2 R5` | Mirar `/flashcards` (cientos de tarjetas, mazos) |
| R6 | `/ejecutar-paso-r2 R6` | Lanzar un simulacro del 102 |
| R7 | `/ejecutar-paso-r2 R7` | Abrir el mapa mental |

## 3. Bucle por subtema (19 veces, en orden)
Orden: 105.1 → 105.2 → 106.1 → 106.2 → 106.3 → 107.1 → 107.2 → 107.3 → 108.1 → 108.2 → 108.3 → 108.4 → 109.1 → 109.2 → 109.3 → 109.4 → 110.1 → 110.2 → 110.3.
1. Conversación nueva: `/procesar-subtema 105.1` → el agente completa el subtema, verifica la cobertura y **se detiene** dándote el informe HTML (`docs/agent/cobertura/105.1.html`).
2. Conversación nueva (contexto limpio, importante): `/auditar-subtema 105.1` → genera `docs/agent/auditorias/105.1.md`. Si es NO APTO, vuelve al paso 1 (el agente corrige) y audita otra vez.
3. Tu revisión (≈5 min): abre el informe HTML → 0 rojos; revisa naranjas y amarillos; busca 3 párrafos al azar del PDF; recorre las diapositivas; prueba el test y las flashcards.
4. Si todo está bien, en una conversación nueva: `VALIDADO 105.1` y a continuación `/registrar-validacion 105.1`. (Solo entonces se puede pedir el 105.2.)
Si no estás conforme, dile qué falta; el agente corrige y repites desde el paso 2.

## 4. Cierre
`/ejecutar-paso-r2 RF`: verificación global (19/19 validados sin cambios, regresión del 101, crawler, accesibilidad).

## 5. Si algo va mal
- *"El agente dice que está al 100 % sin enseñarme números"* → pídele la salida de `npm run verify:coverage -- <id>`.
- *El agente se salta la validación* → recuérdale `.agents/rules/40-cobertura-y-fidelidad.md`.
- *Se llena el contexto* → `/cerrar-sesion` y conversación nueva; la memoria está en archivos.
- *Un subtema validado cambia* → `npm run verify:validations` fallará; hay que volver a auditarlo y validarlo.
- *Python/PyMuPDF no instala* → pide al agente la alternativa `pdfjs-dist` (spec 11 §11.1).
