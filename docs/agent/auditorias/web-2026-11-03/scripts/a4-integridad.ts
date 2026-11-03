// A4 · Integridad de contenido (solo lectura sobre content-src). Uso: npx tsx <este archivo>
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..', '..', '..');
const cs = join(root, 'content-src');
const out = join(here, '..');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = any;
const rj = (p: string): J => JSON.parse(readFileSync(p, 'utf8'));
const ry = (p: string): J => yaml.load(readFileSync(p, 'utf8'));
const norm = (s: string) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const h = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 10);
const R: J = {};

// ---- Currículo
const cur = ry(join(cs, 'curriculum.yaml'));
const subs: J[] = cur.subtopics;
R.curriculum = {
  subtopics: subs.length,
  examWeights: cur.exams.map((e: J) => [e.id, e.weight]),
  topicWeights: cur.topics.map((t: J) => [t.id, t.examId, t.weight, t.subtopicIds.length]),
  sumSubWeightByExam: Object.fromEntries(['101', '102'].map(ex => [ex, subs.filter(s => cur.topics.find((t: J) => t.id === s.topicId).examId === ex).reduce((a, s) => a + s.weight, 0)])),
  subtopicsPlaceholderTrue: subs.filter(s => s.placeholder).map(s => s.id),
  subtopicsNotPlaceholder: subs.filter(s => !s.placeholder).map(s => s.id),
};
R.curriculum.sumTopicWeightByExam = Object.fromEntries(['101', '102'].map(ex => [ex, cur.topics.filter((t: J) => t.examId === ex).reduce((a: number, t: J) => a + t.weight, 0)]));

// ---- Datos
const commands: J[] = ry(join(cs, 'commands.yaml'));
const glossary: J[] = ry(join(cs, 'glossary.yaml'));
const fcx: J[] = ry(join(cs, 'flashcards-extra.yaml'));
const errata: J[] = ry(join(cs, 'errata.yaml'));
const cmdIds = new Set(commands.map(c => c.id));
const cmdNames = new Set(commands.map(c => norm(c.name)));
const glossTerms = glossary.map(g => norm(g.term));
const glossIds = new Set(glossary.map(g => g.id));
const subIds = new Set(subs.map(s => s.id));

const questions: J[] = [];
for (const f of readdirSync(join(cs, 'questions')).filter(f => f.endsWith('.json'))) questions.push(...rj(join(cs, 'questions', f)).questions);

const lessons: J[] = subs.map(s => ({ s, file: join(cs, 'lessons', s.id + '.json') })).map(({ s, file }) => existsSync(file) ? { ...rj(file), _size: readFileSync(file).length, _sid: s.id } : { _sid: s.id, _missing: true });
R.lessonFilesMissing = lessons.filter(l => l._missing).map(l => l._sid);
R.lessonFilesExtra = readdirSync(join(cs, 'lessons')).filter(f => !subIds.has(f.replace(/\.(json|yaml)$/, '')));

