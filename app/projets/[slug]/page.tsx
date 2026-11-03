import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdjacentProjects } from '@/components/AdjacentProjects';
import { ArticleHeader } from '@/components/ArticleHeader';
import { Mdx } from '@/components/mdx/Mdx';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import { TableOfContents } from '@/components/TableOfContents';
import { TagList } from '@/components/TagList';
import { getAdjacent, getProject, getProjects, toSummary } from '@/lib/projects';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import styles from './page.module.css';

type Props = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams(): Props['params'][] {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  const url = `/projets/${project.slug}`;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.title} — ${SITE_NAME}`,
      description: project.description,
      type: 'article',
      publishedTime: project.date,
      url,
      images: [{ url: project.cover, alt: `Capture d'écran de ${project.title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — ${SITE_NAME}`,
      description: project.description,
      images: [project.cover],
    },
  };
}

export default function ProjectPage({ params }: Props) {
  const project = getProject(params.slug);
  if (!project) notFound();
  const summary = toSummary(project);
  const adjacent = getAdjacent(project.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.title,
    description: project.description,
    url: `${SITE_URL}/projets/${project.slug}`,
    datePublished: project.date.slice(0, 10),
    inLanguage: 'fr-FR',
    image: `${SITE_URL}${project.cover}`,
    keywords: project.stack.join(', '),
    genre: project.categoryLabel,
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: SITE_NAME, url: SITE_URL },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    ...(project.links.code ? { codeRepository: project.links.code } : {}),
  };

  return (
    <>
      <SiteNav current="projets" />
      <main id="contenu">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ArticleHeader project={summary} />
        <div className={`container ${styles.body}`}>
          <aside className={styles.aside} aria-label="Sommaire et stack">
            <div className={styles.sticky}>
              <TableOfContents toc={project.toc} variant="desktop" />
              <div className={styles.stack}>
                <h2 className={styles.stackTitle}>Stack</h2>
                <TagList tags={project.stack} />
              </div>
            </div>
          </aside>
          <div className={styles.mobileToc}>
            <TableOfContents toc={project.toc} variant="mobile" />
          </div>
          <article className={styles.article}>
            <Mdx code={project.code} />
            <div className={`${styles.stack} ${styles.mobileStack}`}>
              <h2 className={styles.stackTitle}>Stack</h2>
              <TagList tags={project.stack} />
            </div>
            <AdjacentProjects {...adjacent} />
          </article>
        </div>
      </main>
      <SiteFooter variant="email" />
    </>
  );
}
