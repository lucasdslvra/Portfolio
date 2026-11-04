// Vérifie le format des fichiers de télémétrie de public/clips/*.json.
// Usage : npm run validate:telemetry
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateTelemetry } from '../lib/telemetry.ts';

const dir = join(process.cwd(), 'public', 'clips');
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];

if (files.length === 0) {
  console.log('Aucun fichier de télémétrie dans public/clips/ : rien à vérifier.');
  process.exit(0);
}

let failures = 0;
for (const file of files) {
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  } catch (error) {
    failures += 1;
    console.error(`✗ ${file} : JSON invalide (${(error as Error).message})`);
    continue;
  }
  const result = validateTelemetry(data);
  if (result.ok) {
    const { samples, rate } = result.value;
    const duration = samples[samples.length - 1].t;
    console.log(`✓ ${file} : ${samples.length} échantillons, ${rate} Hz, ${duration.toFixed(2)} s`);
  } else {
    failures += 1;
    console.error(`✗ ${file} :`);
    for (const message of result.errors.slice(0, 20)) console.error(`    - ${message}`);
    if (result.errors.length > 20) console.error(`    … et ${result.errors.length - 20} autre(s) erreur(s)`);
  }
}

process.exit(failures ? 1 : 0);
