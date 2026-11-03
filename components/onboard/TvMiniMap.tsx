'use client';

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { TRACK, VIEWBOX } from '@/lib/circuit';
import styles from './Onboard.module.css';

export type TvMiniMapHandle = {
  /**
   * progress : 0 à 1 sur le segment du virage.
   * lap : 0 à 1 sur le tour complet (si la télémétrie donne la distance) ; prioritaire.
   */
  update: (progress: number, lap?: number | null) => void;
};

function placeDot(path: SVGPathElement | null, dot: SVGCircleElement | null, length: number, fraction: number) {
  if (!path || !dot || !length) return;
  const point = path.getPointAtLength(length * Math.min(1, Math.max(0, fraction)));
  dot.setAttribute('cx', point.x.toFixed(1));
  dot.setAttribute('cy', point.y.toFixed(1));
}

/** D · Mini-carte : le point avance sur le virage, ou sur le tracé complet selon la distance parcourue. */
export const TvMiniMap = forwardRef<TvMiniMapHandle, { segment: string }>(function TvMiniMap({ segment }, ref) {
  const trackRef = useRef<SVGPathElement>(null);
  const segmentRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const segmentLength = useRef(0);
  const trackLength = useRef(0);

  useLayoutEffect(() => {
    trackLength.current = trackRef.current?.getTotalLength() ?? 0;
    segmentLength.current = segmentRef.current?.getTotalLength() ?? 0;
    placeDot(segmentRef.current, dotRef.current, segmentLength.current, 0);
  }, [segment]);

  useImperativeHandle(ref, () => ({
    update: (progress, lap) => {
      if (lap !== undefined && lap !== null) placeDot(trackRef.current, dotRef.current, trackLength.current, lap);
      else placeDot(segmentRef.current, dotRef.current, segmentLength.current, progress);
    },
  }));

  return (
    <div className={styles.miniMap}>
      <svg viewBox={VIEWBOX} aria-hidden="true" focusable="false">
        <path ref={trackRef} d={TRACK} fill="none" stroke="#141414" strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
        <path ref={segmentRef} d={segment} fill="none" stroke="#C4161C" strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
        <circle ref={dotRef} r="24" fill="#FFFFFF" stroke="#C4161C" strokeWidth="10" />
      </svg>
      <span className={styles.miniMapLabel}>Magny-Cours · 4,4 km</span>
    </div>
  );
});
