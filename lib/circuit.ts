export const VIEWBOX = '0 0 680 480';

export const TRACK = 'M277 111 L397 148 L412 147 L423 145 L453 125 L491 99 L496 92 L506 74 L520 59 L533 52 L539 49 L555 46 L570 46 L583 50 L593 54 L606 63 L616 74 L623 86 L628 101 L628 114 L626 125 L620 141 L594 185 L577 208 L563 225 L551 236 L424 334 L410 343 L382 359 L358 370 L152 439 L145 440 L141 435 L141 430 L144 425 L189 383 L265 347 L275 343 L412 245 L417 243 L424 244 L441 248 L451 248 L465 244 L477 238 L498 223 L523 199 L546 173 L552 159 L554 145 L551 133 L541 123 L531 121 L523 122 L515 127 L510 134 L501 156 L496 163 L487 173 L473 183 L458 190 L411 203 L399 208 L387 214 L220 329 L212 330 L175 325 L168 327 L151 337 L142 343 L123 359 L114 369 L75 417 L70 417 L60 410 L55 398 L52 386 L53 365 L55 344 L63 318 L87 225 L91 204 L93 173 L89 147 L61 50 L62 45 L67 42 L89 40 L122 44 L130 48 L130 54 L129 60 L131 65 L149 71 Z';

/** Longueur du tour en mètres (Assetto Corsa, magnycours22). */
export const TRACK_LENGTH_M = 4389.79;

/**
 * Décalage entre la ligne de chronométrage d'Assetto Corsa (distance 0 de la télémétrie) et le début
 * du TRACK (damier). Mesuré sur six virages lents (Estoril, Adélaïde, 180°, Château d'Eau, Lycée,
 * Complexe) : le point de vitesse minimale de la télémétrie tombe en moyenne 177,5 m après le sommet
 * dessiné. La ligne d'AC est donc juste après la sortie du Complexe du Lycée.
 */
export const TELEMETRY_LINE_OFFSET_M = 177.5;

type Pt = readonly [number, number];

function parsePoints(d: string): Pt[] {
  const n = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const pts: Pt[] = [];
  for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
  return pts;
}

// Tracé fermé (Z) et longueurs cumulées, pour convertir une distance en mètres en point du tracé.
const TRACK_POINTS = [...parsePoints(TRACK), parsePoints(TRACK)[0]];
const TRACK_CUMUL = TRACK_POINTS.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p[0] - TRACK_POINTS[i - 1][0], p[1] - TRACK_POINTS[i - 1][1]));
  return acc;
}, []);
const TRACK_UNITS = TRACK_CUMUL[TRACK_CUMUL.length - 1];

const round1 = (v: number) => Math.round(v * 10) / 10;

function pointAt(units: number): Pt {
  const i = Math.max(1, TRACK_CUMUL.findIndex((c) => c >= units));
  const [a, b] = [TRACK_POINTS[i - 1], TRACK_POINTS[i]];
  const span = TRACK_CUMUL[i] - TRACK_CUMUL[i - 1];
  const k = span > 0 ? (units - TRACK_CUMUL[i - 1]) / span : 0;
  return [round1(a[0] + (b[0] - a[0]) * k), round1(a[1] + (b[1] - a[1]) * k)];
}

/** Position (0 à 1) sur le TRACK d'une distance de télémétrie (mètres depuis la ligne d'AC). */
export function lapFractionAt(distanceM: number): number {
  const d = (((distanceM - TELEMETRY_LINE_OFFSET_M) % TRACK_LENGTH_M) + TRACK_LENGTH_M) % TRACK_LENGTH_M;
  return d / TRACK_LENGTH_M;
}

function trackPoints(from: number, to: number): Pt[] {
  const pts: Pt[] = [pointAt(from)];
  TRACK_CUMUL.forEach((c, i) => {
    if (c > from && c < to) pts.push(TRACK_POINTS[i]);
  });
  pts.push(pointAt(to));
  return pts;
}

/**
 * Portion du TRACK couverte entre deux distances de télémétrie, dans le sens de la course.
 * Un secteur qui passe le début du TRACK (damier) est raccordé de part et d'autre.
 */
export function sectorPath(fromM: number, toM: number): string {
  const from = lapFractionAt(fromM) * TRACK_UNITS;
  const to = lapFractionAt(toM) * TRACK_UNITS;
  const pts = from <= to ? trackPoints(from, to) : [...trackPoints(from, TRACK_UNITS), ...trackPoints(0, to).slice(1)];
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}

