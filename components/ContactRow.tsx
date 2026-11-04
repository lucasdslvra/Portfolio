import { Button } from './Button';
import styles from './ContactRow.module.css';
import { CopyButton } from './CopyButton';

export function ContactRow({ email }: { email: string }) {
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span className={styles.label}>E-mail</span>
        <a href={`mailto:${email}`} className={styles.email}>
          {email}
        </a>
      </div>
      <div className={styles.actions}>
        <CopyButton value={email} />
        <Button href={`mailto:${email}`}>Écrire</Button>
      </div>
    </div>
  );
}

export function ContactLinkRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a href={href} className={`${styles.row} ${styles.link}`} target="_blank" rel="noopener">
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </span>
      <span className={styles.arrow} aria-hidden="true">
        ↗
      </span>
      <span className="visually-hidden"> (nouvel onglet)</span>
    </a>
  );
}
