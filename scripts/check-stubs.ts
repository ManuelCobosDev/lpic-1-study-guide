import * as path from 'node:path';

export interface StubDefinition {
  route: string;
  implementedIn: string;
  isImplemented: boolean;
}

export const STUBS: StubDefinition[] = [
  { route: '/', implementedIn: 'Fase 4', isImplemented: true },
  { route: '/temario', implementedIn: 'Fase 4', isImplemented: true },
  { route: '/temario/:examen', implementedIn: 'Fase 4', isImplemented: true },
  { route: '/temario/:examen/:tema', implementedIn: 'Fase 4', isImplemented: true },
  { route: '/estudiar/:subtema', implementedIn: 'Fase 5', isImplemented: true },
  { route: '/estudiar/:subtema/imprimir', implementedIn: 'Fase 5', isImplemented: true },
  { route: '/laboratorios', implementedIn: 'Fase 7', isImplemented: true },
  { route: '/laboratorios/:id', implementedIn: 'Fase 7', isImplemented: true },
  { route: '/simulador', implementedIn: 'Fase 8', isImplemented: true },
  { route: '/simulador/examen', implementedIn: 'Fase 8', isImplemented: true },
  { route: '/simulador/practica', implementedIn: 'Fase 8', isImplemented: true },
  { route: '/simulador/resultados', implementedIn: 'Fase 8', isImplemented: true },
  { route: '/comandos', implementedIn: 'Fase 9', isImplemented: true },
  { route: '/glosario', implementedIn: 'Fase 9', isImplemented: true },
  { route: '/flashcards', implementedIn: 'Fase 9', isImplemented: true },
  { route: '/mapa-mental', implementedIn: 'Fase 10', isImplemented: true },
  { route: '/buscar', implementedIn: 'Fase 6', isImplemented: true },
  { route: '/progreso', implementedIn: 'Fase 10', isImplemented: true },
  { route: '/erratas', implementedIn: 'Fase 10', isImplemented: false },
  { route: '/ajustes', implementedIn: 'Fase 10', isImplemented: true },
  { route: '/acerca-de', implementedIn: 'Fase 10', isImplemented: false },
  { route: '/guia-estilos', implementedIn: 'Fase 3', isImplemented: true },
  { route: '** (404)', implementedIn: 'Fase 10', isImplemented: false }
];

export function checkStubs(strict = false): { pendingCount: number; implementedCount: number } {
  const pending = STUBS.filter((s) => !s.isImplemented);
  const implemented = STUBS.filter((s) => s.isImplemented);

  console.log('--- Tabla de Stubs del Proyecto ---');
  console.log('| Ruta | Se implementa en | Estado |');
  console.log('|---|---|---|');
  STUBS.forEach((s) => {
    console.log(`| ${s.route} | ${s.implementedIn} | ${s.isImplemented ? 'implementada' : 'stub (pendiente)'} |`);
  });
  console.log(`Total: ${STUBS.length} rutas | Pendientes: ${pending.length} | Implementadas: ${implemented.length}`);

  if (strict && pending.length > 0) {
    console.error(`FAIL: Se encontraron ${pending.length} stubs pendientes en modo estricto.`);
    process.exit(1);
  }

  return {
    pendingCount: pending.length,
    implementedCount: implemented.length
  };
}

if (process.argv[1] && path.resolve(process.argv[1]).includes('check-stubs')) {
  const isStrict = process.argv.includes('--strict');
  checkStubs(isStrict);
}

