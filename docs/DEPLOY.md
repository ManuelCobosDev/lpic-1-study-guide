# Guía de Despliegue Estático

## Arquitectura de Distribución
La aplicación compila a una SPA estática mediante `npm run build`.
El script `scripts/postbuild.ts` duplica automáticamente `index.html` como `404.html` en el directorio de salida `dist/lpic1-study-guide/browser/` para garantizar el correcto enrutamiento SPA en hosts estáticos.

## Opciones de Despliegue
- **GitHub Pages**: Desplegar la carpeta `dist/lpic1-study-guide/browser`. El archivo `404.html` resuelve el fallback del router de Angular.
- **Netlify**: Directorio de publicación `dist/lpic1-study-guide/browser`. Añadir regla en `_redirects`: `/* /index.html 200`.
- **Cloudflare Pages**: Directorio de salida `dist/lpic1-study-guide/browser` con fallback de SPA activado.
- **Nginx / Servidor propio**: Configurar `try_files $uri $uri/ /index.html;`.

