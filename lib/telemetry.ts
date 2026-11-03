// Télémétrie Assetto Corsa d'un clip de virage. Module pur : utilisé par le
// navigateur et par scripts/validate-telemetry.ts (sans dépendance ni import).

export type TelemetrySample = {
  /** Secondes depuis le début du clip. */
  t: number;
  speed: number;
  /** Rapport engagé (facultatif ; −1 = R, 0 = N). */
  gear?: number;
  rpm?: number;
  /** 0 à 1 */
  throttle: number;
  /** 0 à 1 */
  brake: number;
  /** 0 à 1 sur le segment du virage (facultatif). */
  progress?: number;
  /** Mètres depuis la ligne de départ (facultatif, exige trackLength). */
  distance?: number;
  /** Secondes depuis la ligne de départ dans le tour (facultatif). */
  chrono?: number;
};

export type Telemetry = {
  rate: number;
  maxRpm?: number;
  /** Longueur du tour en mètres, pour placer le point sur le tracé complet. */
  trackLength?: number;
  /** Temps final du tour (secondes), affiché comme record perso. */
  lapTime?: number;
  samples: TelemetrySample[];
};

export type TelemetryFrame = {
  speed: number;
  gear: number | null;
  rpm: number | null;
  throttle: number;
  brake: number;
  progress: number | null;
  distance: number | null;
  /** Temps du tour depuis la ligne (secondes), si la télémétrie le fournit. */
  chrono: number | null;
};

export const LED_COUNT = 12;

/** Régime à partir duquel la première LED s'allume ; la dernière s'allume à maxRpm. */
export const LED_START_RPM = 6500;

type Validation = { ok: true; value: Telemetry } | { ok: false; errors: string[] };

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validateTelemetry(data: unknown): Validation {
  const errors: string[] = [];
  if (typeof data !== 'object' || data === null) return { ok: false, errors: ['le fichier doit contenir un objet JSON'] };
  const root = data as Record<string, unknown>;

  if (!isNumber(root.rate) || root.rate <= 0) errors.push('« rate » doit être un nombre positif (échantillons par seconde)');
  if (root.maxRpm !== undefined && (!isNumber(root.maxRpm) || root.maxRpm <= 0)) errors.push('« maxRpm » doit être un nombre positif');
  if (root.trackLength !== undefined && (!isNumber(root.trackLength) || root.trackLength <= 0)) errors.push('« trackLength » doit être un nombre positif (mètres)');
  if (root.lapTime !== undefined && (!isNumber(root.lapTime) || root.lapTime <= 0)) errors.push('« lapTime » doit être un nombre positif (secondes)');
  if (!Array.isArray(root.samples) || root.samples.length === 0) {
    errors.push('« samples » doit être une liste non vide');
    return { ok: false, errors };
  }

  let previousT = -Infinity;
  let hasRpm = false;
  let hasDistance = false;
  root.samples.forEach((raw: unknown, i: number) => {
    const where = `samples[${i}]`;
    if (typeof raw !== 'object' || raw === null) {
      errors.push(`${where} doit être un objet`);
      return;
    }
    const s = raw as Record<string, unknown>;
    if (!isNumber(s.t) || s.t < 0) errors.push(`${where}.t doit être un nombre ≥ 0`);
    else if (s.t <= previousT) errors.push(`${where}.t doit être strictement croissant`);
    else previousT = s.t;
    if (!isNumber(s.speed) || s.speed < 0) errors.push(`${where}.speed doit être un nombre ≥ 0 (km/h)`);
    if (s.gear !== undefined && (!isNumber(s.gear) || !Number.isInteger(s.gear) || s.gear < -1)) errors.push(`${where}.gear doit être un entier (−1 = R, 0 = N)`);
    if (s.rpm !== undefined) {
      if (!isNumber(s.rpm) || s.rpm < 0) errors.push(`${where}.rpm doit être un nombre ≥ 0`);
      else hasRpm = true;
    }
    for (const key of ['throttle', 'brake'] as const) {
      const v = s[key];
      if (!isNumber(v) || v < 0 || v > 1) errors.push(`${where}.${key} doit être compris entre 0 et 1`);
    }
    if (s.progress !== undefined && (!isNumber(s.progress) || s.progress < 0 || s.progress > 1)) {
      errors.push(`${where}.progress doit être compris entre 0 et 1`);
    }
    if (s.distance !== undefined) {
      if (!isNumber(s.distance) || s.distance < 0) errors.push(`${where}.distance doit être un nombre ≥ 0 (mètres)`);
      else hasDistance = true;
    }
    if (s.chrono !== undefined && (!isNumber(s.chrono) || s.chrono < 0)) errors.push(`${where}.chrono doit être un nombre ≥ 0`);
  });

  if (hasRpm && root.maxRpm === undefined) errors.push('« maxRpm » est requis quand les échantillons contiennent « rpm »');
  if (hasDistance && root.trackLength === undefined) errors.push('« trackLength » est requis quand les échantillons contiennent « distance »');

  return errors.length ? { ok: false, errors } : { ok: true, value: data as Telemetry };
}

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

