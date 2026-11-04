import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { allProjects, type Project } from 'contentlayer/generated';
import { CORNERS, MARKER_MIN_DISTANCE, conventionalClip, cornerIndex, freeCorners, getCorner, type Corner } from './circuit';
import type { Adjacent, Category, ProjectDetail, ProjectSummary, TocEntry } from './types';

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'perso', label: 'Perso' },
  { key: 'equipe', label: 'Équipe' },
  { key: 'stage', label: 'Stage' },
];

export function isCategory(value: unknown): value is Category {
  return CATEGORIES.some((c) => c.key === value);
}

function isTocEntry(value: unknown): value is TocEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string' && typeof entry.n === 'string' && typeof entry.title === 'string';
}

function parseToc(value: unknown): TocEntry[] {
  return Array.isArray(value) ? value.filter(isTocEntry) : [];
}

/**
 * Ajoute une empreinte du contenu (`?v=…`) aux fichiers de public/ : /clips/* est mis en cache un an
 * (immutable), l'URL change donc dès que le fichier change (clip réencodé, télémétrie régénérée).
 */
function versioned(url: string): string;
function versioned(url: string | undefined): string | undefined;
function versioned(url: string | undefined): string | undefined {
  if (!url || !url.startsWith('/')) return url;
  const file = join(process.cwd(), 'public', url);
  if (!existsSync(file)) {
    console.warn(`[projets] Fichier introuvable dans public/ : ${url}`);
    return url;
  }
  const hash = createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 10);
  return `${url}?v=${hash}`;
}

function toDetail(doc: Project, corner: Corner, position: number): ProjectDetail {
  const onboard = doc.onboard
    ? {
        clip: versioned(doc.onboard.clip),
        clipWebm: versioned(doc.onboard.clipWebm),
        poster: versioned(doc.onboard.poster),
        telemetry: versioned(doc.onboard.telemetry),
        record: doc.onboard.record,
      }
    : undefined;
  return {
    slug: doc.slug,
    href: `/projets/${doc.slug}`,
    title: doc.title,
    date: doc.date,
    category: doc.category,
    categoryLabel: doc.categoryLabel,
    short: doc.short,
    description: doc.description,
    stack: doc.stack,
    status: doc.status,
    links: { demo: doc.links?.demo, code: doc.links?.code },
    cover: doc.cover,
    onboard,
    clipHint: onboard?.clip ?? conventionalClip(corner),
    position,
    corner: {
      id: corner.id,
      name: corner.name,
      turn: corner.turn,
      direction: corner.direction,
      segment: corner.segment,
      zoomOrigin: corner.zoomOrigin,
      marker: corner.marker,
    },
    toc: parseToc(doc.toc),
    code: doc.body.code,
  };
}

/** Construit et valide la liste une seule fois (au build pour les pages statiques). */
function build(): ProjectDetail[] {
  const published = allProjects.filter((p) => p.published !== false);
  const seen = new Map<string, string>();

  for (const doc of published) {
    if (!getCorner(doc.corner)) {
      throw new Error(
        `[projets] « ${doc._raw.sourceFilePath} » : virage « ${doc.corner} » inconnu. ` +
          `Virages possibles : ${CORNERS.map((c) => c.id).join(', ')}.`,
      );
    }
    const owner = seen.get(doc.corner);
    if (owner) {
      throw new Error(
        `[projets] « ${doc._raw.sourceFilePath} » et « ${owner} » occupent tous les deux le virage « ${doc.corner} ». ` +
          `Un virage ne porte qu'un projet (npm run corners liste les virages libres).`,
      );
    }
    seen.set(doc.corner, doc._raw.sourceFilePath);
  }

  const ordered = [...published].sort((a, b) => cornerIndex(a.corner) - cornerIndex(b.corner));
  const projects = ordered.map((doc, i) => {
    const corner = getCorner(doc.corner);
    if (!corner) throw new Error(`[projets] virage « ${doc.corner} » inconnu.`);
    return toDetail(doc, corner, i + 1);
  });

  for (let i = 1; i < projects.length; i++) {
    if (projects[i].date > projects[i - 1].date) {
      console.warn(
        `[projets] Avertissement : « ${projects[i].title} » (virage ${projects[i].corner.turn}) est plus récent que ` +
          `« ${projects[i - 1].title} » (virage ${projects[i - 1].corner.turn}). La convention est du plus récent au plus ancien.`,
      );
    }
  }

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const [ax, ay] = projects[i].corner.marker;
      const [bx, by] = projects[j].corner.marker;
      const distance = Math.hypot(ax - bx, ay - by);
      if (distance < MARKER_MIN_DISTANCE) {
        console.warn(
          `[projets] Avertissement : les pastilles de ${projects[i].corner.name} et ${projects[j].corner.name} ` +
            `sont à ${distance.toFixed(1)} px l'une de l'autre (minimum conseillé : ${MARKER_MIN_DISTANCE} px).`,
        );
      }
    }
  }

  return projects;
}

let cache: ProjectDetail[] | null = null;

function all(): ProjectDetail[] {
  if (!cache) cache = build();
  return cache;
}

export function toSummary(project: ProjectDetail): ProjectSummary {
  const { toc: _toc, code: _code, ...summary } = project;
  return summary;
}

/** Projets dans l'ordre du tour. */
export function getProjects(): ProjectSummary[] {
  return all().map(toSummary);
}

export function getProject(slug: string): ProjectDetail | undefined {
  return all().find((p) => p.slug === slug);
}

/** Précédent / suivant dans l'ordre du circuit ; aux extrémités, la ligne d'arrivée. */
export function getAdjacent(slug: string): Adjacent {
  const list = getProjects();
  const index = list.findIndex((p) => p.slug === slug);
  return {
    previous: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  };
}

export function getFreeCorners(): Corner[] {
  return freeCorners(all().map((p) => p.corner.id));
}

export function filterProjects(projects: ProjectSummary[], category: Category | null): ProjectSummary[] {
  return category ? projects.filter((p) => p.category === category) : projects;
}

export function countByCategory(projects: ProjectSummary[]): Record<Category | 'all', number> {
  const counts: Record<Category | 'all', number> = { all: projects.length, perso: 0, equipe: 0, stage: 0 };
  for (const p of projects) counts[p.category] += 1;
  return counts;
}
