const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json')).sort();

console.log('Searching for possible inverted or wrong answer keys...');

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  data.questions.forEach(q => {
    if (q.type === 'fill') return;
    const exp = q.explanation;
    const correct = q.correct || [];

    // Check if the explanation mentions option texts
    const markedOpts = (q.options || []).filter(o => correct.includes(o.id));
    const unMarkedOpts = (q.options || []).filter(o => !correct.includes(o.id));

    // Check if explanation mentions "incorrecta" or "no es" near the text of a marked option
    markedOpts.forEach(mo => {
      const words = mo.text.replace(/[^a-zA-Z0-9_\-\/]/g, ' ').split(/\s+/).filter(w => w.length > 3);
      for (const w of words) {
        const regexBad = new RegExp(`(no es|inválid|incorrect|fals|error|falla)[^.!?]{0,60}\\b${w}\\b`, 'i');
        if (regexBad.test(exp)) {
          console.log(`[SUSPECT MARKED OPTION] [${file}] ${q.id} (opt ${mo.id}: "${mo.text}") matches negative explanation phrasing!`);
          console.log(`   Exp: ${exp}`);
        }
      }
    });

    // Check if explanation mentions positive near an unmarked option
    unMarkedOpts.forEach(uo => {
      const words = uo.text.replace(/[^a-zA-Z0-9_\-\/]/g, ' ').split(/\s+/).filter(w => w.length > 4);
      for (const w of words) {
        const regexGood = new RegExp(`(es la correcta|debe ser|es el único|única respuesta|correcta es)[^.!?]{0,60}\\b${w}\\b`, 'i');
        if (regexGood.test(exp)) {
          console.log(`[SUSPECT UNMARKED OPTION] [${file}] ${q.id} (opt ${uo.id}: "${uo.text}") matches positive explanation phrasing!`);
          console.log(`   Exp: ${exp}`);
        }
      }
    });
  });
}
