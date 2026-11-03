import { FinishBanner } from '@/components/FinishBanner';
import { HomeCircuit } from '@/components/HomeCircuit';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import { numberToWords } from '@/lib/format';
import { getProjects } from '@/lib/projects';
import { personJsonLd } from '@/lib/site';
import styles from './page.module.css';

export default function HomePage() {
  const projects = getProjects();
  const n = projects.length;
  const words = numberToWords(n);
  const corners = n > 1 ? `${words} virages` : `${words} virage`;
  const items = n > 1 ? `${words} projets` : `${words} projet`;

  const intro = (
    <div className={styles.intro}>
      <div className={styles.titles}>
        <h1 className="h1">Lucas Da Silveira</h1>
        <p className={styles.role}>Étudiant en informatique</p>
      </div>
      <p className="lead">
        Moi c&apos;est Lucas, étudiant en informatique passionné de développement. Un tour de Magny-Cours,{' '}
        <span className={styles.hoverOnly}>
          {corners}, {items} : {n > 1 ? 'survolez-en un' : 'survolez-le'} pour monter à bord.
        </span>
        <span className={styles.touchOnly}>{corners} : mes projets.</span>
      </p>
    </div>
  );

  return (
    <>
      <SiteNav current="accueil" />
      <main id="contenu">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        <div className="container">
          <HomeCircuit
            projects={projects}
            intro={intro}
            cards={projects.map((project) => (
              <ProjectCard key={project.slug} project={project} size="large" />
            ))}
          />
        </div>
        <FinishBanner />
      </main>
      <SiteFooter />
    </>
  );
}
