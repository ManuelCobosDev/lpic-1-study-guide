const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json'));

const discrepancies = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  data.questions.forEach(q => {
    const exp = q.explanation;
    const correct = q.correct || [];

    // Search for patterns like "La opción X", "opciones X e Y", "la respuesta correcta es la X", etc.
    const match = exp.match(/(?:opci[oó]n|respuesta)\s+(?:correcta\s+)?(?:es\s+)?(?:la\s+)?([A-Ea-e])\b/i);
    if (match) {
      const mentionedLetter = match[1].toLowerCase();
      if (!correct.includes(mentionedLetter)) {
        discrepancies.push({
          id: q.id,
          file,
          prompt: q.prompt.substring(0, 80),
          correct: correct.join(','),
          mentionedLetter,
          expSnippet: match[0],
          fullExp: exp
        });
      }
    }
  });
}

console.log(`Discrepancies found: ${discrepancies.length}`);
discrepancies.forEach(d => {
  console.log(`[${d.file}] ${d.id}: correct=[${d.correct}] but explanation mentions "${d.expSnippet}"`);
  console.log(`   Prompt: ${d.prompt}`);
  console.log(`   Explanation: ${d.fullExp}\n`);
});
