import { plural } from '@/lib/format';
import type { TocEntry } from '@/lib/types';
import styles from './TableOfContents.module.css';

function Links({ toc }: { toc: TocEntry[] }) {
  return (
    <ol className={styles.list}>
      {toc.map((entry) => (
        <li key={entry.id}>
          <a href={`#${entry.id}`}>
            <span className={styles.n}>{entry.n}</span>
            {entry.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Sommaire : liste collante sur desktop, <details> repliable sur mobile. */
export function TableOfContents({ toc, variant }: { toc: TocEntry[]; variant: 'desktop' | 'mobile' }) {
  if (toc.length === 0) return null;
  if (variant === 'mobile') {
    return (
      <details className={styles.details}>
        <summary>Dans ce projet · {plural(toc.length, 'partie')}</summary>
        <nav aria-label="Sommaire">
          <Links toc={toc} />
        </nav>
      </details>
    );
  }
  return (
    <nav aria-labelledby="sommaire-titre" className={styles.desktop}>
      <h2 id="sommaire-titre" className={styles.heading}>
        Dans ce projet
      </h2>
      <Links toc={toc} />
    </nav>
  );
}
