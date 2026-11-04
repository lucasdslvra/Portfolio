import type { CSSProperties } from 'react';
import { FINISH_STRAIGHT, GRAVEL_TRAP, START_LINE, TRACK, TRACK_LABEL, VIEWBOX, turnLabel } from '@/lib/circuit';
import type { Point } from '@/lib/types';
import { StartLine } from './CheckeredFlag';
import styles from './TrackMap.module.css';

/** Ce dont la carte a besoin pour un projet : son virage (numéro officiel) et sa position dans le tour. */
export type MapCorner = {
  id: string;
  name: string;
  position: number;
  /** Numéro officiel du virage, affiché dans la pastille. */
  turn: string;
  segment: string;
  marker: Point;
  zoomOrigin: Point;
};

type HomeProps = {
  variant: 'home';
  corners: MapCorner[];
  activeId: string | null;
  /** Vue embarquée ouverte : la carte zoome sur le virage actif puis s'efface. */
  zoomed?: boolean;
  onSelect?: (id: string) => void;
};
type FilteredProps = { variant: 'filtered'; corners: MapCorner[]; visibleIds: string[] };
type MiniProps = { variant: 'mini'; corner: MapCorner };
type FinishProps = { variant: 'finish'; corners: MapCorner[] };
type OfftrackProps = { variant: 'offtrack' };

export type TrackMapProps = (HomeProps | FilteredProps | MiniProps | FinishProps | OfftrackProps) & {
  className?: string;
};

export function listNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}

function Track({ color, width = 12 }: { color: string; width?: number }) {
  return <path d={TRACK} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />;
}

