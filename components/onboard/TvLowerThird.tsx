import { CheckeredFlag } from '@/components/CheckeredFlag';
import { formatMonthYear, numberToWords } from '@/lib/format';
import { TURN_COUNT } from '@/lib/lap';
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

type LapProps = {
  /** Projet du virage où se trouve la voiture, s'il y en a un. */
  project: ProjectSummary | null;
  projectCount: number;
};

/** E · Bandeau du hot lap : titre du tour à la place du projet ; le projet du virage en étiquette. */
export function TvLapLowerThird({ project, projectCount }: LapProps) {
  const projects = projectCount > 1 ? `${numberToWords(projectCount)} d'entre eux` : "l'un d'eux";
  return (
    <div className={styles.lowerThird}>
      <div className={styles.lowerTop}>
        <span className={`${styles.lowerNumber} ${styles.lowerFlag}`}>
          <CheckeredFlag size="large" />
        </span>
        <span className={styles.lowerName}>
          <span className={styles.lowerTitle}>Hot lap</span>
          <span className={styles.lowerMeta}>Tour complet · Nevers Magny-Cours · 4,4 km</span>
        </span>
      </div>
      <div className={styles.lowerShort}>
        Un tour complet du circuit dans Assetto Corsa : {TURN_COUNT} virages, de la ligne à la ligne. Mes projets sont dans{' '}
        {projects}.
      </div>
      <TvTags status="Tour complet" stack={project ? [`Projet · ${project.title}`] : ['Assetto Corsa']} />
    </div>
  );
}
