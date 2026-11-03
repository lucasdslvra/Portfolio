import Link from 'next/link';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/site';
import { Button } from './Button';
import { CheckeredFlag } from './CheckeredFlag';
import styles from './FinishBanner.module.css';

/** Bandeau de fin de page : « Arrivée » (Accueil) ou « Un projet vous parle ? » (Projets). */
export function FinishBanner({ variant = 'home' }: { variant?: 'home' | 'projects' }) {
  if (variant === 'projects') {
    return (
      <section className={styles.banner} aria-labelledby="fin-projets">
        <div className={`container ${styles.inner}`}>
          <h2 id="fin-projets" className={styles.question}>
            Un projet vous parle ?
          </h2>
          <Button href="/contact" variant="secondary">
            Arrivée : me contacter
          </Button>
        </div>
      </section>
    );
  }
  return (
    <section className={styles.banner} aria-labelledby="fin-accueil">
      <div className={`container ${styles.inner} ${styles.home}`}>
        <div className={styles.title}>
          <CheckeredFlag size="large" />
          <h2 id="fin-accueil">
            <Link href="/contact">Arrivée : me contacter</Link>
          </h2>
        </div>
        <ul className={styles.links}>
          <li>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener">
              LinkedIn <span aria-hidden="true">↗</span>
              <span className="visually-hidden"> (nouvel onglet)</span>
            </a>
          </li>
          <li>
            <a href={GITHUB_URL} target="_blank" rel="noopener">
              GitHub <span aria-hidden="true">↗</span>
              <span className="visually-hidden"> (nouvel onglet)</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
