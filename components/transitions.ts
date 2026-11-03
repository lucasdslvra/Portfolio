import type { CSSProperties } from 'react';

/** Nom de transition partagé par le titre d'un projet (fiche → article). */
export function titleTransition(slug: string): CSSProperties {
  return { '--vt-title': `titre-${slug}` } as CSSProperties;
}
