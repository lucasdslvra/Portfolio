export const SITE_URL = 'https://ldasilveira.fr';
export const SITE_NAME = 'Lucas Da Silveira';
export const EMAIL = 'lucasdslvra@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/lucasdslvra/';
export const GITHUB_URL = 'https://github.com/lucasdslvra';
export const YEAR = 2026;

// Image d'aperçu par défaut (app/opengraph-image.png, servie à cette URL par Next.js).
export const OG_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'Lucas Da Silveira, étudiant en informatique passionné de développement. Portfolio sur ldasilveira.fr.',
};

// Version carrée (public/og-square.png) : Google s'en sert pour la vignette à droite
// du résultat de recherche, au lieu de recadrer l'image 1200 × 630.
export const SQUARE_IMAGE = {
  url: '/og-square.png',
  width: 1200,
  height: 1200,
};

const imageObject = (img: { url: string; width: number; height: number }) => ({
  '@type': 'ImageObject',
  url: `${SITE_URL}${img.url}`,
  contentUrl: `${SITE_URL}${img.url}`,
  width: img.width,
  height: img.height,
});

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: SITE_NAME,
      alternateName: ['Lucas da Silveira', 'lucasdslvra', 'ldasilveira'],
      url: SITE_URL,
      image: [imageObject(SQUARE_IMAGE), imageObject(OG_IMAGE)],
      jobTitle: 'Étudiant en informatique',
      description:
        'Étudiant en informatique et développeur web. Projets en Next.js, React, TypeScript et Symfony.',
      knowsAbout: ['Développement web', 'Next.js', 'React', 'TypeScript', 'Symfony', 'PHP'],
      knowsLanguage: ['fr', 'en'],
      email: `mailto:${EMAIL}`,
      sameAs: [LINKEDIN_URL, GITHUB_URL],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: 'Portfolio de Lucas Da Silveira',
      inLanguage: 'fr-FR',
      publisher: { '@id': `${SITE_URL}/#person` },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      name: 'Lucas Da Silveira - Portfolio',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@id': `${SITE_URL}/#person` },
      about: { '@id': `${SITE_URL}/#person` },
      primaryImageOfPage: imageObject(SQUARE_IMAGE),
      inLanguage: 'fr-FR',
    },
  ],
};
