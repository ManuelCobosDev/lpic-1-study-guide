const fs = require('fs');
const path = require('path');

const lessonsDir = path.resolve(__dirname, '../../../../../content-src/lessons');

function checkLesson(id) {
  const file = path.join(lessonsDir, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  // Collect all text from all blocks in all slides
  let allText = '';
  let codeSnippets = [];
  let tables = [];
  let callouts = [];

  data.slides.forEach(s => {
    (s.blocks || []).forEach(b => {
      if (b.text) allText += ' ' + b.text;
      if (b.code) codeSnippets.push(b.code);
      if (b.command) codeSnippets.push(b.command);
      if (b.rows) tables.push(b.rows);
      if (b.items) allText += ' ' + b.items.join(' ');
      if (b.html) allText += ' ' + b.html;
    });
  });

  return {
    id,
    title: data.title,
    slidesCount: data.slides.length,
    commands: data.commands || [],
    textLength: allText.length,
    allText,
    codeSnippets,
    tables
  };
}

const lessonIds = [
  '101.1', '101.2', '101.3',
  '102.1', '102.2', '102.3', '102.4', '102.5', '102.6',
  '103.1', '103.2', '103.3', '103.4', '103.5', '103.6', '103.7', '103.8',
  '104.1', '104.2', '104.3', '104.5', '104.6', '104.7',
  '105.1', '105.2',
  '106.1', '106.2', '106.3',
  '107.1', '107.2', '107.3',
  '108.1', '108.2'
];

lessonIds.forEach(id => {
  const res = checkLesson(id);
  if (res) {
    console.log(`[${res.id}] Slides: ${res.slidesCount} | Cmds: ${res.commands.length} | Text: ${Math.round(res.textLength/1000)}k chars | Title: ${res.title}`);
  }
});
