const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');

function reviewFile(fileName) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, fileName), 'utf8'));
  console.log(`\n============================= ${fileName} (${data.questions.length}) =============================`);
  data.questions.forEach((q, i) => {
    const correctText = q.type === 'fill' ? q.correct.join(', ') : q.correct.map(c => {
      const opt = (q.options || []).find(o => o.id === c);
      return `${c}) ${opt ? opt.text : '???'}`;
    }).join('; ');
    console.log(`${i+1}. [${q.id}] (${q.subtopicId}) [${q.type}]`);
    console.log(`   Q: ${q.prompt}`);
    console.log(`   -> CORRECT: ${correctText}`);
  });
}

const target = process.argv[2] || '101.json';
reviewFile(target);
