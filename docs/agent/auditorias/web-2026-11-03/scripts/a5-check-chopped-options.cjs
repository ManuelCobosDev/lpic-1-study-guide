const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json'));

const choppedQuestions = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  data.questions.forEach(q => {
    const opts = q.options || [];
    // Check if multiple options are identical, or start with fragments like "tee ...", or if there are options named "opt-X"
    const texts = opts.map(o => o.text);
    const hasDupes = texts.some((t, idx) => texts.indexOf(t) !== idx);
    const hasOptName = opts.some(o => o.id.startsWith('opt-'));
    const isSuspicious = opts.some(o => /^(tee|less|grep|xargs|cut|sort|uniq|head|tail|more|cat)\s+[^\s]/.test(o.text) && !q.prompt.toLowerCase().includes(o.text.split(' ')[0]));

    if (hasDupes || hasOptName || isSuspicious) {
      choppedQuestions.push({
        id: q.id,
        file,
        prompt: q.prompt.substring(0, 80),
        hasDupes,
        hasOptName,
        opts: opts.map(o => `${o.id}: "${o.text}"`).join(' | ')
      });
    }
  });
}

console.log(`Suspicious chopped questions: ${choppedQuestions.length}`);
choppedQuestions.forEach(c => {
  console.log(`\n[${c.file}] ${c.id}: dupes=${c.hasDupes}, optName=${c.hasOptName}`);
  console.log(`  Prompt: ${c.prompt}`);
  console.log(`  Options: ${c.opts}`);
});
