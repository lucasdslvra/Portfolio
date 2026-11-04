import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Common = { variant?: 'primary' | 'secondary'; block?: boolean; className?: string; children: ReactNode };
type AsLink = Common & { href: string; external?: boolean };
type AsButton = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', block = false, className, children } = props;
  const cls = [styles.button, styles[variant], block && styles.block, className].filter(Boolean).join(' ');

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a href={props.href} className={cls} rel="noopener" target="_blank">
          {children} <span aria-hidden="true">↗</span>
          <span className="visually-hidden"> (nouvel onglet)</span>
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const { variant: _v, block: _b, className: _c, children: _ch, href: _h, type = 'button', ...rest } = props;
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
