/**
 * Les feux de départ servent d'écran de chargement : un composant peut demander
 * de les garder allumés jusqu'à ce qu'une ressource soit prête (vidéos de l'accueil…).
 * Les feux s'éteignent quand toutes les attentes sont terminées, ou au plus tard
 * après le délai maximal fixé dans StartLights.
 */
const waits: Promise<unknown>[] = [];

/** Garde les feux allumés jusqu'à la fin de `task` (succès ou échec). */
export function holdIntro(task: Promise<unknown>): void {
  waits.push(task);
}

/** Se résout quand toutes les attentes enregistrées jusqu'ici sont terminées. */
export function introReady(): Promise<unknown> {
  return Promise.allSettled(waits);
}

/**
 * Faut-il précharger les médias lourds ? Non si l'utilisateur a activé
 * l'économie de données ou si la connexion est très lente.
 */
export function canPreloadMedia(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (connection?.saveData) return false;
  return !connection?.effectiveType || !/(^|-)2g$/.test(connection.effectiveType);
}
