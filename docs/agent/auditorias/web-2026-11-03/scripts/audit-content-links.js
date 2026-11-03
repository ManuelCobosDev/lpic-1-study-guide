import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('./public/content/manifest.json', 'utf8'));
const validSubtopics = new Set(manifest.subtopics.map(s => s.id));
const validTopics = new Set(manifest.topics.map(t => t.id));
const validExams = new Set(manifest.exams.map(e => e.id));

const commands = JSON.parse(fs.readFileSync('./public/content/commands.json', 'utf8'));
const validCommands = new Set(commands.map(c => c.name));

const glossary = JSON.parse(fs.readFileSync('./public/content/glossary.json', 'utf8'));
const validTerms = new Set(glossary.map(g => g.term.toLowerCase()));

console.log('Subtopics:', validSubtopics.size);
console.log('Topics:', validTopics.size);
console.log('Commands:', validCommands.size);
console.log('Glossary terms:', validTerms.size);

// Check curriculum cross-references in lessons
const lessonDir = './content-src/lessons';
const lessonFiles = fs.readdirSync(lessonDir).filter(f => f.endsWith('.json'));

const issues = [];

for (const file of lessonFiles) {
  const subtopicId = file.replace('.json', '');
  if (!validSubtopics.has(subtopicId)) {
    issues.push({ type: 'orphan_lesson_file', file, subtopicId });
  }

  const lesson = JSON.parse(fs.readFileSync(path.join(lessonDir, file), 'utf8'));

  // Check subtopicId inside lesson
  if (lesson.id !== subtopicId) {
    issues.push({ type: 'lesson_id_mismatch', file, id: lesson.id, expected: subtopicId });
  }

  // Check commands referenced in lesson
  if (Array.isArray(lesson.commands)) {
    for (const cmd of lesson.commands) {
      if (!validCommands.has(cmd)) {
        issues.push({ type: 'unknown_command_in_lesson', file, cmd });
      }
    }
  }

  // Check related subtopics
  if (Array.isArray(lesson.relatedSubtopics)) {
    for (const rel of lesson.relatedSubtopics) {
      if (!validSubtopics.has(rel)) {
        issues.push({ type: 'broken_related_subtopic', file, rel });
      }
    }
  }

  // Check markdown links inside slides
  const contentStr = JSON.stringify(lesson);
  const linkMatches = contentStr.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  for (const m of linkMatches) {
    const [, text, target] = m.match(/\[([^\]]+)\]\(([^)]+)\)/);
    // check if target is an internal app route
    if (target.startsWith('/') && !target.startsWith('//')) {
      // Validate internal link
      const clean = target.split('?')[0].split('#')[0];
      if (clean.startsWith('/estudiar/')) {
        const sub = clean.replace('/estudiar/', '');
        if (!validSubtopics.has(sub)) {
          issues.push({ type: 'broken_internal_markdown_link', file, target });
        }
      }
    }
  }
}

// Check commands.yaml / commands.json locations
for (const cmd of commands) {
  if (cmd.subtopics) {
    for (const s of cmd.subtopics) {
      if (!validSubtopics.has(s)) {
        issues.push({ type: 'command_invalid_subtopic', command: cmd.name, subtopic: s });
      }
    }
  }
}

// Check glossary locations
for (const term of glossary) {
  if (term.subtopics) {
    for (const s of term.subtopics) {
      if (!validSubtopics.has(s)) {
        issues.push({ type: 'term_invalid_subtopic', term: term.term, subtopic: s });
      }
    }
  }
}

console.log('Total content link issues found:', issues.length);
console.log(JSON.stringify(issues.slice(0, 30), null, 2));

fs.writeFileSync(
  './docs/agent/auditorias/web-2026-11-03/content-link-issues.json',
  JSON.stringify(issues, null, 2)
);
