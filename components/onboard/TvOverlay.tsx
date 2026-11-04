import type { Ref } from 'react';
import type { ProjectSummary } from '@/lib/types';
import styles from './Onboard.module.css';
import { TvBadge } from './TvBadge';
import { TvChrono, type TvChronoHandle } from './TvChrono';
import { TvLowerThird } from './TvLowerThird';
import { TvMiniMap, type TvMiniMapHandle } from './TvMiniMap';
import { TvTelemetry, type TvTelemetryHandle } from './TvTelemetry';

type Props = {
  project: ProjectSummary;
  chronoRef: Ref<TvChronoHandle>;
  miniMapRef: Ref<TvMiniMapHandle>;
  telemetryRef: Ref<TvTelemetryHandle>;
};

/** Habillage TV en HTML/CSS par-dessus la vidéo (jamais incrusté dans le clip). */
export function TvOverlay({ project, chronoRef, miniMapRef, telemetryRef }: Props) {
  const showClipHint = process.env.NODE_ENV !== 'production' && !project.onboard;
  return (
    <div className={styles.overlay} aria-hidden="true">
      <TvBadge turn={project.corner.turn} cornerName={project.corner.name} clipHint={showClipHint ? project.clipHint : undefined} />
      <div className={styles.topRight}>
        <TvChrono ref={chronoRef} record={project.onboard?.record} />
        <TvMiniMap ref={miniMapRef} segment={project.corner.segment} />
      </div>
      <TvLowerThird project={project} />
      <TvTelemetry ref={telemetryRef} />
    </div>
  );
}
