import Link from 'next/link';
import { getProjects } from '@/lib/projects';
import { EMAIL, GITHUB_URL, SITE_NAME } from '@/lib/site';
import { MobileNav } from './MobileNav';
import styles from './SiteNav.module.css';
import { TrackGlyph } from './TrackGlyph';

export type NavSection = 'accueil' | 'projets' | 'contact' | null;

export function SiteNav({ current = null }: { current?: NavSection }) {
  const projects = getProjects().map((p) => ({
    id: p.corner.id,
    turn: p.corner.turn,
    marker: p.corner.marker,
    title: p.title,
    href: p.href,
  }));

  return (
    <header className={styles.header} style={{ viewTransitionName: 'site-header' }}>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-current={current === 'accueil' ? 'page' : undefined}>
          <TrackGlyph />
          <span>{SITE_NAME}</span>
        </Link>
        <nav aria-label="Navigation principale" className={styles.links}>
          <Link href="/projets" aria-current={current === 'projets' ? 'page' : undefined}>
            Projets
          </Link>
          <Link href="/contact" aria-current={current === 'contact' ? 'page' : undefined}>
            Contact
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener">
            GitHub <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> (nouvel onglet)</span>
          </a>
        </nav>
        <MobileNav current={current} projects={projects} email={EMAIL} github={GITHUB_URL} />
      </div>
    </header>
  );
}
