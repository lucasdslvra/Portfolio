import Link from 'next/link';
import { turnLabel } from '@/lib/circuit';
import { formatMonthYear } from '@/lib/format';
import type { ProjectSummary } from '@/lib/types';
import { Button } from './Button';
import { CornerBadge } from './CornerBadge';
import { CornerCover } from './CornerCover';
import { ExternalLink } from './ExternalLink';
import { MetaList } from './MetaList';
import styles from './ProjectCard.module.css';
import { primaryExternal } from './ProjectLinks';
import { titleTransition } from './transitions';

type Props = { project: ProjectSummary; headingLevel?: 2 | 3; size?: 'large' | 'medium' };

export function ProjectCard({ project, headingLevel = 2, size = 'medium' }: Props) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const external = primaryExternal(project);
  return (
    <article className={`${styles.card} ${styles[size]}`}>
      <div className={styles.media}>
        <Link href={project.href} tabIndex={-1} aria-hidden="true" className={styles.coverLink}>
          <CornerCover corner={project.corner} />
        </Link>
      </div>
      <div className={styles.body}>
        <p className={styles.surtitle}>
          <CornerBadge n={project.corner.turn} state="active" size={32} />
          <span>
            {turnLabel(project.corner.turn)} · {project.corner.name} · {formatMonthYear(project.date)}
          </span>
        </p>
        <Heading className={`${styles.title} vt-title`} style={titleTransition(project.slug)}>
          <Link href={project.href}>{project.title}</Link>
        </Heading>
        <p className={styles.description}>{project.description}</p>
        <MetaList
          items={[
            { label: 'Type', value: project.categoryLabel },
            { label: 'Stack', value: project.stack.join(', ') },
            { label: 'Statut', value: project.status },
          ]}
        />
        <div className={styles.actions}>
          <Button href={project.href} className={styles.read}>
            Lire le projet<span className="visually-hidden"> {project.title}</span>
          </Button>
          {external && <ExternalLink href={external.href}>{external.label}</ExternalLink>}
        </div>
      </div>
    </article>
  );
}
