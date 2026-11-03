import styles from './CornerBadge.module.css';

export type CornerBadgeState = 'inactive' | 'active' | 'off' | 'step';

type Props = { n: number | string; state?: CornerBadgeState; size?: number; className?: string };

/** Taille du texte : les numéros à deux chiffres ou doubles (« 12-13 ») rétrécissent. */
function textScale(n: number | string): number {
  const length = String(n).length;
  return length >= 4 ? 0.55 : length >= 2 ? 0.8 : 1;
}

/** Pastille ronde numérotée. La couleur n'est jamais le seul indice : l'état actif est aussi plein. */
export function CornerBadge({ n, state = 'inactive', size, className }: Props) {
  return (
    <span
      className={[styles.badge, styles[state], className].filter(Boolean).join(' ')}
      style={{
        ...(size ? { width: size, height: size } : null),
        fontSize: `${(size ? size * 0.47 : 14) * textScale(n)}px`,
      }}
      aria-hidden="true"
    >
      {n}
    </span>
  );
}
