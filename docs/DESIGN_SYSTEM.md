# Sistema de Diseño

## Tokens y Paleta de Color
Todos los colores se configuran exclusivamente mediante variables CSS en `src/styles/tokens.css` y tokens semánticos en `src/styles/themes.css`.
- **Azure**: Color primario para acciones principales, interactividad y navegación.
- **Slate**: Escala de neutros para fondos, superficies, bordes y textos.
- **Emerald**: Reservado exclusivamente para estados completados y respuestas correctas.
- **Amber**: Reservado exclusivamente para simuladores, exámenes y avisos.
- **Rose**: Reservado exclusivamente para errores, respuestas incorrectas y acciones destructivas.
- **Sky**: Reservado exclusivamente para información.

## Primitivas Clave
- **Botón Único (`app-button`)**: Único componente de botón del proyecto con variantes `primary`, `secondary`, `ghost`, `warning`, `destructive` y `link`, y tamaños `sm` (32px), `md` (40px), `lg` (48px) e `icon` (40×40px).
- **Contenedor Único (`app-container`)**: Ancho estándar de 1200 px (1440 px para estudio y mapa mental) con padding consistente en cabecera, migas, contenido y pie.

