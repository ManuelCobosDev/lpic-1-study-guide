import * as fs from 'node:fs';
import * as path from 'node:path';

interface Block {
  type: string;
  [key: string]: any;
}

interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  layout: string;
  blocks: Block[];
  secondaryBlocks?: Block[];
  notes?: string;
  src?: string;
}

interface Lesson {
  id: string;
  topicId: string;
  examId: string;
  title: string;
  placeholder?: boolean;
  slides: Slide[];
  estimatedMinutes?: number;
  objectives?: string[];
  keyTerms?: string[];
  commands?: string[];
}

interface SlideAnalysis {
  id: string;
  slideNumber: number;
  title: string;
  layout: string;
  blocksCount: number;
  blockTypes: string[];
  wordCount: number;
  charCount: number;
  maxCodeLines: number;
  maxListItems: number;
  maxTableRows: number;
  maxTableCols: number;
  hasHtmlBlock: boolean;
  isCover: boolean;
  isSummary: boolean;
  isEmpty: boolean;
  isSkeletonOnlyTitle: boolean;
  hasTitleDuplicatedInBlocks: boolean;
  duplicateTitleText?: string;
  violations: string[];
}

interface LessonAnalysis {
  id: string;
  examId: string;
  topicId: string;
  title: string;
  placeholder: boolean;
  totalSlides: number;
  slidesCountExceeds20: boolean;
  hasDuplicateSlideIds: boolean;
  duplicateSlideIds: string[];
  hasSlideNumberIssues: boolean;
  slideNumbers: number[];
  emptySlidesCount: number;
  skeletonSlidesCount: number;
  coverSlideHasDuplicatedTitle: boolean;
  hasSummaryClosingSlide: boolean;
  closingSlideTitle: string;
  overflowRiskSlidesCount: number;
  canonicalViolationsCount: number;
  slides: SlideAnalysis[];
}

function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function analyzeBlock(block: Block): {
  text: string;
  codeLines: number;
  listItems: number;
  tableRows: number;
  tableCols: number;
  isHeading: boolean;
  headingText: string;
  hasHtml: boolean;
} {
  let text = '';
  let codeLines = 0;
  let listItems = 0;
  let tableRows = 0;
  let tableCols = 0;
  let isHeading = false;
  let headingText = '';
  let hasHtml = false;

  switch (block.type) {
    case 'heading':
      isHeading = true;
      headingText = block.text || '';
      text += ' ' + headingText;
      break;
    case 'paragraph':
      text += ' ' + (block.text || '');
      break;
    case 'list':
      if (Array.isArray(block.items)) {
        listItems = block.items.length;
        text += ' ' + block.items.join(' ');
      }
      break;
    case 'steps':
      if (Array.isArray(block.items)) {
        listItems = block.items.length;
        text += ' ' + block.items.map((i: any) => `${i.title || ''} ${i.description || ''}`).join(' ');
      }
      break;
    case 'code':
      if (block.code) {
        codeLines = block.code.split('\n').length;
        text += ' ' + block.code;
      }
      break;
    case 'terminal':
      if (Array.isArray(block.lines)) {
        codeLines = block.lines.length;
        text += ' ' + block.lines.map((l: any) => `${l.prompt || ''} ${l.command || ''} ${l.output || ''}`).join(' ');
      }
      break;
    case 'callout':
      text += ` ${block.title || ''} ${block.content || ''}`;
      break;
    case 'table':
      if (Array.isArray(block.rows)) {
        tableRows = block.rows.length;
        tableCols = Array.isArray(block.headers) ? block.headers.length : (block.rows[0]?.length || 0);
        text += ' ' + (block.headers || []).join(' ');
        for (const r of block.rows) {
          text += ' ' + (Array.isArray(r) ? r.join(' ') : '');
        }
      }
      break;
    case 'keyterm':
      text += ` ${block.term || ''} ${block.definition || ''}`;
      break;
    case 'command-ref':
      text += ` ${block.name || ''} ${block.synopsis || ''} ${block.description || ''}`;
      break;
    case 'html':
      hasHtml = true;
      text += ' ' + (block.sanitizedHtml || '');
      break;
    case 'slide-html':
      hasHtml = true;
      text += ` ${block.title || ''} ${block.searchableText || ''}`;
      break;
    case 'diagram':
      text += ` ${block.title || ''} ${block.caption || ''} ${block.alt || ''}`;
      break;
    default:
      if (block.text) text += ' ' + block.text;
      break;
  }

  return { text, codeLines, listItems, tableRows, tableCols, isHeading, headingText, hasHtml };
}

