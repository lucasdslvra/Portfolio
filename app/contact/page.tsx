import type { Metadata } from 'next';
import { CheckeredFlag } from '@/components/CheckeredFlag';
import { ContactLinkRow, ContactRow } from '@/components/ContactRow';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import { TextLink } from '@/components/TextLink';
import { TrackMap } from '@/components/TrackMap';
import { toMapCorner } from '@/lib/map';
import { getProjects } from '@/lib/projects';
import { EMAIL, GITHUB_URL, LINKEDIN_URL, OG_IMAGE } from '@/lib/site';
import styles from './page.module.css';

const LEAD =
  "Une question sur un projet, une opportunité ou juste envie de parler simracing ? Le plus simple, c'est l'e-mail.";

export const metadata: Metadata = {
  title: 'Me contacter',
  description: LEAD,
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Me contacter — Lucas Da Silveira', description: LEAD, url: '/contact', images: [OG_IMAGE] },
};

export default function ContactPage() {
  const corners = getProjects().map(toMapCorner);
  return (
    <>
      <SiteNav current="contact" />
      <main id="contenu" className={`container ${styles.main}`}>
        <div className={styles.content}>
          <p className={styles.flag}>
            <CheckeredFlag size="large" />
            <span className="surtitle">Arrivée</span>
          </p>
          <h1 className="h1">Me contacter</h1>
          <p className={`lead ${styles.lead}`}>{LEAD}</p>
          <div className={styles.rows}>
            <ContactRow email={EMAIL} />
            <ContactLinkRow label="LinkedIn" value="in/lucasdslvra" href={LINKEDIN_URL} />
            <ContactLinkRow label="GitHub" value="lucasdslvra" href={GITHUB_URL} />
          </div>
        </div>
        <aside className={styles.side} aria-label="La ligne d'arrivée">
          <div className="vt-circuit">
            <TrackMap variant="finish" corners={corners} />
          </div>
          <p className={styles.note}>
            Sortie du Lycée, ligne droite des stands : vous êtes sur la ligne d&apos;arrivée.{' '}
            <TextLink href="/projets">Refaire un tour des projets</TextLink>
          </p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
