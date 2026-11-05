import { sectorPath, type CornerId } from './circuit';
import type { OnboardMedia } from './types';

/**
 * Hot lap de l'accueil : le tour complet, assemblé à partir des clips des dix virages
 * (npm run lap:build). La télémétrie est recalée sur le temps de cette vidéo.
 */
export const HOT_LAP: OnboardMedia & { telemetry: string; record: string } = {
  clip: '/clips/tour.mp4',
  clipWebm: '/clips/tour.webm',
  poster: '/clips/tour.jpg',
  telemetry: '/clips/tour.json',
  record: '1:40.225',
};

/** Nombre de virages officiels de Magny-Cours (guide WorldSBK). */
export const TURN_COUNT = 17;

/**
 * Les 17 virages, un par un, tels qu'affichés pendant le hot lap.
 * from = distance de télémétrie (m depuis la ligne d'AC) où le badge passe à ce virage :
 * au freinage, ou à mi-chemin du virage précédent pour les virages rapides.
 * Placés d'après les freinages et les minimums de vitesse de la télémétrie, et pour les
 * virages rapides (2, 6, 8, 10, 11, 13) d'après les changements de cap du tracé.
 * corner = virage de lib/circuit.ts (et donc projet éventuel) auquel il appartient.
 */
const LAP_TURN_DATA: ReadonlyArray<{ turn: string; name: string | null; from: number; corner: CornerId | null }> = [
  { turn: '1', name: 'Grande Courbe', from: 0, corner: 'grande-courbe' },
  { turn: '2', name: 'Grande Courbe', from: 480, corner: 'grande-courbe' },
  { turn: '3', name: 'Estoril', from: 570, corner: 'estoril' },
  { turn: '4', name: 'Golf', from: 887, corner: 'golf' },
  { turn: '5', name: 'Adélaïde', from: 1425, corner: 'adelaide' },
  // Dans la ligne droite, juste avant le Nürburgring.
  { turn: '6', name: null, from: 1931, corner: null },
  { turn: '7', name: 'Nürburgring', from: 2250, corner: 'nurburgring' },
  { turn: '8', name: 'Nürburgring', from: 2360, corner: 'nurburgring' },
  { turn: '9', name: '180°', from: 2500, corner: '180' },
  { turn: '10', name: null, from: 2740, corner: null },
  { turn: '11', name: null, from: 2900, corner: null },
  { turn: '12', name: 'Imola', from: 3180, corner: 'imola' },
  { turn: '13', name: 'Imola', from: 3330, corner: 'imola' },
  { turn: '14', name: "Château d'Eau", from: 3408, corner: 'chateau-deau' },
  { turn: '15', name: 'Lycée', from: 3639, corner: 'lycee' },
  { turn: '16', name: 'Complexe du Lycée', from: 4263, corner: 'complexe-lycee' },
  { turn: '17', name: 'Complexe du Lycée', from: 4312, corner: 'complexe-lycee' },
];

const LAP_END = 4389.79;

export type LapTurn = (typeof LAP_TURN_DATA)[number] & { index: number; segment: string };

export const LAP_TURNS: LapTurn[] = LAP_TURN_DATA.map((t, index) => ({
  ...t,
  index,
  segment: sectorPath(t.from, LAP_TURN_DATA[index + 1]?.from ?? LAP_END),
}));

/** Virage où se trouve la voiture à une distance de télémétrie. */
export function lapTurnAt(distanceM: number): LapTurn {
  for (let i = LAP_TURNS.length - 1; i >= 0; i -= 1) {
    if (distanceM >= LAP_TURNS[i].from) return LAP_TURNS[i];
  }
  return LAP_TURNS[0];
}