function runAnalysis() {
  const lessonsDir = path.resolve(process.cwd(), 'content-src', 'lessons');
  const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json')).sort((a, b) => {
    const numA = parseFloat(a.replace('.json', ''));
    const numB = parseFloat(b.replace('.json', ''));
    return numA - numB;
  });

  const globalIdMap = new Map<string, string[]>(); // slideId -> lessonIds
  const lessonsAnalysis: LessonAnalysis[] = [];
  let totalAllSlides = 0;
  let totalCanonicalViolations = 0;
  let totalWordLimitViolations = 0;
  let totalCodeLineViolations = 0;
  let totalListItemViolations = 0;
  let totalTableRowViolations = 0;
  let totalBlocksViolations = 0;
  let totalDuplicateTitleViolations = 0;
  let totalSkeletonViolations = 0;

  for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Lesson;

    const slideIdsInLesson = new Map<string, number>();
    const duplicateIds: string[] = [];
    const slideNumbers: number[] = [];
    let emptySlidesCount = 0;
    let skeletonSlidesCount = 0;
    let overflowRiskSlidesCount = 0;
    let canonicalViolationsCount = 0;

    const slidesAnalysis: SlideAnalysis[] = [];

    const slides = content.slides || [];
    totalAllSlides += slides.length;

    for (let idx = 0; idx < slides.length; idx++) {
      const slide = slides[idx];
      slideNumbers.push(slide.slideNumber);

      // Track slide IDs
      const count = (slideIdsInLesson.get(slide.id) || 0) + 1;
      slideIdsInLesson.set(slide.id, count);
      if (count === 2) {
        duplicateIds.push(slide.id);
      }

      if (!globalIdMap.has(slide.id)) {
        globalIdMap.set(slide.id, []);
      }
      globalIdMap.get(slide.id)!.push(content.id);

      // Blocks analysis
      const allBlocks = [...(slide.blocks || []), ...(slide.secondaryBlocks || [])];
      let fullText = '';
      let maxCodeLines = 0;
      let maxListItems = 0;
      let maxTableRows = 0;
      let maxTableCols = 0;
      let hasHtmlBlock = false;
      let firstHeadingText: string | null = null;

      for (let bIdx = 0; bIdx < allBlocks.length; bIdx++) {
        const b = allBlocks[bIdx];
        const res = analyzeBlock(b);
        fullText += ' ' + res.text;
        if (res.codeLines > maxCodeLines) maxCodeLines = res.codeLines;
        if (res.listItems > maxListItems) maxListItems = res.listItems;
        if (res.tableRows > maxTableRows) maxTableRows = res.tableRows;
        if (res.tableCols > maxTableCols) maxTableCols = res.tableCols;
        if (res.hasHtml) hasHtmlBlock = true;
        if (bIdx === 0 && res.isHeading) {
          firstHeadingText = res.headingText;
        }
      }

      const words = countWords(fullText);
      const chars = fullText.trim().length;

      const isCover = idx === 0 || slide.layout === 'cover';
      const isSummary = idx === slides.length - 1 || slide.layout === 'summary' || /resumen/i.test(slide.title);
      const isEmpty = allBlocks.length === 0 || chars === 0;

      // Skeleton slide: only 1 heading block and no other block
      const isSkeletonOnlyTitle = allBlocks.length === 1 && allBlocks[0].type === 'heading';

      // Check title duplication: does slide.title match or appear verbatim in firstHeadingText?
      let hasTitleDuplicatedInBlocks = false;
      let duplicateTitleText: string | undefined;
      if (firstHeadingText) {
        const normSlideTitle = slide.title.trim().toLowerCase().replace(/^\d+\.\d+\s*/, '');
        const normHeading = firstHeadingText.trim().toLowerCase().replace(/^\d+\.\d+\s*/, '');
        if (normSlideTitle === normHeading || firstHeadingText.trim().toLowerCase() === slide.title.trim().toLowerCase()) {
          hasTitleDuplicatedInBlocks = true;
          duplicateTitleText = firstHeadingText;
        }
      }

      const violations: string[] = [];

      // Check canonical rules:
      // Canonical Rule 1: No duplicated title inside blocks (since viewer header already shows title)
      if (hasTitleDuplicatedInBlocks) {
        violations.push('DUPLICATE_TITLE_IN_BLOCKS');
        totalDuplicateTitleViolations++;
      }

      // Canonical Rule 2: Not a skeleton slide
      if (isSkeletonOnlyTitle || isEmpty) {
        violations.push('SKELETON_OR_EMPTY_SLIDE');
        totalSkeletonViolations++;
      }

      // Canonical Rule 3: Word count limit <= 140 (Spec 12 §12.1)
      if (words > 140) {
        violations.push(`WORD_LIMIT_EXCEEDED (${words} > 140)`);
        totalWordLimitViolations++;
      }

      // Canonical Rule 4: Code lines limit <= 14 (Spec 12 §12.1)
      if (maxCodeLines > 14) {
        violations.push(`CODE_LINES_EXCEEDED (${maxCodeLines} > 14)`);
        totalCodeLineViolations++;
      }

      // Canonical Rule 5: List items limit <= 7 (Spec 12 §12.1)
      if (maxListItems > 7) {
        violations.push(`LIST_ITEMS_EXCEEDED (${maxListItems} > 7)`);
        totalListItemViolations++;
      }

      // Canonical Rule 6: Table rows limit <= 6 (to prevent 16:9 vertical overflow)
      if (maxTableRows > 6) {
        violations.push(`TABLE_ROWS_EXCEEDED (${maxTableRows} > 6)`);
        totalTableRowViolations++;
      }

      // Canonical Rule 7: Max blocks <= 3 (to fit in 1280x720 canvas comfortably)
      if (allBlocks.length > 3) {
        violations.push(`TOO_MANY_BLOCKS (${allBlocks.length} > 3)`);
        totalBlocksViolations++;
      }

      // Overflow risk overall flag
      const isOverflowRisk = words > 140 || maxCodeLines > 14 || maxTableRows > 6 || maxListItems > 7 || allBlocks.length > 4 || chars > 700;
      if (isOverflowRisk) {
        overflowRiskSlidesCount++;
      }

      if (violations.length > 0) {
        canonicalViolationsCount++;
        totalCanonicalViolations++;
      }

      if (isEmpty) emptySlidesCount++;
      if (isSkeletonOnlyTitle) skeletonSlidesCount++;

      slidesAnalysis.push({
        id: slide.id,
        slideNumber: slide.slideNumber,
        title: slide.title,
        layout: slide.layout,
        blocksCount: allBlocks.length,
        blockTypes: allBlocks.map(b => b.type),
        wordCount: words,
        charCount: chars,
        maxCodeLines,
        maxListItems,
        maxTableRows,
        maxTableCols,
        hasHtmlBlock,
        isCover,
        isSummary,
        isEmpty,
        isSkeletonOnlyTitle,
        hasTitleDuplicatedInBlocks,
        duplicateTitleText,
        violations
      });
    }

    // Check slideNumber issues: must be consecutive 1..N
    const expectedSlideNumbers = Array.from({ length: slides.length }, (_, i) => i + 1);
    const hasSlideNumberIssues = JSON.stringify(slideNumbers) !== JSON.stringify(expectedSlideNumbers);

    const coverSlide = slidesAnalysis[0];
    const coverSlideHasDuplicatedTitle = coverSlide ? coverSlide.hasTitleDuplicatedInBlocks : false;

    const lastSlide = slidesAnalysis[slidesAnalysis.length - 1];
    const hasSummaryClosingSlide = lastSlide ? (lastSlide.layout === 'summary' || /resumen/i.test(lastSlide.title)) : false;
    const closingSlideTitle = lastSlide ? lastSlide.title : '';

    lessonsAnalysis.push({
      id: content.id,
      examId: content.examId,
      topicId: content.topicId,
      title: content.title,
      placeholder: !!content.placeholder,
      totalSlides: slides.length,
      slidesCountExceeds20: slides.length > 20,
      hasDuplicateSlideIds: duplicateIds.length > 0,
      duplicateSlideIds: duplicateIds,
      hasSlideNumberIssues,
      slideNumbers,
      emptySlidesCount,
      skeletonSlidesCount,
      coverSlideHasDuplicatedTitle,
      hasSummaryClosingSlide,
      closingSlideTitle,
      overflowRiskSlidesCount,
      canonicalViolationsCount,
      slides: slidesAnalysis
    });
  }

  // Cross-lesson duplicate slide IDs
  const crossLessonDuplicates: { slideId: string; lessons: string[] }[] = [];
  for (const [sId, lIds] of globalIdMap.entries()) {
    if (lIds.length > 1) {
      crossLessonDuplicates.push({ slideId: sId, lessons: lIds });
    }
  }

  const result = {
    summary: {
      totalLessons: lessonsAnalysis.length,
      totalSlides: totalAllSlides,
      lessonsExceeding20Slides: lessonsAnalysis.filter(l => l.slidesCountExceeds20).map(l => ({ id: l.id, count: l.totalSlides })),
      lessonsWithDuplicateSlideIds: lessonsAnalysis.filter(l => l.hasDuplicateSlideIds).map(l => ({ id: l.id, duplicates: l.duplicateSlideIds })),
      lessonsWithSlideNumberIssues: lessonsAnalysis.filter(l => l.hasSlideNumberIssues).map(l => ({ id: l.id, count: l.totalSlides, numbersSample: l.slideNumbers.slice(0, 5) })),
      crossLessonDuplicateIdsCount: crossLessonDuplicates.length,
      crossLessonDuplicates,
      totalEmptySlides: lessonsAnalysis.reduce((acc, l) => acc + l.emptySlidesCount, 0),
      totalSkeletonSlides: lessonsAnalysis.reduce((acc, l) => acc + l.skeletonSlidesCount, 0),
      lessonsWithSkeletonSlides: lessonsAnalysis.filter(l => l.skeletonSlidesCount > 0).map(l => ({ id: l.id, skeletonSlides: l.skeletonSlidesCount, total: l.totalSlides })),
      lessonsCoverDuplicatedTitleCount: lessonsAnalysis.filter(l => l.coverSlideHasDuplicatedTitle).length,
      lessonsMissingSummaryClosingCount: lessonsAnalysis.filter(l => !l.hasSummaryClosingSlide).length,
      totalOverflowRiskSlides: lessonsAnalysis.reduce((acc, l) => acc + l.overflowRiskSlidesCount, 0),
      totalCanonicalViolations,
      violationBreakdown: {
        duplicateTitleInBlocks: totalDuplicateTitleViolations,
        skeletonOrEmpty: totalSkeletonViolations,
        wordLimitExceeded: totalWordLimitViolations,
        codeLinesExceeded: totalCodeLineViolations,
        listItemsExceeded: totalListItemViolations,
        tableRowsExceeded: totalTableRowViolations,
        tooManyBlocks: totalBlocksViolations
      }
    },
    lessons: lessonsAnalysis
  };

  const outDir = path.resolve(process.cwd(), 'docs', 'agent', 'auditorias', 'web-2026-11-03');
  const outFile = path.join(outDir, 'a3-analisis-lecciones.json');
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Analizados ${lessonsAnalysis.length} lecciones y ${totalAllSlides} diapositivas.`);
  console.log(`Archivo generado en: ${outFile}`);
  console.log('Resumen:', JSON.stringify(result.summary, null, 2));
}

runAnalysis();
