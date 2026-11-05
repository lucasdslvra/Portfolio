// Assemble le tour complet (hot lap de l'accueil) à partir des clips des dix virages,
// déjà encodés dans public/clips/ (npm run clips:encode puis npm run telemetry:split) :
//   tour.mp4 / tour.webm : les clips mis bout à bout, sans réencodage (ffmpeg, concat) ;
//   tour.jpg             : poster (première image) ;
//   tour.json            : la télémétrie des clips, recalée sur le temps de la vidéo du tour.
//
// Usage : npm run lap:build
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { CORNERS } from '../lib/circuit.ts';
import { validateTelemetry, type Telemetry, type TelemetrySample } from '../lib/telemetry.ts';

const DIR = join('public', 'clips');
const OUT = 'tour';

const names = CORNERS.map((c) => `${c.turn.split('-')[0].padStart(2, '0')}-${c.id}`);
const missing = names.flatMap((n) => ['mp4', 'webm', 'json'].map((ext) => `${n}.${ext}`)).filter((f) => !existsSync(join(DIR, f)));
if (missing.length) {
  console.error(`Fichiers manquants dans ${DIR}/ : ${missing.join(', ')}`);
  process.exit(1);
}

/** Durée exacte d'un clip : nombre d'images / cadence (les mp4 et webm ont les mêmes images). */
function duration(file: string): number {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-count_packets',
    '-show_entries', 'stream=nb_read_packets,r_frame_rate', '-of', 'csv=p=0', file,
  ]).toString().trim();
  const [rate, frames] = out.split(',');
  const [num, den] = rate.split('/').map(Number);
  return Number(frames) / (num / (den || 1));
}

// 1. Vidéos : concaténation sans réencodage (même codec et mêmes réglages pour tous les clips).
const tmp = mkdtempSync(join(tmpdir(), 'lap-'));
try {
  for (const ext of ['mp4', 'webm'] as const) {
    const list = join(tmp, `${ext}.txt`);
    writeFileSync(list, names.map((n) => `file '${resolve(DIR, `${n}.${ext}`)}'`).join('\n'));
    const extra = ext === 'mp4' ? ['-movflags', '+faststart'] : [];
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', ...extra, join(DIR, `${OUT}.${ext}`)]);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(DIR, `${OUT}.mp4`), '-frames:v', '1', '-q:v', '4', join(DIR, `${OUT}.jpg`)]);

// 2. Télémétrie : chaque clip décalé du temps cumulé des clips précédents.
type ClipFile = Telemetry & { source?: Record<string, unknown> };
const samples: TelemetrySample[] = [];
let offset = 0;
let first: ClipFile | null = null;
for (const name of names) {
  const clip = JSON.parse(readFileSync(join(DIR, `${name}.json`), 'utf8')) as ClipFile;
  first ??= clip;
  for (const s of clip.samples) {
    const t = Number((s.t + offset).toFixed(3));
    if (samples.length && t <= samples[samples.length - 1].t) continue;
    const { progress: _progress, ...rest } = s;
    samples.push({ ...rest, t });
  }
  offset += duration(join(DIR, `${name}.mp4`));
}

const telemetry: Telemetry = {
  rate: Math.max(1, Math.round((samples.length - 1) / (samples[samples.length - 1].t - samples[0].t))),
  samples,
};
if (first?.trackLength) telemetry.trackLength = first.trackLength;
if (first?.maxRpm) telemetry.maxRpm = first.maxRpm;
if (first?.lapTime) telemetry.lapTime = first.lapTime;

const result = validateTelemetry(telemetry);
if (!result.ok) {
  console.error(`✗ ${OUT}.json :`, result.errors.slice(0, 5).join(' ; '));
  process.exit(1);
}
const { clip: _clip, ...source } = first?.source ?? {};
writeFileSync(join(DIR, `${OUT}.json`), `${JSON.stringify({ source, ...telemetry })}\n`);

for (const ext of ['mp4', 'webm', 'jpg', 'json']) {
  const file = join(DIR, `${OUT}.${ext}`);
  const size = Number(execFileSync('stat', ['-c', '%s', file]).toString());
  console.log(`✓ ${file} : ${(size / 1048576).toFixed(2)} Mo`);
}
console.log(`Durée de la vidéo : ${offset.toFixed(3)} s · ${samples.length} échantillons de télémétrie`);
