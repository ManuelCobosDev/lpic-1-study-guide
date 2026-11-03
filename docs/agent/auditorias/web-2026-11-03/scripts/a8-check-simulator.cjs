const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('public/content/manifest.json', 'utf8'));

// Import questions for 101 and 102
function loadQuestions(examId) {
  const topics = examId === '101' ? ['101', '102', '103', '104'] : ['105', '106', '107', '108', '109', '110'];
  let list = [];
  for (const t of topics) {
    const data = JSON.parse(fs.readFileSync(`public/content/questions/${t}.json`, 'utf8'));
    list.push(...(data.questions || []));
  }
  return list;
}

const q101 = loadQuestions('101');
const q102 = loadQuestions('102');

console.log('Total Q 101:', q101.length);
console.log('Total Q 102:', q102.length);

// Count questions per subtopic
const countBySubtopic101 = {};
for (const q of q101) {
  countBySubtopic101[q.subtopicId] = (countBySubtopic101[q.subtopicId] || 0) + 1;
}
console.log('Q per subtopic 101:', countBySubtopic101);

const countBySubtopic102 = {};
for (const q of q102) {
  countBySubtopic102[q.subtopicId] = (countBySubtopic102[q.subtopicId] || 0) + 1;
}
console.log('Q per subtopic 102:', countBySubtopic102);

// Check if any subtopic has 0 questions
for (const s of manifest.subtopics) {
  const c = (parseInt(s.topicId) <= 104 ? countBySubtopic101 : countBySubtopic102)[s.id] || 0;
  if (c === 0) {
    console.warn(`WARNING: Subtopic ${s.id} (weight ${s.weight}) has ZERO questions!`);
  }
}
