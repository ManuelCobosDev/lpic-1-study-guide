import * as fs from 'node:fs';
import * as path from 'node:path';

interface Finding {
  id: string;
  agente: string;
  severidad: 'P0' | 'P1' | 'P2' | 'P3';
  categoria: string;
  titulo: string;
  descripcion: string;
  evidencia: string[];
  ubicacion: string;
  reproduccion: string;
  propuesta: string;
  esfuerzo: 'S' | 'M' | 'L';
  riesgo: 'bajo' | 'medio' | 'alto';
  estado: 'CONFIRMADO' | 'NO_VERIFICADO' | 'DUDOSO';
  cruces?: string[];
  semilla?: string;
  oleada?: string;
}

const auditDir = path.resolve('docs/agent/auditorias/web-2026-11-03');
const files = [
  'hallazgos-A1.json',
  'hallazgos-A2.json',
  'hallazgos-A3.json',
  'hallazgos-A4.json',
  'hallazgos-A5.json',
  'hallazgos-A6.json',
  'hallazgos-A7.json',
  'hallazgos-A8.json',
  'hallazgos-A9.json'
];

let allFindings: Finding[] = [];
const agentCounts: Record<string, { total: number; P0: number; P1: number; P2: number; P3: number }> = {};

for (const file of files) {
  const filePath = path.join(auditDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${file}`);
    continue;
  }
  const agentId = file.replace('hallazgos-', '').replace('.json', '');
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const data: Finding[] = JSON.parse(raw);
  agentCounts[agentId] = { total: data.length, P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const f of data) {
    agentCounts[agentId][f.severidad]++;
    allFindings.push(f);
  }
}

console.log(`Total hallazgos recolectados: ${allFindings.length}`);
console.log('Por agente:', agentCounts);

// Asignación de oleadas (O1 a O6)
for (const f of allFindings) {
  const t = (f.titulo + ' ' + f.descripcion + ' ' + f.categoria).toLowerCase();
  
  if (
    f.id === 'A3-001' || f.id === 'A4-001' || f.semilla === 'S-01' ||
    f.id === 'A4-005' || f.id === 'A8-001' || f.id === 'A8-005' ||
    t.includes('slide.slidenumber') || t.includes('ids repetidos') || t.includes('colisión de ids') ||
    t.includes('cifras públicas') || t.semilla === 'S-03'
  ) {
    f.oleada = 'O1'; // Integridad de datos y arquitectura base
  } else if (
    f.semilla === 'S-12' || f.semilla === 'S-15' || f.id === 'A2-005' || f.id === 'A2-006' ||
    f.id === 'A2-001' || f.id === 'A2-002' || f.id === 'A2-003' || f.id === 'A2-004' ||
    f.id === 'A7-001' || f.id === 'A7-002' || f.id === 'A7-003' || f.id === 'A7-004' ||
    f.semilla === 'S-08' || f.semilla === 'S-11' || t.includes('copy') || t.includes('offline') ||
    t.includes('404') || t.includes('enlace roto') || t.includes('jerga') || t.includes('fase n') ||
    t.includes('guia-estilos') || t.includes('lang="en"')
  ) {
    f.oleada = 'O2'; // Honestidad, navegación y SEO base
  } else if (
    f.semilla === 'S-04' || f.semilla === 'S-05' || f.semilla === 'S-09' || f.semilla === 'S-10' ||
    f.id === 'A6-001' || f.id === 'A1-001' || f.id === 'A1-002' || f.id === 'A1-003' || f.id === 'A1-004' ||
    f.id === 'A3-003' || f.id === 'A3-004' || f.id === 'A3-005' || f.id === 'A3-006' ||
    t.includes('overflow') || t.includes('portada') || t.includes('bloque html') || t.includes('cabecera') ||
    t.includes('mapa mental') || t.includes('tokens') || t.includes('impresión')
  ) {
    f.oleada = 'O3'; // Visor, diseño, tokens y modo oscuro
  } else if (
    f.semilla === 'S-02' || f.semilla === 'S-07' || f.agente === 'A5' ||
    f.id === 'A4-002' || f.id === 'A4-006' || f.id === 'A4-007' || f.id === 'A4-008' ||
    f.id === 'A8-002' || f.id === 'A8-004' || t.includes('clave') || t.includes('esqueleto') ||
    t.includes('errata') || t.includes('laboratorio stub') || t.includes('lpi') || t.includes('fill')
  ) {
    f.oleada = 'O4'; // Contenido, fidelidad LPI y preguntas
  } else if (
    f.agente === 'A7' || f.agente === 'A8' || t.includes('a11y') || t.includes('axe') ||
    t.includes('foco') || t.includes('contraste') || t.includes('simulador') || t.includes('flashcard')
  ) {
    f.oleada = 'O5'; // Accesibilidad, rendimiento y herramientas
  } else {
    f.oleada = 'O6'; // Higiene de repositorio y deuda técnica
  }
}

// Guardar hallazgos.json consolidado
fs.writeFileSync(path.join(auditDir, 'hallazgos.json'), JSON.stringify(allFindings, null, 2), 'utf-8');
console.log('hallazgos.json escrito con éxito.');
