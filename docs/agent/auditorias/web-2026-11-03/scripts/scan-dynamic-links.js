import fs from 'node:fs';
import path from 'node:path';

function walk(dir, ext) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath, ext));
      } else {
        if (ext.some(e => fullPath.endsWith(e))) results.push(fullPath);
      }
    }
  } catch (err) {
    console.error('Error walking ' + dir, err);
  }
  return results;
}

const srcFiles = walk('./src', ['.ts', '.html']);

// Find all dynamic routerLinks
const dynamicLinks = [];
const rlBindingRegex = /\[routerLink\]="([^"]+)"/g;
for (const file of srcFiles) {
  const rel = file.replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = rlBindingRegex.exec(text)) !== null) {
    dynamicLinks.push({ binding: match[1], file: rel, line: text.substring(0, match.index).split('\n').length });
  }
}

console.log('Dynamic [routerLink] count:', dynamicLinks.length);
console.log(JSON.stringify(dynamicLinks, null, 2));

// Check router.navigate calls
const navigateCalls = [];
const navRegex = /router\.navigate\(([^)]+)\)/g;
for (const file of srcFiles) {
  const rel = file.replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = navRegex.exec(text)) !== null) {
    navigateCalls.push({ call: match[1].trim(), file: rel, line: text.substring(0, match.index).split('\n').length });
  }
}
console.log('\n--- ROUTER.NAVIGATE CALLS (' + navigateCalls.length + ') ---');
console.log(JSON.stringify(navigateCalls, null, 2));

// Check autolink engine
const autolinkFile = './src/app/core/engines/autolink/autolink.engine.ts';
if (fs.existsSync(autolinkFile)) {
  const text = fs.readFileSync(autolinkFile, 'utf8');
  console.log('\n--- AUTOLINK ENGINE EXCERPTS ---');
  const matches = text.match(/href=["'][^"']+["']|\/comandos[^\s"']*|\/glosario[^\s"']*|\/estudiar[^\s"']*/g);
  console.log(matches ? Array.from(new Set(matches)) : 'None');
}