// ---- Lecciones: ids, títulos, bloques
const lessonStats: J = {};
const allBlockHashes = new Map<string, string[]>();
const titleMap = new Map<string, string[]>();
let totalSlides = 0;
for (const l of lessons.filter(x => !x._missing)) {
  const sl: J[] = l.slides ?? [];
  totalSlides += sl.length;
  const ids = sl.map(s => s.id);
  const nums = sl.map(s => s.slideNumber);
  const uniqIds = new Set(ids).size;
  const uniqNums = new Set(nums).size;
  const seqOk = nums.every((n, i) => n === i + 1);
  const types: Record<string, number> = {};
  let blocks = 0, emptyish = 0, titleOnly = 0;
  for (const s of sl) {
    const bl: J[] = s.blocks ?? [];
    blocks += bl.length;
    if (bl.length === 0) emptyish++;
    if (bl.every(b => b.type === 'heading')) titleOnly++;
    for (const b of bl) {
      types[b.type] = (types[b.type] ?? 0) + 1;
      const key = h(norm(JSON.stringify(b)));
      if (['paragraph', 'html', 'code', 'terminal', 'table', 'callout', 'list'].includes(b.type) || true) {
        const a = allBlockHashes.get(key) ?? []; a.push(`${l._sid}#${s.slideNumber}`); allBlockHashes.set(key, a);
      }
    }
    const t = norm(s.title ?? '');
    const a = titleMap.get(t) ?? []; a.push(`${l._sid}#${s.slideNumber}`); titleMap.set(t, a);
  }
  const dupTitlesInside = sl.length - new Set(sl.map(s => norm(s.title ?? ''))).size;
  const text = JSON.stringify(l);
  const stubWords = (text.match(/\b(TODO|lorem|ipsum|pendiente|por completar|FIXME|TBD)\b/gi) ?? []).length;
  // referencias cruzadas
  const badCmds = (l.commands ?? []).filter((c: string) => !cmdIds.has(c) && !cmdNames.has(norm(c)));
  const badKey = (l.keyTerms ?? []).filter((k: string) => !glossTerms.some(g => g === norm(k) || norm(k).includes(g) || g.includes(norm(k))));
  lessonStats[l._sid] = { size: l._size, slides: sl.length, uniqIds, uniqNums, seqOk, blocks, types, emptyish, titleOnly, dupTitlesInside, stubWords, placeholder: !!l.placeholder, hasSrc: sl.filter(s => s.src).length, badCmds, badKeyTerms: badKey.length, keyTerms: (l.keyTerms ?? []).length, nCommands: (l.commands ?? []).length, hasWebDocument: !!l.webDocument, subtopicIdField: l.subtopicId ?? null, idField: l.id };
}
R.lessonStats = lessonStats;
R.totalSlides = totalSlides;
R.totalSlidesByWhereIdsUnique = Object.entries(lessonStats).filter(([, v]: J) => v.uniqIds === v.slides).length;
R.lessonsWithDuplicateIds = Object.entries(lessonStats).filter(([, v]: J) => v.uniqIds !== v.slides).map(([k, v]: J) => `${k} (${v.uniqIds} ids únicos / ${v.slides})`);
R.lessonsSlideNumberBad = Object.entries(lessonStats).filter(([, v]: J) => !v.seqOk).map(([k, v]: J) => `${k} (${v.uniqNums} nums únicos / ${v.slides})`);
R.lessonsOver20 = Object.entries(lessonStats).filter(([, v]: J) => v.slides > 20).map(([k, v]: J) => `${k}:${v.slides}`);
R.lessonsTitleOnlySlides = Object.entries(lessonStats).filter(([, v]: J) => v.titleOnly > 0).map(([k, v]: J) => `${k}: ${v.titleOnly}/${v.slides} solo-título`);
R.totalTitleOnlySlides = Object.values(lessonStats).reduce((a: number, v: J) => a + v.titleOnly, 0);
R.blockTypesGlobal = Object.values(lessonStats).reduce((a: J, v: J) => { for (const [k, n] of Object.entries(v.types)) a[k] = (a[k] ?? 0) + (n as number); return a; }, {});
R.htmlBlocksByLesson = Object.fromEntries(Object.entries(lessonStats).map(([k, v]: J) => [k, v.types.html ?? 0]));
R.diagramBlocks = Object.entries(lessonStats).filter(([, v]: J) => v.types.diagram).map(([k, v]: J) => `${k}:${v.types.diagram}`);

// Títulos repetidos entre lecciones (nunca dentro de una misma lección contados como 1)
const crossTitles = [...titleMap.entries()].filter(([, v]) => new Set(v.map(x => x.split('#')[0])).size > 1).map(([t, v]) => ({ title: t, count: v.length, lessons: [...new Set(v.map(x => x.split('#')[0]))].length, where: v.length > 12 ? v.slice(0, 12) : v })).sort((a, b) => b.count - a.count);
R.crossLessonTitles = crossTitles.slice(0, 30);
const origTitleCount = new Map<string, number>();
for (const l of lessons.filter(x => !x._missing)) for (const s of l.slides ?? []) origTitleCount.set(s.title, (origTitleCount.get(s.title) ?? 0) + 1);
R.exactTitleTop = [...origTitleCount.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 25);

