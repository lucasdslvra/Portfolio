import { turnLabel } from '@/lib/circuit';
import styles from './Onboard.module.css';

type Props = { turn: string; cornerName: string; clipHint?: string };

/** A · Badge « ● ONBOARD | VIRAGE n · NOM » ; B · mention du clip (développement uniquement). */
export function TvBadge({ turn, cornerName, clipHint }: Props) {
  return (
    <div className={styles.badgeBox}>
      <div className={styles.badge}>
        <span className={styles.live}>
          <span className={styles.liveDot} />
          Onboard
        </span>
        <span className={styles.badgeCorner}>
          {turnLabel(turn)} · {cornerName}
        </span>
      </div>
      {clipHint && <span className={styles.clipHint}>Aperçu · clip à venir : {clipHint}</span>}
    </div>
  );
}
