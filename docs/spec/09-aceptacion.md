# 9. ACEPTACIÓN FINAL · GUION DE DEMO (automatizado en `e2e/demo.spec.ts`)

El MVP está terminado solo si este guion pasa de principio a fin con el contenido real importado:

1. Home → "Empezar" → abro 103.4 en diapositivas → pulso `F` → recorro con el teclado → salgo con `Esc` → el progreso y la última diapositiva se guardan.
2. Cambio a vista Web (aterrizo en la sección equivalente, con índice lateral) y a PDF; imprimo el documento (saltos de página correctos, diagramas nítidos).
3. Escribo el nombre de un comando en el buscador: aparecen comando, diapositivas, práctica y término; abro una diapositiva y el término aparece resaltado.
4. Marco 103.4 como completado, hago su práctica y un simulacro; veo resultados por tema y temas débiles.
5. Reviso `/progreso`, exporto la copia, borro todo, importo la copia (con vista previa) y todo vuelve; pruebo "Deshacer importación".
6. Alterno claro/oscuro en todas las pantallas sin colores rotos ni texto ilegible.
7. `npm run verify` termina en verde con una sola orden y el build estático se sirve con `npm run preview`.
8. Ningún título truncado, ningún botón fuera de `app-button`, ningún color fuera de tokens, ninguna cifra escrita a mano, tarjetas hermanas de igual altura, cero stubs.

**Si alguno de estos puntos falla, el MVP no está terminado y `STATUS.md` lo dice.**
