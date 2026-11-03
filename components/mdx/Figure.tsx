import type { ImgHTMLAttributes } from 'react';
import { ImageFrame } from '../ImageFrame';
import styles from './Mdx.module.css';
import { ZoomImage } from './ZoomImage';

type Props = ImgHTMLAttributes<HTMLImageElement> & { caption?: string };

const SIZES = '(max-width: 760px) 100vw, 700px';

function toNumber(value: string | number | undefined): number | undefined {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  return n && Number.isFinite(n) ? n : undefined;
}

/**
 * Image d'article avec légende, agrandissable au clic. Les images Markdown arrivent ici
 * avec leurs dimensions (lues au build) ; le texte alternatif sert aussi de légende.
 */
export function Figure({ src, alt = '', caption, width, height }: Props) {
  if (typeof src !== 'string') return null;
  const w = toNumber(width);
  const h = toNumber(height);
  const legend = caption ?? (alt || undefined);

  // Sans dimensions connues : image simple, non agrandissable.
  if (!w || !h) return <ImageFrame src={src} alt={alt} caption={legend} sizes={SIZES} />;

  return (
    <figure className={styles.figure}>
      <ZoomImage src={src} alt={alt} width={w} height={h} caption={legend} sizes={SIZES} />
      {legend && <figcaption className={styles.figcaption}>{legend}</figcaption>}
    </figure>
  );
}
