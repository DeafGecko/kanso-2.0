import { useState, useEffect, useRef, useCallback } from 'react';
import nspell from 'nspell';
import { franc } from 'franc';

type Spell = ReturnType<typeof nspell>;

interface DictCache {
  en: Spell | null;
  fr: Spell | null;
  es: Spell | null;
}

const dicts: DictCache = { en: null, fr: null, es: null };
const loading: Record<string, boolean> = {};
const queues: Record<string, Array<() => void>> = { en: [], fr: [], es: [] };

function getDict(lang: 'en' | 'fr' | 'es'): Promise<Spell> {
  return new Promise((resolve) => {
    if (dicts[lang]) return resolve(dicts[lang]!);
    queues[lang].push(() => resolve(dicts[lang]!));
    if (loading[lang]) return;
    loading[lang] = true;
    const prefix = lang === 'en' ? '/en' : lang === 'fr' ? '/fr' : '/es';
    Promise.all([
      fetch(`${prefix}.aff`).then((r) => r.text()),
      fetch(`${prefix}.dic`).then((r) => r.text()),
    ]).then(([aff, dic]) => {
      dicts[lang] = nspell(aff, dic);
      queues[lang].forEach((fn) => fn());
      queues[lang] = [];
    });
  });
}

// Preload all three on module init
getDict('en');
getDict('fr');
getDict('es');

function detectLang(text: string): 'en' | 'fr' | 'es' {
  const result = franc(text, { only: ['eng', 'fra', 'spa'] });
  if (result === 'fra') return 'fr';
  if (result === 'spa') return 'es';
  return 'en';
}

interface Token {
  text: string;
  index: number;
  misspelled: boolean;
}

interface Underline {
  top: number;
  left: number;
  width: number;
  token: Token;
}

interface PopupState {
  word: string;
  suggestions: string[];
  x: number;
  y: number;
}

interface SpellCheckerProps {
  content: string;
  scrollRef: React.RefObject<HTMLTextAreaElement | null>;
  fontFamily: string;
  fontSize: number;
  onReplaceAll: (oldWord: string, newWord: string) => void;
}

export function SpellChecker({ content, scrollRef, fontFamily, fontSize, onReplaceAll }: SpellCheckerProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [underlines, setUnderlines] = useState<Underline[]>([]);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const result: Token[] = [];
      // Split into paragraphs, detect language per paragraph
      const paragraphs = content.split(/\n+/);
      let globalIndex = 0;

      for (const para of paragraphs) {
        if (para.trim().length > 0) {
          const lang = detectLang(para);
          const checker = await getDict(lang);
          const regex = /[a-zA-ZÀ-ÿ']+/g;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(para)) !== null) {
            const word = match[0];
            const clean = word.replace(/^'+|'+$/g, '');
            if (clean.length >= 3) {
              result.push({
                text: word,
                index: globalIndex + match.index,
                misspelled: !checker.correct(clean),
              });
            }
          }
        }
        globalIndex += para.length + 1; // +1 for the newline
      }

      setTokens(result);
    }, 600);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [content]);

  useEffect(() => {
    const ta = scrollRef.current;
    if (!ta) return;
    const onScroll = () => setScrollTop(ta.scrollTop);
    ta.addEventListener('scroll', onScroll);
    return () => ta.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  useEffect(() => {
    const mirror = mirrorRef.current;
    if (!mirror) return;

    const misspelled = tokens.filter((t) => t.misspelled);
    if (misspelled.length === 0) { setUnderlines([]); return; }

    const lines: Underline[] = [];
    const mirrorRect = mirror.getBoundingClientRect();

    misspelled.forEach((token) => {
      const span = mirror.querySelector(`[data-idx="${token.index}"]`) as HTMLElement | null;
      if (!span) return;
      const rect = span.getBoundingClientRect();
      lines.push({
        top: rect.top - mirrorRect.top + mirror.scrollTop,
        left: rect.left - mirrorRect.left,
        width: rect.width,
        token,
      });
    });

    setUnderlines(lines);
  }, [tokens, content, scrollTop]);

  useEffect(() => {
    const handler = () => setPopup(null);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePick = useCallback((suggestion: string) => {
    if (!popup) return;
    onReplaceAll(popup.word, suggestion);
    setPopup(null);
  }, [popup, onReplaceAll]);

  const handleUnderlineClick = useCallback((e: React.MouseEvent, token: Token) => {
    e.stopPropagation();
    const lang = detectLang(content);
    getDict(lang).then((checker) => {
      const clean = token.text.replace(/^'+|'+$/g, '');
      const suggestions = checker.suggest(clean).slice(0, 6);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopup({ word: token.text, suggestions, x: rect.left, y: rect.bottom + 4 });
    });
  }, [content]);

  // Build mirror with spans only on misspelled words
  const misspelledTokens = tokens.filter((t) => t.misspelled);
  const mirrorSegments: React.ReactNode[] = [];
  let cursor = 0;
  misspelledTokens.forEach((token, i) => {
    if (token.index > cursor) {
      mirrorSegments.push(<span key={`g-${i}`}>{content.slice(cursor, token.index)}</span>);
    }
    mirrorSegments.push(
      <span key={`w-${i}`} data-idx={token.index}>{content.slice(token.index, token.index + token.text.length)}</span>
    );
    cursor = token.index + token.text.length;
  });
  if (cursor < content.length) {
    mirrorSegments.push(<span key="tail">{content.slice(cursor)}</span>);
  }

  return (
    <>
      {/* Off-screen mirror for measuring word positions */}
      <div
        ref={mirrorRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden',
          pointerEvents: 'none',
          fontSize,
          lineHeight: 1.7,
          letterSpacing: 0,
          wordSpacing: '0.08em',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily,
          overflow: 'hidden',
          width: scrollRef.current ? scrollRef.current.clientWidth : 'auto',
        }}
      >
        {mirrorSegments}
      </div>

      {/* Underlines only — no text */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {underlines.map((u, i) => (
          <div
            key={i}
            onMouseDown={(e) => handleUnderlineClick(e, u.token)}
            style={{
              position: 'absolute',
              top: u.top - scrollTop + fontSize * 1.7 - 2,
              left: u.left,
              width: u.width,
              height: 2,
              borderRadius: 1,
              background: 'rgba(239,68,68,0.75)',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {popup && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: 'fixed', top: popup.y, left: popup.x, zIndex: 9999 }}
          className="bg-zinc-900/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl p-1.5 flex flex-col min-w-36"
        >
          <span className="text-[10px] uppercase tracking-wider opacity-40 px-2 py-1">
            Replace all "{popup.word}"
          </span>
          {popup.suggestions.length === 0 && (
            <span className="text-xs opacity-40 px-2 py-1">No suggestions</span>
          )}
          {popup.suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => handlePick(s)}
              className="text-left text-sm px-2 py-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