// Bloques idénticos entre lecciones
const dupBlocks = [...allBlockHashes.entries()].filter(([, v]) => new Set(v.map(x => x.split('#')[0])).size > 1);
R.dupBlocksAcrossLessons = { groups: dupBlocks.length, sample: dupBlocks.slice(0, 5).map(([k, v]) => ({ k, v: v.slice(0, 6) })) };
// Bloques idénticos que no sean heading (los heading comparten títulos genéricos)
const nonHead = new Map<string, string[]>();
for (const l of lessons.filter(x => !x._missing)) for (const s of l.slides ?? []) for (const b of s.blocks ?? []) {
  if (b.type === 'heading') continue;
  const k = h(norm(JSON.stringify(b))); const a = nonHead.get(k) ?? []; a.push(`${l._sid}#${s.slideNumber}:${b.type}`); nonHead.set(k, a);
}
const dupNH = [...nonHead.entries()].filter(([, v]) => v.length > 1);
R.dupNonHeadingBlocks = { groups: dupNH.length, acrossLessons: dupNH.filter(([, v]) => new Set(v.map(x => x.split('#')[0])).size > 1).length, sample: dupNH.slice(0, 8).map(([, v]) => v.slice(0, 5)) };
// Diapositivas completas casi duplicadas (hash del contenido sin id)
const slideHash = new Map<string, string[]>();
for (const l of lessons.filter(x => !x._missing)) for (const s of l.slides ?? []) {
  const k = h(norm(JSON.stringify(s.blocks))); const a = slideHash.get(k) ?? []; a.push(`${l._sid}#${s.slideNumber}`); slideHash.set(k, a);
}
const dupSlides = [...slideHash.values()].filter(v => v.length > 1);
R.dupSlides = { groups: dupSlides.length, slidesInvolved: dupSlides.reduce((a, v) => a + v.length, 0), sample: dupSlides.slice(0, 8) };

// ---- Labs
const labs: J[] = [];
for (const s of subs) {
  const jf = join(cs, 'labs', s.id + '.json');
  const yf = join(cs, 'labs', s.id + '.yaml');
  if (existsSync(jf)) labs.push({ ...rj(jf), _sid: s.id, _size: readFileSync(jf).length, _fmt: 'json' });
  else if (existsSync(yf)) labs.push({ ...ry(yf), _sid: s.id, _size: readFileSync(yf).length, _fmt: 'yaml' });
}
R.labFilesBoth = subs.filter(s => existsSync(join(cs, 'labs', s.id + '.json')) && existsSync(join(cs, 'labs', s.id + '.yaml'))).map(s => s.id);
R.labsSubtopicsWithoutLab = subs.filter(s => !labs.find(l => l._sid === s.id)).map(s => s.id);
R.labFilesAll = readdirSync(join(cs, 'labs'));
const labStats: J = {};
for (const l of labs) {
  const steps: J[] = l.steps ?? [];
  const cmds = steps.map(x => String(x.command ?? ''));
  const stub = cmds.some(c => /^man \d+_\d+/.test(c)) || /Ejecuta los comandos fundamentales del objetivo/.test(JSON.stringify(steps));
  labStats[l._sid] = { size: l._size, fmt: l._fmt, steps: steps.length, stub, placeholder: !!l.placeholder, source: !!l.source, emptyCmd: steps.filter(x => !x.command).length, emptyOut: steps.filter(x => !x.expectedOutput).length, firstCmd: cmds[0]?.slice(0, 40) };
}
R.labStats = labStats;
R.labStubs = Object.entries(labStats).filter(([, v]: J) => v.stub || v.size < 1200).map(([k]) => k);
R.labGlobals = R.labFilesAll.filter((f: string) => !subIds.has(f.replace(/\.(json|yaml)$/, '')));

