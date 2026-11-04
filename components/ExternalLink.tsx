import type { ReactNode } from 'react';

type Props = { href: string; children: ReactNode; className?: string };

/** Lien externe : « ↗ », nouvel onglet annoncé, rel="noopener". */
export function ExternalLink({ href, children, className }: Props) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener">
      {children} <span aria-hidden="true">↗</span>
      <span className="visually-hidden"> (nouvel onglet)</span>
    </a>
  );
}
