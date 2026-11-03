const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const gPath = path.resolve(__dirname, '../../../../../content-src/glossary.yaml');
const glossary = yaml.load(fs.readFileSync(gPath, 'utf8'));

console.log(`Analyzing ${glossary.length} glossary terms...`);

glossary.forEach(t => {
  const def = (t.definition || '').toLowerCase();
  // Check for potential errors
  if (t.term.toLowerCase() === 'init' && def.includes('pid 0')) {
    console.log(`[GLOSSARY ERROR] init PID: ${t.definition}`);
  }
  if (t.term.toLowerCase().includes('mbr') && def.includes('gpt')) {
    // ok
  }
  if (def.length < 20) {
    console.log(`[SHORT DEF] ${t.term}: ${t.definition}`);
  }
});
console.log('Done scanning glossary.');