// Les 10 virages nommés (secteurs des clips), dans l'ordre du tour depuis la ligne de départ.
// Le circuit compte 17 virages officiels : le détail virage par virage est dans lib/lap.ts.
// turn = numérotation officielle du circuit (guide WorldSBK), affichée sur le site.
// distance = secteur couvert par le clip embarqué (mètres depuis la ligne, export de télémétrie du tour) ;
//   le segment dessiné sur les cartes en est déduit, pour coller à la vidéo.
// zoomOrigin = centre du zoom ×3,4 ; marker = position de la pastille (calculée pour ne pas toucher la piste).
const CORNER_DATA = [
  { id: 'grande-courbe', name: 'Grande Courbe', turn: '1-2', direction: 'gauche',
    distance: [2.71, 569.17], zoomOrigin: [423, 145], marker: [407, 117] },
  { id: 'estoril', name: 'Estoril', turn: '3', direction: 'droite',
    distance: [570.1, 886.62], zoomOrigin: [593, 54], marker: [622, 36] },
  { id: 'golf', name: 'Golf', turn: '4', direction: 'droite',
    distance: [887.42, 1424.71], zoomOrigin: [577, 208], marker: [602, 225] },
  { id: 'adelaide', name: 'Adélaïde', turn: '5', direction: 'droite',
    distance: [1425.5, 1930.06], zoomOrigin: [141, 435], marker: [108, 456] },
  { id: 'nurburgring', name: 'Nürburgring', turn: '7-8', direction: 'chicane',
    distance: [1931.42, 2427.78], zoomOrigin: [430, 246], marker: [427, 276] },
  { id: '180', name: '180°', turn: '9', direction: 'gauche',
    distance: [2428.73, 2722.17], zoomOrigin: [541, 123], marker: [544, 93] },
  { id: 'imola', name: 'Imola', turn: '12-13', direction: 'chicane',
    distance: [2723.04, 3407.54], zoomOrigin: [190, 328], marker: [187, 296] },
  { id: 'chateau-deau', name: "Château d'Eau", turn: '14', direction: 'droite',
    distance: [3408.32, 3638.32], zoomOrigin: [60, 410], marker: [30, 430] },
  { id: 'lycee', name: 'Lycée', turn: '15', direction: 'droite',
    distance: [3639.44, 4262.78], zoomOrigin: [64, 46], marker: [32, 40] },
  { id: 'complexe-lycee', name: 'Complexe du Lycée', turn: '16-17', direction: 'chicane',
    distance: [4263.39, 4389.39], zoomOrigin: [130, 54], marker: [159, 40] },
] as const;

export const CORNERS = CORNER_DATA.map((c) => ({ ...c, segment: sectorPath(c.distance[0], c.distance[1]) }));

export type CornerId = (typeof CORNER_DATA)[number]['id'];
export type Corner = (typeof CORNERS)[number];

// Ligne d'arrivée : damier 2 × 4 cases à translate(277 111) rotate(17)
export const START_LINE = { x: 277, y: 111, rotate: 17 };
// Contact : la ligne droite des stands, du Lycée à l'arrivée
export const FINISH_STRAIGHT = 'M89 147 L61 50 L62 45 L67 42 L89 40 L122 44 L130 48 L130 54 L129 60 L131 65 L149 71 L277 111';
export const TRACK_LABEL = 'Circuit de Nevers Magny-Cours · 4,4 km';

// 404 : le bac à graviers d'Adélaïde, à l'extérieur de l'épingle.
export const GRAVEL_TRAP = { x: 112, y: 454 };

export const MARKER_MIN_DISTANCE = 40;

export function getCorner(id: string): Corner | undefined {
  return CORNERS.find((c) => c.id === id);
}

export function cornerIndex(id: string): number {
  return CORNERS.findIndex((c) => c.id === id);
}

/** Virages sans projet, dans l'ordre du tour. */
export function freeCorners(used: readonly string[]): Corner[] {
  return CORNERS.filter((c) => !used.includes(c.id));
}

/** « Virage 3 », « Virages 12-13 » : le numéro officiel, tel qu'affiché sur le site. */
export function turnLabel(turn: string): string {
  return turn.includes('-') ? `Virages ${turn}` : `Virage ${turn}`;
}

/** Chemin conventionnel du clip : /clips/<numéro officiel sur 2 chiffres>-<id>.mp4 */
export function conventionalClip(corner: Corner): string {
  const first = corner.turn.split('-')[0];
  return `/clips/${first.padStart(2, '0')}-${corner.id}.mp4`;
}
