'use client';

import { useEffect } from 'react';

/**
 * Favicon animé : un point rouge fait le tour du circuit de Magny-Cours,
 * suivi d'une traînée qui s'estompe, comme un écran radar.
 *
 * - Dessine dans un canvas 64 × 64 et remplace le href du <link rel="icon">.
 * - Le favicon statique (app/favicon.ico, app/icon.svg) reste le repli :
 *   avant l'hydratation, sur Safari (qui ignore les favicons dynamiques)
 *   et avec « réduire les animations ».
 * - S'arrête quand l'onglet est caché et reprend quand il revient.
 * - À monter une seule fois, dans app/layout.tsx : <AnimatedFavicon />
 */

// Contour extérieur du tracé (viewBox du site 0 0 680 480), lisible en 16–32 px.
const OUTLINE: ReadonlyArray<readonly [number, number]> = [
  [277, 111], [397, 148], [412, 147], [423, 145], [453, 125], [491, 99], [496, 92], [506, 74],
  [520, 59], [533, 52], [539, 49], [555, 46], [570, 46], [583, 50], [593, 54], [606, 63],
  [616, 74], [623, 86], [628, 101], [628, 114], [626, 125], [620, 141], [594, 185], [577, 208],
  [563, 225], [551, 236], [424, 334], [410, 343], [382, 359], [358, 370], [152, 439], [145, 440],
  [141, 435], [141, 430], [144, 425], [189, 383], [114, 369], [75, 417], [70, 417], [60, 410],
  [55, 398], [52, 386], [53, 365], [55, 344], [63, 318], [87, 225], [91, 204], [93, 173],
  [89, 147], [61, 50], [62, 45], [67, 42], [89, 40], [122, 44], [130, 48], [130, 54],
  [129, 60], [131, 65], [149, 71],
];

const SIZE = 64; // px du canvas (le navigateur réduit en 16/32)
const VIEW = { x: 6, y: -94, side: 668 }; // cadrage carré autour du tracé
const LAP_MS = 3200; // durée d'un tour
const FPS = 15; // assez fluide pour un onglet, léger pour le CPU
const SAMPLES = 160; // points échantillonnés le long du tour
const TRAIL = 0.28; // longueur de la traînée, en fraction du tour

const INK = '#141414';
const RED = '#C4161C';

function samplePath(): Array<[number, number]> {
  const pts = [...OUTLINE, OUTLINE[0]];
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    total += d;
  }
  const out: Array<[number, number]> = [];
  let i = 0;
  let acc = 0;
  for (let k = 0; k < SAMPLES; k++) {
    const target = (k / SAMPLES) * total;
    while (i < seg.length - 1 && acc + seg[i] < target) acc += seg[i++];
    const t = seg[i] === 0 ? 0 : (target - acc) / seg[i];
    out.push([
      pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
      pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
    ]);
  }
  return out;
}

export default function AnimatedFavicon() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lien dédié, ajouté en dernier : il prime sur les icônes statiques.
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.setAttribute('data-animated', '');
    document.head.appendChild(link);

    const samples = samplePath();
    const scale = SIZE / VIEW.side;
    const toPx = ([x, y]: [number, number]): [number, number] => [
      (x - VIEW.x) * scale,
      (y - VIEW.y) * scale,
    ];
    const px = samples.map(toPx);
    const trailLen = Math.round(SAMPLES * TRAIL);

    // Fond et tracé dessinés une fois, puis réutilisés à chaque image.
    const base = document.createElement('canvas');
    base.width = SIZE;
    base.height = SIZE;
    const b = base.getContext('2d');
    if (!b) return;
    b.fillStyle = '#FFFFFF';
    b.fillRect(0, 0, SIZE, SIZE);
    b.strokeStyle = INK;
    b.lineWidth = 5;
    b.lineJoin = 'round';
    b.lineCap = 'round';
    b.beginPath();
    OUTLINE.map(([x, y]) => toPx([x, y])).forEach(([x, y], i) => (i ? b.lineTo(x, y) : b.moveTo(x, y)));
    b.closePath();
    b.stroke();

    let timer: number | undefined;
    const start = performance.now();

    const draw = () => {
      const head = Math.floor((((performance.now() - start) % LAP_MS) / LAP_MS) * SAMPLES);
      ctx.drawImage(base, 0, 0);

      // Traînée : segments de plus en plus opaques jusqu'au point.
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.strokeStyle = RED;
      for (let k = trailLen; k > 0; k--) {
        const a = px[(head - k + SAMPLES) % SAMPLES];
        const c = px[(head - k + 1 + SAMPLES) % SAMPLES];
        ctx.globalAlpha = 1 - k / trailLen;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Le point, cerclé de blanc pour rester lisible sur le tracé.
      const [x, y] = px[head];
      ctx.beginPath();
      ctx.arc(x, y, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = RED;
      ctx.fill();

      link.href = canvas.toDataURL('image/png');
    };

    const play = () => {
      if (timer === undefined) timer = window.setInterval(draw, 1000 / FPS);
    };
    const pause = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => (document.hidden ? pause() : play());

    draw();
    play();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      pause();
      document.removeEventListener('visibilitychange', onVisibility);
      link.remove();
    };
  }, []);

  return null;
}
