'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

/** Délai maximal d'attente du nouveau rendu avant de laisser la transition se terminer. */
const MAX_WAIT = 3000;

function internalHref(event: MouseEvent): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!(target instanceof HTMLAnchorElement)) return null;
  if (target.target && target.target !== '_self') return null;
  if (target.hasAttribute('download') || target.dataset.noTransition !== undefined) return null;
  const url = new URL(target.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  // Ancre dans la même page (sommaire) : défilement normal.
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  return url;
}

/**
 * Transitions entre les pages avec la View Transitions API (sans librairie).
 * Les clics sur les liens internes sont interceptés et la navigation du routeur
 * est enveloppée dans document.startViewTransition ; la transition se termine
 * quand la nouvelle URL est rendue. Sans support ou avec prefers-reduced-motion,
 * rien n'est intercepté : navigation normale.
 */
export function PageTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pending = useRef<(() => void) | null>(null);

  // Nouvelle URL rendue : on libère la transition en cours.
  useEffect(() => {
    pending.current?.();
    pending.current = null;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof document.startViewTransition !== 'function') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onClick = (event: MouseEvent) => {
      if (reduced.matches) return;
      const url = internalHref(event);
      if (!url) return;
      event.preventDefault();
      const samePage = url.pathname === window.location.pathname;
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const timer = window.setTimeout(resolve, MAX_WAIT);
            pending.current = () => {
              window.clearTimeout(timer);
              resolve();
            };
            router.push(url.pathname + url.search + url.hash, { scroll: !samePage });
          }),
      );
    };

    // Phase de capture sur window : passe avant le gestionnaire du <Link> de Next,
    // qui ignore ensuite le clic (defaultPrevented).
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [router]);

  return null;
}
