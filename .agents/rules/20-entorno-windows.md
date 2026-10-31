---
trigger: always_on
---

# Entorno: Windows + PowerShell

El usuario trabaja en Windows. Todo debe funcionar ahí sin WSL.

- Los scripts del proyecto se escriben en **Node/TypeScript** y se invocan con `npm run`. Nada de bash (`rm -rf`, `cp`, `&&` encadenado con sintaxis POSIX, `$(...)`). Rutas con `node:path` (`path.join`), nunca con barras hardcodeadas.
- En PowerShell, entrecomilla las rutas con espacios (por ejemplo `_legacy/recurso-final` sí, pero la carpeta original se llama "Recurso Final Definitivo").
- Finales de línea: `.gitattributes` con `* text=auto eol=lf`. Si ves cambios fantasma de CRLF/LF, corrige la configuración, no reescribas archivos.
- Evita rutas muy largas (límite de 260 caracteres de Windows) en `public/content-assets/`: nombres cortos y en kebab-case.
- Python solo se usa si es imprescindible para leer el material legacy; en ese caso documenta la versión y el comando exacto en `docs/agent/INVENTARIO_LEGACY.md`, y el resultado final debe ser un `content-src/` que se pueda regenerar con `npm run import:legacy`.
- Instala solo dependencias del proyecto (`npm install` en este repo). Nada global sin pedirlo.