function lerpOptional(a: number | undefined, b: number | undefined, k: number): number | null {
  if (a !== undefined && b !== undefined) return lerp(a, b, k);
  return a ?? null;
}

/** Index du dernier échantillon dont t ≤ time (recherche dichotomique). */
function indexAt(samples: TelemetrySample[], time: number): number {
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (samples[mid].t <= time) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Interpolation linéaire entre les deux échantillons qui encadrent `time`. Le rapport n'est pas interpolé. */
export function frameAt(telemetry: Telemetry, time: number): TelemetryFrame {
  const { samples } = telemetry;
  const i = indexAt(samples, time);
  const a = samples[i];
  const b = samples[Math.min(i + 1, samples.length - 1)];
  const span = b.t - a.t;
  const k = span > 0 ? Math.min(1, Math.max(0, (time - a.t) / span)) : 0;
  return {
    speed: lerp(a.speed, b.speed, k),
    gear: a.gear ?? null,
    rpm: lerpOptional(a.rpm, b.rpm, k),
    throttle: lerp(a.throttle, b.throttle, k),
    brake: lerp(a.brake, b.brake, k),
    progress: lerpOptional(a.progress, b.progress, k),
    distance: lerpOptional(a.distance, b.distance, k),
    chrono: lerpOptional(a.chrono, b.chrono, k),
  };
}

export type GearRanges = Map<number, { min: number; max: number }>;

/** Vitesses min / max observées par rapport, pour les LED quand rpm est absent. */
export function gearRanges(telemetry: Telemetry): GearRanges {
  const ranges: GearRanges = new Map();
  for (const s of telemetry.samples) {
    if (s.gear === undefined) continue;
    const r = ranges.get(s.gear);
    if (!r) ranges.set(s.gear, { min: s.speed, max: s.speed });
    else {
      r.min = Math.min(r.min, s.speed);
      r.max = Math.max(r.max, s.speed);
    }
  }
  return ranges;
}

/**
 * LED allumées : le régime entre LED_START_RPM (aucune LED) et maxRpm (12 LED), comme de vraies
 * LED de passage de rapport ; sinon la part de vitesse dans le rapport engagé.
 * Sans régime ni rapport, rien n'est allumé (aucune valeur inventée).
 */
export function litLeds(frame: TelemetryFrame, telemetry: Telemetry, ranges: GearRanges): number {
  let ratio = 0;
  if (frame.rpm !== null && telemetry.maxRpm) {
    const start = telemetry.maxRpm > LED_START_RPM ? LED_START_RPM : 0;
    ratio = (frame.rpm - start) / (telemetry.maxRpm - start);
  } else if (frame.gear !== null) {
    const r = ranges.get(frame.gear);
    ratio = r && r.max > r.min ? (frame.speed - r.min) / (r.max - r.min) : 0;
  }
  return Math.round(Math.min(1, Math.max(0, ratio)) * LED_COUNT);
}

export function gearLabel(gear: number): string {
  if (gear === -1) return 'R';
  if (gear === 0) return 'N';
  return String(gear);
}

