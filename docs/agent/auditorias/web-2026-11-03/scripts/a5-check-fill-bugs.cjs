const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json'));

const fillIssues = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  data.questions.filter(q => q.type === 'fill').forEach(q => {
    const list = [...(q.acceptedAnswers || []), ...(q.correct || [])];
    list.forEach(ans => {
      if (ans.includes('(') || ans.includes(')') || ans.includes('también') || ans.includes('válido') || ans.includes('o ')) {
        fillIssues.push({
          id: q.id,
          file,
          prompt: q.prompt,
          correct: q.correct,
          acceptedAnswers: q.acceptedAnswers
        });
      }
    });
  });
}

console.log(`Fill questions with contaminated text in correct/acceptedAnswers: ${fillIssues.length}`);
fillIssues.forEach(i => {
  console.log(`\n[${i.file}] ${i.id}`);
  console.log(`Prompt: ${i.prompt}`);
  console.log(`Correct array:`, i.correct);
});
