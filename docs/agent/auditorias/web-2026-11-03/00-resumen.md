# 00 · Resumen Ejecutivo de la Auditoría Integral de lpic1.manuelcobos.dev

**Fecha de ejecución**: 2026-11-03  
**Commit base**: `e2e9d87` (rama `development`)  
**Metodología**: Orquestador + 9 subagentes especializados (A1 a A9) en **Fase 1 (Solo lectura)**  
**Cobertura de pruebas**: Build y suite completa `npm run verify` (10/10 etapas, 98 E2E, 46 Vitest, 377 Karma) en verde; servidor preview local activo a 4 viewports × 2 temas.

---

## 1. Veredicto Global

> [!CAUTION]
> ### Veredicto: **NO APTO PARA DIFUSIÓN PÚBLICA** (en su estado actual)
> 
> Aunque la infraestructura de testing y la arquitectura de software son excelentes (pipeline de 10 etapas en verde, diseño modular, TypeScript estricto), la web contiene **defectos bloqueantes de veracidad, integridad y exactitud pedagógica** que engañan y perjudican directamente al estudiante de LPIC-1. El alumno que estudie con la plataforma actual se encontrará con contenidos fantasma, preguntas oficiales con respuestas invertidas que suspenden al que responde bien, enlaces rotos hacia 404 en flujos clave, y una falsa promesa de funcionamiento offline.

---

## 2. Recuento de Hallazgos por Severidad y Agente

| Agente | Especialidad | Total | P0 (Bloqueante) | P1 (Alto) | P2 (Medio) | P3 (Bajo) |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **A1** | Auditoría visual (352 capturas Playwright) | **12** | 2 | 4 | 4 | 2 |
| **A2** | Navegación, arquitectura y copy | **15** | 3 | 4 | 8 | 0 |
| **A3** | Visor de lecciones (42 lecciones, overflows) | **10** | 2 | 3 | 2 | 3 |
| **A4** | Integridad de contenido y matriz 42×recursos | **15** | 4 | 6 | 4 | 1 |
| **A5** | Exactitud técnica LPI y rigor pedagógico | **10** | 4 | 4 | 2 | 0 |
| **A6** | Sistema de diseño, tokens y CSS | **10** | 1 | 2 | 7 | 0 |
| **A7** | Accesibilidad (Axe), SEO y rendimiento | **15** | 1 | 6 | 7 | 1 |
| **A8** | Herramientas interactivas y casos límite | **11** | 2 | 3 | 6 | 0 |
| **A9** | Higiene del repo, seguridad y dependencias | **7** | 0 | 0 | 3 | 4 |
| **TOTAL** | **Consolidado deduplicado en `hallazgos.json`** | **105** | **19** | **32** | **43** | **11** |

---

## 3. Los 10 Hallazgos Más Críticos (Top P0)

1. **A6-001 / A1-001 (P0)**: **258 bloques `html` invisibles**. `BlockRendererComponent` carece de `@case ('html')` en su switch. Todas las diapositivas de arquitectura, esquemas de capas del SO y tablas ricas de los temas 101–104 quedan en blanco absoluto.
2. **A5-001 (P0)**: **Claves de respuestas invertidas en el simulador**. 7 preguntas oficiales tienen marcada la opción incorrecta como correcta (ej. en `q-103-82`, `echo "${pwd}"` minúscula es dada por buena mientras que `pwd` queda excluida; `q-103-32` penaliza el uso de `-b` para respaldar con `cp`), suspendiendo al alumno que responde correctamente.
3. **A5-002 / A8-004 (P0)**: **Preguntas abiertas (`fill`) imposibles de acertar (100% de fallos)**. En 8 preguntas oficiales (`q-102-52`, `q-104-64`, etc.), se incrustaron notas editoriales en el array de respuestas válidas (`['/etc/yum.repos.d (también aceptado /etc/yum.repos.d/ )']`), haciendo fallar cualquier entrada del usuario.
4. **A8-001 (P0)**: **Corrupción fatal de base de datos en Flashcards**. Al importar backup en modo merge, `BackupService` escribe en `data.cards` en vez de `data.progress`. Al abrir `/flashcards`, `FlashcardsService` revienta con `TypeError: Cannot read properties of undefined`, inhabilitando las tarjetas y perdiendo el progreso.
5. **S-01 / A3-001 / A4-001 (P0)**: **155 diapositivas con IDs idénticos repetidos**. Las 9 lecciones de 108.3 a 110.3 tienen un único ID (`<lección>-slide-<núm>`) y el mismo `slideNumber` en todas sus diapositivas, corrompiendo el rastreo de Angular, notas y enlaces profundos.
6. **S-02 / A4-002 / A8-002 (P0)**: **Lecciones esqueleto y laboratorios stub**. 155 diapositivas carecen de contenido (solo título o una frase genérica) y 11 laboratorios son cascarones de ~650 bytes con el comando inventado `man 108_X`, figurando engañosamente con `placeholder: false`.
7. **S-03 / A4-004 (P0)**: **Falsedad de cobertura en README y Home**. El README afirma *"100% Cobertura Real, 0 Placeholders"*, cuando 41 de los 42 subtemas están marcados con `placeholder: true` en el currículo interno y el manual oficial del 102 apenas está empezado (solo 105.1 auto-verificado).
8. **S-15 / A7-001 / A2-005 (P0)**: **Falsa promesa de soporte 100% Offline**. La FAQ en la Home y los Ajustes aseguran que la web funciona íntegramente sin conexión, pero no existe Service Worker ni PWA instalada; al desconectar la red la navegación falla.
9. **A2-001, A2-002, A2-003 (P0)**: **Enlaces rotos hacia 404 en la navegación principal**. Fe de Erratas enlaza a `/leccion/:id` (404), la ficha de tema enlaza a `/laboratorios/tema-101` (404), y las migas de pan enlazan al segmento virtual `/estudiar` (404).
10. **A4-005 (P1)**: **Colisión masiva de identificadores de preguntas**. 27 pares de preguntas distintas de exámenes diferentes comparten el mismo ID (`q-102-18` a `q-102-105`), mezclando resultados y respuestas en el simulador.

