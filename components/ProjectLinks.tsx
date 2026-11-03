import type { ProjectSummary } from '@/lib/types';

/** Lien externe principal d'un projet : démo / site si disponible, sinon le code. */
export function primaryExternal(project: ProjectSummary): { href: string; label: string } | null {
  const { demo, code } = project.links;
  if (demo) return { href: demo, label: project.status === 'Site en ligne' ? 'Voir le site' : 'Voir la démo' };
  if (code) return { href: code, label: 'Code source' };
  return null;
}
