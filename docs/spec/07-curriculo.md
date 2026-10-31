# 7. CURRÍCULO OFICIAL (FUENTE DE VERDAD — `curriculum.yaml` debe coincidir exactamente)

Cada examen tiene 60 de peso. Un test unitario comprueba: 4 temas y 23 subtemas en el 101; 6 temas y 19 en el 102; suma de pesos = 60 en cada examen; pesos por tema 8/12/26/14 y 8/4/12/12/14/10.
**El examen 101-500 se llama "Arquitectura del sistema, instalación de Linux y gestión de paquetes, comandos GNU y Unix, dispositivos y sistemas de archivos" — NO "Linux Essentials".** El 104.4 no existe en v5.0 (se salta del 104.3 al 104.5).

**EXAMEN 101-500 (disponible)**
- **Tema 101 · Arquitectura del sistema (peso 8)**: 101.1 Determinar y configurar los ajustes de hardware (2) · 101.2 Arranque del sistema (3) · 101.3 Cambiar los niveles de ejecución/destinos de arranque y apagar o reiniciar el sistema (3)
- **Tema 102 · Instalación de Linux y gestión de paquetes (12)**: 102.1 Diseñar el esquema del disco duro (2) · 102.2 Instalar un gestor de arranque (2) · 102.3 Gestión de bibliotecas compartidas (1) · 102.4 Gestión de paquetes Debian (3) · 102.5 Gestión de paquetes RPM y YUM (3) · 102.6 Linux como sistema virtualizado (1)
- **Tema 103 · Comandos GNU y Unix (26)**: 103.1 Trabajar desde la línea de comandos (4) · 103.2 Procesar secuencias de texto con filtros (3) · 103.3 Administración básica de archivos (4) · 103.4 Uso de secuencias, tuberías y redirecciones (4) · 103.5 Crear, supervisar y finalizar procesos (4) · 103.6 Modificar la prioridad de ejecución de procesos (2) · 103.7 Realizar búsquedas en archivos de texto con expresiones regulares (3) · 103.8 Edición básica de archivos con vi (2)
- **Tema 104 · Dispositivos, sistemas de archivos Linux y FHS (14)**: 104.1 Creación de particiones y sistemas de archivos (2) · 104.2 Mantener la integridad de los sistemas de archivos (2) · 104.3 Controlar el montaje y desmontaje de sistemas de archivos (3) · 104.5 Gestionar permisos y propiedad de archivos (3) · 104.6 Crear y cambiar enlaces duros y simbólicos (2) · 104.7 Encontrar archivos del sistema y colocarlos en su lugar correcto (2)

**EXAMEN 102-500 (planificado; sin diapositivas ni prácticas)**
- **Tema 105 · Shells y scripts de shell (8)**: 105.1 Personalizar y usar el entorno de shell (4) · 105.2 Personalizar y escribir scripts sencillos (4)
- **Tema 106 · Interfaces de usuario y escritorios (4)**: 106.1 Instalar y configurar X11 (2) · 106.2 Escritorios gráficos (1) · 106.3 Accesibilidad (1)
- **Tema 107 · Tareas administrativas (12)**: 107.1 Administrar cuentas de usuario y de grupo y los archivos de sistema relacionados (5) · 107.2 Automatizar tareas administrativas del sistema mediante la programación de trabajos (4) · 107.3 Localización e internacionalización (3)
- **Tema 108 · Servicios esenciales del sistema (12)**: 108.1 Mantener la hora del sistema (3) · 108.2 Registros del sistema (4) · 108.3 Conceptos básicos del agente de transferencia de correo (MTA) (3) · 108.4 Gestión de la impresión y de las impresoras (2)
- **Tema 109 · Fundamentos de redes (14)**: 109.1 Fundamentos de los protocolos de Internet (4) · 109.2 Configuración de red persistente (4) · 109.3 Resolución de problemas básicos de red (4) · 109.4 Configuración DNS en el lado del cliente (2)
- **Tema 110 · Seguridad (10)**: 110.1 Tareas de administración de seguridad (3) · 110.2 Configuración de la seguridad del sistema (3) · 110.3 Protección de datos mediante cifrado (4)

Duración estimada por defecto: 30 min por subtema.

## 7.1 Contenido: viene del material legacy, no se inventa
El contenido real ya existe en `_legacy/` (cifras que muestra la web antigua y que el informe de cobertura debe contrastar con la realidad: **437 diapositivas, 23/23 subtemas del 101, 27 prácticas (23 de subtema + 4 globales), 126 comandos, 116 términos de glosario, 120 preguntas de simulador, 21 notas/erratas, mapa mental de 475 nodos**). Estas cifras son una pista, no la verdad: la verdad es lo que encuentre `/inventario-legacy`.
- Se importa con scripts reproducibles (`scripts/import-legacy/`), tipo a tipo, y se mide con `docs/agent/COBERTURA_IMPORT.md` (importado / total por tipo).
- Mientras no esté importado, un subtema usa **relleno determinista** (`placeholder: true`, etiqueta gris "Contenido de ejemplo"), nunca texto inventado que parezca real.
- Las fases de funcionalidades se prueban con **una tajada vertical real** (el subtema 103.4 completo: lección, práctica y preguntas, más ≥ 20 comandos y ≥ 20 términos relacionados) y se completa todo en la fase de importación total.
- Los exámenes 102 siguen "en planificación" (sin diapositivas ni prácticas) salvo que el inventario demuestre que hay contenido.
