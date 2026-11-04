import type { ReactNode } from 'react';
import { CornerBadge } from '../CornerBadge';
import styles from './Mdx.module.css';

/** Liste d'étapes numérotées (pastilles de 26 px). Usage MDX : <Steps items={['…', '…']} /> */
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className={styles.steps}>
      {items.map((item, i) => (
        <li key={i}>
          <CornerBadge n={i + 1} state="step" />
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}
