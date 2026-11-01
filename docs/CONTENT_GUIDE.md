# Guía de Creación y Formato de Contenido Didáctico

> Este documento detalla la estructura formal de contenidos didácticos en `content-src/` y proporciona **ejemplos copiables y válidos** de cada tipo de bloque y diagrama soportado.

---

## 1. Estructura General del Contenido (`content-src/`)

- `curriculum.yaml`: Árbol oficial de exámenes (101 y 102), temas (101 al 110), subtemas, horas estimadas y pesos LPI.
- `lessons/<subtema>.json`: Lección oficial compuesta por metadatos y colección de diapositivas 16:9 (`Slide`).
- `labs/<id>.json`: Prácticas de terminal guiadas con misiones secuenciales y comandos para Debian 12.
- `questions/<tema>.json`: Banco de preguntas de evaluación del simulador (formatos `single`, `multiple` y `fill`).
- `commands.yaml`: Catálogo de órdenes de línea de comandos con sintaxis, banderas y ejemplos.
- `glossary.yaml`: Definiciones técnicas de términos y conceptos clave para preparación de examen.
- `errata.yaml`: Registro público de erratas corregidas y abiertas del temario.

---

## 2. Esquema de Lección (`content-src/lessons/<subtema>.json`)

```json
{
  "id": "103.4",
  "topicId": "103",
  "examId": "101",
  "title": "Uso de secuencias de texto, tuberías y redireccionamientos",
  "version": "1.0.0",
  "language": "es",
  "estimatedMinutes": 45,
  "objectives": [
    "Redirigir los flujos estándar stdin (0), stdout (1) y stderr (2)",
    "Encadenar procesos utilizando tuberías (|)",
    "Enviar la salida simultáneamente a pantalla y archivo mediante tee"
  ],
  "keyTerms": ["stdin", "stdout", "stderr", "tubería", "tee", "xargs"],
  "commands": ["cat", "grep", "tee", "xargs", "head", "tail", "wc"],
  "placeholder": false,
  "slides": [
    {
      "id": "103.4-slide-1",
      "slideNumber": 1,
      "title": "Uso de secuencias de texto, tuberías y redireccionamientos",
      "layout": "cover",
      "blocks": [
        {
          "type": "heading",
          "level": 1,
          "text": "Uso de secuencias de texto, tuberías y redireccionamientos"
        },
        {
          "type": "paragraph",
          "text": "Subtema oficial LPIC-1 103.4 · Peso de Examen LPI: 4"
        }
      ]
    }
  ]
}
```

---

## 3. Catálogo de Ejemplos Copiables de Bloques Didácticos

### 1. Encabezado (`heading`)
```json
{
  "type": "heading",
  "level": 2,
  "text": "Canales Estándar de Entrada y Salida (I/O)"
}
```

### 2. Párrafo (`paragraph`)
```json
{
  "type": "paragraph",
  "text": "En los sistemas operativos GNU/Linux, todos los procesos se ejecutan con tres canales estándar preconfigurados accesibles mediante descriptores de archivo numéricos (0, 1 y 2)."
}
```

### 3. Lista (`list`)
```json
{
  "type": "list",
  "ordered": false,
  "items": [
    "**stdin (0)**: Entrada estándar (por defecto el teclado).",
    "**stdout (1)**: Salida estándar con los datos de éxito.",
    "**stderr (2)**: Error estándar reservado para diagnósticos y advertencias."
  ]
}
```

### 4. Bloque de Pasos Guiados (`steps`)
```json
{
  "type": "steps",
  "items": [
    {
      "number": 1,
      "title": "Inspeccionar descriptores en ejecución",
      "description": "Comprobar los enlaces simbólicos de los descriptores del proceso actual mediante `ls -l /proc/$$/fd/`."
    },
    {
      "number": 2,
      "title": "Redirigir stdout hacia un archivo nuevo",
      "description": "Utilizar el operador `>` para escribir la salida sobreescribiendo el destino."
    }
  ]
}
```

### 5. Bloque de Código con Resaltado de Sintaxis (`code`)
```json
{
  "type": "code",
  "language": "bash",
  "title": "Ejemplo de redirección simultánea",
  "code": "# Redirigir stdout y stderr hacia un único archivo de registro\nfind /var/log -name \"*.log\" > /tmp/salida.txt 2>&1\n\n# Sintaxis moderna abreviada en Bash\nfind /var/log -name \"*.log\" &> /tmp/salida.txt",
  "highlightLines": [2, 5]
}
```

