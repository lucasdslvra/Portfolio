'use client';

import { useCallback, useEffect, useRef } from 'react';
import { lapFractionAt, turnLabel } from '@/lib/circuit';
import { frameAt, gearRanges, litLeds, validateTelemetry, type GearRanges, type Telemetry } from '@/lib/telemetry';
import type { ProjectSummary } from '@/lib/types';
import styles from './Onboard.module.css';
import { OnboardVideo } from './OnboardVideo';
import type { TvChronoHandle } from './TvChrono';
import type { TvMiniMapHandle } from './TvMiniMap';
import { TvOverlay } from './TvOverlay';
import type { TvTelemetryHandle } from './TvTelemetry';

type Props = {
  projects: ProjectSummary[];
  activeId: string | null;
  open: boolean;
  /** Vrai dès que la souris (ou le focus) est entrée dans la liste : on monte et précharge les vidéos. */
  armed: boolean;
  reducedMotion: boolean;
};

type LoadedTelemetry = { data: Telemetry; ranges: GearRanges };

// Cache partagé : chaque fichier n'est téléchargé qu'une fois par visite.
const telemetryCache = new Map<string, Promise<LoadedTelemetry | null>>();

function loadTelemetry(url: string): Promise<LoadedTelemetry | null> {
  let pending = telemetryCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: unknown) => {
        if (json === null) return null;
        const result = validateTelemetry(json);
        if (!result.ok) {
          console.warn(`[télémétrie] ${url} ignoré :`, result.errors.slice(0, 5));
          return null;
        }
        return { data: result.value, ranges: gearRanges(result.value) };
      })
      .catch(() => null);
    telemetryCache.set(url, pending);
  }
  return pending;
}

function describe(project: ProjectSummary): string {
  const direction =
    project.corner.direction === 'chicane' ? 'une chicane' : `un virage à ${project.corner.direction}`;
  return `Vue embarquée, ${turnLabel(project.corner.turn).toLowerCase()}, ${project.corner.name} (${direction}) : ${project.title}. ${project.short}`;
}

export function OnboardStage({ projects, activeId, open, armed, reducedMotion }: Props) {
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const telemetry = useRef<LoadedTelemetry | null>(null);
  const chronoRef = useRef<TvChronoHandle>(null);
  const miniMapRef = useRef<TvMiniMapHandle>(null);
  const telemetryRef = useRef<TvTelemetryHandle>(null);

  const active = projects.find((p) => p.corner.id === activeId) ?? projects[0];

  const register = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videos.current.set(id, el);
    else videos.current.delete(id);
  }, []);

  // Télémétrie du virage affiché : chargée au premier survol, puis en cache.
  useEffect(() => {
    telemetry.current = null;
    const url = active?.onboard?.telemetry;
    if (!open || !url) return;
    let cancelled = false;
    loadTelemetry(url).then((loaded) => {
      if (!cancelled) telemetry.current = loaded;
    });
    return () => {
      cancelled = true;
    };
  }, [open, active]);

  // Boucle d'affichage : requestVideoFrameCallback quand la vidéo joue, sinon requestAnimationFrame.
  useEffect(() => {
    if (!open || !active) return;
    const video = videos.current.get(active.corner.id) ?? null;
    let rafId = 0;
    let vfcId = 0;
    let stopped = false;

    const render = () => {
      const time = video && !reducedMotion ? video.currentTime : 0;
      const duration = video && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null;
      const loaded = telemetry.current;
      const frame = loaded ? frameAt(loaded.data, time) : null;
      const progress = frame?.progress ?? (duration ? time / duration : 0);
      chronoRef.current?.update(frame?.chrono ?? time, loaded?.data.lapTime ?? null);
      miniMapRef.current?.update(progress, frame?.distance != null ? lapFractionAt(frame.distance) : null);
      telemetryRef.current?.update(frame, frame && loaded ? litLeds(frame, loaded.data, loaded.ranges) : 0);
    };

    const onVideoFrame = () => {
      if (stopped || !video) return;
      render();
      vfcId = video.requestVideoFrameCallback(onVideoFrame);
    };
    const onAnimationFrame = () => {
      if (stopped) return;
      render();
      rafId = requestAnimationFrame(onAnimationFrame);
    };

    render();
    if (video && !reducedMotion && 'requestVideoFrameCallback' in video) {
      vfcId = video.requestVideoFrameCallback(onVideoFrame);
    } else {
      // Sans vidéo, la boucle sert encore à afficher la télémétrie une fois chargée.
      rafId = requestAnimationFrame(onAnimationFrame);
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      if (video && vfcId && 'cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(vfcId);
    };
  }, [open, active, reducedMotion]);

  if (!active) return null;

  return (
    <div
      className={styles.scene}
      data-open={open}
      role="img"
      aria-label={describe(active)}
      aria-hidden={!open}
    >
      {armed &&
        projects.map((project) => (
          <OnboardVideo
            key={project.slug}
            media={project.onboard}
            visible={project.corner.id === active.corner.id}
            playing={open && project.corner.id === active.corner.id}
            reducedMotion={reducedMotion}
            register={(el) => register(project.corner.id, el)}
          />
        ))}
      {!armed && <div className={`${styles.media} ${styles.mediaVisible} ${styles.noClip}`} />}
      <TvOverlay project={active} chronoRef={chronoRef} miniMapRef={miniMapRef} telemetryRef={telemetryRef} />
    </div>
  );
}
