# 5. SISTEMA DE DISEÑO (todo por variables CSS en `src/styles/tokens.css`)

`check:tokens` recorre **todo `src/`** y falla con cualquier color literal (`#hex`, `rgb(`, `hsl(`) o clase Tailwind de color arbitrario fuera de `tokens.css`/`themes.css`. Debe tener un test que demuestre que detecta una violación.

## 5.1 Paleta
- **Azure (primario)**: 50 #EFF4FF · 100 #DBE6FE · 200 #BFD3FE · 300 #93B4FD · 400 #6090FA · 500 #3B6CF6 · 600 #2550EB · 700 #1D40D8 · 800 #1E36AF · 900 #1E3389
- **Slate (neutros)**: 0 #FFFFFF · 25 #F8FAFC · 50 #F1F5F9 · 100 #E2E8F0 · 200 #CBD5E1 · 300 #94A3B8 · 400 #64748B · 500 #475569 · 600 #334155 · 700 #1E293B · 800 #0F172A · 900 #0B1220
- **Emerald (SOLO completado/correcto)**: 50 #ECFDF5 · 100 #D1FAE5 · 500 #10B981 · 600 #059669 · 700 #047857
- **Amber (SOLO simulador/examen/avisos)**: 50 #FFFBEB · 100 #FEF3C7 · 400 #FBBF24 · 500 #F59E0B · 600 #D97706 · 700 #B45309
- **Rose (SOLO error/incorrecto/destructivo)**: 50 #FFF1F2 · 100 #FFE4E6 · 500 #F43F5E · 600 #E11D48 · 700 #BE123C
- **Sky (SOLO información)**: 50 #F0F9FF · 100 #E0F2FE · 500 #0EA5E9 · 600 #0284C7 · 700 #0369A1

## 5.2 Tokens semánticos (claro → oscuro)
`--bg` slate-25 → #0B1220 · `--surface` #FFFFFF → #111A2E · `--surface-elevated` #FFFFFF → #16213A · `--surface-muted` slate-50 → #0F1830 · `--border` slate-100 → #1F2A44 · `--border-strong` slate-200 → #2B3A5C · `--text` slate-800 → #E6EDF7 · `--text-muted` slate-500 → #A5B3CC · `--text-subtle` slate-400 → #8493AE · `--primary` azure-600 → azure-500 · `--primary-hover` azure-700 → azure-400 · `--primary-soft` azure-50 → rgba(59,108,246,.14) · `--primary-text` azure-700 → azure-300 · `--ring` azure-500 · y la familia `--success/-soft/-text`, `--warning/...`, `--danger/...`, `--info/...`. Contraste ≥ 4,5:1 en ambos temas (lo verifica el test axe).

**Semántica de color estricta**: azul = acción/navegación · verde = completado/correcto · ámbar = simulador/examen/aviso · rojo = error/incorrecto/destructivo · sky = información · gris = pendiente/próximamente. Los iconos decorativos son neutros salvo que expresen estado.

## 5.3 Tipografía, espaciado, radios, sombras, capas
- Inter (UI) y JetBrains Mono (códigos, comandos, `103.4`, kbd). Escala: Display 44/52 · H1 32/40 · H2 24/32 · H3 18/26 · Body 15/24 · Small 13/20 · Caption 12/16 mayúsculas con tracking .06em. **Mínimo 12 px** en la UI. Diapositivas (lienzo 1280×720): título 40/48, cuerpo 24/36, código 20/30, mínimo 18.
- Espaciado en múltiplos de 4 (4, 8, 12, 16, 24, 32, 48, 64, 96). Separación entre secciones de página 64.
- Radios: 6 · 8 (botones, chips) · 12 (filas, inputs) · 16 (tarjetas) · 20 (bandas) · 999 (pills).
- Sombras: sm `0 1px 2px rgba(15,23,42,.06)` · md `0 4px 16px rgba(15,23,42,.08)` · lg `0 12px 32px rgba(15,23,42,.12)` (en oscuro: sin sombra, borde más marcado). z-index: sticky 20, header 30, dropdown 40, dialog 50, toast 60, fullscreen 70.
- Movimiento 150–200 ms ease-out; respetar `prefers-reduced-motion`.
- Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536.
- **Container único** (`shared/ui/container`): max-width 1200 px (1440 px en `/estudiar` y `/mapa-mental`), padding lateral 24 (16 en móvil). Header, breadcrumbs, contenido y footer usan **el mismo contenedor** para que queden alineados.

## 5.4 Botón (un único componente `app-button`; ningún botón ad hoc en el proyecto)
- **Variantes**: `primary` (fondo `--primary`, texto blanco) · `secondary` (outline `--border-strong`, fondo `--surface`) · `ghost` · `warning` (fondo amber-500, texto slate-900; solo simulador) · `destructive` (rose-600; solo borrar/reiniciar) · `link`.
- **Tamaños**: sm 32 px (texto 13) · md 40 (14, por defecto) · lg 48 (15, CTAs) · icon 40×40 (`aria-label` obligatorio). En móvil, los CTAs pasan a lg (≥ 44 px táctiles).
- Radio 8, peso 600, gap 8, iconos 16/18 px alineados al centro, padding horizontal 16 (md) / 20 (lg).
- **Estados**: default, hover, active, `:focus-visible` (outline 2 px `--ring`, offset 2), disabled (opacidad .5, sin hover, `cursor:not-allowed`), loading (spinner, bloquea clic). Admite `routerLink`.
- Un único CTA primario por pantalla. Toda acción destructiva pasa por un diálogo de confirmación.

## 5.5 Otras primitivas (todas en `shared/ui`, documentadas en `/guia-estilos`)
- **Badge** (24 px de alto fijo, `inline-flex items-center`, padding horizontal 10, texto 12/600, radio 999; variantes neutral/primary/success/warning/danger/info) — **no puede deformarse**; test visual en `/guia-estilos`.
- **Chip** (28 px, seleccionable) · **Card** (borde 1 px, radio 16, padding 24, variante clicable con hover borde primario y `translateY(-2px)`) · **Input/Select/Textarea** (40 px, radio 12, foco con ring, error con borde danger y mensaje 13 px) · **Tabs** (subrayado 2 px) · **SegmentedControl** · **Tooltip** (300 ms) · **Dialog/Sheet** (CDK, focus-trap, Esc) · **Toast** · **ProgressBar** (6 px) · **ProgressRing** · **Skeleton** · **Accordion** · **Menu** · **Kbd** · **EmptyState** · **StatCard** · **CodeBlock** (lenguaje, copiar, líneas resaltadas) · **Callout** (barra lateral 3 px + icono) · **DataTable** (cabecera sticky, filas 48 px) · **Pagination**.
- **Reglas de layout**: tarjetas hermanas de igual altura (grid stretch) y pies anclados abajo (`flex-col` + `margin-top:auto`); **ningún título truncado con puntos suspensivos** (se permiten 2 líneas).
- **`/guia-estilos`** muestra paleta con ratio de contraste, tipografía, todas las variantes y estados de botón, badges, inputs, tarjetas, tabs, callouts, tabla, diálogos y los 7 tipos de diagrama con datos de ejemplo. Se enlaza en el footer solo si `site.config.showDesignSystem` es `true`.

---
