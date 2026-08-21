import { useState, useEffect, useRef } from 'react';
import nspell from 'nspell';

type Spell = ReturnType<typeof nspell>;

let spell: Spell | null = null;
let loading = false;
const queue: Array<() => void> = [];

function getSpell(): Promise<Spell> {
  return new Promise((resolve) => {
    if (spell) return resolve(spell);
    queue.push(() => resolve(spell!));
    if (loading) return;
    loading = true;
    Promise.all([
      fetch('/en.aff').then((r) => r.text()),
      fetch('/en.dic').then((r) => r.text()),
    ]).then(([aff, dic]) => {
      spell = nspell(aff, dic);
      queue.forEach((fn) => fn());
      queue.length = 0;
    });
  });
}

export function useSpellErrors(content: string): Set<number> {
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      getSpell().then((checker) => {
        const lines = content.split('\n');
        const found = new Set<number>();
        lines.forEach((line, idx) => {
          const words = line.match(/[a-zA-Z']+/g) ?? [];
          for (const word of words) {
            const clean = word.replace(/^'+|'+$/g, '');
            if (clean.length < 3) continue;
            if (!checker.correct(clean)) {
              found.add(idx);
              break;
            }
          }
        });
        setErrorLines(found);
      });
    }, 600);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [content]);

  return errorLines;
}
