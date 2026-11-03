const fs = require('fs');
const path = require('path');

const lessonsDir = path.resolve(__dirname, '../../../../../content-src/lessons');

function checkText(lessonId, patterns) {
  const filePath = path.join(lessonsDir, `${lessonId}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`[NOT FOUND] ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`=== Checking ${lessonId} ===`);
  for (const pat of patterns) {
    const regex = new RegExp(pat, 'gi');
    const matches = [...content.matchAll(regex)];
    console.log(`Pattern "${pat}": ${matches.length} matches`);
    matches.slice(0, 3).forEach(m => {
      const idx = m.index;
      const snippet = content.substring(Math.max(0, idx - 40), Math.min(content.length, idx + 80)).replace(/\n/g, ' ');
      console.log(`   Snippet: ...${snippet}...`);
    });
  }
}

// Check err-001 (tee -a in 103.4)
checkText('103.4', ['tee\\s+-a', 'tee']);

// Check err-002 (MBR 4 primary in 102.1)
checkText('102.1', ['particiones primarias', 'extendida', 'MBR']);

// Check err-003 (gdisk / fdisk in 104.1)
checkText('104.1', ['gdisk', 'GPT', 'fdisk']);

// Check legacy E-001 (/dev/fd0 vs /dev/fdO in 101.1)
checkText('101.1', ['/dev/fd[0O]', 'fdO']);

// Check legacy E-002 (núcleo in 101.1)
checkText('101.1', ['operatico', 'sistema operativo']);

// Check legacy E-003 (journalctl in 101.2)
checkText('101.2', ['journalctl', 'binario estructurado', 'texto sin formato']);

// Check legacy E-004 (runlevel0 in 101.3)
checkText('101.3', ['runlevel[0O]\\.target', 'runlevelO']);

// Check legacy E-005 (dnf config-manager in 102.5)
checkText('102.5', ['--add[-_]repo', 'config-manager']);

// Check legacy E-006 (sudo /bin/cat in 103.1)
checkText('103.1', ['sudo/bin/cat', '/bin/cat']);

// Check legacy E-007 (zcat gzip in 103.2)
checkText('103.2', ['zcat', 'utilizando el método']);
