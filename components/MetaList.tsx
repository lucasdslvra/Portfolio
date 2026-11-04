import styles from './MetaList.module.css';

type Props = { items: { label: string; value: string }[]; compact?: boolean };

export function MetaList({ items, compact = false }: Props) {
  return (
    <dl className={`${styles.list} ${compact ? styles.compact : ''}`}>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
