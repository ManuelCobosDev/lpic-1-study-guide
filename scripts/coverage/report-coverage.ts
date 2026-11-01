import * as fs from 'node:fs';
import * as path from 'node:path';
import { evaluateCoverage, CoverageOptions } from './verify-coverage';
import { ExtractedUnit } from './types';
import { loadLedger } from './ledger-loader';
import { parseSrcString } from './parser-utils';
import { Slide } from '../../src/app/core/models/slide.model';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateCoverageHtml(
  subtopicId: string,
  outPath?: string,
  options: CoverageOptions = {}
): string {
  const rootDir = options.rootDir || '.';
  const report = evaluateCoverage(subtopicId, options);
  const ledger = loadLedger(subtopicId, options.ledgerOverrideDir ? options.ledgerOverrideDir : path.resolve(rootDir, 'content-src/coverage'));

  let allUnits: ExtractedUnit[] = [];
  if (options.unitsOverride) {
    allUnits = options.unitsOverride;
  } else {
    const unitsPath = path.resolve(rootDir, 'content-src/_extract/102-500/units.json');
    if (fs.existsSync(unitsPath)) {
      allUnits = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));
    }
  }

  const objectiveUnits = allUnits.filter(u => u.objective === subtopicId);

  let slides: Slide[] = [];
  if (options.slidesOverride) {
    slides = options.slidesOverride;
  } else {
    const jsonLessonPath = path.resolve(rootDir, `content-src/lessons/${subtopicId}.json`);
    if (fs.existsSync(jsonLessonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(jsonLessonPath, 'utf-8'));
        slides = parsed.slides || [];
      } catch {
        // fallback
      }
    }
  }

  // Mapear qué diapositiva cubre qué unidad
  const unitToSlideMap = new Map<string, number>();
  for (let idx = 0; idx < slides.length; idx++) {
    const s = slides[idx];
    if (!s) continue;
    const sNum = idx + 1;
    const parsed = parseSrcString(s.src);
    for (const uid of parsed.unitIds) {
      if (!unitToSlideMap.has(uid)) unitToSlideMap.set(uid, sNum);
    }
    for (const b of s.blocks) {
      if (!b) continue;
      if (b.src) {
        const bParsed = parseSrcString(b.src);
        for (const uid of bParsed.unitIds) {
          if (!unitToSlideMap.has(uid)) unitToSlideMap.set(uid, sNum);
        }
      }
    }
  }

  const omittedMap = ledger.omit || {};
  const coveredCount = report.mappedUnitsCount;
  const coveragePercent = report.totalUnits > 0
    ? Math.round(((coveredCount + report.omittedUnitsCount) / report.totalUnits) * 100)
    : 100;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Cobertura Oficial · Subtema ${escapeHtml(subtopicId)}</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --green: #22c55e;
      --green-bg: rgba(34, 197, 94, 0.12);
      --red: #ef4444;
      --red-bg: rgba(239, 68, 68, 0.12);
      --orange: #f97316;
      --orange-bg: rgba(249, 115, 22, 0.12);
      --yellow: #eab308;
      --yellow-bg: rgba(234, 179, 8, 0.12);
      --primary: #38bdf8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    header {
      max-width: 1400px;
      margin: 0 auto 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }
    h1 { font-size: 1.6rem; display: flex; align-items: center; gap: 12px; }
    .status-badge {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .badge-pass { background: var(--green-bg); color: var(--green); border: 1px solid var(--green); }
    .badge-fail { background: var(--red-bg); color: var(--red); border: 1px solid var(--red); }
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      max-width: 1400px;
      margin: 0 auto 24px;
    }
    .stat-card {
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
    }
    .stat-num { font-size: 1.6rem; font-weight: 700; color: var(--primary); }
    .stat-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

    .controls-bar {
      max-width: 1400px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    button.filter-btn {
      background: var(--panel-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
    }
    button.filter-btn.active {
      background: var(--primary);
      color: #000;
      border-color: var(--primary);
    }

    .columns-container {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .column {
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      max-height: 800px;
      overflow-y: auto;
    }
    .column h2 { font-size: 1.15rem; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }

    .unit-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
      font-size: 0.88rem;
    }
    .unit-card.covered { border-left: 4px solid var(--green); background: var(--green-bg); }
    .unit-card.uncovered { border-left: 4px solid var(--red); background: var(--red-bg); }
    .unit-card.omitted { border-left: 4px solid var(--orange); background: var(--orange-bg); }

    .unit-header { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.75rem; color: var(--text-muted); }
    .unit-id { font-weight: 700; font-family: monospace; color: var(--text); }
    .pill { display: inline-block; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    .pill-missing { background: rgba(239,68,68,0.3); color: #fca5a5; font-weight: bold; }
    
    .slide-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
      font-size: 0.88rem;
    }
    .slide-card.author { border-left: 4px solid var(--yellow); background: var(--yellow-bg); }

    .checklist-box {
      max-width: 1400px;
      margin: 28px auto 0;
      background: var(--panel-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 0.92rem;
    }
    .checklist-item input[type="checkbox"] { width: 18px; height: 18px; }
  </style>
</head>
<body>

  <header>
    <h1>
      Cobertura Oficial · Subtema ${escapeHtml(subtopicId)}
      <span class="status-badge ${report.passed ? 'badge-pass' : 'badge-fail'}">
        ${report.passed ? 'VERIFICADO 100%' : 'FALLOS DETECTADOS'}
      </span>
    </h1>
    <p style="color: var(--text-muted); margin-top: 6px;">
      Manual Oficial LPIC-1 (102-500) vs. Material de Estudio en la Web. Criterios de fidelidad y cobertura Spec 11 §11.6.
    </p>
  </header>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-lbl">Unidades Totales</div>
      <div class="stat-num">${report.totalUnits}</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Unidades Cubiertas</div>
      <div class="stat-num" style="color: var(--green);">${coveredCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Cobertura %</div>
      <div class="stat-num" style="color: ${coveragePercent === 100 ? 'var(--green)' : 'var(--red)'};">${coveragePercent}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Tokens Técnicos</div>
      <div class="stat-num">${report.coveredTokensCount} / ${report.totalTokensCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Exenciones Tokens</div>
      <div class="stat-num" style="color: var(--orange);">${report.waivedTokensCount} (${report.waiversPercentage}%)</div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Diapositivas</div>
      <div class="stat-num">${report.slideCount} <span style="font-size: 0.9rem; color: var(--text-muted);">/ 20</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-lbl">Bloques Autor</div>
      <div class="stat-num" style="color: var(--yellow);">${report.authorBlocksCount}</div>
    </div>
  </div>

  <div class="controls-bar">
    <div>
      <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 8px;">Filtro:</span>
      <button class="filter-btn active" id="btn-all" onclick="setFilter('all')">Todas las unidades</button>
      <button class="filter-btn" id="btn-issues" onclick="setFilter('issues')">Solo problemas (${report.unmappedUnits.length + Object.keys(report.missingTokensByUnit).length})</button>
    </div>
  </div>

  <div class="columns-container">
    <!-- COLUMNA IZQUIERDA: MANUAL OFICIAL (PDF) -->
    <div class="column">
      <h2>Manual Oficial LPI (${report.totalUnits} unidades)</h2>
      <div id="units-list">
`;

  let unitsHtml = '';
  for (const u of objectiveUnits) {
    const isOmitted = Boolean(omittedMap[u.id]);
    const coveredSlide = unitToSlideMap.get(u.id);
    const missingTokens = report.missingTokensByUnit[u.id] || [];

    let statusClass = 'uncovered';
    let statusLabel = '🔴 Sin cubrir';
    if (isOmitted) {
      statusClass = 'omitted';
      statusLabel = `🟠 Omitida: ${escapeHtml(omittedMap[u.id] || '')}`;
    } else if (coveredSlide) {
      statusClass = 'covered';
      statusLabel = `🟢 Cubierta (Diapositiva ${coveredSlide})`;
    }

    const isIssue = statusClass === 'uncovered' || missingTokens.length > 0;

    unitsHtml += `
        <div class="unit-card ${statusClass}" data-issue="${isIssue ? 'true' : 'false'}">
          <div class="unit-header">
            <span class="unit-id">${escapeHtml(u.id)}</span>
            <span>Página ${u.page} · ${escapeHtml(u.kind)}</span>
          </div>
          <p style="margin-bottom: 6px;">${escapeHtml(u.text.substring(0, 180))}${u.text.length > 180 ? '...' : ''}</p>
          <div style="font-size: 0.75rem;">
            <strong>${statusLabel}</strong>
            ${missingTokens.length ? `<span class="pill pill-missing">Faltan tokens: ${escapeHtml(missingTokens.join(', '))}</span>` : ''}
          </div>
        </div>
`;
  }

  let slidesHtml = '';
  for (let idx = 0; idx < slides.length; idx++) {
    const s = slides[idx];
    if (!s) continue;
    const sNum = idx + 1;
    const parsed = parseSrcString(s.src);
    const isAuthor = parsed.isAutor;

    slidesHtml += `
        <div class="slide-card ${isAuthor ? 'author' : ''}">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.75rem; color: var(--text-muted);">
            <strong>Diapositiva ${sNum}</strong>
            <span>${escapeHtml(s.layout)}</span>
          </div>
          <h4 style="margin-bottom: 4px;">${escapeHtml(s.title)}</h4>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            ${isAuthor ? '🟡 <strong style="color: var(--yellow);">Contenido del autor</strong> (sin respaldo directo en PDF)' : `Trazabilidad: <code>${escapeHtml(s.src || 'sin src')}</code>`}
          </div>
        </div>
`;
  }

  const checklistHtml = `
  </div>
  </div>

    <!-- COLUMNA DERECHA: CONTENIDO EN LA WEB -->
    <div class="column">
      <h2>Contenido en la App (${slides.length} diapositivas)</h2>
      <div id="slides-list">
        ${slidesHtml}
      </div>
    </div>
  </div>

  <!-- LISTA DE COMPROBACIÓN DEL USUARIO (Spec 12 §12.7) -->
  <div class="checklist-box">
    <h3 style="margin-bottom: 12px; color: var(--primary);">Lista de Comprobación para Validación Humana (Spec 12 §12.7)</h3>
    <div class="checklist-item">
      <input type="checkbox" id="chk-1">
      <label for="chk-1"><strong>Examen de diapositivas</strong>: Todas las diapositivas son claras, bien formateadas y legibles sin scroll anómalo.</label>
    </div>
    <div class="checklist-item">
      <input type="checkbox" id="chk-2">
      <label for="chk-2"><strong>Fidelidad técnica</strong>: Los comandos, opciones y rutas reflejan con exactitud las páginas oficiales de LPI.</label>
    </div>
    <div class="checklist-item">
      <input type="checkbox" id="chk-3">
      <label for="chk-3"><strong>Ejercicios del manual</strong>: Los ejercicios guiados y exploratorios del PDF están transcritos en la práctica con sus soluciones.</label>
    </div>
    <div class="checklist-item">
      <input type="checkbox" id="chk-4">
      <label for="chk-4"><strong>Contenido del autor</strong>: Cualquier contenido añadido por el autor (${report.authorBlocksCount} bloques) está justificado pedagógicamente.</label>
    </div>
    <div class="checklist-item">
      <input type="checkbox" id="chk-5">
      <label for="chk-5"><strong>Verificación de cobertura</strong>: Todas las unidades requeridas están cubiertas y las exenciones justificadas en el ledger.</label>
    </div>
  </div>

  <script>
    function setFilter(mode) {
      document.getElementById('btn-all').classList.toggle('active', mode === 'all');
      document.getElementById('btn-issues').classList.toggle('active', mode === 'issues');
      
      const cards = document.querySelectorAll('.unit-card');
      cards.forEach(card => {
        if (mode === 'issues') {
          card.style.display = card.getAttribute('data-issue') === 'true' ? '' : 'none';
        } else {
          card.style.display = '';
        }
      });
    }
  </script>
</body>
</html>
`;

  const finalHtml = html + unitsHtml + checklistHtml;

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, finalHtml, 'utf-8');
  }

  return finalHtml;
}

// CLI Driver
if (process.argv[1] && process.argv[1].endsWith('report-coverage.ts')) {
  const targetId = process.argv[2];
  if (!targetId) {
    console.error('Uso: npx tsx scripts/coverage/report-coverage.ts <subtopicId>');
    process.exit(1);
  }

  const outDir = path.resolve('docs/agent/cobertura');
  const outFile = path.join(outDir, `${targetId}.html`);
  generateCoverageHtml(targetId, outFile);
  console.log(`✅ Informe de cobertura HTML generado en: ${outFile}`);
}

