'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { formatLapTime } from '@/lib/format';
import styles from './Onboard.module.css';

export type TvChronoHandle = {
  /**
   * seconds : temps à afficher (chrono du tour si la télémétrie le donne, sinon temps de la vidéo).
   * lapTime : temps final du tour (télémétrie), affiché en record si le MDX n'en donne pas.
   */
  update: (seconds: number, lapTime?: number | null) => void;
};

/** C · Chrono du tour + record perso. Écrit dans le DOM, sans setState. */
export const TvChrono = forwardRef<TvChronoHandle, { record?: string }>(function TvChrono({ record }, ref) {
  const timeRef = useRef<HTMLSpanElement>(null);
  const recordRef = useRef<HTMLSpanElement>(null);
  const last = useRef('');
  const lastRecord = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    update(seconds, lapTime) {
      const text = formatLapTime(seconds);
      if (text !== last.current && timeRef.current) {
        timeRef.current.textContent = text;
        last.current = text;
      }
      // Le record du MDX prime ; sinon le temps final du tour, dès que la télémétrie est chargée.
      const recordText = record ?? (lapTime ? formatLapTime(lapTime) : null);
      if (recordText !== lastRecord.current && recordRef.current) {
        recordRef.current.textContent = recordText ?? '[ton temps]';
        recordRef.current.classList.toggle(styles.missing, recordText === null);
        lastRecord.current = recordText;
      }
    },
  }));

  return (
    <div className={styles.chrono}>
      <div className={styles.chronoRow}>
        <span className={styles.chronoLabel}>Chrono</span>
        <span ref={timeRef} className={styles.chronoTime}>
          0:00.000
        </span>
      </div>
      <div className={styles.recordRow}>
        <span>Record perso</span>
        <span ref={recordRef} className={record ? undefined : styles.missing}>
          {record ?? '[ton temps]'}
        </span>
      </div>
    </div>
  );
});
