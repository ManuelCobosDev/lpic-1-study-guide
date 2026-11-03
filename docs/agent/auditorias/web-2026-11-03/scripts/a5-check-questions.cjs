const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json'));

let totalQ = 0;
const issues = [];
const allQuestions = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  const qs = data.questions || [];
  totalQ += qs.length;

  qs.forEach(q => {
    allQuestions.push({ file, ...q });
    const optIds = (q.options || []).map(o => o.id);

    // Check correct
    if (!q.correct || q.correct.length === 0) {
      issues.push({ id: q.id, file, error: 'Sin respuesta correcta' });
    } else {
      q.correct.forEach(c => {
        if (q.type !== 'fill' && !optIds.includes(c)) {
          issues.push({ id: q.id, file, error: `Opción correcta "${c}" no existe en opciones: ${optIds.join(',')}` });
        }
      });
    }

    // Check single vs multiple
    if (q.type === 'single' && q.correct && q.correct.length > 1) {
      issues.push({ id: q.id, file, error: `type="single" pero correct tiene ${q.correct.length} opciones` });
    }
    if (q.type === 'multiple' && q.correct && q.correct.length <= 1) {
      issues.push({ id: q.id, file, error: `type="multiple" pero correct tiene solo ${q.correct.length} opciones` });
    }

    // Check explanation
    if (!q.explanation || q.explanation.trim().length < 10) {
      issues.push({ id: q.id, file, error: 'Explicación vacía o demasiado corta' });
    }

    // Check subtopic match
    if (!q.subtopicId) {
      issues.push({ id: q.id, file, error: 'Sin subtopicId' });
    }
  });
}

console.log(`Total questions analyzed: ${totalQ}`);
console.log(`Structural issues found: ${issues.length}`);
issues.forEach(i => console.log(`[${i.file}] ${i.id}: ${i.error}`));
