import styles from './Onboard.module.css';

/** F · Statut sur fond rouge puis au plus 4 technos. */
export function TvTags({ status, stack }: { status: string; stack: string[] }) {
  return (
    <div className={styles.tags}>
      <span className={styles.tagStatus}>{status}</span>
      {stack.slice(0, 4).map((tech) => (
        <span key={tech} className={styles.tag}>
          {tech}
        </span>
      ))}
    </div>
  );
}
