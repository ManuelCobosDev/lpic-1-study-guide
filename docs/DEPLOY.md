# Guía de Despliegue Estático y Operaciones

Esta guía detalla el proceso de compilación, empaquetado y puesta en producción de **LPIC-1 Study Guide** como aplicación estática 100% cliente (SPA), lista para ser alojada en cualquier servidor web o CDN sin necesidad de infraestructura de backend ni base de datos.

---

## 1. Arquitectura de Distribución

El proyecto sigue una arquitectura estática pura generada con Angular 19 y Node/TypeScript:
- **Build unificado**: `npm run build` ejecuta la compilación de producción de Angular (`ng build --configuration production`), generando bundles optimizados con hashing de contenido en los nombres de archivo (`main-[hash].js`, etc.).
- **Procesamiento post-compilación**: `scripts/postbuild.ts` se invoca de manera automática al finalizar el build para generar `dist/lpic1-study-guide/browser/404.html` clonando `index.html`. Esto permite resolver rutas dinámicas del lado del cliente en proveedores que usan el archivo `404.html` como fallback SPA (como GitHub Pages).
- **Assets de contenido**: Los manifiestos JSON (`manifest.json`, `exam-101.json`, etc.) y las lecciones compiladas residen en `public/content/` y se copian íntegramente al directorio de distribución `dist/lpic1-study-guide/browser/content/`.

---

## 2. Preparación y Compilación

Antes de desplegar, verifica la integridad del repositorio y compila los artefactos de producción:

```powershell
# 1. Validar suite completa de pruebas, tipos y lint
npm run verify

# 2. Compilar artefactos optimizados para producción
npm run build
```

El directorio resultante para despliegue es:
```
dist/lpic1-study-guide/browser/
```

---

## 3. Opciones de Alojamiento Estático

### 3.1. GitHub Pages
1. **Ruta base**: Si el repositorio se aloja bajo un subdirectorio (p. ej. `https://usuario.github.io/lpic-1-study-guide/`), construye con `--base-href`:
   ```bash
   npx ng build --configuration production --base-href /lpic-1-study-guide/
   ```
2. **Fallback de rutas SPA**: El script `postbuild.ts` ya crea `404.html`. GitHub Pages servirá este archivo ante cualquier recarga en rutas profundas como `/leccion/103.4`, permitiendo que el router de Angular restaure la URL sin error.
3. **GitHub Actions**: Configura un workflow estándar en `.github/workflows/deploy.yml` subiendo `dist/lpic1-study-guide/browser/` a GitHub Pages.

### 3.2. Netlify
- **Build command**: `npm run build`
- **Publish directory**: `dist/lpic1-study-guide/browser`
- **Fallback SPA**: Crea un archivo `public/_redirects` (o en la raíz del output):
  ```text
  /*    /index.html   200
  ```

### 3.3. Cloudflare Pages
- **Build command**: `npm run build`
- **Output directory**: `dist/lpic1-study-guide/browser`
- **SPA Fallback**: Configurado automáticamente en Cloudflare Pages, o mediante una regla de transformación en `_routes.json`.

### 3.4. Vercel
- **Framework Preset**: Angular / Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist/lpic1-study-guide/browser`
- **Configuración SPA (`vercel.json`)**:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### 3.5. Nginx (Servidor propio o contenedor Docker)
Para servir la aplicación tras un proxy inverso Nginx o en un contenedor Alpine minimalista:

```nginx
server {
    listen 80;
    server_name lpic1.midominio.com;
    root /usr/share/nginx/html/dist/lpic1-study-guide/browser;
    index index.html;

    # Compresión Gzip para JSON y bundles
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Políticas de caché para assets versionados
    location ~* \.(?:css|js|woff2?|svg|png|jpg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Políticas de caché para manifiestos de contenido (revalidación rápida)
    location ~* \.json$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600, must-revalidate";
    }

    # Enrutamiento SPA: reenvía todo lo no encontrado a index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

---

## 4. Políticas de Caché y Rendimiento

| Recurso | Patrón / Ubicación | Política de Encabezado `Cache-Control` | Justificación |
|---|---|---|---|
| HTML principal | `index.html`, `404.html` | `no-cache` | Permite detectar de inmediato nuevas versiones de la aplicación. |
| Bundles JS/CSS | `*.js`, `*.css` (con hash) | `public, max-age=31536000, immutable` | Nombres con hash inmutables; rendimiento de carga instantáneo. |
| Fuentes y SVGs | `assets/fonts/*`, `*.svg` | `public, max-age=31536000, immutable` | Recursos estáticos que rara vez cambian. |
| Contenido JSON | `content/**/*.json` | `public, max-age=3600, must-revalidate` | Asegura que actualizaciones en lecciones o glosarios se sincronicen en menos de 1 hora. |

---

## 5. Soporte PWA y Modo Offline

La aplicación está diseñada para operar con independencia de la conectividad:
1. **Almacenamiento Local**: Todo el progreso del usuario, notas, flashcards, marcadores y configuraciones se guardan localmente en `localStorage` mediante `PersistedStore`.
2. **Caché de Recursos**: El bundle inicial comprimido es inferior a 115 kB gzip. Una vez cargado el temario y las lecciones deseadas, el navegador almacena en caché los assets HTTP, permitiendo estudiar de forma autónoma sin conexión permanente a internet.
3. **Exportación e Importación**: El usuario puede respaldar en cualquier momento su progreso completo mediante la herramienta de Copia de Seguridad JSON integrada en `/progreso`.
