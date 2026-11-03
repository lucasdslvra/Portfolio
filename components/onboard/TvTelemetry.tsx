'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { LED_COUNT, gearLabel, type TelemetryFrame } from '@/lib/telemetry';
import styles from './Onboard.module.css';

export type TvTelemetryHandle = { update: (frame: TelemetryFrame | null, leds: number) => void };

const LED_COLORS = Array.from({ length: LED_COUNT }, (_, i) => (i < 5 ? 'var(--tv-green)' : i < 9 ? 'var(--tv-yellow)' : 'var(--tv-red)'));
const NO_DATA = '—';

/** G · Télémétrie : LED de passage de rapport, rapport, vitesse, gaz et frein. Écrit dans le DOM, sans setState. */
export const TvTelemetry = forwardRef<TvTelemetryHandle>(function TvTelemetry(_props, ref) {
  const ledRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const gearRef = useRef<HTMLSpanElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const throttleRef = useRef<HTMLDivElement>(null);
  const brakeRef = useRef<HTMLDivElement>(null);
  const lastLeds = useRef(-1);

  useImperativeHandle(ref, () => ({
    update(frame, leds) {
      const lit = frame ? leds : 0;
      if (lit !== lastLeds.current) {
        ledRefs.current.forEach((led, i) => {
          if (led) led.style.opacity = i < lit ? '1' : '0.18';
        });
        lastLeds.current = lit;
      }
      if (gearRef.current) gearRef.current.textContent = frame && frame.gear !== null ? gearLabel(frame.gear) : NO_DATA;
      if (speedRef.current) speedRef.current.textContent = frame ? String(Math.round(frame.speed)) : NO_DATA;
      if (throttleRef.current) throttleRef.current.style.height = `${frame ? Math.round(frame.throttle * 100) : 0}%`;
      if (brakeRef.current) brakeRef.current.style.height = `${frame ? Math.round(frame.brake * 100) : 0}%`;
    },
  }));

  return (
    <div className={styles.telemetry}>
      <div className={styles.leds}>
        {LED_COLORS.map((color, i) => (
          <span
            key={i}
            ref={(el) => {
              ledRefs.current[i] = el;
            }}
            className={styles.led}
            style={{ background: color, opacity: 0.18 }}
          />
        ))}
      </div>
      <div className={styles.telemetryRow}>
        <div className={styles.gearBox}>
          <span className={styles.telemetryLabel}>Rapport</span>
          <span ref={gearRef} className={styles.bigNumber}>
            {NO_DATA}
          </span>
        </div>
        <div className={styles.speedBox}>
          <span ref={speedRef} className={styles.bigNumber}>
            {NO_DATA}
          </span>
          <span className={styles.telemetryLabel}>km/h</span>
        </div>
        <div className={styles.gauges}>
          <div className={styles.gauge}>
            <div className={styles.gaugeTrack}>
              <div ref={throttleRef} className={styles.gaugeFill} style={{ background: 'var(--tv-green)', height: '0%' }} />
            </div>
            <span className={styles.gaugeLabel}>Gaz</span>
          </div>
          <div className={styles.gauge}>
            <div className={styles.gaugeTrack}>
              <div ref={brakeRef} className={styles.gaugeFill} style={{ background: 'var(--tv-red)', height: '0%' }} />
            </div>
            <span className={styles.gaugeLabel}>Frein</span>
          </div>
        </div>
      </div>
    </div>
  );
});
