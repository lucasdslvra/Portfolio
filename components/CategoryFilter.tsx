import Link from 'next/link';
import type { Category } from '@/lib/types';
import styles from './CategoryFilter.module.css';

type Props = {
  active: Category | null;
  counts: Record<Category | 'all', number>;
  options: { key: Category; label: string }[];
  basePath?: string;
};

/** Filtres en liens (?cat=…) : rendus côté serveur, partageables et indexables. */
export function CategoryFilter({ active, counts, options, basePath = '/projets' }: Props) {
  const items = [{ key: null, label: 'Tous' }, ...options] as { key: Category | null; label: string }[];
  return (
    <div role="group" aria-label="Filtrer par catégorie" className={styles.group}>
      {items.map((item) => {
        const pressed = item.key === active;
        const count = counts[item.key ?? 'all'];
        return (
          <Link
            key={item.label}
            href={item.key ? `${basePath}?cat=${item.key}` : basePath}
            scroll={false}
            role="button"
            aria-pressed={pressed}
            className={`${styles.filter} ${pressed ? styles.pressed : ''}`}
          >
            {item.label} <span className={styles.count}>{count}</span>
            <span className="visually-hidden">{count > 1 ? ' projets' : ' projet'}</span>
          </Link>
        );
      })}
    </div>
  );
}
