// Affiche les virages libres pour choisir où placer un nouveau projet.
// Usage : npm run corners
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CORNERS, freeCorners } from '../lib/circuit.ts';

const dir = join(process.cwd(), 'content', 'projects');
const used = new Map<string, string>();
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
  const match = /^corner:\s*["']?([\w-]+)["']?\s*$/m.exec(readFileSync(join(dir, file), 'utf8'));
  if (match) used.set(match[1], file);
}

console.log('Virages du circuit (ordre du tour) :\n');
for (const corner of CORNERS) {
  const owner = used.get(corner.id);
  const label = `  T${corner.turn.padEnd(6)} ${corner.name.padEnd(20)} ${corner.id.padEnd(16)}`;
  console.log(owner ? `${label} occupé par ${owner}` : `${label} libre`);
}

const free = freeCorners([...used.keys()]);
console.log(`\n${free.length} virage(s) libre(s). Pour placer un projet : « corner: <id> » dans son frontmatter.`);
