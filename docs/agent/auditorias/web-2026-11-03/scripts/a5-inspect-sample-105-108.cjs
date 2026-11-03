const fs = require('fs');
const path = require('path');

const lessonsDir = path.resolve(__dirname, '../../../../../content-src/lessons');
const sampleLessons = ['105.2', '106.1', '106.2', '106.3', '107.1', '107.2', '107.3', '108.1', '108.2'];

sampleLessons.forEach(id => {
  const file = path.join(lessonsDir, `${id}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`\n=================== LESSON ${id}: ${data.title} (${data.slides.length} slides) ===================`);
  data.slides.forEach((s, idx) => {
    const blockTypes = (s.blocks || []).map(b => b.type).join(', ');
    console.log(`Slide ${idx+1}: "${s.title}" [blocks: ${blockTypes}]`);
  });
});
