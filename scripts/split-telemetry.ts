// Découpe la télémétrie d'un tour complet (export Assetto Corsa, un bloc par clip)
// en un fichier par virage dans public/clips/, au format attendu par le site.
//
// Usage : npm run telemetry:split                       (premier clips-source/*-clips.json)
//         npm run telemetry:split -- <fichier-du-tour.json>
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { CORNERS } from '../lib/circuit.ts';
import { validateTelemetry, type Telemetry, type TelemetrySample } from '../lib/telemetry.ts';

type LapSample = {
  clipTime: number;
  chrono?: number;
  distance?: number;
  speedKmh: number;
  throttle: number;
  brake: number;
  gear?: number;
  rpm?: number;
};

type LapClip = { id: string; file: string; distanceStart?: number; distanceEnd?: number; samples: LapSample[] };

type LapFile = {
  meta: {
    trackLength: number;
    lapTime?: number;
    lapTimeFormatted?: string;
    maxRpm?: number;
    carId?: string;
    trackId?: string;
    lapNum?: number;
  };
  clips: LapClip[];
};

const SOURCE_DIR = 'clips-source';
const OUT_DIR = join('public', 'clips');

function findSource(): string {
  const arg = process.argv[2];
  if (arg) return arg;
  for (const dir of [SOURCE_DIR, OUT_DIR]) {
    const found = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('-clips.json')) : [];
    if (found.length === 0) continue;
    if (dir === OUT_DIR) {
      console.warn(`⚠ ${found[0]} est dans ${OUT_DIR}/ : il serait publié avec le site. Range-le plutôt dans ${SOURCE_DIR}/.\n`);
    }
    return join(dir, found[0]);
  }
  console.error(`Aucun fichier *-clips.json dans ${SOURCE_DIR}/. Indique le chemin : npm run telemetry:split -- <fichier>`);
  process.exit(1);
}

const round = (value: number, digits: number) => Number(value.toFixed(digits));

/**
 * Rapport 0 = point mort furtif pendant un passage de rapport : on garde le rapport engagé
 * juste avant (ou, en début de clip, le premier rapport engagé qui suit) pour ne pas afficher « N ».
 */
function engagedGears(samples: LapSample[]): (number | undefined)[] {
  const firstEngaged = samples.find((s) => s.gear !== undefined && s.gear !== 0)?.gear;
  let last = firstEngaged;
  return samples.map((s) => {
    if (s.gear === undefined) return undefined;
    if (s.gear !== 0) last = s.gear;
    return last ?? s.gear;
  });
}

function convert(clip: LapClip, meta: LapFile['meta']): Telemetry {
  const samples: TelemetrySample[] = [];
  const gears = engagedGears(clip.samples);
  let lastT = -Infinity;
  for (const [index, s] of clip.samples.entries()) {
    const t = round(s.clipTime, 3);
    // Échantillons en double (même instant) : on garde le premier.
    if (t <= lastT) continue;
    lastT = t;
    const sample: TelemetrySample = {
      t,
      speed: round(s.speedKmh, 1),
      throttle: round(Math.min(1, Math.max(0, s.throttle)), 3),
      brake: round(Math.min(1, Math.max(0, s.brake)), 3),
    };
    const gear = gears[index];
    if (gear !== undefined) sample.gear = gear;
    if (s.rpm !== undefined) sample.rpm = Math.round(s.rpm);
    if (s.distance !== undefined) sample.distance = round(s.distance, 2);
    if (s.chrono !== undefined) sample.chrono = round(s.chrono, 3);
    samples.push(sample);
  }
  const duration = samples.length > 1 ? samples[samples.length - 1].t - samples[0].t : 1;
  const telemetry: Telemetry = {
    rate: Math.max(1, Math.round((samples.length - 1) / duration)),
    trackLength: meta.trackLength,
    samples,
  };
  if (meta.maxRpm) telemetry.maxRpm = meta.maxRpm;
  if (meta.lapTime) telemetry.lapTime = meta.lapTime;
  return telemetry;
}

const sourcePath = findSource();
const lap = JSON.parse(readFileSync(sourcePath, 'utf8')) as LapFile;
if (!lap.meta?.trackLength || !Array.isArray(lap.clips)) {
  console.error(`${sourcePath} : format inattendu (il faut « meta.trackLength » et une liste « clips »).`);
  process.exit(1);
}

console.log(`Tour : ${lap.meta.trackId ?? '?'} · ${lap.meta.carId ?? '?'} · tour ${lap.meta.lapNum ?? '?'} · ${lap.meta.lapTimeFormatted ?? '?'}`);
const hasRpm = lap.clips.some((c) => c.samples.some((s) => s.rpm !== undefined));
const hasGear = lap.clips.some((c) => c.samples.some((s) => s.gear !== undefined));
console.log(`Régime : ${hasRpm ? `oui (max ${lap.meta.maxRpm ?? '?'} tr/min)` : 'absent'} · Rapport : ${hasGear ? 'oui' : 'absent'}\n`);

let failures = 0;
for (const clip of lap.clips) {
  const name = basename(clip.file, '.mp4');
  const telemetry = convert(clip, lap.meta);
  const result = validateTelemetry(telemetry);
  if (!result.ok) {
    failures += 1;
    console.error(`✗ ${name} :`, result.errors.slice(0, 5).join(' ; '));
    continue;
  }
  const out = join(OUT_DIR, `${name}.json`);
  const { carId, trackId, lapNum, lapTimeFormatted } = lap.meta;
  const source = { carId, trackId, lapNum, lapTime: lapTimeFormatted, clip: clip.id };
  writeFileSync(out, `${JSON.stringify({ source, ...telemetry })}\n`);
  // Le secteur dessiné sur les cartes vient de lib/circuit.ts : il doit correspondre au clip.
  const corner = CORNERS.find((c) => c.id === clip.id);
  if (corner && clip.distanceStart !== undefined && clip.distanceEnd !== undefined) {
    const [from, to] = corner.distance;
    if (Math.abs(from - clip.distanceStart) > 2 || Math.abs(to - clip.distanceEnd) > 2) {
      console.warn(`  ⚠ ${clip.id} : le clip couvre ${clip.distanceStart} → ${clip.distanceEnd} m, lib/circuit.ts indique ${from} → ${to} m. Mets « distance » à jour.`);
    }
  }
  const removed = clip.samples.length - telemetry.samples.length;
  console.log(`✓ ${out} : ${telemetry.samples.length} échantillons${removed ? ` (${removed} doublon(s) retiré(s))` : ''}`);
}

process.exit(failures ? 1 : 0);
