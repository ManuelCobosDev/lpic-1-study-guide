# Features
Módulos funcionales de la aplicación organizados por caso de uso (`pages/`, `components/`, `<feature>.routes.ts`).
Las páginas (`pages/`) orquestan servicios; los componentes (`components/`) son presentacionales (`input`/`output`).
Estrictamente prohibido que una feature importe código o componentes de otra feature.
Toda compartición debe residir en `shared` o `core`.

