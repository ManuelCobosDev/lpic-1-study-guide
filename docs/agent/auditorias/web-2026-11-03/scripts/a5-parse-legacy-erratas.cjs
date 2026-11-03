const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../../../../_legacy/Recurso Final Definitivo/app/erratas.html');
const txt = fs.readFileSync(htmlPath, 'utf8');

const regex = /<span class="errata-id-badge">([^<]+)<\/span>[\s\S]*?<span class="errata-ref">([^<]+)<\/span>[\s\S]*?<div class="errata-box box-manual">([\s\S]*?)<\/div>[\s\S]*?<div class="errata-box box-reality">([\s\S]*?)<\/div>/g;

let count = 0;
let m;
console.log('Sample of legacy erratas:');
while ((m = regex.exec(txt)) !== null) {
  count++;
  if (count <= 12) {
    const id = m[1].trim();
    const ref = m[2].trim();
    const manual = m[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const reality = m[4].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    console.log(`\n[${id}] ${ref}`);
    console.log(`  Manual: ${manual}`);
    console.log(`  Realidad: ${reality}`);
  }
}
console.log(`\nTotal legacy erratas found: ${count}`);
