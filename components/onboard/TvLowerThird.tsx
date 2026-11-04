import { formatMonthYear } from '@/lib/format';
import type { ProjectSummary } from '@/lib/types';
import styles from './Onboard.module.css';
import { TvTags } from './TvTags';

/** E · Bandeau projet (numéro, nom, type · date, résumé) suivi de F · étiquettes. */
export function TvLowerThird({ project }: { project: ProjectSummary }) {
  return (
    <div className={styles.lowerThird}>
      <div className={styles.lowerTop}>
        <span className={styles.lowerNumber}>{project.corner.turn}</span>
        <span className={styles.lowerName}>
          <span className={styles.lowerTitle}>{project.title}</span>
          <span className={styles.lowerMeta}>
            {project.categoryLabel} · {formatMonthYear(project.date)}
          </span>
        </span>
      </div>
      <div className={styles.lowerShort}>{project.short}</div>
      <TvTags status={project.status} stack={project.stack} />
    </div>
  );
}
