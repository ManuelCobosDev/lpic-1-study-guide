import * as fs from 'fs';
import {
  calculateExamScore,
  selectExamQuestions,
  normalizeAnswer,
  isAnswerCorrect
} from '../../../../../src/app/core/engines/scoring/scoring.engine';
import { Question } from '../../../../../src/app/core/models/question.model';
import { SubtopicWeightInfo } from '../../../../../src/app/core/engines/scoring/scoring.engine';

const manifest = JSON.parse(fs.readFileSync('public/content/manifest.json', 'utf8'));

function loadQuestions(examId: '101' | '102'): Question[] {
  const topics = examId === '101' ? ['101', '102', '103', '104'] : ['105', '106', '107', '108', '109', '110'];
  let list: Question[] = [];
  for (const t of topics) {
    const data = JSON.parse(fs.readFileSync(`public/content/questions/${t}.json`, 'utf8'));
    list.push(...(data.questions || []));
  }
  return list;
}

const subtopics101: SubtopicWeightInfo[] = manifest.subtopics
  .filter((s: any) => parseInt(s.topicId) <= 104)
  .map((s: any) => ({ id: s.id, topicId: s.topicId, weight: s.weight }));

const subtopics102: SubtopicWeightInfo[] = manifest.subtopics
  .filter((s: any) => parseInt(s.topicId) >= 105)
  .map((s: any) => ({ id: s.id, topicId: s.topicId, weight: s.weight }));

const q101 = loadQuestions('101');
const q102 = loadQuestions('102');

console.log('Testing 100 seeds for Exam 101...');
for (let seed = 1; seed <= 100; seed++) {
  const selected = selectExamQuestions(q101, subtopics101, 60, seed);
  if (selected.length !== 60) {
    console.error(`Seed ${seed} produced ${selected.length} questions for 101`);
  }
  const idSet = new Set(selected.map(q => q.id));
  if (idSet.size !== 60) {
    console.error(`Seed ${seed} produced DUPLICATES for 101: size ${idSet.size}`);
  }
}

console.log('Testing 100 seeds for Exam 102...');
for (let seed = 1; seed <= 100; seed++) {
  const selected = selectExamQuestions(q102, subtopics102, 60, seed);
  if (selected.length !== 60) {
    console.error(`Seed ${seed} produced ${selected.length} questions for 102`);
  }
  const idSet = new Set(selected.map(q => q.id));
  if (idSet.size !== 60) {
    console.error(`Seed ${seed} produced DUPLICATES for 102: size ${idSet.size}`);
  }
}

// Test scoring edge cases
console.log('Testing scoring edge cases...');
// 1. All unanswered
const s1 = selectExamQuestions(q101, subtopics101, 60, 42);
const scoreZero = calculateExamScore(s1, {}, subtopics101);
console.log('Score with 0 answers:', scoreZero.score, 'passed:', scoreZero.passed, 'expected: 200, false');

// 2. All answered correctly
const perfectAnswers: Record<string, any> = {};
for (const q of s1) {
  if (q.type === 'single') {
    perfectAnswers[q.id] = { selectedOptions: [q.correct[0]] };
  } else if (q.type === 'multiple') {
    perfectAnswers[q.id] = { selectedOptions: [...q.correct] };
  } else if (q.type === 'fill') {
    perfectAnswers[q.id] = { textAnswer: q.acceptedAnswers?.[0] || q.correct[0] };
  }
}
const scorePerfect = calculateExamScore(s1, perfectAnswers, subtopics101);
console.log('Score perfect:', scorePerfect.score, 'passed:', scorePerfect.passed, 'expected: 800, true');

// 3. 50% answered correctly
const halfAnswers: Record<string, any> = {};
for (let i = 0; i < s1.length; i++) {
  const q = s1[i];
  if (i < 30) {
    if (q.type === 'single') halfAnswers[q.id] = { selectedOptions: [q.correct[0]] };
    else if (q.type === 'multiple') halfAnswers[q.id] = { selectedOptions: [...q.correct] };
    else if (q.type === 'fill') halfAnswers[q.id] = { textAnswer: q.acceptedAnswers?.[0] || q.correct[0] };
  } else {
    halfAnswers[q.id] = { selectedOptions: ['wrong'] };
  }
}
const scoreHalf = calculateExamScore(s1, halfAnswers, subtopics101);
console.log('Score 50%:', scoreHalf.score, 'accuracy:', scoreHalf.accuracyPercentage, 'passed:', scoreHalf.passed);
