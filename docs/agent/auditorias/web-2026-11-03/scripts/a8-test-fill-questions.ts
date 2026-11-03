import * as fs from 'fs';
import {
  isAnswerCorrect,
  normalizeAnswer
} from '../../../../../src/app/core/engines/scoring/scoring.engine';
import { Question } from '../../../../../src/app/core/models/question.model';

const allQuestions: Question[] = [];
for (let t = 101; t <= 110; t++) {
  const d = JSON.parse(fs.readFileSync(`public/content/questions/${t}.json`, 'utf8'));
  allQuestions.push(...(d.questions || []));
}

const fillQuestions = allQuestions.filter(q => q.type === 'fill');
console.log(`Found ${fillQuestions.length} fill-in questions.`);

const issues: any[] = [];

for (const q of fillQuestions) {
  // Check 1: Does the default 'correct[0]' pass isAnswerCorrect?
  const defaultCorrect = q.correct[0];
  const passesDefault = isAnswerCorrect(q, { questionId: q.id, textAnswer: defaultCorrect, flagged: false, answeredAt: '' });
  if (!passesDefault) {
    issues.push({ id: q.id, issue: 'Default correct[0] FAILS isAnswerCorrect', correct: q.correct, accepted: q.acceptedAnswers });
  }

  // Check 2: Does practice mode evaluation logic in question-card match scoring.engine?
  // In question-card.component.ts:
  // const accepted = (q.acceptedAnswers ?? []).map((a) => a.trim().toLowerCase().replace(/\s+/g, ' '));
  // return accepted.includes(txt);
  const practiceAccepted = (q.acceptedAnswers ?? []).map(a => a.trim().toLowerCase().replace(/\s+/g, ' '));
  const practicePassesDefault = practiceAccepted.includes((defaultCorrect || '').trim().toLowerCase().replace(/\s+/g, ' '));
  if (!practicePassesDefault) {
    issues.push({ id: q.id, issue: 'Default correct[0] FAILS practice mode isPracticeAnswerCorrect', correct: defaultCorrect, practiceAccepted });
  }

  // Check 3: Look for "(también aceptado...)" notes in acceptedAnswers or correct
  for (const acc of (q.acceptedAnswers || [])) {
    if (acc.includes('(') || acc.includes(')')) {
      issues.push({ id: q.id, issue: 'Parenthetical human note leaked into acceptedAnswers string', entry: acc });
    }
  }

  // Check 4: If prompt asks for directory, does it accept both with and without trailing slash?
  if (defaultCorrect.startsWith('/')) {
    const withoutSlash = defaultCorrect.replace(/\/+$/, '');
    const withSlash = withoutSlash + '/';
    const passesWithout = isAnswerCorrect(q, { questionId: q.id, textAnswer: withoutSlash, flagged: false, answeredAt: '' });
    const passesWith = isAnswerCorrect(q, { questionId: q.id, textAnswer: withSlash, flagged: false, answeredAt: '' });
    if (!passesWithout || !passesWith) {
      issues.push({
        id: q.id,
        issue: 'Directory path does not accept both with and without trailing slash',
        withoutSlash,
        passesWithout,
        withSlash,
        passesWith,
        accepted: q.acceptedAnswers
      });
    }
  }

  // Check 5: If command starts with $
  for (const acc of (q.acceptedAnswers || [])) {
    if (acc.startsWith('$')) {
      issues.push({ id: q.id, issue: 'Accepted answer contains bash prompt symbol $', entry: acc });
    }
  }
}

console.log('Issues found:', issues.length);
console.log(JSON.stringify(issues, null, 2));
