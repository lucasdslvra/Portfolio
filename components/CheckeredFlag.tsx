type Props = { size?: 'large' | 'small'; className?: string };

const SIZES = { large: { width: 44, height: 30 }, small: { width: 30, height: 20 } };

/** Damier 30 × 20 (4 × 2 cases), décoratif. */
export function CheckeredFlag({ size = 'small', className }: Props) {
  const { width, height } = SIZES[size];
  return (
    <svg width={width} height={height} viewBox="0 0 30 20" aria-hidden="true" focusable="false" className={className}>
      <rect width="30" height="20" fill="#FFFFFF" stroke="#141414" strokeWidth="1.5" />
      <rect x="0" y="0" width="7.5" height="10" fill="#141414" />
      <rect x="15" y="0" width="7.5" height="10" fill="#141414" />
      <rect x="7.5" y="10" width="7.5" height="10" fill="#141414" />
      <rect x="22.5" y="10" width="7.5" height="10" fill="#141414" />
    </svg>
  );
}

/** Damier 2 × 4 cases posé sur la ligne de départ, dans le repère du circuit. */
export function StartLine({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  const cells = [-12, -6, 0, 6].flatMap((cy, row) =>
    [-4, 0].map((cx, col) => (
      <rect key={`${row}-${col}`} x={cx} y={cy} width="4" height="6" fill={(row + col) % 2 === 0 ? '#141414' : '#FFFFFF'} />
    )),
  );
  return <g transform={`translate(${x} ${y}) rotate(${rotate})`}>{cells}</g>;
}
