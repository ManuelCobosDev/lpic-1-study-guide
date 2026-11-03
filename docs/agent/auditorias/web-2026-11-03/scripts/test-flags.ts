import * as fs from 'node:fs';

const html = fs.readFileSync('_legacy/Recurso Final Definitivo/app/comandos.html', 'utf8');
const pillMatches = html.match(/<div class=["']opt-pill["'][^>]*title=["']([^"']*)["'][^>]*>([\s\S]*?)<\/div>/gi) || [];

let recoveredCount = 0;
let stillBad = 0;
const samples: string[] = [];

for (const pill of pillMatches) {
  const codeMatch = pill.match(/<code class=["']pill-code["']>([\s\S]*?)<\/code>/i);
  if (!codeMatch) {
    stillBad++;
  } else {
    const rawCode = codeMatch[1].trim();
    if (rawCode === '-' || rawCode === '' || rawCode === '--') {
      stillBad++;
    } else {
      recoveredCount++;
      if (samples.length < 5 && rawCode.includes('<')) {
        samples.push(rawCode);
      }
    }
  }
}

console.log('Total pills:', pillMatches.length);
console.log('Recovered code:', recoveredCount);
console.log('Still bad (should be 0 or minimal):', stillBad);
console.log('Samples with placeholders:', samples);

