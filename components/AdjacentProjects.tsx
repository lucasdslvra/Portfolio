import Link from 'next/link';
import { turnLabel } from '@/lib/circuit';
import type { Adjacent } from '@/lib/types';
import styles from './AdjacentProjects.module.css';

/** Virage précédent / suivant. Aux extrémités du tour : la ligne d'arrivée (contact). */
export function AdjacentProjects({ previous, next }: Adjacent) {
  return (
    <nav aria-label="Projets voisins" className={styles.nav}>
      <Link href={previous?.href ?? '/contact'} className={styles.link} rel="prev">
        <span className={styles.label}>
          <span aria-hidden="true">← </span>
          {previous ? `${turnLabel(previous.corner.turn)} · ${previous.corner.name}` : 'Arrivée'}
          <span className="visually-hidden">{previous ? ' (virage précédent)' : ''}</span>
        </span>
        <span className={styles.title}>{previous?.title ?? 'Me contacter'}</span>
      </Link>
      <Link href={next?.href ?? '/contact'} className={`${styles.link} ${styles.next}`} rel="next">
        <span className={styles.label}>
          {next ? `${turnLabel(next.corner.turn)} · ${next.corner.name}` : 'Arrivée'}
          <span className="visually-hidden">{next ? ' (virage suivant)' : ''}</span>
          <span aria-hidden="true"> →</span>
        </span>
        <span className={styles.title}>{next?.title ?? 'Me contacter'}</span>
      </Link>
    </nav>
  );
}
