import Link from 'next/link';
import styles from './Breadcrumb.module.css';

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, i) => (
          <li key={item.label}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
