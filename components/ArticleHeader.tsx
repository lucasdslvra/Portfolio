import { turnLabel } from '@/lib/circuit';
import { formatDate } from '@/lib/format';
import { toMapCorner } from '@/lib/map';
import type { ProjectSummary } from '@/lib/types';
import styles from './ArticleHeader.module.css';
import { Breadcrumb } from './Breadcrumb';
import { Button } from './Button';
import { ExternalLink } from './ExternalLink';
import { MetaList } from './MetaList';
import { primaryExternal } from './ProjectLinks';
import { TrackMap } from './TrackMap';
import { titleTransition } from './transitions';

export function ArticleHeader({ project }: { project: ProjectSummary }) {
  const external = primaryExternal(project);
  const codeLink = project.links.demo && project.links.code ? project.links.code : null;
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.main}>
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Projets', href: '/projets' }, { label: project.title }]} />
          <p className="surtitle">
            {turnLabel(project.corner.turn)} · {project.corner.name} · <time dateTime={project.date.slice(0, 10)}>{formatDate(project.date)}</time>
          </p>
          <h1 className={`${styles.title} vt-title`} style={titleTransition(project.slug)}>
            {project.title}
          </h1>
          <p className={`lead ${styles.lead}`}>{project.description}</p>
          {(external || codeLink) && (
            <div className={styles.actions}>
              {external && (
                <Button href={external.href} external className={styles.primary}>
                  {external.label}
                </Button>
              )}
              {codeLink && <ExternalLink href={codeLink} className={styles.secondary}>Code source sur GitHub</ExternalLink>}
            </div>
          )}
        </div>
        <div className={styles.side}>
          <div className={`${styles.map} vt-circuit`}>
            <TrackMap variant="mini" corner={toMapCorner(project)} />
          </div>
          <div className={styles.meta}>
            <MetaList
              compact
              items={[
                { label: 'Type', value: project.categoryLabel },
                { label: 'Statut', value: project.status },
              ]}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
