import { Injectable, inject } from '@angular/core';
import { ContentService } from './content.service';
import { Command } from '../models/command.model';

export const CANONICAL_CATEGORIES_MAP: Record<string, string> = {
  'Determinar y configurar los ajustes de hardware': 'Hardware del sistema',
  'Ajustes de hardware del sistema': 'Hardware del sistema',
  'Arranque del sistema': 'Arranque y niveles de ejecución',
  'Cambiar los niveles de ejecución / objetivos de arranque y apagar o reiniciar el sistema': 'Arranque y niveles de ejecución',
  'Niveles de ejecución, objetivos y apagado': 'Arranque y niveles de ejecución',
  'Diseño del esquema de particionado del disco duro': 'Particionado y sistemas de archivos',
  'Diseño del esquema de particionado': 'Particionado y sistemas de archivos',
  'Creación de particiones y sistemas de archivos': 'Particionado y sistemas de archivos',
  'Mantener la integridad de los sistemas de archivos': 'Particionado y sistemas de archivos',
  'Controlar el montaje y desmontaje de los sistemas de archivos': 'Particionado y sistemas de archivos',
  'Instalar un gestor de arranque': 'Gestores de arranque',
  'Instalación y configuración del gestor de arranque': 'Gestores de arranque',
  'Gestión de paquetes Debian': 'Gestión de paquetes y librerías',
  'Gestión de paquetes RPM y YUM': 'Gestión de paquetes y librerías',
  'Gestión de librerías compartidas': 'Gestión de paquetes y librerías',
  'Linux como sistema virtualizado': 'Virtualización y contenedores',
  'Trabajar desde la línea de comandos': 'Línea de comandos y filtros',
  'Trabajar en la línea de comandos': 'Línea de comandos y filtros',
  'Procesar secuencias de texto usando filtros': 'Línea de comandos y filtros',
  'Procesar flujos de texto usando filtros': 'Línea de comandos y filtros',
  'Uso de secuencias de texto, tuberías y redireccionamientos': 'Línea de comandos y filtros',
  'Administración básica de archivos': 'Gestión de archivos y permisos',
  'Edición básica de archivos': 'Gestión de archivos y permisos',
  'Administración de los permisos y los propietarios de los archivos': 'Gestión de archivos y permisos',
  'Crear y cambiar enlaces duros y simbólicos': 'Gestión de archivos y permisos',
  'Encontrar archivos de sistema y ubicar archivos en el lugar correspondiente': 'Gestión de archivos y permisos',
  'Crear, supervisar y matar procesos': 'Gestión de procesos',
  'Crear, monitorizar y matar procesos': 'Gestión de procesos',
  'Modificar la prioridad de ejecución de los procesos': 'Gestión de procesos',
  'Realizar búsquedas en archivos de texto usando expresiones regulares': 'Expresiones regulares y búsqueda',
  'Personalizar y usar el entorno de shell': 'Shell y scripting',
  'Personalizar y escribir scripts sencillos': 'Shell y scripting',
  'Instalar y configurar X11': 'Interfaces gráficas y accesibilidad',
  'Escritorios gráficos': 'Interfaces gráficas y accesibilidad',
  'Accesibilidad': 'Interfaces gráficas y accesibilidad'
};

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private readonly contentService = inject(ContentService);

  getCanonicalCategory(category?: string | null): string {
    if (!category) return 'General';
    return CANONICAL_CATEGORIES_MAP[category] ?? category;
  }

  async getCommands(): Promise<Command[]> {
    return this.contentService.getCommands();
  }

  async getCommandById(id: string): Promise<Command | undefined> {
    const commands = await this.getCommands();
    return commands.find((c) => c.id.toLowerCase() === id.toLowerCase());
  }

  async getCategories(): Promise<string[]> {
    const commands = await this.getCommands();
    const set = new Set<string>();
    for (const cmd of commands) {
      if (cmd.category) {
        set.add(this.getCanonicalCategory(cmd.category));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }

  /**
   * Filtra comandos por texto de búsqueda, categoría y tema/subtema.
   */
  filterCommands(
    commands: Command[],
    query: string,
    category: string,
    topicId: string
  ): Command[] {
    const cleanQuery = this.normalize(query);
    const hasQuery = cleanQuery.length > 0;
    const hasCategory = category && category !== 'todas' && category.trim() !== '';
    const hasTopic = topicId && topicId !== 'todos' && topicId.trim() !== '';

    return commands.filter((cmd) => {
      // Filtro por categoría (comparando categoría canónica)
      if (hasCategory) {
        const cmdCategory = this.getCanonicalCategory(cmd.category);
        if (cmdCategory !== category && cmd.category !== category) {
          return false;
        }
      }

      // Filtro por tema (ej. "103" coincide con subtemas "103.4", o "103.4" exacto)
      if (hasTopic) {
        const matchesTopic = cmd.subtopicIds.some(
          (subId) => subId === topicId || subId.startsWith(`${topicId}.`)
        );
        if (!matchesTopic) {
          return false;
        }
      }

      // Filtro por texto
      if (hasQuery) {
        const nameNorm = this.normalize(cmd.name);
        const descNorm = this.normalize(cmd.description);
        const synNorm = this.normalize(cmd.synopsis);
        const exNorm = this.normalize(cmd.example);
        const flagsNorm = cmd.flags.map((f) => `${this.normalize(f.flag)} ${this.normalize(f.description)}`).join(' ');

        const inText =
          nameNorm.includes(cleanQuery) ||
          descNorm.includes(cleanQuery) ||
          synNorm.includes(cleanQuery) ||
          exNorm.includes(cleanQuery) ||
          flagsNorm.includes(cleanQuery);

        if (!inText) {
          return false;
        }
      }

      return true;
    });
  }

  private normalize(text: string | null | undefined): string {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

