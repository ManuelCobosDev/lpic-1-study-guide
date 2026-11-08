import { TestBed } from '@angular/core/testing';
import { CommandService } from './command.service';
import { ContentService } from './content.service';
import { Command } from '../models/command.model';

describe('CommandService', () => {
  let service: CommandService;

  const mockCommands: Command[] = [
    {
      id: 'tee',
      name: 'tee',
      synopsis: 'tee [OPCIÓN]... [ARCHIVO]...',
      description: 'Copia la entrada estándar a cada archivo y a la salida.',
      category: 'Redirecciones y Tuberías',
      subtopicIds: ['103.4'],
      example: 'ls -l | tee salida.txt',
      flags: [{ flag: '-a', description: 'Añadir al archivo' }]
    },
    {
      id: 'xargs',
      name: 'xargs',
      synopsis: 'xargs [OPCIÓN]... [COMANDO]',
      description: 'Construye y ejecuta líneas de comando desde stdin.',
      category: 'Procesamiento',
      subtopicIds: ['103.4'],
      example: 'find . -name "*.log" | xargs rm',
      flags: [{ flag: '-0', description: 'Separador nulo' }]
    },
    {
      id: 'grep',
      name: 'grep',
      synopsis: 'grep [OPCIÓN]... PATRÓN [ARCHIVO]...',
      description: 'Busca patrones en archivos con expresiones regulares.',
      category: 'Búsqueda de Texto',
      subtopicIds: ['103.2'],
      example: 'grep root /etc/passwd',
      flags: [{ flag: '-i', description: 'Ignorar mayúsculas' }]
    },
    {
      id: 'kill',
      name: 'kill',
      synopsis: 'kill [-s SEÑAL] PID...',
      description: 'Envía señales a procesos.',
      category: 'Crear, supervisar y matar procesos',
      subtopicIds: ['103.5'],
      example: 'kill -9 1234',
      flags: [{ flag: '-9', description: 'SIGKILL' }]
    },
    {
      id: 'pkill',
      name: 'pkill',
      synopsis: 'pkill [OPCIONES] NOMBRE',
      description: 'Envía señales a procesos según su nombre.',
      category: 'Crear, monitorizar y matar procesos',
      subtopicIds: ['103.5'],
      example: 'pkill -u root nginx',
      flags: [{ flag: '-u', description: 'Por usuario' }]
    }
  ];

  const mockContentService = {
    getCommands: () => Promise.resolve(mockCommands)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommandService,
        { provide: ContentService, useValue: mockContentService }
      ]
    });
    service = TestBed.inject(CommandService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getCommands debe devolver los comandos del ContentService', async () => {
    const list = await service.getCommands();
    expect(list.length).toBe(5);
    expect(list[0]?.id).toBe('tee');
  });

  it('getCommandById debe encontrar el comando por ID', async () => {
    const cmd = await service.getCommandById('TEE');
    expect(cmd).toBeDefined();
    expect(cmd?.name).toBe('tee');
  });

  it('getCategories debe consolidar categorías duplicadas en nombres canónicos ordenados (A8-011)', async () => {
    const cats = await service.getCategories();
    expect(cats).toEqual(['Búsqueda de Texto', 'Gestión de procesos', 'Procesamiento', 'Redirecciones y Tuberías']);
  });

  it('filterCommands debe filtrar por categoría canónica consolidada', () => {
    const filtered = service.filterCommands(mockCommands, '', 'Gestión de procesos', '');
    expect(filtered.length).toBe(2);
    expect(filtered.map((c) => c.name)).toEqual(['kill', 'pkill']);
  });

  it('filterCommands debe filtrar por texto insensible a mayúsculas y acentos', () => {
    const filtered = service.filterCommands(mockCommands, 'patron', '', '');
    expect(filtered.length).toBe(1);
    expect(filtered[0]?.id).toBe('grep');
  });

  it('filterCommands debe filtrar por categoría', () => {
    const filtered = service.filterCommands(mockCommands, '', 'Procesamiento', '');
    expect(filtered.length).toBe(1);
    expect(filtered[0]?.id).toBe('xargs');
  });

  it('filterCommands debe filtrar por tema', () => {
    const filtered = service.filterCommands(mockCommands, '', '', '103.4');
    expect(filtered.length).toBe(2);
  });
});
