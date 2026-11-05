'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { lapFractionAt, turnLabel } from '@/lib/circuit';
import { holdIntro } from '@/lib/intro';
import { HOT_LAP, LAP_TURNS, lapTurnAt } from '@/lib/lap';
import { frameAt, gearRanges, litLeds, validateTelemetry, type GearRanges, type Telemetry } from '@/lib/telemetry';
import type { ProjectSummary } from '@/lib/types';
import styles from './Onboard.module.css';
import { OnboardVideo } from './OnboardVideo';
import type { TvChronoHandle } from './TvChrono';
import { TvLapLowerThird, TvLowerThird } from './TvLowerThird';
import type { TvMiniMapHandle } from './TvMiniMap';
import { TvOverlay } from './TvOverlay';
import type { TvTelemetryHandle } from './TvTelemetry';

type Props = {
  projects: ProjectSummary[];
  activeId: string | null;
  open: boolean;
  /** Vrai quand on monte et précharge les vidéos (dès l'arrivée, ou au premier survol si les données sont économisées). */
  armed: boolean;
  reducedMotion: boolean;
  /** Hot lap en cours : la scène montre le tour complet au lieu du virage sélectionné. */
  lap: boolean;
  /** Vrai dès que le hot lap a été demandé ou survolé : on monte et précharge sa vidéo. */
  lapArmed: boolean;
  onLapEnd: () => void;
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

const LAP_LABEL = `Vue embarquée : hot lap, un tour complet du circuit de Nevers Magny-Cours en ${HOT_LAP.record}.`;

export function OnboardStage({ projects, activeId, open, armed, reducedMotion, lap, lapArmed, onLapEnd }: Props) {
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const lapVideo = useRef<HTMLVideoElement | null>(null);
  const telemetry = useRef<LoadedTelemetry | null>(null);
  const lapTelemetry = useRef<LoadedTelemetry | null>(null);
  const chronoRef = useRef<TvChronoHandle>(null);
  const miniMapRef = useRef<TvMiniMapHandle>(null);
  const telemetryRef = useRef<TvTelemetryHandle>(null);
  // Virage où se trouve la voiture pendant le hot lap (change une quinzaine de fois par tour).
  const [lapTurnIndex, setLapTurnIndex] = useState(0);
  const lapTurnRef = useRef(lapTurnIndex);
  // Ref : un nouveau callback du parent ne doit pas relancer le tour.
  const onLapEndRef = useRef(onLapEnd);
  onLapEndRef.current = onLapEnd;

  const active = projects.find((p) => p.corner.id === activeId) ?? projects[0];

  const register = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videos.current.set(id, el);
    else videos.current.delete(id);
  }, []);

  // Télémétrie de tous les virages préchargée avec les vidéos, pendant les feux de départ.
  useEffect(() => {
    if (!armed) return;
    projects.forEach((project) => {
      const url = project.onboard?.telemetry;
      if (url) holdIntro(loadTelemetry(url));
    });
  }, [armed, projects]);

  // Télémétrie du virage affiché (déjà en cache si préchargée).
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

  // Hot lap : télémétrie du tour chargée avec sa vidéo ; départ de zéro à chaque lancement.
  useEffect(() => {
    if (!lapArmed) return;
    let cancelled = false;
    loadTelemetry(HOT_LAP.telemetry).then((loaded) => {
      if (!cancelled) lapTelemetry.current = loaded;
    });
    return () => {
      cancelled = true;
    };
  }, [lapArmed]);

  useEffect(() => {
    const video = lapVideo.current;
    if (!video) return;
    if (lap) {
      lapTurnRef.current = 0;
      setLapTurnIndex(0);
      video.currentTime = 0;
      video.play().catch(() => {
        // Lecture refusée : on revient à la carte plutôt que de rester sur une image figée.
        onLapEndRef.current();
      });
    } else {
      video.pause();
    }
  }, [lap]);

  // Boucle d'affichage : requestVideoFrameCallback quand la vidéo joue, sinon requestAnimationFrame.
  useEffect(() => {
    if (!open || (!lap && !active)) return;
    const video = lap ? lapVideo.current : (videos.current.get(active.corner.id) ?? null);
    // Le hot lap est lancé à la demande : il joue même avec les animations réduites.
    const live = Boolean(video) && (lap || !reducedMotion);
    let rafId = 0;
    let vfcId = 0;
    let stopped = false;

    const render = () => {
      const time = video && live ? video.currentTime : 0;
      const duration = video && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null;
      const loaded = lap ? lapTelemetry.current : telemetry.current;
      const frame = loaded ? frameAt(loaded.data, time) : null;
      const progress = frame?.progress ?? (duration ? time / duration : 0);
      chronoRef.current?.update(frame?.chrono ?? time, loaded?.data.lapTime ?? null);
      miniMapRef.current?.update(progress, frame?.distance != null ? lapFractionAt(frame.distance) : null);
      telemetryRef.current?.update(frame, frame && loaded ? litLeds(frame, loaded.data, loaded.ranges) : 0);
      if (lap && frame?.distance != null) {
        const turn = lapTurnAt(frame.distance);
        if (turn.index !== lapTurnRef.current) {
          lapTurnRef.current = turn.index;
          setLapTurnIndex(turn.index);
        }
      }
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
    if (video && live && 'requestVideoFrameCallback' in video) {
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
  }, [open, active, reducedMotion, lap]);

  if (!active && !lap) return null;

  const lapTurn = LAP_TURNS[lapTurnIndex] ?? LAP_TURNS[0];
  const overlay = lap ? (
    <TvOverlay
      turn={lapTurn.turn}
      cornerName={lapTurn.name}
      segment={lapTurn.segment}
      record={HOT_LAP.record}
      lowerThird={
        <TvLapLowerThird
          project={projects.find((p) => p.corner.id === lapTurn.corner) ?? null}
          projectCount={projects.length}
        />
      }
      chronoRef={chronoRef}
      miniMapRef={miniMapRef}
      telemetryRef={telemetryRef}
    />
  ) : (
    <TvOverlay
      turn={active.corner.turn}
      cornerName={active.corner.name}
      segment={active.corner.segment}
      record={active.onboard?.record}
      clipHint={process.env.NODE_ENV !== 'production' && !active.onboard ? active.clipHint : undefined}
      lowerThird={<TvLowerThird project={active} />}
      chronoRef={chronoRef}
      miniMapRef={miniMapRef}
      telemetryRef={telemetryRef}
    />
  );

  return (
    <div
      className={styles.scene}
      data-open={open}
      role="img"
      aria-label={lap ? LAP_LABEL : describe(active)}
      aria-hidden={!open}
    >
      {armed &&
        projects.map((project) => (
          <OnboardVideo
            key={project.slug}
            media={project.onboard}
            visible={!lap && project.corner.id === active?.corner.id}
            playing={open && !lap && project.corner.id === active?.corner.id}
            reducedMotion={reducedMotion}
            register={(el) => register(project.corner.id, el)}
          />
        ))}
      {!armed && !lap && <div className={`${styles.media} ${styles.mediaVisible} ${styles.noClip}`} />}
      {lapArmed && (
        <video
          ref={lapVideo}
          className={`${styles.media} ${lap ? styles.mediaVisible : ''}`}
          muted
          playsInline
          preload="auto"
          poster={HOT_LAP.poster}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onEnded={() => onLapEndRef.current()}
        >
          <source src={HOT_LAP.clipWebm} type="video/webm" />
          <source src={HOT_LAP.clip} type="video/mp4" />
        </video>
      )}
      {overlay}
    </div>
  );
}
