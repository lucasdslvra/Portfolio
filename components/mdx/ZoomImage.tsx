'use client';

import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ZoomImage.module.css';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  sizes: string;
};

type Phase = 'closed' | 'open' | 'closing';

const EASE = 'cubic-bezier(0.5, 0, 0.2, 1)';
const DURATION = 380;

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Transformation qui ramène `to` sur le rectangle `from` (technique FLIP). */
function flip(from: DOMRect, to: DOMRect): string {
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

/**
 * Image d'article agrandissable : un clic la fait passer au premier plan sur un fond
 * flouté, depuis sa position (et elle y retourne à la fermeture).
 */
export function ZoomImage({ src, alt, width, height, caption, sizes }: Props) {
  const [phase, setPhase] = useState<Phase>('closed');
  const [hiResLoaded, setHiResLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previewSrc = useRef('');

  const open = () => {
    const img = frameRef.current?.querySelector('img');
    // Aperçu seulement si la vignette est déjà chargée (sinon on attend la grande version).
    previewSrc.current = img?.complete && img.currentSrc ? img.currentSrc : '';
    setPhase('open');
  };

  const close = useCallback(() => {
    const box = boxRef.current;
    const frame = frameRef.current;
    const finish = () => {
      setPhase('closed');
      triggerRef.current?.focus({ preventScroll: true });
    };
    if (!box || !frame || reducedMotion()) {
      finish();
      return;
    }
    setPhase('closing');
    const animation = box.animate([{ transform: 'none' }, { transform: flip(frame.getBoundingClientRect(), box.getBoundingClientRect()) }], {
      duration: DURATION * 0.85,
      easing: EASE,
      fill: 'forwards',
    });
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DURATION * 0.85, easing: 'ease', fill: 'forwards' });
    animation.onfinish = finish;
  }, []);

  // Entrée : l'image part de sa place dans l'article.
  useLayoutEffect(() => {
    if (phase !== 'open') return;
    const box = boxRef.current;
    const frame = frameRef.current;
    closeRef.current?.focus({ preventScroll: true });
    if (!box || !frame || reducedMotion()) return;
    box.animate([{ transform: flip(frame.getBoundingClientRect(), box.getBoundingClientRect()) }, { transform: 'none' }], {
      duration: DURATION,
      easing: EASE,
    });
    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION * 0.7, easing: 'ease' });
  }, [phase]);

  // Défilement bloqué, Échap et focus piégé tant que l'image est au premier plan.
  useEffect(() => {
    if (phase === 'closed') return;
    const { body, documentElement } = document;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [phase, close]);

  const label = alt ? `Agrandir l'image : ${alt}` : "Agrandir l'image";
  const ratio = width / height;

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.trigger} onClick={open} aria-label={label} aria-haspopup="dialog">
        <span ref={frameRef} className={styles.frame} data-lifted={phase !== 'closed'}>
          <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className={styles.thumb} />
        </span>
        <span className={styles.hint} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" focusable="false">
            <path d="M8.5 1.5h4v4M12.5 1.5 8 6M5.5 12.5h-4v-4M1.5 12.5 6 8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Agrandir
        </span>
      </button>

      {phase !== 'closed' &&
        createPortal(
          <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={alt || 'Image agrandie'} data-phase={phase}>
            <div ref={backdropRef} className={styles.backdrop} onClick={close} />
            <button ref={closeRef} type="button" className={styles.close} onClick={close}>
              Fermer
            </button>
            <figure className={styles.stage} onClick={close}>
              <div
                ref={boxRef}
                className={styles.box}
                style={{ aspectRatio: `${width} / ${height}`, width: `min(92vw, ${(82 * ratio).toFixed(2)}vh, ${width}px)` }}
              >
                {/* Aperçu déjà chargé (même fichier que dans l'article), le temps que la grande version arrive. */}
                {previewSrc.current && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewSrc.current} alt="" className={styles.layer} aria-hidden="true" />
                )}
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  sizes="92vw"
                  quality={90}
                  loading="eager"
                  className={`${styles.layer} ${styles.hiRes}`}
                  data-loaded={hiResLoaded}
                  onLoad={() => setHiResLoaded(true)}
                />
              </div>
              {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
            </figure>
          </div>,
          document.body,
        )}
    </>
  );
}
