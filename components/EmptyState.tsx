import styles from './EmptyState.module.css';

export function EmptyState({ children = "Aucun projet dans cette catégorie pour l'instant." }: { children?: string }) {
  return <p className={styles.empty}>{children}</p>;
}
