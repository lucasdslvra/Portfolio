'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { TRACK, VIEWBOX } from '@/lib/circuit';
import { plural } from '@/lib/format';
import type { Point } from '@/lib/types';
import styles from './MobileNav.module.css';
import type { NavSection } from './SiteNav';
import { TrackGlyph } from './TrackGlyph';

type NavProject = { id: string; turn: string; marker: Point; title: string; href: string };

type Props = { current: NavSection; projects: NavProject[]; email: string; github: string };

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** closing : le panneau reste affiché le temps de son animation de sortie. */
type Phase = 'closed' | 'open' | 'closing';
const CLOSE_FALLBACK = 400;

export function MobileNav({ current, projects, email, github }: Props) {
  const [phase, setPhase] = useState<Phase>('closed');
  const open = phase === 'open';
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /** animate = false : fermeture immédiate (passage en largeur desktop). */
  const close = useCallback((restoreFocus = true, animate = true) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase(animate && !reduced ? 'closing' : 'closed');
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  // Lien suivi : le changement de page ferme le menu (pendant la transition de page,
  // qui part d'une capture avec le menu ouvert). Lien vers la page en cours : fermeture animée.
  const onNavigate = (href: string) => () => {
    if (href === pathname) close(false);
  };

  // Fermeture à chaque changement de page.
  useEffect(() => {
    setPhase('closed');
  }, [pathname]);

  // Filet de sécurité si l'événement animationend n'arrive pas.
  useEffect(() => {
    if (phase !== 'closing') return;
    const timer = window.setTimeout(() => setPhase('closed'), CLOSE_FALLBACK);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const wide = window.matchMedia('(min-width: 720px)');
    const onWide = (e: MediaQueryListEvent) => e.matches && close(false, false);

    document.addEventListener('keydown', onKeyDown);
    wide.addEventListener('change', onWide);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      wide.removeEventListener('change', onWide);
    };
  }, [open, close]);

  const activeHref = projects.find((p) => p.href === pathname)?.href;
  const aria = (section: NavSection) => (current === section ? ('page' as const) : undefined);

  return (
    <div className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setPhase('open')}
      >
        Menu
      </button>

      <div
        ref={panelRef}
        id={panelId}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={phase === 'closed'}
        data-state={phase}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && phase === 'closing') setPhase('closed');
        }}
      >
        <div className={styles.bar}>
          <Link href="/" className={styles.brand} onClick={onNavigate('/')}>
            <TrackGlyph width={28} height={20} stroke={44} />
            <span>Lucas Da Silveira</span>
          </Link>
          <button type="button" className={styles.close} onClick={() => close()}>
            Fermer
          </button>
        </div>

        <nav aria-label="Menu principal" className={styles.links}>
          <Link href="/" aria-current={aria('accueil')} onClick={onNavigate('/')}>
            Accueil
          </Link>
          <Link href="/projets" aria-current={aria('projets')} onClick={onNavigate('/projets')}>
            Projets
            <span className={styles.meta}>{plural(projects.length, 'virage')}</span>
          </Link>
          <Link href="/contact" aria-current={aria('contact')} onClick={onNavigate('/contact')}>
            Contact
          </Link>
          <a href={github} target="_blank" rel="noopener">
            GitHub
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
            <span className="visually-hidden"> (nouvel onglet)</span>
          </a>
        </nav>

        <div className={styles.circuit}>
          <svg width="150" height="106" viewBox={VIEWBOX} aria-hidden="true" focusable="false">
            <path d={TRACK} fill="none" stroke="#141414" strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" />
            {projects.map((p) => {
              const on = p.href === activeHref;
              return (
                <circle
                  key={p.id}
                  cx={p.marker[0]}
                  cy={p.marker[1]}
                  r={on ? 30 : 26}
                  fill={on ? '#C4161C' : '#FFFFFF'}
                  stroke={on ? 'none' : '#141414'}
                  strokeWidth="6"
                />
              );
            })}
          </svg>
          <ol className={styles.projects} aria-label="Projets">
            {projects.map((p) => {
              const on = p.href === activeHref;
              return (
                <li key={p.id}>
                  <Link href={p.href} aria-current={on ? 'page' : undefined} onClick={onNavigate(p.href)}>
                    <span className={styles.n}>{p.turn}</span>
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.finish}>
          <span>Arrivée</span>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </div>
    </div>
  );
}
