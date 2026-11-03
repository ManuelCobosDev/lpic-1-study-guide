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

const allFiles = [...walk('./src', ['.ts', '.html', '.css']), ...walk('./content-src', ['.json', '.yaml', '.yml'])];

const urlRegex = /https?:\/\/[^\s"'`<>]+[^\s"'`<>\.,;:]/g;
const foundUrls = new Map();

for (const f of allFiles) {
  const rel = f.replace(/\\/g, '/');
  const text = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    if (!foundUrls.has(url)) {
      foundUrls.set(url, []);
    }
    foundUrls.get(url).push(rel);
  }
}

console.log('Unique external URLs found:', foundUrls.size);
for (const [url, files] of Array.from(foundUrls.entries())) {
  console.log(url, 'in', files.slice(0, 2).join(', '), files.length > 2 ? `(+${files.length - 2})` : '');
}