function Segment({ d, color, width }: { d: string; color: string; width: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
}

function Label({ children }: { children: string }) {
  return (
    <text x="664" y="468" textAnchor="end" fontSize="13" fill="#6A6A66" className={`${styles.label} ${styles.caption}`}>
      {children}
    </text>
  );
}

function Badge({ corner, r, fill, stroke, text, fontSize, strokeWidth = 0 }: {
  corner: MapCorner; r: number; fill: string; stroke?: string; text: string; fontSize: number; strokeWidth?: number;
}) {
  const [x, y] = corner.marker;
  return (
    <g className={styles.pin}>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <text x={x} y={y + fontSize * 0.35} textAnchor="middle" fontSize={badgeFontSize(corner.turn, fontSize)} fontWeight="700" fill={text} className={styles.label}>
        {corner.turn}
      </text>
    </g>
  );
}

/** Les numéros à deux chiffres ou doubles (« 12-13 ») rétrécissent pour rester dans la pastille. */
export function badgeFontSize(turn: string, base: number): number {
  if (turn.length >= 4) return base * 0.55;
  if (turn.length >= 2) return base * 0.8;
  return base;
}

function homeLabel(corners: MapCorner[], activeId: string | null) {
  const names = listNames(corners.map((c) => c.name));
  const active = corners.find((c) => c.id === activeId);
  const n = corners.length;
  return (
    `Tracé du circuit de Nevers Magny-Cours, avec ${n} virage${n > 1 ? 's' : ''} numéroté${n > 1 ? 's' : ''} : ${names}` +
    (active ? `. ${turnLabel(active.turn)}, ${active.name}, en évidence.` : '.')
  );
}

export function TrackMap(props: TrackMapProps) {
  const className = [styles.map, props.className].filter(Boolean).join(' ');

  if (props.variant === 'home') {
    const { corners, activeId, zoomed = false, onSelect } = props;
    const active = corners.find((c) => c.id === activeId);
    const [ox, oy] = active?.zoomOrigin ?? [340, 240];
    const zoomStyle = { transformOrigin: `${ox}px ${oy}px` } as CSSProperties;
    return (
      <svg viewBox={VIEWBOX} role="img" aria-label={homeLabel(corners, activeId)} className={`${className} ${styles.home}`}>
        <g className={styles.zoom} data-zoomed={zoomed} style={zoomStyle}>
          <Track color="#141414" />
          {active && <Segment d={active.segment} color="#C4161C" width={6} />}
          <StartLine {...START_LINE} />
          <g transform="translate(330 113) rotate(17)">
            <path d="M-8 -6 L4 0 L-8 6" fill="none" stroke="#6A6A66" strokeWidth="2" />
          </g>
          <Label>{TRACK_LABEL}</Label>
          {corners.map((corner) => {
            const on = corner.id === activeId;
            return (
              <g
                key={corner.id}
                className={styles.hit}
                data-corner={corner.id}
                onClick={onSelect ? () => onSelect(corner.id) : undefined}
              >
                <Badge corner={corner} r={18} fill={on ? '#C4161C' : '#FFFFFF'} stroke={on ? '#C4161C' : '#141414'} strokeWidth={2.5} text={on ? '#FFFFFF' : '#141414'} fontSize={16} />
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

  if (props.variant === 'filtered') {
    const { corners, visibleIds } = props;
    const visible = corners.filter((c) => visibleIds.includes(c.id));
    const label = visible.length
      ? `Carte des virages : ${listNames(visible.map((c) => c.name))} en noir, les autres en gris`
      : 'Carte des virages : aucun virage dans cette catégorie';
    return (
      <svg viewBox={VIEWBOX} role="img" aria-label={label} className={className}>
        <Track color="#D6D5D1" />
        {visible.map((c) => (
          <Segment key={c.id} d={c.segment} color="#141414" width={13} />
        ))}
        {corners.map((c) => (
          <Badge key={c.id} corner={c} r={20} fill={visibleIds.includes(c.id) ? '#C4161C' : '#B9B8B3'} text="#FFFFFF" fontSize={20} />
        ))}
      </svg>
    );
  }

  if (props.variant === 'mini') {
    const { corner } = props;
    return (
      <svg viewBox={VIEWBOX} role="img" aria-label={`Mini-carte de Magny-Cours : ${turnLabel(corner.turn).toLowerCase()}, ${corner.name}, est mis en évidence`} className={className}>
        <Track color="#D6D5D1" />
        <Segment d={corner.segment} color="#141414" width={14} />
        <Badge corner={corner} r={22} fill="#C4161C" text="#FFFFFF" fontSize={20} />
      </svg>
    );
  }

  if (props.variant === 'finish') {
    return (
      <svg viewBox={VIEWBOX} role="img" aria-label="Le circuit avec la ligne droite des stands, jusqu'à la ligne d'arrivée, mise en évidence" className={className}>
        <Track color="#D6D5D1" />
        <Segment d={FINISH_STRAIGHT} color="#141414" width={14} />
        <StartLine {...START_LINE} />
        {props.corners.map((c) => (
          <circle key={c.id} cx={c.marker[0]} cy={c.marker[1]} r="13" fill="#B9B8B3" className={styles.pin} />
        ))}
        <Label>Circuit de Nevers Magny-Cours</Label>
      </svg>
    );
  }

  const { x, y } = GRAVEL_TRAP;
  return (
    <svg viewBox={VIEWBOX} role="img" aria-label="Le circuit de Magny-Cours, avec un point rouge sorti de la piste dans le bac à graviers de l'épingle d'Adélaïde" className={className}>
      <ellipse cx={x} cy={y - 2} rx="66" ry="24" fill="#EFE7D6" stroke="#C9BFA8" strokeWidth="2" strokeDasharray="4 6" />
      <Track color="#141414" />
      <path d={`M250 404 C200 420 160 436 ${x + 8} ${y - 3}`} fill="none" stroke="#C4161C" strokeWidth="3" strokeDasharray="6 6" />
      <circle cx={x} cy={y} r="11" fill="#C4161C" />
      <g className={styles.caption}>
        <text x="232" y="474" fontSize="15" fill="#6A6A66" className={styles.label}>
          vous êtes ici · graviers d&apos;Adélaïde
        </text>
        <path d={`M228 469 L${x + 16} ${y + 2}`} stroke="#6A6A66" strokeWidth="1.5" />
      </g>
      <StartLine {...START_LINE} />
    </svg>
  );
}
