const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  console.log(`\n================================ FILE: ${file} (${data.questions.length} questions) ================================`);
  data.questions.forEach((q, idx) => {
    const opts = (q.options || []).map(o => `${o.id}) ${o.text}`).join(' | ');
    console.log(`\n[${q.id}] Subtopic: ${q.subtopicId} | Type: ${q.type} | Correct: [${q.correct.join(', ')}]`);
    console.log(`Q: ${q.prompt}`);
    console.log(`Opts: ${opts}`);
    console.log(`Exp: ${q.explanation}`);
  });
}
