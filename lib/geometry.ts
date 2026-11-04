import type { Point } from './types';

/** Points d'un chemin SVG fait de M/L (format des constantes du circuit). */
export function pathPoints(d: string): Point[] {
  const numbers = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const points: Point[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);
  return points;
}

export type Box = { x: number; y: number; width: number; height: number };

/**
 * Cadre au ratio demandé qui contient tous les points, avec une marge,
 * et une largeur minimale pour ne pas trop zoomer sur les petites chicanes.
 */
export function framePoints(points: Point[], ratio: number, padding: number, minWidth: number): Box {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(maxX - minX + padding * 2, (maxY - minY + padding * 2) * ratio, minWidth);
  const height = width / ratio;
  return { x: (minX + maxX) / 2 - width / 2, y: (minY + maxY) / 2 - height / 2, width, height };
}

/** Angle (degrés) du dernier tronçon d'un chemin : le sens de sortie du virage. */
export function endAngle(points: Point[]): number {
  const [x1, y1] = points[points.length - 2] ?? [0, 0];
  const [x2, y2] = points[points.length - 1] ?? [1, 0];
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}
