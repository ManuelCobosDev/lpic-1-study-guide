# 3. DOMINIO, SERVICIOS Y PERSISTENCIA

## 3.1 Pipeline de contenido (`scripts/build-content.ts`)
Lee `content-src/` (que se rellena con los importadores de `scripts/import-legacy/` a partir de `_legacy/`; nunca a mano ni copiando y pegando) y genera en `public/content/`:
- `manifest.json`: currículo completo + **todos los contadores calculados** (diapositivas, subtemas, prácticas, preguntas reales y de relleno, comandos, términos) + versión de contenido.
- `lessons/<id>.json`: lección ya parseada a `Lesson { id, title, objectives, keyTerms, commands, estimatedMinutes, placeholder, slides: Slide[] }`.
- `labs/<id>.json`, `questions/<tema>.json`, `commands.json`, `glossary.json`, `errata.json`.
- `search-index.json`: documentos listos para MiniSearch (sección 6.5).
Si un subtema del currículo no tiene `.md`, el script **genera una lección de relleno determinista** (portada + 6 diapositivas con lorem ipsum que ejercitan todos los tipos de bloque + resumen), una práctica de relleno de 5 pasos y 4 preguntas de relleno, todo con `placeholder: true`.
Valida con Zod: ids únicos; referencias cruzadas (comandos, términos y prácticas apuntan a subtemas existentes); respuestas correctas existentes en las opciones; `alt` obligatorio en imágenes y diagramas; límites por diapositiva (≤ 7 viñetas, ≤ 140 palabras, ≤ 14 líneas de código: **warning**, no error); límites de diagrama (≤ 12 nodos); pesos del currículo (suma 60 por examen). Los errores se muestran con archivo y línea. `prebuild` y `prestart` ejecutan este script.

## 3.2 Modelos principales
`Exam {id,code,title,description,status:'available'|'planned',topicIds}` · `Topic {id,examId,title,weight,subtopicIds,globalLabId}` · `Subtopic {id,topicId,title,weight,estimatedMinutes,status,placeholder,labId,slideCount}` · `Slide {id,title,layout,blocks,notes?}` con `layout ∈ cover|section|content|two-column|code-explain|diagram|comparison|checkpoint|summary` · `Block` (unión discriminada, sección 4.2) · `Lab {id,subtopicId|topicId,title,estimatedMinutes,difficulty,type,steps[],solutionNotes}` con `LabStep {id,title,instruction,command?,expectedOutput?,hint?,examAlert?}` · `Question {id,topicId,subtopicId,type:'single'|'multiple'|'fill',prompt,options?,correct[],acceptedAnswers?,explanation,difficulty,placeholder}` · `Command {name,synopsis,description,category,subtopicIds,example,flags[]}` · `GlossaryTerm {term,definition,related[],subtopicIds}` · `Errata {id,page,description,correction,severity}`.

## 3.3 Servicios (signals; interfaz clara; testeables con `ClockService` inyectable)
- **StorageService**: único acceso a `localStorage`; claves `lpic1.v1.<store>`; try/catch ante cuota y modo privado con **fallback en memoria y aviso visible**; sincronización entre pestañas con el evento `storage`.
- **PersistedStore<T>** (helper): `signal<T>` + carga al arrancar + escritura con debounce 300 ms vía `effect()` + `schemaVersion` y función `migrate`.
- **ProgressService**: `completedSubtopics` (id → ISO), `viewedSlides` (id → número[]), `lastSlide`, `lastView`, `lastVisited {path,title}`, `checkpoints`. Selectores: progreso de subtema = 100 si completado; si no `min(99, round(vistas/total×100))`; de tema = media ponderada por minutos estimados; de examen = media ponderada por peso LPI; siguiente subtema recomendado; temas débiles.
- **LabsService**, **SimulatorService** (intento en curso con `startedAt`, `seed`, respuestas, banderas; historial), **FlashcardsService** (cajas Leitner), **ActivityService** (minutos por día, racha; suma solo con pestaña visible y actividad en los últimos 2 min), **NotesService** (autoguardado 500 ms), **PreferencesService** (tema, vista por defecto, tarjetas nuevas/día, mostrar notas del instructor, incluir contenido de ejemplo, tamaño de texto, densidad, `lastExportAt`, banner de privacidad descartado), **SearchService**, **BackupService**, **ThemeService** (claro/oscuro/sistema, clase en `<html>`, **persistente**), **ShortcutsService** (atajos globales, se desactivan en `input/textarea/[contenteditable]`), **AnnouncerService** (CDK LiveAnnouncer).
- **ContentService**: carga perezosa y cacheada de `manifest` y de cada recurso (`fetch` de `/content/...`). Expone señales `manifest`, `loading`, `error`.

## 3.4 Rutas (todas lazy, con `title` y `data.breadcrumb`)
| Ruta | Descripción |
|---|---|
| `/` | Home |
| `/temario` · `/temario/:examen` · `/temario/:examen/:tema` | Temario en 3 niveles |
| `/estudiar/:subtema` | `?vista=slides\|web\|pdf` `&slide=N` `&q=término` |
| `/estudiar/:subtema/imprimir` | `?formato=documento\|diapositivas` `&notas=0\|1` |
| `/laboratorios` · `/laboratorios/:id` | Catálogo y práctica |
| `/simulador` · `/simulador/examen` · `/simulador/practica` (`?tema=`) · `/simulador/resultados` (`?id=`) | Simulador |
| `/comandos` (`?q=&cat=&tema=`) · `/glosario` · `/flashcards` · `/mapa-mental` | Herramientas |
| `/buscar` (`?q=&tipo=&tema=&pagina=`) | Resultados |
| `/progreso` · `/erratas` · `/ajustes` · `/acerca-de` · `/guia-estilos` · `**` (404) | Resto |
- Resolver `lessonResolver`: dado `:subtema` devuelve `{subtopic, lesson, prev, next}` o redirige a 404.
- Guard `examInProgressGuard`: si hay intento en curso y se entra a `/simulador/examen` sin id, lo reanuda.
- Guard `canStartExamGuard`: si hay < 10 preguntas reales disponibles, redirige a `/simulador` con aviso.
- Examen 102 (`status: planned`): sus páginas existen y muestran "En planificación", sin enlaces a estudiar.

---
