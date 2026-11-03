import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = { href: string; children: ReactNode; className?: string };

/** Lien interne souligné, rouge au survol. */
export function TextLink({ href, children, className }: Props) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
