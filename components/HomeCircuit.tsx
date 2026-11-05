'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { canPreloadMedia } from '@/lib/intro';
import { HOT_LAP } from '@/lib/lap';
import { toMapCorner } from '@/lib/map';
import type { ProjectSummary } from '@/lib/types';
import { Button } from './Button';
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
 * Le bouton sous la carte lance un hot lap : le tour complet en vue embarquée,
 * puis retour à la carte dès la ligne franchie.
 */
export function HomeCircuit({ projects, intro, cards }: Props) {
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.corner.id ?? '');
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [lap, setLap] = useState(false);
  const [lapArmed, setLapArmed] = useState(false);
  const onboard = useMediaQuery(ONBOARD_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const corners = projects.map(toMapCorner);
  const viewOpen = lap || (onboard && open);

  const pick = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (onboard) setOpen(true);
    },
    [onboard],
  );
  // Vidéos montées dès l'arrivée (elles se chargent derrière les feux de départ) :
  // au premier survol, elles démarrent sans écran noir. Avec l'économie de données
  // ou une connexion très lente, on attend le premier survol comme avant.
  useEffect(() => {
    if (onboard && canPreloadMedia()) setArmed(true);
  }, [onboard]);
  const enter = useCallback(() => {
    if (onboard) setArmed(true);
  }, [onboard]);
  const leave = useCallback(() => setOpen(false), []);

  // Hot lap : la vidéo du tour est montée (et préchargée) dès le survol du bouton.
  const armLap = useCallback(() => setLapArmed(true), []);
  const endLap = useCallback(() => setLap(false), []);
  const toggleLap = () => {
    setLapArmed(true);
    setLap((running) => !running);
  };
  useEffect(() => {
    if (!lap) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLap(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lap]);

  return (
    <div className={styles.grid}>
      <div className={styles.intro}>{intro}</div>

      <div className={styles.list}>
        <CornerList projects={projects} selectedId={selectedId} onPick={pick} onEnter={enter} onLeave={leave} />
      </div>

      <div className={styles.visualColumn}>
        <div className={`${styles.visual} vt-circuit`} data-open={viewOpen} data-reduced={reducedMotion} onMouseLeave={leave}>
          <TrackMap
            variant="home"
            corners={corners}
            activeId={selectedId}
            zoomed={viewOpen && !lap}
            onSelect={(id) => {
              enter();
              pick(id);
            }}
            className={styles.map}
          />
          {(onboard || lapArmed) && (
            <OnboardStage
              projects={projects}
              activeId={selectedId}
              open={viewOpen}
              armed={armed}
              reducedMotion={reducedMotion}
              lap={lap}
              lapArmed={lapArmed}
              onLapEnd={endLap}
            />
          )}
        </div>

        <div className={styles.lapBar}>
          <p className={styles.lapCaption}>
            Tour complet · <span className={styles.lapTime}>{HOT_LAP.record}</span>
          </p>
          <Button
            variant={lap ? 'primary' : 'secondary'}
            className={styles.lapButton}
            onClick={toggleLap}
            onPointerEnter={armLap}
            onFocus={armLap}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              {lap ? <rect x="1" y="1" width="10" height="10" fill="currentColor" /> : <path d="M2 0.8 L11 6 L2 11.2 Z" fill="currentColor" />}
            </svg>
            {lap ? 'Arrêter le tour' : 'Lancer un hot lap'}
          </Button>
        </div>
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
