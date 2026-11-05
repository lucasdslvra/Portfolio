'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { introReady } from '@/lib/intro';
import styles from './StartLights.module.css';

/** Nombre de modules du portique (comme en F1). */
const COLUMNS = 5;
/** Allumage du premier module, puis écart entre deux modules (ms). */
const FIRST = 250;
const STEP = 280;
/** Pause minimale entre le cinquième module et l'extinction, avant l'attente aléatoire. */
const SETTLE = 300;
/** Laisse aux composants de la page le temps de s'hydrater et d'enregistrer leurs attentes. */
const REGISTER_GRACE = 150;
/** Les feux s'éteignent au plus tard à ce moment (ms depuis le début du chargement). */
const MAX_WAIT = 5000;

/**
 * Script inline exécuté dans le <head>, avant le premier affichage, donc à chaque
 * chargement complet (arrivée, rafraîchissement) et jamais pendant la navigation
 * interne. Joue l'intro sauf si les animations sont réduites ou si
 * sessionStorage['ld-intro'] vaut 'off' (tests, développement), et tire la durée
 * d'attente feux allumés, comme le délai aléatoire d'un vrai départ.
 * Sans ce script, l'overlay reste masqué : aucun flash du site avant les feux.
 */
export const START_LIGHTS_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem('ld-intro')!=='off'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-intro','');d.style.setProperty('--intro-hold',(200+Math.random()*500|0)+'ms')}}catch(e){}`;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, ms)));

/**
 * Feux de départ affichés à chaque chargement du site, qui servent aussi d'écran
 * de chargement : les cinq modules s'allument un par un et restent allumés tant
 * que la page attend des ressources (voir holdIntro dans lib/intro), puis
 * s'éteignent ensemble et l'écran se lève.
 *
 * États de html[data-intro] : '' allumage puis attente, 'go' extinction et départ,
 * 'skip' sortie immédiate (clic, touche, molette ou glissé).
 */
export function StartLights() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const overlay = ref.current;
    if (!overlay || !root.hasAttribute('data-intro')) return;

    let done = false;
    const leave = (state: 'go' | 'skip') => {
      if (!done && root.hasAttribute('data-intro') && root.getAttribute('data-intro') !== 'skip') {
        root.setAttribute('data-intro', state);
      }
    };
    const skip = () => leave('skip');
    const end = () => {
      done = true;
      root.removeAttribute('data-intro');
      root.style.removeProperty('--intro-hold');
      cleanup();
    };
    // Seule l'animation de sortie s'applique à l'overlay lui-même.
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === overlay) end();
    };

    // Extinction : cinq modules allumés + attente aléatoire, ET ressources prêtes
    // (ou délai maximal atteint, compté depuis le début du chargement).
    const hold = parseInt(root.style.getPropertyValue('--intro-hold'), 10) || 450;
    const lastLamp = overlay.querySelector<HTMLElement>(`.${styles.pod}:last-child .${styles.lamp}`);
    const lit = lastLamp?.getAnimations
      ? Promise.all(lastLamp.getAnimations().map((a) => a.finished)).catch(() => undefined)
      : wait(FIRST + STEP * (COLUMNS - 1));
    Promise.all([
      lit.then(() => wait(SETTLE + hold)),
      wait(REGISTER_GRACE).then(() => Promise.race([introReady(), wait(MAX_WAIT - performance.now())])),
    ]).then(() => leave('go'));

    // Filet de sécurité si animationend ne se déclenche pas.
    const fallback = window.setTimeout(end, MAX_WAIT + 3000);

    const events = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const;
    function cleanup() {
      window.clearTimeout(fallback);
      overlay?.removeEventListener('animationend', onAnimationEnd);
      events.forEach((name) => window.removeEventListener(name, skip));
    }

    overlay.addEventListener('animationend', onAnimationEnd);
    events.forEach((name) => window.addEventListener(name, skip, { passive: true }));
    return () => {
      done = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={styles.overlay}
      style={{ '--first': `${FIRST}ms`, '--step': `${STEP}ms` } as CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.gantry}>
        {Array.from({ length: COLUMNS }, (_, i) => (
          <div key={i} className={styles.pod} style={{ '--i': i } as CSSProperties}>
            <span className={styles.lamp} />
            <span className={styles.lamp} />
          </div>
        ))}
      </div>
    </div>
  );
}
