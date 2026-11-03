const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const cmdPath = path.resolve(__dirname, '../../../../../content-src/commands.yaml');
const commands = yaml.load(fs.readFileSync(cmdPath, 'utf8'));

console.log(`Loaded ${commands.length} commands from commands.yaml`);

let dashOnlyFlagsCount = 0;
let cmdsWithDashOnly = [];
let cmdsWithoutFlags = [];

commands.forEach(cmd => {
  const flags = cmd.flags || [];
  if (flags.length === 0) {
    cmdsWithoutFlags.push(cmd.name);
  }
  const bad = flags.filter(f => f.flag === '-' || f.flag.trim() === '-');
  if (bad.length > 0) {
    dashOnlyFlagsCount += bad.length;
    cmdsWithDashOnly.push({ name: cmd.name, count: bad.length, examples: bad.slice(0, 3) });
  }
});

console.log(`Commands without flags: ${cmdsWithoutFlags.length} (${cmdsWithoutFlags.slice(0, 10).join(', ')}...)`);
console.log(`Total flags with name "-": ${dashOnlyFlagsCount} across ${cmdsWithDashOnly.length} commands`);
console.log('Sample commands with "-" flag:');
cmdsWithDashOnly.slice(0, 5).forEach(c => {
  console.log(`  ${c.name} (${c.count} bad flags):`, c.examples.map(e => `[desc: "${e.description}"]`));
});
