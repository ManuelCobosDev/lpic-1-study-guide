const fs = require('fs');
const path = require('path');

const lessonsDir = path.resolve(__dirname, '../../../../../content-src/lessons');
const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json')).sort();

let totalEmojiCount = 0;
const lessonsWithEmoji = [];
const anglicisms = [];

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(lessonsDir, f), 'utf8'));
  const text = JSON.stringify(data);

  // Emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = text.match(emojiRegex) || [];
  if (emojis.length > 0) {
    totalEmojiCount += emojis.length;
    lessonsWithEmoji.push({ file: f, count: emojis.length, sample: [...new Set(emojis)].slice(0, 5).join(' ') });
  }

  // Check "librería" vs "biblioteca"
  const libMatch = text.match(/\blibrer[íi]as?\b/gi);
  if (libMatch) {
    anglicisms.push({ file: f, term: 'librería', count: libMatch.length });
  }
});

console.log(`Total emojis across lessons: ${totalEmojiCount} across ${lessonsWithEmoji.length} lessons`);
console.log('Sample lessons with emojis:');
lessonsWithEmoji.slice(0, 10).forEach(l => console.log(`  ${l.file}: ${l.count} emojis (${l.sample})`));

console.log(`\nLessons using "librería" (falso amigo de "library/biblioteca"): ${anglicisms.length}`);
anglicisms.slice(0, 10).forEach(a => console.log(`  ${a.file}: ${a.count} occurrences`));
