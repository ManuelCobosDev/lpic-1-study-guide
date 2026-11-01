/**
 * Utility functions for parsing `src` traceability comments and extracting target text.
 * Spec 11 §11.5–11.6
 */
import { Slide } from '../../src/app/core/models/slide.model';
import { Block } from '../../src/app/core/models/block.model';
import { Lab } from '../../src/app/core/models/lab.model';
import { Command } from '../../src/app/core/models/command.model';
import { GlossaryTerm } from '../../src/app/core/models/glossary.model';

export interface ParsedSrc {
  raw: string;
  isMeta: boolean;
  isAutor: boolean;
  unitIds: string[];
}

/**
 * Parses a `src` attribute or comment (e.g. "105.1#u014-u019, 105.1#u022" or "meta" or "autor").
 */
export function parseSrcString(srcStr?: string): ParsedSrc {
  if (!srcStr || !srcStr.trim()) {
    return { raw: '', isMeta: false, isAutor: false, unitIds: [] };
  }

  // Strip comment wrappers if present <!-- src: ... -->
  let clean = srcStr.trim();
  const commentMatch = clean.match(/<!--\s*src:\s*(.*?)\s*-->/i);
  if (commentMatch && commentMatch[1]) {
    clean = commentMatch[1].trim();
  } else if (clean.toLowerCase().startsWith('src:')) {
    clean = clean.substring(4).trim();
  }

  const isMeta = clean.toLowerCase() === 'meta';
  const isAutor = clean.toLowerCase() === 'autor' || clean.toLowerCase() === 'author';

  if (isMeta || isAutor) {
    return { raw: clean, isMeta, isAutor, unitIds: [] };
  }

  const unitIds: string[] = [];
  const parts = clean.split(',').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    // Check range: e.g. 105.1#u014-u019 or 105.1#u014-105.1#u019
    const rangeMatch = part.match(/^(\d{3}\.\d)#u(\d{3,4})-(?:(\d{3}\.\d)#)?u?(\d{3,4})$/);
    if (rangeMatch && rangeMatch[1] && rangeMatch[2] && rangeMatch[4]) {
      const obj = rangeMatch[1];
      const startNum = parseInt(rangeMatch[2], 10);
      const endNum = parseInt(rangeMatch[4], 10);
      for (let n = startNum; n <= endNum; n++) {
        const padded = String(n).padStart(3, '0');
        unitIds.push(`${obj}#u${padded}`);
      }
    } else {
      // Single unit: e.g. 105.1#u022
      const singleMatch = part.match(/^\d{3}\.\d#u\d{3,4}$/);
      if (singleMatch) {
        unitIds.push(part);
      } else {
        // Keep raw token for invalid-check reporting
        unitIds.push(part);
      }
    }
  }

  return {
    raw: clean,
    isMeta: false,
    isAutor: false,
    unitIds
  };
}

/**
 * Extracts all plain text from a block for token search.
 */
export function extractBlockText(block: Block): string {
  const parts: string[] = [];
  switch (block.type) {
    case 'heading':
      parts.push(block.text);
      break;
    case 'paragraph':
      parts.push(block.text);
      break;
    case 'list':
      parts.push(block.items.join(' '));
      break;
    case 'steps':
      for (const item of block.items) {
        parts.push(item.title, item.description);
      }
      break;
    case 'code':
      parts.push(block.code);
      if (block.title) parts.push(block.title);
      break;
    case 'terminal':
      for (const line of block.lines) {
        if (line.command) parts.push(line.command);
        if (line.output) parts.push(line.output);
      }
      break;
    case 'callout':
      if (block.title) parts.push(block.title);
      parts.push(block.content);
      break;
    case 'table':
      parts.push(block.headers.join(' '));
      for (const row of block.rows) {
        parts.push(row.join(' '));
      }
      if (block.caption) parts.push(block.caption);
      break;
    case 'image':
      parts.push(block.alt);
      if (block.caption) parts.push(block.caption);
      break;
    case 'diagram':
      parts.push(block.alt);
      if (block.title) parts.push(block.title);
      if (block.caption) parts.push(block.caption);
      parts.push(JSON.stringify(block.spec));
      break;
    case 'keyterm':
      parts.push(block.term, block.definition);
      break;
    case 'command-ref':
      parts.push(block.name, block.synopsis, block.description);
      break;
    case 'kbd':
      parts.push(block.keys.join(' '));
      if (block.description) parts.push(block.description);
      break;
    case 'quiz-inline':
      parts.push(block.question, block.explanation);
      for (const opt of block.options) {
        parts.push(opt.text);
      }
      break;
    case 'html':
      parts.push(block.sanitizedHtml);
      break;
    case 'slide-html':
      parts.push(block.title);
      if (block.searchableText) parts.push(block.searchableText);
      break;
  }
  return parts.join(' ');
}

/**
 * Extracts target text of an entire subtopic (slides, exercises, lab, commands, glossary).
 */
export function extractTargetCorpus(
  slides: Slide[],
  exercisesText: string,
  lab: Lab | null,
  commands: Command[],
  glossary: GlossaryTerm[]
): string {
  const parts: string[] = [];

  for (const s of slides) {
    parts.push(s.title);
    if (s.notes) parts.push(s.notes);
    for (const b of s.blocks) {
      parts.push(extractBlockText(b));
    }
    if (s.secondaryBlocks) {
      for (const b of s.secondaryBlocks) {
        parts.push(extractBlockText(b));
      }
    }
  }

  if (exercisesText) {
    parts.push(exercisesText);
  }

  if (lab) {
    parts.push(lab.title);
    if (lab.solutionNotes) parts.push(lab.solutionNotes);
    for (const st of lab.steps) {
      parts.push(st.title, st.instruction);
      if (st.command) parts.push(st.command);
      if (st.expectedOutput) parts.push(st.expectedOutput);
      if (st.hint) parts.push(st.hint);
      if (st.examAlert) parts.push(st.examAlert);
    }
  }

  for (const cmd of commands) {
    parts.push(cmd.name, cmd.synopsis, cmd.description);
    if (cmd.example) parts.push(cmd.example);
    if (cmd.flags) {
      for (const fl of cmd.flags) {
        parts.push(fl.flag, fl.description);
      }
    }
  }

  for (const g of glossary) {
    parts.push(g.term, g.definition);
    if (g.related) parts.push(g.related.join(' '));
  }

  return parts.join(' \n ');
}