// ---- Preguntas
const qStats: J = {};
const qBySub = new Map<string, J[]>();
for (const q of questions) { const a = qBySub.get(q.subtopicId) ?? []; a.push(q); qBySub.set(q.subtopicId, a); }
for (const s of subs) {
  const qs = qBySub.get(s.id) ?? [];
  qStats[s.id] = { n: qs.length, verified: qs.filter(q => q.verified).length, placeholder: qs.filter(q => q.placeholder).length, noExpl: qs.filter(q => !q.explanation || String(q.explanation).trim().length < 10).length, types: qs.reduce((a: J, q) => { a[q.type] = (a[q.type] ?? 0) + 1; return a; }, {}) };
}
R.questionsTotal = questions.length;
R.questionsWithBadSubtopic = [...new Set(questions.filter(q => !subIds.has(q.subtopicId)).map(q => q.subtopicId))];
R.questionsNoExplanation = questions.filter(q => !q.explanation || String(q.explanation).trim().length < 10).length;
R.questionsVerified = questions.filter(q => q.verified).length;
R.questionsStatusCounts = questions.reduce((a: J, q) => { a[q.status ?? 'undef'] = (a[q.status ?? 'undef'] ?? 0) + 1; return a; }, {});
R.questionsPlaceholder = questions.filter(q => q.placeholder).length;
R.questionsEnglishPrompts = questions.filter(q => /\b(Which|What|Where|Following|following|command|which)\b/.test(q.prompt) && !/\b(cuál|qué|cual|comando)\b/i.test(q.prompt)).length;
R.questionsNoCorrect = questions.filter(q => q.type !== 'fill' && (!q.correct || q.correct.length === 0)).map(q => q.id);
R.questionsCorrectNotInOptions = questions.filter(q => q.options && q.correct && q.correct.some((c: string) => !q.options.find((o: J) => o.id === c))).map(q => q.id);
// duplicados
const qid = new Map<string, number>(); for (const q of questions) qid.set(q.id, (qid.get(q.id) ?? 0) + 1);
R.questionsDuplicateIds = [...qid.entries()].filter(([, n]) => n > 1);
const qp = new Map<string, string[]>(); for (const q of questions) { const k = norm(q.prompt); const a = qp.get(k) ?? []; a.push(q.id); qp.set(k, a); }
R.questionsSamePrompt = [...qp.values()].filter(v => v.length > 1);
const qo = new Map<string, string[]>(); for (const q of questions) if (q.options) { const k = h(q.options.map((o: J) => norm(o.text)).sort().join('|') + '|' + norm(q.prompt).slice(0, 30)); const a = qo.get(k) ?? []; a.push(q.id); qo.set(k, a); }
R.questionsSameOptionsPermuted = [...qo.values()].filter(v => v.length > 1);
// near-dup (Jaccard de palabras >= .85)
const toks = questions.map(q => new Set(norm(q.prompt).split(' ')));
const near: string[][] = [];
for (let i = 0; i < questions.length; i++) for (let j = i + 1; j < questions.length; j++) {
  let inter = 0; for (const t of toks[i]) if (toks[j].has(t)) inter++;
  const jac = inter / (toks[i].size + toks[j].size - inter);
  if (jac >= 0.85 && norm(questions[i].prompt) !== norm(questions[j].prompt)) near.push([questions[i].id, questions[j].id, jac.toFixed(2)]);
}
R.questionsNearDup = near;
R.questionsStatusSample = questions.filter(q => q.subtopicId === '105.1').map(q => [q.id, q.status, q.verified]);

