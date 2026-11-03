'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { toMapCorner } from '@/lib/map';
import type { ProjectSummary } from '@/lib/types';
import { CornerList } from './CornerList';
import styles from './HomeCircuit.module.css';
import { OnboardStage } from './onboard/OnboardStage';
import { ONBOARD_QUERY, REDUCED_MOTION_QUERY, useMediaQuery } from './onboard/useMediaQuery';
import { TrackMap } from './TrackMap';

type Props = {
  projects: ProjectSummary[];
  intro: ReactNode;
  /** Fiches rendues côté serveur, dans l'ordre de `projects`. */
  cards: ReactNode[];
};

/**
 * Accueil : la liste des virages, la carte et la fiche partagent la sélection.
 * Sur desktop avec survol, la sélection ouvre aussi la vue embarquée.
 */
export function HomeCircuit({ projects, intro, cards }: Props) {
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.corner.id ?? '');
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const onboard = useMediaQuery(ONBOARD_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const corners = projects.map(toMapCorner);
  const viewOpen = onboard && open;

  const pick = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (onboard) setOpen(true);
    },
    [onboard],
  );
  const enter = useCallback(() => {
    if (onboard) setArmed(true);
  }, [onboard]);
  const leave = useCallback(() => setOpen(false), []);

  return (
    <div className={styles.grid}>
      <div className={styles.intro}>{intro}</div>

      <div className={styles.list}>
        <CornerList projects={projects} selectedId={selectedId} onPick={pick} onEnter={enter} onLeave={leave} />
      </div>

      <div className={`${styles.visual} vt-circuit`} data-open={viewOpen} data-reduced={reducedMotion} onMouseLeave={leave}>
        <TrackMap
          variant="home"
          corners={corners}
          activeId={selectedId}
          zoomed={viewOpen}
          onSelect={(id) => {
            enter();
            pick(id);
          }}
          className={styles.map}
        />
        {onboard && (
          <OnboardStage projects={projects} activeId={selectedId} open={viewOpen} armed={armed} reducedMotion={reducedMotion} />
        )}
      </div>

      <section className={styles.card} aria-label="Projet sélectionné">
        {projects.map((project, i) => (
          <div key={project.slug} hidden={project.corner.id !== selectedId}>
            {cards[i]}
          </div>
        ))}
      </section>
    </div>
  );
}
