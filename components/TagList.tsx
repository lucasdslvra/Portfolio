import styles from './TagList.module.css';

export function TagList({ tags, label }: { tags: string[]; label?: string }) {
  return (
    <ul className={styles.list} aria-label={label}>
      {tags.map((tag) => (
        <li key={tag} className={styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