// ---- Glosario
const gid = new Map<string, number>(); for (const g of glossary) gid.set(g.id, (gid.get(g.id) ?? 0) + 1);
R.glossary = {
  total: glossary.length,
  dupIds: [...gid.entries()].filter(([, n]) => n > 1),
  dupTerms: (() => { const m = new Map<string, string[]>(); for (const g of glossary) { const k = norm(g.term); const a = m.get(k) ?? []; a.push(g.id); m.set(k, a); } return [...m.values()].filter(v => v.length > 1); })(),
  emptyDef: glossary.filter(g => !g.definition || String(g.definition).trim().length < 10).map(g => g.id),
  brokenRelated: glossary.flatMap(g => (g.related ?? []).filter((r: string) => !glossIds.has(r)).map((r: string) => `${g.id}->${r}`)),
  badSubtopic: glossary.flatMap(g => (g.subtopicIds ?? []).filter((x: string) => !subIds.has(x)).map((x: string) => `${g.id}:${x}`)),
  noSubtopic: glossary.filter(g => !g.subtopicIds || g.subtopicIds.length === 0).length,
  nearDupDefinitions: (() => { const m = new Map<string, string[]>(); for (const g of glossary) { const k = h(norm(g.definition)); const a = m.get(k) ?? []; a.push(g.id); m.set(k, a); } return [...m.values()].filter(v => v.length > 1); })(),
};
// ---- Comandos
const cid = new Map<string, number>(); for (const c of commands) cid.set(c.id, (cid.get(c.id) ?? 0) + 1);
const cn = new Map<string, string[]>(); for (const c of commands) { const k = norm(c.name); const a = cn.get(k) ?? []; a.push(c.id); cn.set(k, a); }
R.commands = {
  total: commands.length,
  dupIds: [...cid.entries()].filter(([, n]) => n > 1),
  dupNames: [...cn.values()].filter(v => v.length > 1),
  emptyDesc: commands.filter(c => !c.description || String(c.description).trim().length < 5).map(c => c.id),
  emptySynopsis: commands.filter(c => !c.synopsis).map(c => c.id),
  noFlags: commands.filter(c => !c.flags || c.flags.length === 0).length,
  flagsDashOnly: commands.reduce((a, c) => a + (c.flags ?? []).filter((f: J) => String(f.flag).trim() === '-').length, 0),
  flagsDashOnlyCmds: commands.filter(c => (c.flags ?? []).some((f: J) => String(f.flag).trim() === '-')).length,
  badSubtopic: commands.flatMap(c => (c.subtopicIds ?? []).filter((x: string) => !subIds.has(x)).map((x: string) => `${c.id}:${x}`)),
  noSubtopic: commands.filter(c => !c.subtopicIds || c.subtopicIds.length === 0).map(c => c.id),
  mojibake: commands.filter(c => /[\u00c2\u00c3\ufffd]|�/.test(JSON.stringify(c))).length,
};
R.mojibake = { glossary: glossary.filter(g => /[\ufffd]/.test(JSON.stringify(g))).length, fcx: fcx.filter(g => /[\ufffd]/.test(JSON.stringify(g))).length };

// ---- Flashcards extra
const fid = new Map<string, number>(); for (const f of fcx) fid.set(f.id, (fid.get(f.id) ?? 0) + 1);
const fp = new Map<string, string[]>(); for (const f of fcx) { const k = norm(f.prompt); const a = fp.get(k) ?? []; a.push(f.id); fp.set(k, a); }
R.flashcardsExtra = {
  total: fcx.length,
  dupIds: [...fid.entries()].filter(([, n]) => n > 1),
  samePrompt: [...fp.values()].filter(v => v.length > 1),
  noAnswer: fcx.filter(f => !f.backTitle && !f.backDescription).map(f => f.id),
  badSubtopic: [...new Set(fcx.filter(f => !subIds.has(f.subtopicId)).map(f => f.subtopicId))],
};
// ---- Lecciones: referencias
R.lessonRefs = {
  idVsSubtopic: Object.entries(lessonStats).filter(([k, v]: J) => v.idField !== k || (v.subtopicIdField && v.subtopicIdField !== k)).map(([k, v]: J) => `${k}: id=${v.idField} subtopicId=${v.subtopicIdField}`),
  badCommands: Object.entries(lessonStats).filter(([, v]: J) => v.badCmds.length).map(([k, v]: J) => `${k}: ${v.badCmds.join(',')}`),
  badKeyTermsTotal: Object.values(lessonStats).reduce((a: number, v: J) => a + v.badKeyTerms, 0),
  keyTermsTotal: Object.values(lessonStats).reduce((a: number, v: J) => a + v.keyTerms, 0),
  lessonsWithoutCommands: Object.entries(lessonStats).filter(([, v]: J) => v.nCommands === 0).map(([k]) => k),
};
// Comandos que apuntan a subtemas en commands.yaml
// ---- Erratas
R.errata = errata.map(e => ({ id: e.id, subtopicId: e.subtopicId, ok: subIds.has(e.subtopicId), fixedAt: e.fixedAt ?? null }));

