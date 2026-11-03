import { TRACK, VIEWBOX } from '@/lib/circuit';

/** Pictogramme du tracé, trait épais (logo). */
export function TrackGlyph({ width = 34, height = 24, stroke = 34 }: { width?: number; height?: number; stroke?: number }) {
  return (
    <svg width={width} height={height} viewBox={VIEWBOX} aria-hidden="true" focusable="false">
      <path d={TRACK} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
    </svg>
  );
}