### 6. Terminal Simulada Interactiva (`terminal`)
```json
{
  "type": "terminal",
  "lines": [
    {
      "prompt": "usuario@debian:~$ ",
      "command": "ls -l /archivo-inexistente 2> error.txt",
      "output": ""
    },
    {
      "prompt": "usuario@debian:~$ ",
      "command": "cat error.txt",
      "output": "ls: no se puede acceder a '/archivo-inexistente': No existe el fichero o el directorio"
    }
  ]
}
```

### 7. Cajas de Aviso Semánticas (`callout`)
Tipos disponibles: `tip`, `info`, `warning`, `exam`.

```json
{
  "type": "callout",
  "calloutType": "exam",
  "title": "Clave Mnemotécnica de Examen LPIC-1",
  "content": "🎯 **Regla 2>&1**: El descriptor 2 debe asociarse al descriptor 1 antecedido por `&`. Si escribes `2>1`, crearás un archivo físico llamado '1' en lugar de redirigir al flujo estándar."
}
```

### 8. Tabla Comparativa (`table`)
```json
{
  "type": "table",
  "headers": ["Operador", "Significado", "Efecto sobre el archivo de destino"],
  "rows": [
    [">", "Redirección de stdout", "Sobrescribe el contenido previo o crea el archivo"],
    [">>", "Añadido de stdout (append)", "Concatena al final sin eliminar los datos existentes"],
    ["2>", "Redirección de stderr", "Redirige exclusivamente los mensajes de error"],
    ["<", "Redirección de stdin", "Lee los datos de entrada a partir del archivo indicado"]
  ],
  "caption": "Resumen de operadores fundamentales de redirección en Bash"
}
```

### 9. Imagen con Texto Alternativo Accesible Obligatorio (`image`)
```json
{
  "type": "image",
  "src": "assets/diagrams/streams-diagram.svg",
  "alt": "Diagrama de los canales estándar de un proceso Linux: stdin descriptor 0 para entrada, stdout descriptor 1 para salida estándar y stderr descriptor 2 para errores.",
  "caption": "Mapeo de canales I/O estándar en un proceso Linux"
}
```

### 10. Bloque de Término de Glosario (`keyterm`)
```json
{
  "type": "keyterm",
  "termId": "stdin",
  "term": "stdin (Descriptor 0)",
  "definition": "Canal estándar de entrada por el que los programas de consola reciben flujos de datos. Por defecto está vinculado al teclado del usuario."
}
```

### 11. Referencia a Comando Oficial (`command-ref`)
```json
{
  "type": "command-ref",
  "commandId": "tee",
  "name": "tee",
  "synopsis": "tee [OPCIÓN]... [ARCHIVO]...",
  "description": "Lee de la entrada estándar y escribe simultáneamente en la salida estándar y en los archivos indicados."
}
```

### 12. Atajo de Teclado Accesible (`kbd`)
```json
{
  "type": "kbd",
  "keys": ["Ctrl", "Alt", "T"],
  "description": "Atajo estándar para abrir un emulador de terminal en entornos gráficos de escritorio."
}
```

### 13. Cuestionario Didáctico Integrado (`quiz-inline`)
```json
{
  "type": "quiz-inline",
  "id": "quiz-103-4-1",
  "question": "¿Qué comando permite enviar la salida a la terminal y al mismo tiempo guardarla en un archivo sin borrar el contenido existente?",
  "options": [
    { "key": "a", "text": "cat -a archivo.txt" },
    { "key": "b", "text": "tee -a archivo.txt" },
    { "key": "c", "text": "echo archivo.txt >> stdout" },
    { "key": "d", "text": "split -append archivo.txt" }
  ],
  "correct": ["b"],
  "explanation": "El comando 'tee' bifurca la entrada hacia la salida y hacia un archivo. La opción '-a' (--append) añade los datos al final sin sobrescribir."
}
```

---

## 4. Ejemplos Copiables de Diagramas Vectoriales (`diagram`)

