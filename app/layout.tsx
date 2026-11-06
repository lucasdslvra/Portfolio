import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Barlow_Condensed, Hanken_Grotesk } from 'next/font/google';
import { Suspense, type ReactNode } from 'react';
import { Analytics } from '@/components/Analytics';
import AnimatedFavicon from '@/components/AnimatedFavicon';
import { PageTransitions } from '@/components/PageTransitions';
import { START_LIGHTS_SCRIPT, StartLights } from '@/components/StartLights';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
});

// Habillage TV uniquement : pas de préchargement, la police n'est utile qu'au survol.
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
  preload: false,
});

const description =
  "Moi c'est Lucas Da Silveira, étudiant en informatique passionné de développement. Un tour du circuit de Magny-Cours, un projet par virage.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Lucas Da Silveira - Portfolio | Étudiant en informatique',
    template: '%s - Lucas Da Silveira',
  },
  description,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    'Lucas Da Silveira',
    'Lucas Da Silveira portfolio',
    'Lucas Da Silveira développeur',
    'ldasilveira',
    'lucasdslvra',
    'développeur web',
    'étudiant en informatique',
    'Next.js',
    'React',
    'TypeScript',
    'Symfony',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Lucas Da Silveira - Portfolio',
    description,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucas Da Silveira - Portfolio',
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  themeColor: '#FFFFFF',
  colorScheme: 'light',
  verification: {
    // Code fourni par Google Search Console (balise HTML).
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning : le script des feux de départ ajoute data-intro et --intro-hold avant l'hydratation.
    <html lang="fr" className={`${hanken.variable} ${barlow.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: START_LIGHTS_SCRIPT }} />
        <Analytics />
      </head>
      <body>
        <StartLights />
        {children}
        <Suspense fallback={null}>
          <PageTransitions />
        </Suspense>
        <SpeedInsights />
        <AnimatedFavicon />
      </body>
    </html>
  );
}