// ---- Matriz 42 × recursos
const cmdBySub = new Map<string, number>(); for (const c of commands) for (const s of c.subtopicIds ?? []) cmdBySub.set(s, (cmdBySub.get(s) ?? 0) + 1);
const glBySub = new Map<string, number>(); for (const g of glossary) for (const s of g.subtopicIds ?? []) glBySub.set(s, (glBySub.get(s) ?? 0) + 1);
const fcBySub = new Map<string, number>(); for (const f of fcx) fcBySub.set(f.subtopicId, (fcBySub.get(f.subtopicId) ?? 0) + 1);
const exFiles = new Set(readdirSync(join(cs, 'exercises')).map(f => f.replace('.yaml', '')));
R.matrix = subs.map(s => {
  const l = lessonStats[s.id] ?? {}; const lb = labStats[s.id] ?? {}; const q = qStats[s.id];
  return { id: s.id, exam: cur.topics.find((t: J) => t.id === s.topicId).examId, weight: s.weight, curPlaceholder: !!s.placeholder, slides: l.slides ?? 0, lessonKB: Math.round((l.size ?? 0) / 1024), blocks: l.blocks ?? 0, titleOnly: l.titleOnly ?? 0, uniqIds: l.uniqIds ?? 0, html: l.types?.html ?? 0, labSteps: lb.steps ?? 0, labStub: !!lb.stub, labKB: +((lb.size ?? 0) / 1024).toFixed(1), q: q.n, qVer: q.verified, flash: fcBySub.get(s.id) ?? 0, cmds: cmdBySub.get(s.id) ?? 0, gloss: glBySub.get(s.id) ?? 0, lessonCmds: l.nCommands ?? 0, keyTerms: l.keyTerms ?? 0, ex: exFiles.has(s.id) };
});

// ---- Cifras UI/README vs reales
const readme = readFileSync(join(root, 'README.md'), 'utf8');
const rd = (re: RegExp) => { const m = readme.match(re); return m ? Number(m[1]) : null; };
R.figures = { readmeSlides: rd(/\*\*(\d+) diapositivas/), readmeCommands: rd(/(\d+) Comandos/), readmeTerms: rd(/(\d+) T[ée]rminos/), real: { slides: totalSlides, commands: commands.length, terms: glossary.length, questions: questions.length, flashcardsExtra: fcx.length, labs: labs.length } };
R.readmeClaims = readme.split(/\r?\n/).map((l, i) => [i + 1, l]).filter(([, l]) => /100\s?%|0 Placeholders|placeholder/i.test(l as string)).map(([i, l]) => `${i}: ${(l as string).trim()}`);
R.selfCheckSlidesWithSrc = Object.entries(lessonStats).filter(([, v]: J) => v.hasSrc > 0).map(([k, v]: J) => `${k}:${v.hasSrc}/${v.slides}`);
R.stubWords = Object.entries(lessonStats).filter(([, v]: J) => v.stubWords > 0).map(([k, v]: J) => `${k}:${v.stubWords}`);
R.webDocumentVestigial = Object.entries(lessonStats).filter(([, v]: J) => v.hasWebDocument).length;

writeFileSync(join(out, 'a4-resultados.json'), JSON.stringify(R, null, 2));
console.log('OK -> a4-resultados.json');
