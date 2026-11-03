const fs = require('fs');
const path = require('path');

const lessonsDir = path.resolve(__dirname, '../../../../../content-src/lessons');
const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json')).sort();

const checks = [
  // Check nice default
  { name: 'nice default value', regex: /nice[^.!?\n]*(?:por defecto|default)[^.!?\n]*\b([0-9]+)\b/i, validate: m => m[1] === '10', expected: 'nice default is 10' },
  // Check SIGTSTP vs SIGSTOP
  { name: 'Ctrl+Z signal', regex: /ctrl\s*\+\s*z[^.!?\n]*(SIGSTOP|SIGTSTP)/i, validate: m => m[1].toUpperCase() === 'SIGTSTP', expected: 'Ctrl+Z sends SIGTSTP' },
  // Check Ctrl+C signal
  { name: 'Ctrl+C signal', regex: /ctrl\s*\+\s*c[^.!?\n]*(SIGINT|SIGKILL|SIGTERM)/i, validate: m => m[1].toUpperCase() === 'SIGINT', expected: 'Ctrl+C sends SIGINT' },
  // Check /etc/localtime plain text
  { name: 'localtime plain text claim', regex: /localtime[^.!?\n]*(texto plano|plain text)/i, validate: () => false, expected: '/etc/localtime is binary TZif, never plain text' },
  // Check fstab fields count
  { name: 'fstab fields count', regex: /fstab[^.!?\n]*([45678])\s*campos/i, validate: m => m[1] === '6', expected: 'fstab has 6 fields' },
  // Check MBR partition limits
  { name: 'MBR partition limit', regex: /MBR[^.!?\n]*(4|cinco|tres|cuatro)\s*particiones primarias/i, validate: m => /4|cuatro/i.test(m[1]), expected: 'MBR allows max 4 primary partitions' },
  // Check Umask file calculation
  { name: 'umask base for files', regex: /umask[^.!?\n]*(777|666)[^.!?\n]*archivos/i, validate: m => m[1] === '666', expected: 'base for files is 666' }
];

console.log('Running automated fact checks on lessons...');

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(lessonsDir, file), 'utf8'));
  const lessonText = JSON.stringify(data);

  checks.forEach(c => {
    const match = lessonText.match(c.regex);
    if (match) {
      const ok = c.validate(match);
      if (!ok) {
        console.log(`[FACT FAIL] [${file}] Check "${c.name}": matched "${match[0]}", expected: ${c.expected}`);
      } else {
        console.log(`[FACT OK] [${file}] Check "${c.name}": matched "${match[0]}"`);
      }
    }
  });
}
