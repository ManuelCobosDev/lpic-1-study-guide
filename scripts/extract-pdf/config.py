r"""
Configuration and constants for PDF extraction of LPIC-1 (102-500)
"""
import os
import re

PDF_PATH = os.path.join("_legacy", "Recurso Final Definitivo", "LPI-Learning-Material-102-500-es.pdf")
OUTPUT_DIR = os.path.join("content-src", "_extract", "102-500")
FIGURES_DIR = os.path.join(OUTPUT_DIR, "figures")
COMMANDS_PATH = os.path.join("content-src", "commands.yaml")
CURRICULUM_SPEC = os.path.join("docs", "spec", "07-curriculo.md")

TOPICS = {
    "105": {"title": "Shells y scripts", "weight": 8},
    "106": {"title": "Interfaces de usuario y escritorios", "weight": 4},
    "107": {"title": "Tareas administrativas", "weight": 12},
    "108": {"title": "Servicios esenciales del sistema", "weight": 12},
    "109": {"title": "Fundamentos de redes", "weight": 14},
    "110": {"title": "Seguridad", "weight": 10},
}

OBJECTIVES = {
    "105.1": {"topic": "105", "title": "Personalizar y usar el entorno de shell", "weight": 4},
    "105.2": {"topic": "105", "title": "Personalizar y escribir scripts sencillos", "weight": 4},
    "106.1": {"topic": "106", "title": "Instalar y configurar X11", "weight": 2},
    "106.2": {"topic": "106", "title": "Escritorios gráficos", "weight": 1},
    "106.3": {"topic": "106", "title": "Accesibilidad", "weight": 1},
    "107.1": {"topic": "107", "title": "Administrar cuentas de usuario y de grupo y los archivos de sistema relacionados con ellas", "weight": 5},
    "107.2": {"topic": "107", "title": "Automatizar tareas administrativas del sistema mediante la programación de trabajos", "weight": 4},
    "107.3": {"topic": "107", "title": "Localización e internacionalización", "weight": 3},
    "108.1": {"topic": "108", "title": "Mantener la hora del sistema", "weight": 3},
    "108.2": {"topic": "108", "title": "Registros del sistema", "weight": 4},
    "108.3": {"topic": "108", "title": "Conceptos básicos del Agente de Transferencia de Correo (MTA)", "weight": 3},
    "108.4": {"topic": "108", "title": "Gestión de la impresión y de las impresoras", "weight": 2},
    "109.1": {"topic": "109", "title": "Fundamentos de los protocolos de Internet", "weight": 4},
    "109.2": {"topic": "109", "title": "Configuración de red persistente", "weight": 4},
    "109.3": {"topic": "109", "title": "Resolución de problemas básicos de red", "weight": 4},
    "109.4": {"topic": "109", "title": "Configuración DNS en el lado del cliente", "weight": 2},
    "110.1": {"topic": "110", "title": "Tareas de administración de seguridad", "weight": 3},
    "110.2": {"topic": "110", "title": "Configuración de la seguridad del sistema", "weight": 3},
    "110.3": {"topic": "110", "title": "Protección de datos mediante cifrado", "weight": 4},
}

# Known embedded figures with captions and subtopics
EMBEDDED_FIGURES = {
    135: [
        {
            "file": "figures/106.1-p135-f1.png",
            "caption": "Arquitectura de sistema X Window",
            "objective": "106.1",
            "topic": "106",
            "alt": "Diagrama de la arquitectura del Sistema X Window mostrando clientes X, red y servidor X conectando pantalla, teclado y ratón."
        }
    ],
    137: [
        {
            "file": "figures/106.1-p137-f1.png",
            "caption": "Ejemplo de configuración en pantalla",
            "objective": "106.1",
            "topic": "106",
            "alt": "Diagrama mostrando tres escenarios (A, B, C) de configuración de pantallas y monitores con el valor de la variable DISPLAY."
        }
    ],
    155: [
        {
            "file": "figures/106.2-p155-f1.png",
            "caption": "Figure 1. Configuraciones KDE GTK",
            "objective": "106.2",
            "topic": "106",
            "alt": "Captura de pantalla de la ventana de configuración del estilo de aplicaciones de KDE Plasma."
        },
        {
            "file": "figures/106.2-p155-f2.png",
            "caption": "Figure 2. Escritorio de Xfce",
            "objective": "106.2",
            "topic": "106",
            "alt": "Captura de pantalla del entorno de escritorio Xfce con menú de aplicaciones y gestor de archivos."
        }
    ]
}

