import { TRACK, VIEWBOX, turnLabel } from '@/lib/circuit';
import { endAngle, framePoints, pathPoints } from '@/lib/geometry';
import type { ProjectCorner } from '@/lib/types';
import styles from './CornerCover.module.css';
import { badgeFontSize } from './TrackMap';

type Props = { corner: ProjectCorner };

// Zone dessinée : la couverture est en 16/10, moins la bande d'informations (22 %).
const RATIO = 16 / (10 * 0.78);

function directionLabel(direction: string): string {
  return direction === 'chicane' ? 'chicane' : `à ${direction}`;
}

/**
 * Couverture d'un projet dessinée à partir du circuit : le virage en gros plan
 * (le reste du tracé en contexte), sa pastille, le sens de la course et sa position sur la carte.
 */
export function CornerCover({ corner }: Props) {
  const points = pathPoints(corner.segment);
  const { x, y, width: w, height: h } = framePoints([...points, corner.marker], RATIO, 52, 260);
  const unit = w / 100;
  const [ex, ey] = points[points.length - 1];
  const angle = endAngle(points);
  const [mx, my] = corner.marker;
  const gridStep = w / 10;
  const patternId = `grille-${corner.id}`;

  return (
    <div className={styles.cover} role="img" aria-label={`Le virage ${corner.name} en gros plan sur le tracé de Magny-Cours`}>
      <svg className={styles.zoom} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={patternId} x={x} y={y} width={gridStep} height={gridStep} patternUnits="userSpaceOnUse">
            <path d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`} fill="none" stroke="#F7F6F3" strokeWidth={unit * 0.25} />
          </pattern>
        </defs>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${patternId})`} />
        <path d={TRACK} fill="none" stroke="#D6D5D1" strokeWidth={unit * 3.2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={corner.segment} fill="none" stroke="#141414" strokeWidth={unit * 3.6} strokeLinejoin="round" strokeLinecap="round" />
        <g transform={`translate(${ex} ${ey}) rotate(${angle})`}>
          <path
            d={`M ${unit * 2} ${-unit * 4.2} L ${unit * 7} 0 L ${unit * 2} ${unit * 4.2}`}
            fill="none"
            stroke="#141414"
            strokeWidth={unit * 1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
        <circle cx={mx} cy={my} r={unit * 4.6} fill="#C4161C" />
        <text x={mx} y={my + unit * 1.7} textAnchor="middle" fontSize={badgeFontSize(corner.turn, unit * 4.8)} fontWeight="700" fill="#FFFFFF" className={styles.svgText}>
          {corner.turn}
        </text>
      </svg>

      <div className={styles.band} aria-hidden="true">
        <svg className={styles.locator} viewBox={VIEWBOX} focusable="false">
          <path d={TRACK} fill="none" stroke="#141414" strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
          <path d={corner.segment} fill="none" stroke="#C4161C" strokeWidth="26" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <span className={styles.title}>
          <span className={styles.name}>{corner.name}</span>
          <span className={styles.meta}>
            {turnLabel(corner.turn)} · {directionLabel(corner.direction)}
          </span>
        </span>
        <span className={styles.label}>Magny-Cours · 4,4 km</span>
      </div>
    </div>
  );
}
