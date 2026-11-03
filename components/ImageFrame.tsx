import Image from 'next/image';
import styles from './ImageFrame.module.css';

type Props = {
  src: string;
  alt: string;
  caption?: string;
  /** Cadre à ratio fixe (capture recadrée) ; sinon l'image garde ses proportions. */
  ratio?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function ImageFrame({ src, alt, caption, ratio, width, height, sizes = '(max-width: 960px) 100vw, 700px', priority, className }: Props) {
  const image =
    ratio || !width || !height ? (
      <div className={styles.frame} style={{ aspectRatio: ratio ?? '16 / 10' }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={styles.cover} />
      </div>
    ) : (
      <div className={styles.frame}>
        <Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} className={styles.natural} />
      </div>
    );

  if (!caption) return <div className={className}>{image}</div>;
  return (
    <figure className={[styles.figure, className].filter(Boolean).join(' ')}>
      {image}
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
