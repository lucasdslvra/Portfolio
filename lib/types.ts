import type { CornerId } from './circuit';

export type Category = 'perso' | 'equipe' | 'stage';

export type Point = readonly [number, number];

export type TocEntry = { id: string; n: string; title: string };

export type ProjectCorner = {
  id: CornerId;
  name: string;
  turn: string;
  direction: string;
  segment: string;
  zoomOrigin: Point;
  marker: Point;
};

export type OnboardMedia = {
  clip: string;
  clipWebm?: string;
  poster?: string;
  telemetry?: string;
  record?: string;
};

/** Données sérialisables d'un projet, utilisables dans les composants client. */
export type ProjectSummary = {
  slug: string;
  href: string;
  title: string;
  date: string;
  category: Category;
  categoryLabel: string;
  short: string;
  description: string;
  stack: string[];
  status: string;
  links: { demo?: string; code?: string };
  cover: string;
  onboard?: OnboardMedia;
  /** Chemin du clip selon la convention, pour la mention « clip à venir ». */
  clipHint: string;
  /** Position dans le tour parmi les virages occupés (1, 2, 3…). */
  position: number;
  corner: ProjectCorner;
};

export type ProjectDetail = ProjectSummary & {
  toc: TocEntry[];
  code: string;
};

/** Voisin dans l'ordre du circuit ; null = la ligne d'arrivée (contact). */
export type Adjacent = { previous: ProjectSummary | null; next: ProjectSummary | null };
