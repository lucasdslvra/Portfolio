import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import { TextLink } from '@/components/TextLink';
import { TrackMap } from '@/components/TrackMap';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Sortie de piste',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="contenu" className={`container ${styles.main}`}>
        <div className={styles.content}>
          <p className="surtitle">Erreur 404</p>
          <h1 className="h1">Sortie de piste</h1>
          <p className={`lead ${styles.lead}`}>
            Cette page n&apos;existe pas, ou elle a été déplacée. Rien de cassé : on vous remet sur la trajectoire.
          </p>
          <div className={styles.actions}>
            <Button href="/">Revenir sur la piste</Button>
            <TextLink href="/projets" className={styles.link}>
              Voir les projets
            </TextLink>
          </div>
        </div>
        <div className={`${styles.map} vt-circuit`}>
          <TrackMap variant="offtrack" />
          <p className={styles.note} aria-hidden="true">
            <span className={styles.dot} /> vous êtes ici · graviers d&apos;Adélaïde
          </p>
        </div>
      </main>
      <SiteFooter variant="email" />
    </>
  );
}
