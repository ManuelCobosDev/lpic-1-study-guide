import * as fs from 'node:fs';
import * as path from 'node:path';

const rawFile = path.resolve('docs/agent/auditorias/web-2026-11-03/a7-axe-raw.json');
const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));

interface ViolationSummary {
  id: string;
  impact: string;
  help: string;
  helpUrl: string;
  occurrences: number;
  routes: Set<string>;
  targets: Set<string>;
  themes: Set<string>;
  viewports: Set<string>;
}

const violationMap = new Map<string, ViolationSummary>();
const routesSEO: { route: string; title: string; lang: string | null; metaDescription: string | null; ogTitle: string | null }[] = [];

for (const res of rawData.results) {
  // Capture SEO on desktop light
  if (res.viewport === 'desktop' && res.theme === 'light') {
    routesSEO.push({
      route: res.route,
      title: res.title,
      lang: res.lang,
      metaDescription: res.metaDescription,
      ogTitle: res.ogTitle
    });
  }

  for (const v of res.violations) {
    if (!violationMap.has(v.id)) {
      violationMap.set(v.id, {
        id: v.id,
        impact: v.impact || 'minor',
        help: v.help,
        helpUrl: v.helpUrl,
        occurrences: 0,
        routes: new Set(),
        targets: new Set(),
        themes: new Set(),
        viewports: new Set()
      });
    }

    const item = violationMap.get(v.id)!;
    item.occurrences += v.nodesCount;
    item.routes.add(res.route);
    item.themes.add(res.theme);
    item.viewports.add(res.viewport);
    for (const t of v.targets) {
      item.targets.add(t);
    }
  }
}

console.log('=== RESUMEN DE VIOLACIONES AXE DETECTADAS ===');
for (const [id, item] of violationMap.entries()) {
  console.log(`\n[${item.impact.toUpperCase()}] ${id}: ${item.help}`);
  console.log(`  Total nodos: ${item.occurrences} | Rutas (${item.routes.size}): ${Array.from(item.routes).join(', ')}`);
  console.log(`  Temas: ${Array.from(item.themes).join(', ')} | Viewports: ${Array.from(item.viewports).join(', ')}`);
  console.log(`  Ejemplos de targets:`);
  Array.from(item.targets).slice(0, 4).forEach((t) => console.log(`    - ${t}`));
}

console.log('\n=== REVISIÓN DE SEO Y METADATOS POR RUTA ===');
for (const s of routesSEO) {
  console.log(`${s.route.padEnd(22)} | lang: ${s.lang} | title: "${s.title}" | metaDesc: ${s.metaDescription ? 'SÍ' : 'NO'}`);
}
