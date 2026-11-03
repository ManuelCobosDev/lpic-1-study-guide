const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  data.questions.forEach(q => {
    const exp = q.explanation.toLowerCase();
    const opts = q.options || [];

    opts.forEach(opt => {
      const isMarkedCorrect = q.correct.includes(opt.id);
      // If an option text is explicitly mentioned in the explanation as the answer, but NOT marked in q.correct
      const optTextClean = opt.text.trim().toLowerCase();
      
      // Look for negative words in explanation referring to this option
      // e.g. "la opción X es incorrecta/inválida" vs "la opción X es la correcta"
    });
  });
}
