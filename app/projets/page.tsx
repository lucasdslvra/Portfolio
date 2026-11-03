import type { Metadata } from 'next';
import { CategoryFilter } from '@/components/CategoryFilter';
import { EmptyState } from '@/components/EmptyState';
import { FinishBanner } from '@/components/FinishBanner';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import { TrackMap } from '@/components/TrackMap';
import { plural } from '@/lib/format';
import { toMapCorner } from '@/lib/map';
import { CATEGORIES, countByCategory, filterProjects, getProjects, isCategory } from '@/lib/projects';
import type { Category } from '@/lib/types';
import styles from './page.module.css';

type Props = { searchParams: { cat?: string | string[] } };

function readCategory(searchParams: Props['searchParams']): Category | null {
  const value = Array.isArray(searchParams.cat) ? searchParams.cat[0] : searchParams.cat;
  return isCategory(value) ? value : null;
}

const LEAD =
  'Mes projets universitaires, personnels et en entreprise. Chaque projet occupe un virage du circuit de Nevers Magny-Cours, du plus récent au plus ancien.';

export function generateMetadata({ searchParams }: Props): Metadata {
  const category = readCategory(searchParams);
  const label = CATEGORIES.find((c) => c.key === category)?.label;
  const path = category ? `/projets?cat=${category}` : '/projets';
  const title = label ? `Projets · ${label}` : 'Projets';
  return {
    title,
    description: LEAD,
    alternates: { canonical: path },
    openGraph: { title: `${title} — Lucas Da Silveira`, description: LEAD, url: path, images: ['/og.png'] },
  };
}

export default function ProjectsPage({ searchParams }: Props) {
  const category = readCategory(searchParams);
  const projects = getProjects();
  const visible = filterProjects(projects, category);

  return (
    <>
      <SiteNav current="projets" />
      <main id="contenu">
        <header className={`container ${styles.header}`}>
          <div className={styles.intro}>
            <h1 className="h1">Projets</h1>
            <p className={`lead ${styles.lead}`}>{LEAD}</p>
            <CategoryFilter active={category} counts={countByCategory(projects)} options={CATEGORIES} />
          </div>
          <div className={`${styles.map} vt-circuit`}>
            <TrackMap variant="filtered" corners={projects.map(toMapCorner)} visibleIds={visible.map((p) => p.corner.id)} />
          </div>
        </header>

        <section className={`container ${styles.list}`} aria-label="Liste des projets">
          <p className="visually-hidden" role="status">
            {plural(visible.length, 'projet affiché', 'projets affichés')}
          </p>
          {visible.map((project) => (
            <div key={project.slug} className={styles.item}>
              <ProjectCard project={project} />
            </div>
          ))}
          {visible.length === 0 && <EmptyState />}
        </section>

        <FinishBanner variant="projects" />
      </main>
      <SiteFooter />
    </>
  );
}
