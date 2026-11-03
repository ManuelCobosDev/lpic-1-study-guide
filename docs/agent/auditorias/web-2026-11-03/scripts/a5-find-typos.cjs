const fs = require('fs');
const path = require('path');

const qDir = path.resolve(__dirname, '../../../../../content-src/questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, file), 'utf8'));
  data.questions.forEach(q => {
    // Check if prompt has obvious typos
    const prompt = q.prompt;
    if (/\b(th e|har d|fil e|connectio ns|tim ezone|f ile|serv er|mus t|witheach|Frida y|me ssage|an other|comma nd|WIFIo I|X1 1|o n disk|redundan t|file syst em)\b/i.test(prompt)) {
      console.log(`[TYPO PROMPT] [${file}] ${q.id}: ${prompt}`);
    }
    (q.options || []).forEach(o => {
      if (/\b(th e|har d|fil e|connectio ns|tim ezone|f ile|serv er|mus t|witheach|Frida y|me ssage|an other|comma nd|WIFIo I|X1 1|o n disk|redundan t|file syst em|EndSect ion|t o the)\b/i.test(o.text)) {
        console.log(`[TYPO OPTION] [${file}] ${q.id} opt ${o.id}: ${o.text}`);
      }
    });
  });
}
