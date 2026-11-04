import { EMAIL, SITE_NAME, YEAR } from '@/lib/site';
import styles from './SiteFooter.module.css';

export function SiteFooter({ variant = 'made' }: { variant?: 'made' | 'email' }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>
          © {YEAR} {SITE_NAME}
        </span>
      </div>
    </footer>
  );
}