### 1. Diagrama de Flujos de Proceso (`kind: "streams"`)
```json
{
  "type": "diagram",
  "kind": "streams",
  "title": "Flujos Estándar y Descriptores de Archivo (0, 1, 2)",
  "caption": "Mapeo de los tres descriptores estándar de un proceso Linux",
  "alt": "Diagrama de los canales estándar de un proceso Linux: stdin descriptor 0 para entrada, stdout descriptor 1 para salida estándar y stderr descriptor 2 para errores.",
  "spec": {
    "nodes": [
      {
        "id": "stdin",
        "label": "0: stdin",
        "sublabel": "Entrada estándar",
        "tone": "neutral",
        "badge": "0"
      },
      {
        "id": "proc",
        "label": "Proceso Linux",
        "sublabel": "grep / awk / sed",
        "tone": "primary",
        "shape": "box"
      },
      {
        "id": "stdout",
        "label": "1: stdout",
        "sublabel": "Salida normal (>)",
        "tone": "success",
        "badge": "1"
      },
      {
        "id": "stderr",
        "label": "2: stderr",
        "sublabel": "Errores (2>)",
        "tone": "danger",
        "badge": "2"
      }
    ],
    "edges": [
      { "from": "stdin", "to": "proc", "label": "Canal 0 (<)" },
      { "from": "proc", "to": "stdout", "label": "Canal 1 (>)", "tone": "success" },
      { "from": "proc", "to": "stderr", "label": "Canal 2 (2>)", "tone": "danger" }
    ]
  }
}
```

### 2. Diagrama de Capas de Arquitectura (`kind: "layers"`)
```json
{
  "type": "diagram",
  "kind": "layers",
  "title": "Jerarquía de Capas del Sistema GNU/Linux",
  "caption": "Interacción entre espacio de usuario, kernel y hardware",
  "alt": "Diagrama en capas de la arquitectura del sistema: Hardware en la base, Núcleo del Kernel Linux en el centro, y Espacio de Usuario con librerías y aplicaciones en la cima.",
  "spec": {
    "layers": [
      { "id": "user", "title": "Espacio de Usuario (User Space)", "items": ["Bash", "systemd", "Servicios", "Utilidades GNU"] },
      { "id": "kernel", "title": "Núcleo del Sistema (Linux Kernel)", "items": ["Gestión de memoria", "Controladores de hardware", "Llamadas al sistema (Syscalls)"] },
      { "id": "hardware", "title": "Capa Física (Hardware)", "items": ["CPU", "Memoria RAM", "Controladoras PCI/USB", "Discos SSD/NVMe"] }
    ]
  }
}
```

---

## 5. Formato de Preguntas del Simulador (`content-src/questions/<tema>.json`)

Cada pregunta incluye un id correlativo, tipo de pregunta (`single`, `multiple` o `fill`), ponderación y justificación técnica oficial.

### Opción Única (`single`)
```json
{
  "id": "q-103-1",
  "subtopicId": "103.4",
  "type": "single",
  "difficulty": "medium",
  "question": "¿Cuál de las siguientes órdenes redirige tanto la salida estándar como los mensajes de error al archivo /tmp/log.txt en Bash moderno?",
  "options": [
    { "id": "a", "text": "comando > /tmp/log.txt 2>&1" },
    { "id": "b", "text": "comando 2>1 /tmp/log.txt" },
    { "id": "c", "text": "comando &> /tmp/log.txt" },
    { "id": "d", "text": "comando >> /tmp/log.txt 2>" }
  ],
  "correctAnswer": "c",
  "explanation": "En Bash la sintaxis abreviada `&>` redirige tanto stdout (descriptor 1) como stderr (descriptor 2) hacia el archivo de destino. La opción `> archivo 2>&1` también es válida en shells POSIX estándar."
}
```

### Respuesta Abierta de Terminal (`fill`)
```json
{
  "id": "q-103-2",
  "subtopicId": "103.4",
  "type": "fill",
  "difficulty": "hard",
  "question": "Escriba únicamente la orden de consola que permite monitorizar y bifurcar un flujo de texto hacia la terminal y a la vez escribirlo en un archivo sin borrar registros previos.",
  "acceptedAnswers": ["tee -a", "tee --append"],
  "explanation": "El comando es 'tee', y para evitar truncar el archivo se utiliza la bandera de concatenación '-a' o '--append'."
}
```
