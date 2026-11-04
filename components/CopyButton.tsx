'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Button.module.css';

type Props = { value: string; label?: string; doneLabel?: string };

function legacyCopy(value: string): boolean {
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  field.remove();
  return ok;
}

export function CopyButton({ value, label = "Copier l'adresse", doneLabel = 'Adresse copiée ✓' }: Props) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else {
        ok = legacyCopy(value);
      }
    } catch {
      ok = legacyCopy(value);
    }
    setState(ok ? 'done' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 3000);
  }

  const text = state === 'done' ? doneLabel : state === 'failed' ? `Copie impossible : ${value}` : label;

  return (
    <>
      <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={copy}>
        {text}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {state === 'done' ? 'Adresse e-mail copiée dans le presse-papiers.' : state === 'failed' ? `Copie impossible. L'adresse est ${value}.` : ''}
      </span>
    </>
  );
}
