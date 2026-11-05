import type { ReactNode, Ref } from 'react';
import styles from './Onboard.module.css';
import { TvBadge } from './TvBadge';
import { TvChrono, type TvChronoHandle } from './TvChrono';
import { TvMiniMap, type TvMiniMapHandle } from './TvMiniMap';
import { TvTelemetry, type TvTelemetryHandle } from './TvTelemetry';

type Props = {
  /** Virage affiché dans le badge « Onboard ». */
  turn: string;
  /** null pour les virages sans nom (6, 10, 11). */
  cornerName: string | null;
  /** Segment rouge de la mini-carte. */
  segment: string;
  record?: string;
  /** Mention du clip à venir (développement uniquement). */
  clipHint?: string;
  /** Bandeau du bas : le projet, ou le hot lap. */
  lowerThird: ReactNode;
  chronoRef: Ref<TvChronoHandle>;
  miniMapRef: Ref<TvMiniMapHandle>;
  telemetryRef: Ref<TvTelemetryHandle>;
};

/** Habillage TV en HTML/CSS par-dessus la vidéo (jamais incrusté dans le clip). */
export function TvOverlay({ turn, cornerName, segment, record, clipHint, lowerThird, chronoRef, miniMapRef, telemetryRef }: Props) {
  return (
    <div className={styles.overlay} aria-hidden="true">
      <TvBadge turn={turn} cornerName={cornerName} clipHint={clipHint} />
      <div className={styles.topRight}>
        <TvChrono ref={chronoRef} record={record} />
        <TvMiniMap ref={miniMapRef} segment={segment} />
      </div>
      {lowerThird}
      <TvTelemetry ref={telemetryRef} />
    </div>
  );
}
