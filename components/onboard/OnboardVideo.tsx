'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { holdIntro } from '@/lib/intro';
import type { OnboardMedia } from '@/lib/types';
import styles from './Onboard.module.css';

type Props = {
  media?: OnboardMedia;
  /** Affichée à l'écran (sélectionnée et vue ouverte). */
  playing: boolean;
  visible: boolean;
  reducedMotion: boolean;
  register: (el: HTMLVideoElement | null) => void;
};

/**
 * Vidéo décorative d'un virage. Montée dès l'arrivée sur l'accueil (préchargée derrière
 * les feux de départ), jouée uniquement quand elle est affichée, remise à 0 à chaque sélection.
 */
export function OnboardVideo({ media, playing, visible, reducedMotion, register }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Montée pendant les feux de départ : ils restent allumés jusqu'à ce que la vidéo puisse
  // démarrer tout de suite (ou échoue à se charger ; le délai maximal des feux s'applique aussi).
  // La suite continue de se charger pendant la visite.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return;
    holdIntro(
      new Promise<void>((resolve) => {
        video.addEventListener('canplay', () => resolve(), { once: true });
        // Les erreurs de <source> ne remontent pas : écoute en capture, et seulement la dernière
        // source (les précédentes peuvent échouer avant qu'une autre ne prenne le relais).
        video.addEventListener(
          'error',
          (event) => {
            if (event.target === video || event.target === video.lastElementChild) resolve();
          },
          { capture: true },
        );
      }),
    );
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing && !reducedMotion) {
      video.currentTime = 0;
      video.play().catch(() => {
        // Lecture refusée (économie d'énergie…) : le poster reste affiché.
      });
    } else {
      video.pause();
    }
  }, [playing, reducedMotion]);

  const className = `${styles.media} ${visible ? styles.mediaVisible : ''}`;

  if (media && !reducedMotion) {
    return (
      <video
        ref={(el) => {
          videoRef.current = el;
          register(el);
        }}
        className={className}
        muted
        playsInline
        loop
        preload="auto"
        poster={media.poster}
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
      >
        {media.clipWebm && <source src={media.clipWebm} type="video/webm" />}
        <source src={media.clip} type="video/mp4" />
      </video>
    );
  }

  if (media?.poster) {
    return (
      <div className={className} aria-hidden="true">
        <Image src={media.poster} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className={styles.poster} />
      </div>
    );
  }

  return <div className={`${className} ${styles.noClip}`} aria-hidden="true" />;
}