---

## 4. Estado de Verificación de las Semillas (S-01 a S-16)

Todas las 16 semillas iniciales fueron verificadas objetivamente en esta auditoría:

| Semilla | Severidad | Estado | Resultado de la Auditoría |
|---|:---:|:---:|---|
| **S-01** | P0 | **CONFIRMADO** | 155 diapositivas en 9 lecciones (108.3-110.3) con IDs repetidos (`A3-001`, `A4-001`). |
| **S-02** | P0 | **CONFIRMADO y ampliado** | 53 slides de solo título, 102 con 1 sola frase; 11 laboratorios stub de 1 solo paso con comando inventado (`A4-002`, `A8-002`). |
| **S-03** | P0 | **CONFIRMADO** | Cifras del README desincronizadas y promesa "100% real / 0 placeholders" falsa (`A4-004`). |
| **S-04** | P1 | **CONFIRMADO** | 752 de 771 diapositivas (97.5%) duplican el título entre la cabecera y el cuerpo (`A3-003`, `A1-002`). |
| **S-05** | P1 | **CONFIRMADO y reencuadrado** | 258 bloques HTML con hex literales, pero lo más grave es que `block-renderer` no los pinta (`A6-001`, `A1-001`). |
| **S-06** | P1 | **CONFIRMADO** | Asimetría de formatos: 233 bloques HTML en 101–104; 0 en 105.1; solo 1 diagrama vectorial en 771 diapositivas (`A4-003`). |
| **S-07** | P1 | **CONFIRMADO** | Títulos repetidos entre lecciones: "Ejercicios guiados..." ×6 y "Retos de exploración..." ×5 (`A4-009`). |
| **S-08** | P1 | **CONFIRMADO** | `lang="en"` en `index.html`, sin `<meta name="description">` ni Open Graph (`A7-002`, `A7-003`). |
| **S-09** | P2 | **CONFIRMADO** | Cabecera apretada (8 enlaces + buscador + tema), rotura del logo a 2 líneas en 1280px y colapso grave en 768px (`A1-004`, `A2-009`). |
| **S-10** | P2 | **CONFIRMADO** | Mapa mental ilegible a 1:1 (zoom inicial 0.25 en desktop y 0.14 en móvil, textos a 2-4px) (`A1-003`, `A8-006`). |
| **S-11** | P2 | **CONFIRMADO** | Triple CTA al simulador en Home; enlaces redundantes a `/temario` y `/guia-estilos` expuesta en pie (`A2-010`, `A2-011`). |
| **S-12** | P2 | **CONFIRMADO** | 23 rutas con `phase: 'Fase N'`; textos "Planificado para Fase 11" y "Próximamente" aún visibles (`A2-006`, `A6-004`). |
| **S-13** | P2 | **CONFIRMADO y ampliado** | 132 botones nativos `<button>` fuera de componentes compartidos en 28 ficheros (`A6-002`). |
| **S-14** | P2 | **CONFIRMADO** | `home-page.component.ts` tiene 1.096 líneas; `topic-detail-page` 879; `slide-viewer` 829 (`A6-003`). |
| **S-15** | P0 (elevado de P2) | **CONFIRMADO** | FAQ promete offline 100% sin existir Service Worker (`A7-001`, `A2-005`). |
| **S-16** | P3 | **CONFIRMADO** | Carpeta residual `round_2/`, 88 PNG obsoletos versionados, URL `usuario/...` en README, `webDocument` vestigial (`A9-001`, `A9-002`, `A9-003`). |

---

## 5. Qué Quedó Sin Verificar (Límites Declarados)

1. Comportamiento en dispositivos físicos reales (iOS Safari, Android Chrome) y lectores de pantalla comerciales (NVDA, JAWS, VoiceOver físico). Solo se comprobó emulación Playwright a 390×844 y 768×1024.
2. Servidor de producción en Cloudflare Edge real (cabeceras CSP, compresión Brotli y SSR inexistente en Cloudflare SPA).
3. Impresión física real en papel desde el diálogo del sistema operativo (`window.print()`).
4. Sesión completa de examen 102 con temporizador en tiempo real de 90 minutos continuos.

