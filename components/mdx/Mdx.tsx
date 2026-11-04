import type { MDXComponents } from 'mdx/types';
import { getMDXComponent } from 'next-contentlayer/hooks';
import type { ComponentPropsWithoutRef } from 'react';
import { Figure } from './Figure';
import styles from './Mdx.module.css';
import { Steps } from './Steps';

/** Section d'article : produite par le plugin rehypeSections pour chaque `##`. */
function ArticleSection(props: ComponentPropsWithoutRef<'section'>) {
  return <section {...props} className={styles.section} />;
}

function Heading2({ children, ...props }: ComponentPropsWithoutRef<'h2'> & { 'data-n'?: string }) {
  const n = props['data-n'];
  return (
    <h2 id={props.id} className={styles.h2}>
      {n && <span className={styles.n}>{n}</span>}
      {children}
    </h2>
  );
}

function Anchor({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a {...props} href={href} target="_blank" rel="noopener">
        {children} <span aria-hidden="true">↗</span>
        <span className="visually-hidden"> (nouvel onglet)</span>
      </a>
    );
  }
  return (
    <a {...props} href={href}>
      {children}
    </a>
  );
}

function Table(props: ComponentPropsWithoutRef<'table'>) {
  return (
    // Région défilante focusable : les tableaux larges restent lisibles au clavier sur mobile.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={styles.table} tabIndex={0} role="region" aria-label="Tableau">
      <table {...props} />
    </div>
  );
}

const components: MDXComponents = {
  section: ArticleSection,
  h2: Heading2,
  h3: (props) => <h3 {...props} className={styles.h3} />,
  h4: (props) => <h4 {...props} className={styles.h4} />,
  p: (props) => <p {...props} className={styles.p} />,
  ul: (props) => <ul {...props} className={styles.ul} />,
  ol: (props) => <ol {...props} className={styles.ol} />,
  blockquote: (props) => <blockquote {...props} className={styles.blockquote} />,
  // Bloc de code défilant : focusable pour être lisible au clavier.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  pre: (props) => <pre {...props} className={styles.pre} tabIndex={0} />,
  a: Anchor,
  img: Figure,
  table: Table,
  Steps,
  Figure,
};

export function Mdx({ code }: { code: string }) {
  const Content = getMDXComponent(code);
  return (
    <div className={styles.mdx}>
      <Content components={components} />
    </div>
  );
}
