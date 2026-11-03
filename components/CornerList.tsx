'use client';

import Link from 'next/link';
import type { FocusEvent } from 'react';
import { turnLabel } from '@/lib/circuit';
import { formatShortDate } from '@/lib/format';
import type { ProjectSummary } from '@/lib/types';
import { CheckeredFlag } from './CheckeredFlag';
import { CornerBadge } from './CornerBadge';
import styles from './CornerList.module.css';

type Props = {
  projects: ProjectSummary[];
  selectedId: string;
  /** Survol ou focus d'une ligne : sélectionne le virage (et ouvre la vue embarquée si disponible). */
  onPick: (id: string) => void;
  /** Première entrée dans la liste : préchargement des vidéos. */
  onEnter: () => void;
  /** Sortie de la liste (souris ou focus) : retour à la carte. */
  onLeave: () => void;
};

export function CornerList({ projects, selectedId, onPick, onEnter, onLeave }: Props) {
  const onBlur = (event: FocusEvent<HTMLOListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onLeave();
  };

  return (
    <ol
      className={styles.list}
      aria-label="Les virages du tour"
      onPointerEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onBlur}
    >
      {projects.map((project) => {
        const selected = project.corner.id === selectedId;
        return (
          <li key={project.slug}>
            <Link
              href={project.href}
              className={styles.row}
              data-selected={selected}
              onMouseEnter={() => onPick(project.corner.id)}
              onFocus={() => onPick(project.corner.id)}
            >
              <CornerBadge n={project.corner.turn} state={selected ? 'active' : 'inactive'} />
              <span className={styles.text}>
                <span className={styles.name}>{project.title}</span>
                <span className={styles.corner}>
                  {turnLabel(project.corner.turn)} · {project.corner.name}
                </span>
              </span>
              <time className={styles.date} dateTime={project.date.slice(0, 10)}>
                {formatShortDate(project.date)}
              </time>
            </Link>
          </li>
        );
      })}
      <li>
        <Link href="/contact" className={`${styles.row} ${styles.finish}`}>
          <CheckeredFlag />
          <span className={styles.name}>Arrivée : me contacter</span>
        </Link>
      </li>
    </ol>
  );
}
